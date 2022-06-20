const rssParser = (data, i18Inst) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'text/xml');
  const errorNode = xmlDoc.querySelector('parsererror');

  if (errorNode) {
    const error = new Error(i18Inst.t('feedback.errorNoRSS'));
    error.name = 'parserError';
    throw error;
  }

  const channel = xmlDoc.getElementsByTagName('channel');
  const channelTitle = channel[0].getElementsByTagName('title')[0].textContent;
  const channelDescription = channel[0].getElementsByTagName('description')[0].textContent;
  const feed = { title: channelTitle, description: channelDescription };
  const rssItems = xmlDoc.getElementsByTagName('item');
  const items = [];
  for (let i = 0; i < rssItems.length; i += 1) {
    const title = rssItems[i].getElementsByTagName('title')[0].textContent;
    const description = rssItems[i].getElementsByTagName('description')[0].textContent;
    const url = rssItems[i].getElementsByTagName('link')[0].textContent;
    items.push({ title, description, url });
  }

  return { items, feed };
};

export default rssParser;
