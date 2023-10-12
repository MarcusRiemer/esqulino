######## BUILDING THE ANGULAR CLIENT ##########
# NOTE: This image requires at least 5GB of memory, or the build will fail.

# Install from the base nodejs image 
FROM node:18-bullseye AS angular_client

# Install updates
RUN apt update 

# Install the angular cli 
# TODO: Is this really needed? 
RUN npm install -g @angular/cli

# Copy extra folders that are needed by the application. 
# TODO: It is probably better be better to add these folders with and external volume. Need to clarify with Marcus.  
COPY schema /blattwerkzeug/schema


# Copy the package dependencies and install them with npm as well as the source files
WORKDIR /blattwerkzeug/client/
COPY client/ ./
RUN npm install

# Change the working directory and start the angular application
WORKDIR /blattwerkzeug/client/

RUN ["npx", "ng", "build"]

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

# Start creating the working directories 
WORKDIR /blattwerkzeug/rails_app

# The package manager of ruby that is needed to install gem dependencies
RUN gem install bundler

# Copy extra folders that are needed by the application. 
COPY schema/ schema

# TODO: Add these files with an external volume
COPY data/ data 


############# Seed folder copy into image ###################



# Copy the source Gemfiles of your application on the new image: 
WORKDIR /blattwerkzeug/rails_app/server
COPY server/Gemfile server/Gemfile.lock ./

# Install the gem dependencies defined in the Gemfiles. 
RUN bundle install

# Copy the source code of the application 
COPY server/ .

# Copy the built image of the angular client 
COPY --from=angular_client /blattwerkzeug/client/dist ../client/dist

# Define the port mapping
EXPOSE 9292

# Define the Environment variables: 

######## Load Seed data for the regex project ################


CMD ["rails","server", "-b", "0.0.0.0", "-p", "9292"] 