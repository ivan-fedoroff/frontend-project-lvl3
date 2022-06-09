import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import render from './render.js';
import ru from './locales/ru.js';

const validate = (link, data, i18Inst) => {
  const schema = yup.string()
    .required(i18Inst.t('feedback.errorEmpty'))
    .url(i18Inst.t('feedback.errorURL'))
    .notOneOf(data, i18Inst.t('feedback.errorDouble'));

  const promise = schema.validate(link, { abortEarly: false })
    .then(() => '')
    .catch((e) => {
      const [message] = e.errors;
      return message;
    });
  return promise;
};

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    field: document.querySelector('input'),
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

  const clickHandler = (i18Inst) => (e) => {
    e.preventDefault();
    watchedState.rssForm.link = elements.field.value;
    watchedState.rssForm.processState = 'validate';
    validate(watchedState.rssForm.link, state.data, i18Inst)
      .then((error) => {
        if (!error) {
          watchedState.data.push(watchedState.rssForm.link);
          watchedState.rssForm.feedback = i18Inst.t('feedback.success');
          watchedState.rssForm.processState = 'success';
        } else {
          watchedState.rssForm.feedback = error;
          watchedState.rssForm.processState = 'error';
        }
      });
  };

  const i18Inst = i18n.createInstance();
  i18Inst.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  })
    .then(() => {
      elements.button.addEventListener('click', clickHandler(i18Inst));
    });
};

export default app;
