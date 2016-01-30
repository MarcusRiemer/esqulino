install-deps :
	make -C server install-deps

watch-client :
	cd client && npm run "tsc:w"

run-server :
	make -C server run

all-doc :
	make -C doc/elaboration thesis

.PHONY : install-deps watch-client run-server all-doc

