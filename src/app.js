import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js';

const validate = (field, data) => {
  const schema = yup.string()
    .required('Пожалуйста, заполните поле')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(data, 'RSS уже существует');
  return schema.validate(field, { abortEarly: false })
    .then(() => '')
    .catch((e) => {
      const [message] = e.errors;
      return message;
    });
};

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    field: document.querySelector('[aria-label="url"]'),
    button: document.querySelector('[type="submit"]'),
  };

  const state = {
    data: [],
    rssForm: {
      processState: 'filling',
      valid: true,
      error: '',
      link: '',
    },
  };

  const watchedState = onChange(state, render(elements));

  elements.button.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.rssForm.field = elements.field.value;
    validate(watchedState.rssForm.field, state.data)
      .then((error) => {
        watchedState.rssForm.error = error;
        watchedState.rssForm.valid = !error;

        if (watchedState.rssForm.valid) {
          state.data.push(watchedState.rssForm.field);
          watchedState.rssForm.processState = 'success';
        } else {
          watchedState.rssForm.processState = 'error';
        }
      });
  });
};

export default app;
