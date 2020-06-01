import { watch } from 'melanke-watchjs';

export default (state, elements) => {
  const { urlInput, feedbackElem } = elements;

  watch(state.input, 'valid', () => {
    if (state.input.valid) {
      urlInput.classList.remove('is-invalid');
    } else {
      urlInput.classList.add('is-invalid');
    }
  });

  watch(state.input, 'loading', () => {
    elements.submitBtn.disabled = state.input.loading;
  });

  watch(state, 'feedback', () => {
    feedbackElem.textContent = state.feedback.text;
    if (state.feedback.error) {
      feedbackElem.classList.remove('text-success');
      feedbackElem.classList.add('text-danger');
    } else {
      feedbackElem.classList.remove('text-danger');
      feedbackElem.classList.add('text-success');
    }
  });

  watch(state, 'activeFeeds', () => {
    elements.feedsList.innerHTML = '';
    state.activeFeeds.forEach(({ feedTitle, feedDescription, id }) => {
      const div = document.createElement('div');
      elements.feedsList.append(div);
      const a = document.createElement('a');
      div.append(a);
      a.href = id;
      a.textContent = feedTitle;
      const p = document.createElement('p');
      div.append(p);
      p.textContent = feedDescription;
    });
  });

  watch(state, 'posts', () => {
    elements.postsList.innerHTML = '';
    state.posts.forEach(({ postTitle, postDescription, postLink }) => {
      const div = document.createElement('div');
      elements.postsList.append(div);
      const a = document.createElement('a');
      div.append(a);
      a.href = postLink;
      a.textContent = postTitle;
      const p = document.createElement('p');
      div.append(p);
      p.textContent = postDescription;
    });
  });
};
