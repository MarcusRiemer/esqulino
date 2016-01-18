watch-tsc :
	cd client && npm run "tsc:w"

run-server :
	cd server && rackup config.ru

.PHONY : run

