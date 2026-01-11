include ../common.mk

NPM := npm

.PHONY: init dev build clean

default: build

init:
	@$(NPM) install

dev:
	@bun dev --host

build:
	@bun run build

clean:
	@rm -rf public