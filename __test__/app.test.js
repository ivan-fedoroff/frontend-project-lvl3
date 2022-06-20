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

nock.disableNetConnect();
const user = userEvent.setup();
const url = 'http://lorem-rss.herokuapp.com/feed?unit=day';
let elements;
let validRss;
let badRss;
// let newRss;

beforeEach(() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const pathToFixture = (filename) => path.join(__dirname, '__fixtures__', filename);
  const initHtml = fs.readFileSync(pathToFixture('index.html')).toString();
  document.body.innerHTML = initHtml;
  app();

  validRss = fs.readFileSync(pathToFixture('feed')).toString();
  badRss = fs.readFileSync(pathToFixture('badFeed')).toString();
  // newRss = fs.readFileSync(pathToFixture('newFeed')).toString();

  elements = {
    button: screen.getByText(/Добавить/),
    input: screen.getByRole('textbox', { name: /url/ }),
    feedback: screen.getByTestId('feedback'),
  };
});

test('success adding', () => {
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');
  nock('https://allorigins.hexlet.app')
    .get((uri) => uri.includes('lorem-rss.herokuapp'))
    .reply(200, {
      contents: validRss,
    });

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
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');
  nock('https://allorigins.hexlet.app')
    .get((uri) => uri.includes('lorem-rss.herokuapp'))
    .reply(200, {
      contents: validRss,
    });

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
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');
  nock('https://allorigins.hexlet.app')
    .get((uri) => uri.includes('lorem-rss.herokuapp'))
    .reply(200, {
      contents: validRss,
    });

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
    .then(() => user.clear(elements.input))
    .then(() => user.type(elements.input, url))
    .then(() => user.click(elements.button))
    .then(() => waitFor(() => expect(elements.input).toHaveClass('is-invalid')))
    .then(() => {
      expect(elements.feedback).toHaveTextContent('RSS уже существует');
      expect(elements.feedback).toHaveClass('text-danger');
    });
  return promise;
});

test('network error', () => {
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
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');
  nock('https://allorigins.hexlet.app')
    .get((uri) => uri.includes('lorem-rss.herokuapp'))
    .reply(200, {
      contents: badRss,
    });

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
    .then(() => waitFor(() => expect(elements.input).toHaveClass('is-invalid')))
    .then(() => {
      expect(elements.feedback).toHaveTextContent('Ресурс не содержит валидный RSS');
      expect(elements.feedback).toHaveClass('text-danger');
    });

  return promise;
});
