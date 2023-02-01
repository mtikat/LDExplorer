import { Component, h, Element, Prop, State, Listen } from '@stencil/core';
import { select } from 'd3-selection';
import state from '../../../store';

@Component({
  tag: 'mge-view-annotation',
  styleUrl: 'mge-view-annotation.css',
  shadow: false,
})
export class MgeViewAnnotation {
  @Element() element: HTMLElement;
  @State() selected = {};
  @Listen('testevent', { target: 'body' })
  getdata(event: CustomEvent) {
    const { viewAnnotation } = event.detail;
    const test = viewAnnotation.data;

    if (test.view == 'nodelink') {
      console.log('into nodelink');
      this.selected = [];
      this.selected['view'] = 'nodelink';
      this.selected['nodes'] = [];
      test.nodes.forEach(node => {
        this.selected['nodes'].push(node.labels[1]);
      });
      this.selected['links'] = [];
      test.links.forEach(node => {
        this.selected['links'].push(node.source.labels[1] + ' and ' + node.target.labels[1]);
      });
    } else if (test.view == 'clustervis') {
      console.log('into clustervis');
      this.selected = [];
      this.selected['view'] = 'clustervis';
      this.selected['clusters'] = test.clusters;
      console.log('test clusters' + test.clusters);
    } else if (test.view == 'matrix') {
      console.log('into matrix');
      this.selected = [];
      this.selected['view'] = 'matrix';
      this.selected['source'] = test.source;
      this.selected['dest'] = test.dest;

      console.log(this.selected);
    } else if (test.view == 'listing') {
      console.log('into listing');
      this.selected = [];
      this.selected = test;
      console.log('test: ' + test);
      this.selected['view'] = 'listing';
      console.log(this.selected);
    }
    this.selected['title'] = test.title;
    this.selected['objtype'] = test.objtype;
  }

  componentDidLoad() {
    const _dashboard = document.querySelector("mge-dashboard");

    select(this.element.querySelector('#showAnnotations')).on('click', () => {
      const objects = this.selected?.['nodes'] 
      const links = this.selected?.['links']

      _dashboard.loadAnnotation([...objects, ...links])
    });
    select(this.element.querySelector('#vis_query'))
      .selectAll('option')
      .data(Object.keys(state.typeChart))
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d);
  }

  render() {
    return (
      <div class="view-annoation">
        <table class="form_section table" id="query-head">
          <tr>
            <td> Visualization technique * </td>
            <td>
              <select class="table_cell" id="vis_query" name="vis_list" />
            </td>
          </tr>
          <tr>
            <td>
              Objects *
              <input type="hidden" name="selectedvalues" id="selectedvalues">
                nodelink
              </input>
            </td>
            <td>
              <ul>
                {this.selected?.['nodes']?.map((item: any = {}) => (
                  <li>
                    {item}
                    <input type="hidden" id="data" name="nodes" value={item} />
                  </li>
                ))}
                {this.selected?.['links']?.map((item: any = {}) => (
                  <li>
                    {item}
                    <input type="hidden" id="data" name="links" value={item} />
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </table>
        <div class="annotation-buttons" style={{ 'position': 'absolute', 'bottom': '10px', 'width': '100%', 'text-align': 'right' }}>
          <button type="button" class="btn btn-outline-primary" id="showAnnotations">
            Show Annotations
          </button>
        </div>
      </div>
    );
  }
}
