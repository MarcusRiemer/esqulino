SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

GRAPHQL_RUBY_SOURCES = $(shell find $(SELF_DIR)../../server/app/graphql -name "*.rb" 2> /dev/null | xargs realpath)
GRAPHQL_QUERY_SOURCES = $(shell find $(SELF_DIR) -name "*.graphql" 2> /dev/null | xargs realpath)

$(SELF_DIR)schema.json : $(GRAPHQL_RUBY_SOURCES)
	make -C $(SELF_DIR)../../server generate-graphql-schema

debug-grapqhl-print-paths:
	@echo "### Query Sources"
	@echo $(GRAPHQL_QUERY_SOURCES)
	@echo "### Ruby Sources"
	@echo $(GRAPHQL_RUBY_SOURCES)