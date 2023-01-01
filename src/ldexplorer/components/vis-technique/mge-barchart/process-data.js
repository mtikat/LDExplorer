import * as d3 from "d3";

//--------------
// graphEdges: Original edges of the graph

function _addEdges(vNodes, vEdges, graphEdges) {
    let i, j, qtNodes, qtEdges;
    qtNodes = vNodes.length;

    //------- Includes edges
    vNodes.forEach(function (node, k) {
        graphEdges.forEach(function (edge) {
            if (edge.src === node.idOrig) {
                for (i = k + 1; i < qtNodes; i++) {
                    if (edge.tgt === vNodes[i].idOrig) {
                        vEdges.push({
                            src: edge.src,
                            tgt: edge.tgt,
                            labels: edge.labels,
                            values: edge.values
                        });
                        break;
                    }
                }
            } else {
                if (edge.tgt === node.idOrig) {
                    for (i = k + 1; i < qtNodes; i++) {
                        if (edge.src === vNodes[i].idOrig) {
                            vEdges.push({
                                src: edge.src,
                                tgt: edge.tgt,
                                labels: edge.labels,
                                values: edge.values
                            });
                            break;
                        }
                    }
                }
            }
        });
    });
    //------- Adjust the ids to conform to the indices
    qtNodes = vNodes.length;
    qtEdges = vEdges.length;

    for (i = 0; i < qtEdges; i++) {
        for (j = 0; j < qtNodes; j++) {
            if (vNodes[j].idOrig === vEdges[i].src) {
                vEdges[i].src = j;
                break;
            }
        }
        for (j = 0; j < qtNodes; j++) {
            if (vNodes[j].idOrig === vEdges[i].tgt) {
                vEdges[i].tgt = j;
                break;
            }
        }
    }

    vNodes.forEach(function (node, k) {
        node.id = k;
    });
}
//---- Returns true if the document isn't already stored
function isTheFirstOccurenceAuthor(id, tab) {
    if (tab.length === 0) return true;
    else {
        for (let i = 0; i < tab.length; i++) {
            if (tab[i].idOrig === id)
                return false;
        }
        return true;
    }
}

//---- Returns true if the document isn't already stored
function isTheFirstOccurenceNotAuthor(id, tab) {
    if (tab.length === 0) return true;
    else {
        for (let i = 0; i < tab.length; i++) {
            if (tab[i].link === id)
                return false;
        }
        return true;
    }
}


 //---- Returns true if the document isn't already stored
function isTheFirstOccurence(id, authors, tab) {
    if (tab.length === 0) return true;
    else {
        for (let i = 0; i < tab.length; i++) {
            if (tab[i].link === id && tab[i].authors.length === authors.length)
                return false;
        }
        return true;
    }
}

//---- Returns true if the id of the source node is part of the authors
function isFromSource(authorId, authors) {
    for (let i = 0; i < authors.length; i++) {
        if (authorId === authors[i])
            return true;
    }
    return false;
}

//---- Returns true if the author is part of the cluster
function oneIsFromCluster(authorId, cluster, sourceId) {
    for (let i = 0; i < cluster.length; i++) {
        for (let j = 0; j < cluster.length; j++) {
            if (((authorId === cluster[i].idOrig && sourceId === cluster[j].idOrig)
                || sourceId === cluster[i].idOrig && authorId === cluster[i].idOrig)
                && authorId !== sourceId) {
                return true;
            }
        }
    }
    return false;
}


//---- Search for the node that has the id passed as an argument
function i_findNormalNode(id, graphData) {
    let i;
    for (i = 0; i < graphData.nodes.qtNodes; i++) {
        if (graphData.nodes.dataNodes[i].idOrig === id)
            return graphData.nodes.dataNodes[i];
    }
    return null;
}

/*---------------------------------
 * Node and its adjacent Iris
 */
const allPapersList = function (normalNode, graphData) {
    let result = {
        root: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            data: {
                id: normalNode.id,
                idOrig: normalNode.idOrig,
                labels: normalNode.labels,
                values: normalNode.values,
                images: normalNode.images,
                documents: [],
            }
        },
        children: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            cluster: false,
            data: [],           // Data of the child nodes and the edge that binds it to the root
            others: []
        }
    };

    result.children.data.push({
        id: normalNode.id,
        idOrig: normalNode.idOrig,
        labels: normalNode.labels,
        values: normalNode.values,
        images: normalNode.images,
    });

    graphData.edges.dataEdges.forEach(
        function (d) {
            if (d.src === normalNode.idOrig) {
                result.children.data.push({
                    id: graphData.nodes.dataNodes[d.tgt].id,
                    idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                    labels: graphData.nodes.dataNodes[d.tgt].labels,
                    values: graphData.nodes.dataNodes[d.tgt].values,
                    images: graphData.nodes.dataNodes[d.tgt].images,
                });
                d.documents.forEach(function (doc) {
                    if (isTheFirstOccurenceNotAuthor(doc.link, result.root.data.documents)) {
                        result.root.data.documents.push({
                            type: doc.type,
                            title: doc.title,
                            link: doc.link,
                            date: doc.date,
                            authors: doc.authors,
                            authorList: doc.authorList
                        })
                    }
                });
            } else
                if (d.tgt === normalNode.idOrig) {
                    result.children.data.push({
                        id: graphData.nodes.dataNodes[d.src].id,
                        idOrig: graphData.nodes.dataNodes[d.src].idOrig,
                        labels: graphData.nodes.dataNodes[d.src].labels,
                        values: graphData.nodes.dataNodes[d.src].values,
                        images: graphData.nodes.dataNodes[d.src].images,
                    });
                    d.documents.forEach(function (doc) {
                        for (let i = 0; i < doc.authors.length; i++) {
                            if (doc.authors[i] === d.tgt) {
                                if (isTheFirstOccurenceNotAuthor(doc.link, result.root.data.documents)) {
                                    result.root.data.documents.push({
                                        type: doc.type,
                                        title: doc.title,
                                        link: doc.link,
                                        date: doc.date,
                                        authors: doc.authors,
                                        authorList: doc.authorList

                                    })
                                }
                            }
                        }
                    });
                }
        }
    );

    return result;

};

const duoPapersList = function (firstNode, secondNode, graphData) {
    let result = {
        root: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            data: {
                id: firstNode.id,
                idOrig: firstNode.idOrig,
                labels: firstNode.labels,
                values: firstNode.values,
                images: firstNode.images,
                documents: [],
            }
        },
        children: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            cluster: false,
            data: [],           // Data of the child nodes and the edge that binds it to the root
            others: []
        },
    };

    result.children.data.push({
        id: firstNode.id,
        idOrig: firstNode.idOrig,
        labels: firstNode.labels,
        values: firstNode.values,
        images: firstNode.images,
    });

    result.children.data.push({
        id: secondNode.id,
        idOrig: secondNode.idOrig,
        labels: secondNode.labels,
        values: secondNode.values,
        images: secondNode.images,
    });

    graphData.edges.dataEdges.forEach(
        function (d) {
            if ((d.src === firstNode.idOrig && d.tgt === secondNode.idOrig)
                || (d.tgt === firstNode.idOrig && d.src === secondNode.idOrig)) {
                d.documents.forEach(function (doc) {
                    for (let i = 0; i < doc.authors.length; i++) {
                        for (let j = 0; j < doc.authors.length; j++) {
                            if ((doc.authors[i] === firstNode.id && doc.authors[j] === secondNode.id)
                                || (doc.authors[j] === firstNode.id && doc.authors[i] === secondNode.id)) {
                                if (isTheFirstOccurenceNotAuthor(doc.link, result.root.data.documents)) {
                                    result.root.data.documents.push({
                                        type: doc.type,
                                        title: doc.title,
                                        link: doc.link,
                                        date: doc.date,
                                        authors: doc.authors,
                                        authorList: doc.authorList

                                    });
                                }
                            }
                        }
                    }
                });
            }
        }
    );

    result.root.data.documents.forEach((doc) => {
        for (let i = 0; i < doc.authors.length; i++) {
            let author = i_findNormalNode(doc.authors[i], graphData);
            if (isTheFirstOccurenceAuthor(doc.authors[i], result.children.data)) {
                result.children.data.push({
                    id: author.id,
                    idOrig: author.idOrig,
                    labels: author.labels,
                    values: author.values,
                    images: author.images,
                });
            }
        }
    });

    return result;
};

const clusterPapersList = function (sourceNode, graphData) {
    let result = {
        root: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            data: {
                id: sourceNode.id,
                idOrig: sourceNode.idOrig,
                labels: sourceNode.labels,
                values: sourceNode.values,
                images: sourceNode.images,
                documents: [],
            }
        },
        children: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            cluster: true,
            data: [],        // Data of the child nodes and the edge that binds it to the root
            others: []
        },
    };

    result.children.data.push({
        id: sourceNode.id,
        idOrig: sourceNode.idOrig,
        labels: sourceNode.labels,
        values: sourceNode.values,
        images: sourceNode.images,
    });

    sourceNode.cluster.forEach((author) => {
        if (author.id !== sourceNode.id) {
            result.children.data.push({
                id: author.id,
                idOrig: author.idOrig,
                labels: author.labels,
                values: author.values,
                images: author.images,
            });
        }
    });

    graphData.edges.dataEdges.forEach(
        function (d) {
            for (let k = 0; k < result.children.data.length; k++) {
                if (d.src === result.children.data[k].idOrig || d.tgt === result.children.data[k].idOrig) {
                    d.documents.forEach(function (doc) {
                        if (isFromSource(result.children.data[k].idOrig, doc.authors)) {
                            for (let i = 0; i < doc.authors.length; i++) {
                                if (oneIsFromCluster(doc.authors[i], result.children.data, result.children.data[k].idOrig)) {
                                    if (isTheFirstOccurence(doc.link, doc.authors, result.root.data.documents)) {
                                        result.root.data.documents.push({
                                            type: doc.type,
                                            title: doc.title,
                                            link: doc.link,
                                            date: doc.date,
                                            authors: doc.authors,
                                            authorList: doc.authorList,
                                        });
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
    );

    result.root.data.documents.forEach((doc) => {
        for (let i = 0; i < doc.authors.length; i++) {
            if (isTheFirstOccurenceAuthor(doc.authors[i], result.children.data)
                && isTheFirstOccurenceAuthor(doc.authors[i], result.children.others)) {
                let author = i_findNormalNode(doc.authors[i]);
                result.children.others.push({
                    id: author.id,
                    idOrig: author.idOrig,
                    labels: author.labels,
                    values: author.values,
                    images: author.images,
                });
            }
        }
    });

    return result;

};

//=========================== sortIris
const sort = function () {

    let _vData = null,             // Vector with data to be sorted (dataNodes [] or dataEdges [])
        _vOrder = null,            // Ordering Vector
        _vLabelConfigSort = null,  // Configuration vector of sort. Each element contains
        //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
        _vValueConfigSort = null,
        _indexAttrSort = 0,          // Index of the attribute to be classified index + 1000 indicates VALUE Ex: 1001
        _labelAttrSort = 0,          // Index adjusted for label (equal to _indexAttrSort)
        _valueAttrSort = 0,          // Index set to value (_indexAttrSort-1000)
        obj = {};


        // --- Function that performs labeling for LABEL
         function _fLabelSort (a, b) {
            if (_vLabelConfigSort[_labelAttrSort].ascending)
                return d3.ascending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
            else
                return d3.descending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
        }

        // --- Function that performs rating for VALUE
        function _fValueSort (a, b) {
            if (_vValueConfigSort[_valueAttrSort].ascending)
                return d3.ascending(_vData[a].edge.values[_valueAttrSort], _vData[b].edge.values[_valueAttrSort]);
            else
                return d3.descending(_vData[a].edge.values[_valueAttrSort], _vData[b].edge.values[_valueAttrSort]);
        }

        // --- Function that performs rating for VALUE with tiebreaker
         function _fValueSortDesempate (a, b) {
            let i, attrSortConfig, result;

            attrSortConfig = _vValueConfigSort[_valueAttrSort];

            for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                if (attrSortConfig.vDesempate[i].numeric) {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
                    }
                } else {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                    }

                }

                if (result !== 0)
                    return result;
            }

            return result;
        }
        // Initializes the classification functions for each attribute
        obj.inic = function (qtLabel, qtValue) {
            var i;
            _vLabelConfigSort = [];
            for (i = 0; i < qtLabel; i++) {
                _vLabelConfigSort.push({ fSortOrder: _fLabelSort, vDesempate: null, ascending: true, desempate: false });
            }

            _vValueConfigSort = [];
            for (i = 0; i < qtValue; i++) {
                _vValueConfigSort.push({ fSortOrder: _fValueSort, vDesempate: null, ascending: false, desempate: false });
            }
            return obj;
        };

        //---------------------
        obj.data = function (_) {
            _vData = _;
            _vOrder = d3.range(_vData.length);
            return obj;
        };

        //---------------------
        obj.getVetOrder = function () {
            return _vOrder;
        };

        //---------------------
        obj.config = function (indexAttr, numeric, ascending, vDesempate) {
            if (vDesempate === undefined) {
                if (numeric) { // For numerical attributes
                    _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSort, vDesempate: null, ascending: ascending, desempate: false };
                } else {
                    _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSort, vDesempate: null, ascending: ascending, desempate: false };
                }
            } else {
                vDesempate.unshift({ indexAttr: indexAttr, numeric: numeric, ascending: ascending });
                if (numeric) { // For numerical attributes
                    _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
                } else {
                    _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
                }
            }
            return obj;
        };

        //---------------------
        obj.exec = function (indexAttrSort) {
            _indexAttrSort = indexAttrSort;

            if (_indexAttrSort < 1000) {
                _labelAttrSort = _indexAttrSort;
                _vOrder.sort(function (a, b) {
                    return _vLabelConfigSort[_labelAttrSort].fSortOrder.call(obj, a, b);
                })
            } else {
                _valueAttrSort = _indexAttrSort - 1000;
                _vOrder.sort(function (a, b) {
                    return _vValueConfigSort[_valueAttrSort].fSortOrder(a, b);
                });
            }
        };

        return obj;
    }

export {allPapersList, duoPapersList, clusterPapersList, sort}