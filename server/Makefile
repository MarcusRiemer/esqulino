BUNDLE_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "bundle")')
YARD_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "yard")')

# Install ruby dependencies
install-deps : has-bundle
	$(BUNDLE_BIN) install

# Run using a built-in ruby server
run : has-bundle
	$(BUNDLE_BIN) exec rackup

# Run unit tests
test :
	ruby project.test.rb

# Generate the latest documentation
doc : has-yard
	$(YARD_BIN) doc

# Used during development: Shows which ruby entities require documentation
dev-doc : has-yard
	$(YARD_BIN) doc --list-undoc

# Ensures the bundle "binary" is available
has-bundle :
ifeq (, $(wildcard $(BUNDLE_BIN)))
	$(error "Ruby Bundler (bundle) not in PATH")
endif

# Ensures the yard "binary" is available
has-yard :
ifeq (, $(wildcard $(BUNDLE_BIN)))
	$(error "Ruby documentation generation (yard) not in PATH")
endif


.PHONY : dev-doc doc has-bundle has-yard install-deps run test
