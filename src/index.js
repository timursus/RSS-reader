import './styles.css';
import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/alert';
import { string } from 'yup';
import { watch } from 'melanke-watchjs';

const schema = string().url();

const updateValidationState = (state) => {
  schema.isValid(state.input.value)
    .then((isValidUrl) => {
      if (!isValidUrl) {
        state.feedback.text = 'Please enter valid URL';
        state.feedback.error = true;
      }
      const alreadyAdded = isValidUrl && state.activeFeeds.includes(state.input.value);
      if (alreadyAdded) {
        state.feedback.text = 'RSS already added';
        state.feedback.error = true;
      }
      state.input.valid = isValidUrl && !alreadyAdded;
      if (state.input.valid) {
        state.feedback.text = '';
        state.feedback.error = false;
      }
    });
};

const run = () => {
  const rssForm = document.querySelector('.rss-form');
  const urlInput = rssForm.querySelector('input[name="url"]');

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

  const feedbackElem = document.querySelector('.feedback');

  watch(state.input, 'valid', () => {
    if (state.input.valid) {
      urlInput.classList.remove('is-invalid');
    } else {
      urlInput.classList.add('is-invalid');
    }
  });

  watch(state.feedback, () => {
    feedbackElem.textContent = state.feedback.text;
    if (state.feedback.error) {
      feedbackElem.classList.remove('text-success');
      feedbackElem.classList.add('text-danger');
    } else {
      feedbackElem.classList.remove('text-danger');
      feedbackElem.classList.add('text-success');
    }
  });

  urlInput.addEventListener('input', (e) => {
    state.input.value = e.target.value;
    updateValidationState(state);
  });

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
};

run();
