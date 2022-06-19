import onChange from 'on-change';
import i18n from 'i18next';
import validate from './validate.js';
import render from './render.js';
import rssParser from './rssParser.js';
import getRSS from './getRSS.js';
import setId from './setId.js';
import ru from './locales/ru.js';

const app = (client = getRSS) => {
  const elements = {
    form: document.querySelector('form'),
    field: document.querySelector('input'),
    button: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    postContainer: document.querySelector('.posts'),
    feedContainer: document.querySelector('.feeds'),
  };

  const state = {
    links: [],
    data: {
      items: [],
      feeds: [],
    },
    rssForm: {
      processState: 'success',
      feedback: '',
      link: '',
    },
  };

  const watchedState = onChange(state, render(elements));

  const clickHandler = (i18Inst) => (e) => {
    e.preventDefault();
    const link = elements.field.value;
    watchedState.rssForm.processState = 'validate';
    validate(link, state.links, i18Inst)
      .then(() => client(link, i18Inst))
      .then((xmlData) => rssParser(xmlData, i18Inst))
      .then((data) => setId(data, watchedState.data.feeds))
      .then((data) => {
        watchedState.links.push(link);
        watchedState.data.feeds = [data.feed, ...watchedState.data.feeds];
        watchedState.data.items = [...data.items, ...watchedState.data.items];
        watchedState.rssForm.feedback = i18Inst.t('feedback.success');
        watchedState.rssForm.processState = 'success';
      })
      .catch((error) => {
        watchedState.rssForm.feedback = error.message;
        watchedState.rssForm.processState = 'error';
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
