watch-tsc :
	cd client && npm run "tsc:w"

run-server :
	cd server && rackup config.ru

all-doc :
	make -C doc/elaboration thesis

.PHONY : run

