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
      const promis = getRSS(link.url, i18Inst)
        .then((xmlData) => {
          const newData = rssParser(xmlData, i18Inst);
          return newData.items;
        })
        .then((newData) => {
          const feedId = link.id;
          return setId(newData, feedId);
        })
        .then((modifiedItems) => {
          const otherItems = state.data.items.filter((item) => item.feedId !== link.id);
          data.items = [...modifiedItems, ...otherItems];
        })
        .catch((e) => e);
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
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalText: document.querySelector('.modal-body'),
    modalFullArticle: document.querySelector('.full-article'),
    modalBtnsClose: document.querySelectorAll('[data-bs-dismiss="modal"]'),
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
    ui: {
      watched: [],
      modalState: 'close',
      modalData: null,
    },
  };

  const watchedState = onChange(state, (path, value) => {
    render(path, value, elements, watchedState, state);
  });

  const addNewRSS = (i18Inst) => (e) => {
    e.preventDefault();
    const link = elements.field.value;
    watchedState.rssForm.processState = 'validate';
    validate(link, state.links, i18Inst)
      .then(() => client(link, i18Inst))
      .then((xmlData) => rssParser(xmlData, i18Inst))
      .then((data) => {
        const id = state.links.length + 1;
        watchedState.links.push({ url: link, id });
        const { items, feed } = data;
        feed.id = id;
        const modifiedItems = setId(items, id);
        return { items: modifiedItems, feed };
      })
      .then((data) => {
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
      elements.button.addEventListener('click', addNewRSS(i18Inst));
      elements.modalBtnsClose.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          watchedState.ui.modalState = 'close';
          watchedState.ui.modalData = null;
        });
      });
    })
    .then(() => {
      refreshPosts(state, watchedState, i18Inst);
    });
};

export default app;
