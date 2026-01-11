include ../common.mk

TARGETS := abbrlink summary

.PHONY: all abbrlink summary clean

all: $(TARGETS)

abbrlink:
	$(MAKE) -C abbrlink

summary:
	$(MAKE) -C summary

clean:
	@rm -rf $(BUILD_DIR)/tools