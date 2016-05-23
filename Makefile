# This makefile does not much work itself, but it routes the available targets
# to the specific targets for server, client or whatever. If you want to e.g.
# ONLY install dependencies for the client, change to the `client` folder
# first and call `install-deps` there.

# All those "entering directory" messages are usually just visual clutter,
# but in case something path-related goes horribly wrong during compilation
# this is the escape hatch to easily add the messages back in.
SUBDIR_MAKE = @make --no-print-directory -C

# Installs libraries this project depends on. For this to actually work,
# you will need to have npm (for the client) and bundle (for the server)
# installed.
install-deps :
	$(SUBDIR_MAKE) server install-deps
	$(SUBDIR_MAKE) client install-deps
	$(SUBDIR_MAKE) dist install-deps

# One-shot compilation of all things that are around
dist :
	$(SUBDIR_MAKE) schema/json all
	$(SUBDIR_MAKE) client all
	$(SUBDIR_MAKE) dist all

clean :
	$(SUBDIR_MAKE) schema/json clean
	$(SUBDIR_MAKE) dist clean

# Reverts the test project to the most recent state in git
test-reset: msg-pre-test-reset
	git checkout -- $(shell git rev-parse --show-toplevel)/data/dev/test
	cd $(shell git rev-parse --show-toplevel)/data/dev/test && git clean -f

# Runs end to end tests. This relies on two other servers that must be
# running already:
# * The esqulino webserver
# * The Selenium testdriver
test-e2e : dist
	$(SUBDIR_MAKE) client test-e2e

# Runs the server in development mode, this is probably not a good idea to
# do in a productive environment. It simply uses a built-in Sinatra server,
# which probably will be webrick.
server-run :
	$(SUBDIR_MAKE) server run

# Compile every part of the documentation, including the thesis.
doc :
	$(SUBDIR_MAKE) server doc
	$(SUBDIR_MAKE) doc/thesis all
	$(SUBDIR_MAKE) doc/swagger all

##################################
# Development targets
##################################

# Used during development: Prettyprints all available JSON Files, the use of
# sponge is basically a substitute for "jq . < {} > {}" (in place editing of
# the same file).
# BEWARE: If any of the input files is not syntactically valid JSON (this
# *includes* quoted keys) the output file will be empty.
dev-pretty-json-data :
	find data -iname "*.json" -exec bash -c 'jq . < {} | sponge {}' \;

# Used during development: Strips all trailing whitespace from "own"
# sourcefiles.
dev-delete-trailing-whitespace :
	find client/app \( -name '*.ts' -o -name '*.html' -o -name '*.scss' \) -exec sed --in-place 's/[[^:space]]\+[[:space:]]\+$$//' {} \+
	find server -type f \( -name '*.rb' \) -exec sed --in-place 's/[[^:space]]\+[[:space:]]\+$$//' {} \+

##################################
# Message targets
##################################

msg-pre-test-reset :
	@tput setaf 2; echo "## Test  : Resetting test project"; tput sgr0

.PHONY : all clean dev-delete-trailing-whitespace dev-pretty-json-data doc install-deps server-run dist

