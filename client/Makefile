BUILD_DIR = ../dist/client/

SASS_FILES      = $(shell find app -iname "*.scss")
DIST_CSS_FILES  = $(addprefix $(BUILD_DIR), $(SASS_FILES:.scss=.css))

HTML_FILES = $(shell find app -iname "*.html") index.html test.html
DIST_HTML_FILES = $(addprefix $(BUILD_DIR), $(HTML_FILES))

TS_FILES = $(shell find app -iname "*.ts") 
DIST_JS_FILES = $(addprefix $(BUILD_DIR), $(TS_FILES:.ts=.js))

VENDOR_FILES = $(shell find vendor -type f)
DIST_VENDOR_FILES = $(addprefix $(BUILD_DIR), $(VENDOR_FILES))

# The node files dependencies are painstakingly managed by hand
# because we don't want to bloat the dist archive.
NODE_FILES = systemjs.config.js \
             node_modules/es6-shim/es6-shim.min.js \
			 node_modules/zone.js/dist/zone.js\
             node_modules/reflect-metadata/Reflect.js \
             node_modules/systemjs/dist/system.src.js \
             $(shell find node_modules/rxjs -iname "*.js") \
			 $(shell find node_modules/@angular -iname "*.js") \
			 node_modules/jasmine-core/lib/jasmine-core/jasmine.js \
             node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js \
	         node_modules/jasmine-core/lib/jasmine-core/boot.js \
             node_modules/jasmine-core/lib/jasmine-core/jasmine.css

DIST_NODE_FILES = $(addprefix $(BUILD_DIR), $(NODE_FILES))

SASS_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "sass")')
TSC_BIN = node_modules/typescript/bin/tsc
PROTRACTOR_BIN = node_modules/protractor/bin/protractor
WEBDRIVER_MANAGER_BIN = node_modules/protractor/bin/webdriver-manager

# Meta target: Build the client part of the application.
dist : dist-sass dist-compile dist-templates dist-vendor dist-node

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

# Meta target: Compiles all SASS files
dist-sass : msg-pre-sass $(DIST_CSS_FILES)

# Actually compile SASS files
$(DIST_CSS_FILES) : $(SASS_FILES)
	@mkdir -p ../dist/client/app/css
	$(SASS_BIN) --sourcemap=none --style=expanded $^ $@

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

# Removes the dist/client directory which is one level upwards.
# This is probably not very good style, but required to ensure
# that `make clean compile` actually sets of with an empty folder.
clean :
	rm -rf ../dist/client

# Remove everything that has been downloaded by `install-deps`
clean-deps:
	rm -rf node_modules typings


##################################
# Test targets
##################################

webdriver-manager-update:
	$(WEBDRIVER_MANAGER_BIN) update

webdriver-manager-start:
	$(WEBDRIVER_MANAGER_BIN) start

protractor-run:
	$(PROTRACTOR_BIN) test-protractor-conf.js

##################################
# Ensural targets
##################################

# Ensures the npm "binary" is available
has-npm :
ifeq (, $(shell which npm 2>/dev/null))
	$(error "Node Paketmanager (npm) not in PATH")
endif

# Ensure the sass "binary" is available
has-sass :
ifeq (, $(wildcard $(SASS_BIN)))
	$(error "SASS CSS preprocessor not in PATH")
endif

# Ensure the tsc "binary" is part of the node_modules folder
has-tsc :
ifeq (, $(wildcard $(TSC_BIN)))
	$(error "Typescript Compiler (tsc) not in node_modules")
endif

##################################
# Utility targets
##################################

msg-pre-compile :
	@tput setaf 2; echo \#\# Running Typescript Compiler; tput sgr0

msg-pre-node :
	@tput setaf 2; echo \#\# Copying node.js-dependencies; tput sgr0

msg-pre-sass :
	@tput setaf 2; echo \#\# Running SASS Compiler; tput sgr0	

msg-pre-templates :
	@tput setaf 2; echo \#\# Copying HTML-Templates; tput sgr0

msg-pre-vendor :
	@tput setaf 2; echo \#\# Copying vendor-dependencies; tput sgr0

.PHONY : clean clean-deps dist dist-sass dist-templates dist-compile dist-vendor dist-node has-npm has-sass install-deps watch webdriver-manager-update
