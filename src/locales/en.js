export default {
  translation: {
    loading: {
      success: 'RSS successfully loaded',
      parsingError: 'Sorry, failed to process. Probably, it is not RSS link.',
      networkError: {
        noResponse: 'Network problems. Please, try again.',
        status3xx: 'Redirection network error. Please check your URL.',
        status4xx: 'Client network error. Please check your URL.',
        status5xx: 'Server error. Please, try again later.',
      },
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
};
