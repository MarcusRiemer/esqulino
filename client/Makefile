SASS_FILES      = $(shell find app -iname "*.scss")
DIST_CSS_FILES  = $(addprefix ../dist/client/, $(SASS_FILES:.scss=.css))

SASS_BIN = $(shell ruby -e 'puts File.join(Gem.user_dir, "bin", "sass")')

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
watch : has-grunt
	grunt watch

# Creates relevant dist dirs
dev-mk-dist-dirs :
	mkdir -p ../dist/client/app/css

# One-shot compilation.
compile : has-grunt compile-sass
	grunt default

# Compiles all SASS files
compile-sass : dev-mk-dist-dirs $(DIST_CSS_FILES)

$(DIST_CSS_FILES) : $(SASS_FILES)
	sass --sourcemap=none $^ $@

# Removes the dist/client directory which is one level upwards.
# This is probably not very good style, but required to ensure
# that `make clean compile` actually sets of with an empty folder.
clean :
	rm -rf ../dist/client

# Remove everything that has been downloaded by `install-deps`
clean-deps:
	rm -rf node_modules typings

# Ensures the npm "binary" is available
has-npm :
ifeq (, $(shell which npm 2>/dev/null))
	$(error "Node Paketmanager (npm) not in PATH")
endif

# Ensures the npm "binary" is available
has-grunt :
ifeq (, $(shell which grunt 2>/dev/null))
	$(error "Grunt Taskrunner (grunt) not in PATH")
endif

has-sass :
ifeq (, $(wildcard $(SASS_BIN)))
	$(error "SASS CSS preprocessor not in PATH")
endif

.PHONY : all clean clean-deps compile dev-mk-dist-dirs has-grunt has-npm has-sass install-deps watch
