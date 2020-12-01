import { watch } from 'melanke-watchjs';
import { renderNewFeed, renderNewPosts } from './contentRenderers';

export default (state, elements, changeActiveFeed, t) => {
  const {
    submitBtn,
    feedback,
    feedsList,
    postsList,
    urlInput,
  } = elements;

  const spinner = document.createElement('span');
  spinner.className = 'spinner-grow spinner-grow-sm';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-hidden', 'true');

  watch(state.rssForm, ['state', 'valid', 'error'], () => {
    submitBtn.disabled = !state.rssForm.valid;
    switch (state.rssForm.state) {
      case 'validation': {
        if (state.rssForm.valid) {
          feedback.textContent = '';
          urlInput.classList.remove('is-invalid');
        } else {
          feedback.textContent = t(state.rssForm.error);
          feedback.className = 'text-danger';
          urlInput.classList.add('is-invalid');
        }
        break;
      }
      case 'loading': {
        submitBtn.disabled = true;
        submitBtn.textContent = t('addButton.loading');
        submitBtn.prepend(spinner);
        break;
      }
      case 'added': {
        submitBtn.innerText = t('addButton.default');
        feedback.textContent = t('loading.success');
        feedback.className = 'text-success';
        elements.rssForm.reset();
        break;
      }
      case 'failed': {
        submitBtn.innerText = t('addButton.default');
        feedback.textContent = t(state.rssForm.error);
        feedback.className = 'text-danger';
        break;
      }
      default:
        throw new Error(`Unknown rssForm state: ${state.rssForm.state}`);
    }
  });

  const feedsWatchLevel = 1;
  watch(state.content, 'feeds', renderNewFeed(state, feedsList, changeActiveFeed), feedsWatchLevel);

  watch(state.content, 'posts', renderNewPosts(state, postsList));

  watch(state.rssList.feedSelection, 'enabled', () => {
    if (state.rssList.feedSelection.enabled) {
      elements.showAllBtn.classList.remove('d-none');
      feedsList.querySelector('a.disabled').classList.remove('disabled');
    }
  });

  watch(state.rssList.feedSelection, 'activeId', () => {
    const { activeId } = state.rssList.feedSelection;
    feedsList.querySelector('a.active').classList.remove('active');
    feedsList.querySelector(`a[href="#${activeId}"]`).classList.add('active');
    postsList.querySelectorAll('a.post').forEach((post) => {
      if (activeId === 'all' || post.dataset.feedId === activeId) {
        post.classList.remove('d-none');
      } else {
        post.classList.add('d-none');
      }
    });
  });
};
