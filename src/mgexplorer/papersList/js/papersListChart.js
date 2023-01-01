/**
 * papersListChart
 *
 */

define(["model", "libCava"], function (Model) {

    return function PapersListChart(idDiv) {

        let _papersListPanel = null,  // represents the panel associated with the graph
            _sortByText = true,
            _grpPapersList = null,   // Group representing IRIS
            _grpPapers = null,       // Selection that contains all groups of bars
            _names = null,          // Selection that contains the names of the members of a cluster
            _maxLenghtTitleIndex = 7.8,
            _maxNamesLenght = 87,
            _data = null,

            // _colorsRect = ["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"];     // colors for the different types
            _colorsRect = d3.scale.category10().domain([0,1,2,3]);

        // ---------------- Model
        let model = Model();

        // ---------------- Geometric attributes of the graph
        model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        model.box = { width: 500, height: 500 };
        model.pInnerRadius = 0.13;    // Percentage relative to graph width for _innerRadius calculation
        model.pOuterRadius = 0.57;    // Percentage relative to graph width for _OuterRadius calculation
        model.pMaxHeightBar = 0.15;  // Percentage relative to graph width for _MaxHeightBar calculation
        model.pFocusWidthBar = 0.0275;  // Percentage relative to graph width for calculation of _focusArea.widthBar
        model.pMinWidthBar = 0.01;       // Percentage relative to graph width for calculation of _minArea.widthBar Original 4

        model.indexAttBar = 0;           // Index of the attribute that will be plotted in the toolbar

        model.redraw = 0;


        // ---------------- Initialization Actions
        let _container = d3.select("#" + idDiv).append("div").attr("class", "PL-container");
        let _svg = _container.append("svg"),  // Create dimensionless svg
            _grpChart = _svg.append("g");
        // Add zoom event
        // let _zoomListener = d3.behavior.zoom().on("zoom", _chartZoom);
        // _zoomListener.scaleExtent([_zoomListener.scale() * 0.9, _zoomListener.scale() * 1.1]);
        // _svg.call(_zoomListener);

        _svg.attr("class", "PaperListView")
        _grpPapersList = _grpChart.append("g").attr("class", "PapersListChart");

        //===================================================
        model.when(["box", "margin"], function (box, margin) {
            model.widthChart = box.width - margin.left - margin.right;
            model.heightChart = box.height - margin.top - margin.bottom;
        });

        model.when("box", function (box) {
            _svg.attr("width", box.width).attr("height", box.height);
        });

        //---------------------
        model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });

        //---------------------
        model.when(["data", "widthChart", "heightChart", "redraw"],
            function _createPapersList() {
                if (_grpPapers !== null) { 
                    _grpPapers.remove();
                    _grpPapersList.selectAll("text.PL-names").remove()
                }

                _data = model.data;

                if (_sortByText)
                    chart.sortByText();

                let endOfNames = 0;

                if (model.data.root.data.documents.length * 38 >= 350) {
                    _svg.attr("height", model.data.root.data.documents.length * 38);
                }

                if (model.data.children.cluster === true) {
                    if (_names !== null)
                        _names.remove();

                    //console.log(model.data.children.data)
                    let authors = []
                    model.data.children.data.forEach(d => {
                        authors.push(d.labels[1])
                    })                   

                    // Cluster term
                    
                    const authorsNames = _grpPapersList.append("text")
                        .attr("class", "PL-names")
                        .text("Cluster: " + authors.join(' and '))
                        .attr("x", 10)
                        .attr("y", 12)
                        .style("font-size", "12px")
                        .call(wrap, model.widthChart - 10)
                    
                    authorsNames.append("title")
                        .text("Cluster: " + authors.join(' and '));
                    
                    endOfNames = authorsNames.selectAll('tspan').size() * 12 + 30;
                }

                let x = 5, y = (model.data.children.cluster === true ? endOfNames + 15 : 15);
                _grpPapers = _grpPapersList.selectAll(".PL-grpPapers")
                    .data(model.data.root.data.documents)
                    .enter()
                    .append("g")
                    .attr("class", "PL-grpPapers")
                    .attr('transform', (_,i) => `translate(${x}, ${y + 35 * i})`)


                _grpPapers.append("rect")
                    .attr("class", "PL-type")
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("fill", function (d) {
                        return _colorsRect(d.type.index);
                    })
                    .append("title")
                    .text(d => d.type.label);
                
               
                let maxLenghtTitle = model.widthChart;
                
                const protocol = window.location.protocol +'//';
                const hostname = window.location.host;
                x = 15;
                _grpPapers.append('a')
                    .attr("xlink:href", function (d) { return d.link })
                    .attr("target", "_blank")
                    .classed('PL-icon', true)
                    .append("image")
                    .attr('xlink:href', protocol + hostname + '/images/external-link.svg') 
                    .attr('width', 12)
                    .attr('height', 12)
                    .attr('transform', `translate(${x}, ${-2})`)

                x = 35;
                _grpPapers.append("text")
                    .attr("class", "PL-title")
                    .text(d => d.date ? '(' + d.date + ') ' + d.title : d.title)
                    .attr("x", x)
                    .style("font-size", "12px")
                    // .call(wrap, model.widthChart)
                    .append("title")
                    .text(function (d) { return d.title })

                _grpPapers.append("text")
                    .attr("class", "PL-infos")
                    .text(_getAuthorList)
                    .attr('transform', `translate(${x}, 15)`)
                    // .attr('transform', function() {
                    //     const y = d3.select(this.parentNode).select('text.PL-title').selectAll('tspan').size() * 12;
                    //     return `translate(${x}, ${y})`
                    // })
                    .style("font-size", "12px")
                    // .call(wrap, model.widthChart)
                    .append("title")
                    .text(_getAuthorList)

                updateSVGWidth()

                function updateSVGWidth() {
                    _grpPapers.selectAll('text')
                        .each(function() {
                            let textlength = this.getComputedTextLength();
                            if (textlength > maxLenghtTitle) maxLenghtTitle = textlength;
                            // console.log(this.getComputedTextLength())
                        })
                    _svg.attr("width", maxLenghtTitle + 50);
                }


            } // End
        );
        //--------------------------------- Private functions

        function _getAuthorList(d) {
            if (d.authorList != null) {
                return d.authorList.replaceAll('--', ' and ');
            }
            let authors = [];
            d.authors.forEach(e => {
                authors.push(_findAuthorById(e))
            })
            return authors.join(', ').replaceAll(',,', ',');;
        }

        /**
         *
         * _getTheRightOrder
         *
         * Returns the index for the color
         *
         * @param type
         * @returns number
         * @private
         */
        function _getTheIndex(type) {
            switch (type) {
                case "publications":
                    return 0;
                case "conference paper":
                    return 1;
                case "report":
                    return 2;
                case "article":
                    return 3;
            }
        }

        /**
         *
         * _findAuthorById
         *
         * Returns the author depending on his id
         *
         * @param id
         * @returns string
         * @private
         */
        function _findAuthorById(id) {
            if (model.data.children.data.length == 0) return 'Unknown';
            const item = model.data.children.data.filter(d => d.id == id || d.idOrig == id);
            return item.length > 0 ? item[0].labels[1] : 'Unknown';
        }

        /**
         * Zoom event
         */
        function _chartZoom() {
            _zoomListener.scaleExtent([_zoomListener.scale() * 0.9, _zoomListener.scale() * 1.1]);
            _grpChart.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }

        //--------------------------------- Public functions

        function chart() { }

        chart.box = function (_) {
            if (!arguments.length)
                return model.box;
            model.box = _;

            return chart;
        };

        //---------------------
        // This function is required in all techniques
        // It is called internally in conectChart
        chart.panel = function (_) {
            if (!arguments.length)
                return _papersListPanel;
            _papersListPanel = _;

            return chart;
        };

        //---------------------
        chart.data = function (_, nbArticle) {
            
            if (!arguments.length)
                return model.data;
            model.data = _;
            let headerHeight = 50;
            if (_.root.data.documents.length <= 10)
                model.box.height = _.root.data.documents.length * 35 + headerHeight;
            else {
                model.box.height = 10 * 35 + headerHeight;
            }
            // _papersListPanel.update();
            return chart;
        };

        //---------------------
        chart.dataVisToNode = function (index) {
            return model.data.children.data[index];
        };

        //======== Actions Functions
        chart.sortByText = function () {
            _sortByText = false;
            _data.root.data.documents.sort(function (x, y) {
                return d3.ascending(x.title, y.title);
            });
            model.redraw += 1;
        };

        //---------------------
        chart.sortByYear = function (option) {
            _sortByText = false;
            _data.root.data.documents.sort(function (x, y) {
                return option == 1 ? d3.ascending(x.date, y.date) : d3.descending(x.date, y.date);
            });
            model.redraw += 1;
        };

        chart.sortByType = function() {
            _sortByText = false;
            _data.root.data.documents.sort(function (x, y) {
                return x.type.label.localeCompare(y.type.label)
            })
            model.redraw += 1;
        };

        chart.sortByFirstAuthor =  function() {
            _sortByText = false;
            _data.root.data.documents.sort(function (x, y) {
                if (x.authors[0] == _data.root.data.id || y.authors[0] == _data.root.data.id) return -1;
                else {
                   let authorNameX = _findAuthorById(x.authors[0]);
                   let authorNameY = _findAuthorById(y.authors[0]);
                   return authorNameX.localeCompare(authorNameY);
                }  
            })
            model.redraw += 1;
        };

        //---------------------
        return chart;
    };
});
