.PHONY: dev check test dogfood build doctor

dev:
	npm run dev -- --host 127.0.0.1

check:
	npm run format:check
	npm run lint
	npm run build

test:
	npm run test:e2e

dogfood:
	npm run test:e2e

build:
	npm run build

doctor:
	node --version
	npm --version
	npm ls --depth=0
