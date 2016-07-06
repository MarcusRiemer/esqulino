BUNDLE_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "bundle")')
YARD_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "yard")')

SOURCES = $(shell find . -not -path '*/\.*' -iname "*.rb")

# Install ruby dependencies
install-deps : msg-pre-deps-install has-bundle
	$(BUNDLE_BIN) install

# Run using a built-in ruby server
run : has-bundle
	$(BUNDLE_BIN) exec rackup

# Run unit tests
test :
	ruby project.test.rb

# Generate the latest documentation
doc : has-yard
	$(YARD_BIN) doc $(SOURCES)

# Used during development: Shows which ruby entities require documentation
dev-doc : has-yard
	$(YARD_BIN) stats --list-undoc $(SOURCES)

.PHONY : dev-doc doc install-deps run test

##################################
# Messaging targets
##################################

msg-pre-deps-install :
	@tput setaf 2; echo "## Server: Installing dependencies"; tput sgr0


include ../Makefile.common
