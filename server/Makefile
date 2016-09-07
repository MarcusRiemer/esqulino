BUNDLE_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "bundle")')
YARD_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "yard")')
RERUN_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "rerun")')

SOURCES = $(shell find . -not -path '*/\.*' -iname "*.rb")

# Install ruby dependencies
install-deps : msg-pre-deps-install has-bundle
	$(BUNDLE_BIN) install

# Run using a built-in ruby server
#
# TODO: Apparently `RACK_ENV` is technically not the correct variable to use,
#       even if sinatra encourages this [0]. But this might change once [1]
#       is merged.
#
# [0] http://www.sinatrarb.com/intro.html#Environments
# [1] https://github.com/sinatra/sinatra/pull/984
run : has-bundle
	RACK_ENV="production" $(BUNDLE_BIN) exec rackup

# Run a built-in server that refreshes itself if relevant files chage
run-dev : has-dev-rerun has-bundle
	$(RERUN_BIN) --dir ".,./../schema/" --pattern "**/*.{rb,json}" -- $(BUNDLE_BIN) exec rackup

# Run unit tests
test :
	ruby project.test.rb

# Generate the latest documentation
doc : has-yard msg-pre-doc
	@$(YARD_BIN) doc $(SOURCES)

# Remove generated documentation
doc-clean : msg-pre-doc-clean
	rm -rf ../doc/server/

# Used during development: Shows which ruby entities require documentation
dev-doc : has-yard
	$(YARD_BIN) stats --list-undoc $(SOURCES)

##################################
# Maintenance targets
##################################

# Uses the CLI to migrate projects.
#
# TODO: Use dynamic data directory
migrate-projects:
	./esqulino-cli.rb --data-dir ../data/dev/ --migrate 

##################################
# Messaging targets
##################################

msg-pre-deps-install :
	@tput setaf 2; echo "## Server : Installing dependencies"; tput sgr0

msg-pre-doc :
	@tput setaf 2; echo "## Server : Generating documentation"; tput sgr0

msg-pre-doc-clean :
	@tput setaf 2; echo "## Server : Cleaning documentation"; tput sgr0

# Ensures the rerurn "binary" is available
has-dev-rerun :
ifeq (, $(wildcard $(RERUN_BIN)))
	$(error "Ruby script restarter (rerun) not in gems")
endif

.PHONY : dev-doc doc install-deps run test migrate-projects

include ../Makefile.common
