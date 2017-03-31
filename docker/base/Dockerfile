#This dockerfile uses the ubuntu image
FROM ubuntu:16.04

MAINTAINER uniray7 uniray7@gmail.com

# install basic packages
RUN apt-get update
RUN apt-get install -y curl git build-essential

# install nvm
ENV NVM_DIR /home/.nvm
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash

# add user "verpix"
RUN useradd -ms /bin/bash verpix -p \$6\$8CHaYhnN\$MP/2BROPD6IfAbYjwKCu59aO1t4GhCfmCHh2l3eU5qSZ1xTCjK0YWwL92uufrylzFdvtNCe8rTz5mNuKVN3kK1
RUN adduser verpix sudo
ENV HOME /home/verpix
