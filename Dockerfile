FROM ubuntu
WORKDIR /app

RUN apt update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_18.19.1 -o /tmp/nodesource_setup.sh
RUN apt upgrade -y
RUN apt install -y nodejs
RUN apt install -y npm


COPY package.json package.json
COPY package-lock.json package-lock.json
COPY server.js server.js
COPY . /app

RUN npm install
RUN npm install express
# RUN rm -rf node_modules


ENTRYPOINT ["node", "server.js"]

