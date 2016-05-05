include Makefile.json

all : $(JSON_SCHEMA_FILES)

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

# Removes all generated schema files
clean :
	rm -f $(JSON_SCHEMA_FILES)

.PHONY : all clean

# Ensures the npm "binary" is available
has-npm :
ifeq (, $(shell which npm 2>/dev/null))
	$(error "Node Paketmanager (npm) not in PATH")
endif

