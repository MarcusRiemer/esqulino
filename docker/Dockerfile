FROM node as builder
RUN curl -L https://bitbucket.org/marcusriemer/esqulino/get/HEAD.tar.gz > tmp_git.tar.gz    
RUN mkdir esqulino && tar --extract --strip-components=1 --file tmp_git.tar.gz --directory esqulino && rm tmp_git.tar.gz
RUN TPUT_BIN=/bin/false make --directory /esqulino/client install-deps
RUN TPUT_BIN=/bin/false make --directory /esqulino/client cli-compile
RUN TPUT_BIN=/bin/false make --directory /esqulino/client client-compile

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
        build-essential \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*
#RUN apt-get install -y --reinstall build-essential
COPY --from=builder /esqulino ./esqulino
RUN mkdir -p ./esqulino/data/prod/projects
RUN TPUT_BIN=/bin/false make --directory /esqulino/server install-deps
ENTRYPOINT ["/entrypoint.sh"]
COPY ./entrypoint.sh /
