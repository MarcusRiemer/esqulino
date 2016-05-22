all : client/libs-bundle.js client/app-bundle.js

client/libs-bundle.js : client/systemjs.config.js
	cd client && node ../bundle.deps.js

client/app-bundle.js : client/systemjs.config.js
	cd client && node ../bundle.app.js

clean :
	rm -rf client/*

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install

# Ensures the npm "binary" is available
has-npm :
ifeq (, $(shell which npm 2>/dev/null))
	$(error "Node Paketmanager (npm) not in PATH")
endif

