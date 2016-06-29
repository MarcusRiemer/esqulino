# Ugly hack to grab the correct path of the typescript-json-schema "binary"
# Taken from: http://blog.jgc.org/2007/01/what-makefile-am-i-in.html
where-am-i = $(dir $(CURDIR)/$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST)))

# Path to the clients source and its project file
SRC_PATH = $(realpath ../../client/app/shared)
SRC_PROJECT = $(realpath ../../client/tsconfig.json)

# The absolute path of the directory the schemas reside in
SCHEMA_PATH = $(realpath $(call where-am-i))

# Full path of typescript-json-schema
TYPESCRIPT_JSON_SCHEMA_BIN = node --stack-size=65500 $(SCHEMA_PATH)/node_modules/typescript-json-schema/bin/typescript-json-schema
SCHEMA_OPTIONS = --noExtraProps true

# Names of the schema files to generate
JSON_SCHEMA_FILE_NAMES = PageDescription.json PageUpdateRequestDescription.json ProjectDescription.json ProjectListDescription.json QueryResultDescription.json QueryParamsDescription.json ArbitraryQueryRequestDescription.json QueryUpdateRequestDescription.json QueryDescription.json RequestErrorDescription.json

# Paths of the schema files to generate
JSON_SCHEMA_FILES = $(addprefix $(SCHEMA_PATH)/, $(JSON_SCHEMA_FILE_NAMES))

# Generating all schemas
all : msg-pre-schema $(JSON_SCHEMA_FILES)

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

# Removes all generated schema files
clean :
	rm -f $(JSON_SCHEMA_FILES)

##################################
# Messaging targets
##################################

msg-pre-schema :
	@tput setaf 2; echo \#\# Schema: Re-Generating out-of-date schemas; tput sgr0

.PHONY : all clean install-deps msg-pre-schema

include ../../Makefile.common
include Makefile.json
