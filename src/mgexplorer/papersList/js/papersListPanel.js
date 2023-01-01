/**
 * papersListPanel
 *
 */

define([], function () {

    return function PapersListPanel(papersListChart) {
        let _papersChart = papersListChart,
            _width = 220,
            _height = 80,
            _selectOrder = null,
            _idPanel;     // Assigned in create

        function _addItemsSelectOrder() {
            let selOption;

            selOption = d3.select("#" + _idPanel + " .PL-selOrderBy").selectAll("option");
            if (!selOption.empty())
                selOption.remove();

            _selectOrder.append(new Option("Alphabetic Order", 0));
            _selectOrder.append(new Option("Publication Year (Ascending Order)", 1));
            _selectOrder.append(new Option("Publication Year (Descending Order)", 2));
            _selectOrder.append(new Option("Publication Type (Alphabetic Order)", 3));
            _selectOrder.append(new Option("First Author (Alphabetic Order)", 4));

            _selectOrder[0].selectedIndex = 0;

            _selectOrder.change(function () {
                let selected = +this.value;

                switch(selected) {
                    case 0:
                        _papersChart.sortByText();
                        break;
                    case 3:
                        _papersChart.sortByType();
                        break;
                    case 4:
                        _papersChart.sortByFirstAuthor();
                        break;
                    default:
                        _papersChart.sortByYear(selected);
                }
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
                class: "PL-panel"
            })//.css({ "width": _width, "height": _height });
            $("#" + _idPanel).append(divPanel);

            //------------- Select for sort order
            _addSelectOrder("#" + _idPanel + " .PL-panel");

            return panel;
        };

        //---------------------
        panel.update = function () {
        };

        //---------------------
        return panel;
    };

});
