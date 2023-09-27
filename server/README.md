# README

* Building the image: 

´´´
    docker image build -t esqulino_rails_server -f docker/server.Dockerfile .

* Running a container from the image: 

´´´
    docker container run -p 9292:3000 -it esqulino_server

