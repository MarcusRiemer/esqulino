BUNDLE_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "bundle")')

install-deps :
	$(BUNDLE_BIN) install

run :
	$(BUNDLE_BIN) exec rackup

.PHONY : run install-deps
