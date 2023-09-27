# Install the base ruby image
FROM ruby:3.1.4-bullseye

# Install Updates
RUN apt update && apt install -y

# Install other system level package dependencies that cant be installed from the gemfile
RUN apt install libmagic-dev

# Copy the source Gemfiles of your application on the new image: 
WORKDIR /blattwerkzeug/rails_app

# The package manager of ruby that is needed to install gem dependencies
RUN gem install bundler

# Copy extra folders that are needed by the application
COPY schema/ schema
COPY data/ data

# Copy the source Gemfiles of your application on the new image: 
WORKDIR /blattwerkzeug/rails_app/server
COPY server/Gemfile server/Gemfile.lock ./

# Install the gem dependencies defined in the Gemfiles. 
RUN bundle install

# Copy the source code of the application 
COPY server/ .

# Define the port mapping
EXPOSE 3000

# Define the Environment variables: 
CMD ["rails","server", "-b", "0.0.0.0"] 
# CMD ["rails","server", "-b", "0.0.0.0"] 