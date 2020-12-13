import { string } from 'yup';

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url('validationErrors.notValidURL')
    .notOneOf(addedURLs, 'validationErrors.alreadyAdded');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  const addedURLs = state.content.feeds.map(({ url }) => url);
  validateUrl(state.rssForm.url, addedURLs)
    .then(() => {
      state.rssForm.valid = true;
      state.rssForm.error = null;
    })
    .catch((err) => {
      state.rssForm.valid = false;
      const [errorKey] = err.errors;
      state.rssForm.error = errorKey;
    });
};

export default updateValidationState;
