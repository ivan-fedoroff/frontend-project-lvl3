import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import render from './render.js';
import ru from './locales/ru.js';

const validate = (field, data, i18Inst) => {
  yup.setLocale({
    string: {
      required: ({ required }) => ({ key: 'feedback.errorEmpty', values: { required } }),
      url: ({ url }) => ({ key: 'feedback.errorURL', values: { url }}),
      notOneOf: ({ notOneOf }) => ({ key: 'feedback.errorDouble', values: { notOneOf } }),
    }
  });

  const schema = yup.string()
    .required()
    .url()
    .notOneOf(data);
  return schema.validate(field, { abortEarly: false })
    .then(() => '')
    .catch((e) => {
      const [message] = e.errors.map((err) => i18Inst.t(err.key));
      return message;
    });
};

const clickHandler = (watchedState, state, i18Inst) => (e) => {
  e.preventDefault();
  watchedState.rssForm.link = elements.field.value;
  validate(watchedState.rssForm.link, state.data, i18Inst)
    .then((error) => {
      console.log(error);
      if (!error) {
        watchedState.data.push(watchedState.rssForm.link);
        watchedState.rssForm.feedback = i18Inst.t('feedback.success');
        watchedState.rssForm.processState = 'success';
      } else {
        watchedState.rssForm.feedback = error;
        watchedState.rssForm.processState = 'error';
        }
    });
}

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    field: document.querySelector('[aria-label="url"]'),
    button: document.querySelector('[type="submit"]'),
  };

  const state = {
    data: [],
    rssForm: {
      processState: 'success',
      feedback: '',
      link: '',
    },
  };

  const watchedState = onChange(state, render(elements));

  const i18Inst = i18n.createInstance();
  i18Inst.init({
    lng: 'ru',
    debug: false,
    resources: {ru},
  })
    .then(() => {
      elements.button.addEventListener('click', clickHandler(watchedState, state, i18Inst));
    })
};

export default app;
