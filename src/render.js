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

const render = (elements) => (path, value) => {
  const { feedback, postContainer, feedContainer } = elements;
  if (path === 'rssForm.feedback') {
    feedback.textContent = value;
  }

  if (path === 'rssForm.processState') {
    handlerProcessState(value, path, elements);
  }

  if (path === 'data.feeds') {
    if (value.length > 0) {
      const card = document.createElement('div');
      card.className = 'card border-0';
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      cardBody.innerHTML = '<h2 class="card-title h4">Фиды</h2>';
      card.append(cardBody);
      const items = document.createElement('ul');
      items.className = 'list-group border-0 rounded-0';
      items.innerHTML = value.map((item) => `<li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${item.title}</h3>
      <p class="m-0 small text-black-50">${item.description}</p>
      </li>`).join('\n');
      feedContainer.append(card, items);
    }
  }

  if (path === 'data.items') {
    if (value.length > 0) {
      const card = document.createElement('div');
      card.className = 'card border-0';
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      cardBody.innerHTML = '<h2 class="card-title h4">Посты</h2>';
      card.append(cardBody);
      const items = document.createElement('ul');
      items.className = 'list-group border-0 rounded-0';
      items.innerHTML = value.map((item) => `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
      <a href=${item.url} class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${item.title}</a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
      </li>`).join('\n');
      postContainer.append(card, items);
    }
  }
};

export default render;
