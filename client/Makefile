BUILD_DIR = ../dist/client/
CLIENT_DIR = ./

include Makefile.files

# We expect SASS to be a gem
SASS_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "sass")')

# We expect the following tools to be provided by npm
TSC_BIN = node_modules/typescript/bin/tsc
PROTRACTOR_BIN = node_modules/protractor/bin/protractor
WEBDRIVER_MANAGER_BIN = node_modules/protractor/bin/webdriver-manager

# Meta target: Build the client part of the application.
all : dist-sass dist-compile dist-templates dist-vendor dist-node

# Uses the `package.json` file to grab all dependencies
install-deps : msg-pre-deps-install has-npm
	npm install

# Remove everything that has been downloaded by `install-deps`
clean-deps: msg-pre-deps-clean
	rm -rf node_modules

# Meta target: Compiles all SASS files
dist-sass : msg-pre-sass $(DIST_CSS_FILES)

# Actually compile SASS files
$(DIST_CSS_FILES) : $(SASS_FILES)
	@mkdir -p $(addprefix $(BUILD_DIR), /app/css)
	$(SASS_BIN) --sourcemap=none --style=expanded app/css/style.scss $@

# Meta target: "Compile" templates
dist-templates: msg-pre-templates $(DIST_HTML_FILES)

# Actually copy HTML templates
$(DIST_HTML_FILES) : $(HTML_FILES)
	@mkdir -p $(BUILD_DIR)
	cp --parents $^ $(BUILD_DIR)

# Meta target: Compile Typescript files
dist-compile: msg-pre-compile $(DIST_JS_FILES)

# Actually compile Typescript files. This always happens in a single
# batch, never individually per file
$(DIST_JS_FILES) : $(TS_FILES) tsconfig.json
	$(TSC_BIN) --project .

# Meta target: "Compile" vendor files
dist-vendor: msg-pre-vendor $(DIST_VENDOR_FILES)

# Actually copy vendor files
$(DIST_VENDOR_FILES) : $(VENDOR_FILES)
	@mkdir -p $(BUILD_DIR)
	cp --parents $^ $(BUILD_DIR)

# Meta target: "Compile" node.js dependencies
dist-node: msg-pre-node $(DIST_NODE_FILES)

# Actually copy node.js dependencies
$(DIST_NODE_FILES) : $(NODE_FILES)
	@mkdir -p $(BUILD_DIR)
	@echo "Copying loads of dist files ..."
	@cp --parents $^ $(BUILD_DIR)

##################################
# Test targets
##################################

webdriver-manager-update:
	$(WEBDRIVER_MANAGER_BIN) update

webdriver-manager-start:
	$(WEBDRIVER_MANAGER_BIN) start

test-e2e: msg-pre-test-e2e
	$(PROTRACTOR_BIN) test-protractor-conf.js $(E2E_ARGS)

##################################
# Messaging targets
##################################

msg-pre-deps-clean :
	@tput setaf 2; echo "## Client : Cleaning dependencies"; tput sgr0

msg-pre-deps-install :
	@tput setaf 2; echo "## Client : Installing dependencies"; tput sgr0

msg-pre-compile :
	@tput setaf 2; echo "## Client : Running Typescript Compiler"; tput sgr0

msg-pre-node :
	@tput setaf 2; echo "## Client : Copying node.js-dependencies"; tput sgr0

msg-pre-sass :
	@tput setaf 2; echo "## Client : Running SASS Compiler"; tput sgr0	

msg-pre-templates :
	@tput setaf 2; echo "## Client : Copying HTML-Templates"; tput sgr0

msg-pre-vendor :
	@tput setaf 2; echo "## Client : Copying vendor-dependencies"; tput sgr0

msg-pre-test-e2e :
	@tput setaf 2; echo "## Test   : Running end-to-end tests"; tput sgr0

.PHONY : clean clean-deps dist dist-sass dist-templates dist-compile dist-vendor dist-node install-deps test-e2e test-reset webdriver-manager-update

include ../Makefile.common
