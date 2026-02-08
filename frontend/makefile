include ../common.mk

NPM := npm
BUN := bun

.PHONY: init dev build preview clean

default: build

init:
	@$(NPM) install

build:
	@bun --no-env-file run build

dev:
	@$(BUN) dev --host

clean:
	@rm -rf public