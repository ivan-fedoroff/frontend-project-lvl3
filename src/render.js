const render = (elements) => (path, value) => {
  const feedback = document.querySelector('.feedback');
  const { button } = elements;
  if (path === 'rssForm.feedback') {
    feedback.textContent = value;
  }

  if (path === 'rssForm.processState') {
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
        throw new Error(`Unknown process state: ${path}`);
    }
  }
};

export default render;
