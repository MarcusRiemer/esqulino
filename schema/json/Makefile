# Path to the clients source and its project file
SRC_PATH = $(realpath ../../client/src/app)
SRC_PROJECT = $(realpath ../../client/src/tsconfig.json)

# The absolute path of the directory the schemas reside in
SCHEMA_PATH = $(realpath .)

include Makefile.json

# Generating all schemas
all : msg-pre-schema $(JSON_SCHEMA_FILES)

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

# Remove everything that has been downloaded by `install-deps`
clean-deps :
	rm -rf "node_modules"

# Removes all generated schema files
clean : msg-pre-clean
	rm -f $(JSON_SCHEMA_FILES)

##################################
# Messaging targets
##################################

msg-pre-clean :
	@tput setaf 2; echo "## Schema : Cleaning ..."; tput sgr0

msg-pre-schema :
	@tput setaf 2; echo "## Schema : Re-Generating out-of-date schemas ..."; tput sgr0

.PHONY : all clean install-deps msg-pre-schema

include ../../Makefile.common
