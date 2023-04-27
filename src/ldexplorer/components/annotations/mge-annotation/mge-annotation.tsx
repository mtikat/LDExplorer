import { Component, Host, Prop, h, Method, State, Listen, Element } from '@stencil/core';
import state from "../../../store"
import { select, selectAll } from 'd3-selection'
import Model from 'model-js';
import { saveAs } from 'file-saver';


@Component({
    tag: 'mge-annotation',
    styleUrl: 'mge-annotation.css',
    shadow: false,
})
export class MgeAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;

    @Prop() initComponent: string = "mge-query";

    /** The parent dashboard */
    @Prop({ mutable: true }) _dashboard;

    //@Prop({ mutable: true }) model;

    @Prop({ mutable: true }) _view;


    @State() selectValue: string;

    @State() selectValueType: string;

    @State() selectValueFormat: string;

    @Element() element: HTMLElement;

    @Prop({ mutable: true }) formAnnotation = null

    @Prop({ mutable: true }) parents = [];


    @Prop({ mutable: true }) disabled = false;

    @Prop({ mutable: true }) idannotation;

    private protocol = window.location.protocol + '//';

    private hostname = window.location.host;
    public model: any;
     constructor() {
        this._dashboard = document.querySelector("mge-dashboard");
        
        //*[@id="viewArea"]/mge-dashboard//div/div/mge-view[3] 
        //state.annotations[this.element.id] = false;
        
        
    }

    @Method()
    async setBox(_) {
        console.log(arguments);
        if (!arguments.length)
            return this.model.box;
        this.height = arguments[0].height;
        this.width = arguments[0].width;
    };

    idChart() {
        return "chart-annotation"
    }

    handleSelect(event) {
        //console.log(event.target.value);
        this.selectValue = event.target.value;

    }

    @Listen('idevent', { target: 'body' })
    getdata(event: CustomEvent) {
        this.idannotation = event.detail;
    }

     handleSelectType(event) {
        this.selectValueType = event.target.value;
    }

    handleSelectFormat(event) {
        this.selectValueFormat = event.target.value;
    } 

    // Function to save annotation
    saveAnnotationData() {

        select(this.element.querySelector("#saveAnnotationbtn")).on("click", async () => {
            let data = []
            let objtypes = []
            let rect = await this._dashboard.shadowRoot.querySelector("rect.DS-conect." + this.element.id)
            let newid = new Date().getTime();
            let chart = {
                "typeChart": "annotation",
                "parents": [],
            }
            
            //let annotype = this.element.querySelector("#annotation_type").getAttribute("value");
            //let format = this.selectValueFormat;
            let type = this.selectValueType;
            let cat = this.selectValue;
            if (cat == 'dashboard') {

                let hiddens = this.element.querySelectorAll("input[type=hidden]");
                hiddens.forEach(element => {
                    data.push(element.getAttribute("value"));
                });
                select(this.element.querySelector("#notedata")).attr('disabled', true);
                state.formData = {
                    //"annotation-format": format,
                    "annotation-type": type,
                    "type-connection": cat,
                    "connected-to": data,
                    "subset": state.savedData
                }
                state.saved_dashboard["annotation-" + newid] =data
                select(this._view.shadowRoot.querySelector("dashboard-annotation[id-annotation='" + this.element.id + "'"))._groups[0][0].idAnnotation = "annotation-" + newid
                
            }else if (cat == 'object') {
                let type = this.element.querySelector("input[name='view']").getAttribute("value");
                let titleview = this.element.querySelector("input[name='titleview']").getAttribute("value");

                console.log(this.element.querySelector<HTMLTextAreaElement>("#selectedvalues"))
                let selectedValue = this.element.querySelector<HTMLTextAreaElement>("#selectedvalues").value;
                
                let objtype = this.element.querySelectorAll("input[name='objtype']");
               
                objtype.forEach(element => {
                    objtypes.push(element.getAttribute("value"));
                });
                state.formData = {
                    //"annotation-format": format,
                    //"annotation-type": type,
                    "type-connection": cat,
                    "type-object": objtypes,
                    "title-view": titleview,
                    "selected-value": selectedValue,
                    "type-view": type,
                    "subset": state.savedData,
                }
                if ( type == "nodelink"){
                    let hiddens_nodes = this.element.querySelectorAll("input[name='nodes']");
                    hiddens_nodes.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    let hiddens_links = this.element.querySelectorAll("input[name='links']");
                    hiddens_links.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    state.formData["connected-to"] = data;
                }else if (type == "clustervis"){
                    let clusters = this.element.querySelectorAll("input[name='clusters']");
                    clusters.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    state.formData["connected-to"] = data;
                } else if (type == "matrix"){
                    let srcs = this.element.querySelectorAll("input[name='source']");
                    srcs.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    let dests = this.element.querySelectorAll("input[name='dest']");
                    dests.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    state.formData["connected-to"] = data;
                } else if (type ==  "listing"){
                    data.push(this.element.querySelector("input[name='title']").getAttribute("value"));
                    data.push(this.element.querySelector("input[name='date']").getAttribute("value"));
                    data.push(this.element.querySelector("input[name='view']").getAttribute("value"));
                    let authors = this.element.querySelectorAll("input[name='authors']");
                    authors.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    state.formData["connected-to"] = data;
                }
                    
                
                rect?.remove()
                const that = this;
                let parents = [];
                let parent = this._dashboard.shadowRoot.querySelector("mge-view[id-view='" + this.idannotation + "']");
                chart["parents"].push("mge-view[id-view='" + this.idannotation + "']")
                parents.push(parent);
                this._dashboard._addLinkAnnotation(parents, this._view).then(async (links) => {
                    
                    
                    for (let i = 0; i < links.lines.length; i++) {
                        let line = links.lines[i]
                        await this._dashboard.addChart(parents[i].idView, {
                            id: that._view.idView, title: "annotation-"+newid + " by " + state.user.name, typeChart: that._view.typeVis, hidden: false, x: that._view.x, y: that._view.y, view: that._view, link: { line: line, conect: links.conect, visible: links.visible }
                        })
                        await this._dashboard.refreshLinks();
                        // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);             
                    }
                    this._dashboard._treeCharts.pop(1);
                })
                select(this.element.querySelector("#notedata")).attr('disabled', true);
                select(this.element.querySelector("#objectdetails")).attr('disabled', true);


            } else if (cat == 'view') {
                console.log("this is view")
                rect?.remove()
                const that = this;
                let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                let parents = [];
                
                checkboxes.forEach(async (element) => {
                    if (element["checked"]) {
                        console.log("checked")
                        objtypes.push(element.getAttribute("type-chart"));
                        console.log(objtypes)
                        data.push(element["defaultValue"]);
                        let parent = this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']");
                        parents.push(parent);
                        chart["parents"].push("mge-view[titleview='" + element["defaultValue"] + "']")
                    }
                    
                });
                state.formData = {
                    //"annotation-format": format,
                    "annotation-type": type,
                    "type-connection": cat,
                    "connected-to": data,
                    "type-view": objtypes,
                    "subset": state.savedData
                }
                this._dashboard._addLinkAnnotation(parents, this._view).then(async (links) => {
                    for (let i = 0; i < links.lines.length; i++) {
                        let line = links.lines[i]
                        await this._dashboard.addChart(parents[i].idView, {
                            id: that._view.idView, title: "annotation-"+newid + " by " + state.user.name, typeChart: that._view.typeVis, hidden: false, x: that._view.x, y: that._view.y, view: that._view, link: { line: line, conect: links.conect, visible: links.visible }
                        })
                        await this._dashboard.refreshLinks();
                        // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);

                    }
                    this._dashboard._treeCharts.pop(1);
                })
                select(this.element.querySelector("#selectview")).attr('disabled', true);
                select(this.element.querySelector("#notedata")).attr('disabled', true);
                //select(this.element.querySelectorAll("input[type='checkbox']")).attr('disabled', true);
            } else if (cat == 'query') {
                
                rect?.remove()
                const that = this;
                let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                let parents = [];
                
                checkboxes.forEach(async (element) => {
                    if (element["checked"]) {
                        data.push(element["defaultValue"]);
                        console.log(element["defaultValue"]);
                        if (element["defaultValue"] == "Initial query") {
                            console.log("test initial query " + this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']"));

                        }
                        let parent = this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']");
                        console.log("parent: " + parent)
                        parents.push(parent);
                        chart["parents"].push("mge-view[titleview='" + element["defaultValue"] + "']")
                    }
                });
                state.formData = {
                    //"annotation-format": format,
                    "annotation-type": type,
                    "type-connection": cat,
                    "connected-to": data,
                    "subset": state.savedData,
                }
                this._dashboard._addLinkAnnotation(parents, this._view).then(async (links) => {
                    for (let i = 0; i < links.lines.length; i++) {
                        let line = links.lines[i]
                        await this._dashboard.addChart(parents[i].idView, {
                            id: that._view.idView, title: "annotation-"+newid + " by " + state.user.name, typeChart: that._view.typeVis, hidden: false, x: that._view.x, y: that._view.y, view: that._view, link: { line: line, conect: links.conect, visible: links.visible }
                        })
                        await this._dashboard.refreshLinks();
                        // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);

                    }
                    this._dashboard._treeCharts.pop(1);


                })
                select(this.element.querySelector("#notedata")).attr('disabled', true);
            }
            select(this._view.shadowRoot.querySelector("#" + this.element.id + "-t-title"))._groups[0][0].innerHTML = "annotation-" + newid + " by " + state.user.name
            select(this._view)._groups[0][0].titleView = "annotation-" + newid + " by " + state.user.name
            this._view.setAttribute("titleView",  "annotation-" + newid + " by " + state.user.name)

            for (let index = 0; index < this._dashboard._treeCharts.length; index++) {
                if (this._dashboard._treeCharts[index]["title"] == this.element.id){                    
                    this._dashboard._treeCharts[index]["title"] = "annotation-" + newid + " by " + state.user.name;
                }
                
            }
            await this._dashboard.refreshLinks();

            
            let note = this.element.querySelector("textarea")["value"]

            state.formData["note"]= note;
            state.formData["time"]= this.getdate();
            state.formData["id"] = newid;
            state.formData["user"] = state.user.name;
            state.formData["url"] = "http://covid19.i3s.unice.fr:8080/index.html?id-annotation=" + newid;
            state.formData["query_id"] = state.query_form_data?.query_list

            // state.formData = {
            //     //"annotation-format": format,
            //     "annotation-type": type,
            //     "type-connection": cat,
            //     "connected-to": data,
            //     "note": note,
            //     "time": this.getdate(),
            //     "id": new Date().getTime()
            // }
            console.log(state.formData);
            this.saveAnnotationContent(state.formData);
            this.disableForm();
            chart["data"]= state.formData
            console.log(chart);
            this.idannotation = newid;
            
            state.all_data["data"].push(chart)
        })
        this.selectValue = '--';
        this.selectValueType = 'defect';
        this.selectValueFormat = 'text';
        this.element.querySelector("textarea")["value"] = "";
    }

    exportAnnotation(){
        select(this.element.querySelector("#exportAnnotationbtn")).on("click",async () =>{
            let data =[];
            let datas ={};
            let objtypes= [];
            let cat = this.selectValue;
            let type = this.selectValueType;
            datas["annotation-type"] = type;
            datas["id"] = this.element.id;
            datas["type-connection"] = cat;
            datas["user"] = state.user.name;
            if (cat == 'dashboard') {

                let hiddens = this.element.querySelectorAll("input[type=hidden]");
                hiddens.forEach(element => {
                data.push(element.getAttribute("value"));
                });
                datas["connected-to"]= data;
                datas["subset"]= state.savedData;

            } else if (cat == 'object') {
                let type = this.element.querySelector("input[name='view']").getAttribute("value");
                let titleview = this.element.querySelector("input[name='titleview']").getAttribute("value");

                let objtype = this.element.querySelectorAll("input[name='objtype']");

                objtype.forEach(element => {
                    objtypes.push(element.getAttribute("value"));
                });

                datas["type-connection"]=  cat;
                datas["type-object"]=  objtypes;
                datas["title-view"]=  titleview;
                datas["type-view"]=  type;
                datas["subset"]=  state.savedData;
                if (type == "nodelink") {
                    let hiddens_nodes = this.element.querySelectorAll("input[name='nodes']");
                    hiddens_nodes.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    let hiddens_links = this.element.querySelectorAll("input[name='links']");
                    hiddens_links.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    datas["connected-to"] = data;
                } else if (type == "clustervis") {
                    let clusters = this.element.querySelectorAll("input[name='clusters']");
                    clusters.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    datas["connected-to"] = data;
                } else if (type == "matrix") {
                    let srcs = this.element.querySelectorAll("input[name='source']");
                    srcs.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    let dests = this.element.querySelectorAll("input[name='dest']");
                    dests.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    datas["connected-to"] = data;
                } else if (type == "listing") {
                    data.push(this.element.querySelector("input[name='title']").getAttribute("value"));
                    data.push(this.element.querySelector("input[name='date']").getAttribute("value"));
                    data.push(this.element.querySelector("input[name='view']").getAttribute("value"));
                    let authors = this.element.querySelectorAll("input[name='authors']");
                    authors.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });
                    datas["connected-to"] = data;
                }

            } else if (cat == 'view') {
                console.log("this is view")
                let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                let parents = [];
                checkboxes.forEach(async (element) => {
                    if (element["checked"]) {
                        console.log("checked")
                        objtypes.push(element.getAttribute("type-chart"));
                        console.log(objtypes)
                        data.push(element["defaultValue"]);
                        let parent = this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']");
                        parents.push(parent);
                    }

                });

                    datas["type-connection"]= cat;
                    datas["connected-to"]= data;
                    datas["type-view"]= objtypes;
                    datas["subset"]= state.savedData;

            } else if (cat == 'query') {

                let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                let parents = [];
                checkboxes.forEach(async (element) => {
                    if (element["checked"]) {
                        data.push(element["defaultValue"]);
                        console.log(element["defaultValue"]);
                        if (element["defaultValue"] == "Initial query") {
                            console.log("test initial query " + this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']"));

                        }
                    }
                });

                    datas["type-connection"] = cat;
                    datas["connected-to"] = data;
                    datas["subset"] = state.savedData;

            }
            let note = this.element.querySelector("textarea")["value"]
            datas["note"]= note;
            datas["time"]= this.getdate();
            datas["id"] = this.idannotation;
            datas["url"] = "http://covid19.i3s.unice.fr:8080/index.html?id-annotation=" + this.idannotation;
            console.log(datas);

            var fileToSave = new Blob([JSON.stringify(datas)], {
                type: 'application/json'
            });

            // Save the file
            saveAs(fileToSave, "annotation-"+this.idannotation+".json");
        });
    }

    resetAnnotationForm() {
        select(this.element.querySelector("#resetAnnotationbtn")).on("click", () => {
            //console.log("reset form");
            this.selectValue = '--';
            this.selectValueType = 'defect';
            //this.selectValueFormat = 'text';
            this.element.querySelector("textarea")["value"] = "";
        })
    }

    closeAnnotation() {
        select(this.element.querySelector("#cancelAnnotationbtn")).on("click", () => {
            this._dashboard._treeCharts.pop(1);
            this._dashboard.refreshLinks();
            this._view.remove();

        })
    }

    /**
      * This function to disable Run and clone button after get result from server
      *
    */
    disableForm() {
        //select(this.element.querySelector("#annotation_format")).attr('disabled', true);
        //select(this.element.querySelector("#form_type")).attr('disabled', true);
        var dropdown = this.element.querySelector("#viewlist");
        dropdown?.remove();
        select(this.element.querySelector("#connection-types")).attr('disabled', true);
        select(this.element.querySelector("input[type='checkbox']")).attr('disabled', true);
        select(this.element.querySelector("#saveAnnotationbtn")).attr('disabled', true);
        select(this.element.querySelector("#cancelAnnotationbtn")).attr('disabled', true);
        select(this.element.querySelector("#resetAnnotationbtn")).attr('disabled', true);
        select(this.element.querySelector("#freenotedata")).attr('disabled', true);
        state.annotations[this.element.id]["disabled"]= true;
    }


    getdate() {
        var today = new Date();
        var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' ' + time;
    }

    simpleStringify (object){
        // stringify an object, avoiding circular structures
        // https://stackoverflow.com/a/31557814
        var simpleObject = {};
        for (var prop in object ){
            if (!object.hasOwnProperty(prop)){
                continue;
            }
            if (typeof(object[prop]) == 'object'){
                continue;
            }
            if (typeof(object[prop]) == 'function'){
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return JSON.stringify(simpleObject); // returns cleaned up JSON
    };

    async saveAnnotationContent(data) {
        let page = null;
        let url = this.protocol + this.hostname + "/saveAnnotation";
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: this.simpleStringify(data)
        }).then(response => {
            console.log(response);
            //location.href = this.protocol + this.hostname + '/' + page;
        }).catch(error => {
            console.log(error);
        });
    }



    componentDidLoad() {
        this._view = this._dashboard.shadowRoot.querySelector("[id-view='" + this.element.id + "']");
        this.saveAnnotationData();
        this.resetAnnotationForm();
        this.closeAnnotation();
        this.exportAnnotation();
    }


    render() {
        let loaded = {}
        let note = ""
        let enabled = false
        if (this.element.id in state.load_annotation) {
            loaded = state.load_annotation[this.element.id];
            //state.load_annotation = {}
            this.selectValue = loaded["type"];
            enabled = true
            
        }
        let generalContent = (
            <div>
                <table class="annotation_general table" id='annotation-general'>
                    <tr>
                        <td>Note *</td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div class="annotation-note" contenteditable>
                                <textarea name="notedata" id='freenotedata' style={{ width: this.width * 0.65 + "px" }}></textarea>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );

        let dashboardContent = (
            <div>
                <dashboard-annotation id-annotation={this.element.id}></dashboard-annotation>
            </div>
        );

        let viewContent = (
            <div>
                <view-annotation id-annotation={this.element.id}></view-annotation>
            </div>
        );

        let objectContent = (
            <div>
                <object-annotation id-annotation={this.element.id}></object-annotation>
            </div>
        );

        let queryContent = (
            <div>
                <query-annotation id-annotation={this.element.id}></query-annotation>
            </div>
        );



        let contentToDisplay = '--';
        if (this.selectValue == 'dashboard') {
            contentToDisplay = dashboardContent;
        } else if (this.selectValue == 'view') {
            contentToDisplay = viewContent;
        } else if (this.selectValue == 'object') {
            contentToDisplay = objectContent;
        } else if (this.selectValue == 'query') {
            contentToDisplay = queryContent;
        }
        else {
            contentToDisplay = generalContent;
        }


        return (
            <Host>
                <div class="annotation-tree">
                    <div class="formtree">
                        <form name='annotation-form' id='annotation-form' class="content">
                            <section id='annotation_parameters'>
                                <table class="annotationform_section table" id='annotation-head'>
                                    {/* <tr>
                                        <td >Format * </td>
                                        <td>
                                            <select class="table_cell" id="annotation_format" onInput={(event) => this.handleSelectFormat(event)} name="annotation_format" style={{ width: this.width * 0.65 + "px" }}>
                                                <option value="text" selected={this.selectValueFormat === 'text'}>Text</option>
                                                <option value="marker" selected={this.selectValueFormat === 'marker'}>Marker</option>
                                            </select>
                                        </td>
                                    </tr> */}
                                    <tr>
                                        <td > Intention * </td>
                                        <td >
                                            <select class="table_cell" id="form_type" onInput={(event) => this.handleSelectType(event)} name="annoation_type" style={{ width: this.width * 0.65 + "px" }}>
                                                <option value="defect" selected={this.selectValueType === 'defect'}>Defect</option>
                                                <option value="question" selected={this.selectValueType === 'question'}>Question</option>
                                                <option value="comment" selected={this.selectValueType === 'comment'}>Comment</option>
                                                <option value="other" selected={this.selectValueType === 'other'}>Other</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td > Connect to * </td>
                                        <td >
                                            <select disabled={enabled}  class="table_cell" name="connection-types" id="connection-types" onInput={(event) => this.handleSelect(event)} style={{ width: this.width * 0.65 + "px" }}>
                                                <option value="--" selected={this.selectValue === '--'}>--</option>
                                                <option value="dashboard" selected={this.selectValue === 'dashboard'}>Dashboard</option>
                                                <option value="view" selected={this.selectValue === 'view'}>View</option>
                                                <option value="object" selected={this.selectValue === 'object'}>Object</option>
                                                <option value="query" selected={this.selectValue === 'query'}>Query</option>
                                            </select>
                                        </td>
                                    </tr>
                                </table>
                                <tr>
                                    <div>
                                        {contentToDisplay}
                                    </div>
                                </tr>
                            </section>
                        </form>
                    </div>
                    <div class="annotation-buttons" style={{ "position": "absolute", "bottom": "10px", "width": "100%", "text-align": "right" }}>
                        <button type='button' class="btn btn-outline-primary" id="saveAnnotationbtn">Save</button>
                        <button type='button' class="btn btn-outline-secondary"  id='cancelAnnotationbtn'>Cancel</button>
                        <button type='button' class="btn btn-outline-secondary" id='resetAnnotationbtn'>Reset</button>
                        <button type='button' class="btn btn-outline-secondary" id='exportAnnotationbtn'>Export</button>
                    </div>
                </div>
            </Host>
        );
    }

}
