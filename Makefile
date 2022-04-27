install: # установка зависимостей
		npm install

publish: # публикация пакета
		npm publish --dry-run

lint: # проверка кода
		npx eslint .