import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import last from 'lodash/last';
import differenceBy from 'lodash/differenceBy';
import crc32 from 'crc-32';
import parse from './parser';

const proxyNewChannel = 'https://api.allorigins.win/raw?url='; // cache time 60 min
const proxyRefresh = 'https://cors-anywhere.herokuapp.com/'; // not so stable
const updateInterval = 30000;

const addID = (posts, channelId) => posts.map((post) => {
  post.id = uniqueId();
  post.feedId = channelId;
  return post;
});

const refreshChannel = (feed, state) => {
  const { posts } = state.content;
  const { url, id, hash } = feed;
  const fullURL = proxyRefresh.concat(url);
  return axios.get(fullURL, { timeout: 10000 })
    .then(({ data }) => {
      const freshHash = crc32.str(data);
      if (freshHash === hash) {
        return; // same data, no actions needed
      }
      const { feedPosts } = parse(data);
      const newPosts = differenceBy(feedPosts, posts, 'link');
      if (newPosts.length > 0) {
        state.rssList.lastRenderedPostId = last(posts).id;
        const newPostsWithId = addID(newPosts.reverse(), id);
        posts.push(...newPostsWithId);
      }
      feed.hash = freshHash;
    })
    .finally(() => setTimeout(refreshChannel, updateInterval, feed, state));
};

const subscribeToChannel = (url, state) => {
  const fullURL = proxyNewChannel.concat(url);
  return axios.get(fullURL, { timeout: 7500 })
    .then(({ data }) => {
      const { feed, feedPosts } = parse(data);
      const channelId = uniqueId();
      feed.id = channelId;
      feed.url = url;
      feed.hash = crc32.str(data);
      state.content.feeds.push(feed);
      const postsWithId = addID(feedPosts.reverse(), channelId);
      state.content.posts.push(...postsWithId);
      setTimeout(refreshChannel, updateInterval, feed, state);
    })
    .catch((error) => {
      if (error.isAxiosError) {
        if (error.response) {
          const responseClass = String(error.response.status).slice(0, 1);
          error.translationKey = `loading.networkError.status${responseClass}xx`;
        } else {
          error.translationKey = 'loading.networkError.noResponse';
        }
      } else {
        error.translationKey = 'loading.parsingError';
      }
      throw error;
    });
};

export default subscribeToChannel;
