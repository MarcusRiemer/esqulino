BUNDLE_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "bundle")')
YARD_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "yard")')


install-deps :
	$(BUNDLE_BIN) install

run :
	$(BUNDLE_BIN) exec rackup

doc :
	$(YARD_BIN) doc

.PHONY : run install-deps doc
