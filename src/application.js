import i18next from 'i18next';
import get from 'lodash/get';
import last from 'lodash/last';
import resources from './locales';
import updateValidationState from './validation';
import { loadNewChannel, refreshContent } from './contentLoaders';
import render from './view';

export default () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('input[name="url"]'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
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
      state: 'validation', // loading, added, failed
      value: '',
      valid: true,
      error: '',
    },
    rssList: {
      lastRenderedPostId: null,
      feedSelection: {
        enabled: false,
        activeId: 'all',
      },
    },
  };

  elements.urlInput.addEventListener('input', (e) => {
    state.rssForm.state = 'validation';
    state.rssForm.value = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.rssForm.state = 'loading';
    state.rssList.lastRenderedPostId = get(last(state.content.posts), 'id', null);
    const url = state.rssForm.value;
    loadNewChannel(url, state.content)
      .then(() => {
        state.rssForm.state = 'added';
        state.rssList.feedSelection.enabled = (state.content.feeds.length > 1);
      })
      .catch((err) => {
        state.rssForm.state = 'failed';
        state.rssForm.error = err.translationKey;
        throw err;
      });
  });

  const changeActiveFeed = (e) => {
    e.preventDefault();
    state.rssList.feedSelection.activeId = e.currentTarget.hash.slice(1);
  };

  elements.showAllBtn.addEventListener('click', changeActiveFeed);

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then((t) => render(state, elements, changeActiveFeed, t));

  refreshContent(state);
};
