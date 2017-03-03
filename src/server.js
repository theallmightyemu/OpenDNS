/*
Link Shortener.

The purpose of this program is to be a concise and ready to use demonstration of a link shortener.
This time around I want to keep things simple and elegantly executed with minimum friction to run.
Mysql should auto back fill required db and table on provision.
This node server should auto run on vagrant up --provision.

@author: Deryk Schneider <deryk.schneider@gmail.com>
*/

// Initialize modules for this node server
var express      = require('express');
var util         = require('util');
var mysql        = require('mysql'); // Since we are caching redirects in RAM use mysql to backup and retrieve data
var bodyParser   = require('body-parser');
var responseTime = require('response-time');
var favicon      = require('serve-favicon');
var app          = express();
var rootPath     = 'http://localhost:65001/';
var urlCache     = {};  // Extremely simple cache to speed requests
var invertCache  = {};  // Index cache key by value to speed up duplicate url searching.
var bannedCache  = {};  // Cache of banned urls
var connection   = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'link_shortener'
});
// Information like db login info should be kept in config so we can serve different config based on environment.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Setup ability to read post body
app.use(responseTime());
app.use(favicon('/var/www/html/favicon.ico'));// This keeps server from being slammed with favicon requests

/*
Function to save to cache.

@param  object redirect Should contain hash and url attr.
@return null
*/
function cachePost(redirect) {
	if (typeof redirect.hash != 'undefined' &&
		typeof redirect.url != 'undefined') {
		urlCache[redirect.hash]   = redirect.url;
		invertCache[redirect.url] = redirect.hash;
	}
}

/*
Function to handle the result from creating the db connection and initialize cache.

@param  object err The error object.
@return null
*/
connection.connect(function(err) {
	if (err) {
		throw err;
	} else {
		console.log('Database Connected.');
	}

	// Handle async mysql return
	function fillCache(results) {
		if (typeof results == 'object' ) {
			var cacheCount = 0;
			for (var i = results.length - 1; i >= 0; i--) {
				if (typeof results[i].hash == 'undefined' || typeof results[i].url == 'undefined') {
					continue;
				}
				cacheCount = cacheCount+1;
				cachePost({hash: results[i].hash, url: results[i].url});
			};
			if (cacheCount > 0) {
				console.log('Cache filled. Entries populated: '+cacheCount);
			}
		}
	}

	connection.query('select hash,url from redirects', function(err, results) {
		if(err) {
			throw err;
		} else {
			fillCache(results);
		}
	});

})

/*
Get function to fetch the long url redirect that is associated with the short url.

@param  object req The request object.
@param  object res The response object.
@return null
*/
app.get('/:redirect', function (req, res) {
	if (typeof req.params.redirect != 'string' || req.params.redirect == '') {
		console.log('get:redirect:'+'Redirect hash must be a non-empty string.');
		res.status(500).send('Redirect hash must be a non-empty string.');
		res.end();
	}
	if (req.params.redirect == 'favicon.ico') {
		console.log('get:redirect:'+'favicon requests are not honored.');
		res.status(500).send('favicon requests are not honored.');
		res.end();
	}

	// Handle async mysql return
	function redirect(results) {
		// Sanity and save to cache or bail back to root if fails
		if (typeof results != 'undefined' &&
			typeof results[0] != 'undefined' &&
			typeof results[0].url != 'undefined') {

			console.log('get:redirect:'+'Store in cache and load db hit: '+req.params.redirect+'|'+results[0].url);
			cachePost({hash: req.params.redirect, url: results[0].url});
			res.writeHead(301, {Location: results[0].url});
		} else {
			console.log('get:redirect:'+'Store in cache and load db hit: '+rootPath);
			res.writeHead(301, {Location: rootPath});
		}
		res.end();
	}

	console.log('get:redirect:'+req.params.redirect);
	// Do cached lookup and redirect immediately
	if (typeof urlCache[req.params.redirect] == 'undefined') {
		connection.query('select url from redirects where hash = ?', [req.params.redirect], function(err, results) {
			if(err) {
				throw err;
			} else {
				redirect(results);
			}
		});
	} else {
		console.log('get:redirect:'+'Loading cache hit: '+req.params.redirect+'|'+urlCache[req.params.redirect]);
		res.writeHead(301, {Location: urlCache[req.params.redirect]});
		res.end();
	}
});

/*
Get function to fetch the view data needed to create a new short url.
Delivering the view data in this manner allows the whole app to be used in browser with no client site.
This also allows this app to be injected into another single page app allowing 3rd party integration.

@param  object req The request object.
@param  object res The response object.
@return null
*/
app.get('/', function (req, res) {
	res.send('<h1>Link Shortener</h1><h2>Create Link<h2><form action="/" method="post"><input name="url" type="text"><input type="submit"></form>');
});

/*
Post function to attempt to create a new short url and deliver view data with result.
Here is a neat idea. Validate new links and redirected links against https://domain.opendns.com/wordpress.com->Adware->Approved

@param  object req The request object.
@param  object res The response object.
@return null
*/
app.post('/', function (req, res) {
	// Sanity
	if (typeof req.body.url != 'string' || req.body.url == '') {
		res.status(500).send("URL to shorten must be a non-empty string.");
		return;
	}

	// Normalize and prepend protocol if missing.
	var url       = req.body.url.indexOf('http') == -1 ? url = 'http://'+req.body.url : url = req.body.url;
	var shortened = ''
	if (typeof invertCache[url] != 'undefined') {
		console.log('post:/:'+'Cache already contains value fetch existing: '+invertCache[url]+'|'+url);
		shortened = rootPath + invertCache[url];
	} else {
		var hash = Math.random().toString(36).substr(2, 8); // Skip first digit to avoid pseudo random number
		// Try and get from db and update cache
		connection.query('insert into redirects (hash, url) VALUES (?, ?)', [hash, url], function(err, result) {
			console.log('post:/:'+'Store in cache and save to db: '+hash+'|'+url);
			cachePost({hash: hash, url: url});
		});
		shortened = rootPath + hash;
	}

	res.send('<h1>Link Shortener</h1><b>Here is your shortened link: </b><a href="'+shortened+'">'+shortened+'</a>' );
});

/*
Setup the node server listening target and alert people the server is currently listening.

@return null
*/
app.listen(65001, '0.0.0.0', function () {
	console.log('Listening on: '+rootPath)
});
