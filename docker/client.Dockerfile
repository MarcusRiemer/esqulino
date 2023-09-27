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