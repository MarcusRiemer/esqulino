# This Makefile used to be a complex behemont, but now simply wraps
# the Rails CLI

include ../Makefile.common

RAILS_ENV ?= development
BUNDLE_BIN ?= bundle

# Install ruby dependencies
install-deps : msg-pre-install-deps
	bundle install

# Running in production mode
run : msg-pre-run-prod
	PING_IDE_SERVICE=true RAILS_ENV=production RACK_HANDLER=falcon $(BUNDLE_BIN) exec rails server --port 9292

# Running in development mode, this mode attempts to reload changed code
run-dev : msg-pre-run-dev
	PING_IDE_SERVICE=true RACK_HANDLER=falcon $(BUNDLE_BIN) exec rails server -b 0.0.0.0 --port 9292

# Ensures that there is a correctly named and structured database available
setup-database-schema:
	$(BUNDLE_BIN) exec rails "db:setup"

# Running tests
test : msg-pre-run-test
	$(BUNDLE_BIN) exec rails spec

# Helpful during development: Continously watches for changes in the project
# and re-runs tests that are affected by code changes
test-watch:
	$(BUNDLE_BIN) exec guard --plugin=RSpec

# Updates (or initially creates) the live data in the system in the system from
# a dump that has been previously created.
load-live-data:
	$(BUNDLE_BIN) exec rails "blattwerkzeug:role:load_all" \
                    "blattwerkzeug:user:load_all" \
                    "blattwerkzeug:programming_language:load_all" \
                    "blattwerkzeug:project:load_all" \
                    "blattwerkzeug:news:load_all"

# This operation is used to extract all data out of this server instance.
store-live-data:
	$(BUNDLE_BIN) exec rails "blattwerkzeug:programming_language:store_all" \
                    "blattwerkzeug:project:store_all" \
                    "blattwerkzeug:news:store_all" \
                    "blattwerkzeug:role:store_all" \
                    "blattwerkzeug:user:store_all"

# Removes every trace of data from the live system
delete-live-data: msg-pre-reset-live-data
	$(BUNDLE_BIN) exec rails "blattwerkzeug:file_storage:delete_all" "db:reset"

reset-live-data: delete-live-data load-live-data

# Promote the guest oder to an administrator, only works on development instances
dev-make-guest-admin:
	$(BUNDLE_BIN) exec rails "blattwerkzeug:dev:make_guest_admin"

# Export the GraphQL schema as currently defined by the server
generate-graphql-schema:
	$(BUNDLE_BIN) exec rake graphql:schema:json --trace

.PHONY : install-deps run run-dev test clean-deps

##################################
# Messaging targets
##################################

msg-pre-reset-live-data:
	-@$(TPUT_BIN) setaf 2; echo "## Server : Deleting live data ..."; $(TPUT_BIN) sgr0

msg-pre-install-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Server : Installing dependencies ..."; $(TPUT_BIN) sgr0

msg-pre-clean-deps :
	-@$(TPUT_BIN) setaf 2; echo "## Server : Cleaning dependencies ..."; $(TPUT_BIN) sgr0

msg-pre-run-dev :
	-@$(TPUT_BIN) setaf 2; echo "## Server : Running Rails in development mode ..."; $(TPUT_BIN) sgr0

msg-pre-run-prod :
	-@$(TPUT_BIN) setaf 2; echo "## Server : Running Rails in production mode ..."; $(TPUT_BIN) sgr0

msg-pre-run-test :
	-@$(TPUT_BIN) setaf 2; echo "## Server : Running tests ..."; $(TPUT_BIN) sgr0
