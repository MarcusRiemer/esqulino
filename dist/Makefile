CLIENT_DIR = ../client/
BUILD_DIR  = ./client/

include $(addprefix $(CLIENT_DIR), Makefile.files)

##################################
# Bundling targets
##################################
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

##################################
# Publishing targets
##################################

# TODO: Technically the clients JS files shouldn't be part of this.
#       But sadly the e2e tests rely on their existence.
PUBLISHED_FILES = $(DIST_HTML_FILES) $(DIST_JS_FILES) $(DIST_CSS_FILES) $(DIST_VENDOR_FILES) $(DIST_PUBLISHED_NODE_FILES) client/app-bundle.js client/lib-bundle.js

CLIENT_ARCHIVE_FILE = esqulino-client.tar
CLIENT_ARCHIVE_FILE_BZ2 = $(CLIENT_ARCHIVE_FILE).bz2
CLIENT_ARCHIVE_FILE_GZ = $(CLIENT_ARCHIVE_FILE).gz

ALL_ARCHIVE_FILES = $(CLIENT_ARCHIVE_FILE) $(CLIENT_ARCHIVE_FILE_BZ2) $(CLIENT_ARCHIVE_FILE_GZ)

archive-client: client-app-bundle client-lib-bundle msg-pre-archive-client $(CLIENT_ARCHIVE_FILE_BZ2) $(CLIENT_ARCHIVE_FILE_GZ)

$(CLIENT_ARCHIVE_FILE) : $(PUBLISHED_FILES)
	@echo Creating new .tar archive ...
	@rm -f $@
	@tar cf $@ $(PUBLISHED_FILES) 2> /dev/null

# For some reason an additional `touch` is required, otherwise the
# timestamps are too similar (?) and the archive is built over and
# over again.
$(CLIENT_ARCHIVE_FILE_BZ2) : $(CLIENT_ARCHIVE_FILE)
	bzip2 --keep --force $^ && touch $@

$(CLIENT_ARCHIVE_FILE_GZ) : $(CLIENT_ARCHIVE_FILE)
	gzip --keep --force $^ && touch $@

# This target uses an archive in the place of the client folder.
# Very useful to ensure that actually packaged code is tested.
archive-use : archive-client msg-pre-archive-use
	rm -rf client/*
	tar xf $(CLIENT_ARCHIVE_FILE)

##################################
# Maintenance targets
##################################
clean : msg-pre-app-clean clean-archives
	rm -rf $(realpath client)/*

clean-archives:
	rm -f $(ALL_ARCHIVE_FILES)

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

##################################
# Messaging targets
##################################

msg-pre-app-clean :
	@tput setaf 2; echo "## Dist   : Cleaning"; tput sgr0

msg-pre-app-bundle :
	@tput setaf 2; echo "## Dist   : Bundling client"; tput sgr0

msg-pre-lib-bundle :
	@tput setaf 2; echo "## Dist   : Bundling client dependencies"; tput sgr0

msg-pre-archive-client :
	@tput setaf 2; echo "## Dist   : Archiving minimal client"; tput sgr0

msg-pre-archive-use :
	@tput setaf 2; echo "## Dist   : Using archived client"; tput sgr0


include ../Makefile.common

