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

/*---------------------------------
             * Node and its adjacent Iris
             */
const normalIris = function (normalNode, graphData) {
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
                    images: normalNode.images
                }
            },
            children: {
                labelTitle: graphData.nodes.labelTitle,
                valueTitle: graphData.nodes.valueTitle,
                imageTitle: graphData.nodes.imageTitle,
                data: []           // Data of the child nodes and the edge that binds it to the root
            },
            edges: {
                labelTitle: graphData.edges.labelTitle,
                valueTitle: graphData.edges.valueTitle,
                data: [] // Data of the other edges (that do not bind to the root (MISSING IMPLEMENTATION))
            }
        };

        graphData.edges.dataEdges.forEach(
            function (d) {
                if (d.src === normalNode.idOrig) {
                    result.children.data.push({
                        id: graphData.nodes.dataNodes[d.tgt].id,
                        idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                        labels: graphData.nodes.dataNodes[d.tgt].labels,
                        values: graphData.nodes.dataNodes[d.tgt].values,
                        images: graphData.nodes.dataNodes[d.tgt].images,
                        edge: {
                            src: d.src,
                            tgt: d.tgt,
                            labels: d.labels,
                            values: d.values
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
                            edge: {
                                src: d.tgt,
                                tgt: d.src,
                                labels: d.labels,
                                values: d.values
                            }
                        });
                    }
            }
        );
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

export {normalIris, sort}