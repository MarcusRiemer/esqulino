######## BUILDING THE ANGULAR CLIENT ##########
# NOTE: The build may fail if low on memory. 
# Make sure to allocate enough memory for the container (recommended 4GB).

# Install from the base nodejs image 
FROM node:18-bullseye 

# Install updates
RUN apt update 

RUN mkdir -p /blattwerkzeug/schema

# Copy the package dependencies and install them with npm as well as the source files.
# Note: angular will also be installed as a dependency
WORKDIR /blattwerkzeug/client/

COPY client/package.json client/package-lock.json ./
RUN npm install

# Copy the sorce code. 
COPY client/ ./

# Build the angular application.
RUN ["npx", "ng", "build"]