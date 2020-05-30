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
};
