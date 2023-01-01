import { Component, Element, h, Prop } from "@stencil/core";

import state from "../../../store"

@Component({
    tag: 'dashboard-annotation',
    styleUrl: 'dashboard-annotation.css',
    shadow: false,
})

export class dashboardAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;
    @Prop() idAnnotation: string;
    @Element() element: HTMLElement;


    render() {

        let viewList= [];
        let loaded = null;
        let note = "";
        let enabled = false;
        viewList = state._historydata;
        if (this.idAnnotation in state.load_annotation) {
            console.log("view-dashboard bingo")
            console.log(state.load_annotation[this.idAnnotation])
            loaded = state.load_annotation[this.idAnnotation];
            console.log(loaded["data"])
            //state.load_annotation = {}
            viewList = loaded["data"]
            note = loaded["note"];
            enabled=true;
            
        }else if ( this.idAnnotation in state.saved_dashboard){
            viewList = state.saved_dashboard[this.idAnnotation]
        }

        let dashboardContent = (
            <div>
                <table class="annotation_view table" id='annotation-view'>
                    <tr>
                        <td >History * </td>
                        <td>
                            <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                <ul>
                                    
                                    {viewList.map((item: any = {}) =>
                                        <li>
                                            {item}
                                            <input type="hidden" name="dashboardInput" value={item} />
                                        </li>
                                    )}
                                </ul>

                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Note *</td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div class="annotation-note" contenteditable>
                                <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }} disabled={enabled} placeholder={note}></textarea>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>);



        return dashboardContent;
    }
}