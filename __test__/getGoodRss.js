import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToFixture = (filename) => path.join(__dirname, '__fixtures__', filename);
const validRss = fs.readFileSync(pathToFixture('feed')).toString();

const getGoodRss = (uri, i18Inst) => {
  const result = {
    status: 200,
    url: uri,
    data: {
      contents: validRss,
    },
  };
  if (!result) {
    const error = new Error(i18Inst.t('feedback.errorNetwork'));
    error.name = 'Network Error';
    throw error;
  }
  return result.data.contents;
};

export default getGoodRss;
