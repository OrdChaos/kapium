include ../../common.mk

BIN_DIR := $(BUILD_DIR)/tools/abbrlink/

CXX := g++
C := gcc
CFLAGS := -lssl -lcrypto -Wall -Wextra -O2 -g -I.
LDFLAGS :=
LDLIBS :=

SRCS := $(shell find . -type f \( -name '*.c' -o -name '*.cpp' -o -name '*.cc' \) | sort)
SRCS_NO_DOT := $(patsubst ./%,%,$(SRCS))

OBJS_NO_DOT := $(patsubst %.c,%.o,$(patsubst %.cpp,%.o,$(patsubst %.cc,%.o,$(SRCS_NO_DOT))))
OBJS := $(addprefix $(BIN_DIR)/,$(OBJS_NO_DOT))

TARGET := $(BIN_DIR)/abbrlink

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	@mkdir -p $(dir $@)
	$(CXX) $(CFLAGS) $(LDFLAGS) -o $@ $(OBJS) $(LDLIBS)

$(BIN_DIR)/%.o: %.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CFLAGS) -c $< -o $@

$(BIN_DIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(C) $(CFLAGS) -c $< -o $@

clean:
	@rm -rf $(BIN_DIR)