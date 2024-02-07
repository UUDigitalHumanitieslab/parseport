FROM node:20.11 as builder

# Create app directory
RUN mkdir /angular-app

# Set the working directory
WORKDIR /angular-app

# Copy app dependencies
COPY package.json yarn.lock /angular-app/

# Install Yarn
# RUN npm install -g yarn

# Install app dependencies
RUN yarn install

# Copy app source files
COPY . /angular-app

# Pass configuration options to build
ARG CONFIGURATION=production

# Build app
RUN npm run build build -- --output-path=./dist/out --configuration $CONFIGURATION

# Setup NGINX to serve the app
FROM nginx:alpine

# Copy the built app to the NGINX server
COPY --from=builder /angular-app/dist/out/browser /usr/share/nginx/html

# Copy the NGINX configuration file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port for the NGINX server
EXPOSE 80