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
# Create the working directories 
#WORKDIR /blattwerkzeug/rails_app

# nichts kopieren, Ziel: kein apt mehr in ci yml, aber kein bundle/npm install im dockerfile

# The package manager of ruby that is needed to install gem dependencies
RUN gem install bundler



RUN mkdir -p /blattwerkzeug/schema

# Copy the package dependencies and install them with npm as well as the source files.
# Note: angular will also be installed as a dependency
#WORKDIR /blattwerkzeug/client/
#
#COPY client/package.json client/package-lock.json ./



# Setup the database
# RUN bundle exec rails db:setup

# Run the Rspec test suite
# RUN bundle exec rspec spec