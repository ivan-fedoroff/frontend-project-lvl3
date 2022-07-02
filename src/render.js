const handlerProcessState = (value, processState, elements) => {
  const { button, feedback } = elements;
  switch (value) {
    case 'validate':
      button.disabled = true;
      break;
    case 'error':
      feedback.classList.remove('text-success');
      elements.field.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      button.disabled = false;
      elements.field.focus();
      break;
    case 'success':
      elements.form.reset();
      elements.field.focus();
      feedback.classList.remove('text-danger');
      elements.field.classList.remove('is-invalid');
      button.disabled = false;
      feedback.classList.add('text-success');
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const addToWatched = (title, watched) => () => { watched.push(title); };

const addPostToWatch = (post, uiState) => (e) => {
  e.preventDefault();
  const ui = uiState;
  ui.modalState = 'open';
  const { url, title, description } = post;
  ui.modalData = { url, title, description };
};

const renderPost = (post, watchedState, state, i18Inst) => {
  const { ui } = watchedState;
  const { url, title, id } = post;
  const watchedIndex = state.findIndex((item) => item === title);
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
  const postTitle = document.createElement('a');
  postTitle.href = url;
  postTitle.textContent = title;
  postTitle.className = watchedIndex < 0 ? 'fw-bold' : 'fw-normal';
  postTitle.dataset.id = id;
  postTitle.target = '_blank';
  postTitle.rel = 'noopener noreferrer';
  postTitle.addEventListener('click', addToWatched(title, ui.watched));
  const button = document.createElement('button');
  button.className = 'btn btn-outline-primary btn-sm';
  button.dataset.id = id;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = i18Inst.t('button');
  button.addEventListener('click', addToWatched(title, ui.watched));
  button.addEventListener('click', addPostToWatch(post, ui));
  li.append(postTitle, button);
  return li;
};

const renderPosts = (posts, watchedState, watched, i18Inst) => {
  const list = document.createElement('ul');
  list.className = 'list-group border-0 rounded-0';
  posts.forEach((post) => {
    const view = renderPost(post, watchedState, watched, i18Inst);
    list.appendChild(view);
  });
  return list;
};

const renderFeeds = (feeds) => {
  const list = document.createElement('ul');
  list.className = 'list-group border-0 rounded-0';
  list.innerHTML = feeds.map((feed) => (`<li class="list-group-item border-0 border-end-0">
  <h3 class="h6 m-0">${feed.title}</h3>
  <p class="m-0 small text-black-50">${feed.description}</p>
  </li>`)).join('\n');
  return list;
};

const makeCard = (text) => {
  const card = document.createElement('div');
  card.className = 'card border-0';
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  cardBody.innerHTML = `<h2 class="card-title h4">${text}</h2>`;
  card.append(cardBody);
  return card;
};

const handlerModalState = (value, elements) => {
  const { modal } = elements;
  modal.style.display = value === 'open' ? 'block' : 'none';
  modal.classList.toggle('show');
};

const handlerModalData = (value, elements) => {
  const { modalTitle, modalText, modalFullArticle } = elements;
  if (value) {
    modalText.textContent = value.description;
    modalTitle.textContent = value.title;
    modalFullArticle.href = value.url;
  } else {
    modalText.textContent = '';
    modalTitle.textContent = '';
    modalFullArticle.href = '';
  }
};

const render = (path, value, elements, watchedState, state, i18Inst) => {
  const { feedback, postContainer, feedContainer } = elements;
  if (path === 'rssForm.feedback') {
    feedback.textContent = value;
  }

  if (path === 'rssForm.processState') {
    handlerProcessState(value, path, elements);
  }

  if (path === 'data.feeds') {
    const card = makeCard('Feeds');
    const view = renderFeeds(value);
    feedContainer.append(card, view);
  }

  if (path === 'data.items') {
    postContainer.innerHTML = '';
    const card = makeCard('Posts');
    const view = renderPosts(value, watchedState, state.ui.watched, i18Inst);
    postContainer.append(card, view);
  }

  if (path === 'ui.watched') {
    const oldPosts = postContainer.querySelector('ul');
    const view = renderPosts(state.data.items, watchedState, state.ui.watched, i18Inst);
    postContainer.replaceChild(view, oldPosts);
  }

  if (path === 'ui.modalState') {
    handlerModalState(value, elements);
  }

  if (path === 'ui.modalData') {
    handlerModalData(value, elements);
  }
};

export default render;
