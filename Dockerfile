FROM node:6.3-wheezy
MAINTAINER Victor Rojas
ENV DATA_DIR /data
ENV MONGO_VERSION 3.2.8
WORKDIR /app


ADD package.json package.json
RUN npm install --loglevel warn && npm cache clean
ADD . .

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927 && \
  echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list && \
  apt-get update && \
  apt-get install -y mongodb-org-tools=$MONGO_VERSION && \
  apt-get clean

CMD node .

EXPOSE 3000
