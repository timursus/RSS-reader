import './styles.css';
import { string } from 'yup';
import { loadNewChannel, refresh } from './contentLoad';
import render from './view';

const elements = {
  rssForm: document.querySelector('.rss-form'),
  urlInput: document.querySelector('input[name="url"]'),
  submitBtn: document.querySelector('button[type="submit"]'),
  feedback: document.querySelector('.feedback'),
  feedsList: document.querySelector('.rss-items'),
  postsList: document.querySelector('.rss-links'),
};

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url('validationErrors.notValidURL')
    .notOneOf(addedURLs, 'validationErrors.alreadyAdded');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  const addedURLs = state.content.feeds.map(({ url }) => url);
  validateUrl(state.input.value, addedURLs)
    .then(() => {
      state.input.valid = true;
    })
    .catch((err) => {
      state.input.valid = false;
      const [errorKey] = err.errors;
      state.input.error = errorKey;
    });
};

const main = () => {
  const state = {
    content: {
      feeds: [],
      posts: [],
    },
    input: {
      value: '',
      valid: true,
      error: '',
    },
    rssLoading: '', // loading, success, networkError, parsingError
  };

  elements.urlInput.addEventListener('input', (e) => {
    state.input.value = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.rssLoading = 'loading';
    const url = state.input.value;
    loadNewChannel(url, state).then(() => {
      state.rssLoading = 'success';
    });
  });

  render(state, elements);
  refresh(state.content);
};

main();
