######## BUILDING THE RAILS SERVER ############

# Install the base ruby image
FROM ruby:3.1.4-bullseye as ruby-base

# Install Updates
RUN apt update && apt install -y

# Install other system level package dependencies that cant be installed from the gemfile
# including nodejs (v18) to serve the compiled angular client distribution

RUN apt-get update
RUN apt-get install -y npm graphviz libmagic-dev ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update
RUN apt-get install nodejs -y


# The package manager of ruby that is needed to install gem dependencies
RUN gem install bundler

RUN apt-get update && apt-get install -y gnupg2

# Install Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN curl -sS -o - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN apt install -y ./google-chrome-stable_current_amd64.deb

 # Install Firefox
RUN apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils --assume-yes
RUN wget -nv -O ~/FirefoxSetup.tar.bz2 "https://download.mozilla.org/?product=firefox-latest&os=linux64"
RUN tar xjf ~/FirefoxSetup.tar.bz2 -C /opt/
RUN ln -s /opt/firefox/firefox /usr/local/bin/firefox
# RUN export PATH=$PATH:/opt/firefox/



# RUN mkdir -p /blattwerkzeug/schema

