include ../common.mk

NPM := npm
BUN := bun

DIST := ../build/dist

.PHONY: init dev build preview clean

default: build

init:
	@$(NPM) install

build:
	@$(BUN) --no-env-file run build

dev:
	@$(BUN) dev --host

clean:
	@rm -rf public