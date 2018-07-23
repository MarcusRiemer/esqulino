# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

NG_BIN = node_modules/.bin/ng
TSC_BIN = node_modules/.bin/tsc
NODE_BIN = node

BUNDLE_FILES = $(shell find dist/browser -iregex ".*\.\(js\|css\|svg\|eot\|ttf\)" 2> /dev/null)
BUNDLE_FILES_GZIP = $(addsuffix .gz, $(BUNDLE_FILES))

CLIENT_ALL_SOURCES = $(shell find src 2> /dev/null) server.ts webpack.server.config.js package.json package-lock.json

TEST_SINGLE_RUN ?= true
TEST_BROWSERS   ?= ChromeHeadless,FirefoxHeadless

all : dist

clean : msg-pre-clean
	rm -rf dist

dist: client-compile cli-compile universal-compile

dist-dev: client-compile cli-compile universal-compile

##################################
# Webclient
##################################
client-compile : msg-pre-build
	$(NG_BIN) build --aot --prod $(NG_OPTS)

client-compile-dev : msg-pre-build
	$(NG_BIN) build --aot $(NG_OPTS)

client-test :
	$(NG_BIN) test --browsers $(TEST_BROWSERS) --code-coverage true

client-test-watch:
	$(NG_BIN) test --watch --browsers $(TEST_BROWSERS) --code-coverage true

##################################
# Commandline Client
##################################
dist/cli/main.cli.js : $(CLIENT_ALL_SOURCES)
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling (Commandline Build) ..."; $(TPUT_BIN) sgr0
	$(TSC_BIN) --target ES5 --lib ES2017 --outDir dist/cli src/main.cli.ts		

cli-compile: dist/cli/main.cli.js

cli-run: dist/cli/main.cli.js
	@$(NODE_BIN) $^

cli-update-grammars: cli-compile
	echo '{ "type": "updateGrammars", "serverBaseUrl": "http://localhost:9292" }' | $(NODE_BIN) dist/cli/main.cli.js

cli-update-block-languages: cli-compile
	echo '{ "type": "updateBlockLanguages", "serverBaseUrl": "http://localhost:9292" }' | $(NODE_BIN) dist/cli/main.cli.js

##################################
# Universal Rendering Server
##################################
dist/server.js: $(CLIENT_ALL_SOURCES)
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling (Universal Build) ..."; $(TPUT_BIN) sgr0
	$(NG_BIN) run blattwerkzeug-client:server
	node_modules/.bin/webpack --config webpack.server.config.js --progress

universal-run: dist/server.js
	-@$(TPUT_BIN) setaf 2; echo "## Client : Running Universal Server ..."; $(TPUT_BIN) sgr0
	$(NODE_BIN) dist/server.js

universal-compile: dist/server.js

%.gz : %
	gzip --keep $^

gzipped-bundles : $(BUNDLE_FILES_GZIP)

gzipped-clean :
	rm -f $(BUNDLE_FILES_GZIP)

##################################
# Dependencies
##################################

# Uses the `package.json` file to grab all dependencies according to the
# `package-lock.json`.
install-deps : msg-pre-install-deps
	npm ci

# Remove currently cached dependencies.
clean-deps : msg-pre-clean-deps
	rm -rf "node_modules"

##################################
# Messaging targets
##################################

msg-pre-build :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling ..."; $(TPUT_BIN) sgr0

msg-pre-clean :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Cleaning ..."; $(TPUT_BIN) sgr0

msg-pre-clean-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Cleaning dependencies ..."; $(TPUT_BIN) sgr0

msg-pre-install-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Installing dependencies ..."; $(TPUT_BIN) sgr0

.PHONY : all clean dist dist-dev msg-pre-build msg-pre-build-universal video-stills
