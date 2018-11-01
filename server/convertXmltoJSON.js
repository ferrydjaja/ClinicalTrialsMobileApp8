const parseString = require('xml2js').parseString;
const fs = require('fs');
const ClinicalTrials = require('clinical-trials-gov');

let nctid = process.argv[2]; //nctid filename
const path = './XMLRes/';

const parseXML = (xml) => {
    let response;
    parseString(xml, {
        explicitArray: false,
        mergeAttrs: true,
        normalize: true,
    }, (err, result) => {
        if (!err) { 
            response = result;
        } else { throw err };
    });
    return response;
}


start();

function start() {
	getData(nctid, function(returnValue) {

		//For Windows
		nctid = nctid.split('.');
		nctid = nctid[0];

		//For Linux
		//nctid = nctid.split('/');
		//nctid = nctid[7].split('.');
		//nctid = nctid[0];

			
		fs.writeFile(path +  nctid + '.json', returnValue.trim(), 'utf8', function (err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
			process.exit();
		}); 

	});
}

function getData(nctid, callback) {
	fs.readFile(nctid, 'utf8', function(err, data) {
		if (!err) {

			let jsonO = {
				"results" : {
				},
				"Spots" : {
				},
				"SpotsC" : {
				}
			}
			let jsonspot = [];
			let jsonspotC = [];
			let json = [];

			json.push({
			});


			const main = async () => {
				
				let readFileContent = JSON.parse(JSON.stringify(parseXML(data)));
				readFileContent = readFileContent.clinical_study;

				//Results Array
				json[0]["id_info"] = readFileContent.id_info;
				json[0]["url"] = readFileContent.required_header.url;			
				json[0]["brief_title"] = readFileContent.brief_title;
				json[0]["official_title"] = readFileContent.official_title;
				json[0]["brief_summary"] = readFileContent.brief_summary;
				json[0]["location_countries"] = readFileContent.location_countries;
				json[0]["detailed_description"] = readFileContent.detailed_description;
				json[0]["last_update_submitted"] = readFileContent.last_update_submitted;
				json[0]["overall_contact"] = readFileContent.overall_contact;
				json[0]["eligibility"] = readFileContent.eligibility;
				json[0]["location"] = readFileContent.location;
				json[0]["intervention"] = readFileContent.intervention;
				json[0]["condition"] = readFileContent.condition;
				json[0]["phase"] = readFileContent.phase;
				json[0]["overall_status"] = readFileContent.overall_status;
				
				//Spot (city level) and SpotC (country level)
				let lengthdata = 1; let country = ''; let city = ''; let state = ''; 
				let name = '';
				let keyidx = 0;
				if (readFileContent.hasOwnProperty('location')) {

					if (typeof readFileContent.location.length === 'undefined')
						lengthdata = 1;
					 else
						lengthdata = readFileContent.location.length;

					//console.log('location length: ' + lengthdata);

					for (let c = 0, len = lengthdata; c < len; c++) {
						
						if(lengthdata == 1) {
							if(readFileContent.location.facility.hasOwnProperty("name")) 
								name = readFileContent.location.facility.name;
							else
								name = '';

							if(readFileContent.location.facility.hasOwnProperty("address")) {
								
								if(readFileContent.location.facility.address.hasOwnProperty("country"))
									country = readFileContent.location.facility.address.country; 
								else
									country = '';
								
								if(readFileContent.location.facility.address.hasOwnProperty("state"))
									state = readFileContent.location.facility.address.state; 
								else 
									state = '';

								if(readFileContent.location.facility.address.hasOwnProperty("city"))
									city = readFileContent.location.facility.address.city; 
								else
									city = '';								
							}

							if(name == '' && city != "")
								name = city;
						} else {
							if(readFileContent.location[c].facility.hasOwnProperty("name")) 
								name = readFileContent.location[c].facility.name;
							else
								name = '';

							if(readFileContent.location[c].facility.hasOwnProperty("address")) {
								
								if(readFileContent.location[c].facility.address.hasOwnProperty("country"))
									country = readFileContent.location[c].facility.address.country; 
								else 
									country = '';

								if(readFileContent.location[c].facility.address.hasOwnProperty("state"))
									state = readFileContent.location[c].facility.address.state; 
								else 
									state = '';

								if(readFileContent.location[c].facility.address.hasOwnProperty("city"))
									city = readFileContent.location[c].facility.address.city; 
								else
									city = '';
							}

							if(name == '' && city != "")
								name = city;
						}

						if(country == "Korea, Republic of") 
							country = "South Korea";
						if(country == "Macedonia, The Former Yugoslav Republic of")
							country = "Macedonia";
						if(country == "Former Serbia and Montenegro")
							country = "Serbia";
						if(country == "Iran, Islamic Republic of")
							country = "Iran";
						if(country == "Moldova, Republic of")
							country = "Moldova";
						if(country == "Korea, Democratic People's Republic of") 
							country = "South Korea";
						if(country == "Congo, The Democratic Republic of the") 
							country = "Congo";
						if(country == "Côte D'Ivoire")
							country = "Cote d'Ivoire";
						if(country == "Réunion")
							country = "Reunion";
						if(country == "Lao People's Democratic Republic")
							country = "Lao";
						if(country == "Syrian Arab Republic")
							country = "Syria";
						if(country == "Libyan Arab Jamahiriya")
							country = "Libya";

						state = state.replace(/[^A-Za-z 0-9]*/g, '').trim();
						city =  city.replace(/[^A-Za-z 0-9]*/g, '').trim();
						console.log(readFileContent.id_info.nct_id + '|' + country + '|' + state + '|' + city);

						
						if(country != '') {
							
							//Get City Lat & Long Level
							let eror = 1; let eror_cnt = 1;
							let citylat = 0; let citylng = 0;
							let countrylat = 0; let countrylng = 0;

							while(eror != 0) {	//redo if connection is failed
								console.log('City level:' + eror + '-' + eror_cnt);

								if(eror_cnt > 3) //2x times tried
									break;
								
								try {
									
									//Check if lat and lng already in DB
									let countrycity = await ClinicalTrials.CheckLatLongDB({city: city, state: state, country: country});
									countrycity = JSON.parse(countrycity);

									console.log('latlngDB:' + countrycity.length);

									if(countrycity.length > 0) {
										//Record exists in DB
										citylat = countrycity[0].city_lat;
										citylng = countrycity[0].city_lng;
										countrylat = countrycity[0].country_lat;
										countrylng = countrycity[0].country_lng;

									} else {
										//Record doesn't exists in DB

										//Get city lat lng from Heremap									
										let citylatlong = await ClinicalTrials.GetLatLongAPI({searchtext: city + ' ' +  country});
										citylatlong = JSON.parse(citylatlong);

										if(citylatlong.Response.View.length > 0) {
											citylat = citylatlong.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
											citylng = citylatlong.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
											
										} 

										//Get country lat lng from Heremap									
										let countrylatlong = await ClinicalTrials.GetLatLongAPI({searchtext: country});
										countrylatlong = JSON.parse(countrylatlong);

										if(countrylatlong.Response.View.length > 0) {
											countrylat = countrylatlong.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
											countrylng = countrylatlong.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
											
										} 

										if(citylat == 0 && citylng ==0) {
											citylat = countrylat;
											citylng = countrylng;
										} 

											//Write to DB
										let insertcountrycity = await ClinicalTrials.InsertLatLongDB({city: city, citylat: citylat, citylng: citylng, state: state, country: country, countrylat: countrylat, countrylng: countrylng});
										//console.log('insertcountrycity:' + insertcountrycity);
									}
									
									countrylat = parseFloat(countrylat).toFixed(5);
									countrylng = parseFloat(countrylng).toFixed(5);
									citylat = parseFloat(citylat).toFixed(5);
									citylng = parseFloat(citylng).toFixed(5);

									console.log('City=> lat:' + citylat + ', lng:' + citylng);
									console.log('Country=> lat:' + countrylat + ', lng:' + countrylng);
								
									//Map Spots Detail: City Level
									jsonspot.push({
										key: keyidx,
										pos: citylng + ';' + citylat + ';0',
										tooltip: name,
										select: false,
										type: 'Success'
									});

									//Map Spots Detail: Country Level
									let found = jsonspotC.findIndex(r => r.pos === countrylng + ';' + countrylat + ';0');
									if(found == -1) { //lat & long not found
										jsonspotC.push({
											key: '1',
											pos: countrylng + ';' + countrylat + ';0',
											tooltip: country
										});
									} else { //lat & long found
										let total = parseInt(jsonspotC[found].key);
										total = total + 1;
										jsonspotC[found].key = total.toString();
									}

									eror = 0

									
								} catch (e) {
									eror = 1;
									eror_cnt++;
									console.log(e);
								}
							}

							keyidx++;
						}
					}
				}

				jsonO["results"] = json;
				jsonO["Spots"] = jsonspot;
				jsonO["SpotsC"] = jsonspotC;

				callback(JSON.stringify(jsonO)); 


			}
			main().catch(console.error);
		}
	});
}
