install:
	npm ci

develop:
	npm run dev

lint:
	npx eslint src

lint-fix:
	npx eslint src --fix
	
build:
	NODE_ENV=production npm run build

test:
	echo no tests
