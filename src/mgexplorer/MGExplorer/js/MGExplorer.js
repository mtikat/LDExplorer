//let ejs = require('ejs');
define(function (require) {
    let ejs = require('ejs');
    //ejs = require ('ejs');

});

function launch(haldata, datatype, name1, name2, stylesheet, followupQuery) {
    require(["dashboard", "databaseLib", "libCava", "algCluster", "numericGlyph",
        "nodeEdgeChart", "nodeEdgePanel", "clusterVisChart", "clusterVisPanel",
        "irisChart", "irisPanel", "matrixGlyphChart", "matrixGlyphPanel", "historyTreeChart", "historyTreePanel",
        "papersListChart", "papersListPanel", "histogramChart", "histogramPanel"],


        function (Dashboard, DatabaseLib, LibCava, AlgCluster, NumericGlyph,
            NodeEdgeChart, NodeEdgePanel, ClusterVisChart, ClusterVisPanel,
            IrisChart, IrisPanel, MatrixGlyphChart, MatrixGlyphPanel, HistoryTreeChart, HistoryTreePanel,
            PapersListChart, PapersListPanel, HistogramChart, HistogramPanel) {


            var ATN_ShortName = 0,   // ATN: Node attribute
                ATN_AuthorName = 1,
                ATN_Category = 2,
                ATN_LinhaPesq = 3,
                ATN_Area = 4,

                ATN_QtLinhaPesq = 1001,

                ATN_QtPublicacoes = 1003,
                ATN_QtJournals = 1004,
                ATN_QtBooks = 1005,
                ATN_QtProceedings = 1006,

                ATN_ConnectComp = 1007,

                ATN_Degree = 1011,

                ATE_QtPublicacoes = 1000,   // ATE: Attribute edge
                ATE_QtJournals = 1001,
                ATE_QtBooks = 1002,
                ATE_QtProceedings = 1003,

                TC_NodeEdge = 0,   // Technique
                TC_ClusterVis = 1,
                TC_Iris = 2,
                TC_GlyphMatrix = 3,
                TC_Iris_Solo = 4,
                TC_PapersList = 5,
                TC_NodeEdge_HAL = 6,
                TC_ClusterVis_HAL = 7,
                TC_Histogram = 8,

                MG_WidthChart = 350,
                MG_HeightChart = 350;

            var GLYPH_STAR = 4;
            var _IdChartRoot = 0;  // Id of the root chart of the holding. In this NodeEdge application
            var _vAttrSelecionaveis = [ATN_Category, ATN_LinhaPesq, ATN_QtLinhaPesq,
                ATN_QtPublicacoes, ATN_QtJournals, ATN_QtBooks, ATN_QtProceedings, ATN_Degree];  // CLUSTERVIS
            var _vAttrEdgesSelecionaveis = [ATE_QtPublicacoes, ATE_QtJournals, ATE_QtBooks, ATE_QtProceedings];	// IRIS

            var _vAttrSizeSelecionaveis = [ATN_Degree, ATN_QtPublicacoes, ATN_QtJournals, ATN_QtBooks, ATN_QtProceedings];
            var _selectSizeAttrExiste = false;

            var headerParameter = " ";
            var _headerTitle = typeof datatype == 'number' ? 'co-authors' : 'associations';
            var _listingTitle = 'List of ' + (typeof datatype == 'number' ? 'Papers' : 'Items');
            var _themeInfo = typeof datatype == 'number' ? ' co-publication' : ' common item';

            var _stylesheet = stylesheet;
            let _redirectServices = stylesheet && stylesheet.services != undefined;

            //--------------- Manager Variables

            var _dashboard = null,     	// Represents the entire viewing area
                _data = null,           // Stores the data displayed in nodeEdge

                _chart = {   // Structure with the view and chart to be instantiated and stored in the manager
                    view: null,  	// View associated with the node and edges
                    chart: null, 	// Graph of nodes and edges
                },

                _historyTree = {   // Structure with the view and chart of the history tree
                    view: null,
                    chart: null,
                },

                _selectedQuery = 0,
                _selectedCluster = 0,

                _alg = AlgCluster(),  				// Instantiates the algorithm to generate cluster
                _subGraph = LibCava().subGraph(),
                _tooltips = LibCava().tooltips(),

                _glyphStar = NumericGlyph(GLYPH_STAR);

            _glyphStar.indexMapAttr([ATE_QtPublicacoes - 1000, ATE_QtProceedings - 1000, ATE_QtBooks - 1000, ATE_QtJournals - 1000]);

            //-----Initialize select Query
            //$("#selectQuery").on("change", function() {
            //    _selectedQuery = parseInt(this.value);
            //    _selectSizeAttrExiste = false;
            //    _showChartRoot(_IdChartRoot, true);
            //});

            //-----Initialize select Cluster
            //$("#selectCluster").val(0).on("change", function() {
            //    _selectedCluster = parseInt(this.value);
            //    _showChartRoot(_IdChartRoot,false);
            //});

            // ---------------- Initialization Actions
            if (!followupQuery) {
                _dashboard = Dashboard("viewArea");

                _inicContextMenu();

                // if (typeof (launch.counter) == 'undefined') {
                    launch.counter = -1;
                // }
                // if (typeof (launch._chartList) == 'undefined')
                    launch._chartList = [];

                _chart.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btClose: false,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true
                    })
                    .newView(0, 0);

                _chart.chart = NodeEdgeChart(_chart.view.idChart()).box({ width: MG_WidthChart, height: MG_HeightChart });
                _chart.chart.indexAttrSize(ATN_Degree);
                _chart.view.conectChart(_chart.chart, NodeEdgePanel);

                _IdChartRoot = _dashboard.addChart(0, {
                    id: _chart.view.idChart(), title: "", typeChart: "NE", hidden: false,
                    x: 0, y: 0, chart: _chart.chart, view: _chart.view
                });

                _historyTree.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btTool: false,
                        btClose: false,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true
                    })
                    .newView(0, 400);
                    
                _historyTree.chart = HistoryTreeChart(_historyTree.view.idChart(), _dashboard)
                    .box({ width: 300, height: 100 })
                    .data(_dashboard.getTree());

                _historyTree.view.conectChart(_historyTree.chart, HistoryTreePanel);
                _historyTree.view.setTitle("History");

                _dashboard.historyChart(_historyTree.chart);
                _dashboard.configureView({
                    barTitle: true,
                    btTool: true,
                    btClose: false,
                    draggable: true,
                    resizable: true,
                    aspectRatio: true
                });

                launch._dashboard = _dashboard;
                launch._charts = _chart;
                launch._historyTree = _historyTree;

                _showChartRoot(_IdChartRoot, false);
            } else { //if followupQuery
                _dashboard = launch._dashboard;
                _chart = launch._charts;
                _historyTree = launch._historyTree;
                _showNodeEdge(null, _dashboard.parentId, null, _dashboard.title);
            }

            //--------------------------------- Private functions
            function _showChartRoot(idChart, novo) {
                if (novo) {
                    _dashboard.removeTudo(); // clear all charts to begin a new exploration
                    _dashboard = Dashboard("viewArea");

                    //_selectedQuery = parseInt($("#selectQuery")[0].selectedIndex);
                    //_selectedCluster = parseInt($("#selectCluster")[0].selectedIndex);

                    _inicContextMenu();

                    _chart.view = _dashboard
                        .configureView({
                            barTitle: true,
                            btClose: false,
                            draggable: true,
                            resizable: true,
                            aspectRatio: true
                        })
                        .newView(0, 0);

                    _chart.chart = NodeEdgeChart(_chart.view.idChart()).box({
                        width: MG_WidthChart,
                        height: MG_HeightChart
                    });
                    _chart.chart.indexAttrSize(ATN_Degree);
                    _chart.view.conectChart(_chart.chart, NodeEdgePanel);

                    _IdChartRoot = _dashboard.addChart(0, {
                        id: _chart.view.idChart(), title: "", typeChart: "NE", hidden: false,
                        x: 0, y: 0, chart: _chart.chart, view: _chart.view
                    });

                    _historyTree.view = _dashboard
                        .configureView({
                            barTitle: true,
                            btTool: false,
                            btClose: false,
                            draggable: true,
                            resizable: true,
                            aspectRatio: true
                        })
                        .newView(0, 400);
                    _historyTree.chart = HistoryTreeChart(_historyTree.view.idChart(), _dashboard)
                        .box({ width: 300, height: 100 })
                        .data(_dashboard.getTree());

                    _historyTree.view.conectChart(_historyTree.chart, HistoryTreePanel);
                    _historyTree.view.setTitle("History");

                    _dashboard.historyChart(_historyTree.chart);
                    _dashboard.configureView({
                        barTitle: true,
                        btTool: true,
                        btClose: false,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true
                    })

                }

                _loadDataProcess(haldata, 0, idChart)
            }

            //------ Loads a new dataset
            function _loadDataProcess(data, codArquivo, idChart, followupQuery, repaint) {
                var objChart = _dashboard.getChart(idChart);
                let title = typeof datatype == 'number' ? "Co-authorship Network " : datatype;
                //var title = "Network Overview ";
                //var title = "Overview"
                //var title = datatype;

                if (name1 && name2) {
                    title += ` between ${name1} and ${name2}`;
                } else if (name1) {
                    title += ` in ${name1}`;
                }

                _data = JSON.parse(data);
                
                // Includes idOrig attribute
                _data.nodes.dataNodes.forEach(function (node) {
                    node.idOrig = node.id;
                });

                objChart.chart.setTTNormalNode(_tooltips.normalNode(_data, ATN_AuthorName, [ATN_QtPublicacoes, ATN_QtJournals, ATN_QtBooks, ATN_QtProceedings],
                    // [ATN_Category, ATN_LinhaPesq, ATN_QtLinhaPesq, ATN_QtPublicacoes], // change this to display info about publications etc
                    _headerTitle));
                objChart.chart.setTTNormalEdge(_tooltips.normalEdge(_data, ATN_AuthorName, [ATE_QtPublicacoes]));


                objChart.view.setTitle(title);
                objChart.chart.data(_data);
                objChart.title = title;
                objChart.chart.panel().atualizaAutocomplete();

                _historyTree.chart.data(_dashboard.getTree());
                launch._chartList.push({
                    chart: objChart,
                    _data: _data
                });
                launch.counter += 1;
            }

            //------ Initializes all context menus
            function _inicContextMenu() {
                _dashboard.setItensContextMenu(TC_NodeEdge, [
                    { label: "ClusterVis", fActionNode: _fActionNodeNE_CV, fActionEdge: _fActionNotImplemented },
                    { label: "Iris", fActionNode: _fActionNodeNE_IC, fActionEdge: _fActionNotApplicable },
                    { label: "Histogram", fActionNode: _fActionNodeNE_HC, fActionEdge: _fActionNotImplemented },
                    { label: "GlyphMatrix", fActionNode: _fActionNodeNE_GM, fActionEdge: _fActionEdgeNE_GM },
                ]);

                _dashboard.setItensContextMenu(TC_ClusterVis, [
                    { label: "ClusterVis", fActionNode: _fActionNodeCV_CV },
                    { label: "Iris", fActionNode: _fActionNodeCV_IC },
                    { label: "Histogram", fActionNode: _fActionNodeNE_HC },
                    { label: "GlyphMatrix", fActionNode: _fActionNodeCV_GM },
                    { label: _listingTitle, fActionNode: _fActionNodeCV_PL },
                ]);

                _dashboard.setItensContextMenu(TC_Iris, [
                    { label: "Histogram", fActionNode: _fActionNodeIC_HCCluster },
                    { label: _listingTitle, fActionNode: _fActionNodeIC_PL }
                ]);

                _dashboard.setItensContextMenu(TC_GlyphMatrix, [
                    { label: "ClusterVis", fActionNode: _fActionNodeGM_CV },
                    { label: "Iris", fActionNode: _fActionNodeGM_IC },
                    { label: "GlyphMatrix", fActionNode: _fActionNodeGM_GM },
                    { label: "Histogram", fActionNode: _fActionNodeNE_HC },
                    { label: _listingTitle, fActionNode: _fActionNodeGM_PL }
                ]);

                _dashboard.setItensContextMenu(TC_Iris_Solo, [
                    // { label: "NodeEdge", fActionNode: _fActionNotImplemented },
                    // { label: "ClusterVis", fActionNode: _fActionNodeIC_CV },
                    // { label: "Iris", fActionNode: _fActionNodeIC_IC },
                    // { label: "GlyphMatrix", fActionNode: _fActionNodeIC_GM },
                    { label: "Histogram", fActionNode: _fActionNodeIC_HC },
                    { label: _listingTitle, fActionNode: _fActionNodeIC_PLOnName }
                ]);

                _dashboard.setItensContextMenu(TC_Histogram, [
                    { label: _listingTitle, fActionNode: _fActionNodeHC_PL }
                ]);

                // _dashboard.setItensContextMenu(TC_PapersList_Solo, [
                //     { label: "Papers' List", fActionNode: _fActionNodeIC_PL },
                //     { label: "Histogram", fActionNode: _fActionNodeIC_HCCluster },
                // ]);

                let serviceOptions = []
                if (_redirectServices) {
                    _stylesheet.services.forEach(d => {
                        serviceOptions.push({"label": d.label, fActionNode: _fActionNodePL_S})
                    })
                    _dashboard.setItensContextMenu(TC_PapersList, serviceOptions);
                }

                serviceOptions = serviceOptions.filter(d => d.label != 'ACTA')
                _dashboard.setItensContextMenu(TC_NodeEdge_HAL, [
                    { label: "ClusterVis", fActionNode: _fActionNodeNE_CV, fActionEdge: _fActionNotImplemented },
                    { label: "Iris", fActionNode: _fActionNodeNE_IC, fActionEdge: _fActionNotApplicable },
                    { label: "GlyphMatrix", fActionNode: _fActionNodeNE_GM, fActionEdge: _fActionEdgeNE_GM },
                    { label: "Histogram", fActionNode: _fActionNodeNE_HC, fActionEdge: _fActionNotImplemented },
                    { label: _listingTitle, fActionNode: _fActionNodeNE_PL, fActionEdge: _fActionEdgeNE_PL },
                ].concat(serviceOptions));

                _dashboard.setItensContextMenu(TC_ClusterVis_HAL, [
                    // { label: "NodeEdge", fActionNode: _fActionNotImplemented },
                    { label: "ClusterVis", fActionNode: _fActionNodeCV_CV },
                    { label: "Iris", fActionNode: _fActionNodeCV_IC },
                    { label: "GlyphMatrix", fActionNode: _fActionNodeCV_GM },
                    { label: "Histogram", fActionNode: _fActionNodeCV_HC },
                    { label: _listingTitle, fActionNode: _fActionNodeCV_PL }
                ]);
            }

            

            //=================== Context menu actions for nodes
            //=======================
            // Actions NE: NodeEdge
            //=======================
            //-------------
            // parentId: id of the parent view from where the next view will open
            function _fActionNodeNE_CV(node, parentId) {
                _showClusterVis(node, parentId);
            }

            //---------------
            function _fActionNodeNE_IC(node, parentId) {
                _showIris(node, parentId);
            }

            //---------------
            function _fActionNodeNE_GM(node, parentId) {
                _showGlyphMatrix(node, parentId);
            }

            //---------------
            function _fActionNodeNE_PL(node, parentId) {
                _showPapersList(node, parentId, false);
            }

            function _fActionNodeNE_HC(node, parentId) {
                _showHistogram(node, parentId);
            }

            function _fActionNodeNE_NQ(node, parentId, parentChart) {
            }



            //---------------
            function _fActionEdgeNE_GM(edge, parentId) {
                let data, posicaoPai, title;

                if (edge.source.cluster && edge.target.cluster) {
                    data = _subGraph.edgesBtClustersMatrixGlyph(edge, _data);
                } else {
                    d3.preventDefault();
                    alert("Not implemented!!");
                    return;
                }

                posicaoPai = _dashboard.getChart(parentId).view.getPosition();
                _chart.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btClose: true,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true,
                        visible: false
                    })
                    .newView(posicaoPai.x + 20, posicaoPai.y + 20);

                _chart.chart = MatrixGlyphChart(_chart.view.idChart()).box({
                    width: MG_WidthChart,
                    height: MG_HeightChart
                });
                _chart.view.conectChart(_chart.chart, MatrixGlyphPanel);

                title = "Edges: " + edge.source.key + " - " + edge.target.key;
                _chart.view.setTitle(title);

                _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(),
                    title: title,
                    typeChart: "GM",
                    hidden: false,
                    x: _chart.view.getPosition().x,
                    y: _chart.view.getPosition().y,
                    chart: _chart.chart,
                    view: _chart.view
                });

                setTimeout(function () {   // It was put here to give the model time to work
                    _chart.chart
                        .indexAttrSort(0)     // Numeric attribute 0. Must be before date ()
                        .indexAttrLegend(0)     //  Must be before date ()
                        .indexAttrCellColor(1001)
                        .glyph(_glyphStar)
                        .cellColorsMap(["#99E6E6"]);

                    _chart.chart
                        .data(data);

                    _chart.chart.setTTMatrixCell(_tooltips.matrixCell(data, _glyphStar, ATN_AuthorName));
                    _historyTree.chart.data(_dashboard.getTree());
                    _chart.view.show(true);
                }, 100);
            }

            //---------------
            function _fActionEdgeNE_PL(edge, parentId) {
                _showPapersList(edge.source, parentId, true, edge.target);
            }


            //=======================
            // Actions CV: ClusterVis
            //=======================
            function _fActionNodeCV_CV(node, parentId) {
                _showClusterVis(node, parentId);
            }

            //---------------
            function _fActionNodeCV_IC(node, parentId) {
                _showIris(node, parentId);
            }

            //---------------
            function _fActionNodeCV_GM(node, parentId) {
                _showGlyphMatrix(node, parentId);
            }

            //---------------
            function _fActionNodeCV_PL(node, parentId) {
                _showPapersList(node, parentId, false, undefined, true);
            }

            //---------------
            function _fActionNodeCV_HC(node, parentId) {
                _showHistogram(node, parentId, false, undefined, true);
            }

            //---------------
            // used by NodeEdge and PapersList
            function _fActionNodeNE_CI(node) {
                const baseUrl = _stylesheet.browser.url,
                    uriUrl = node.labels ? node.labels[1] : node.link,             // if NodeEdge diagram, then node.label, else if PapersList, then node.link
                    url = baseUrl + (encodeURIComponent(uriUrl));                                  // Url parameter for the redirection.

                window.open(url);                              // Opens a new window with the given URL
            }

            // not used for now
            function isURI(str) {
                var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
                return !!pattern.test(str);
            }


            //=============================
            // Actions: Papers List
            //==============================

            function _fActionNodePL_S(node, parentId, service) {
                const baseUrl = _stylesheet.services.filter(d => d.label == service)[0].url;
                
                if (service == 'ACTA' && !node.id) {
                    alert("The service cannot be launched because this item does not have a PubMed ID.")
                    return;
                }

                let url = baseUrl + encodeURIComponent(service == 'ACTA' ? node.id : (node.labels ? node.labels[1] : node.link));
                window.open(url); 
            }

            //=======================
            // Actions HC: Histogram
            //=======================
            function _fActionNodeHC_PL(nodeHC, parentId) {
                // let parentData = d3.select(nodeBar.node().parentNode).datum();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode();
                node.root.data.documents = node.root.data.documents.filter(d => d.date == nodeHC.year)
                _showPapersList(node, parentId, false, false, false, true);
            }

            //=======================
            // Actions IC: Iris
            //=======================
            function _fActionNodeIC_CV(nodeIris, parentId) {
                let vOrder = _dashboard.getChart(parentId).chart.getVOrder();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showClusterVis(node, parentId);
            }

            //---------------
            function _fActionNodeIC_IC(nodeIris, parentId) {
                let vOrder = _dashboard.getChart(parentId).chart.getVOrder();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showIris(node, parentId);
            }

            //---------------
            function _fActionNodeIC_GM(nodeIris, parentId) {
                let vOrder = _dashboard.getChart(parentId).chart.getVOrder();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showGlyphMatrix(node, parentId);
            }

            //---------------
            function _fActionNodeIC_IC_SameView(nodeIris, parentId) {
                let vOrder = _dashboard.getChart(parentId).chart.getVOrder();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showIris(node, parentId, _dashboard.getChart(parentId));
            }

            //---------------
            function _fActionNodeIC_PL(nodeIris, parentId) {
                let chart = _dashboard.getChart(parentId).chart;
                let vOrder = chart.getVOrder();
                let sourceNode = chart.getSourceObject();
                let targetNode = chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showPapersList(sourceNode, parentId, true, targetNode);
            }

            //---------------
            function _fActionNodeIC_PLOnName(nodeIris, parentId) {
                let vOrder = _dashboard.getChart(parentId).chart.getVOrder();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showPapersList(node, parentId, false);
            }

            //---------------
            function _fActionNodeIC_HC(nodeIris, parentId) {
                let vOrder = _dashboard.getChart(parentId).chart.getVOrder();
                let node = _dashboard.getChart(parentId).chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showHistogram(node, parentId, false);
            }

            function _fActionNodeIC_HCCluster(nodeIris, parentId) {
                let chart = _dashboard.getChart(parentId).chart;
                let vOrder = chart.getVOrder();
                let sourceNode = chart.getSourceObject();
                let targetNode = chart.dataVisToNode(vOrder[nodeIris.indexData]);
                _showHistogram(sourceNode, parentId, true, targetNode);
            }

            //=======================
            // Actions GM: GlyphMatrix
            //=======================
            function _fActionNodeGM_CV(node, parentId) {
                _showClusterVis(node, parentId);
            }

            //---------------
            function _fActionNodeGM_IC(node, parentId) {
                _showIris(node, parentId);
            }

            //---------------
            function _fActionNodeGM_GM(node, parentId) {
                _showGlyphMatrix(node, parentId);
            }

            //---------------
            function _fActionNodeGM_PL(node, parentId) {
                _showPapersList(node, parentId, false, undefined, false);
            }

            //=======================
            // General Actions
            //=======================
            function _fActionNotApplicable() {
                alert("Not applicable!!");
            }

            //---------------
            function _fActionNotImplemented() {
                alert("Not implemented!!");
            }

            //=======================
            // Displays Techniques
            //=======================

            //---------------------------------
            function _showNodeEdge(node, parentId, parent, title) {
                let data, posicaoPai, queryName;

                data = JSON.parse(haldata)

                posicaoPai = _dashboard.getChart(parentId).view.getPosition();

                _chart.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btTool: true,
                        btClose: true,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true,
                        visible: true
                    })
                    .newView(posicaoPai.x + 20, posicaoPai.y + 20);

                _chart.chart = NodeEdgeChart(_chart.view.idChart()).box({
                    width: MG_WidthChart,
                    height: MG_HeightChart
                });
                _chart.chart.indexAttrSize(ATN_Degree);
                _chart.view.conectChart(_chart.chart, NodeEdgePanel);

                queryName = title.startsWith("query") ?
                    title.split("query")[1] : "";
                title = "Co-publication Followup Query " + queryName;

                _IdChartRoot = _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(),
                    title: title,
                    hidden: false,
                    x: _chart.view.getPosition().x,
                    y: _chart.view.getPosition().y,
                    chart: _chart.chart,
                    view: _chart.view
                });

                _chart.view.setTitle(title);

                data.nodes.dataNodes.forEach(function (node) {
                    node.idOrig = node.id;
                });

                _chart.chart.setTTNormalNode(_tooltips.normalNode(data, ATN_AuthorName, [ATN_Category, ATN_LinhaPesq, ATN_QtLinhaPesq, ATN_QtPublicacoes], _headerTitle));
                _chart.chart.setTTNormalEdge(_tooltips.normalEdge(data, ATN_AuthorName, [ATE_QtPublicacoes]));

                _chart.chart.data(data);

                _chart.chart.panel().atualizaAutocomplete();
                launch._chartList.push({
                    chart: _dashboard.getChart(_chart.view.idChart()),
                    _data: data
                });
                launch.counter += 1;

                _historyTree.chart.data(_dashboard.getTree());
            }

            //---------------------------------
            function _showClusterVis(node, parentId) {
                let data, posicaoPai, title;

                if (node.cluster) {
                    data = _subGraph.clusterClusterVis(node, _data);
                } else {
                    data = _subGraph.normalClusterVis(node, _data);
                }

                posicaoPai = _dashboard.getChart(parentId).view.getPosition();
                _chart.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btTool: true,
                        btClose: true,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true,
                        visible: false
                    })
                    .newView(posicaoPai.x + 20, posicaoPai.y + 20);

                _chart.chart = ClusterVisChart(_chart.view.idChart()).box({
                    width: MG_WidthChart,
                    height: MG_HeightChart
                });
                _chart.view.conectChart(_chart.chart, ClusterVisPanel);

                if (node.cluster) {
                    // title = node.key + "\'s cluster";
                    title = node.labels[ATN_AuthorName] + "\'s cluster";
                    _chart.view.setTitle(title);
                } else {
                    title = node.labels[ATN_AuthorName] + " and " + headerParameter + _headerTitle + " (" + data.nodes.dataNodes.length + " clusters)";
                    _chart.view.setTitle(title);
                }

                _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(),
                    title: title,
                    typeChart: "CV",
                    hidden: false,
                    x: _chart.view.getPosition().x,
                    y: _chart.view.getPosition().y,
                    chart: _chart.chart,
                    view: _chart.view
                });

                if (launch._chartList.length !== 1) {
                    var parentChartId = getParentChart(parentId);
                    data = getDataOfChart(parentChartId);
                    if (node.cluster) {
                        data = _subGraph.clusterClusterVis(node, data);
                    } else {
                        data = _subGraph.normalClusterVis(node, data);
                    }
                }

                _chart.chart
                    .indexAttrSort(ATN_Category)     // Numeric attribute 0. Must be before date ()
                    .data(data);


                const nbTypes = data.edges.valueTitle.slice(0,4).filter(d => d != 'z0' && d != 'z1' && d != 'z2')
               
                _chart.chart     // Changed to make the first ring always categorical
                    .addAttribute(ATN_Category, "L")

                nbTypes.forEach((d,i) => {
                    _chart.chart.addAttribute(i+3, 'V')
                })
                    // .addAttribute(ATN_QtPublicacoes - 1000, "V")
                    // .addAttribute(ATN_QtProceedings - 1000, "V")
                    // .addAttribute(ATN_QtJournals - 1000, "V")
                    // .addAttribute(ATN_QtBooks - 1000, "V");

                _historyTree.chart.data(_dashboard.getTree());
                _chart.chart.panel().alteraSelectOrder();
                _chart.chart.panel().incluiSelectAneis(_vAttrSelecionaveis);	 // Input: selectable attributes
                _chart.view.show(true);

            }

            function getDataOfChart(idChart) {
                var res = null;
                if (launch._chartList && launch._chartList.length > 0) {
                    launch._chartList.forEach((value, index) => {
                        if (value.chart.id === idChart)
                            res = value._data;
                    });
                    if (launch._chartList.length === 1 && launch._chartList[0].chart.id === "view-1-c")
                        return launch._chartList[0];
                    return res;
                }
            }

            function getParentChart(parentId) {
                var __chart = _dashboard.getChart(parentId);
                if (__chart && __chart.id && _chart.id == "view-1-c") //__chart.title.startsWith("Co-publication"))
                    return parentId;
                return getParentChart(__chart.parent.id);
            }

            //---------------------------------
            function _showIris(node, parentId, parent) {
                let data, posicaoPai, title;

                // if (node.cluster) {
                //     alert("Not implemented!!");
                //     return;
                // }

                data = _subGraph.normalIris(node, _data);
                posicaoPai = _dashboard.getChart(parentId).view.getPosition();

                if (parent === undefined) {
                    _chart.view = _dashboard
                        .configureView({
                            barTitle: true,
                            btTool: true,
                            btClose: true,
                            draggable: true,
                            resizable: true,
                            aspectRatio: true,
                            visible: false
                        })
                        .newView(posicaoPai.x + 20, posicaoPai.y + 20);
                    _chart.chart = IrisChart(_chart.view.idChart()).box({ width: MG_WidthChart, height: MG_HeightChart });
                } else {
                    _chart.view = parent.view;
                    _dashboard.sameView();
                    let idParts = _chart.view.idChart().split("-");
                    let newId = parseInt(idParts[1], 10);
                    newId++;
                    _chart.view.setIdChart("view-" + newId + "-c");
                    _chart.chart = parent.chart;
                }
                if (launch._chartList.length !== 1) {
                    var parentChartId = getParentChart(parentId);
                    data = getDataOfChart(parentChartId);
                    data = _subGraph.normalIris(node, data);
                }

                _chart.view.conectChart(_chart.chart, IrisPanel);

                title = node.labels[ATN_AuthorName] + " and " + data.children.data.length + " " + headerParameter + _headerTitle;

                _chart.view.setTitle(title);

                _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(),
                    title: title,
                    typeChart: "IC",
                    hidden: false,
                    x: _chart.view.getPosition().x,
                    y: _chart.view.getPosition().y,
                    chart: _chart.chart,
                    view: _chart.view
                });

                _inicContextMenu();

                _chart.chart.configCentroid(ATN_AuthorName, headerParameter + _headerTitle, ATN_AuthorName); // Must be before date function
                _chart.chart.indexAttrBar(ATE_QtPublicacoes);
                _chart.chart.data(data);

                _historyTree.chart.data(_dashboard.getTree());
                _chart.chart.panel().includeSelectAttr(_vAttrEdgesSelecionaveis);
                _chart.view.show(true);
            }

            //---------------------------------
            function _showGlyphMatrix(node, parentId) {
                let data, posicaoPai, title;
                if (node.cluster) {
                    data = _subGraph.clusterMatrixGlyph(node, _data);
                } else {
                    data = _subGraph.normalMatrixGlyph(node, _data);
                }

                posicaoPai = _dashboard.getChart(parentId).view.getPosition();
                _chart.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btTool: true,
                        btClose: true,
                        draggable: true,
                        resizable: true,
                        aspectRatio: true,
                        visible: false
                    })
                    .newView(posicaoPai.x + 20, posicaoPai.y + 20);

                _chart.chart = MatrixGlyphChart(_chart.view.idChart()).box({
                    width: MG_WidthChart,
                    height: MG_HeightChart
                });
                _chart.view.conectChart(_chart.chart, MatrixGlyphPanel);

                if (node.cluster) {
                    title = node.labels[ATN_AuthorName] + "\'s cluster";
                    _chart.view.setTitle(title);
                } else {
                    title = node.labels[ATN_AuthorName] + " and " + headerParameter + _headerTitle;
                    _chart.view.setTitle(title);
                }

                _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(),
                    title: title,
                    typeChart: "GM",
                    hidden: false,
                    x: _chart.view.getPosition().x,
                    y: _chart.view.getPosition().y,
                    chart: _chart.chart,
                    view: _chart.view
                });

                setTimeout(function () {   // It was put here to give the model time to work
                    _chart.chart
                        .indexAttrSort(0)     // Numeric attribute 0. Must be before date ()
                        .indexAttrLegend(0)     //  Must be before date ()
                        .indexAttrCellColor(1001)
                        .glyph(_glyphStar)
                        .cellColorsMap(["#99E6E6"]);

                    if (launch._chartList.length !== 1) {
                        var parentChartId = getParentChart(parentId);
                        data = getDataOfChart(parentChartId);
                        if (node.cluster) {
                            data = _subGraph.clusterMatrixGlyph(node, data);
                        } else {
                            data = _subGraph.normalMatrixGlyph(node, data);
                        }
                    }

                    _chart.chart
                        .data(data);

                    _chart.chart.setTTMatrixCell(_tooltips.matrixCell(data, _glyphStar, ATN_AuthorName));
                    _historyTree.chart.data(_dashboard.getTree());
                    _chart.view.show(true);
                }, 100);
            }

            function _showPapersList(node, parentId, isFromEdge, secondNode, isFromCluster, isFromHC) {
                let data, posicaoPai;

                if (isFromCluster === undefined)
                    isFromCluster = false;

                if (isFromEdge === undefined)
                    isFromEdge = false;

                if (isFromEdge) {
                    data = _subGraph.duoPapersList(node, secondNode, _data);
                } else if (isFromCluster) {
                    data = _subGraph.clusterPapersList(node, _data);
                } else if (isFromHC) {
                    data = JSON.parse(JSON.stringify(node));
                    node = node.root.data;
                } else {
                    data = _subGraph.allPapersList(node, _data);
                }

                if (launch._chartList.length !== 1) {
                    var parentChartId = getParentChart(parentId);
                    data = getDataOfChart(parentChartId);
                    if (!isFromEdge && !isFromCluster) {
                        data = _subGraph.allPapersList(node, data);
                    } else if (isFromEdge) {
                        data = _subGraph.duoPapersList(node, secondNode, data);
                    } else if (isFromCluster) {
                        data = _subGraph.clusterPapersList(node, data);
                    }
                }


                posicaoPai = _dashboard.getChart(parentId).view.getPosition();

                _chart.view = _dashboard
                    .configureView({
                        barTitle: true,
                        btTool: true,
                        btClose: true,
                        draggable: true,
                        resizable: true,
                        aspectRatio: false,
                        visible: false
                    })
                    .newView(posicaoPai.x + 20, posicaoPai.y + 20);
                _chart.chart = PapersListChart(_chart.view.idChart())


                let nbPapers = data.root.data.documents.length;

                let title = node.labels[ATN_AuthorName];
                if (isFromEdge) {
                    title += " and " + secondNode.labels[ATN_AuthorName]; 
                } else if (isFromCluster) {
                    title += "'s cluster" 
                } else {
                    title += ' and ' + _headerTitle;
                }

                title += ': ' + nbPapers + _themeInfo + (nbPapers > 1 ? 's' : '');

                if (isFromHC) {
                    let parentChart = _dashboard.getChart(parentId)
                    let authors = parentChart.title.split(':')[0];
                    let date = data.root.data.documents[0].date;
                    title = authors + ': ' + nbPapers + _themeInfo + (nbPapers > 1 ? 's' : '') + ` in ${date}`; 
                }

                _chart.view.setTitle(title);

                _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(),
                    title: title,
                    typeChart: "PL",
                    hidden: false,
                    x: _chart.view.getPosition().x,
                    y: _chart.view.getPosition().y,
                    chart: _chart.chart,
                    view: _chart.view
                });

                _chart.chart.data(data);

                _historyTree.chart.data(_dashboard.getTree());
                _chart.view.conectChart(_chart.chart, PapersListPanel);

                _chart.view.show(true);
            }

            //---------------------------------
            function _showHistogram(node, parentId, isFromEdge, secondNode, isFromCluster) {
                let data, posicaoPai;
                // if (node.cluster) {
                //     alert("Not implemented!!");
                //     return;
                // }

                // data = _subGraph.normalHistogram(node, _data);

                if (!isFromEdge && !isFromCluster) {
                    data = _subGraph.allPapersList(node, _data);
                } else if (isFromEdge) {
                    data = _subGraph.duoPapersList(node, secondNode, _data);
                } else if (isFromCluster) {
                    data = _subGraph.clusterPapersList(node, _data);
                }

                if (launch._chartList.length !== 1) {
                    var parentChartId = getParentChart(parentId);
                    data = getDataOfChart(parentChartId);
                    if (!isFromEdge && !isFromCluster) {
                        data = _subGraph.allPapersList(node, data);
                    } else if (isFromEdge) {
                        data = _subGraph.duoPapersList(node, secondNode, data);
                    } else if (isFromCluster) {
                        data = _subGraph.clusterPapersList(node, data);
                    }
                }
                // data = _subGraph.allPapersList(node, _data);

                posicaoPai = _dashboard.getChart(parentId).view.getPosition();


                _chart.view = _dashboard
                    .configureView({ barTitle: true, btTool: true, btClose: true, draggable: true, resizable: true, aspectRatio: false, visible: false })
                    .newView(posicaoPai.x + 20, posicaoPai.y + 20);
                _chart.chart = HistogramChart(_chart.view.idChart()).box({ width: MG_WidthChart, height: MG_HeightChart });

                const nbPapers = data.root.data.documents.length;

                _chart.view.conectChart(_chart.chart, HistogramPanel);

                let title = node.labels[ATN_AuthorName];
                if (isFromEdge) {
                    title += " and " + secondNode.labels[ATN_AuthorName]; 
                } else if (isFromCluster) {
                    title += "'s cluster" 
                } else {
                    title += ' and ' + _headerTitle;
                }

                title += ': ' + nbPapers + _themeInfo + (nbPapers > 1 ? 's' : '');

                _chart.view.setTitle(title);

                _dashboard.addChart(parentId, {
                    id: _chart.view.idChart(), title: title, typeChart: "IC", hidden: false,
                    x: _chart.view.getPosition().x, y: _chart.view.getPosition().y, chart: _chart.chart, view: _chart.view
                });

                _chart.chart.configCentroid(ATN_AuthorName, headerParameter + _headerTitle, ATN_AuthorName); // Must be before date function
                _chart.chart.indexAttrBar(ATE_QtPublicacoes);
                _chart.chart.data(data);

                _historyTree.chart.data(_dashboard.getTree());
                _chart.chart.panel().includeSelectAttr(_vAttrEdgesSelecionaveis);
                _chart.view.show(true);
            }

        }
    );
}

