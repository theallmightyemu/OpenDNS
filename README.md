# OpenDNS Tech Test

## What's inside?
You will find the OpenDNS coding box with some changes to run my node express link shortener.

## Getting started

To view this app just run the vagrant box and start the server then open it locally in browser.
-  `vagrant up --provision`
-  `vagrant ssh`
-  `node /var/www/html/server.js`
-  in browser open http://localhost:65001/

## Features to add

Some awesome features that would have high return on value include:
- Shared cache to support deploying many nodes reading the same data source (like memcache)
- ID collision detection
- create redirect retry on failure
- redirect create timestamp
- redirect used timestamp
- forbidden url add/remove UI
- usage tracking on interfaces
- stats summary report
