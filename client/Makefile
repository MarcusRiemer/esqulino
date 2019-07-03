# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

# Various tools may be installed in different locations
# * npm dependencies should not be installed globally
# * Some platforms call the "node" binary "nodejs"
NG_BIN = node_modules/.bin/ng
TSC_BIN = node_modules/.bin/tsc
XLIFFMERGE_BIN = node_modules/.bin/xliffmerge
NODE_BIN = node

BUNDLE_FILES = $(shell find dist/browser -iregex ".*\.\(js\|css\|svg\|eot\|ttf\)" 2> /dev/null)
BUNDLE_FILES_GZIP = $(addsuffix .gz, $(BUNDLE_FILES))

# All files that together define the client in its various forms
# The `version.ts` file is excluded because it is automatically generated
# and shouldn't trigger a rebuild.
CLIENT_ALL_SOURCES = $(shell find src ! -name 'version.ts' 2> /dev/null) universal-server.ts webpack.server.config.js package.json package-lock.json

# All sources except the translation files
CLIENT_NON_XLF_SOURCES = $(filter-out %.xlf, $(CLIENT_ALL_SOURCES))

TEST_SINGLE_RUN ?= true
TEST_BROWSERS   ?= ChromeHeadless,FirefoxHeadless

# Default to german locale in dev build
NG_LOCALE       ?= de
# Default to production build in complete build
NG_PROD         ?= --prod

all : dist

clean : msg-pre-clean
	rm -rf dist
	rm -f src/environments/version.ts

dist: client-compile cli-compile universal-compile

dist-dev: client-compile cli-compile universal-compile

##################################
# Revision tracking file
##################################

# This file is used to tag each and every build that was made. This allows to
# match logged errors to different states of the codebase.
src/environments/version.ts :
	./gen-git-revision.ts.sh > $@

##################################
# Webclient
##################################

client-compile : msg-pre-build client-compile-de client-compile-en

client-compile-de : src/environments/version.ts
	$(NG_BIN) build --aot --no-progress $(NG_PROD) $(NG_OPTS) --outputPath="dist/browser/de"

client-compile-en : src/environments/version.ts
	$(NG_BIN) build --aot --no-progress $(NG_PROD) $(NG_OPTS) --i18nFile="src/locale/messages.en.xlf" --i18nFormat="xlf"  --i18nLocale="en" --outputPath="dist/browser/en"

client-compile-dev : msg-pre-build src/environments/version.ts
	$(NG_BIN) build --aot  $(NG_OPTS) --i18n-locale $(NG_LOCALE) --outputPath="dist/browser/$(NG_LOCALE)"

client-test : src/environments/version.ts
	$(NG_BIN) test --browsers $(TEST_BROWSERS) --code-coverage true

client-test-watch: src/environments/version.ts
	$(NG_BIN) test --watch --browsers $(TEST_BROWSERS) --code-coverage true

##################################
# Commandline Client
##################################
dist/cli/main.cli.js : $(CLIENT_NON_XLF_SOURCES) src/environments/version.ts
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling (Commandline Build) ..."; $(TPUT_BIN) sgr0
	$(TSC_BIN) -p src/tsconfig.cli.json

dist/cli/bundle.cli.js : dist/cli/main.cli.js
	node_modules/.bin/webpack --config webpack.cli.config.js

cli-compile: dist/cli/main.cli.js dist/cli/bundle.cli.js

cli-run: dist/cli/main.cli.js
	@$(NODE_BIN) $^

cli-ping: cli-compile
	echo '{ "type": "ping" }' | $(NODE_BIN) dist/cli/main.cli.js

##################################
# Universal Rendering Server
##################################

# The german Angular universal app
dist/server/de/server.js: $(CLIENT_NON_XLF_SOURCES)
	$(NG_BIN) run blattwerkzeug-client:server --no-progress

# The english Angular universal app
dist/server/en/server.js: $(CLIENT_NON_XLF_SOURCES)
	$(NG_BIN) run blattwerkzeug-client:server --no-progress --i18nFile="src/locale/messages.en.xlf" --i18nFormat="xlf" --i18nLocale="en" --outputPath="dist/server/en"

# German version of the universal server
universal-de: dist/server/de/server.js

# English version of the universal server
universal-en: dist/server/en/server.js

# The Angular universal server that does the actual rendering and routing
dist/server/universal-server.js: universal-server.ts universal-compile-langs
	node_modules/.bin/webpack --config webpack.server.config.js --no-progress

universal-compile-langs: dist/server/de/server.js dist/server/en/server.js

universal-compile: msg-pre-universal-build universal-compile-langs client-compile dist/server/universal-server.js

universal-run: dist/server/universal-server.js
	-@$(TPUT_BIN) setaf 2; echo "## Client : Running Universal Server ..."; $(TPUT_BIN) sgr0
	$(NODE_BIN) dist/server/universal-server.js

universal-run-nodeps:
	-@$(TPUT_BIN) setaf 2; echo "## Client : Running Universal Server ..."; $(TPUT_BIN) sgr0
	$(NODE_BIN) dist/server/universal-server.js

%.gz : %
	gzip --keep $^

gzipped-bundles : $(BUNDLE_FILES_GZIP)

gzipped-clean :
	rm -f $(BUNDLE_FILES_GZIP)

##################################
# Translation
##################################

src/locale/messages.xlf : $(CLIENT_NON_XLF_SOURCES)
	$(NG_BIN) xi18n --i18n-locale de --output-path locale

src/locale/messages.en.xlf : src/locale/messages.xlf
	$(NG_BIN) run "blattwerkzeug-client:xliffmerge"

update-xlf : src/locale/messages.en.xlf

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

msg-pre-universal-build :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling (Universal Build) ..."; $(TPUT_BIN) sgr0

msg-pre-build :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling ..."; $(TPUT_BIN) sgr0

msg-pre-clean :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Cleaning ..."; $(TPUT_BIN) sgr0

msg-pre-clean-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Cleaning dependencies ..."; $(TPUT_BIN) sgr0

msg-pre-install-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Client : Installing dependencies ..."; $(TPUT_BIN) sgr0

.PHONY : all clean dist dist-dev msg-pre-build msg-pre-build-universal video-stills src/environments/version.ts
