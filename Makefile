install: # установка зависимостей
		npm install

lint: # проверка кода
		npx eslint .

test:
	npm test -s

develop:
		npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack