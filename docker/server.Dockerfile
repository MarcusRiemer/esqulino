######## BUILDING THE RAILS SERVER ############

# Install the base ruby image
FROM ruby:3.1.4-bullseye

# Install Updates
RUN apt update && apt install -y

# Install other system level package dependencies that cant be installed from the gemfile
RUN apt install libmagic-dev

# Install nodejs (v18) to serve the compiled angular client distribution

RUN apt update
RUN apt install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key |  gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt update
RUN apt install nodejs -y

# Create the working directories 
WORKDIR /blattwerkzeug/rails_app

# The package manager of ruby that is needed to install gem dependencies
RUN gem install bundler

# Copy the source Gemfiles of your application on the new image: 
WORKDIR /blattwerkzeug/rails_app/server
COPY server/Gemfile server/Gemfile.lock ./

# Install the gem dependencies defined in the Gemfiles. 
RUN bundle install

# Copy the source code of the application 
COPY server/ .

# Copy dependency folders
WORKDIR /blattwerkzeug/rails_app

# Copy the built image of the angular client 
COPY --from=blattwerkzeug-client:latest /blattwerkzeug/client/dist ./client/dist

# Copy extra folders that are needed by the application. 
COPY schema/ ./schema

# Create the data folder structure for saving data.
RUN mkdir -p data/dev/projects 

# Copy the seed folder, allowing to populate the database with the necessary seed data. 
COPY seed/ ./seed

# Define the port mapping
EXPOSE 9292

# Define the Environment variables: 

# Entrypoint script for seeding the database and starting the rails server. 
COPY docker/server-development-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Start the rails server
#CMD ["rails", "server", "-b", "0.0.0.0", "-p", "9292"] 