import i18next from 'i18next';
import { watch } from 'melanke-watchjs';

export default (state, elements) => {
  const {
    submitBtn,
    feedback,
    feedsList,
    postsList,
  } = elements;

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          loading: {
            success: 'RSS successfully loaded',
            networkError: 'Network Problems. Try again.',
            parsingError: 'Sorry, failed to add this link.',
          },
          validationErrors: {
            notValidURL: 'Please enter a valid URL',
            alreadyAdded: 'This RSS has already been added',
          },
          addButton: {
            default: 'Add',
            loading: ' Loading...',
          },
        },
      },
    },
  });

  const spinner = document.createElement('span');
  spinner.className = 'spinner-grow spinner-grow-sm';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-hidden', 'true');

  watch(state, 'rssLoading', () => {
    const loadState = state.rssLoading;
    if (loadState === 'loading') {
      submitBtn.disabled = true;
      submitBtn.textContent = i18next.t('addButton.loading');
      submitBtn.prepend(spinner);
      return;
    }
    submitBtn.disabled = false;
    submitBtn.innerText = i18next.t('addButton.default');
    feedback.textContent = i18next.t(`loading.${loadState}`);
    if (loadState === 'success') {
      feedback.className = 'text-success';
      elements.rssForm.reset();
    } else {
      feedback.className = 'text-danger';
    }
  });

  watch(state.input, ['valid', 'error'], () => {
    if (state.input.valid) {
      feedback.textContent = '';
      elements.urlInput.classList.remove('is-invalid');
    } else {
      feedback.textContent = i18next.t(state.input.error);
      feedback.className = 'text-danger';
      elements.urlInput.classList.add('is-invalid');
    }
  });

  watch(state.content, 'feeds', () => {
    feedsList.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';
    feedsList.append(list);
    state.content.feeds.forEach(({ feedTitle, feedDescription }) => {
      const feedBlock = document.createElement('li');
      feedBlock.className = 'list-group-item';
      list.prepend(feedBlock);
      const title = document.createElement('h4');
      title.className = 'text-info';
      feedBlock.append(title);
      title.textContent = feedTitle;
      const description = document.createElement('p');
      feedBlock.append(description);
      description.textContent = feedDescription;
    });
  });

  let renderedPostsCount = 0;

  watch(state.content, 'posts', () => {
    const newPosts = state.content.posts.slice(renderedPostsCount);
    newPosts.forEach((post) => {
      const {
        title, link, date, feedTitle, description = '',
      } = post;

      const postContainer = document.createElement('a');
      postContainer.href = link;
      postContainer.target = '_blank';
      postContainer.className = 'list-group-item list-group-item-action';
      postsList.prepend(postContainer);

      const postHeading = document.createElement('h5');
      postHeading.className = 'mb-1';
      postHeading.textContent = title;
      postContainer.append(postHeading);

      const postDescription = document.createElement('p');
      postDescription.className = 'mb-1 text-secondary';
      postDescription.textContent = description;
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
    renderedPostsCount += newPosts.length;
  });
};
