/**
 * LinkedDataViz Transformation 
 * Server Side
 * Transform SPARQL Result JSON Format to MGExplorer JSON Format
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
**/


let types = {};

const defaultType = "not informed";

const undef = "undef";
const skip  = "skip";
const mix   = "mix";

const endpoint_array = ["http://servolis.irisa.fr/dbpedia/sparql"];

function isURI(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function setTypes(values) {
    if (values.length > 4) {
        values.slice(0,3).forEach(d => { 
            let key = getTypeLabel(d)
            if (Object.keys(types).includes(key))
                types[key].push(d)
            else types[key] = [d];
        })
        types['Other'] = values.slice(3, values.length)
    } else if (values.length > 0) {
        values.forEach(d => { 
            let key = getTypeLabel(d)
            if (Object.keys(types).includes(key))
                types[key].push(d)
            else types[key] = [d];
        })
    } else {
        types[defaultType.charAt(0).toUpperCase() + defaultType.slice(1)] = [defaultType];
    }

    const nbKeys = Object.keys(types).length;
    for (let i = 0; i < 4 - nbKeys; i++) { // complete with "garbage" if less than 4 types
        types['z'+i] = [];
    }

    function getTypeLabel(label){
        return isURI(label) ? label.split('/').pop() : label.charAt(0).toUpperCase() + label.slice(1);
    }
}

function getTypeLabels() {
    return Object.keys(types);
}
    
// Transformer l'uri de type vers une chaîne de caractère simple
function transformType(type) {
    let newType = null;
    Object.keys(types).forEach(key => {
        if (types[key].includes(type)) 
            newType = key;
    })
    return newType || 'Unknown';
}

const name1 = "s";
const name2 = "o";
const type  = "type";
const doc   = "doc";

const languages = [
    "en", "pt", "es", "de", "fr"
];

// demander la longueur d'un set
// set : Javascript Set
// $return : la longueur du Set (integer)
function getLen(set) {
    var l = 0;
    for (var x of set) {
        l++;
    }
    return l;
}

// demander une valeur dans le résultat SPARQL
// data : résultat SPARQL
// i : indice de data (number, integer)
// name : nom de la variable (n1, n2, doc, title, ...)
function getValue(data, i, name) {
    return name in data[i] ? data[i][name].value : ' ';
}

// prendre le nom complète d'un auteur et donner son nom abbrégé (par ex. getShortName("Yun Tian") = "Y. Tian" )
// à optimiser : getShortName("Catherine Faron Zucker") donne "C. Zucker" mais "C. Faron Zucker" est attendu
function getShortName(fullname) {
    var words = fullname.split(" ");
    var firstname = words[0];
    var lastname = words[words.length - 1];
    var shortname = firstname[0] + ". " + lastname;
    return shortname;
}



// Calculer la quantité totale de publications d'un auteur ou de copublications entre deux auteurs
// qtEachType : vecteur à longueur 4 (Array of number, integer)
// $return : la somme des chiffres dans l'Array (number, integer)
function findQtPub(qtEachType) {
    var sum = 0;
    for (var i = 0; i < qtEachType.length; i++) {
        sum = sum + Number(qtEachType[i]);
    }
    return sum;
}



// map:  type -> index of type in typecount = createTypeIndex(types)
// typecount: array of counter for each document type
function findQtTypeCo(data, authorname, coauthorname, typecount, map) {
    data.forEach(ele => {
        let ind = Object.keys(types).indexOf(transformType(ele.type.value))
        if (ele.s.value == authorname && ele.o.value == coauthorname) {
            typecount[ind] += 1;
        }
                
        if (ele.test && ele.test.value == "true") {
            if (ele.o.value == authorname && ele.s.value == coauthorname) {
                typecount[ind] += 1;
            }
        }
    });
}

// Trouver la quantité de copublications en certaine langue entre deux auteurs
// data : résultat SPARQL
// authorname : nom complet de l'auteur (string)
// coauthorname : nom complet du coauteur (string)
// languageName : nom de la langue (string)
// $return : la quantité de copublications en certaine langue entre deux auteurs (number, integer)
function findQtOneLanCo(data, authorname, coauthorname, languageName) {
    var s = 0;
    var index = data.findIndex(function (ele) {
        var na = ele.s.value;
        var nc = ele.o.value;
        var la = ele.lan.value;
        if (na == authorname && nc == coauthorname && la == languageName) {
            s++;
        }
    });
    return s;
}


// Trouver le nom complet d'un auteur à partir de son id dans nodes
// nodes : objet créé pendant la transformation
// i : l'id de l'auteur (number, integer)
// $return : nom complet de l'auteur (string)
function getNameById(nodes, i) {
    return nodes.dataNodes[i].labels[1];
}



// Transformer le format spéciale d'une date vers l'année en 4 chiffres ($return string)
function transformDate(dateuri) {
    dateuri = String(dateuri);
    dateuri = dateuri.replace('\"', "");
    return dateuri.substr(0, 4);
}

function isInclude(arr, ele) {
    for (var i=0; i<arr.length; i++) {
        var same = similar(ele.authorID, ele.coauthorID, arr[i].authorID, arr[i].coauthorID);
        if (same) {
            return true;
        }
    }
    return false;
}

function similar(i1, i2, j1, j2) {
    return (i1 == j1 && i2 == j2) || (i1 == j2 && i2 == j1);
}

// Fonction développée pour visualiser les données demandées par la technique "Papers' List"
// data : résultat SPARQL
// nodes : objet créé pendant la transformation
// $return : un Array dont chaque élément (objet) représente un document avec toutes ses informations

function myFindDocumentInformation(data, nodes, idMap) {
    var docMap = new Map();
    
    for (var i = 0; i < data.length; i++) {
        var elem = data[i];
        var dc = elem.p.value;  
        
        // modify tp to be an object with the index and name of the type (allowing for coherence among views)
        // then modify the access on the paper list and histogram charts
        if (! docMap.has(dc)) {
            var tp = transformType(elem.type.value);
            var dt = elem.date ? transformDate(elem.date.value) : null;
            var tt = elem.label ? elem.label.value : elem.p.value;
            var pmid = elem.pmid ? elem.pmid.value : null;
            var authors = [];
            var desc = {"type": {'label': tp, 'index': Object.keys(types).indexOf(tp)}, 
                        "date": dt, 
                        "title": tt, 
                        "authors": authors, 
                        "link": elem.url ? elem.url.value : dc,
                        "id": pmid};
            
            if (elem.authorList) {
                desc.authorList = elem.authorList.value;
            }
            docMap.set(dc, desc);
        }
        
        var docu = docMap.get(dc);
        var aut  = docu.authors;
        
        var n1 = elem.s.value;
        var n2 = elem.o.value;
        var i1 = idMap.get(n1);
        var i2 = idMap.get(n2);
        
        if (!aut.includes(i1)) aut.push(i1);
        if (!aut.includes(i2)) aut.push(i2);
        docu.authors = aut;
    }
    
    var allDocs = []; 
    for (let dd of docMap.values()) {
        allDocs.push(dd);
    }

    return allDocs;
}


// docInfo : Array créé par la fonction findDocumentInformation
// nodes : Array créé pendant la transformation
// authorId : l'id de l'auteur dans nodes
// coauthorId : l'id du coauteur dans nodes
// $return : les documents que les 2 auteurs ont copubliés (sous-ensemble de docInfo)
function findCoDoc(docInfo, nodes, authorId, coauthorId) {
    var l = docInfo.length;
    var docArray = [];
    for (var i = 0; i < l; i++) {
        var doc = docInfo[i];
        var dc = doc.link;
        if (doc.authors.includes(authorId) && doc.authors.includes(coauthorId)) 
            docArray.push(doc);
    }
    return docArray;
}

// Filtrer les résultats SPARQL dont le type du document ne correspond pas aux 4 types choisis
function deleteIrrelevantTypes(data) {
    data = data.filter(function (item) {
        complete(item);
        var tp = item.type ? item.type.value : null;
        var bb = Object.values(types).some(d => d.includes(tp));

        var ok = item.author || (item.s && item.o && item.s.value != "" && item.o.value != "");
        
        return ok && bb;
    });
    return data;
}

function complete(item) {
    if (item.type == null) {
        item.type = {"value": defaultType};
    }
    // if (item.lan == null) {
    //     item.lan = {"value": "en"};
    // }
    // if (item.date == null) {
    //     item.date = {"value": "2020-01-01"};        
    // }
    // if (item.label == null) {
    //     item.label = {"value": "Undefined"};        
    // }
}

// add a2 in a1 coauthor set
function addCoauthor(map, a1, a2) {
    if (! map.has(a1)) {
        map.set(a1, new Set());
    }
    var aset = map.get(a1);
    aset.add(a2);
}

/**
 * sparql result elem may contain styles for nodes with variable ?style and ?mix
 * styleMap :  author -> style
 * variable ?mix when it exists is the style to assign to a node having two different styles
 */
function defStyle(stylesheet, styleMap, a1, a2, elem) {
    var mix = undef;
    if (elem.mix != null) {
        mix = elem.mix.value;
    }
    if (elem.style1 != null) {
        addStyle(stylesheet, styleMap, a1, elem.style1.value, mix);    
    }
    if (elem.style2 != null) {
        addStyle(stylesheet, styleMap, a2, elem.style2.value, mix);    
    }
    if (elem.style != null) {
        addStyle(stylesheet, styleMap, a1, elem.style.value, mix);    
        addStyle(stylesheet, styleMap, a2, elem.style.value, mix);    
    } 
}

/**
 * name is either the name of a style in the stylesheet of the name of a color
 */
function getStyle(stylesheet, name) {
    if (stylesheet.node != null && stylesheet.node[name] != null) {
        // style name
        var elem = stylesheet.node[name];
        if (elem.color != null) {
            return elem.color;
        }
    }
    // color name
    return name;
} 

/**
 * Assign a style to author node in the style map
 * mixvar is a backup style in case node already has a style, comes from ?mix variable
 */
function addStyle(stylesheet, map, node, style, mixvar) {
    if (style == skip) {
        // do nothing yet, style may be set by another result
    }
    else if (map.has(node)) {
        // node already has style
        var val = map.get(node);
        if (val != style) {
            // different styles for same node
            if (mixvar != undef) {
                // set mix style from ?mix variable
                map.set(node, mixvar);
            }
            else if (stylesheet.node != null && stylesheet.node.mix != null ) {
                // set mix style from stylesheet
                getMixValue(stylesheet, map, node, val, style);
            }
        }
    }
    else {
        map.set(node, style);
    }
}



/**
 * value: current value 
 * style: new value
 */ 
function getMixValue(stylesheet, map, node, value, style) {
    if (stylesheet.node[value] != null && stylesheet.node[value].priority != null &&
        stylesheet.node[style] != null && stylesheet.node[style].priority != null) {
        if (stylesheet.node[value].priority < stylesheet.node[style].priority) {
            // prefer old style
        }
        else {
            // prefer new style 
            map.set(node, style);
        }
    }
    else {
        // mix is the name of the mix style
        map.set(node, mix);
    }
}




/**
 * Style eventually assigned to mgexplorer author node data structure
 * When there is a stylesheet with default style, return default color
 */
function getFinalStyle(stylesheet, map, node) {
    if (map.has(node)) {
        return getStyle(stylesheet, map.get(node));
    }
    if (stylesheet.node != null && stylesheet.node.default != null && stylesheet.node.default.color != null) {
        return stylesheet.node.default.color;
    }
    return undef;
}

function theStyle(stylesheet, name) {
    // color name such as "green" :
    return name;
}

/**
* i = index of type in array of types
* increment the counter of documents of type i for author a
* docMap:  author -> Set of doc
* typeMap: author -> array of number of documents by type
**/
// addType(docMap, docTypeMap, a1, doc, typeIndex.get(type));
function addType(docMap, typeMap, a, doc, i) {
    if (! docMap.has(a)) {
        docMap.set(a, new Set());
    }

    if (!typeMap.has(a)) {
        var arr = createTypeCounterArray(types);
        typeMap.set(a, arr);
    }

    var docSet = docMap.get(a);
    if (!docSet.has(doc)) {
        docSet.add(doc);
        incrementType(typeMap.get(a), i)
    }
}

function incrementType(typeArray, i) {
    typeArray[i] ++;
}

// create an array of number of documents by type
function createTypeCounterArray(types) {
    return new Array(Object.keys(types).length).fill(0);
}


// document type -> index of doc type
function createTypeIndex(types) {
    let map = new Map();
    Object.keys(types).forEach((d,i) => map.set(d, i));
    return map;
}


/** 
 * data = SPARQL query  result bindings in JSON format
 * if there is a author variable with the list of authors,
 * split this list into pairs of n1, n2 and complete the bindings with 
 * these fake results in such a way to be compliant with the transformation
 * 
 */
function prepareResult(data) {
    if (data.length > 0 && data[0].author != null) {
        // author = a--b--c
        return split(data);
    }
    else {
        // n1 = a, n2 = b
        return data;
    }
}

// process each result
function split(data) {
    var res = [];
    for (var i = 0; i<data.length; i++) {
        push(data[i], res);
    }
    return res;
}

/**
 * Rewrite one result 
 * {author = "a ; b ; c"}
 * as several results 
 * {n1 = a, n2 = b} {n1 = a, n2 = c} {n1 = b, n2 = c}
 * 
 **/
function push(elem, res) {
    var authorList = elem.author.value.split("--");
    if (authorList.length > 1) {
        for (var i = 0; i<authorList.length; i++) {
            for (var j = i+1; j<authorList.length; j++) {
                var obj = copy(elem);
                obj.s = {"type": "literal", "value": authorList[i]};
                obj.o = {"type": "literal", "value": authorList[j]};
                if (elem.style != null) {
                    obj.style = elem.style;
                }
                res.push(obj)
            }
        }
    }
    return res;
}

function copy(elem) {
    var obj = elem.constructor();
    for (var attr in elem) {
        if (elem.hasOwnProperty(attr)) obj[attr] = elem[attr];
    }
    return obj;
}



/** 
 * Main Fonction  
 * input: whole JSON received by server (contains SPARQL query, type and endpoint)
 * send query to SPARQL endpoint
 * process JSON Transformation
**/
function transform(res1, q_type, stylesheet) {
    
    var ti1 = new Date();
   
    var data = res1.results.bindings; 
    
    types = {}; // reinitialize types

    // select unique values of attribute (variable ?type)
    let typeList = [];
    let typeCount = {};

    if (data.length > 0 && data[0].type) {
        typeList = data.map(d => d.type.value)
        typeList.forEach(d => {
            if (Object.keys(typeCount).includes(d)) typeCount[d] ++;
            else typeCount[d] = 1;
        })
        typeList = typeList.filter((d,i) => typeList.indexOf(d) == i)
        typeList.sort((a,b) => typeCount[b] - typeCount[a])
    }

    // set types according to attribute variable (uses only the first 4 elements for now)
    setTypes(typeList)
    data = deleteIrrelevantTypes(data); // Remove data with undefined document type
    data = prepareResult(data);
    var ti2 = new Date();
    var len = data.length;

    var numNodes, numEdges;

    // Créer le corps de l'objet json par rapport au format attendu par MG-Explorer
    // Les données seront remplies dans "dataNodes" et "dataEdges"
    var nodes = nodeFormat();
    var edges = edgeFormat();

    // var not = "Not Informed"; // Remplir aux termes non-obligatoires
    var typeIndex = createTypeIndex(types);
    // author -> style (graph node color style)
    var styleMap = new Map();
    // set of all authors
    var authorSet = new Set();
    // author -> Set(coauthor)
    var authorMap = new Map();
    // author -> Set(document)
    var docMap = new Map();
    // author -> [nb doc type_i]
    var docTypeMap = new Map();
    
    // for each solution
    data.forEach(elem => {
        
        let a1 = elem.s.value;
        let a2 = elem.o.value;
        let type = transformType(elem.type.value);
        let doc = elem.p.value;

        authorSet.add(a1);
        authorSet.add(a2);
        
        // coauthor set
        addCoauthor(authorMap, a1, a2);
        addCoauthor(authorMap, a2, a1);

        // count doc by type of doc
        addType(docMap, docTypeMap, a1, doc, typeIndex.get(type));
        addType(docMap, docTypeMap, a2, doc, typeIndex.get(type));
        
        if (stylesheet) defStyle(stylesheet, styleMap, a1, a2, elem)
    })

    var id = 0;
    // name -> ID
    var idMap = new Map();
         
    // generate node data structure
    for (var author of authorSet) {
        var shortName = getShortName(author);
        var coauthorSet = authorMap.get(author);
        var qtCoauthor = coauthorSet.size;            
        var qtEachType = docTypeMap.get(author);
        
        // lb is a style info to specify graph node color in MG-Explorer/nodeEdge/js/nodeEdgeChart.js
        var lb = 1;
        var style = undef;
        
        if (q_type && q_type == 2) {
            lb = getLB(data, author);      
        }
        else if (q_type) {
            style = stylesheet ? getFinalStyle(stylesheet, styleMap, author) : null;
        }
        
        if (coauthorSet.size != 0) {
            idMap.set(author, id);
            var nodeInfo = getNodeInfo(id, shortName, author, qtEachType, qtCoauthor, style, lb);
            nodes.dataNodes.push(nodeInfo);
            id++;
        }
    }
    
    numNodes = id;

    // array of documents: title, uri, authors id array
    var docInfo = myFindDocumentInformation(data, nodes, idMap); //  documents

    var groupList = []; // contiendra les paires [author, coauthor]
    
    for (var i = 0; i < len; i++) {
        var author     = getValue(data, i, name1);
        var coauthor   = getValue(data, i, name2);
        var authorID   = idMap.get(author);
        var coauthorID = idMap.get(coauthor);
        var obj = {"authorID": authorID, "coauthorID": coauthorID};
        
        if (coauthorID != -1 && coauthorID < numNodes && !isInclude(groupList, obj)) {
            groupList.push(obj);
        }
    }    
    
    numEdges = groupList.length;
    
    // generate edge data structure
    // for each pair of coauthors:
    for (var i = 0; i < numEdges; i++) { 
        var id1 = groupList[i].authorID;
        var id2 = groupList[i].coauthorID;
        var n1 = getNameById(nodes, id1);
        var n2 = getNameById(nodes, id2);
        
        var qtEachTypeCo = [];
        var qtEachLanCo = createTypeCounterArray(languages); // []
        
        var docTypeCounter = createTypeCounterArray(types);
        // nb doc by type
        findQtTypeCo(data, n1, n2, docTypeCounter, typeIndex);
        
        // nb doc by type
        qtEachTypeCo = docTypeCounter;
        
        // TODO: doc by language ?
        //for (var j = 0; j < languages.length; j++) {
        //    qtEachLanCo.push(findQtOneLanCo(data, n1, n2, languages[j]));
        //}
        
        // sum of nb doc
        var qtPubCo   = findQtPub(qtEachTypeCo);
        // array of documents published by coauthors in any order
        var documents = findCoDoc(docInfo, nodes, id1, id2); 
        var edgeInfo = getEdgeInfo(id1, id2, qtEachTypeCo, qtPubCo, qtEachLanCo, documents);        
        if (qtPubCo != 0) {
            edges.dataEdges.push(edgeInfo);
        }
    }

    var res2 = getRes(numNodes, numEdges, nodes, edges);
    
    var ti3 = new Date();
    var stime = parseInt(ti2 - ti1) / 1000;
    var ttime = parseInt(ti3 - ti2) / 1000;
    var total = parseInt(ti3 - ti1) / 1000;
    
    var res3 = {
        "query_time": stime,
        "trans_time": ttime,
        "total_time": total,
        "res_number": len,
        "node_number": numNodes,
        "edge_number": numEdges,
        "data_type": lb
    }
    return [res1, res2, res3];
    // res1 : Résultat SPARQL en JSON
    // res2 : Résultat de la transformation en JSON
    // res3 : Informations supplémentaires (temps d'exécution, statistiques)
}

/**
 * Test author membership in lab in order to generate color style for display
 * TODO: clean (because it walks through the whole result set once again)
 * return 1 if author = n1
 * return 2 if author = n2
 * return 3 if author = n1 && author = n2 in two different results
 */
function getLB(data, author) {
    var isInLab1 = false;
    var isInLab2 = false;
            
    for (var j = 0; j < data.length; j++) {
        if (getValue(data, j, name1) == author) {
            isInLab1 = true;
        }
        if (getValue(data, j, name2) == author) {
            isInLab2 = true;
        }
    }
                        
    if (isInLab1 && isInLab2) lb = 3;
    else if (isInLab1) lb = 1;
    else if (isInLab2) lb = 2;
    
    return lb;
}

function getRes(numNodes, numEdges, nodes, edges) {
    var data = {
        "info": {
            "qtNodos": numNodes,
            "qtArestas": numEdges
        },
        "nodes": nodes,
        "edges": edges
    };
    return data;
}

/**
* id =  node number associated to author
* shortName, author = names of the author
* qtEachType = array of numbers of documents by type of document
* qtCoauthor = number of all coauthors
* lb =  style data for graph node color
**/
function getNodeInfo(id, shortName, author, qtEachType, qtCoauthor, style, lb) {
    var not = "Not Informed";
    var nodeInfo = {
        "id": id, "idBD": id, "labels": [shortName, author, not, not, not], 
        "values": [2004, 0, 0]
            .concat(qtEachType)
            .concat([qtCoauthor, qtCoauthor, 0.1, 0.1, qtCoauthor / 2 + 1, lb]),
        "images": null
    };
    if (style != undef) {
        nodeInfo.style = style;
    }
    return nodeInfo;
}

function nodeFormat() {
   var nodes = {
        "labelTitle": ["Short Name", "Author Name", "Category", "Research", "Area"],
        "valueTitle": ["Year Last Pub", "Qt Research", "Qt Area"]
            .concat(getTypeLabels())
            .concat(["Connected Comp.", "Edge BetWeenness", "Closeness Centrality",
            "Betweenness Centrality", "Degree"]),
            // "Qt Conference Papers", "Qt Journals", "Qt Books", "Qt Reports",,
        "imageTitle": null,
        "dataNodes": []
    };
    return nodes;
}

// TODO: translate the valueTitle options to english
function edgeFormat() {
    var edges = {
        "labelTitle": null,
        "valueTitle": getTypeLabels().concat(
            ["2004", "English", "Portuguese", "Spanish", "German", "French",
            "Research N.I.", "Tolerancia a falhas", "Inteligencia Artificial", "Modelagem Conceitual e BD",
            "Comp. Grafica e P.I.", "Sistemas de Tempo Real", "Arquiteture e Proj. Sist. Comp.", "Microeletronica",
            "Redes de Computadores", "Proc.Paralelo e Distr.", "Metodos formais", "Fundamentos da Computacao", "Engenharia de Software",
            "Sistemas Embarcados", "Teste e Confiabilidade", "TV Digital", "Projeto Isolado",
            "Natureza N.I.", "Trabalho Completo", "Resumo", "Capitulo", "Texto Integral", "Resumo Expandido", "Outro",
            "Area N.I.", "Sistemas de Computacao", "Sistemas de Informacao", "Inteligencia Artificial", "Eng. da Computacao", "Informatica Teorica"]),
        "dataEdges": []
         // "Qt Conference Papers", "Qt Journals", "Qt Books", "Qt Reports",
    };
    return edges;
}


/**
* id1 id2: node numbers of edge nodes
* qtEachTypeCo: array of number of documents by document types, with id1 id2 as coauthors (not sure graphic use it)
* qtPubCo: total number of copublications with id1 id2 as coauthors
* qtEachLanCo:  deprecated number of documents by languages
* documents: array of documents with id1 id2 as coauthors
**/
function getEdgeInfo(id1, id2, qtEachTypeCo, qtPubCo, qtEachLanCo, documents) {
    var data = {
            "src": id1,
            "tgt": id2,
            "labels": null,
            "values": qtEachTypeCo
                .concat([qtPubCo])
                .concat(qtEachLanCo)
                .concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            "documents": documents
        };
    return data;
}

module.exports = {transform};
