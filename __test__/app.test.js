/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://allorigins.hexlet.app/get?disableCache=true&url=http://lorem-rss.herokuapp.com/feed?unit=day"}
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import getGoodRss from './getGoodRss.js';
import getBadRss from './getBadRss.js';

nock.disableNetConnect();
const user = userEvent.setup();
const url = 'http://lorem-rss.herokuapp.com/feed?unit=day';
let elements;

beforeEach(() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const pathToFixture = (filename) => path.join(__dirname, '__fixtures__', filename);
  const initHtml = fs.readFileSync(pathToFixture('index.html')).toString();
  document.body.innerHTML = initHtml;

  elements = {
    button: screen.getByText(/Добавить/),
    input: screen.getByRole('textbox', { name: /url/ }),
    feedback: screen.getByTestId('feedback'),
  };
});

test('success adding', () => {
  app(getGoodRss);
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
    .then(() => waitFor(() => expect(screen.getByText('Lorem ipsum 2022-06-19T00:00:00Z'))
      .toBeInTheDocument()))
    .then(() => waitFor(() => expect(screen.getByText('Просмотр')).toBeInTheDocument()))
    .then(() => waitFor(() => expect(screen.getByText('Lorem ipsum feed for an interval of 1 days with 10 item(s)'))
      .toBeInTheDocument()))
    .then(() => waitFor(() => expect(screen.getByText('This is a constantly updating lorem ipsum feed'))
      .toBeInTheDocument()))
    .then(() => {
      expect(elements.feedback).toHaveTextContent('RSS успешно загружен');
      expect(elements.feedback).toHaveClass('text-success');
      expect(elements.input).not.toHaveClass('is-invalid');
      expect(elements.input).not.toHaveValue();
      expect(elements.input).toHaveFocus();
    });
  return promise;
});

test('empty field', () => {
  app();
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.click(elements.button).then(() => {
    expect(elements.input).toHaveClass('is-invalid');
    expect(elements.feedback).toHaveTextContent('Пожалуйста, заполните поле');
    expect(elements.feedback).toHaveClass('text-danger');
  });
  return promise;
});

test('wrong url', () => {
  app();
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.type(elements.input, 'wrong url')
    .then(() => user.click(elements.button))
    .then(() => {
      expect(elements.feedback).toHaveTextContent('Ссылка должна быть валидным URL');
      expect(elements.feedback).toHaveClass('text-danger');
      expect(elements.input).toHaveClass('is-invalid');
    });
  return promise;
});

test('success adding after error', () => {
  app(getGoodRss);
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.click(elements.button)
    .then(() => user.type(elements.input, url))
    .then(() => user.click(elements.button))
    .then(() => waitFor(() => expect(screen.getByText('Lorem ipsum feed for an interval of 1 days with 10 item(s)'))
      .toBeInTheDocument()))
    .then(() => {
      expect(elements.feedback).toHaveTextContent('RSS успешно загружен');
      expect(elements.feedback).toHaveClass('text-success');
      expect(elements.input).not.toHaveClass('is-invalid');
      expect(elements.input).not.toHaveValue();
      expect(elements.input).toHaveFocus();
    });
  return promise;
});

test('dublicate error', () => {
  app(getGoodRss);
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
    .then(() => user.clear(elements.input))
    .then(() => user.type(elements.input, url))
    .then(() => user.click(elements.button))
    .then(() => {
      expect(elements.input).toHaveClass('is-invalid');
      expect(elements.feedback).toHaveTextContent('RSS уже существует');
      expect(elements.feedback).toHaveClass('text-danger');
    });
  return promise;
});

test('network error', () => {
  app();
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
    .then(() => {
      expect(elements.input).toHaveClass('is-invalid');
      expect(elements.feedback).toHaveTextContent('Ошибка сети, попробуйте еще раз');
      expect(elements.feedback).toHaveClass('text-danger');
    });
  return promise;
});

test('no valid RSS', () => {
  app(getBadRss);
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
    .then(() => {
      expect(elements.input).toHaveClass('is-invalid');
      expect(elements.feedback).toHaveTextContent('Ресурс не содержит валидный RSS');
      expect(elements.feedback).toHaveClass('text-danger');
    });

  return promise;
});
