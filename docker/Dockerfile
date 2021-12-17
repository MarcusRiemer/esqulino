#Creat a throw away container to compile the client
FROM node:lts as builder_client
#Download and extract the complet sources
RUN curl -L https://bitbucket.org/marcusriemer/esqulino/get/HEAD.tar.gz > tmp_git.tar.gz    
RUN mkdir esqulino && tar --extract --strip-components=1 --file tmp_git.tar.gz --directory esqulino && rm tmp_git.tar.gz
#Install all dependencies for the client
RUN TPUT_BIN=/bin/false make --directory /esqulino/client install-deps
#Compile the client
RUN TPUT_BIN=/bin/false make --directory /esqulino/client cli-compile
#Creat the special version of the client for the server
RUN TPUT_BIN=/bin/false make --directory /esqulino/client client-compile

#Container for the Server
FROM ruby
#Install the required package and clean up
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        libpq-dev \
        imagemagick \
        libmagickcore-dev \
        libmagickwand-dev \
        magic \
        libmagic-dev \
        graphviz \
        sqlite3 \
        libsqlite3-dev \
        sqlite3-pcre &&\
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
#Copy source and client
COPY --from=builder_client /esqulino ./esqulino
#Creat a empty direcory which is required for the application
RUN mkdir -p ./esqulino/data/prod/projects
#Install all dependencies for the server
RUN TPUT_BIN=/bin/false make --directory /esqulino/server install-deps
#Set up the script as the entrypoint
COPY ./entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
