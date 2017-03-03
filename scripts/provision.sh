#!/bin/bash
#
# This script is executed upon the first `vagrant up` or when running
# `vagrant up --provision`. You may use it to install any additional software
# that you require for your submission.
#
#
set -e

# Example

#apt-get install tree

apt-get update

# Automate node setup and auto run node server.
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g mysql body-parser serve-favicon response-time
mysql -uroot < /var/www/html/setup.my.sql

# Last step is run the node server
echo "start server with: node /var/www/html/server.js"
