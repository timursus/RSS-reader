import axios from 'axios';
import uniqueId from 'lodash/uniqueId';

const proxy = 'https://cors-anywhere.herokuapp.com/';

const parse = (rssString, url, id) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(rssString, 'text/xml');
  const feedTitle = doc.querySelector('channel>title').textContent;
  const feedDescription = doc.querySelector('channel>description').textContent;
  const feed = {
    feedTitle, feedDescription, url, id,
  };
  const lastBuildDateNode = doc.querySelector('lastBuildDate');
  if (lastBuildDateNode) {
    feed.lastBuildDate = new Date(lastBuildDateNode.textContent);
  }
  const postsItems = doc.querySelectorAll('item');
  const posts = [...postsItems].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const date = new Date(item.querySelector('pubDate').textContent);
    const post = {
      title, link, date, feedTitle, feedId: id,
    };
    const descriptionNode = item.querySelector('description');
    if (descriptionNode) {
      post.description = descriptionNode.textContent;
    }
    return post;
  });
  return [feed, posts.reverse()];
};

const getNewPosts = (feedPosts, statePosts) => {
  const isNew = ({ link: postLink }) => !statePosts.some(({ link }) => link === postLink);
  return feedPosts.filter(isNew);
  /*
  Понимаю, что алгоритмическая сложность функции велика (n^2),
  но это пока лучшее, что смог придумать (при текущем виде состояния).
  Сначала написал проверку не всех постов фида, а только верхних,
  по одному, до первого уже добавленного,
  но потом понял, что новые посты не всегда добавляются сверху, значит нужно проверять все.
  */
};

export const refresh = (content) => {
  const { feeds, posts } = content;
  const promises = feeds.map(
    ({ url, id, lastBuildDate = null }) => axios.get(url, { timeout: 10000 })
      .then(({ data }) => {
        const rss = parse(data, url, id);
        const [feed, feedPosts] = rss;
        if (lastBuildDate && lastBuildDate === feed.lastBuildDate) {
          return;
        }
        const newPosts = getNewPosts(feedPosts, posts);
        if (newPosts.length > 0) {
          posts.push(...newPosts);
        }
      }),
  );
  Promise.all(promises).finally(() => setTimeout(refresh, 5000, content));
};

export const loadNewChannel = (url, state) => {
  const fullURL = proxy.concat(url);
  return axios.get(fullURL, { timeout: 7000 })
    .catch((err) => {
      state.rssLoading = 'networkError';
      throw err;
    })
    .then(({ data }) => {
      try {
        const channelId = uniqueId();
        const rss = parse(data, fullURL, channelId);
        const [feed, feedPosts] = rss;
        state.content.feeds.push(feed);
        state.content.posts.push(...feedPosts);
      } catch (err) {
        state.rssLoading = 'parsingError';
        throw err;
      }
    });
};
