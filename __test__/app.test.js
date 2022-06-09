/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';

const user = userEvent.setup();
const url = 'https://ru.hexlet.io/lessons.rss';
let elements;

beforeEach(() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const pathToFixture = path.join(__dirname, '__fixtures__', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;
  app();

  elements = {
    button: screen.getByText(/Добавить/),
    input: screen.getByRole('textbox', { name: /url/ }),
    feedback: screen.getByTestId('feedback'),
  };
});

test('success adding', () => {
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  const promise = user.type(elements.input, url)
    .then(() => user.click(elements.button))
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

  const promise = user.click(elements.button)
    .then(() => user.type(elements.input, url))
    .then(() => user.click(elements.button))
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
