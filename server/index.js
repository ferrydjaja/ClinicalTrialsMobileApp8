const https = require('https');
const http = require('http');
const parseString = require('xml2js').parseString;

const CT_url = "https://clinicaltrials.gov/ct2";
const Suggestion_url = "https://clinicaltrials.gov/ct2/rpc/extend/";
const MGDB = "http://localhost:5001/";

const GoogleAutocomplete_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GoogleDetailAddr_url = "https://maps.googleapis.com/maps/api/geocode/json";
const GoogleAPIkey = "AIzaSyC8YxVj8CJ8z2ejT5Z6JOvnw2U06-BrzmQ"; //"AIzaSyBVDCcYWL4PTwiasgGTalOin8AIYc3EO7Q"

const HereMapAutocomplete_url = "https://autocomplete.geocoder.api.here.com/6.2/suggest.json";
const HereMapDetailAddr_url = "https://geocoder.cit.api.here.com/6.2/geocode.json";
const HereMapappid = "CeUxOpSPl7cW8B7LdXgR";
const HereMapappcode = "OdlVlCIJW6fFRVQZIlOOJg";


/**
 * Clinical trials
 */
class ClinicalTrial {
    /**
     * Search for clinical trials using search criteria
     * @param {SearchProps} props
     * @returns {object}
     */
    static search(props) {
        console.log(props);
        let query = `${CT_url}/results`;
        query += '?displayxml=true';
        query += `&cond=${props.cond || ''}`;
        query += `&term=${props.term || ''}`;
        query += `&cntry=${props.cntry || ''}`;
        query += `&state=${props.state || ''}`;
        query += `&city=${props.city || ''}`;
        query += `&lead=${props.lead || ''}`;
        query += `&gndr=${props.gndr || ''}`;
        query += `&recrs=${props.recrs}`;
        query += `&age=${props.age || ''}`;
        query += `&dist=${props.dist || ''}`;
        query += `&count=${props.count || 100}`;

        //https://clinicaltrials.gov/ct2/results?displayxml=true&cond=eye strain&term=NCT03585790&cntry=&state=&city=&lead=&gndr=All&recrs=&age=&dist=10676&count=100
        console.log('[A]:' + query);

        return httpGetAsync(query).then(result => result.search_results.clinical_study);
    }

    static searchD(props) {
        let query = `${CT_url}/show`;
        query += `/${props.nctid || ''}`;
        query += '?displayxml=true';
        //https://clinicaltrials.gov/ct2/show/NCT00001372?displayxml=true
        console.log('[B]:' + query);

        // return this.request(query).then(result => result.search_results.clinical_study);
        return httpGetAsync(query).then(result => result.clinical_study);
    }

    //Get lat long from Heremaps API
    static GetLatLongAPI(props, appid, appcode) {
        let query = `${HereMapDetailAddr_url}`;
        query += `?app_id=${HereMapappid}`;
        query += `&app_code=${HereMapappcode}`;
        query += `&searchtext=${props.searchtext || ''}`;
        query += `&language=EN`;
        console.log('[C]:' + query);

        return httpGetAsyncJson(query).then(result => result);
    }

    //Check lat long record from DB
    static CheckLatLongDB(props) {
        let query = `${MGDB}?q=1`;
        query += `&country=${props.country}`;
        query += `&state=${props.state}`;
        query += `&city=${props.city}`;
        console.log('[D]:' + query);

        return httpnosGetAsyncJson(query).then(result => result);
    }

    //Insert lat long record into DB
    static InsertLatLongDB(props) {
        let query = `${MGDB}?q=2`;
        query += `&country=${props.country}`;
        query += `&countrylat=${props.countrylat}`;
        query += `&countrylng=${props.countrylng}`;
        query += `&state=${props.state}`;
        query += `&city=${props.city}`;
        query += `&citylat=${props.citylat}`;
        query += `&citylng=${props.citylng}`;
        console.log('[E]:' + query);

        return httpnosGetAsyncJson(query).then(result => result);
    }

    //Get suggestion from ClinicalTrials API
    static GetSuggestion(props) {
        let query = `${Suggestion_url}cond?`;
        query += `cond=${props.cond}`;
        console.log('[F]:' + query);

        return httpGetAsyncJson(query).then(result => result);
    }


    /**
     * Search the conditions and diseases list
     * @param {string} search_query - Search query. E.g. "Cancer"
     * @returns {array}
     */
    static searchConditions(search_query) {
        let query = `${URL}/rpc/extend/cond`;
        query += `?cond=${search_query}`;

        return httpGetAsync(query, false)
    }

    /**
     * Get details for a specific trial from a ClinicalTrials.gov Identifier
     * @param {string} id - ClinicalTrials.gov Identifier
     * @returns {object}
     */
    static getDetails(id) {
        let query = `${URL}/show/${id}`;
        query += `&country=${props.country}`;

        // return this.request(query).then(result => result.clinical_study);
        return httpGetAsync(query).then(result => result.clinical_study);
    }

    //Get Autocomplete from Google API
    static getAutocompleteGoogle(props) {
        let query = `${GoogleAutocomplete_url}`;
        query += `?type=(regions)`;
        query += `&key=${GoogleAPIkey}`;
        query += `&input=${props.input}`;

        return httpGetAsyncJson(query).then(result => result);
    }

    //Get detail address from Google API
    static getDetailAddrGoogle(props) {
        let query = `${GoogleDetailAddr_url}`;
        query += `?key=${GoogleAPIkey}`;
        query += `&address=${props.location}`;

        return httpGetAsyncJson(query).then(result => result);
    }

     //Get Autocomplete from HereMap API
    static getAutocompleteHereMap(props) {
        let query = `${HereMapAutocomplete_url}`;
        query += `?app_id=${HereMapappid}`;
        query += `&app_code=${HereMapappcode}`;        
        query += `&query=${props.input}`;
        query += `&language=EN`;

        return httpGetAsyncJson(query).then(result => result);
    }

    //Get detail address from HereMap API
    static getDetailAddrHereMap(props) {
        let query = `${HereMapDetailAddr_url}`;
        query += `?app_id=${HereMapappid}`;
        query += `&app_code=${HereMapappcode}`;
        query += `&searchtext=${string}`;
        query += `&language=EN`;

        return httpGetAsyncJson(query).then(result => result);
    }

}

process.on("unhandledRejection", function(promise, reason){
    console.log('Unhandled Rejection at:', reason.stack || reason);
});


/*
 * Parse response XML and return formatted JSON
 */
const parseXML = (xml) => {
    let response;
    parseString(xml, {
        explicitArray: false,
        mergeAttrs: true,
        normalize: true,
    }, (err, result) => {
        if (!err) {
            response = result;
        } else {
            throw err
        };
    });
    return response;
}

/*
 * Make an async request using https
 */
const httpGetAsync = (query, parse_xml = true) => {
    return new Promise((resolve, reject) => {
        const request = https.get(query, response => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                //reject(new Error('Failed to load page, status code: ' + response.statusCode));
                console.log('Failed to load page, status code: ' + response.statusCode);
            };
            let data = '';
            response.on('data', chunk => {
                data += chunk
            });
            response.on('end', () => {
                resolve(parse_xml ? parseXML(data) : data);
            });
        });
        request.on('error', (error) => reject(error));
    });
}


const httpGetAsyncJson = (query, parse_xml = true) => { //this is https method
    return new Promise((resolve, reject) => {
        const request = https.get(query, response => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                //reject(new Error('Failed to load page, status code: ' + response.statusCode));
                console.log('Failed to load page, status code: ' + response.statusCode);
            };
            let data = '';
            response.on('data', chunk => {
                data += chunk
            });
            response.on('end', () => {
                resolve(data);
            });
        });
        request.on('error', (error) => reject(error));
    });
}

const httpnosGetAsyncJson = (query, parse_xml = true) => { //this is http method
    return new Promise((resolve, reject) => {
        const request = http.get(query, response => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                //reject(new Error('Failed to load page, status code: ' + response.statusCode));
                console.log('Failed to load page, status code: ' + response.statusCode);
            };
            let data = '';
            response.on('data', chunk => {
                data += chunk
            });
            response.on('end', () => {
                resolve(data);
            });
        });
        request.on('error', (error) => reject(error));
    });
}

module.exports = ClinicalTrial;
