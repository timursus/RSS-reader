import './styles.css';
import { string } from 'yup';
import uniqueId from 'lodash/uniqueId';
import axios from 'axios';
import render from './view';

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url('validationErrors.notValidURL')
    .notOneOf(addedURLs, 'validationErrors.alreadyAdded');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  validateUrl(state.input.value, state.addedURLs)
    .then(() => {
      state.input.valid = true;
    })
    .catch((err) => {
      state.input.valid = false;
      const [errorKey] = err.errors;
      state.input.error = errorKey;
    });
};

const parse = (data) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(data, 'text/xml');
  const feedTitle = doc.querySelector('channel>title').textContent;
  const feedDescription = doc.querySelector('channel>description').textContent;
  const feed = { feedTitle, feedDescription };
  const postsItems = doc.querySelectorAll('item');
  const posts = [...postsItems].map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    return {
      postTitle, postDescription, postLink,
    };
  });
  return [feed, posts];
};

const writeToState = (rss, state) => {
  const [feed, posts] = rss;
  const id = uniqueId();
  state.content.activeFeeds.push({ ...feed, id });
  const postsWithIDs = posts.map((post) => ({ ...post, id }));
  state.content.posts = postsWithIDs.concat(state.content.posts);
};

const proxy = 'https://cors-anywhere.herokuapp.com/';

const generateRSS = (url, state) => {
  const fullURL = proxy.concat(url);
  return axios.get(fullURL, { timeout: 7500 })
    .catch((err) => {
      state.rssLoading.state = 'networkError';
      state.rssLoading.error = 'loading.networkError';
      throw err;
    })
    .then(({ data }) => {
      try {
        const rss = parse(data);
        writeToState(rss, state);
      } catch (err) {
        state.rssLoading.state = 'parsingError';
        state.rssLoading.error = 'loading.parsingError';
        throw err;
      }
    });
};

const elements = {
  rssForm: document.querySelector('.rss-form'),
  urlInput: document.querySelector('input[name="url"]'),
  submitBtn: document.querySelector('button[type="submit"]'),
  feedback: document.querySelector('.feedback'),
  feedsList: document.querySelector('.rss-items'),
  postsList: document.querySelector('.rss-links'),
};

const main = () => {
  const state = {
    content: {
      activeFeeds: [],
      posts: [],
    },
    input: {
      value: '',
      valid: true,
      error: '',
    },
    rssLoading: {
      state: '', // loading, success, networkError, parsingError
      error: '',
    },
    addedURLs: [],
  };

  elements.urlInput.addEventListener('input', (e) => {
    state.input.value = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.input.valid) {
      state.rssLoading.state = 'loading';
      const url = state.input.value;
      generateRSS(url, state).then(() => {
        state.rssLoading.state = 'success';
        elements.rssForm.reset();
        state.addedURLs.push(url);
      });
    }
  });

  render(state, elements);
};

main();
