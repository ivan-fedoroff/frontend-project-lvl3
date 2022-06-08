const render = (elements) => (path, value, prevValue) => {
  const feedback = document.querySelector('.feedback');
  if (path === 'rssForm.error') {
    if (!value && !!prevValue) {
      elements.field.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      return;
    }

    if (!!value && !!prevValue) {
      feedback.textContent = value;
      return;
    }

    elements.field.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = value;
  }

  if (path === 'rssForm.processState') {
    switch (value) {
      case 'filling':
        elements.field.focus();
        break;
      case 'error':
        elements.field.focus();
        break;
      case 'success':
        elements.form.reset();
        elements.field.focus();
        feedback.classList.add('text-success');
        feedback.textContent = 'RSS успешно загружен';
        break;
      default:
        throw new Error(`Unknown process state: ${path}`);
    }
  }
};

export default render;
