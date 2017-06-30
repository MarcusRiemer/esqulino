# Install ruby dependencies
install-deps : msg-pre-install-deps
	bundle install

clean-deps : msg-pre-clean-deps
	rm -rf ./vendor

# Running in production mode
run : msg-pre-run-prod
	RAILS_ENV=production ./bin/rails server

# Running in development mode, this mode
# attempts to reload changed code
run-dev : msg-pre-run-dev 
	./bin/rails server

# Running tests
test : msg-pre-run-test
	./bin/rails test

.PHONY : install-deps run run-dev test clean-deps

##################################
# Messaging targets
##################################

msg-pre-install-deps :
	@tput setaf 2; echo "## Server : Installing dependencies ..."; tput sgr0

msg-pre-clean-deps :
	@tput setaf 2; echo "## Server : Cleaning dependencies ..."; tput sgr0

msg-pre-run-dev :
	@tput setaf 2; echo "## Server : Running Rails in development mode ..."; tput sgr0

msg-pre-run-prod :
	@tput setaf 2; echo "## Server : Running Rails in production mode ..."; tput sgr0

msg-pre-run-test :
	@tput setaf 2; echo "## Server : Running tests ..."; tput sgr0
