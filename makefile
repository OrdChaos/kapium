include common.mk

TOOLS_DIR := tools
SSG_DIR := ssg
SCRIPTS_DIR := scripts
FRONTEND_DIR := frontend

NPX := npx

.PHONY: all init toolchain data pre-rendered preview clean

all: toolchain data pre-rendered render

init:
	$(MAKE) -C $(SCRIPTS_DIR) init
	$(MAKE) -C $(FRONTEND_DIR) init

toolchain:
	$(MAKE) -C $(TOOLS_DIR)
	$(MAKE) -C $(SSG_DIR)

data:
	$(BUILD_DIR)/tools/abbrlink/abbrlink $(POSTS_DIR)
	@if [ -z "$$DASHSCOPE_API_KEY" ]; then \
		echo "Warning: DASHSCOPE_API_KEY is not set. API calls will fail."; \
	fi
	$(BUILD_DIR)/tools/summary/summary $(POSTS_DIR)
	$(BUILD_DIR)/ssg/ssg $(POSTS_DIR) $(SSG_OUTPUT_DIR)

pre-rendered:
	$(MAKE) -C $(SCRIPTS_DIR)

render:
	@mkdir -p $(FRONTEND_DIR)/public/data/posts
	@cp -r $(STATIC_DIR)/* $(FRONTEND_DIR)/public
	@cp -r $(SSG_OUTPUT_DIR)/info/* $(FRONTEND_DIR)/public
	@cp -r $(SSG_OUTPUT_DIR)/data/* $(FRONTEND_DIR)/public/data
	@cp -r $(SSG_OUTPUT_DIR)/posts/* $(FRONTEND_DIR)/public/data/posts

	$(MAKE) -C $(FRONTEND_DIR)

preview: all
	$(NPX) serve -s $(BUILD_DIR)/dist

clean:
	@rm -rf $(BUILD_DIR)
	$(MAKE) -C $(FRONTEND_DIR) clean