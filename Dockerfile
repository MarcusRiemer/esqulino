######## BUILDING THE RAILS SERVER, NODE AND ALL OTHER DEPENDENCIES ############

# Install the base ruby image
FROM ruby:3.1.4-bullseye

# Install other system level package dependencies that cant be installed from the gemfile
RUN apt-get update
RUN apt-get install -y npm graphviz libmagic-dev ca-certificates curl gnupg2

# install nodejs (v18) to serve the compiled angular client distribution (by default apt-get, a too old version would be installed)
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y

# install bundler which is needed to install ruby gem dependencies
RUN gem install bundler

# Install Chrome and Firefox for client testing
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN curl -sS -o - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN apt install -y ./google-chrome-stable_current_amd64.deb

RUN wget -nv -O ~/FirefoxSetup.tar.bz2 "https://download.mozilla.org/?product=firefox-latest&os=linux64"
RUN tar xjf ~/FirefoxSetup.tar.bz2 -C /opt/
RUN ln -s /opt/firefox/firefox /usr/local/bin/firefox
