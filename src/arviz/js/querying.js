const protocol = window.location.protocol +'//';
const hostname = window.location.host;
const href = location.href.split('/')
const page = href[3].split('?')[0];

/**
 * Executed in browser
 * Send endpoint URI and SPARQL query to node server.js
 * Get JSON result from transformation
 * Apply graphic display
**/
function sendRequest(values) {
    let url = protocol + hostname + "/sparql";
    
    const body = {
        'query': values,
        'dataset': page
    }

    fetch(url, {
        method: 'POST', 
        body: JSON.stringify(body)
    }).then(response => response.text())
    .then(data => { 
        getResult(data, values);
    }).catch(error => {
        console.log(error);
        showError();
    });
}

/**
 * Manage result and apply graphic display
 */
function getResult(data, values) {
    queryResult = JSON.parse(data)
    setPubContent(queryResult[0].results.bindings, values)
}

function processQuery(values, id) {

    let filter = 'FILTER(',
        articleBody = '',
        bodyLabel = '';
    
    values.forEach((v,i) => {
        let index = (i+1)
        let uri = getURI(v.trim())
        if (!uri) return;

        filter += '(?body' + index + ' = <' + uri + '>) && '

        articleBody += '?x' + index + ' schema:about ?article; oa:hasBody ?body' + index + '.\n'

        bodyLabel += '?body' + index + ' rdfs:label ?Label' + index + '. \n'
    })
    filter = filter.slice(0, -3) + ') \n'


    const queryData = {
        query: "PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n" +

        'SELECT distinct ?article ?abs ?authors ?date ?title ?url \n' +
        'FROM <http://ns.inria.fr/covid19/graph/entityfishing> \n' +
        'FROM named <http://ns.inria.fr/covid19/graph/wikidata-named-entities-full> \n' +
        'FROM <http://ns.inria.fr/covid19/graph/articles> \n' +
        'WHERE {\n' +
            articleBody +

             'GRAPH <http://ns.inria.fr/covid19/graph/wikidata-named-entities-full>{ \n' +
            bodyLabel +
             '} \n' +
            '?article dct:abstract [rdf:value ?abs]; dct:issued ?date;  dce:creator ?authors;  dct:title ?title;  bibo:doi ?doi;  schema:url ?url. \n' +
            filter +
        '} \n' +
        'LIMIT 10000',
        uri: "https://covidontheweb.inria.fr/sparql",
        id: id
    }

    sendRequest(queryData);
}

/**
 * Show request error
 */
function showError() {
    Swal.fire({
        icon: 'error',
        title: 'An error occurred, please try again later.'
    })
}