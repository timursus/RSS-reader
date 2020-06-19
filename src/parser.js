export default (rss) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(rss, 'text/xml');
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
  const feedPosts = posts.reverse();
  return { feed, feedPosts };
};
