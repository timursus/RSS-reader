import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import crc32 from 'crc-32';
import parse from './parser';

const proxy = 'https://cors-anywhere.herokuapp.com/';

const addID = (posts, id) => posts.map((post) => {
  post.feedId = id;
  return post;
});

const getNewPosts = (feedPosts, statePosts) => {
  const isNew = ({ link: postLink }) => !statePosts.some(({ link }) => link === postLink);
  return feedPosts.filter(isNew);
  /*
  Сначала написал проверку не всех свеже-скачанных постов, а только верхних,
  по одному, до первого уже добавленного,
  но посты вроде бы не всегда добавляются сверху, значит нужно проверять все.
  Не уверен, какой алгоритм опитмальнее...
  */
};

export const refresh = (content) => {
  const { feeds, posts } = content;
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
        const newPosts = getNewPosts(feedPosts, posts);
        if (newPosts.length > 0) {
          const newPostsWithId = addID(newPosts, id);
          posts.push(...newPostsWithId);
        }
        feed.hash = freshHash;
      });
  });
  Promise.all(promises).finally(() => setTimeout(refresh, 5000, content));
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
      const postsWithId = addID(feedPosts, channelId);
      state.content.posts.push(...postsWithId);
    });
};
