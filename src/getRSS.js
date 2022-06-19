import axios from 'axios';

const getRSS = (uri, i18Inst) => {
  const result = axios({
    method: 'get',
    baseURL: 'https://allorigins.hexlet.app/get',
    params: {
      disableCache: true,
      url: uri,
    },
  })
    .then((responce) => responce.data.contents)
    .catch((e) => {
      const error = new Error(i18Inst.t('feedback.errorNetwork'));
      error.name = e.name;
      throw error;
    });
  return result;
};

export default getRSS;
