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

  const addNewRSS = (i18Inst, watchedState) => (e) => {
    e.preventDefault();
    const { rssForm, data } = watchedState;
    const link = elements.field.value;
    rssForm.processState = 'validate';
    validate(link, state.links, i18Inst)
      .then(() => client(link, i18Inst))
      .then((xmlData) => rssParser(xmlData, i18Inst))
      .then((newData) => {
        const id = state.links.length + 1;
        watchedState.links.push({ url: link, id });
        const { items, feed } = newData;
        feed.id = id;
        const modifiedItems = setId(items, id);
        return { items: modifiedItems, feed };
      })
      .then((newData) => {
        data.feeds = [newData.feed, ...data.feeds];
        data.items = [...newData.items, ...data.items];
        rssForm.feedback = i18Inst.t('feedback.success');
        rssForm.processState = 'success';
      })
      .catch((error) => {
        rssForm.feedback = error.message;
        rssForm.processState = 'error';
      });
  };

  const i18Inst = i18n.createInstance();
  i18Inst.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  })
    .then(() => {
      const watchedState = onChange(state, (path, value) => {
        render(path, value, elements, watchedState, state, i18Inst);
      });
      return watchedState;
    })
    .then((watchedState) => {
      elements.button.addEventListener('click', addNewRSS(i18Inst, watchedState));
      elements.modalBtnsClose.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const { ui } = watchedState;
          e.preventDefault();
          ui.modalState = 'close';
          ui.modalData = null;
        });
      });
      return watchedState;
    })
    .then((watchedState) => {
      refreshPosts(state, watchedState, i18Inst);
    });
};

export default app;
