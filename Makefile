install:
	npm ci

devserver:
	npx webpack-dev-server --open

devbuild:
	rm -rf dist
	NODE_ENV=development npx webpack

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .