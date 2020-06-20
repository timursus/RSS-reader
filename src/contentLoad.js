import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import last from 'lodash/last';
import differenceBy from 'lodash/differenceBy';
import crc32 from 'crc-32';
import parse from './parser';

const proxy = 'https://cors-anywhere.herokuapp.com/';

const addID = (posts, channelId) => posts.map((post) => {
  post.id = uniqueId();
  post.feedId = channelId;
  return post;
});

export const refresh = (state) => {
  const { feeds, posts } = state.content;
  const promises = feeds.map((feed) => {
    const { url, id, hash } = feed;
    const fullURL = proxy.concat(url);
    return axios.get(fullURL, { timeout: 10000 })
      .then(({ data }) => {
        const freshHash = crc32.str(data);
        if (freshHash === hash) {
          return;
        }
        const { feedPosts } = parse(data);
        const newPosts = differenceBy(feedPosts, posts, 'link');
        if (newPosts.length > 0) {
          state.rssList.lastRenderedPostId = last(posts).id;
          const newPostsWithId = addID(newPosts.reverse(), id);
          posts.push(...newPostsWithId);
        }
        feed.hash = freshHash;
      });
  });
  Promise.all(promises).finally(() => setTimeout(refresh, 5000, state));
};

export const loadNewChannel = (url, state) => {
  const fullURL = proxy.concat(url);
  return axios.get(fullURL, { timeout: 5000 })
    .then(({ data }) => {
      const { feed, feedPosts } = parse(data);
      const channelId = uniqueId();
      feed.id = channelId;
      feed.url = url;
      feed.hash = crc32.str(data);
      state.content.feeds.push(feed);
      state.rssList.lastRenderedPostId = get(last(state.content.posts), 'id', 0);
      const postsWithId = addID(feedPosts.reverse(), channelId);
      state.content.posts.push(...postsWithId);
    });
};
