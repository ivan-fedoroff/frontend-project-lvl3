const render = (elements) => (path, value, prevValue) => {
  const feedback = document.querySelector('.feedback');
  if (path === 'rssForm.feedback') {
    feedback.textContent = value;
  }

  if (path === 'rssForm.processState') {
    switch (value) {
      case 'validate':
        elements.button.disabled = true;
        if (prevValue === 'success') {
          feedback.classList.remove('text-success');
        }
        if (prevValue === 'error') {
          feedback.classList.remove('text-danger');
          elements.field.classList.remove('is-invalid');
        }
        break;
      case 'error':
        elements.field.classList.add('is-invalid');
        feedback.classList.add('text-danger');
        elements.button.disabled = false;
        elements.field.focus();
        break;
      case 'success':
        elements.form.reset();
        elements.field.focus();
        elements.button.disabled = false;
        feedback.classList.add('text-success');
        break;
      default:
        throw new Error(`Unknown process state: ${path}`);
    }
  }
};

export default render;
