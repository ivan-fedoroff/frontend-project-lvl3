import * as yup from 'yup';

const validate = (link, data, i18Inst) => {
  const schema = yup.string()
    .required(i18Inst.t('feedback.errorEmpty'))
    .url(i18Inst.t('feedback.errorURL'))
    .notOneOf(data, i18Inst.t('feedback.errorDouble'));

  const promise = schema.validate(link, { abortEarly: false })
    .then(() => '')
    .catch((e) => {
      const [message] = e.errors;
      const error = new Error(message);
      error.name = e.name;
      throw error;
    });
  return promise;
};

export default validate;
