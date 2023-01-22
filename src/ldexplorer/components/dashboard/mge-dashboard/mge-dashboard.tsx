import { Component, Element, Host, Prop, h, Method, State } from '@stencil/core';
import { select, selectAll } from 'd3-selection';
import { tree, zoom, hierarchy } from 'd3';
import { drag } from 'd3-drag';
import state from '../../../store';
import { toPng, toSvg } from 'html-to-image';
import Swal from 'sweetalert2';
import { takeScreenshot, screenshotOptions } from '../../../utils/utils';
import { saveAs } from 'file-saver';

@Component({
  tag: 'mge-dashboard',
  styleUrl: 'mge-dashboard.css',
  shadow: true,
})
export class MgeDashboard {
  @Element() element: HTMLElement;
  /** type of visualization which want to create in inital point */
  @Prop() initComponent: string = 'mge-query';
  private title: string = '[]';
  /** x-coordinate (The horizontal value in a pair of coordinates) of the dashboard*/
  @Prop({ mutable: true }) x: number = 0;
  /** y-coordinate (The vertical value in a pair of coordinates) of the dashboard*/
  @Prop({ mutable: true }) y: number = 0;
  /** First view of the dashboard. It depends on the value of initComponent to define what visualization technique or initial query is the first view to be initialized with.*/
  @Prop({ mutable: true }) _initView;
  /** The dataset name being used */
  @Prop({ mutable: true }) datasetName: string;
  /** Stores the tree of connections between views */
  @Prop({ mutable: true }) _treeCharts = null; // Stores the tree of connections between views
  /** Stores the graph that contains history */
  @Prop({ mutable: true }) _historyChart = null; // Stores the graph that contains history

  // @Prop({ mutable: true }) _selectedQuery;
  /** Area of dashboard for interacting*/
  @Prop({ mutable: true }) _dashboardArea;
  /** Drag connection of views */
  @Prop({ mutable: true }) _dragConect;
  // @Prop({ mutable: true }) _configView = {};

  @Prop({ mutable: true }) _annotationChart = null;

  @Prop({ mutable: true }) _historydata;

  // @State() user;

  private urlParams;

  private protocol = window.location.protocol + '//';

  private hostname = window.location.host;

  constructor() {
    (this._treeCharts = null), // Stores the tree of connections between views
      (this._historyChart = null), // Stores the graph that contains history
      (this._historyChart = null),
      (this._annotationChart = null),
      (this._dashboardArea = {
        div: null,
        dash: null,
        svg: null,
        width: 0,
        height: 0,
      });
    this._dashboardArea.div = select('#viewArea');
    this._dashboardArea.width = this._dashboardArea.div.node().scrollWidth;
    this._dashboardArea.height = this._dashboardArea.div.node().scrollHeight;
    const that = this;
    this._dragConect = drag().on('drag', function (e, d) {
      return that._onDragConect.call(this, e, d, that);
    });
    this.datasetName = 'data-' + state.indexQueryData;
    this.urlParams = new URLSearchParams(window.location.search);
  }

  /** Get all of params from list pre-defined query to save in global variables.
   * Global variable in this case is a set of public variables that all components in the application can use)
   * */
  @Method()
  setParams(globalParams, locals) {
    state.globalParams = globalParams;
    state.queriesList = locals.queries;
    console.log('here');

    console.log(locals.user);
    state.user = locals.user == undefined ? null : locals.user;
  }

  /** This function allows to store new dataset which got from mge-query to a global variable
   */
  @Method()
  setData(_) {
    // Store JSON formatted data to global variable of application
    state._data[this.datasetName] = JSON.parse(_);
  }

  /** This function is to create links from parent window and the children windown
   * It includes connection and line links
   */
  @Method()
  async _addLink(viewParent, viewChild) {
    let line, conect;
    let centerViewParent = await viewParent.getCenter(),
      centerViewChild = await viewChild.getCenter();
    if (typeof centerViewParent !== 'undefined' && typeof centerViewChild !== 'undefined') {
      this._dashboardArea.svg
        .select('defs')
        .append('marker')
        .attr('id', 'arrow-PA-' + (await viewParent.idChart()) + '-FA-' + (await viewChild.idChart()))
        .attr('class', 'arrow PA-' + (await viewParent.idChart()) + ' FA-' + (await viewChild.idChart()))
        .attr('markerWidth', 30)
        .attr('markerHeight', 30)
        .attr('orient', 'auto')
        .attr('refY', 2)
        .attr('fill', '#3383FF')
        .attr('refX', 140)
        .attr('sourceX', centerViewParent.cx)
        .attr('sourceY', centerViewParent.cy)
        .attr('targetX', centerViewChild.cx)
        .attr('targetY', centerViewChild.cy)
        .append('path')
        .attr('d', 'M0,0 L4,2 0,4');

      line = this._dashboardArea.svg
        .insert('line', '.DS-conect')
        .attr('x1', centerViewParent.cx)
        .attr('y1', centerViewParent.cy)
        .attr('x2', centerViewChild.cx)
        .attr('y2', centerViewChild.cy)
        .attr('marker-end', 'url(#arrow-PA-' + (await viewParent.idChart()) + '-FA-' + (await viewChild.idChart()) + ')')
        .attr('class', 'DS-linkChartShow P-' + (await viewParent.idChart()) + ' F-' + (await viewChild.idChart()));
      conect = this._dashboardArea.svg
        .append('rect')
        .datum([{ x: centerViewChild.cx, y: centerViewChild.cy, viewParent: viewParent, viewChild: viewChild }])
        .attr('class', 'DS-conect ' + (await viewChild.idChart()))
        .attr('x', centerViewChild.cx - 6)
        .attr('y', centerViewChild.cy - 6)
        .attr('rx', d => (viewChild.typeVis == 'mge-query' ? 12 : 0))
        .attr('ry', d => (viewChild.typeVis == 'mge-query' ? 12 : 0))
        .style('fill', d => (viewChild.typeVis == 'mge-query' ? 'rgb(222, 66, 91)' : null))
        .style('stroke', d => (viewChild.typeVis == 'mge-query' ? 'rgb(222, 66, 91)' : null))
        .attr('width', 12)
        .attr('height', 12)
        .on('click', () => {
          this.showView(viewChild);
        });
      conect.append('title').text(viewChild.titleView);
      conect.call(this._dragConect);
      // Create circle instead of rect for mge-query
      if (viewChild.typeDiv == 'mge-query') {
        conect.attr('rx', 12).attr('ry', 12);
      }
    }
    return { line: line, conect: conect, visible: true };
  }

  @Method()
  async _addLinkAnnotation(viewParents, viewChild) {
    console.log(viewChild);
    let lines = [],
      conect,
      centerViewChild = await viewChild.getCenter();
    if (viewParents.length != 0) {
      for (let i = 0; i < viewParents.length; i++) {
        let viewParent = viewParents[i],
          line,
          centerViewParent = await viewParent.getCenter();
        if (typeof centerViewParent !== 'undefined' && typeof centerViewChild !== 'undefined') {
          this._dashboardArea.svg
            .select('defs')
            .append('marker')
            .attr('id', 'arrow-PA-' + (await viewParent.idChart()) + '-FA-' + (await viewChild.idChart()))
            .attr('class', 'arrow PA-' + (await viewParent.idChart()) + ' FA-' + (await viewChild.idChart()))
            .attr('markerWidth', 30)
            .attr('markerHeight', 30)
            .attr('orient', 'auto')
            .attr('refY', 2)
            .attr('fill', '#3383FF')
            .attr('refX', 140)
            .attr('sourceX', centerViewParent.cx)
            .attr('sourceY', centerViewParent.cy)
            .attr('targetX', centerViewChild.cx)
            .attr('targetY', centerViewChild.cy)
            .append('path')
            .attr('d', 'M0,0 L4,2 0,4');

          line = this._dashboardArea.svg
            .insert('line', '.DS-conect')
            .attr('x1', centerViewParent.cx)
            .attr('y1', centerViewParent.cy)
            .attr('x2', centerViewChild.cx)
            .attr('y2', centerViewChild.cy)
            .attr('marker-end', 'url(#arrow-PA-' + (await viewParent.idChart()) + '-FA-' + (await viewChild.idChart()) + ')')
            .attr('class', 'DS-linkChartShow P-' + (await viewParent.idChart()) + ' F-' + (await viewChild.idChart()));
          lines.push(line);
        }
      }

      conect = this._dashboardArea.svg
        .append('rect')
        .datum([{ x: centerViewChild.cx, y: centerViewChild.cy, viewChild: viewChild }])
        .attr('class', 'DS-conect ' + (await viewChild.idChart()))
        .attr('x', centerViewChild.cx - 6)
        .attr('y', centerViewChild.cy - 6)
        .attr('rx', d => (viewChild.typeVis == 'mge-query' ? 12 : 0))
        .attr('ry', d => (viewChild.typeVis == 'mge-query' ? 12 : 0))
        .attr('width', 12)
        .attr('height', 12)
        .style('fill', d => (viewChild.typeVis == 'mge-query' ? 'rgb(222, 66, 91)' : null || viewChild.typeVis == 'mge-annotation' ? 'rgb(243, 153, 59)' : null))
        .style('stroke', d => (viewChild.typeVis == 'mge-query' ? 'rgb(222, 66, 91)' : null || viewChild.typeVis == 'mge-annotation' ? 'rgb(243, 153, 59)' : null))
        .attr('transform', d => (viewChild.typeVis == 'mge-annotation' ? 'rotate(45,0,0)' : null))
        .on('click', () => {
          this.showView(viewChild);
        });
      conect.append('title').text(viewChild.titleView);
      conect.call(this._dragConect);
    }

    return { lines: lines, conect: conect, visible: true };
  }

  @Method()
  async _addcube(viewChild) {
    let lines = [],
      conect,
      centerViewChild = await viewChild.getCenter();

    conect = this._dashboardArea.svg
      .append('rect')
      .datum([{ x: centerViewChild.cx, y: centerViewChild.cy, viewChild: viewChild }])
      .attr('class', 'DS-conect ' + (await viewChild.idChart()))
      .attr('x', centerViewChild.cx - 6)
      .attr('y', centerViewChild.cy - 6)
      .attr('rx', d => (viewChild.typeVis == 'mge-query' ? 12 : 0))
      .attr('ry', d => (viewChild.typeVis == 'mge-query' ? 12 : 0))
      .attr('width', 12)
      .attr('height', 12)
      .style('fill', d => (viewChild.typeVis == 'mge-query' ? 'rgb(222, 66, 91)' : null || viewChild.typeVis == 'mge-annotation' ? 'rgb(243, 153, 59)' : null))
      .style('stroke', d => (viewChild.typeVis == 'mge-query' ? 'rgb(222, 66, 91)' : null || viewChild.typeVis == 'mge-annotation' ? 'rgb(243, 153, 59)' : null))
      .attr('transform', d => (viewChild.typeVis == 'mge-annotation' ? 'rotate(45,0,0)' : null))
      .on('click', () => {
        this.showView(viewChild);
      });
    conect.append('title').text(viewChild.titleView);
    conect.call(this._dragConect);
    return { lines: lines, conect: conect, visible: true };
  }

  //---------------------
  /** This function is to show the view includes chart
   * It will be updated depend on the status of the view in tree history
   */
  @Method()
  async showView(view) {
    let that = this;
    if (view.typeVis == 'mge-annotation') {
      let nodeTrees = await this.getChart(await view.idChart(), true);
      nodeTrees.forEach(async nodeTree => {
        showNode(view, nodeTree);
      });
    } else {
      let nodeTree = await this.getChart(await view.idChart());
      showNode(view, nodeTree);
    }

    function showNode(view, nodeTree) {
      let node = nodeTree;
      if (node.link != undefined) {
        while (node.link.visible === false) {
          node.link.visible = true;
          node = node.parentNode;
          node.isLeaf = false;
          if (node.parentNode == null)
            // Check if root
            break;
        }
      }

      nodeTree.hidden = false;
      view.setVisible(true);
      that.refreshLinks();
    }
  }
  /** This method hides the given view from the dashboard (CSS - display:none) and update the status of this
view in the history panel (mge-history).
    */
  @Method()
  async closeView(view) {
    let that = this;
    console.log('closeview');
    if (view.typeVis == 'mge-annotation' || view.typeVis == 'mge-view-annotation') {
      let nodeTrees = await this.getChart(await view.idChart(), true);

      nodeTrees.forEach(async nodeTree => {
        closeNode(view, nodeTree);
      });
      console.log('noteTree annotation');
      console.log(nodeTrees);
    } else {
      let nodeTree = await this.getChart(await view.idChart());
      closeNode(view, nodeTree);
    }

    function closeNode(view, nodeTree) {
      let node = nodeTree;
      console.log('closeNode');
      console.log(node);
      if (node.isLeaf) {
        while (node != null) {
          console.log('into while note != null');
          // node.link.visible = false;
          if (temFilhosVisiveis(node.parentNode)) {
            break;
          } else {
            node.parentNode.isLeaf = true;
          }
          node = node.parentNode;
          if (node.hidden === false) {
            break;
          }
        }
      }
      nodeTree.hidden = true;
      console.log('after hidden true');
      console.log(nodeTree);
      view.setVisible(false);
      console.log('after setvisible false');
      console.log(view);
      that.refreshLinks();

      function temFilhosVisiveis(node) {
        let i;
        if (node == undefined) {
          return true;
        }
        if (node.children === undefined) return false;
        else {
          for (i = 0; i < node.children.length; i++)
            //          if (node.children[i].hidden===false)
            if (node.children[i].link.visible) return true;
        }
        return false;
      }
    }
  }

  /** Drag event from connection of the views
   */
  async _onDragConect(event, d, globalThis) {
    let dt, line, rects, selPaiArrow, selFilhosArrows;
    d.x = event.x;
    d.y = event.y;
    select(this)
      .attr('x', d.x - 6)
      .attr('y', d.y - 6);
    dt = select(this).datum();

    line = globalThis._dashboardArea.svg.selectAll('.F-' + (await dt[0].viewChild.idChart()));
    rects = globalThis._dashboardArea.svg.selectAll('.P-' + (await dt[0].viewChild.idChart()));

    selPaiArrow = globalThis._dashboardArea.svg.selectAll('.FA-' + (await dt[0].viewChild.idChart()));
    selFilhosArrows = globalThis._dashboardArea.svg.selectAll('.PA-' + (await dt[0].viewChild.idChart()));
    if (!line.empty()) {
      line.attr('x2', d.x).attr('y2', d.y);
    }
    rects.attr('x1', d.x).attr('y1', d.y);
    if (!selPaiArrow.empty()) {
      selPaiArrow
        .attr('targetX', d.x)
        .attr('targetY', d.y)
        .attr('refX', Math.sqrt((d.x - selPaiArrow.attr('sourceX')) ** 2 + (d.y - selPaiArrow.attr('sourceY')) ** 2) / 6);
    }
    if (!selFilhosArrows.empty()) {
      selFilhosArrows
        .attr('sourceX', d.x)
        .attr('sourceY', d.y)
        .attr('refX', Math.sqrt((selFilhosArrows.attr('targetX') - d.x) ** 2 + (selFilhosArrows.attr('targetY') - d.y) ** 2) / 6);
    }
    dt[0].viewChild.setCenter(d.x, d.y); // Move the hidden window
    dt[0].viewChild.refresh();
    dt[0].x = d.x;
    dt[0].y = d.y;
  }

  @Method()
  async getChart(idChart, isAnnotation = false) {
    console.log(idChart);
    if (isAnnotation) return getAnnotationRec(this._treeCharts);
    else return getChartRec(this._treeCharts);

    function getChartRec(nodeTree) {
      let tempNodeTree;

      if (nodeTree == null) return [];

      if ('id' in nodeTree) {
        if (nodeTree.id === idChart) {
          return nodeTree;
        }
        if (nodeTree['children'] === undefined) return null;
        for (let i = 0; i < nodeTree.children.length; i++) {
          if (nodeTree.children[i].id.indexOf('annotation') != 0) {
            tempNodeTree = getChartRec(nodeTree.children[i]);
            if (tempNodeTree != null) return tempNodeTree;
          }
        }
      } else {
        if (nodeTree[0]['id'] === idChart) {
          return nodeTree[0];
        }

        if (nodeTree[0]['children'] === undefined) return null;

        for (let i = 0; i < nodeTree[0].children.length; i++) {
          tempNodeTree = getChartRec(nodeTree[0].children[i]);
          if (tempNodeTree != null) return tempNodeTree;
        }
      }

      return null;
    }
    function getAnnotationRec(nodeTree) {
      console.log(nodeTree);
      let tempNodeTree,
        result = [];
      if (nodeTree == null) {
        return result;
      } else if ('id' in nodeTree) {
        if (nodeTree.id === idChart) {
          console.log('nodeTree.id === idChart');
          return [nodeTree];
        } else if (nodeTree['children'] === undefined) {
          console.log('nodeTree[children] === undefine');
          return result;
        } else {
          console.log('loop in children');
          for (let i = 0; i < nodeTree.children.length; i++) {
            tempNodeTree = getAnnotationRec(nodeTree.children[i]);
            if (tempNodeTree.length > 0) result = result.concat(tempNodeTree);
          }
        }
      } else {
        console.log('more than 1');
        console.log(nodeTree);
        // if (nodeTree[0].id == idChart) {
        //   result.push(nodeTree);
        // }

        if (nodeTree[0].children != undefined) {
          console.log('nodeTree[0].children != undefined');
          for (let i = 0; i < nodeTree[0].children.length; i++) {
            tempNodeTree = getAnnotationRec(nodeTree[0].children[i]);
            if (tempNodeTree.length > 0) result = result.concat(tempNodeTree);
          }
        }

        for (let index = 1; index < nodeTree.length; index++) {
          let element = nodeTree[index];
          if (element.id == idChart && element.id.includes('annotation')) {
            result.push(element);
            return [element];
          }
          // if (element.children === undefined)
          //   return result;
        }
      }

      console.log('return final');
      return result;
    }
  }

  /** This method adds a new view to the dashboard and update the tree history with information regarding the new view.
   */
  @Method()
  async addChart(idParent, objChart) {
    let nodeTree, link;
    if (idParent === 0) {
      if (this._treeCharts == null) {
        this._treeCharts = [];
        this._treeCharts.push({
          id: objChart.id,
          title: objChart.title,
          typeChart: objChart.typeChart,
          hidden: objChart.hidden,
          x: objChart.x,
          y: objChart.y,
          view: objChart.view,
          parentNode: null,
          isLeaf: true,
          link: null,
        });
      } else {
        this._treeCharts.push({
          id: objChart.id,
          title: objChart.title,
          typeChart: objChart.typeChart,
          hidden: objChart.hidden,
          x: objChart.x,
          y: objChart.y,
          view: objChart.view,
          parentNode: null,
          isLeaf: true,
          link: null,
        });
      }
    } else {
      nodeTree = await this.getChart(idParent);
      if (nodeTree == null) return;
      if (nodeTree.children === undefined) nodeTree.children = [];
      nodeTree.isLeaf = false;
      // link = _addLink(nodeTree.view, objChart.view);
      nodeTree.children.push({
        id: objChart.id,
        title: objChart.title,
        typeChart: objChart.typeChart,
        hidden: objChart.hidden,
        x: objChart.x,
        y: objChart.y,
        view: objChart.view,
        parentNode: nodeTree,
        isLeaf: true,
        link: objChart.link,
      });
    }
  }

  @Method()
  refreshSvg() {
    this._dashboardArea.width = this._dashboardArea.div.node().scrollWidth;
    this._dashboardArea.height = this._dashboardArea.div.node().scrollHeight;
    this._dashboardArea.svg.attr('width', this._dashboardArea.width);
    this._dashboardArea.svg.attr('height', this._dashboardArea.height);
  }

  /** This function is to clear all of elements in dashboard
   * It will be run when clicking re-run for new query in initial point
   */
  @Method()
  resetDashboard() {
    selectAll(this.element.shadowRoot.querySelectorAll('line, rect, mge-view[id-view]:not([id-view="chart-0"]):not([id-view="chart-history"])')).remove();
    this._treeCharts.children = [];
    this.refreshLinks();
  }

  async addExport(_svg) {
    let _btnExport = select('#exportDashButton');
    _btnExport.on('click', (event, d) => {
      //console.log(state._historydata);
      var fileToSave = new Blob([JSON.stringify(state.all_data)], {
        type: 'application/json',
      });
      let url = this.protocol + this.hostname + '/saveDashboard';
      let id = new Date().getTime();

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.all_data),
      })
        .then(response => {
          console.log(response);
          //location.href = this.protocol + this.hostname + '/' + page;
        })
        .catch(error => {
          console.log(error);
        });
      // Save the file
      saveAs(fileToSave, 'dashboard.json');
    });
  }

  async addAnnotation(_svg) {
    let _btnAnnotation = select('#annotationButton');
    console.log('check state user ' + state.user);

    _btnAnnotation.on('click', (event, d) => {
      //console.log(state._historydata);
      let idAnnotation = 'annotation-' + state.indexAnnotation;
      this._annotationChart = _svg
        .append('mge-view')
        .attr('x', this.x + 600)
        .attr('y', this.y)
        .attr('type-vis', 'mge-annotation')
        .attr('title-view', idAnnotation + ' by ' + state.user.name)
        .attr('titleview', idAnnotation + ' by ' + state.user.name)
        .attr('id-view', idAnnotation);
      state.annotations[idAnnotation] = {
        disabled: false,
        data: '',
      };
      state.indexAnnotation++;

      console.log(this._annotationChart);
      console.log(this._annotationChart.node());

      this.refreshLinks();
      //let link = this._addLink(this._annotationChart.element, this._annotationChart.node());'
      let link = this._addcube(this._annotationChart.node());
      this.addChart(0, {
        id: idAnnotation,
        title: idAnnotation,
        typeChart: 'mge-annotation',
        hidden: false,
        link: link,
        x: this.x + 600,
        y: this.y,
        view: this._annotationChart.node(),
      });

      console.log(this._treeCharts);
    });
  }

  async viewAnnotation(_svg) {
    let _btnViewAnnotation = select('#viewAnnotationButton');

    _btnViewAnnotation.on('click', () => {
      let idAnnotation = 'view-annotation';
      this._annotationChart = _svg
        .append('mge-view')
        .attr('x', this.x + 600)
        .attr('y', this.y)
        .attr('type-vis', 'mge-view-annotation')
        .attr('title-view', idAnnotation + ' by ' + state.user.name)
        .attr('titleview', idAnnotation + ' by ' + state.user.name)
        .attr('id-view', idAnnotation);
      state.viewAnnotation = {
        data: '',
      };

      this.refreshLinks();
      let link = this._addcube(this._annotationChart.node());

      this.addChart(0, {
        id: idAnnotation,
        title: idAnnotation,
        typeChart: 'view-mge-annotation',
        hidden: false,
        link: link,
        x: this.x + 600,
        y: this.y,
        view: this._annotationChart.node(),
      });
    });
  }

  async loadDashboard(_svg) {
    console.log(this.urlParams);
    let id_dashboard = this.urlParams.get('id-dashboard');
    let data = null;
    if (id_dashboard != undefined && id_dashboard != null) {
      await fetch(window.location.protocol + '//' + window.location.host + '/getDashboard?id=' + id_dashboard, {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            console.log(response.clone().json());
            return response.clone().json();
          }
        })
        .then(text => {
          console.log(text);
          data = text;
        });
    }
    if (data != null || data != []) {
      let query = select(this.element.shadowRoot.querySelector("mge-view[type-vis='mge-query']").shadowRoot.querySelector('mge-query'));
      await query.node()._getResult(data.result, data.values, data.data[0].newQuery);
      setTimeout(() => {
        this.buildDashboard(_svg, query, data);
      }, 1000);
      let parent2 = this.element.shadowRoot.querySelector("mge-view[titleview='Frédéric Precioso and associations: 12 common items']");
      // let parent2 = document.querySelectorAll("mge-dashboard")[0].shadowRoot.querySelectorAll("mge-view")
      // Promise.all(parent2[0]["s-p"])
      // console.log(parent2[0]["s-p"]);

      //  parent2 = document.querySelectorAll("mge-dashboard")[0].shadowRoot.querySelectorAll("mge-view")
      console.log('parent test2');
      console.log(parent2);
    }
  }

  async buildDashboard(_svg, query, data) {
    let annotations = [];
    let promises = [];
    for (let index = 1; index < data.data.length; index++) {
      let element = data.data[index];
      if (element.typeChart == 'annotation') {
        annotations.push(element);
      } else {
        promises.push(
          await query
            .node()
            ._view._showChart2(
              element.node,
              element.parentId,
              element.typeChart,
              element.isFromEdge,
              element.secondNode,
              element.isFromCluster,
              element.isFromHC,
              element.newQuery,
            ),
        );
      }
    }
    Promise.all(promises);
    annotations.forEach(element => {
      this.loadAnnotation2(_svg, element);
    });
  }

  @Method()
  async loadAnnotation(typeVis: string, objects: string[]) {
    const _svg = select(this.element.shadowRoot.querySelectorAll('.graph')[0]);
    if (state.query_form_data.query_list) {
      await fetch(window.location.protocol + '//' + window.location.host + '/getAnnotation?query_id=' + state.query_form_data.query_list, {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
        })
        .then(data =>
          data.filter(d => {
            return d['type-view'] === typeVis && d['connected-to'].join('') === objects.join('');
          }),
        )
        .then(dataArr => {
          dataArr.forEach(data => {
            // const chart = select(this.element.shadowRoot.querySelector(`mge-view[type-vis='mge-${typeVis}']`));
            let idAnnotation = 'annotation-' + data.id;
            this._annotationChart = _svg
              .append('mge-view')
              .attr('x', this.x + 600)
              .attr('y', this.y)
              .attr('type-vis', 'mge-annotation')
              .attr('title-view', idAnnotation + ' by ' + data.user)
              .attr('titleview', idAnnotation + ' by ' + data.user)
              .attr('id-view', idAnnotation);
            state.annotations[idAnnotation] = {
              disabled: true,
              data: '',
            };
            state.load_annotation[idAnnotation] = {
              'disabled': true,
              'type': data['type-connection'],
              'data': data['connected-to'],
              'note': data['note'],
              'type-object': data['type-object'],
            };
            if (data['type-connection'] == 'object') {
              state.load_annotation[idAnnotation]['view'] = data['type-view'];
            }

            // this.refreshLinks();
            const link = this._addcube(this._annotationChart.node());
            this.addChart(0, {
              id: idAnnotation,
              title: idAnnotation,
              typeChart: 'mge-annotation',
              hidden: false,
              link,
              x: this.x + 600,
              y: this.y,
              view: this._annotationChart.node(),
            });
            // let history = this.element.shadowRoot.querySelector("mge-view[type-vis='mge-history']");
            // let query = this.element.shadowRoot.querySelector("mge-view[type-vis='mge-query']");
            // query.remove();
            // history.remove();
          });
        });
    }
  }

  loadAnnotation2(_svg, element) {
    let dashboard = this.element;
    console.log('inside annotation');

    console.log(element);
    let idAnnotation = 'annotation-' + element.data.id;
    this._annotationChart = _svg
      .append('mge-view')
      .attr('x', this.x + 600)
      .attr('y', this.y)
      .attr('type-vis', 'mge-annotation')
      .attr('title-view', idAnnotation + ' by ' + element.data.user)
      .attr('titleview', idAnnotation + ' by ' + element.data.user)
      .attr('id-view', idAnnotation);
    state.annotations[idAnnotation] = {
      disabled: true,
      data: '',
    };
    state.load_annotation[idAnnotation] = {
      'disabled': true,
      'type': element.data['type-connection'],
      'data': element.data['connected-to'],
      'note': element.data['note'],
      'type-object': element.data['type-object'],
    };
    if (element.data['type-connection'] == 'object') {
      state.load_annotation[idAnnotation]['view'] = element.data['type-view'];
    }
    console.log(state.load_annotation);

    let parents = [];
    element.parents.forEach(element => {
      console.log('3this');

      console.log(element);
      console.log(dashboard);
      let parent2 = this.element.shadowRoot.querySelector("mge-view[titleview='Frédéric Precioso and associations: 12 common items']");
      let parent = this.element.shadowRoot.querySelector(element);
      console.log(dashboard);
      console.log(parent2);
      console.log('parents');
      console.log(parent);
      parents.push(parent);
    });
    console.log(parents);
    console.log('here');

    console.log(this._annotationChart);
    console.log(this._annotationChart.node());
    this._addLinkAnnotation(parents, this._annotationChart.node()).then(async links => {
      console.log('loop');

      for (let i = 0; i <= links.lines.length; i++) {
        let line = links.lines[i];
        console.log(parents[i]);
        let id_parent = 0;
        if (parents.length > 0) {
          id_parent = parents[i].idView;
        }
        await this.addChart(id_parent, {
          id: this._annotationChart.node().idView,
          title: idAnnotation + ' by ' + element.data.user,
          typeChart: this._annotationChart.node().typeVis,
          hidden: false,
          x: this._annotationChart.node().x,
          y: this._annotationChart.node().y,
          view: this._annotationChart.node(),
          link: { line: line, conect: links.conect, visible: links.visible },
        });
        await this.refreshLinks();
        // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);
      }
    });
    this.refreshLinks();
  }

  addScreenshot() {
    let _btnSaveScreen = select('#captureButton');
    _btnSaveScreen.on('click', (event, d) => {
      Swal.fire({
        title: '',
        html: `File format: <select class='selectTypeCapture' id='typeCapture'>
          <option value='png'>PNG</option>
          <option value='svg'>SVG</option>
        </select>`,
        confirmButtonText: 'OK',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
          const selectElement = select('#typeCapture').node();
          const value = selectElement.options[selectElement.selectedIndex].value;
          return value;
        },
      }).then(result => {
        if (!result.value) return;

        /// TO-DO: apply the same to mge-view
        function showError(error) {
          console.error('oops, something went wrong!', error);
        }

        let options = screenshotOptions(this._dashboardArea.width, this._dashboardArea.height);
        let node = this.element.shadowRoot.querySelector('.contentDashboard') as HTMLElement;
        if (result.value === 'svg') {
          toSvg(node, options)
            .then(dataURL => takeScreenshot(dataURL, result.value, ''))
            .catch(error => showError(error));
        } else {
          toPng(node, options)
            .then(dataURL => takeScreenshot(dataURL, result.value, ''))
            .catch(error => showError(error));
        }
      });
    });
  }

  async addDashboard(_svg) {
    this._historyChart = _svg
      .append('mge-view')
      .attr('x', this.x)
      .attr('y', this.y + 400)
      .attr('type-vis', 'mge-history')
      .attr('title-view', 'History')
      .attr('id-view', 'chart-history');

    this._initView = _svg
      .append('mge-view')
      .attr('x', this.x)
      .attr('y', this.y)
      .attr('dataset-name', this.datasetName)
      .attr('type-vis', this.initComponent)
      .attr('title-view', 'Initial query')
      .attr('titleview', 'Initial query')
      .attr('id-view', 'chart-0');

    if (typeof (await this._initView.node().getChart()) !== 'undefined') {
      let _initView = await this._initView.node().getChart();
      await _initView.setData(state._data[this.datasetName]);
      if (this.initComponent == 'mge-query') await _initView.setInitial();
    }

    this.addChart(0, {
      id: 'chart-0',
      title: 'Initial query',
      typeChart: this.initComponent,
      hidden: false,
      x: this.x,
      y: this.y,
      view: this._initView.node(),
    });

    await this.refreshLinks();
    this.addScreenshot();
    this.loadDashboard(_svg);
  }

  /** This function is to refresh the status of the links and connection
   */
  @Method()
  async refreshLinks() {
    refreshLinksRec(this._treeCharts);
    this._historyChart
      .node()
      .componentOnReady()
      .then(async () => {
        console.log('refreshLinksRec');
        let viewChart = await this._historyChart.node().getChart();
        if (typeof viewChart !== 'undefined') await viewChart.setTree(this._treeCharts);
      });

    function refreshLinksRec(nodeTree) {
      if (nodeTree != null) {
        processNode(nodeTree);
      }
      if (nodeTree.children !== undefined) {
        for (let i = 0; i < nodeTree.children.length; i++) {
          refreshLinksRec(nodeTree.children[i]);
        }
      }
    }

    function processNode(nodeTree) {
      if (nodeTree.link != null) {
        if (nodeTree.link.visible) {
          if (nodeTree.hidden === true || (nodeTree.parentNode.hidden && !nodeTree.hidden)) {
            nodeTree.link.line.classed('DS-linkChartShow', false);
            nodeTree.link.line.classed('DS-linkChartHidden', true);
            // nodeTree.link.line.attr("marker-end", "url(#hidden)")
          } else {
            nodeTree.link.line.classed('DS-linkChartShow', true);
            nodeTree.link.line.classed('DS-linkChartHidden', false);
            // nodeTree.link.line.attr("marker-end", "url(#arrow" + nodeTree.id)
          }
          nodeTree.link.conect.style('display', null);
          nodeTree.link.line.style('display', null);
        } else {
          nodeTree.link.conect.style('display', 'none');
          nodeTree.link.line.style('display', 'none');
        }
      }
    }
  }

  componentDidRender() {
    if (state._data[this.datasetName] != null) {
      state._data[this.datasetName].nodes.dataNodes.forEach(function (node) {
        node.idOrig = node.id;
      });
    }
  }

  componentDidLoad() {
    let svg = select(this.element.shadowRoot.querySelectorAll('.graph')[0]);
    this._dashboardArea.svg = select(this.element.shadowRoot.querySelectorAll('.linktool')[0])
      .attr('width', this._dashboardArea.width)
      .attr('height', this._dashboardArea.height)
      .style('top', 0)
      .style('left', 0)
      .style('right', 0)
      .style('position', 'absolute');
    this.addExport(svg);
    this.addDashboard(svg);
    this.addAnnotation(svg);
    this.viewAnnotation(svg);
  }

  render() {
    return (
      <Host>
        <div class="contentDashboard" style={{ width: '100%', height: '100%' }}>
          <div class="graph"></div>
          <svg class="linktool">
            <defs></defs>
          </svg>
        </div>
      </Host>
    );
  }
}
