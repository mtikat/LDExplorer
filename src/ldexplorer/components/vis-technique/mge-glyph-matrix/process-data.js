import * as d3 from "d3";


/*---------------------------------
 * Cluster MatrixGlyph
 */

function _addEdgesMatrix(vNodes, vMatrix, graphEdges) {
                let i, j, qtNodes, qtEdges,
                    vEdges = [];   // Auxiliary variable to temporarily store the set of edges

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

                vEdges.forEach(
                    function (d) {
                        vMatrix[d.src].push({ "x": d.tgt, "y": d.src, "exist": true, "labels": d.labels, "values": d.values });
                        vMatrix[d.tgt].push({ "x": d.src, "y": d.tgt, "exist": true, "labels": d.labels, "values": d.values });
                    }
                );
            }

const clusterMatrixGlyph = function (clusterNode, graphData) {
    let result = {
        nodes: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            dataNodes: []
        },
        edges: graphData.edges.valueTitle,
        matrix: []
    };

    // Includes all cluster node nodes
    clusterNode.cluster.forEach(function (node) {
        result.nodes.dataNodes.push({
            id: node.id,
            idOrig: node.idOrig,
            labels: node.labels,
            values: node.values,
            images: node.images
        });
    });


    result.nodes.dataNodes.forEach(
        function (d, i) {
            result.matrix[i] = [];
        }
    );

    _addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);

    return result;
};

/*---------------------------------
 * Edges between 2 clusters
 */
const edgesBtClustersMatrixGlyph = function (edge, graphData) {
    let i, idClusterA, idClusterB, nodeSrc, nodeTgt, qtNodes, qtEdges,
        vEdges = [];   // Auxiliary variable to temporarily store the set of edges
    let result = {
        nodes: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            dataNodes: []
        },
        edges: graphData.edges.valueTitle,
        matrix: []
    };

    idClusterA = edge.source.idCluster;
    idClusterB = edge.target.idCluster;

    // Includes nodes belonging to distinct clusters connected by an edge
    for (i = 0; i < graphData.edges.qtEdges; i++) {
        nodeSrc = i_findNormalNode(graphData.edges.dataEdges[i].src);
        nodeTgt = i_findNormalNode(graphData.edges.dataEdges[i].tgt);
        if (nodeSrc == null || nodeTgt == null)
            alert("Node not found!");
        if (nodeSrc.idCluster === idClusterA && nodeTgt.idCluster === idClusterB ||
            nodeSrc.idCluster === idClusterB && nodeTgt.idCluster === idClusterA) {
            vEdges.push({
                src: graphData.edges.dataEdges[i].src,
                tgt: graphData.edges.dataEdges[i].tgt,
                labels: graphData.edges.dataEdges[i].labels,
                values: graphData.edges.dataEdges[i].values
            });
            i_addNode(nodeSrc, result.nodes.dataNodes);
            i_addNode(nodeTgt, result.nodes.dataNodes);
        }
    }


    // Initializes the matrix of edges
    result.nodes.dataNodes.forEach(
        function (d, i) {
            result.matrix[i] = [];
        }
    );

    //------- Adjust the ids to conform to the indices
    qtNodes = result.nodes.dataNodes.length;
    qtEdges = vEdges.length;

    for (i = 0; i < qtEdges; i++) {
        for (j = 0; j < qtNodes; j++) {
            if (result.nodes.dataNodes[j].id === vEdges[i].src) {
                vEdges[i].src = j;
                break;
            }
        }
        for (j = 0; j < qtNodes; j++) {
            if (result.nodes.dataNodes[j].id === vEdges[i].tgt) {
                vEdges[i].tgt = j;
                break;
            }
        }
    }

    result.nodes.dataNodes.forEach(function (node, k) {
        node.id = k;
    });

    vEdges.forEach(
        function (d) {
            result.matrix[d.src].push({ "x": d.tgt, "y": d.src, "exist": true, "labels": d.labels, "values": d.values });
            result.matrix[d.tgt].push({ "x": d.src, "y": d.tgt, "exist": true, "labels": d.labels, "values": d.values });
        }
    );

    return result;

    //---- Search for the node that has the id passed as an argument
    function i_findNormalNode(id) {
        let i;
        for (i = 0; i < graphData.nodes.qtNodes; i++) {
            if (graphData.nodes.dataNodes[i].id === id)
                return graphData.nodes.dataNodes[i];
        }
        return null;
    }

    //---- Adds a node in vNode if it does not already exist
    function i_addNode(node, vNodes) {
        let achei, i;

        achei = false;
        for (i = 0; i < vNodes.length; i++) {
            if (node.id === vNodes[i].id) {
                achei = true;
                break;
            }
        }
        if (!achei) {
            vNodes.push({
                id: node.id,
                labels: node.labels,
                values: node.values,
                images: node.images
            });

        }
    }
};




/*---------------------------------
 * Node and its adjacent MatrixGlyph
 */
const normalMatrixGlyph = function (normalNode, graphData) {

    let result = {
        nodes: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            dataNodes: []
        },
        edges: graphData.edges.valueTitle,
        matrix: []
    };

    // Include the passed node as argument
    result.nodes.dataNodes.push({
        id: normalNode.id,
        idOrig: normalNode.idOrig,
        labels: normalNode.labels,
        values: normalNode.values,
        images: normalNode.images
    });

    graphData.edges.dataEdges.forEach(function (d) {
        if (d.src === normalNode.idOrig)
            result.nodes.dataNodes.push({
                id: graphData.nodes.dataNodes[d.tgt].id,
                idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                labels: graphData.nodes.dataNodes[d.tgt].labels,
                values: graphData.nodes.dataNodes[d.tgt].values,
                images: graphData.nodes.dataNodes[d.tgt].images
            });
        else
            if (d.tgt === normalNode.idOrig)
                result.nodes.dataNodes.push({
                    id: graphData.nodes.dataNodes[d.src].id,
                    idOrig: graphData.nodes.dataNodes[d.src].idOrig,
                    labels: graphData.nodes.dataNodes[d.src].labels,
                    values: graphData.nodes.dataNodes[d.src].values,
                    images: graphData.nodes.dataNodes[d.src].images
                });

    });

    result.nodes.dataNodes.forEach(
        function (d, i) {
            result.matrix[i] = [];
        }
    );

    _addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);

    return result;
};

const sort = function () {

    let _vData = null,             // Vector with data to be sorted (dataNodes [] or dataEdges [])
        _vOrder = null,            // Ordering Vector
        _vLabelConfigSort = null,  // Configuration vector of sort. Each element contains
        //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
        _vValueConfigSort = null,
        _indexAttrSort = 0,          // Index of the attribute to be classified index + 1000 indicates VALUE Ex: 1001
        _labelAttrSort = 0,          // Index adjusted for label (equal to _indexAttrSort)
        _valueAttrSort = 0,          // Index set to value (_indexAttrSort-1000)

     //--------------------------------- Public functions
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
                return d3.ascending(_vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
            else
                return d3.descending(_vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
        }

        // --- Function that performs rating for VALUE with tiebreaker
        function _fValueSortDesempate (a, b) {
            var i, attrSortConfig, result;

            attrSortConfig = _vValueConfigSort[_valueAttrSort];

            for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                if (attrSortConfig.vDesempate[i].numeric) {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
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

        // --- Function that performs the classification for LABEL with tie breaker

        function _fLabelSortDesempate (a, b) {
            let i, attrSortConfig, result;

            attrSortConfig = _vLabelConfigSort[_labelAttrSort];

            for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                if (attrSortConfig.vDesempate[i].numeric) {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
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
        };



       

        // Initializes the classification functions for each attribute
        obj.inic = function (qtLabel, qtValue) {
            let i;
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
};


export {clusterMatrixGlyph, normalMatrixGlyph, sort}; 