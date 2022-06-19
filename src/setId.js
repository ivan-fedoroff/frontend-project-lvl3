const setId = (data, state) => {
  const { items, feed } = data;
  const feedId = state.length === 0 ? 1 : state[0].id + 1;
  feed.id = feedId;

  const modifiedItems = items.map((item, id) => {
    const itemId = `feedId_${id + 1}`;
    return { ...item, id: itemId, feedId };
  });

  return { items: modifiedItems, feed };
};

export default setId;
