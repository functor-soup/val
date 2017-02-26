const Promise = require("bluebird");
const MongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
const val = require("../index.js").val;
// make sure you have permissions for this !!!
const mailLogFile = require("config.js").mail_log_path;

// Connection URL
const url = 'mongodb://localhost:27017/';

// modified fluentb example
const regex = /^(.+) ([^ ]+) ([^:]+): ([^:]+): (to|from)=<([^>]+)>,.*delay=([^ ]+),.*status=(sent|bounced|expired).*$/;


const callback = function(insertionFunction) {
    return (line) => {
        line.split("\n").map((ligne) => {
            const mak = ligne.match(regex);
            if (mak) {
                console.log("hit");
                insertionFunction({
                    "time"      : mak[1],
		    "server"    : mak[2],
		    "protocol"  : mak[3],
		    "id"        :mak[4],
		    "to_or_from":mak[5],
                    "status"    : mak[8],
		    "delay"     : mak[7],
                    "email"     : mak[6]
                });
            }
        });
    }
}


const connection = MongoClient.connect(url);

connection.then((db) => {
	const self = this;
        const table = db.collection('valexample');
        const insertionFunction = table.insert.bind(table);
	    
        val(mailLogFile, callback(insertionFunction), 1000);

    })
    .catch((err) => {
        console.log("Error in connecting to mongodb");
    });
