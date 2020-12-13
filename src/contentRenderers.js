import last from 'lodash/last';
import findIndex from 'lodash/findIndex';

export const renderNewFeed = (state, feedsList) => () => {
  const {
    feedTitle, feedDescription, id, imageUrl = null,
  } = last(state.content.feeds);

  const feedContainer = document.createElement('a');
  feedContainer.href = `#${id}`;
  feedContainer.title = feedDescription;
  feedContainer.className = 'd-flex justify-content-center align-items-center list-group-item list-group-item-dark list-group-item-action';
  if (!state.rssList.feedSelection.enabled) {
    feedContainer.classList.add('disabled');
  }

  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'media align-items-center';
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = feedTitle;
    img.width = '42';
    img.className = 'mr-3';
    mediaContainer.append(img);
  }
  const body = document.createElement('div');
  body.className = 'media-body';
  const heading = document.createElement('h4');
  heading.textContent = feedTitle;
  body.append(heading);
  mediaContainer.append(body);
  feedContainer.append(mediaContainer);

  feedsList.append(feedContainer);
};

export const renderNewPosts = (state, postsList) => () => {
  const { lastRenderedPostId } = state.rssList;
  const { activeId } = state.rssList.feedSelection;
  const lastRenderedIndex = findIndex(state.content.posts, ({ id }) => id === lastRenderedPostId);
  const newPosts = state.content.posts.slice(lastRenderedIndex + 1);
  newPosts.forEach((post) => {
    const {
      title, link, date, feedTitle, feedId, description,
    } = post;

    const postContainer = document.createElement('a');
    postContainer.href = link;
    postContainer.target = '_blank';
    postContainer.dataset.feedId = feedId;
    postContainer.className = 'post list-group-item list-group-item-action bg-light overflow-hidden mb-2';
    if (activeId !== 'all' && feedId !== activeId) {
      postContainer.classList.add('d-none');
    }

    const heading = document.createElement('h5');
    heading.className = 'mb-1';
    heading.textContent = title;
    postContainer.append(heading);

    const body = document.createElement('p');
    body.className = 'mb-1 text-secondary';
    body.innerHTML = description;
    postContainer.append(body);

    const footer = document.createElement('div');
    footer.className = 'd-flex w-100 justify-content-between';
    const dateEl = document.createElement('small');
    dateEl.textContent = `${date.toDateString().slice(0, 10)}, ${date.toTimeString().slice(0, 5)}`;
    footer.append(dateEl);
    const sourseFeed = document.createElement('small');
    sourseFeed.textContent = feedTitle;
    footer.append(sourseFeed);
    postContainer.append(footer);

    postsList.prepend(postContainer);
  });
};
