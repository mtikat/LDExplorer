/**
 * LinkedDataViz
 * Client side JavaScript complement of HTML page query form
 * Functions processQuery() decode form and send SPARQL query to node proxy server
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
**/


const protocol = window.location.protocol +'//';
const hostname = window.location.host;
let page = null;

let globalParams = null,
    queriesList = null;

function setGlobalParameters(locals){
    globalParams = locals.params;
    page = locals.page;
}

function login() {
    location.href = protocol + hostname + '/' + page + '/login';
}

function logout() {
    location.href = protocol + hostname + '/' + page + '/logout';
}

function toast(message) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        type: "success",
        title: message
    });
}

// variables of control
// let selectedQuery = null;

/**
 * Creates an image to copy a value to the clipboard.
 * This value could is the metadata linked to the tag 'select' (metadata). metadata == '$' + name of tag 'select'
 *
 * @param {element} elem        Tag 'select'.
 */
function createCopyImg(elem) {
    var copyImg = document.createElement("img");
    copyImg.setAttribute('src', 'images/copy_icon.png');
    copyImg.setAttribute('class', 'copy');
    copyImg.setAttribute('title', 'Copy metavariable $' + elem.name);
    copyImg.onclick = function() { copyToClipboard('$' + elem.name); };
    return copyImg;
}

function getCountryLabel(value) {
    return globalParams.countries.filter(d => d.value == value)[0].name;
}

function getCountryCode(label) {
    return globalParams.countries.filter(d => d.name == label)[0].value;
}

function getLabLabel(value) {
    return globalParams.laboratories.filter(d => d.value == value)[0].name;
}

function getLabValue(label) {
    return globalParams.laboratories.filter(d => d.name == label)[0].value;
}

// value: form data
function setRes(values, times, mtime) {

    document.getElementById('query-title').innerHTML = "<b>Query title: </b>" + values.name;

    document.getElementById("time1").innerHTML = "Time to fetch data: " + times.query_time + "s"
    document.getElementById("time2").innerHTML = "Time to transform data: " + times.trans_time + "s"
    document.getElementById("time3").innerHTML = "Time to render the visualization: " + mtime + "s";

    document.getElementById("res1").innerHTML = "Number of SPARQL query results: " + times.res_number;
    document.getElementById("res2").innerHTML = "Number of nodes: " + times.node_number;
    document.getElementById("res3").innerHTML = "Number of links: " + times.edge_number;

    legend(values);
}

function legend(values) {
    if (values.legend != null) {
        var labels = values.legend.split("--");
        document.getElementById("first").innerHTML = labels[0];
        document.getElementById("second").innerHTML = labels[1];
        document.getElementById("legend").className = "visible";
    }
}

/*
 * complete SPARQL query with data from HTML form such as year, lab, country
 */
function tune(data) {
    let params = data.params;
    
    const lab1Label = params.lab ? params.lab[0] : null;
    const lab2Label = params.lab && params.lab.length > 1 ? params.lab[1] : null;
    // const countryLabel = params.country ? params.country : null;

    Object.keys(params).forEach(function(p) {
        // Replace metadata by selected value of corresponding list
        if (p == 'country' && params[p]) {
            // Parse country for Virtuoso
            data.query = data.query.replaceAll('$country', params[p])
            data.query = data.query.replace(/countrye/, params[p].replace(/ /, "_"));
            data.query = data.query.replace(/countryf/, getFrenchName(params[p]));
        } else if (p == 'period') {
            data.query = data.query.replaceAll('$beginYear', params[p][0])
            data.query = data.query.replaceAll('$endYear', params[p][1])
        } else if (p == 'lab' && params.type == 2) {
            data.query = data.query.replaceAll('$lab1', params[p][0])
            data.query = data.query.replaceAll('$lab2', params[p][1])
        } else if (p == 'lab') {
            data.query = data.query.replaceAll('$lab1', params[p][0])
        } else if (p == 'variables') {
            params[p].forEach((v,i) => {
                data.query = data.query.replaceAll('$term'+(i+1), v)
            })
        } else if (p == 'prefixes' && params[p]){
            params[p].forEach(pre => {
                data.query = pre + '\n' + data.query;
            })
        } else if (p == 'list_authors') {
            data.query = data.query.replaceAll('$authorsList', params[p])
        }
    });
}



// Renvoie le nom français d'un pays à partir de son nom anglais
function getFrenchName(country) {
    if (country == "France") return "France";
    if (country == "United Kingdom") return "Royaume-Uni";
    if (country == "United States") return "États-Unis";
    if (country == "Spain") return "Espagne";
    if (country == "Germany") return "Allemagne";
    if (country == "Italy") return "Italie";
    if (country == "Portugal") return "Portugal";
    if (country == "China") return "Chine";
    if (country == "Japan") return "Japon";
    if (country == "Vietnam") return "Vietnam";
    if (country == "Russia") return "Russie";
    if (country == "Brazil") return "Brésil";
    if (country == "Mexico") return "Mexique";
    if (country == "Morocco") return "Maroc";
    return "unknown";
}


function getValue(name, n) {
    return getElement(name, n).value;
}
function getElementIndex(name, n) {
    return document.getElementById(name+n);
}
function getElement(name) {
    return document.getElementById(name);
}

/**
 * Copies a string to the clipboard. Must be called from within an
 * event handler such as click. May return false if it failed, but
 * this is not always possible. Browser support for Chrome 43+,
 * Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
 * Internet Explorer: The clipboard feature may be disabled by
 * an administrator. By default a prompt is shown the first
 * time the clipboard is used (per session).
 */
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}
/**
 * Copies selected value of a list to the clipboard.

 * @param {element} selectTag   Tag 'select'.
 */
function copySelectValueToClipboard(selectTag) {
    copyToClipboard(selectTag.options[selectTag.selectedIndex].value);
}

function copyPrefixesToClipboard() {
    let prefixes = getPrefixes()
    copyToClipboard(prefixes.join('\n'))
}

/**
 * Creates JS data from HTML form.
 */
function getFormData(form) {
    //console.log("this processQuery");
    const type = page == 'hal' ? +form['query_type'].value : 1;
    
    const values = {
        'query': form['query_content'].value,
        'name': form['query_name'].value,
        'uri': form['query_endpoint'].value.trim(),
        'params': {
            "type": type
        }
    };

    if (['covid', 'hal'].includes(page)) {
        values.params['period'] = [+form['from_year'].value, +form['to_year'].value]
    }

    if (page == 'hal') {
        const lab1 = form['query_lab1'].value,
            lab2 = form['query_lab2'].value;
        if (type == 2 && lab1.length > 0 && lab2.length > 0) {
            values.params.lab = [lab1, lab2]
        } else if (lab1.length > 0) {
            values.params.lab = [lab1, null]
        } 
        values.params.country = type == 3 && form['query_country'].value.length > 0 ? form['query_country'].value : null;
        values.params.list_authors = null
        if (type == 4 && form['query_list_authors'].value.length) {
            values.params.list_authors = []
            form['query_list_authors'].value.split(',').forEach(d => {
                values.params.list_authors.push(`"${d.trim()}"`)
            })
            values.params.list_authors = values.params.list_authors.join(',')
        }
        

        // values.params.member = form['member'].checked;
        // values.params.both = form['both'].checked;
    } else {
        getVariables(values.params)
    }

    values.params.prefixes = getPrefixes()
    
    return values;
}

function getPrefixes(){
    const eltPrefix = d3.selectAll("input.prefix")
    if (eltPrefix.empty()) return;

    let prefixes = [];
    eltPrefix.each(function(d,i) {
        if (this.value) {
            prefixes.push(this.value);
        }
    })
    return prefixes
}

function getVariables(params){
    const elt = d3.selectAll("input.named_entity")
    if (elt.empty()) return;

    params.variables = [];
    elt.each(function() {
        if (this.value) {
            params.variables.push(getVariableCode(this.value) || this.value);
        }
    })
}

/** VERIFY WHAT IT DOES
 * Fill recursively values with form data.
 *
 * @param {element} elt   Root tag.
 * @param {dict} values   Values to fill.
 */
function getChildrenValues(elt, values) {
    for (var i = 0; i < elt.children.length; i++) {
        var child = elt.children[i];
        if (child.classList.contains("metadata")) {
            // Get query or metadata value
            values[child.name] = child.value;
        } else {
            getChildrenValues(child, values);
        }
    }

}

function checkStylesheet(element) {
    const checkboxes = document.getElementsByClassName("withStylesheet")
    for(checkbox of checkboxes) {
        element != checkbox ? checkbox.checked = !checkbox.checked : "";
    }
}

function collapseFormContent(element) {
    var coll = document.getElementsByClassName("collapsibleContent");
    var collapsibleSibling = element.nextElementSibling;
    element.classList.toggle("openedCollapsible");

    if(collapsibleSibling) {
        if (collapsibleSibling.style.maxHeight){
            collapsibleSibling.style.maxHeight = null;
          } else {
            collapsibleSibling.style.maxHeight = collapsibleSibling.scrollHeight + "px";
          }
    } else {
        for (collapsibleContent of coll) {
            if (collapsibleContent.style.maxHeight){
                collapsibleContent.style.maxHeight = null;
              } else {
                collapsibleContent.style.maxHeight = collapsibleContent.scrollHeight + "px";
              }
        }
    }

    // if we open the stylesheet the max height of the form must be updated
    if (element.id == 'stylesheet-content'){
        const queryForm = document.getElementById('tab');
        queryForm.style.maxHeight = (queryForm.scrollHeight + collapsibleSibling.scrollHeight) + 'px';
    }

}

function displayStylesheetInfo() {
    const helpText = document.getElementById('helpStylesheet')
    if (helpText.style.display == 'block')
        helpText.style.display = 'none';
    else helpText.style.display = 'block';
}

//// ?????
// function updateStylesheet(event) {
//     var sheets = document.getElementsByClassName("stylesheet");
//     for(sheet of sheets) {
//         sheet.innerHTML = event.target.value;
//     }
// }

// get the stylesheet code from the textarea
function getStyleSheet(form, value) {
    const content = document.getElementById("stylesheet");
    const active = document.getElementById("withStylesheet").checked;

    value.stylesheetActive = active; // set stylesheetActive property of query

    if (content && content.value.trim().length > 0) {
        try {
            value.stylesheet = JSON.parse(content.value); // set content of stylesheet
        } catch(e) {
            return e;
        }

        if (typeof(value.stylesheet.predefined_request_list) !== "undefined") // not touching this, no idea what predefined_request_list is about -- Aline
            value.stylesheet.predefined_request_list.forEach((elt, i) => {
                var _uri = null;
                document.querySelectorAll("input").forEach(_input => {
                if (_input.name === "uri_" + elt)
                    _uri = _input.value
                });
                var temp = {
                    "title": elt,
                    "uri": _uri,
                    "query": document.getElementById(elt).value
                };
                value.stylesheet.predefined_request_list[i] = temp;
            });
    }

    // console.log(form.style)
    // if (form.style != null) {
    //     // a query may desactivate style & stylesheet
    //     // value.style = form.style.checked;
    //     value.browser = "http://corese.inria.fr/service/covid?uri="
    // }
}




/**
 * executed in browser
 * send endpoint URI and SPARQL query to node server.js
 * get JSON result from transformation
 * apply graphic display
**/
function sendRequest(values, followupQuery) {
    const url = protocol + hostname + "/sparql"; // local server
   
    const data = {
        'query': values,
        'dataset': page
    }

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    }).then(response => {
        return response.text();
    }).then(text => {
        hideLoading();
        if (text.startsWith('Virtuoso')) {
            // Syntax error message
            window.alert(text);
            updateVisualizationSpace('none')
        } else if (text.startsWith('<')) {
            updateVisualizationSpace('none')
            const html = new DOMParser().parseFromString(text, 'text/html').body.childNodes[0]
            alert(html.textContent)
        } else {
            getResult(text, values, followupQuery);
        }
    }).catch(error => {
        console.log(error)
        alert(error);
    });
}

/*
    Receives the result from the query and proceed to visualization
*/
function getResult(text, values, followupQuery) {
    var result = null;
    
    try{
        result = JSON.parse(text);

        const sparqlResult = result[0];
    
        if (location.href.includes('results')) {
            globalParams.resultData = globalParams.type == 'sparql' ? sparqlResult : result[1];
            if (result.length == 1 && globalParams.type != 'sparql') {
                d3.selectAll('.loading').remove()
                window.alert(`The result set could not be transformed to be visualized with MGExplorer. There is nothing to export!`)
            } else {
                writeResults(result[1] === 'html')
            }
        }
        else {
            // the query returned html
            if (result[1] === 'html' || result.length === 1) {
                document.getElementById('visualisation_div').style.display = 'none';
                if (result[0].message) window.alert(result[0].message)
                else if (result[0].results && result[0].results.bindings.length == 0) window.alert("No results found for this query")
                else window.alert(`Results cannot be visualized with MGExplorer.\nPlease check your query so that it contains the variables ?s ?p ?o.\nYou can also inspect the result set by clicking on "Export SPARQL Query Results"`)
            } else {
                var times = result[2];
                var t1 = new Date();
                if (sparqlResult.results.bindings.length > 0) {
                    updateVisualizationSpace('block')
                    graphicDisplay(JSON.stringify(result[1]), values, followupQuery);
                    var t2 = new Date();
                    var mtime = parseInt(t2 - t1) / 1000;
                    setRes(values, times, mtime);
                }
                else {
                    updateVisualizationSpace('none')
                    window.alert(getMessage(values));
                }
            }
        }
    } catch (error) {
        const vis_div = document.getElementById('visualisation_div');
        if (vis_div) vis_div.style.display = 'none';
    
        if (error.toString().includes("launch is not defined")) {
           alert('The visualization cannot be loaded automatically, please click on "Visualize SPARQL Query Results" at the bottom of the form.') 
        } else alert(error)
    
    }
    
}

// Message in case of failure
function getMessage(values) {
    const params = values.params;
    let message = 'No results of co-publication found ';
    if (params.type == 2) {
        return message + " between " + params.lab[0] + " and " + params.lab[1] + " from " + params.period[0] + " to " + params.period[1] + ".";
    }
    else if (params.type == 3) {
        return message + " between " + params.lab[0] + " and " + params.country + " from " + params.period[0] + " to " + params.period[1] + "." ;
    } else {
        if (params.lab)
            return message + " in " + params.lab[0] + " from " + params.period[0] + " to " + params.period[1] + "." ;
        else return "No results found.";
    }
}


// data is JSON format resulting from transformation, input dor MGExplorer
// graphic display in ./MG-Explorer/MGExplorer/js/MGExplorer.js
function graphicDisplay(data, values, followupQuery) {
    const params = values.params,
        stylesheet = values.stylesheetActive ? values.stylesheet : null,
        fq = followupQuery || null,
        country = params.country || null,
        lab1 = params.lab ? params.lab[0] : null,
        lab2 = params.lab && params.lab.length > 1 ? params.lab[1] : null;
    
    launch(data, 
        page === 'ldviz' ? 'Relationship Network' : params.type, 
        //values.name,
        lab1, 
        lab2 || country, 
        stylesheet, 
        fq);
    
}


/*
    Display and hide the visualization space
*/
function updateVisualizationSpace(display){
    document.getElementById('visualisation_div').style.display = display;

    document.getElementById('viewArea').innerHTML = null;
}

function newQuery(email){
    if (email != null && email != "false") 
        location.href = protocol + hostname + '/' + page + '/newQuery';
    else {
        if ( confirm("Please login before proceeding!") ) login()
    }
}

function check(values) {
    if (values.endYear < values.beginYear) {
        window.alert("Error : The end year can not be larger than the begin year.");
        return false;
    }
    return true;
}


function showLoading(queryInfo){

    document.getElementById('visualisation_div').style.display = 'block';
    d3.select('div#visualisation_div').selectAll('p').html(null)

    let loadingInfo = queryInfo ? `Loading Query ${queryInfo.index}: ${queryInfo.name}` : '';

    document.getElementById("viewArea").innerHTML = `${loadingInfo} <br><i class="fas fa-spinner fa-spin fa-2x loading"></i>`;
}

function hideLoading() {
    const viewArea = document.getElementById("viewArea")
    if (viewArea) viewArea.innerHTML = null;
}

function isURI(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

/**
 * Main function
 */
function processQuery(form) {
    let data = getQueryData(form);

    if (data.uri.length == 0) {
        alert('You must provide a SPARQL Endpoint!')
        return
    } 
    
    if (data.query.trim().length == 0) {
        alert('You must provide a query!')
        return
    }

    if (!isURI(data.uri)) {
        alert('The SPARQL enpoint URL is not valid!')
        return
    }

    data.id = new Date().getTime();
    // selectedQuery = data.id;

    if (data.query.includes('$beginYear') && data.query.includes('$endYear')) {
        if (data.params.period[0] > data.params.period[1]) {
            alert('The selected time period is invalid. Please choose a different one and try again.')
            return
        }
    }

    showLoading()
    tune(data)
    sendRequest(data);
}

function getQueryData(form){
    let values = getFormData(form);

    if (document.getElementById("withStylesheet").checked){
        // catch errors that may happen when parsing the json content from the stylesheet textarea
        let res = getStyleSheet(form, values)
        if (res instanceof Error) {
            alert(res)
            return;
        }
    }

    return values;
}

function processQuickPreview(queryObject) {

    showLoading(queryObject)
    tune(queryObject);
    sendRequest(queryObject);
}

/**
 * Publish a new query of type 'n'
 */
function saveQuery(form) {

    // Get form values
    const values = {
        'query': getQueryData(form),
        'dataset': page
    }

    // tune(values.query);
    values.query.id = new Date().getTime();
    values.query.isLocked = true;
    values.query.isPublished = false;

    // Send request
    let url = protocol + hostname + "/saveQuery";
    fetch(url, {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values)
    }).then(response => {
        location.href = protocol + hostname + '/' + page;
    }).catch(error => {
        console.log(error);
    });
}

/**
 * Clear the cache of a query
 */
function clearQueryCache(queryid) {
    let values = {
        'id': queryid,
        'dataset': page
    };
    // Send request
    let url = protocol + hostname + "/clearcache";
    fetch(url, {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values)
    }).then(response => {
        //alert("Cache cleared");
        // toast({
		// 	type: 'success',
		// 	title: "Cache cleared!"
		// })
        toast("Cache cleared!")
        
    }).catch(error => {
        console.log(error);
    });
}


/**
 * Edit a query in the server
 * Asks for the user confirmation before making the request (edit published and locked status, or query content)
 * Redirect to the index when successful
 */
function editQuery(elem, query, value) {

    const message = 'Are you sure you want to ' + (elem.nodeName == 'I' ?  (elem.className.includes('fa-eye') ? (value ? 'PUBLISH' : 'UNPUBLISH') : (value ? 'LOCK' : 'UNLOCK')) + ' the query?' : " SAVE your changes?");

    if (confirm(message)) {
        let values = {};
        if (elem.nodeName == 'I') {
            if (elem.className.includes('fa-eye')) {
                // d3.select(elem).attr('class', d => d.isPublished ? 'far fa-eye' : 'far fa-eye-slash')
                values.isPublished = value;
                values.editType = 'publish';
            } else {
                // d3.select(elem).attr('class', value ? 'fas fa-lock' : 'fas fa-unlock')
                values.isLocked = value;
                values.editType = 'lock';
            }
        } else { // elem == form
            values = getQueryData(elem)
            // const oldQueryInfo = globalParams.queries.filter(d => d.id == query.id)
            values.isPublished = getQueryValue(query.id, 'isPublished');
            values.isLocked = getQueryValue(query.id, 'isLocked');
            values.editType = 'content';
        }

        values.id = query.id || query;
        values.dataset = page;

        let url = protocol + hostname + "/editQuery";
        fetch(url, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }).then(response => {
            if (values.editType == 'content')
                location.href = protocol + hostname + '/' + page;
            else {
                d3.select('#queries-list')
                    .selectAll('li')
                    .filter(d => d.id == query)
                    .selectAll('i')
                    .filter(d => d.value == values.editType)
                    .attr('class', () => {
                        switch(values.editType) {
                            case 'lock':                                
                                return values.isLocked ? 'query-icon fas fa-lock' : 'query-icon fas fa-unlock';
                            case 'publish':
                                return values.isPublished ? 'query-icon far fa-eye' : 'query-icon far fa-eye-slash';
                        }
                    })
                    .attr('data-tippy-content', d => {
                        switch(values.editType) {
                            case 'lock':                                
                                return values.isLocked ? 'Unlock Query' : 'Lock Query';
                            case 'publish':
                                return values.isPublished ? 'Unpublish Query' : 'Publish Query';
                        }
                    })
                let attr = values.editType == 'lock' ? 'isLocked' : 'isPublished';
                updateQueries(query, attr, value)
                setIconsTooltip()
            }
        }).catch(error => {
            console.log(error);
        });
    }
}

function updateQueries(queryId, attribute, value) {
    queriesList.forEach(d => {
        if (d.id == queryId) {
            d[attribute] = value;
        }
    })
}

function getQueryValue(queryId, attribute) {
    const query = queriesList.filter(d => d.id == queryId)[0];
    return query[attribute]
}

/**
 * Cancels changes and redirect on the index
 * Asks for the user confirmation before making the redirection
 */
function cancelChanges() {
    if (confirm("Are you sure that you want to DISCARD all changes?")) {
        location.href = protocol + hostname + '/' + page;
    }
}

/**
 * Deletes a query from the query list
 * Asks for the user confirmation before sending the request
 * Reload the page when successful
 */
 function deleteQuery(elt, queryid, dataset) {
    if (confirm("You are about to delete the query from the list (and the main page if published)!\nDo you want to proceed?")) {
        let values = {
            'id': queryid,
            'dataset': page
        };

        // Send request
        let url = protocol + hostname + "/delete";
        fetch(url, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }).then(response => {
            location.href = protocol + hostname + '/' + page;
        }).catch(error => {
            console.log(error);
        });
    }
}


function twoMembers(form) {
    var both = form.both.checked;
    if (both) {
        form.query_content.value = form.query_content.value.replace("#?s2 hsc:structure ?x", "?s2 hsc:structure ?x");
    }
    else {
        form.query_content.value = form.query_content.value.replace("?s2 hsc:structure ?x", "#?s2 hsc:structure ?x");
    }
}

function transitiveMember(form) {
    var trans = form.member.checked;
    if (trans) {
        form.query_content.value = form.query_content.value.replace("org:unitOf", "org:unitOf*");
    }
    else {
        form.query_content.value = form.query_content.value.replace("org:unitOf*", "org:unitOf");
    }
}

function setIconsTooltip(){
    d3.selectAll('.query-icon').each(function(){
        if (this._tippy) {
            this._tippy.destroy();
        }
    })

    tippy('.query-icon', {
        theme: 'light',
        placement: 'right-start',
        allowHTML: true,
        appendTo: document.body,
        followCursor: false,
        animation: 'scale'
    })
}


// update query options (lab, country, etc) according to the query type
function updateQueryOptions(){
    const queryType = +document.getElementById('select_query_type').value;
    switch(queryType) {
        case 1:
            document.getElementById('lab2_form').style.display = 'none';
            document.getElementById('country_form').style.display = 'none';
            document.getElementById('list_form').style.display = 'none';
            break;
        case 2:
            document.getElementById('lab2_form').style.display = 'table-row';
            document.getElementById('country_form').style.display = 'none';
            document.getElementById('list_form').style.display = 'none';
            break;
        case 3:
            document.getElementById('lab2_form').style.display = 'none';
            document.getElementById('country_form').style.display = 'table-row';
            document.getElementById('list_form').style.display = 'none';
            break;
        case 4:
            document.getElementById('lab1_form').style.display = 'table-row';
            document.getElementById('lab2_form').style.display = 'none';
            document.getElementById('country_form').style.display = 'none';
            document.getElementById('list_form').style.display = 'table-row';
            break;
    }
    updateFormMaxHeight()
}

function populateQueryList(existingQuery, email){
    //alert(email);
    const div = d3.select('div#queries-list')
        .styles({
            'overflow-y': 'auto',
            'height': queriesList.length == 0 ? '20px' : '150px'
        })

    if (queriesList.length == 0) {
        div.node().innerHTML = `We could not find any SPARQL queries in the server. Please click on <i class="fas fa-plus-circle" style='margin-left:0px;cursor:auto;'></i> below to begin.`
        return;
    }

    const list = div.append('ul')

    const item = list.selectAll('li')
        .data(queriesList)
        .enter()
            .append('li')
            .on('mouseover', function() {
                d3.select(this).style('background', '#e8f4f8')
            })
            .on('mouseout', function() {
                d3.select(this).style('background', 'transparent')
            })

    item.append('tspan')
        .styles(d => {
            return {
                'display': 'inline-block',
                'width': '78%',
                'font-weight': existingQuery && existingQuery.id == d.id ? 'bold' : 'auto'
            }
        })
        .text(d => 'Query ' + d.index + '. ' + d.name)

    const iconsData = [
        {'label': 'Visualize SPARQL Query Results', 'class': 'far fa-play-circle', 'value': 'visualize'},
        {'label': 'View SPARQL Query Results', 'class': 'fas fa-file-export', 'value': 'sparql_results'},
        {'label': 'View Query', 'class': 'far fa-file-code', 'value': 'view'},
        {'label': 'Edit Query', 'class': 'far fa-edit', 'value': 'edit'},
        {'label': 'Clone Query', 'class': 'far fa-clone', 'value': 'clone'},
        {'label': 'Lock Query', 'label2': 'Unlock Query', 'class': 'fas fa-lock', 'class2': 'fas fa-unlock', 'value': 'lock'},
        {'label': 'Publish Query', 'label2': 'Unpublish Query', 'class': 'far fa-eye', 'class2': 'far fa-eye-slash', 'value': 'publish'},
        {'label': 'Delete Query', 'class': 'far fa-trash-alt', 'value': 'delete'},
        {'label': 'Clear Query Cache', 'class': 'fas fa-broom', 'value': 'clear'}]

    item.selectAll('i')
        .data(iconsData)
        .enter()
            .append('i')
            .attr('class', function(d){
                const query = d3.select(this.parentNode).datum()
                let value = 'query-icon ';
                switch(d.value) {
                    case 'publish':
                        return value + (query.isPublished ? d.class : d.class2);
                    case 'lock':
                        return value + (query.isLocked ? d.class : d.class2);
                    default:
                        return value + d.class;
                }
            })
            .attr('data-tippy-content', function(d) {
                const query = d3.select(this.parentNode).datum()
                switch(d.value) {
                    case 'publish':
                        return !query.isPublished ? d.label : d.label2;
                    case 'lock':
                        return !query.isLocked ? d.label : d.label2;
                    default:
                        return d.label;
                }
            })
            .on('click', function(d) {
                const query = d3.select(this.parentNode).datum()
                switch(d.value){
                     case 'view':
                        if (email != null && email != "false") 
                            location.href = protocol + hostname + '/' + page + '/view?queryId=' + query.id;
                        else {
                            if ( confirm("Please login before proceeding!") ) login()
                        } 
                        break;
                     case 'edit':
                        if (email != null && email != "false")
                            location.href = protocol + hostname + '/' + page + '/edit?queryId=' + query.id;
                        else {
                            if ( confirm("Please login before proceeding!") ) login()
                        }
                        break;
                     case 'clone':
                        if (email != null && email != "false") 
                            location.href = protocol + hostname + '/' + page + '/clone?queryId=' + query.id;
                        else {
                            if ( confirm("Please login before proceeding!") ) login()
                        }
                        break;
                     case 'visualize':
                        processQuickPreview(query);
                        break;
                     case 'delete':
                         if (email != null && email != "false") {
                            if (getQueryValue(query.id, 'isLocked')) {
                                alert('The query is locked. You cannot delete it!')
                                return;
                            }
                            deleteQuery(this, query.id);
                        } else {
                            if ( confirm("Please login before proceeding!") ) login()
                        }
                        break;
                    case 'clear':
                        clearQueryCache(query.id)
                        break;
                     case 'lock':
                        if (email != null && email != "false") 
                            editQuery(this, query.id, !getQueryValue(query.id, 'isLocked'))
                        else {
                            if ( confirm("Please login before proceeding!") ) login()
                        }
                        break; 
                     case 'publish':
                        if (email != null && email != "false") 
                            editQuery(this, query.id, !getQueryValue(query.id, 'isPublished'))
                        else {
                            if ( confirm("Please login before proceeding!") ) login()
                        }
                        break; 
                    case 'sparql_results':
                        loadResultsPage('sparql', query);
                        break;
                }
            })

    setIconsTooltip()
}



// display the editor window with information regarding the selected query
function displayQuery(query, action) {
    const collapsibleButton = document.getElementById('query-button');
    collapsibleButton.style.display = 'block';

    if (action != 'newQuery') {
        // selectedQuery = query.id;

        document.getElementById('form_queryTitle').value = query.name;
        document.getElementById('form_sparqlQuery').value = query.query;
        document.getElementById('form_sparqlEndpoint').value = query.uri;

        if (query.stylesheet) {
            document.getElementById("withStylesheet").checked = query.stylesheetActive;
            document.getElementById('stylesheet').value = JSON.stringify(query.stylesheet, undefined, 4);
        }

        const params = query.params;

        if (page == 'hal') {
            document.getElementById('select_query_type').value = params.type;
            // document.getElementById('form_member').checked = params.member || false;
            // document.getElementById('form_both').checked = params.both || false;
            document.getElementById('input_lab1').value = params.lab ? params.lab[0] : "";
            document.getElementById('input_lab2').value = params.lab && params.lab.length > 1 ? params.lab[1] : "";
            document.getElementById('input_country').value = params.country || "";
            document.getElementById('input_list').value = params.list_authors ? params.list_authors.replaceAll('"', '') : "";

            updateQueryOptions()
            // twoMembers(document.getElementById('query_form'))
            // transitiveMember(document.getElementById('query_form'))
        } else if (params) {
            d3.selectAll("tr[id*='variable-']").remove()
            if (params.variables)
                params.variables.forEach(d => {
                    addVariable(getVariableLabel(d) || d)
                })
        }

        if (params) {
            if (params.prefixes)
                params.prefixes.forEach(d => {
                    addPrefix(d)
                })

            if (params.period) {
                document.getElementById('select_from_year').value = params.period[0];
                document.getElementById('select_to_year').value = params.period[1];
            }
        }
    }

    d3.selectAll('.edit_button').style('display', action == 'view' ? 'none' : 'block')

    const form = document.getElementById('query_form');
    if (['newQuery', 'clone'].includes(action)) document.getElementById('save_button').onclick = function() { saveQuery(form) }; //d3.select('.save_button').on('click', function() { saveQuery(this.form); })

    if (action == 'clone') {
        document.getElementById('form_queryTitle').value = 'Copy of ' + query.name;
    } else if (action == 'edit') {
        document.getElementById('save_button').onclick = function() { editQuery(form, query) };
    } else if (action == 'newQuery') {
        d3.select('input#save_button').attr('value', 'Save Query');
    } else if (action == 'view') {
        const cancelButton = document.getElementById('cancel_button')
        cancelButton.style.display = 'block';
        cancelButton.value = 'Close Query View';
        cancelButton.onclick = function() { location.href = protocol + hostname + '/' + page; };
    }

    updateFormMaxHeight()
}

// not in use anymore
function setPublicationYearSelects(){
    d3.select('#query_parameters').select('table').select('tbody').node().innerHTML += `
        <tr><td>Publication Period</td><td>From <i class="far fa-copy"></i> 
            <select id='select_from_year' name='from_year'></select>
        </td>
        <td>To <i class="far fa-copy"></i> 
            <select id='select_to_year' name='to_year'></select>
        </td></tr>`

    populateYearSelect();
}

function setMetavariableCopy(){
    d3.select('#query_parameters').select('table').select('tbody').selectAll('i')
        .classed('query-icon', true)
        .attr('data-tippy-content', function() { 
            if (this.className.includes('plus') && this.className.includes('prefixes')) return 'Click here to include a new prefix to your query';
            else if (this.className.includes('copy-prefixes')) return 'Copy prefixes to clipboard';
            else if (this.className.includes('plus') && this.className.includes('entities')) return 'Click here to include a new Named Entity to your query' 
            else if (this.className.includes('info-circle'))
                return `To use the custom variables below, include the corresponding metavariable in your query (get it by clicking on <i class="far fa-copy"></i> next to the variable name)` 
            else return 'Copy metavariable '+ getMetavariable(this) +' to clipboard'; 
        })
        .on('click', function() { copyToClipboard(getMetavariable(this)); }) // copy metavariable

    function getMetavariable(elt){
        const variable = elt.parentNode.firstChild.textContent;
        
        if (variable.includes('Institution 2')) {
            return '$lab2';
        }
        else if (variable.includes('Institution')) {
            return '$lab1'; // depends on the query type
        }else if (variable.includes('From')){
            return '$beginYear';
        }else if (variable.includes('To')){
            return '$endYear';
        }else if (variable.includes('Country')) {
            return '$country'
        } else if (variable.includes('List of Authors')) {
            return '$authorsList'
        }
    }
}

function initPage(locals, email){
    //alert(email);
    if (['hal', 'covid'].includes(page) && !locals.queryParams) {
        document.getElementById('params_title').style.display = 'table-row';
        document.getElementById('period_form').style.display = 'table-row';
        initPeriodList()
    }

    if (page == 'hal') {
        if (!locals.queryParams) {
            document.getElementById('type_form').style.display = 'table-row';
            document.getElementById('lab1_form').style.display = 'table-row';
            
            d3.select('#select_query_type')
                .selectAll('option')
                .data(globalParams.query_types)
                .enter()
                    .append('option')
                    .attr('value', d => d.value)
                    .text(d => d.value + ' - ' + d.name)

            d3.selectAll("datalist[id*='laboratory']")
                .selectAll('option')
                .data(globalParams.laboratories)
                .enter()
                    .append('option')
                    .attr('value', d => d.name)
                    .text(d => d.name + ' (' + d.source + ')')

            d3.select('#select_country')
                .selectAll('option')
                .data(globalParams.countries)
                .enter()
                    .append('option')
                    .attr('value', d => d.name)
                    .text(d => d.name)
            setIconsTooltip()    
        }

        d3.select('div#titleDiv').select('h1').text('Hal Linked Data Visualizer')
        
    } 

    if (page == 'covid') {
        if (!locals.queryParams) {
            document.getElementById('custom_variables').style.display = 'table-row';
            initVariablesList()
        }
        
        d3.select('div#titleDiv').select('h1').text('Covid Linked Data Visualizer')
    }

    if (page == 'ldviz') {
        d3.select('div#titleDiv').select('h1').text('Linked Data Visualizer')
    }

    if (locals.queryParams) {
        document.getElementById('prefixes').style.display = 'none';
    }

    if (locals.action) { // verify this
        locals.existingQuery.uri = Object.keys(locals.existingQuery).length > 0 ? locals.existingQuery.uri : globalParams[page+'_uri']
        displayQuery(locals.existingQuery, locals.action)
        setTabAction() // for using tabs inside textarea
    }

    queriesList = locals.queries;
    // populate the list of queries
    queriesList.forEach((d,i) => {
        d.index = i+1;
    })
    populateQueryList(locals.existingQuery, email)

    initPrefixesList()
    initEndpointsList()
    setMetavariableCopy()

    if (locals.existingQuery)
        updateFormMaxHeight()
}

function initEndpointsList(){
    d3.select('#list_endpoints')
        .selectAll('option')
        .data(globalParams.endpoints)
        .enter()
            .append('option')
            .attr('value', d => d.url)
            .text(d => d.name)
}

function initPeriodList(){
    const currentYear = new Date().getFullYear();
    d3.select('#select_from_year')
        .selectAll('option')
        .data(d3.range(currentYear, 1900, -1))
        .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d)

    d3.select('#select_to_year')
        .selectAll('option')
        .data(d3.range(currentYear, 1900, -1))
        .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d)
            //.property('selected', d => d == currentYear)
}

function initPrefixesList(){
    d3.select('#prefixes_list')
        .selectAll('option')
        .data(globalParams.prefixes)
        .enter()
            .append('option')
            .attr('value', d => d.value)
            .text(d => d.name + ' (' + d.id + ')')
}

function addPrefix(value){
    const table_tr = d3.select('tr#prefixes')
        .append('tr')
        .append('td')

    table_tr.append('input')
        .style('width', '440px')
        .style('margin-top', '5px')
        .style('margin-left', '8px')
        .attr('list', "prefixes_list")
        .attr('class', 'prefix')
        .attr('value', value || "")

    table_tr.append('i')
        .classed("fas fa-times", true)
        .style('margin-left', '5px')
        .on('click', function(){
            d3.select(this.parentNode).remove()
        })

    updateFormMaxHeight()
}



function getVariableCode(label){
    const variable = globalParams.sparqlKeywords.filter(d => d.name == label)
    return variable.length > 0 ? variable[0].value : null;
}

function getVariableLabel(code){
    const variable = globalParams.sparqlKeywords.filter(d => d.value == code)
    return variable.length > 0 ? variable[0].name : null;
}

function initVariablesList(){
    d3.select('#named_entities_list')
        .selectAll('option')
        .data(globalParams.sparqlKeywords)
        .enter()
            .append('option')
            .attr('value', d => d.name)
            .text(d => d.name)
}

function addVariable(value){
    const termId = d3.selectAll('input.named_entity').size() + 1;

    const table_tr = d3.select('tr#custom_variables')
        .append('tr')
        .attr('id', 'term'+termId)
        .append('td')

    table_tr.append('input')
        .style('width', '420px')
        .style('margin-top', '5px')
        .style('margin-left', '8px')
        .attr('list', "named_entities_list")
        .attr('class', 'named_entity')
        .attr('value', value || "")

    table_tr.append('i')
        .classed("fas fa-times", true)
        .style('margin-left', '5px')
        .on('click', function(){
            d3.select(this.parentNode.parentNode).remove()

            d3.select('tr#custom_variables')
                .selectAll('tr')
                .attr('id', (_, i) => 'term'+(i+1))
                .selectAll('i.fa-copy')
                .attr('data-tippy-content', function(d,i) {
                    const term = this.parentNode.parentNode.id;
                    return 'Copy Metavariable $' + term + ' to Clipboard'
                })
            setIconsTooltip()
        })

    table_tr.append('i')
        .classed('far fa-copy query-icon', true)
        .style('margin-left', '5px')
        .attr('data-tippy-content', function(d,i) {
            const term = this.parentNode.parentNode.id;
            return 'Copy Metavariable $' + term + ' to Clipboard'
        })
        .on('click', function(){
            const term = this.parentNode.parentNode.id;
            copyToClipboard('$' + term)
        })
    
    setIconsTooltip()
    updateFormMaxHeight()
}

/////////////////////////////////////////////////////////////////////////////
// Functions to manage the viewing/exporting of queries and queries' results

function loadResultsPage(type) {
    let queryData = arguments.length > 1 ? arguments[1] : undefined;  
    if (queryData === undefined) {
        queryData = getFormData(document.getElementById('query_form'))
        tune(queryData)
    }

    const args = "id=" + queryData.id +
        "&query=" + encodeURIComponent(queryData.query) + 
        "&uri=" + queryData.uri + 
        "&params=" + encodeURIComponent(queryData.params) +
        "&name=" + queryData.name;

    window.open(protocol + hostname + '/' + page + "/results?" + args + "&resultsType=" + type);
}

function writeResults(html){
    d3.selectAll('.loading').remove()
    if (html) {
        document.getElementById('json-renderer').style.display = 'none';
        const htmlRenderer = document.getElementById('html-renderer')
        htmlRenderer.innerHTML = globalParams.resultData;
        let child = htmlRenderer.firstChild;
        while (child) {
            let sibling = child.nextSibling;
            if (child.nodeName != 'TABLE') child.remove()
            child = sibling;
        }
        document.getElementById('results-download').onclick = function() { exportTableToCSV(globalParams.type + '_results.csv'); }
    }
    else {
        $('#json-renderer').jsonViewer(globalParams.resultData)
        document.getElementById('results-download').onclick = function() { exportResults(); }
    }
}

function exportSparqlQuery(){
    let data = getQueryData(document.getElementById('query_form'));
    tune(data)
    const query = data.query;
    download(query, 'sparql_query.rq')
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToCSV(filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j].innerText);
        
        csv.push(row.join(","));        
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}

function exportResults(){
    download(JSON.stringify(globalParams.resultData, undefined, 4), globalParams.type + '_results.json')
}

function exportStylesheetContent(){
    download(document.getElementById('stylesheet').value, 'stylesheet.json')
}

function download(content, fileName) {
    const a = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function updateFormMaxHeight(){
    const formDiv = document.getElementById('tab');
    formDiv.style.maxHeight = formDiv.scrollHeight + "px";
}

function setTabAction() {
    document.getElementById('form_sparqlQuery').addEventListener('keydown', function(e) {
        if (e.key == 'Tab') {
          e.preventDefault();
          var start = this.selectionStart;
          var end = this.selectionEnd;
    
          // set textarea value to: text before caret + tab + text after caret
          this.value = this.value.substring(0, start) +
            "\t" + this.value.substring(end);
    
          // put caret at right position again
          this.selectionStart =
            this.selectionEnd = start + 1;
        }
    });
}













