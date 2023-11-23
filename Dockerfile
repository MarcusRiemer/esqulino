######## BUILDING THE RAILS SERVER ############

# Install the base ruby image
FROM ruby:3.1.4-bullseye

# Install Updates
RUN apt update && apt install -y

# Install other system level package dependencies that cant be installed from the gemfile
# including nodejs (v18) to serve the compiled angular client distribution
RUN apt update
RUN apt install -y nodejs graphviz libmagic-dev ca-certificates curl gnupg

RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key |  gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

# Create the working directories 
WORKDIR /blattwerkzeug/rails_app

# Copy the source Gemfiles of your application on the new image:
COPY . .

# The package manager of ruby that is needed to install gem dependencies
RUN gem install bundler

# Install the gem dependencies defined in the Gemfiles.
WORKDIR /blattwerkzeug/rails_app/server
RUN bundle install

# Setup the database
# RUN bundle exec rails db:setup

# Run the Rspec test suite
# RUN bundle exec rspec spec