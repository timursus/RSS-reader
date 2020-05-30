import './styles.css';
import { string } from 'yup';
import render from './view';

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url()
    .notOneOf(addedURLs, 'Rss has already been added');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  validateUrl(state.input.value, state.activeFeeds)
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

const main = () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('input[name="url"]'),
    feedbackElem: document.querySelector('.feedback'),
  };

  const state = {
    activeFeeds: [],
    input: {
      value: '',
      valid: true,
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
      state.activeFeeds.push(state.input.value);
      elements.rssForm.reset();
      state.feedback.text = 'Rss has been loaded';
    }
  });

  render(state, elements);
};

main();
