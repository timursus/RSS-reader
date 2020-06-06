import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import crc32 from 'crc-32';

const proxy = 'https://cors-anywhere.herokuapp.com/';

const parse = (rssString) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(rssString, 'text/xml');
  const feedTitle = doc.querySelector('channel>title').textContent;
  const feedDescription = doc.querySelector('channel>description').textContent;
  const feed = {
    feedTitle, feedDescription,
  };
  const postsItems = doc.querySelectorAll('item');
  const posts = [...postsItems].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const date = new Date(item.querySelector('pubDate').textContent);
    const post = {
      title, link, date, feedTitle,
    };
    const descriptionNode = item.querySelector('description');
    if (descriptionNode) {
      post.description = descriptionNode.textContent;
    }
    return post;
  });
  return [feed, posts.reverse()];
};

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
  Не уверен, как лучше искать...
  */
};

export const refresh = (content) => {
  const { feeds, posts } = content;
  const promises = feeds.map((feed) => {
    const { url, id, hash } = feed;
    return axios.get(url, { timeout: 10000 })
      .then(({ data }) => {
        const freshHash = crc32.str(data);
        if (freshHash === hash) {
          return; // избегаем ресурсоемких операций парсинга и фильтрации постов
        }
        const [, feedPosts] = parse(data);
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
    .catch((err) => {
      state.rssLoading = 'networkError';
      throw err;
    })
    .then(({ data }) => {
      try {
        const [feed, feedPosts] = parse(data);
        const channelId = uniqueId();
        feed.id = channelId;
        feed.url = fullURL;
        feed.hash = crc32.str(data);
        state.content.feeds.push(feed);
        const postsWithId = addID(feedPosts, channelId);
        state.content.posts.push(...postsWithId);
      } catch (err) {
        state.rssLoading = 'parsingError';
        throw err;
      }
    });
};
