# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

NG_BIN = node_modules/.bin/ng
NGC_BIN = node_modules/.bin/ngc
NODE_BIN = node

BUNDLE_FILES = $(shell find dist/ -iname "*bundle*.js" 2> /dev/null)
BUNDLE_FILES_GZIP = $(addsuffix .gz, $(BUNDLE_FILES))

TEST_SINGLE_RUN ?= true
TEST_BROWSERS   ?= ChromeHeadless

all : dist

clean : msg-pre-clean
	rm -rf dist

dist : msg-pre-build
	$(NG_BIN) build --prod $(NG_OPTS)
	$(NGC_BIN)

dist-dev : msg-pre-build
	$(NG_BIN) build $(NG_OPTS)

install-deps : msg-pre-install-deps
	npm install

test :
	$(NG_BIN) test --single-run $(TEST_SINGLE_RUN) --browser $(TEST_BROWSERS) --code-coverage true

clean-deps : msg-pre-clean-deps
	rm -rf "node_modules"

##################################
# Universal Rendering
##################################

universal-run:
	$(NODE_BIN) dist/server.js

universal-compile:
	node_modules/.bin/ng build --prod --app 1 --output-hashing=false
	node_modules/.bin/webpack --config webpack.server.config.js --progress

%.gz : %
	gzip --keep $^

gzipped-bundles : $(BUNDLE_FILES_GZIP)

gzipped-clean :
	rm -f $(BUNDLE_FILES_GZIP)

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

.PHONY : all clean dist dist-dev msg-pre-build video-stills
