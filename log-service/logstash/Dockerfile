FROM logstash:2.4.0

MAINTAINER uniray7 uniray7@gmail.com


ADD ./conf.d /conf
ADD ./input-script /input-script

# install basic packages
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y build-essential

# install aws cli
RUN apt-get install -y python
RUN curl -O https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py
RUN pip install awscli

# install nvm
ENV NVM_DIR /home/.nvm
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash


# install nodejs
ENV NODE_VERSION 5.11.1
ENV NVM_DIR /home/.nvm

RUN . $NVM_DIR/nvm.sh && nvm install v$NODE_VERSION && nvm alias default v$NODE_VERSION
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

WORKDIR /input-script
RUN npm install

CMD ["-f", "/conf/logstash.conf"]
