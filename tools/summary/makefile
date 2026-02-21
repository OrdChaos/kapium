include ../../common.mk

BIN_DIR := $(BUILD_DIR)/tools/summary

CXX := g++
C := gcc
CFLAGS := -lssl -lcrypto -Wall -Wextra -O2 -g -I.
LDFLAGS :=
LDLIBS :=

SRCS := $(shell find . -type f \( -name '*.c' -o -name '*.cpp' -o -name '*.cc' \) | sort)
SRCS_NO_DOT := $(patsubst ./%,%,$(SRCS))

OBJS_NO_DOT := $(patsubst %.c,%.o,$(patsubst %.cpp,%.o,$(patsubst %.cc,%.o,$(SRCS_NO_DOT))))
OBJS := $(addprefix $(BIN_DIR)/,$(OBJS_NO_DOT))

TARGET := $(BIN_DIR)/summary

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	@mkdir -p $(dir $@)
	$(CXX) -o $@ $(OBJS) $(LDLIBS) $(CFLAGS) $(LDFLAGS)

$(BIN_DIR)/%.o: %.cpp
	@mkdir -p $(dir $@)
	$(CXX) -c $< -o $@ $(CFLAGS)

$(BIN_DIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(C) -c $< -o $@ $(CFLAGS)

clean:
	@rm -rf $(BIN_DIR)