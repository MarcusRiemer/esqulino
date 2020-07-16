SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

GRAPHQL_RUBY_SOURCES = $(shell find $(SELF_DIR)../../server/app/graphql -name "*.rb" 2> /dev/null | xargs realpath)

$(SELF_DIR)schema.json : $(GRAPHQL_RUBY_SOURCES)
	make -C $(SELF_DIR)../../server generate-graphql-schema