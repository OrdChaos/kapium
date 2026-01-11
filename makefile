include common.mk

TOOLS_DIR := tools
SSG_DIR := ssg
SCRIPTS_DIR := scripts
FRONTEND_DIR := frontend

.PHONY: all toolchain data pre-rendered clean

all: toolchain data pre-rendered render

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
	@cp -r $(SSG_OUTPUT_DIR)/pages/* $(FRONTEND_DIR)/public/data
	@cp -r $(SSG_OUTPUT_DIR)/posts/* $(FRONTEND_DIR)/public/data/posts

	$(MAKE) -C $(FRONTEND_DIR)

clean:
	@rm -rf $(BUILD_DIR)
	$(MAKE) -C $(FRONTEND_DIR) clean