ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

-include $(ROOT_DIR)/.env
export $(shell [ -f .env ] && sed 's/=.*//' .env)

BUILD_DIR := $(ROOT_DIR)/build

SOURCES_DIR := sources
POSTS_DIR := $(SOURCES_DIR)/posts
STATIC_DIR := $(SOURCES_DIR)/static

SSG_OUTPUT_DIR := $(BUILD_DIR)/datas

export ROOT_DIR BUILD_DIR SOURCES_DIR POSTS_DIR SSG_OUTPUT_DIR