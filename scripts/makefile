include ../common.mk

SCRIPTS_DIR := src

NODE := node
NPM := npm

.PHONY: all init

all:
	$(NODE) $(SCRIPTS_DIR)/code.js $(SSG_OUTPUT_DIR)/posts
	$(NODE) $(SCRIPTS_DIR)/auto-spacing.js $(SSG_OUTPUT_DIR)/posts
	$(NODE) $(SCRIPTS_DIR)/math.js $(SSG_OUTPUT_DIR)/posts


init:
	$(NPM) install