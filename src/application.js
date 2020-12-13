import i18next from 'i18next';
import get from 'lodash/get';
import last from 'lodash/last';
import resources from './locales';
import updateValidationState from './validation';
import subscribeToChannel from './contentLoaders';
import render from './view';

export default () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('input[name="url"]'),
    submitBtn: document.querySelector('button[type="submit"]'),
    formFeedback: document.querySelector('.invalid-tooltip'),
    appNotifications: document.querySelector('.notification-area'),
    feedsList: document.querySelector('.rss-items'),
    postsList: document.querySelector('.rss-links'),
    showAllBtn: document.querySelector('a[href="#all"]'),
  };

  const state = {
    content: {
      feeds: [],
      posts: [],
    },
    rssForm: {
      status: 'filling', // loading, added, failed
      url: '',
      valid: true,
      error: null,
    },
    rssList: {
      lastRenderedPostId: null,
      feedSelection: {
        enabled: false,
        activeId: 'all',
      },
    },
    appError: null,
  };

  elements.urlInput.addEventListener('input', (e) => {
    state.rssForm.status = 'filling';
    state.rssForm.url = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.rssForm.status = 'loading';
    state.rssList.lastRenderedPostId = get(last(state.content.posts), 'id', null);
    const { url } = state.rssForm;
    subscribeToChannel(url, state)
      .then(() => {
        state.rssForm.status = 'added';
        state.rssList.feedSelection.enabled = (state.content.feeds.length > 1);
      })
      .catch((err) => {
        state.rssForm.status = 'failed';
        state.appError = err.translationKey;
        throw err;
      });
  });

  const changeActiveFeed = (e) => {
    e.preventDefault();
    const feedLink = e.target.closest('a');
    const newActiveFeedId = feedLink.hash.slice(1);
    state.rssList.feedSelection.activeId = newActiveFeedId;
  };

  elements.feedsList.addEventListener('click', changeActiveFeed);

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then((t) => render(state, elements, t));
};
