import { watch } from 'melanke-watchjs';
import last from 'lodash/last';
import findIndex from 'lodash/findIndex';

export default (state, elements, changeActiveFeed, t) => {
  const {
    submitBtn,
    feedback,
    feedsList,
    postsList,
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
          elements.urlInput.classList.remove('is-invalid');
        } else {
          feedback.textContent = t(state.rssForm.error);
          feedback.className = 'text-danger';
          elements.urlInput.classList.add('is-invalid');
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

  watch(state.content, 'feeds', () => {
    const { feedTitle, id, imageUrl = null } = last(state.content.feeds);
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = 'd-flex justify-content-center align-items-center list-group-item list-group-item-dark list-group-item-action';
    link.addEventListener('click', changeActiveFeed);
    if (!state.rssList.feedSelection.enabled) {
      link.classList.add('disabled');
    }
    feedsList.append(link);
    const feedContainer = document.createElement('div');
    feedContainer.className = 'media align-items-center';
    link.append(feedContainer);
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = feedTitle;
      img.width = '42';
      img.className = 'mr-3';
      feedContainer.append(img);
    }
    const text = document.createElement('div');
    text.className = 'media-body';
    feedContainer.append(text);
    const title = document.createElement('h4');
    title.textContent = feedTitle;
    text.append(title);
  }, 1);

  watch(state.content, 'posts', () => {
    const { lastRenderedPostId } = state.rssList;
    const { show } = state.rssList.feedSelection;
    const lastRenderedIndex = findIndex(state.content.posts, ({ id }) => id === lastRenderedPostId);
    const newPosts = state.content.posts.slice(lastRenderedIndex + 1);
    newPosts.forEach((post) => {
      const {
        title, link, date, feedTitle, feedId, description = '',
      } = post;

      const postContainer = document.createElement('a');
      postContainer.href = link;
      postContainer.target = '_blank';
      postContainer.className = 'post list-group-item list-group-item-action bg-light overflow-hidden mb-2';
      postContainer.dataset.feedId = feedId;
      if (show !== 'all' && feedId !== show) {
        postContainer.classList.add('d-none');
      }
      postsList.prepend(postContainer);

      const postHeading = document.createElement('h5');
      postHeading.className = 'mb-1';
      postHeading.textContent = title;
      postContainer.append(postHeading);

      const postDescription = document.createElement('p');
      postDescription.className = 'mb-1 text-secondary';
      postDescription.innerHTML = description;
      postContainer.append(postDescription);

      const postFooter = document.createElement('div');
      postFooter.className = 'd-flex w-100 justify-content-between';
      const sourseFeed = document.createElement('small');
      sourseFeed.textContent = feedTitle;
      const dateEl = document.createElement('small');
      dateEl.textContent = `${date.toDateString().slice(0, 10)}, ${date.toTimeString().slice(0, 5)}`;
      postFooter.append(dateEl);
      postFooter.append(sourseFeed);
      postContainer.append(postFooter);
    });
  });

  watch(state.rssList.feedSelection, 'enabled', () => {
    if (state.rssList.feedSelection.enabled) {
      elements.allBtn.classList.remove('d-none');
      feedsList.querySelector('a.disabled').classList.remove('disabled');
    }
  });

  watch(state.rssList.feedSelection, 'show', () => {
    const { show } = state.rssList.feedSelection;
    feedsList.querySelector('a.active').classList.remove('active');
    feedsList.querySelector(`a[href="#${show}"]`).classList.add('active');
    postsList.querySelectorAll('a.post').forEach((post) => {
      if (show === 'all' || post.dataset.feedId === show) {
        post.classList.remove('d-none');
      } else {
        post.classList.add('d-none');
      }
    });
  });
};
