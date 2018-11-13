FROM node:8

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install yarn
RUN npm install -g truffle

# Install other dependencies
RUN npm install

# Bundle app source
COPY . .

ENTRYPOINT ["npm", "run", "build-and-run-dev"]