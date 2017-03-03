# OpenDNS Coding Challenge Environment

## What's inside?
Inside this repo you will find a `Vagrantfile`. This will download and run a 
custom-built Vagrant box with the common languages we use pre-installed.

## Box Details

### Versions
The following is pre-installed for you.

- Ubuntu 14.04
- PHP 5.6
- Apache 2.4 
- Python 2.7.12
- MySQL 5.5.53

You may install any additional software you wish, but be sure to add it to the 
`scripts/provision.sh` 

### Credentials

To log into the box, you can simply `vagrant ssh`, to ssh in as the `vagrant` user.
The `vagrant` user has passwordless sudo.

#### PHP
Preinstalled is Apache 2.4 and PHP 5.6. Once launched you may put your php code
in the `./src` directory and it will be avaliable via http://localhost:8088/

#### Python or other
If you choose to use Python, or another language that provides its own server
you may configure that server to serve on `0.0.0.0:8080`. This will be available
on http://localhost:8089/

#### MySQL
You can use the root user to get started (`mysql -uroot`).  Don't forget to provide code for setting up any databases you may create!