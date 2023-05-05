/**
 * LinkedDataViz  
 * Node proxy server
 * Receive query from HTML page, send query to SPARQL endpoint, apply transformation,
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
 * Minh nhat Do - Aline Menin - Maroua Tikat - 2020-2022
**/
const port = 8080

const fs = require('fs');
const express = require('express');
var back = require('express-back');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const basicAuth = require('express-basic-auth');
const isHTML = require('is-html');
const { Session } = require('inspector');
const path = require('path');
// const stencil = require('./hydrate');

// const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');

const datafiletimeout = 1296000000; /// keep files in cache for 15 days
const datadir = 'data/';

// one cache folder per querying page
const cachefile = {
    'ldviz': datadir + 'cache/ldviz/',
    'arviz': datadir + 'cache/arviz/',
}

const cachedir = datadir + 'cache/';
if (!fs.existsSync(cachedir)){
    fs.mkdirSync(cachedir);
}

const datafile = {
    'hal': datadir + 'hal_data.json',
    'covid': datadir + 'covid_data.json',
    'ldviz': datadir + 'ldviz_data.json',
    'params': datadir + 'parameters.json',
    'arviz': {
        'rules': datadir + 'arviz/rules.json',
        'clusters': datadir + 'arviz/cluster_subject.json',
        'uri': datadir + 'arviz/uri_ref.json' 
    }
}

/**
 * HTTP node server
 * Browser form send HTTP request to this node server
 * Send query to SPARQL endpoint and perform transformation 
 * 
 */
const app = express()

// enable files upload
// app.use(fileUpload({
//     createParentPath: true
// }));

app.use(express.json({limit: '50mb'}));

//add other middleware
app.use(cors());
app.use(morgan('dev'));

// set the view engine to ejs
app.set('view engine', 'ejs');
// app.use(express.static('src'))

app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(session({
    secret: "Your secret key",
    resave: true,
    saveUninitialized: true
}));

app.use(back());

// const indexHtml = fs.readFileSync(path.resolve('./src/index.html'), 'utf8');
// index page 
app.use('/lib/', express.static(path.join(__dirname, 'src/lib')))
app.use('/images/', express.static(path.join(__dirname, 'src/images')))
app.use('/arviz/', express.static(path.join(__dirname, 'src/arviz')))
app.use('/ldviz/', express.static(path.join(__dirname, 'src/ldviz')))
app.use('/mgexplorer/', express.static(path.join(__dirname, 'src/mgexplorer')))
app.use('/build/', express.static(path.join(__dirname, 'www/build')));
app.use('/assets/', express.static(path.join(__dirname, 'www/assets')));


//////// registered users
const users = [
    { id: 1, name: 'Aline', email: 'aline.menin@ldviz.com', password: 'mdpaline.06' },
    { id: 2, name: 'Marco', email: 'marco.winckler@ldviz.com', password: 'mdpmarco.06' },
    { id: 3, name: 'Maroua', email: 'maroua.tikat@ldviz.com', password: 'mdpmaroua.06' },
    { id: 4, name: 'Olivier', email: 'olivier.corby@ldviz.com', password: 'mdpolivier.06' },
    { id: 5, name: 'Quentin', email: 'quentin@gmail.com', password: 'mdpQuentin06' },
    { id: 6, name: 'Antoine', email: 'antoine@gmail.com', password: 'mdpAntoine06' },
    { id: 7, name: 'Benjamin', email: 'benjamin@gmail.com', password: 'mdpBenjamin06' },
    { id: 8, name: 'Franck', email: 'franck.michel@ldviz.com', password: 'mdpfranck.06' },
    { id: 9, name: 'Celian', email: 'celian@gmail.com', password: 'mdpCelian06' },
    { id: 10, name: 'Molka', email: 'molka@gmail.com', password: 'mdpMolka06' },
    { id: 11, name: 'Nadia', email: 'nadia@gmail.com', password: 'mdpNadia06' },
    { id: 12, name: 'Anna', email: 'anna@gmail.com', password: 'mdpAnna06' },
    { id: 13, name: 'maelys', email: 'maelys@gmail.com', password: 'mdpmaelys06' },
    { id: 14, name: 'Jordan', email: 'jordan@gmail.com', password: 'mdpJordan06' },
    { id: 15, name: 'Charlyn', email: 'charlyn@gmail.com', password: 'mdpCharlyn06' },
    { id: 16, name: 'Wylie', email: 'wylie@gmail.com', password: 'mdpWylie06' },
    { id: 17, name: 'Yunjing', email: 'yunjing@gmail.com', password: 'mdpYunjing06' },
]

////////////// login routes ///////////////////////////

app.get('/:page/login', function (req, res) {
    res.render('pages/ldviz/login');
})

app.post('/:page/login', (req, res) => {

    const { email, password} = req.body
    let user = users.find(user => user.email === email && user.password === password);
    if(user){
        req.session.user = user;
        res.redirect(`/${req.params.page}`);
    }
    else {
        res.render('pages/ldviz/login', {message: "Incorrect email and password"});
    }  
})

app.get('/:page/logout', (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }
    res.redirect(`/${req.params.page}`);  
})

/////////// end login routes //////////////////////////

////// mgexplorer routes ////////////////////////
app.get('/ldexplorer', function (req, res){
    let data = [];
    
    let user = req.session.user != undefined ? req.session.user : null;
    console.log("query after login");
    console.log(user);
    //listing all files using forEach
    ['hal', 'covid', 'ldviz'].forEach(async function (key) { 
        if (fs.existsSync(datafile[key])) { 
            let rawdata = fs.readFileSync(datafile[key]);
            rawdata = JSON.parse(rawdata)
            data =  data.concat(rawdata.queries)
        } 
    });

    let paramdata = fs.readFileSync(datafile.params);
    
    res.render("pages/ldexplorer/index", { params: JSON.parse(paramdata), queries: data, user: user });
})


app.get('/ldexplorer/login', function (req, res) {
    res.render('pages/ldviz/login');
})

app.post('/ldexplorer/login', (req, res) => {

    const { email, password } = req.body
    let user = users.find(user => user.email === email && user.password === password);
    console.log("body login")
    console.log(req.body);
    if (user) {
        req.session.user = user;
        res.redirect(`/${req.params.page}`);
    }
    else {
        res.render('/ldexplorer/login', { message: "Incorrect email and password" });
    }
})

app.get('/ldexplorer/logout', (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }
    res.redirect(`/${req.params.page}`);
})

///// end mgexplorer routes ////////////////////////

//// arviz routes ///////////////////////////////////

app.get('/arviz/explore/', function(req, res) {
    let data = {};

    //listing all files using forEach
    Object.keys(datafile.arviz).forEach(function (key) {
        let rawdata = fs.readFileSync(datafile.arviz[key]);
        try {
            data[key] = JSON.parse(rawdata)
        } catch(e) {
            console.log(file, e); // error in the above string (in this case, yes)!
        }
    });
    res.render('pages/arviz/index', {data: data});
})

app.get('/arviz', function(req, res) {
    res.render('pages/arviz/about');
})

///// end arviz routes ///////////////////////////


/// ldviz routes ////////////////////////////////
app.get('/', function (req, res) {
    let data = {};
    if (fs.existsSync(datafile.covid)) {
        let rawdata = fs.readFileSync(datafile.covid);
        data = JSON.parse(rawdata);
    } else {
        data.queries = [];
    }
    res.render('pages/ldviz/home', { queries: data.queries});
})

// About page 
app.get('/about', function (req, res) {
    res.render("pages/ldviz/about");
})

app.get('/hal', function(req, res) {
    res.render('pages/ldviz/index', getPageData(req, 'hal'))
})

app.get('/covid', function (req, res) {
    res.render('pages/ldviz/index', getPageData(req, 'covid'))
})

app.get('/ldviz', function (req, res){
    res.render("pages/ldviz/index", getPageData(req, 'ldviz'));
})

function getPageData(req, page) {
    let queryParams = req.query;

    if (queryParams && Object.keys(queryParams).length) {
        if (!queryParams.email || !queryParams.password) {
            queryParams.message = `Please provide your credentials using "&email=" and "&password="`
            if (req.session.user)  delete req.session.user
        } else {
            let user = users.find(user => user.email === queryParams.email && user.password === queryParams.password);
            if (user)
                req.session.user = user;
            else if (req.session.user) 
                delete req.session.user
        }
    }

    let data = {};
    if (fs.existsSync(datafile[page])) {
        let rawdata = fs.readFileSync(datafile[page]);
        data = JSON.parse(rawdata);
    } else {
        data.queries = [];
    }
    
    let paramdata = fs.readFileSync(datafile.params);
    let stylesheet = fs.readFileSync(datadir + 'gss_type.json');

    return { queryParams: queryParams, 
        params: JSON.parse(paramdata), 
        queries: data.queries, 
        stylesheet: JSON.parse(stylesheet), 
        user: req.session.user || null, 
        page: page}
}

app.get('/:page/results/', function(req, res){
    let params = req.params;
    let queryData = req.query;
    
    let data = {};
    if (queryData.id && fs.existsSync(datafile[params.page])) {
        let rawdata = fs.readFileSync(datafile[params.page]);
        data = JSON.parse(rawdata);
        for (var i = 0; i < data.queries.length; i++) {
            if (data.queries[i].id == queryData.id) {
                queryData = data.queries[i];
                break;
            }
        }
    } 

    res.render("pages/ldviz/results", { params: { queryData: queryData, type: req.query.resultsType}, page: params.page });
})

// generic page which url is set when changing the href of the page
// :page = covid, hal, ldviz
// :action = newQuery, edit, clone
app.get('/:page/:action/', function(req, res){
    const params = req.params;
    const queryId = req.query.queryId;

    let data = {};
    if (fs.existsSync(datafile[params.page])) {
        let rawdata = fs.readFileSync(datafile[params.page]);
        data = JSON.parse(rawdata);
    } else {
        data.queries = [];
    }
    
    let queryData = {}
    if (fs.existsSync(datafile[params.page])) {
        let rawdata = fs.readFileSync(datafile[params.page]);
        rawdata = JSON.parse(rawdata)
        queryData = rawdata.queries.filter(d => d.id == queryId)[0]
    } 

    let paramdata = fs.readFileSync(datafile.params);
    let stylesheet = fs.readFileSync(datadir + 'gss_type.json');
    res.render("pages/ldviz/index", 
        {queries: data.queries, 
            params: JSON.parse(paramdata), 
            stylesheet: JSON.parse(stylesheet), 
            existingQuery: queryData || {}, 
            action: params.action,
            user: req.session.user || null,
            page: params.page });
})

// Save a new query on disk
app.post('/saveQuery', function (req, res) {
    var data = req.body; // query content

    let json = {};
    const datafilename = datafile[data.dataset]

    if (!fs.existsSync(datafilename)) {
        // Data file does not exist => create it
        json["queries"] = [];
    } else {
        let rawdata = fs.readFileSync(datafilename);
        json = JSON.parse(rawdata);
    }
    json.queries.push(data.query);

    fs.writeFile(datafilename, JSON.stringify(json), function (err) {
        if (err) {
            console.log("Error while writing file " + datafilename + " - " + err);
            res.sendStatus(500);
            return;
        }
    });
    res.sendStatus(200);
})

 app.post('/saveAnnotation', function (req, res) {
    var path = "data/annotations/test.json";
    var data = req.body; // query content
    update_file(path,data);
    res.sendStatus(200);
 })

app.post('/saveDashboard', function (req, res) {
    var path = "data/dashboard.json";
    var data = req.body; // query content
    update_file(path, data);
    res.sendStatus(200);
})

 app.post('/saveHistory', function (req, res) {
    var path = "data/history/history.json";
    var data = req.body; // query content
    console.log(data);
    update_file(path,data);
    res.sendStatus(200);
 })

function update_file(path,data){
    var file = fs.readFileSync(path,"utf8");
    file = JSON.parse(file);
    console.log("The file" + file);
    file.push(data);
    fs.writeFileSync(path, JSON.stringify(file), (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
          console.log("The written has the following contents:");
          console.log(fs.readFileSync(path, "utf8"));
        }
    })
}


app.get('/getAnnotation', function name(req,res) {
    const query_id = req.query["query_id"];
    var path = "data/annotations/test.json";
    var file = fs.readFileSync(path, "utf8");
    file = JSON.parse(file);
    
    const data = file.filter(element => {
        return (element.query_id == query_id)
    }); 

    res.send(data)
})


app.get('/getDashboard', function name(req, res) {
    id = req.query["id"]
    var path = "data/dashboard.json";
    var file = fs.readFileSync(path, "utf8");
    let data = []
    file = JSON.parse(file);
    file.forEach(element => {
        if (element.id == id) {
            console.log(element)
            data = element
        }
    });
    res.send(data)
})



/**
 * Edit an existing query
 * Find the edited query and REPLACE it in the file of query list
 * If the query is published, find the edited query and REPLACE it in the file of PUBLISHED query list
 **/
app.post('/editQuery', function (req, res) { 
    const data = req.body;
    const datafilename = datafile[data.dataset];

    // Data file does not exist => nothing to do
    if (!fs.existsSync(datafilename)) return;

    let rawdata = fs.readFileSync(datafilename);
    const json = JSON.parse(rawdata);

    const index = json.queries.findIndex(d => d.id == data.id)

    if (index > -1) {
        switch(data.editType) {
            case 'lock': // update the isLocked property
                json.queries[index].isLocked = data.isLocked;
                break;
            case 'publish': // update the isPublished property
                json.queries[index].isPublished = data.isPublished;
                break;
            case 'content': // replace the value with the new query content
                delete data.editType;
                json.queries.splice(index, 1, data); 
                break;
        }
            
    } else {
        console.log("No query with id " + data.id + " found");
        res.sendStatus(404);
        return;
    }

    fs.writeFile(datafilename, JSON.stringify(json), function (err) {
        if (err) {
            console.log("Error while writing file " + datafilename + " - " + err);
            res.sendStatus(500);
            return;
        }
    });
    res.sendStatus(200);
})

/**
 * Delete an existing query 
 * Find the query and DELETE it from the file of query list
 **/
app.post('/delete', function (req, res) {
    const data = req.body;
    let json = {};
    const filename = datafile[data.dataset]; 

    // Data file does not exist => nothing to do
    if (!fs.existsSync(filename)) return;

    let rawdata = fs.readFileSync(filename);
    json = JSON.parse(rawdata);

    const index = json.queries.findIndex(d => d.id == data.id)

    if (index > -1) {
        json.queries.splice(index, 1);
    } else {
        console.log("No query with id " + data.id + " found");
        res.sendStatus(404);
        return;
    }

    fs.writeFile(filename, JSON.stringify(json), function (err) {
        if (err) {
            console.log("Error while writing file " + filename + " - " + err);
            res.sendStatus(500);
            return;
        }
    });

    res.sendStatus(200);
})

//// end ldviz routes ///////////////////////


// Clear the cache of a query
app.post('/clearcache', function (req, res) {
    var data = req.body;
    const cachefilename = cachefile[data.dataset] + data.id + '.json'; 

    let json = {};
    if (fs.existsSync(cachefilename)) {
        fs.unlink(cachefilename, function (err) {
            if (err) {
                console.log("Error while deleting file " + cachefilename + " - " + err);
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
            }
        });
    }
})

///////////////////////////////////////
// SPARQL request
app.post('/sparql', function (req, res) {
    // console.log(req.body)
    // Il s'agit de l'envoi d'une requête SPARQL.
    // Le serveur reçoit la requête en JSON (chaîne de caractères) dont le format est:
    // {"query":  SPARQL Query, "format": graphic display type, "type": query type number}

    var text = '';      // contenu de la requête (objet transformé en string)

    req.on('data', function (str) {
        text = text + str; // get data from HTML page form
    });

    req.on('end', function () {
        var data = JSON.parse(text);
        var mg4 = require("./trans_mg4");
        let cachefilename = cachefile[data.dataset] + data.query.id + '.json';
        data.query.id = data.query.id === 'undefined' ? undefined : data.query.id;
       
        // console.log(data)
        var result;
        try {
            if (data.query.id && fs.existsSync(cachefilename)) {
                // console.log('cache found')
                // Check if cache exists for request (for published queries only - query with id)
                const stats = fs.statSync(cachefilename);
                if ((new Date().getTime() - stats.mtimeMs) < datafiletimeout) {
                    // Data cache file is recent => load cache
                    result = fs.readFileSync(cachefilename);
                } 
            }
        } catch (e) {
            // send error back to client
            res.writeHeader(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.write(e, "utf-8");
        }

        try {
            if (result === undefined) {
                // No cache file or file too old
                // console.log('cache not found')
                // console.log(data)
              
                let text = sparqlQuery(data.query.query, data.query.uri, data.query.stylesheet || {});
               
                var res1 = "";
                try {
                    res1 = JSON.parse(text); // Résultat brut de la requête SPARQL
                } catch (e) {
                    if (isHTML(text)) {
                        result = JSON.stringify([text, 'html']);
                    } else {
                        let updatedtext = text;
                        if (updatedtext.startsWith('Virtuoso')) {
                            // SPARQL server result is not JSON => syntax error message
                            // Update error message to add line numbers
                            var tab = text.split('\n');
                            updatedtext = tab[0] + '\n' + tab[1] + '\n' + tab[2] + '\n';
                            for (var i = 3; i < tab.length - 1; i++) {
                                updatedtext = updatedtext + (i - 2) + '.\t' + tab[i] + '\n';
                            }
                        }
                        throw updatedtext; // SPARQL syntax error
                    }
                }

                if (!res1) {
                    result = [{'message':"The SPARQL endpoint you requested might be unavailable at the moment.\nSorry for the inconvenience. Please try again later!"}]
                } else if (res1.results.bindings.length == 0) { // if empty
                    result = [res1]
                } else {
                    const keys = Object.keys(res1.results.bindings[0]);
                    if (keys.includes('p') && (keys.includes('author') || (keys.includes('s') && keys.includes('o')))) { // if missing mandatory variables for MGExplorer
                        // perform JSON transformation, generate graphic display
                        result = mg4.transform(res1, data.query.params.type, data.query.stylesheet);
                    } else { // only return the SPARQL results (for export SPARQL query results functionality)
                        //alert(`Mandatory variables (?s ?p ?o) are missing. Please correct your query or use the "Export SPARQL Query Results" button to view the query result set.`)
                        result = [res1]
                    }
                }
             
                result = JSON.stringify(result);

                if (data.query.id) {
                    // Save request result in cache (for predefined queries only - query with id)
                    fs.writeFile(cachefilename, result, function (err) {
                        if (err) {
                            console.log("Error while writing file " + cachefilename + " - " + err);
                        }
                    });
                }

            }

              // send result back to client: HTML + JS graphic specification
            res.writeHeader(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(result, "utf-8");

        } catch (e) {
            console.log("SPARQL request error - " + e);
            // send error back to client
            res.writeHeader(400, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.write(e, "utf-8");
        }

      
        res.end();
    });
})

//--------------------------------
// to send the query to the sparql endpoint
function prepare(query) {
    query = encodeURIComponent(query);
    query = query.replace(/\%20/g, "+");
    query = query.replace(/\(/g, "%28");
    query = query.replace(/\)/g, "%29");
    return query;
}

function sparqlQuery(query, uri, styleSheet) {
    query = prepare(query);

    // Configurer la requête SPARQL en format http
    var requestType = undefined;
    if (Object.keys(styleSheet).length > 0 && "httpmethod" in styleSheet &&
        (styleSheet.httpmethod === "get" || styleSheet.httpmethod === "post"))
        requestType = styleSheet.httpmethod.toUpperCase();

    var httpquery = uri + "?query=";
    httpquery = httpquery + query;
    httpquery = httpquery + "&format=application%2Fsparql-results%2Bjson";

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttpquery = new XMLHttpRequest();
    if (requestType === undefined)
        xmlhttpquery.open("GET", httpquery, false);
    else
        xmlhttpquery.open(requestType, httpquery, false);
    //xmlhttpquery.setRequestHeader("Accept", "application/sparql-results+json");
    xmlhttpquery.send();
    return xmlhttpquery.responseText;
}



app.listen(port, () => console.log(`Server started at port ${port}. Now you can find this page at http://covid19.i3s.unice.fr:${port}/index.html`));