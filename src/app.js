import onChange from 'on-change';
import i18n from 'i18next';
import validate from './validate.js';
import render from './render.js';
import rssParser from './rssParser.js';
import getRSS from './getRSS.js';
import setId from './setId.js';
import ru from './locales/ru.js';

const refreshPosts = (state, watchedState, i18Inst) => {
  const { data } = watchedState;
  setTimeout(() => {
    state.links.forEach((link) => {
      const promis = getRSS(link, i18Inst)
        .then((xmlData) => rssParser(xmlData, i18Inst))
        .then((newData) => {
          const { feedId } = state.data.items.find((item) => item.link === link);
          const modifiedItems = newData.items.map((item, id) => {
            const itemId = `${feedId}_${id + 1}`;
            return {
              ...item,
              id: itemId,
              feedId,
              link,
            };
          });
          return modifiedItems;
        })
        .then((modifiedItems) => {
          const otherItems = state.data.items.filter((item) => item.link !== link);
          data.items = [...modifiedItems, ...otherItems];
        })
        .catch();
      return promis;
    });
    refreshPosts(state, watchedState, i18Inst);
  }, 5000);
};

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
      .then((data) => setId(data, watchedState.data.feeds, link))
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
    })
    .then(() => refreshPosts(state, watchedState, i18Inst));
};

export default app;
