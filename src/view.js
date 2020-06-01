import i18next from 'i18next';
import { watch } from 'melanke-watchjs';

export default (state, elements) => {
  const { feedback, feedsList, postsList } = elements;

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          loading: {
            success: 'RSS successfully loaded',
            networkError: 'Network Problems. Try again.',
            parsingError: 'Doesn\'t look like RSS link',
          },
          validationErrors: {
            notValidURL: 'Please enter a valid URL',
            alreadyAdded: 'This RSS has already been added',
          },
        },
      },
    },
  });

  watch(state.rssLoading, 'state', () => {
    const loadState = state.rssLoading.state;
    if (loadState === 'loading') {
      elements.submitBtn.disabled = true;
      return;
    }
    elements.submitBtn.disabled = false;
    feedback.textContent = i18next.t(`loading.${loadState}`);
    if (loadState === 'success') {
      feedback.className = 'text-success';
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

  watch(state.content, 'activeFeeds', () => {
    feedsList.innerHTML = '';
    state.content.activeFeeds.forEach(({ feedTitle, feedDescription, id }) => {
      const div = document.createElement('div');
      feedsList.append(div);
      const a = document.createElement('a');
      div.append(a);
      a.href = id;
      a.textContent = feedTitle;
      const p = document.createElement('p');
      div.append(p);
      p.textContent = feedDescription;
    });
  });

  watch(state.content, 'posts', () => {
    postsList.innerHTML = '';
    state.content.posts.forEach(({ postTitle, postLink }) => {
      const div = document.createElement('div');
      postsList.append(div);
      const a = document.createElement('a');
      div.append(a);
      a.href = postLink;
      a.target = '_blank';
      a.textContent = postTitle;
    });
  });
};
