/**
 * histogramPanel
 *
 */

define([], function () {

    return function HistogramPanel(irisVisChart) {
        let _irisChart = irisVisChart,
            _width = 220,
            _height = 80,
            _selectOrder = null,
            _selectAttr = null,
            _vAttrEdgesSelecionaveis = [],
            _idPanel;     // Assigned in create

        function _addItemsSelectOrder() {
            let selOption;

            selOption = d3.select("#" + _idPanel + " .IC-selOrderBy").selectAll("option");
            if (!selOption.empty())
                selOption.remove();

            _selectOrder.append(new Option("Alphabetic Order", 0));
            _selectOrder.append(new Option("Attribute", 1));  // 100 starts numeric index

            _selectOrder[0].selectedIndex = 0;

            _selectOrder.change(function () {
                let valor = +this.value;

                if (valor === 0)
                    _irisChart.acSortExecText();
                else
                    _irisChart.acSortExecAttribute();
            });

        }

        function _addSelectOrder(idDivPanel) {

            $(idDivPanel).append($("<br>")).append($("<button>").append('<i class="fas fa-times"></i>').addClass("exitButton").on("click", (d) => {
				const parent = $(d.target.offsetParent);

				if (parent.css("display") === "none")
					parent.css({ "display": "block" });
				else
					parent.css({ "display": "none" });
            }));
            
            _selectOrder = $("<select>", { class: "IC-selOrderBy" });
            $(idDivPanel).append($("<br/>")).append($("<label>").append("&nbsp;Order by:")).append(_selectOrder);
            _addItemsSelectOrder();
        }

        //-----------------------------------

        function panel() { }

        panel.create = function (idPanel) {
            _idPanel = idPanel;
            let divPanel = $("<div/>", {
                class: "IC-panel"
            })//.css({ "width": _width, "height": _height });
            $("#" + _idPanel).append(divPanel);

            //------------- Select for sort order
            _addSelectOrder("#" + _idPanel + " .IC-panel");

            return panel;
        };

        //---------------------
        panel.update = function () {
            //_addItemsSelectOrder();
        };

        //---------------------
        // Includes select for all attributes

        panel.includeSelectAttr = function (vAttrEdgesSelecionaveis) {
            // let i;
            // for (i = 0; i < vAttrEdgesSelecionaveis.length; i++)
            //     _vAttrEdgesSelecionaveis[i] = vAttrEdgesSelecionaveis[i];
            // _selectAttr = $("<select>", { class: "IC-selAtributo" });
            // $("#" + _idPanel + " .IC-panel").append($("<br/>")).append($("<label>").append("&nbsp;Show attribute:")).append(_selectAttr);


            // _selectAttr.change(function () {
            //     let valor = +this.value;
            //     _irisChart.acChangeAttrBar(valor);
            // });
        };

        //---------------------
        return panel;
    };

});
