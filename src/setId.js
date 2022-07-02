const setId = (newItems, feedId) => {
  const modifiedItems = newItems.map((item, id) => {
    const itemId = id + 1;
    return {
      ...item,
      id: itemId,
      feedId,
    };
  });

  return modifiedItems;
};

export default setId;
