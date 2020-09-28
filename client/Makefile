# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common
include ../schema/graphql/Makefile

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
CLIENT_ALL_SOURCES = $(shell find src ! -name 'version.ts' 2> /dev/null) angular.json package.json package-lock.json

# All sources except the translation files
CLIENT_NON_XLF_SOURCES = $(filter-out %.xlf, $(CLIENT_ALL_SOURCES))
# All sources except generated files
CLIENT_NON_GENERATED_SOURCES = $(filter-out src/generated/%, $(CLIENT_NON_XLF_SOURCES))

TEST_SINGLE_RUN ?= true
TEST_BROWSERS   ?= ChromeHeadless,FirefoxHeadless

# Default to production build in complete build
NG_PROD         ?= --prod

# Targets that may be used in the `dist` target have some special flags
DIST_FLAGS      ?= --no-progress

all : dist

clean : msg-pre-clean
	rm -rf dist
	rm -f src/environments/version.ts

dist: client-compile cli-compile universal-compile

##################################
# Webclient
##################################

client-compile : msg-pre-build src/environments/version.ts
	$(NG_BIN) build --aot --localize --outputPath="dist/browser" $(NG_PROD) $(DIST_FLAGS)

client-compile-dev : msg-pre-build src/environments/version.ts
	$(NG_BIN) build --aot --localize --outputPath="dist/browser" --watch

##################################
# Commandline Client
##################################
dist/cli/main.cli.js : $(CLIENT_NON_GENERATED_SOURCES) src/environments/version.ts
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

universal-compile:
	-@$(TPUT_BIN) setaf 2; echo "## Client : Compiling (Universal Build) ..."; $(TPUT_BIN) sgr0
	$(NG_BIN) run blattwerkzeug-client:server $(DIST_FLAGS)

universal-run: universal-compile
	-@$(TPUT_BIN) setaf 2; echo "## Client : Running Universal Server ..."; $(TPUT_BIN) sgr0
	$(NG_BIN) run blattwerkzeug-client:serve-ssr

##################################
# Testing
##################################

test : src/environments/version.ts
	$(NG_BIN) test --browsers $(TEST_BROWSERS) --code-coverage true

test-watch: src/environments/version.ts
	$(NG_BIN) test --watch --browsers $(TEST_BROWSERS) --code-coverage true

# Backward compatability
client-test: test
client-test-watch: test-watch


##################################
# Preparing assets
##################################

%.gz : %
	gzip --keep $^

gzipped-bundles : $(BUNDLE_FILES_GZIP)

gzipped-clean :
	rm -f $(BUNDLE_FILES_GZIP)

##################################
# Translation
##################################

src/locale/messages.xlf : $(CLIENT_NON_XLF_SOURCES)
	$(NG_BIN) xi18n --output-path locale

src/locale/messages.en.xlf : src/locale/messages.xlf
	$(NG_BIN) run "blattwerkzeug-client:xliffmerge"

update-xlf : src/locale/messages.en.xlf

##################################
# GraphQL Client Generation
##################################

src/generated/graphql.ts : ../schema/graphql/schema.json $(GRAPHQL_QUERY_SOURCES)
	npm run graphql-codegen
	# Horrible hack to generate an appropriate constructor, will hopefully be obsoleted by
	# https://github.com/dotansimha/graphql-code-generator/issues/4366
	sed -i "s/Document;/Document;\n  constructor(apollo: Apollo.Apollo) { super(apollo); }/g" $@
	npx prettier --write "src/generated/**/*.{html,ts}"

generate-graphql-client: src/generated/graphql.ts

GIT_LS_CHANGED_FILES = git ls-files --modified $(JSON_SCHEMA_FILES)

verify-cached-schemas:
	@make -B generate-graphql-client
	@test -z "`$(GIT_LS_CHANGED_FILES)`" || (git --no-pager diff; echo "There are modified schema files"; $(GIT_LS_CHANGED_FILES); exit 1) >&2

# Ensures that the GraphQL-Client can be compiled
verify-compile-graphql-client: src/generated/graphql.ts
	npx tsc --noEmit --experimentalDecorators --target "es5" $^

##################################
# Dependencies
##################################

# Ensures that all required packages are available
install-deps : msg-pre-install-deps
	npm install --no-save

# Uses the `package.json` file to grab all dependencies according to the
# `package-lock.json`. Previously installed packages will be deleted.
reinstall-deps: msg-pre-install-deps
	npm ci

# Remove currently cached dependencies.
clean-deps : msg-pre-clean-deps
	rm -rf "node_modules"

##################################
# Code Hygiene
##################################

# Run the currently configured formatting toolset
format-code:
	npx prettier --write "src/**/*.{html,ts}"

# Verify that the coding style is sound
verify-format-code:
	npx prettier --check "src/**/*.{html,ts}"

##################################
# Revision tracking file
##################################

# This file is used to tag each and every build that was made. This allows to
# match logged errors to different states of the codebase.
src/environments/version.ts :
	./gen-git-revision.ts.sh > $@


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

.PHONY : test test-watch all clean dist dist-dev msg-pre-build msg-pre-build-universal video-stills format-code src/environments/version.ts
