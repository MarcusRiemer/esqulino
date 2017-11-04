# This Makefile used to be a complex behemont, but now simply wraps
# the Rails CLI

include ../Makefile.common

# Install ruby dependencies
install-deps : msg-pre-install-deps
	bundle install --path vendor/bundle

clean-deps : msg-pre-clean-deps
	rm -rf "./vendor"

# Running in production mode
run : msg-pre-run-prod
	RAILS_ENV=production ./bin/rails server --port 9292

# Running in development mode, this mode
# attempts to reload changed code
run-dev : msg-pre-run-dev
	./bin/rails server -b 0.0.0.0 --port 9292

# Running tests
test : msg-pre-run-test
	./bin/rails test

.PHONY : install-deps run run-dev test clean-deps

##################################
# Messaging targets
##################################

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
