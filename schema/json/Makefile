# Path to the clients source and its project file
SRC_PATH = $(realpath ../../client/src/app)
SRC_PROJECT = $(realpath ../../client/src/tsconfig.app.json)

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

##################################
# Messaging targets
##################################
msg-pre-clean-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Schema : Cleaning Dependencies ..."; $(TPUT_BIN) sgr0

msg-pre-clean :
	-@$(TPUT_BIN) setaf 2; echo "## Schema : Cleaning ..."; $(TPUT_BIN) sgr0

msg-pre-schema :
	-@$(TPUT_BIN) setaf 2; echo "## Schema : Re-Generating out-of-date schemas ..."; $(TPUT_BIN) sgr0

.PHONY : all clean install-deps msg-pre-schema

include ../../Makefile.common
