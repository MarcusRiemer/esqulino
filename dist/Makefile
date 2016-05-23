CLIENT_DIR = ../client/
BUILD_DIR  = ./client/

include $(addprefix $(CLIENT_DIR), Makefile.files)

all : client-lib-bundle client-app-bundle

client-app-bundle : msg-pre-app-bundle client-lib-bundle client/app-bundle.js
client-lib-bundle : msg-pre-lib-bundle client/lib-bundle.js

# For some reason the systemjs bundler only works when run in the directory
# it is told to bundle.
client/lib-bundle.js : $(DIST_NODE_FILES)
	cd client && node ../bundle.deps.js

# For some reason the systemjs bundler only works when run in the directory
# it is told to bundle.
client/app-bundle.js : $(DIST_JS_FILES)
	cd client && node ../bundle.app.js

clean :
	rm -rf client/*

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

##################################
# Messaging targets
##################################

msg-pre-app-bundle :
	@tput setaf 2; echo "## Dist  : Bundling client"; tput sgr0

msg-pre-lib-bundle :
	@tput setaf 2; echo "## Dist  : Bundling client dependencies"; tput sgr0


include ../Makefile.common

