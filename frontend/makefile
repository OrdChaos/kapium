include ../common.mk

NPM := npm

DIST := ../build/dist

.PHONY: init dev build preview clean

default: build

init:
	@$(NPM) install

build:
	@$(NPM) run build

dev:
	@$(NPM) run dev --host

clean:
	@rm -rf public