include ../common.mk

NPM := npm

.PHONY: init dev build preview clean

default: build

init:
	@$(NPM) install

dev:
	@bun --no-env-file dev --host

build:
	@bun --no-env-file run build

preview:
	$(NPM) run preview

clean:
	@rm -rf public