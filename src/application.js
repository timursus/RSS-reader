import { string } from 'yup';
import i18next from 'i18next';
import resources from './locales';
import { loadNewChannel, refresh } from './contentLoad';
import render from './view';

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url('validationErrors.notValidURL')
    .notOneOf(addedURLs, 'validationErrors.alreadyAdded');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  const addedURLs = state.content.feeds.map(({ url }) => url);
  validateUrl(state.rssForm.value, addedURLs)
    .then(() => {
      state.rssForm.valid = true;
      state.rssForm.error = '';
    })
    .catch((err) => {
      state.rssForm.valid = false;
      const [errorKey] = err.errors;
      state.rssForm.error = errorKey;
    });
};

export default () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('input[name="url"]'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsList: document.querySelector('.rss-items'),
    postsList: document.querySelector('.rss-links'),
    allBtn: document.querySelector('a[href="#all"]'),
  };

  const state = {
    content: {
      feeds: [],
      posts: [],
    },
    rssForm: {
      state: 'validation', // loading, added, failed
      value: '',
      valid: true,
      error: '',
    },
    rssList: {
      lastRenderedPostId: null,
      feedSelection: {
        enabled: false,
        show: 'all',
      },
    },
  };

  const changeActiveFeed = (e) => {
    e.preventDefault();
    state.rssList.feedSelection.show = e.currentTarget.hash.slice(1);
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then((t) => render(state, elements, changeActiveFeed, t));

  elements.urlInput.addEventListener('input', (e) => {
    state.rssForm.state = 'validation';
    state.rssForm.value = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.rssForm.state = 'loading';
    const url = state.rssForm.value;
    loadNewChannel(url, state)
      .then(() => {
        state.rssForm.state = 'added';
        if (state.content.feeds.length === 2) {
          state.rssList.feedSelection.enabled = true;
        }
      })
      .catch((err) => {
        state.rssForm.state = 'failed';
        if (err.response) {
          const responseClass = String(err.response.status).slice(0, 1);
          state.rssForm.error = `loading.networkError.status${responseClass}xx`;
        } else if (err.request) {
          state.rssForm.error = 'loading.networkError.timeout';
        } else {
          state.rssForm.error = 'loading.parsingError';
        }
        throw err;
      });
  });

  elements.allBtn.addEventListener('click', changeActiveFeed);

  refresh(state);
};
