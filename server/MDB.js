'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

app.set('port', (process.env.PORT || 5001));

const  compression = require('compression');
app.use(compression());

let db;
let collection;

// function to create unique index
const uniqueIndex = (collection, callback) => {
    collection.createIndex({  country: 1, state: 1, city: 1}, {unique:true}, (err, result) => {
        if(err) {console.error(`Failed to create index ${err}`); process.exit(1);}
        console.log(`Unique Index created successfully: ${result}`)
        callback(result)
    })
}


// function to insert records
const insertRecords = (collection, myobj, callback) => {
    collection.insertOne(myobj, (err, result) => {
        if (err) {
            console.error(`Error in insertion: ${err}`)
            callback('error');
        } else {
			console.log(`No of records: ${result.result.n}`)
			callback(result)
		}
    })
}

// function to find records
const findRecords = (collection, myobj, callback) => {
    collection.find(myobj).toArray((err, data) => {
        if (err) {
            console.error(`Cannot find records: ${err}`)
            callback('error');
        } else {
			console.log(`Record count: ${data.length}`)
			callback(data)
		}
    })
}

app.get('/', (req, res) => {

	let country = req.query.country;
	let city = req.query.city;
	let state = req.query.state;
	let countrylat = parseFloat(req.query.countrylat).toFixed(5);
	let countrylng = parseFloat(req.query.countrylng).toFixed(5);
	let citylat = parseFloat(req.query.citylat).toFixed(5);
	let citylng = parseFloat(req.query.citylng).toFixed(5);

	let q = req.query.q;

	if (q == '1') { 
		//Find record
		country = '^' + country +'$';
		state = '^' + state +'$';
		city = '^' + city +'$';
 
		let query = { country: {'$regex': country,$options:'i'}, state: {'$regex': state,$options:'i'}, city: {'$regex': city,$options:'i'} };
		findRecords(collection, query, (result) => {
			if(result!='error') {
				res.set('Content-Type', 'application/json');
				res.end(JSON.stringify(result));
			} else {
				res.set('Content-Type', 'application/json');
				res.end(JSON.stringify("Error"));
			}			
		})

	} else if (q == '2') {
		//Insert record
	
		let myobj = {
			"country": country,
			"country_lat": countrylat,
			"country_lng": countrylng,
			"state": state,
			"city": city,
			"city_lat": citylat,
			"city_lng": citylng
		}

		insertRecords(collection, myobj, (result) => {
			if(result!='error') {
				uniqueIndex(collection, () => {
					//client.close()
					res.set('Content-Type', 'application/json');
					res.end(JSON.stringify("OK"));
				})
			} else {
				res.set('Content-Type', 'application/json');
				res.end(JSON.stringify("Error"));
			}
		})
	}
})

function Start() {
	MongoClient.connect(url,  { useNewUrlParser: true,  reconnectTries: 60, reconnectInterval: 1000 }, (err, client) => {
		if (err) {
			console.error(`Connection Error: ${err}`)
			return process.exit(1)
		}
		console.log('Connection successful.')
		db = client.db('mydb')
		collection = db.collection('Country')

		//Spin up the server
		let server = app.listen(app.get('port'), function() {
			console.log('MDB App running on port', app.get('port'))
		});
		server.timeout = 120000;

	})
}
Start();
