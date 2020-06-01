import './styles.css';
import { string } from 'yup';
import uniqueId from 'lodash/uniqueId';
import axios from 'axios';
import render from './view';

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url()
    .notOneOf(addedURLs, 'Rss has already been added');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  validateUrl(state.input.value, state.addedURLs)
    .then(() => {
      state.input.valid = true;
      state.feedback.text = '';
      state.feedback.error = false;
    })
    .catch((err) => {
      state.input.valid = false;
      const [error] = err.errors;
      state.feedback.text = error;
      state.feedback.error = true;
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
  state.activeFeeds.push({ ...feed, id });
  const postsWithIDs = posts.map((post) => ({ ...post, id }));
  state.posts = postsWithIDs.concat(state.posts);
};

const proxy = 'https://cors-anywhere.herokuapp.com/';

const generateRSS = (url, state) => {
  const fullURL = proxy.concat(url);
  return axios.get(fullURL, { timeout: 8000 })
    .then(({ data }) => parse(data))
    .then((rss) => writeToState(rss, state));
};

const main = () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('input[name="url"]'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedbackElem: document.querySelector('.feedback'),
    feedsList: document.querySelector('.rss-items'),
    postsList: document.querySelector('.rss-links'),
  };

  const state = {
    activeFeeds: [],
    posts: [],
    addedURLs: [],
    input: {
      value: '',
      valid: true,
      loading: false,
    },
    feedback: {
      text: '',
      error: false,
    },
  };

  elements.urlInput.addEventListener('input', (e) => {
    state.input.value = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.input.valid) {
      state.input.loading = true;
      const url = state.input.value;
      generateRSS(url, state)
        .then(() => {
          state.addedURLs.push(url);
          state.feedback.text = 'Rss has been loaded';
          state.feedback.error = false;
          elements.rssForm.reset();
        })
        .catch((err) => {
          state.feedback.text = err;
          state.feedback.error = true;
        })
        .finally(() => {
          state.input.loading = false;
        });
    }
  });

  render(state, elements);
};

main();
