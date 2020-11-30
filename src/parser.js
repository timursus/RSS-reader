export default (rss) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(rss, 'text/xml');

  const feedTitle = doc.querySelector('channel>title').textContent;
  const feedDescription = doc.querySelector('channel>description')?.textContent ?? '';
  const imageUrl = doc.querySelector('channel>image>url')?.textContent ?? null;
  const feed = { feedTitle, feedDescription, imageUrl };

  const postsItems = doc.querySelectorAll('item');
  const feedPosts = [...postsItems].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const date = new Date(item.querySelector('pubDate').textContent);
    const description = item.querySelector('description')?.textContent ?? '';
    const post = {
      title,
      link,
      date,
      description,
      feedTitle,
    };
    return post;
  });

  return { feed, feedPosts };
};
