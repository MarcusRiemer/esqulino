# Install ruby dependencies
install-deps : msg-pre-deps-install
	$(BUNDLE_BIN) install

# Running in production mode
run :
	RAILS_ENV=production ./bin/rails server

# Running in development mode, this mode
# attempts to reload changed code
run-dev :
	./bin/rails server
