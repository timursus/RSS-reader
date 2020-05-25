devserver:
	npx webpack-dev-server --open

install:
	npm ci

dev:
	rm -rf dist
	NODE_ENV=development npx webpack

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .