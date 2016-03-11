TS_FILES = $(shell find app -iname "*.ts")
TS_JS_FILES = $(TS_FILES:.ts=.js)
TS_JS_MAP_FILES = $(TS_FILES:.ts=.js.map)

ALL_JS_FILES = $(shell find app -iname "*.js")
ALL_JS_MAP_FILES = $(ALL_JS_FILES:.js=.js.map)

# Compile by default
all : compile

# Uses the `package.json` file to grab all dependencies
install-deps : has-npm
	npm install
# This is a godawful hack, but for some reason grunt-ts
# does not correctly pick up the exclude property of the
# tsconfig.json.
	rm -rf typings/main*

# Continously watches the .ts files for changes and recompiles
# them on the fly. Useful during development.
watch :
	grunt watch

# One-shot compilation.
compile :
	grunt default

# Removes the dist/client directory which is one level upwards.
# This is probably not very good style, but required to ensure
# that `make clean compile` actually sets of with an empty folder.
clean :
	rm -rf ../dist/client

# Ensures the npm "binary" is available
has-npm :
ifeq (, $(shell which npm 2>/dev/null))
	$(error "Node Paketmanager (npm) ist nicht im PATH")
endif

.PHONY : all install-deps watch compile clean clean-all has-npm
