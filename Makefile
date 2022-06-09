install: # установка зависимостей
		npm install

lint: # проверка кода
		npx eslint .

test:
	npm test -s

test-coverage:
	npm test -- --coverage --coverageProvider=v8

develop:
		npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack