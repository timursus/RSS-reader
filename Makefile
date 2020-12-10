install:
	npm ci

devserver:
	npx webpack serve --open http://localhost:4200/

devbuild:
	rm -rf dist
	NODE_ENV=development npx webpack

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .