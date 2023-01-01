import { Component, h, Prop, Element, State } from "@stencil/core";
import state from "../../../store"
import { select, selectAll } from 'd3-selection'

@Component({
    tag: 'query-annotation',
    styleUrl: 'query-annotation.css',
    shadow: false,
})

export class queryAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;
    @State() expanded = false;
    @Element() element: HTMLElement;
    @Prop() idAnnotation: string;

    selectQuery() {
        select(this.element.querySelector(".selectBox")).on("click", () => {
            var checkboxes = this.element.querySelector("#checkboxes");
            //console.log(checkboxes)
            if (!this.expanded) {
                checkboxes["style"]["display"] = "block";
                this.expanded = true;
            } else {
                checkboxes["style"]["display"] = "none";
                this.expanded = false;
            }
        })
    };

    componentDidLoad() {
        this.selectQuery();
    }

    render(){
        let queryList = state._querydata;
        let enabled = state.annotations[this.idAnnotation].disabled;
        let loaded = null;
        let selected = false;
        console.log(state.load_annotation)
        console.log(this.idAnnotation)
        let note = "";
        if (this.idAnnotation in state.load_annotation) {
            console.log("view-query bingo")
            console.log(state.load_annotation[this.idAnnotation])
            loaded = state.load_annotation[this.idAnnotation];
            console.log(loaded["data"])
            //state.load_annotation = {}
            queryList = loaded["data"]
            selected = true;
            note = loaded["note"];
        }

        let queryContent = (
            <div>
                <table class="annotation_view table" id='annotation-view'>
                    <tr>
                        <td >Query * </td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div >
                                <div class="multiselect" style={{ width: this.width * 0.65 + "px" }}>
                                    <div class="selectBox"  style={{ width: this.width * 0.65 + "px" }}>
                                        <select style={{ width: this.width * 0.65 + "px" }}>
                                            <option>Select an option</option>
                                        </select>
                                        <div class="overSelect"></div>
                                    </div>
                                    <div id="checkboxes" style={{ width: this.width * 0.65 + "px" }}>
                                        {queryList.map((item: any = {}) =>
                                            <label htmlFor={item} style={{ width: this.width * 0.65 + "px" }}>
                                                <input type="checkbox" name="views[]" checked={selected} id={item} value={item} disabled={enabled} />{item}</label>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Note *</td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div class="annotation-note" contenteditable>
                                <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }} disabled={enabled} placeholder={note}>
                                    {note}
                                </textarea>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );

        return queryContent;
    }
}
