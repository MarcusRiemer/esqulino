# Path to the clients source and its project file
SRC_PATH = $(realpath ../../client/src/app)
SRC_PROJECT = $(realpath ../../client/src/tsconfig.app.json)

GIT_LS_CHANGED_FILES = git ls-files --modified $(JSON_SCHEMA_FILES)

include Makefile.json

# Generating all schemas
all : msg-pre-schema $(JSON_SCHEMA_FILES)

# Uses the `package.json` file to grab all dependencies according to the
# `package-lock.json`.
install-deps :
	npm ci

# Remove everything that has been downloaded by `install-deps`
clean-deps : msg-pre-clean-deps
	rm -rf "node_modules"

# Removes all generated schema files
clean : msg-pre-clean
	rm -f $(JSON_SCHEMA_FILES)

# Ensures that no files have been modified after running the generator again
verify-cached-schemas :
	@make -j -B all
	@test -z "`$(GIT_LS_CHANGED_FILES)`" || (git --no-pager diff; echo "There are modified schema files"; $(GIT_LS_CHANGED_FILES); exit 1) >&2

##################################
# Messaging targets
##################################
msg-pre-clean-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Schema : Cleaning Dependencies ..."; $(TPUT_BIN) sgr0

msg-pre-clean :
	-@$(TPUT_BIN) setaf 2; echo "## Schema : Cleaning ..."; $(TPUT_BIN) sgr0

msg-pre-schema :
	-@$(TPUT_BIN) setaf 2; echo "## Schema : Re-Generating out-of-date schemas ..."; $(TPUT_BIN) sgr0

.PHONY : all clean install-deps msg-pre-schema verify-cached-schemas

include ../../Makefile.common
