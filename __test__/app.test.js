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

test('empty field', () => {
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');
  
  user.click(elements.button)
    .then(() => {
      expect(elements.input).toHaveClass('is-invalid');
      expect(elements.feedback).toHaveTextContent('Пожалуйста, заполните поле');
      expect(elements.feedback).toHaveClass('text-danger');
    });
});

test('wrong url', () => {
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  user.type(elements.input, 'wrong url')
    .then(() => {
      user.click(elements.button);
    })
    .then(() => {
      expect(elements.input).toHaveClass('is-invalid');
      expect(elements.feedback).toHaveTextContent('Ссылка должна быть валидным URL');
      expect(elements.feedback).toHaveClass('text-danger');
    })
});

test('success add from init state and add same url', () => {
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  userEvent.type(elements.input, 'https://ru.hexlet.io/lessons.rss')
    .then(() => {
      user.click(elements.button);
    })
    .then(() => {
      expect(elements.feedback).toHaveTextContent('RSS успешно загружен');
      expect(elements.feedback).toHaveClass('text-success');
      expect(elements.input).not.toHaveClass('is-invalid');
      expect(elements.input).not.toHaveValue();
      expect(elements.input).toHaveFocus();
    })
    .then(() => {
      user.type(elements.input, 'https://ru.hexlet.io/lessons.rss')
    })
    .then(() => {
      user.click(elements.button);
    })
    .then(() => {
      expect(elements.input).toHaveClass('is-invalid');
      expect(elements.feedback).toHaveTextContent('RSS уже существует');
      expect(elements.feedback).toHaveClass('text-danger');
    })
})

test('success add after error', () => {
  expect(elements.feedback).toBeEmptyDOMElement();
  expect(elements.input).not.toHaveClass('is-invalid');

  user.click(elements.button)
    .then(() => {
      user.type(elements.input, 'https://ru.hexlet.io/lessons.rss')
    })
    .then(() => {
      user.click(elements.button)
    })
    .then(() => {
      expect(elements.feedback).toHaveTextContent('RSS успешно загружен');
      expect(elements.feedback).toHaveClass('text-success');
      expect(elements.input).not.toHaveClass('is-invalid');
      expect(elements.input).not.toHaveValue();
      expect(elements.input).toHaveFocus();
    })
})

