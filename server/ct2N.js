'use strict'

const ClinicalTrials = require('clinical-trials-gov');
const express = require('express');
const app = express();
const fs = require('fs');
const heartbeats = require('heartbeats');
const geolib = require('geolib');
const spdy = require('spdy');

const pathurl = "/home/ubuntu/CT/data/XMLRes3/";

const options = {
    key: fs.readFileSync('clinicaltrials.key'),
    cert: fs.readFileSync('clinicaltrials.crt')
};
const port = 5000;

app.get('*', (req, res) => {

    let cond = req.query.cond;
    let term = req.query.term;
    let cntry = req.query.cntry;
    let state = req.query.state;
    let city = req.query.city;
    let lead = req.query.lead;
    let gndr = req.query.gndr;
    let recrs = req.query.recrs;
    let age = req.query.age;
    let dist = req.query.dist;
    let nctid = req.query.nctid;

    //User location
    let latA = req.query.lat;
    let lngA = req.query.lng;

    let q = req.query.q;

    let input = req.query.input;
    let location = req.query.location;

    let nctnumbers = req.query.nctnumbers;

    const maxdistance = 482803; //in meter (300 miles)

    if (q == '1') { //To be consumed by UI5: http://localhost/nodejs?q=1&cond=ALK-positive&cntry=US&state=&city=&recrs=&gndr=&age=&dist=10676

        let GPSSensor = false;
        //lngA = -71.05675;
        //latA = 42.35866;

        if (lngA != '' && latA != '')
            GPSSensor = true;


        res.set('Content-Type', 'application/json');
        let heart = heartbeats.createHeart(1000);
        heart.createEvent(1, function(count, last) {
            res.write(" ");
        });

        ClinicalTrials.search({
            cond: cond,
            term,
            cntry,
            state,
            city,
            lead,
            gndr,
            recrs,
            age,
            dist
        }).then(trials => {
            if (typeof trials != 'undefined') {

                let data = JSON.parse(JSON.stringify(trials));

                let jsonO = {
                    "results": { //Results
                    },
                    "Spots": { //City Level
                    },
                    "SpotsC": { //Country Level
                    },
                    "CenterPosition": { //Center Position
                    }
                };
                let jsonspot = [];
                let jsonspotC = [];
                let json = [];

                let nct_id = '';
                let centerposition = '';


                const main = async () => {
                    let i = data.length;

                    console.log('len:' + i)

                    if (typeof i == 'undefined') {
                        //*********************************************** One record found **********************************************************************************
                        nct_id = data.nct_id;

                        try {

                          	const returnValue = require(pathurl + nct_id + '.json');
                            //const returnValue = require('./XMLRes/NCT02607813.json');
                            //const returnValue = require('./XMLRes/NCT00402155.json');

                            // ************************ City Level *******************************************************************************************
                            let AddtoBasketCity = false;
                            for (let c = 0, len = returnValue.Spots.length; c < len; c++) {

                                // NCTID location
                                var lngB = returnValue.Spots[c].pos.split(";")[0];
                                var latB = returnValue.Spots[c].pos.split(";")[1];

                                // User Location
                                //console.log('City lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB);

                                if (GPSSensor) { //GPS Sensor Active

                                    let distance = geolib.isPointInCircle({
                                            latitude: latA,
                                            longitude: lngA
                                        }, {
                                            latitude: latB,
                                            longitude: lngB
                                        },
                                        maxdistance
                                    );

                                    //console.log('City lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB + ':' + ',distance:' + distance);

                                    if (distance) { //Only add NCTID with the locations within the range to basket
                                        //Map City Spots
                                        jsonspot.push({
                                            key: returnValue.Spots[c].key,
                                            pos: returnValue.Spots[c].pos,
                                            tooltip: returnValue.Spots[c].tooltip,
                                            type: 'Success'
                                        });
                                        AddtoBasketCity = true;
                                    }

                                } else { //GPS Sensor Not Active - add all to basket
                                    AddtoBasketCity = true;
                                    //Map City Spots
                                    jsonspot.push({ // Add all locations to baskets
                                        key: returnValue.Spots[c].key,
                                        pos: returnValue.Spots[c].pos,
                                        tooltip: returnValue.Spots[c].tooltip,
                                        type: 'Success'
                                    });
                                }

                            }
                            // **********************************************************************************************************************************


                            // ************************ Country Level *******************************************************************************************
                            let AddtoBasketCountry = false;
                            for (let c = 0, len = returnValue.SpotsC.length; c < len; c++) {

                                // NCTID location
                                var lngB = returnValue.SpotsC[c].pos.split(";")[0];
                                var latB = returnValue.SpotsC[c].pos.split(";")[1];

                                // User Location
                                //console.log('Country lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB);

                                if (GPSSensor) { //GPS Sensor Active
                                    let distance = geolib.isPointInCircle({
                                            latitude: latA,
                                            longitude: lngA
                                        }, {
                                            latitude: latB,
                                            longitude: lngB
                                        },
                                        maxdistance
                                    );
                                    //console.log('dist country:' + distance);

                                    if (distance) { //Only add NCTID with the locations within the range to basket
                                        //console.log('Country lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB + ',distance:' + distance);
                                        //Map Country Spots
                                        let found = jsonspotC.findIndex(r => r.pos === returnValue.SpotsC[c].pos);
                                        if (found == -1) { //pos not found
                                            jsonspotC.push({
                                                key: returnValue.SpotsC[c].key,
                                                pos: returnValue.SpotsC[c].pos,
                                                tooltip: returnValue.SpotsC[c].tooltip,
                                                type: 'Success'
                                            });
                                        } else { //pos found
                                            let total = parseInt(jsonspotC[found].key);
                                            total = total + parseInt(returnValue.SpotsC[c].key) - 1;
                                            jsonspotC[found].key = total.toString();
                                        }
                                        AddtoBasketCountry = true;
                                    }

                                } else { //GPS Sensor Not Active - add all to basket
                                    AddtoBasketCountry = true;

                                    //Map Country Spots
                                    let found = jsonspotC.findIndex(r => r.pos === returnValue.SpotsC[c].pos);
                                    if (found == -1) { //pos not found
                                        jsonspotC.push({
                                            key: returnValue.SpotsC[c].key,
                                            pos: returnValue.SpotsC[c].pos,
                                            tooltip: returnValue.SpotsC[c].tooltip,
                                            type: 'Success'
                                        });
                                    } else { //pos found
                                        let total = parseInt(jsonspotC[found].key);
                                        total = total + parseInt(returnValue.SpotsC[c].key);
                                        jsonspotC[found].key = total.toString();
                                    }
                                }
                            }
                            // **********************************************************************************************************************************

                            if (AddtoBasketCity || AddtoBasketCountry) {
                                if (GPSSensor) {
                                    jsonspotC.push({
                                        key: '',
                                        pos: lngA + ';' + latA + ';0',
                                        tooltip: 'You are here',
                                        type: 'Default'
                                    });
                                }

                                let getC = [];
                                for (let c = 0, len = jsonspotC.length; c < len; c++) {
                                    getC.push({
                                        latitude: jsonspotC[c].pos.split(';')[1],
                                        longitude: jsonspotC[c].pos.split(';')[0]
                                    });
                                }

                                jsonO["results"] = returnValue.results;
                                jsonO["Spots"] = jsonspot;
                                jsonO["SpotsC"] = jsonspotC;
                                jsonO["CenterPosition"] = getC[0].longitude + ';' + getC[0].latitude + ';0';
                            }

                        } catch (e) {
                            console.log(e);
                        }

                        heart.kill();
                        res.end(JSON.stringify(jsonO));
                        //*********************************************** One record found ************************************************************************************

                    } else {
                        //*********************************************** Multiple records found ******************************************************************************
                        let k = 0;

                        while (i--) {


                            if (typeof data[k].nct_id === 'undefined')
                                nct_id = " ";
                            else
                                nct_id = data[k].nct_id;

                            //console.log(nct_id);

                            try {
                                const returnValue = require(pathurl + nct_id + '.json');

                                /*
                                let returnValue
                                if (k <= 0) {
                                    returnValue = require('./XMLRes/NCT02607813.json');
                                } else {
                                    returnValue = require('./XMLRes/NCT03054597.json');
                                }*/

                                // ************************ City Level *******************************************************************************************
                                let AddtoBasketCity = false;
                                for (let c = 0, len = returnValue.Spots.length; c < len; c++) {

                                    // NCTID location
                                    var lngB = returnValue.Spots[c].pos.split(";")[0];
                                    var latB = returnValue.Spots[c].pos.split(";")[1];

                                    // User Location
                                    //console.log('City lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB);

                                    if (GPSSensor) { //GPS Sensor Active

                                        let distance = geolib.isPointInCircle({
                                                latitude: latA,
                                                longitude: lngA
                                            }, {
                                                latitude: latB,
                                                longitude: lngB
                                            },
                                            maxdistance
                                        );

                                        if (distance) { //Only add NCTID with the locations within the range to basket
                                            //console.log('City nctid: ' + nct_id + ', lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB + ':' + ', distance:' + distance);
                                            //Map City Spots
                                            jsonspot.push({
                                                key: returnValue.Spots[c].key,
                                                pos: returnValue.Spots[c].pos,
                                                tooltip: returnValue.Spots[c].tooltip,
                                                type: 'Success'
                                            });
                                            AddtoBasketCity = true;
                                        }

                                    } else { //GPS Sensor Not Active - add all to basket
                                        AddtoBasketCity = true;
                                        //Map City Spots
                                        jsonspot.push({ // Add all locations to baskets
                                            key: returnValue.Spots[c].key,
                                            pos: returnValue.Spots[c].pos,
                                            tooltip: returnValue.Spots[c].tooltip,
                                            type: 'Success'
                                        });
                                    }

                                }
                                // **********************************************************************************************************************************


                                // ************************ Country Level *******************************************************************************************
                                let AddtoBasketCountry = false;
                                for (let c = 0, len = returnValue.SpotsC.length; c < len; c++) {

                                    // NCTID location
                                    var lngB = returnValue.SpotsC[c].pos.split(";")[0];
                                    var latB = returnValue.SpotsC[c].pos.split(";")[1];

                                    // User Location
                                    //console.log('Country lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB);

                                    if (GPSSensor) { //GPS Sensor Active

                                        let distance = geolib.isPointInCircle({
                                                latitude: latA,
                                                longitude: lngA
                                            }, {
                                                latitude: latB,
                                                longitude: lngB
                                            },
                                            maxdistance
                                        );

                                        //console.log('dist country:' + distance);

                                        if (distance) { //Only add NCTID with the locations within the range to basket
                                            //console.log('Country lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB);

                                            //Map Country Spots		
                                            let found = jsonspotC.findIndex(r => r.pos === returnValue.SpotsC[c].pos);
                                            if (found == -1) { //pos not found
                                                jsonspotC.push({
                                                    key: returnValue.SpotsC[c].key,
                                                    pos: returnValue.SpotsC[c].pos,
                                                    tooltip: returnValue.SpotsC[c].tooltip,
                                                    type: 'Success'
                                                });
                                            } else { //pos found
                                                let total = parseInt(jsonspotC[found].key);
                                                total = total + parseInt(returnValue.SpotsC[c].key) - 1;
                                                jsonspotC[found].key = total.toString();
                                            }


                                            AddtoBasketCountry = true;
                                        }

                                    } else { //GPS Sensor Not Active - add all to basket
                                        AddtoBasketCountry = true;

                                        //Map Country Spots
                                        let found = jsonspotC.findIndex(r => r.pos === returnValue.SpotsC[c].pos);
                                        if (found == -1) { //pos not found
                                            jsonspotC.push({
                                                key: returnValue.SpotsC[c].key,
                                                pos: returnValue.SpotsC[c].pos,
                                                tooltip: returnValue.SpotsC[c].tooltip,
                                                type: 'Success'
                                            });
                                        } else { //pos found
                                            let total = parseInt(jsonspotC[found].key);
                                            total = total + parseInt(returnValue.SpotsC[c].key);
                                            jsonspotC[found].key = total.toString();
                                        }
                                    }
                                }
                                // **********************************************************************************************************************************

                                if (AddtoBasketCity || AddtoBasketCountry) {

                                    json.push(returnValue.results[0]);

                                    if (GPSSensor) {
                                        jsonspotC.push({
                                            key: '',
                                            pos: lngA + ';' + latA + ';0',
                                            tooltip: 'You are here',
                                            type: 'Default'
                                        });
                                    }

                                    let getC = [];
                                    for (let c = 0, len = jsonspotC.length; c < len; c++) {
                                        getC.push({
                                            latitude: jsonspotC[c].pos.split(';')[1],
                                            longitude: jsonspotC[c].pos.split(';')[0]
                                        });
                                    }

                                    jsonO["results"] = json;
                                    jsonO["Spots"] = jsonspot;
                                    jsonO["SpotsC"] = jsonspotC;
                                    jsonO["CenterPosition"] = getC[0].longitude + ';' + getC[0].latitude + ';0';

                                }
                            } catch (e) {
                                console.log(e);
                            }

                            if (k == data.length - 1) {
                                heart.kill();
                                res.end(JSON.stringify(jsonO));
                            }

                            k++;
                        }

                    }
                };

                main().catch(console.error);

            } else {
                //no records
                console.log('no record from clinicaltrials api');
                heart.kill();
                res.end(JSON.stringify({}));
            }
        });

    } else if (q == '2') { //To view details from UI5: http://localhost/nodejs?q=2&nctid=NCT00001372

        let GPSSensor = false;
        //lngA = -71.05675;
        //latA = 42.35866;

        if (lngA != '' && latA != '')
            GPSSensor = true;

        let jsonO = {
            "results": { //Results
            },
            "Spots": { //City Level
            },
            "SpotsC": { //Country Level
            }
        };
        let jsonspot = [];
        let jsonspotC = [];
        let json = [];
        let jsonLocation = [];

        const returnValue = require(pathurl + nctid+ '.json');
        //const returnValue = require('./XMLRes/NCT02607813.json');
        //const returnValue = require('./XMLRes/NCT00402155.json');


        // ************************ City Level *******************************************************************************************
        let AddtoBasketCity = false;
        for (let c = 0, len = returnValue.Spots.length; c < len; c++) {

            // NCTID location
            var lngB = returnValue.Spots[c].pos.split(";")[0];
            var latB = returnValue.Spots[c].pos.split(";")[1];

            // User Location
            //console.log('City lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB);

            if (GPSSensor) { //GPS Sensor Active

                let distance = geolib.isPointInCircle({
                        latitude: latA,
                        longitude: lngA
                    }, {
                        latitude: latB,
                        longitude: lngB
                    },
                    maxdistance
                );

                //console.log('City lngA :' + lngA + ', latA: ' + latA + ', lngB:' + lngB + ', latB:' + latB + ':' + ',distance:' + distance);

                if (distance) { //Only add NCTID with the locations within the range to basket
                    //Map City Spots
                    jsonspot.push({
                        key: returnValue.Spots[c].key,
                        pos: returnValue.Spots[c].pos,
                        tooltip: returnValue.Spots[c].tooltip,
                        type: 'Success'
                    });

                    if (typeof returnValue.results[0].location.length === 'undefined')
                        jsonLocation.push(returnValue.results[0].location);
                    else
                        jsonLocation.push(returnValue.results[0].location[c]);

                    AddtoBasketCity = true;
                }

            } else { //GPS Sensor Not Active - add all to basket
                AddtoBasketCity = true;
                //Map City Spots
                jsonspot.push({ // Add all locations to baskets
                    key: returnValue.Spots[c].key,
                    pos: returnValue.Spots[c].pos,
                    tooltip: returnValue.Spots[c].tooltip,
                    type: 'Success'

                });

                if (typeof returnValue.results[0].location.length === 'undefined')
                    jsonLocation.push(returnValue.results[0].location);
                else
                    jsonLocation.push(returnValue.results[0].location[c]);

            }

        }
        // **********************************************************************************************************************************

        if (AddtoBasketCity) {

            let id_info = returnValue.results[0].id_info;
            let url = returnValue.results[0].url;
            let brief_title = returnValue.results[0].brief_title;
            let official_title = returnValue.results[0].official_title;
            let brief_summary = returnValue.results[0].brief_summary;
            let location_countries = returnValue.results[0].location_countries;
            let overall_contact = returnValue.results[0].overall_contact;
            let eligibility = returnValue.results[0].eligibility;
            let intervention = returnValue.results[0].intervention;
            let condition = returnValue.results[0].condition;
            let phase = returnValue.results[0].phase;
            let overall_status = returnValue.results[0].overall_status;
            let centerposition = '0;0;0';

            json.push({
                id_info: id_info,
                url: url,
                brief_title: brief_title,
                official_title: official_title,
                brief_summary: brief_summary,
                location_countries: location_countries,
                overall_contact: overall_contact,
                eligibility: eligibility,
                intervention: intervention,
                condition: condition,
                phase: phase,
                overall_status: overall_status,
                location: [],
                centerposition: centerposition
            });


            if (GPSSensor) {
                jsonspot.push({
                    key: '',
                    pos: lngA + ';' + latA + ';0',
                    tooltip: 'You are here',
                    type: 'Default'
                });
            }

            json[0]["location"] = jsonLocation;

            let getC = [];
            for (let c = 0, len = jsonspot.length; c < len; c++) {
                getC.push({
                    latitude: jsonspot[c].pos.split(';')[1],
                    longitude: jsonspot[c].pos.split(';')[0]
                });
            }

            json[0]["centerposition"] = getC[0].longitude + ';' + getC[0].latitude + ';0';


            jsonO["results"] = json;
            jsonO["Spots"] = jsonspot;
            jsonO["SpotsC"] = jsonspotC;
        }

        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(jsonO));


    } else if (q == '3') { //To view suggestions https://clinicaltrials.gov/ct2/rpc/extend/cond?cond=cancer

        ClinicalTrials.GetSuggestion({
            cond: cond
        }).then(returnValue => {;
            returnValue = JSON.parse(returnValue);
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(returnValue));
        });

    } else if (q == '4') { //To get Autocomplete from Google API

        ClinicalTrials.getAutocompleteGoogle({
            input: input
        }).then(returnValue => {;
            returnValue = JSON.parse(returnValue);
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(returnValue));
        });

        //ClinicalTrials.getAutocompleteHereMap({input: input}).then(returnValue => {;
        //	returnValue = JSON.parse(returnValue);
        //	res.set('Content-Type', 'application/json');
        //	res.end(JSON.stringify(returnValue));
        //});

    } else if (q == '5') { //To get detail address from Google API

        ClinicalTrials.getDetailAddrGoogle({
            location: location
        }).then(returnValue => {;
            returnValue = JSON.parse(returnValue);
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(returnValue));
        });


        //ClinicalTrials.getDetailAddrHereMap({location: location}).then(returnValue => {;
        //	console.log(returnValue);
        //	returnValue = JSON.parse(returnValue);
        //	res.set('Content-Type', 'application/json');
        //	res.end(JSON.stringify(returnValue));
        //});		
    } else if (q == '6') {
                
        if(nctnumbers.length > 0) {

	        nctnumbers = nctnumbers.split(',');
	        //console.log('len: ' + nctnumbers.length);

	        let jsonO = {
	            "results": { //Results
	            },
	            "Spots": { //City Level
	            },
	            "SpotsC": { //Country Level
	            },
	            "CenterPosition": { //Center Position
	            }
	        };
	        let jsonspot = [];
	        let jsonspotC = [];
	        let json = [];

	        var nct_id = '';
	        for (let k = 0, len = nctnumbers.length; k < len; k++) {
	            nct_id = nctnumbers[k];
	            //console.log('nct_id: ' + nct_id);

	            try {
	                const returnValue = require(pathurl + nct_id + '.json');

	                /*
	                let returnValue;
	                if (k <= 0) {
	                    returnValue = require('./XMLRes/NCT02607813.json');
	                } else {
	                    returnValue = require('./XMLRes/NCT03054597.json');
	                }
	                */


	                // ************************ City Level *******************************************************************************************
	                for (let c = 0, len = returnValue.Spots.length; c < len; c++) {

	                    // NCTID location
	                    var lngB = returnValue.Spots[c].pos.split(";")[0];
	                    var latB = returnValue.Spots[c].pos.split(";")[1];


	                    //Map City Spots
	                    jsonspot.push({ // Add all locations to baskets
	                        key: returnValue.Spots[c].key,
	                        pos: returnValue.Spots[c].pos,
	                        tooltip: returnValue.Spots[c].tooltip,
	                        type: 'Success'
	                    });
	                }
	                // **********************************************************************************************************************************


	                // ************************ Country Level *******************************************************************************************
	                for (let c = 0, len = returnValue.SpotsC.length; c < len; c++) {

	                    // NCTID location
	                    var lngB = returnValue.SpotsC[c].pos.split(";")[0];
	                    var latB = returnValue.SpotsC[c].pos.split(";")[1];

	                    //Map Country Spots
	                    let found = jsonspotC.findIndex(r => r.pos === returnValue.SpotsC[c].pos);
	                    if (found == -1) { //pos not found
	                        jsonspotC.push({
	                            key: returnValue.SpotsC[c].key,
	                            pos: returnValue.SpotsC[c].pos,
	                            tooltip: returnValue.SpotsC[c].tooltip,
	                            type: 'Success'
	                        });
	                    } else { //pos found
	                        let total = parseInt(jsonspotC[found].key);
	                        total = total + parseInt(returnValue.SpotsC[c].key);
	                        jsonspotC[found].key = total.toString();
	                    }

	                }
	                // **********************************************************************************************************************************

	                json.push(returnValue.results[0]);
	                let getC = [];
	                for (let c = 0, len = jsonspotC.length; c < len; c++) {
	                    getC.push({
	                        latitude: jsonspotC[c].pos.split(';')[1],
	                        longitude: jsonspotC[c].pos.split(';')[0]
	                    });
	                }

	                jsonO["results"] = json;
	                jsonO["Spots"] = jsonspot;
	                jsonO["SpotsC"] = jsonspotC;
	                jsonO["CenterPosition"] = getC[0].longitude + ';' + getC[0].latitude + ';0';


	            } catch (e) {
	                console.log(e);
	            }
	        }


	        res.set('Content-Type', 'application/json');
	        res.end(JSON.stringify(jsonO));
	    } else {
	    	res.set('Content-Type', 'application/json');
	        res.end();
	    }
    }
})


function Start() {
    // Spin up the server
    spdy.createServer(options, app).listen(port, (error) => {
        if (error) {
            console.error(error)
            return process.exit(1)
        } else {
            console.log('Pfizer Clinical Trials App running on port ' + port + '.')
        }
    })
}
Start();
