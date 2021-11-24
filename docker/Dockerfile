FROM debian
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        ruby \
        ruby-bundler \
        ruby-dev \
        libpq-dev \
        imagemagick \
        libmagickcore-dev \
        libmagickwand-dev \
        magic \
        libmagic-dev \
        graphviz \
        sqlite3 \
        libsqlite3-dev \
        sqlite3-pcre \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get update && \
	apt-get install -y curl && \
	curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
	apt-get install -y nodejs
RUN apt-get install -y --reinstall build-essential
RUN apt-get install -y git
RUN git clone https://tinf103898@bitbucket.org/marcusriemer/esqulino.git
RUN mkdir -p ./esqulino/data/prod/projects
RUN echo n | TPUT_BIN=/bin/false make --directory /esqulino/client install-deps
RUN make --directory /esqulino/client cli-compile
RUN make --directory /esqulino/client client-compile
RUN TPUT_BIN=/bin/false make --directory /esqulino/server install-deps
COPY ./entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
CMD ["make", "--directory", "/esqulino/server", "run"]
