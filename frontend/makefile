include ../common.mk

NPM := npm
BUN := bun

.PHONY: init dev build preview clean

default: build

init:
	@$(NPM) install

build:
	@bun --no-env-file run build

preview:
	@$(NPM) run preview

dev:
	@$(BUN) dev --host

clean:
	@rm -rf public