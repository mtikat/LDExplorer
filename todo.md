
**Table content:**

1. [Introduction](#1-introduction)
2. [Setup](#2-setup)
3. [Overview of dashboard component](#3-dashboard)

    3.1.  [mge-dashboard](#31-mge-dashboard)

    3.2.  [mge-query](#32-mge-query)
    
    3.3.  [mge-view](#33-mge-view)

    3.4.  [mge-panel](#34-mge-panel)
    
    3.5. [mge-history](#35-mge-history)


4. [Implementing visualization techniques (extending mge-view)](#4-implementing-visualization-techniques-extending-mge-view)

    4.1. [mge-barchart](#41-mge-barchart)

    4.2. [mge-clustervis](#42-mge-clustervis)

    4.3. [mge-glyph-matrix](#43-mge-glyph-matrix)

    4.4. [mge-iris](#44-mge-iris)

    4.5. [mge-listing](#45-mge-listing)

    4.6. [mge-nodelink](#46-mge-nodelink)


# 1. Introduction

Visualization techniques are useful tools to explore data by enabling the discovery of meaningful patterns and causal relationships. The discovery process is often exploratory and requires multiple views to support analyzing different or complementary perspectives to the data. In this context, analytic provenance shows great potential to understand users' reasoning process through the study of their interactions on multiple view systems. 

In this project, we present an approach based on the concept of chained views to support the incremental exploration of large, multidimensional datasets. Our goal is to provide
visual representation of provenance information to enable users to retrace their analytical actions and to discover alternative exploratory paths without loosing information on previous analyses. 

We demonstrate that our implementation of the approach, MGExplorer (Multidimensional Graph Explorer), allows users to explore different perspectives to a dataset by modifying the input graph topology, choosing visualization techniques, arranging the visualization space in meaningful ways to the ongoing analysis
and retracing their analytical actions. MGExplorer combines multiple visualization techniques and visual querying while rep- resenting provenance information as segments connecting views, which each supports selection operations that help define subsets of the current dataset to be explored by a different view



![MGExplore application](./src/assets/images/MGExplorer.png)




# 2. Setup
**Developed Dependencies**
|   Name   |  Version  |
| -------- | --------- |
| @stencil/store| 1.4.1|
| @types/jest| 26.0.21|
| @types/puppeteer| 5.4.3|
| jest| 26.6.3|
| jest-cli| 26.6.3|
| rollup-plugin-node-polyfills| 0.2.1|

**Dependencies and libraries**

|   Name   |  Version  |
| -------- | --------- |
| @stencil/core| 2.5.2|
| @types/sweetalert| 2.0.4|
| autocompleter| 6.1.0|
| babel-plugin-transform-remove-strict-mode| 0.0.2|
| cors| 2.8.5|
| d3| 6.0.0|
| d3-simple-slider| 1.10.4|
| ejs| 3.1.6|
| express| 4.17.1|
| express-fileupload| 1.2.1|
| jquery| 3.6.0|
| jquery-ui| 1.12.1|
| lodash| 4.17.21|
| model-js| 0.2.5|
| morgan| 1.10.0|
| nodemon| 2.0.12|
| patch-package| 6.4.7|
| puppeteer| 8.0.0|
| requirejs| 2.3.6|
| sweetalert2| 11.0.18|
| tippy.js| 6.3.1|
| xmlhttprequest| 1.8.0|

To start building a new web component using Stencil, clone this repository to a new directory:

```bash
git clone https://github.com/ionic-team/stencil-component-starter.git my-component
cd my-component
git remote rm origin
```

and run:

```bash
# Install dependencies and libraries
npm install
# Build application before run server side
npm run build
# Run application via Server side
npm start:ssr
```

To build the component for production, run:

```bash
npm run build
```

To run the unit tests for the components, run:

```bash
npm test
```

# 3. Dashboard

##  3.1. mge-dashboard


### Properties
<details>
<summary>Click to expand !</summary>
<p>

| Property         | Attribute         | Description                                  | Type     | Default     |
| ---------------- | ----------------- | -------------------------------------------- | -------- | ----------- |
| `_configView`    | --                |                                              | `{}`     | `{}`        |
| `_dashboardArea` | `_dashboard-area` | Area of dashboard for interacting            | `any`    | `undefined` |
| `_dragConect`    | `_drag-conect`    | Drag connection of views                     | `any`    | `drag()`    |
| `_historyChart`  | `_history-chart`  | Stores the graph that contains history       | `any`    | `null`      |
| `_initView`      | --                | First view (initial query)                   | `object` | `undefined` |
| `_selectedQuery` | `_selected-query` |                                              | `any`    | `undefined` |
| `_treeCharts`    | `_tree-charts`    | Stores the tree of connections between views | `any`    | `null`      |
| `chartData`      | --                | Default of data for initial data             | `object` | `null`      |
| `data`           | `data`            | The dataset name being used                  | `string` | `undefined` |
| `idTemplate`     | `id-template`     |                                              | `string` | `undefined` |
| `title`          | `title`           | title of dashboard                           | `string` | `"[]"`      |
| `typeDiv`        | `type-div`        | type of div to create in inital point        | `string` | `undefined` |
| `x`              | `x`               | coordinate x                                 | `number` | `undefined` |
| `y`              | `y`               | coordinate y                                 | `number` | `undefined` |
</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>
<p>

    #### `_addLink(viewParent: any, viewChild: any) => Promise<{ line: any; conect: any; visible: boolean; }>`



    ##### Returns

    Type: `Promise<{ line: any; conect: any; visible: boolean; }>`



    #### `addChart(idParent: any, objChart: any) => Promise<number>`



    ##### Returns

    Type: `Promise<number>`



    #### `closeView(view: any) => Promise<void>`



    ##### Returns

    Type: `Promise<void>`



    #### `getChart(idChart: any) => Promise<any>`



    ##### Returns

    Type: `Promise<any>`



    #### `refreshLinks() => Promise<void>`



    ##### Returns

    Type: `Promise<void>`



    #### `refreshSvg() => Promise<void>`



    ##### Returns

    Type: `Promise<void>`



    #### `resetDashboard() => Promise<void>`



    ##### Returns

    Type: `Promise<void>`



    #### `setData(_: any) => Promise<void>`



    ##### Returns

    Type: `Promise<void>`



    #### `setParams(globalParams: any, locals: any) => Promise<void>`

    Set parameters for global variables

    ##### Returns

    Type: `Promise<void>`



    #### `showView(view: any) => Promise<void>`



    ##### Returns

    Type: `Promise<void>`

</p>
</details>

## 3.2. mge-query

### General
Follow-up query is a query created on-the-fly during the exploratory process to connect new datasets through visualization techniques. Follow-up queries are visual components connecting views. They feature an endpoint, predefined query, custom variables, the user choice for the outcome visualization technique. In MGExplorer, follow-up queries become part of the visual exploration process. 

Requirements for create a follow-up query:
- At least a visualization technique in display
- An input value selected from a visualization technique
- A predefined query (currently from LDViz) 




### Properties

<details>
<summary>Click to expand !</summary>
<p>

| Property | Attribute | Description | Type     | Default |
| -------- | --------- | ----------- | -------- | ------- |
| `data`   | --        |             | `any[]`  | `[]`    |
| `height` | `height`  |             | `number` | `350`   |
| `width`  | `width`   |             | `number` | `350`   |


</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>


#### `setBox(box: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setClone() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setCloneData(query: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setData(_: any, oldData: any) => Promise<any[]>`



##### Returns

Type: `Promise<any[]>`



#### `setInitial() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setPanel() => Promise<void>`



##### Returns

Type: `Promise<void>`

</details>


## 3.3. mge-panel



<!-- Auto Generated Below -->


### Properties

<details>
<summary>Click to expand !</summary>
<p>


| Property              | Attribute               | Description                                      | Type                                                                                                                                      | Default                                                                                                                                                                                                                                    |
| --------------------- | ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_chart`              | `_chart`                | The dataset name being used                      | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `_filter`             | `_filter`               | The dataset name being used                      | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `_idPanel`            | `_id-panel`             | The dataset name being used                      | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `_searchAutocomplete` | `_search-autocomplete`  | Text search input                                | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_selectOrder`        | `_select-order`         | The dataset name being used                      | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_sliderCharge`       | `_slider-charge`        | Slider to adjust linkDistance                    | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_sliderGravity`      | `_slider-gravity`       | Slider to adjust Gravity                         | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_sliderLinkDistance` | `_slider-link-distance` | Slider to adjust linkDistance                    | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_spanCharge`         | `_span-charge`          | Display positive value of charge attribute       | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_spanEdges`          | `_span-edges`           | Text span to show number of edges                | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_spanGravity`        | `_span-gravity`         | Display the value of the attribute gravity       | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_spanLinkDistance`   | `_span-link-distance`   | Displays the value of the linkDistance attribute | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_spanNodes`          | `_span-nodes`           | Text span to show number of nodes                | `any`                                                                                                                                     | `null`                                                                                                                                                                                                                                     |
| `_width`              | `_width`                | The dataset name being used                      | `number`                                                                                                                                  | `18`                                                                                                                                                                                                                                       |
| `filterTemplate`      | `filter-template`       | The dataset name being used                      | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `idDiv`               | `id-div`                | id of div includes the panel                     | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `typeChart`           | --                      | All of visualization techniques and its tag name | `{ nodeLinks: string; histogram: string; cluster: string; glyphMatrix: string; iris: string; paperlist: string; followupQuery: string; }` | `{     "nodeLinks": "mge-nodelink",     "histogram": "mge-barchart",     "cluster": "mge-clustervis",     "glyphMatrix": "mge-glyph-matrix",     "iris": "mge-iris",     "paperlist": "mge-listing",     "followupQuery": "mge-query"   }` |
| `typeDiv`             | `type-div`              | type of div includes the panel                   | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |


</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>
<p>

#### `_addItemsSelectOrder() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setChart(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `updateNodePanel() => Promise<void>`



##### Returns

Type: `Promise<void>`


</p>
</details>

## 3.4. mge-view


### General

Each view is a self-contained element, which includes a visualization technique and supports subsetting operations to allow further exploration of subsets of data through different views. The views can be dragged, allowing the user to rearrange the visualization space in meaningful ways to the ongoing analysis. They are connected via line segments, which reveal their dependencies and enable tracing back the exploration path, thus preserving provenance information.


### Properties

<details>
<summary>Click to expand !</summary>
<p>


| Property          | Attribute           | Description                                              | Type                                                                                                                                      | Default                                                                                                                                                                                                                                    |
| ----------------- | ------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_barTitleHeight` | `_bar-title-height` | Title bar height                                         | `number`                                                                                                                                  | `15`                                                                                                                                                                                                                                       |
| `_center`         | --                  | View center point                                        | `{ cx: number; cy: number; }`                                                                                                             | `{ cx: 0, cy: 0 }`                                                                                                                                                                                                                         |
| `_chart`          | `_chart`            | Chart associated with view                               | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `_content`        | `_content`          | Div that represents the content includes chart of a view | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `_dimView`        | --                  | View dimensions                                          | `{ width: number; height: number; }`                                                                                                      | `{ width: 10, height: 10 }`                                                                                                                                                                                                                |
| `_filter`         | `_filter`           | Div that represents the filter panel of a view           | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `_position`       | --                  | View current position                                    | `{ x: number; y: number; }`                                                                                                               | `{ x: 0, y: 0}`                                                                                                                                                                                                                            |
| `_top`            | `_top`              | Div that represents the header part of a view            | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `data`            | `data`              |                                                          | `string`                                                                                                                                  | `"[]"`                                                                                                                                                                                                                                     |
| `datatype`        | `datatype`          |                                                          | `string`                                                                                                                                  | `"number"`                                                                                                                                                                                                                                 |
| `height`          | `height`            |                                                          | `number`                                                                                                                                  | `400`                                                                                                                                                                                                                                      |
| `idDash`          | `id-dash`           |                                                          | `string`                                                                                                                                  | `undefined`                                                                                                                                                                                                                                |
| `idDiv`           | `id-div`            |                                                          | `string`                                                                                                                                  | `undefined`                                                                                                                                                                                                                                |
| `idTemplate`      | `id-template`       |                                                          | `string`                                                                                                                                  | `undefined`                                                                                                                                                                                                                                |
| `title`           | `title`             |                                                          | `string`                                                                                                                                  | `"[]"`                                                                                                                                                                                                                                     |
| `tree`            | `tree`              |                                                          | `string`                                                                                                                                  | `"{}"`                                                                                                                                                                                                                                     |
| `typeChart`       | --                  | All of visualization techniques and its tag name         | `{ nodeLinks: string; histogram: string; cluster: string; glyphMatrix: string; iris: string; paperlist: string; followupQuery: string; }` | `{     "nodeLinks": "mge-nodelink",     "histogram": "mge-barchart",     "cluster": "mge-clustervis",     "glyphMatrix": "mge-glyph-matrix",     "iris": "mge-iris",     "paperlist": "mge-listing",     "followupQuery": "mge-query"   }` |
| `typeDiv`         | `type-div`          |                                                          | `string`                                                                                                                                  | `undefined`                                                                                                                                                                                                                                |
| `viewDiv`         | `view-div`          | Div that represents the view included                    | `any`                                                                                                                                     | `undefined`                                                                                                                                                                                                                                |
| `width`           | `width`             |                                                          | `number`                                                                                                                                  | `400`                                                                                                                                                                                                                                      |
| `x`               | `x`                 |  coordinate x                                            | `number`                                                                                                                                  | `0`                                                                                                                                                                                                                                        |
| `y`               | `y`                 |  coordinate y                                            | `number`                                                                                                                                  | `0`                                                                                                                                                                                                                                        |



</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>
<p>

#### `_addItemsSelectOrder() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `_refreshBarTitle() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `_showChart(node: any, parentId: any, typeChart: any, isFromEdge?: boolean, secondNode?: any, isFromCluster?: boolean, isFromHC?: boolean, newQuery?: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `generateTitle(node: any, data: any, _typeChart: any, parentId: any, isFromEdge?: boolean, secondNode?: any, isFromCluster?: boolean, isFromHC?: boolean) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getCenter() => Promise<{ cx: number; cy: number; }>`



##### Returns

Type: `Promise<{ cx: number; cy: number; }>`



#### `getChart() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getPosition() => Promise<{ x: number; y: number; }>`



##### Returns

Type: `Promise<{ x: number; y: number; }>`



#### `idChart() => Promise<string>`



##### Returns

Type: `Promise<string>`



#### `refresh() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setCenter(x: any, y: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setPosition(x: any, y: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setTitle(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setVisible(status: any) => Promise<void>`



##### Returns

Type: `Promise<void>`

</p>
</details>

## 3.5. mge-history

### General

History panel which displays the exploration path in a hierarchical format to indicate the dependencies between views and supports quick recovery of the multiple analytical paths that emerge from a particular view

### Properties

<details>
<summary>Click to expand !</summary>
<p>


| Property           | Attribute            | Description                                               | Type     | Default                                 |
| ------------------ | -------------------- | --------------------------------------------------------- | -------- | --------------------------------------- |
| `_dashboard`       | `_dashboard`         | The parent dashboard                                      | `any`    | `null`                                  |
| `_grpHistory`      | `_grp-history`       | Group representing history tree                           | `any`    | `null`                                  |
| `_grpNodes`        | `_grp-nodes`         | Group representing nodes in the tree                      | `any`    | `null`                                  |
| `_leftText`        | `_left-text`         | Distance from the text to the left coordinate of the node | `number` | `18`                                    |
| `_nodeMargin`      | `_node-margin`       | Margin css of the node                                    | `number` | `1`                                     |
| `_nodoHeight`      | `_nodo-height`       | Space height for each node without the margins            | `number` | `14`                                    |
| `_rectHeight`      | `_rect-height`       | The height symbol                                         | `number` | `this._nodoHeight - this._nodeMargin*2` |
| `_treeLayout`      | `_tree-layout`       | The tree layout to stored tree data                       | `any`    | `tree().size([0, this._nodoHeight ])`   |
| `_vNodes`          | --                   | Vector with objects of all nodes                          | `any[]`  | `[]`                                    |
| `height`           | `height`             |                                                           | `number` | `250`                                   |
| `historyTreePanel` | `history-tree-panel` | Represents the panel associated with the graphic          | `any`    | `null`                                  |
| `tree`             | `tree`               |                                                           | `string` | `"{}"`                                  |
| `width`            | `width`              |                                                           | `number` | `350`                                   |

</p>
</details>

### Methods


<details>
<summary>Click to expand !</summary>

#### `addHistoryTreeChart(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `getBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setData(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setTree(newTree: any) => Promise<void>`



##### Returns

Type: `Promise<void>`

</details>


# 4. Implementing visualization techniques (extending mge-view)

### General

Visualization techniques are useful tools to explore data by enabling the discovery of meaningful patterns and causal relationships. The discovery process is often exploratory and requires multiple views to support analyzing different or complementary perspectives to the data.

## 4.1. mge-barchart

### General

The Bar Chart technique shows the distribution of data attributes’ value for an item or set of items. In our case study, the x-axis encodes temporal information, while the y-axis encodes the counting of co-publications. The data is displayed as a single bar per time period or multiple colored bars to represent categorical information of attributes



### Properties

<details>
<summary>Click to expand !</summary>
<p>

| Property         | Attribute          | Description                                                                | Type     | Default     |
| ---------------- | ------------------ | -------------------------------------------------------------------------- | -------- | ----------- |
| `_cfgIndexAttr`  | `_cfg-index-attr`  | Contains the indexes of the attributes that can be configured in the graph | `any`    | `undefined` |
| `_colorsBars`    | `_colors-bars`     | colors for the different types                                             | `any`    | `undefined` |
| `_documentTypes` | `_document-types`  | keeps data on the different types of documents (attributes)                | `any`    | `undefined` |
| `_grpHistogram`  | `_grp-histogram`   | Group representing Histogram                                               | `any`    | `undefined` |
| `_histogramData` | `_histogram-data`  | keeps the count of documents per year and type                             | `any`    | `undefined` |
| `_innerRadius`   | `_inner-radius`    | (calculated) radius of the circle where the centroid is inserted           | `any`    | `undefined` |
| `_irisPanel`     | `_iris-panel`      | represents the panel associated with the graph                             | `any`    | `undefined` |
| `_maxHeightBar`  | `_max-height-bar`  | (calculated) distance occupied by the bars                                 | `any`    | `undefined` |
| `_nbOfTypesDoc`  | `_nb-of-types-doc` | Number of types of documents in the base                                   | `any`    | `undefined` |
| `_outerRadius`   | `_outer-radius`    | (calculated) Outernal circle radius where the graph is drawn               | `any`    | `undefined` |
| `_vOrder`        | `_v-order`         | Indirect ordering vector                                                   | `any`    | `undefined` |
| `data`           | `data`             |                                                                            | `string` | `"[]"`      |
| `height`         | `height`           |                                                                            | `number` | `350`       |
| `width`          | `width`            |                                                                            | `number` | `350`       |


</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>
#### `_closeToolTip() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `_openToolTip() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSortExecAttribute() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSortExecText() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `addHistogramChart(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `dataVisToNode(index: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getSourceObject() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getVOrder() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setConfigCentroid(titulo: any, tituloGrau: any, textoBarra: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setConstructAbscissa() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setConstructBars() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setData(_: any, globalData: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setIndexAttrBar(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setOrdinate() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setPanel(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpInnerRadius(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpMaxHeightBar(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpOuterRadius(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`

</details>

## 4.2. mge-clustervis

### General 

The ClusterVis technique depicts clusters according to some relationship among data items. It has a multi-ring layout, where the innermost ring is formed by the data items (represented by circles), and the remaining rings display the data


### Properties

<details>
<summary>Click to expand !</summary>
<p>

| Property           | Attribute            | Description                                                  | Type      | Default     |
| ------------------ | -------------------- | ------------------------------------------------------------ | --------- | ----------- |
| `_clusterVisPanel` | `_cluster-vis-panel` | Represents the panel associated with the graphic             | `any`     | `null`      |
| `_drawLine`        | `_draw-line`         | Generator of splines that makes up the edges                 | `any`     | `undefined` |
| `_grpBars`         | `_grp-bars`          | Selection that contains all groups that store the bars       | `any`     | `null`      |
| `_grpCluster`      | `_grp-cluster`       | Group representing ClusterVis                                | `any`     | `null`      |
| `_grpLinks`        | `_grp-links`         | Selection that contains all groups that store the links      | `any`     | `null`      |
| `_grpRings`        | `_grp-rings`         | Selection that contains all groups that store the rings      | `any`     | `null`      |
| `_innerRadius`     | `_inner-radius`      | (calculated) Internal circle radius where the graph is drawn | `number`  | `0`         |
| `_links`           | `_links`             | Selection that contains the links                            | `any`     | `null`      |
| `_outerRadius`     | `_outer-radius`      | (calculated) Outernal circle radius where the graph is drawn | `number`  | `0`         |
| `_sameScale`       | `_same-scale`        | Indicates that the same scale should be used for all bars    | `boolean` | `false`     |
| `_xClusterCenter`  | `_x-cluster-center`  | Coordinate x of the center of the cluster                    | `number`  | `0`         |
| `_yClusterCenter`  | `_y-cluster-center`  | Coordinate y of the center of the cluster                    | `number`  | `0`         |
| `data`             | `data`               |                                                              | `string`  | `"[]"`      |
| `height`           | `height`             |                                                              | `number`  | `350`       |
| `width`            | `width`              |                                                              | `number`  | `350`       |

</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>


#### `acAlteraAnel(indexAnel: any, indexAttr: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSameScale(checked: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSortExec(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `addAttribute(_indexAttr: any, _typeAttr: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `addClusterChart(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `alteraAttribute(_indexAnel: any, _indexAttr: any, _typeAttr: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `obtemRings() => Promise<any[]>`



##### Returns

Type: `Promise<any[]>`



#### `removeAnelExterno() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setData(_: any, globalData: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setIndexAttrSort(_: any) => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `setPanel(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpInnerRadius(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpOuterRadius(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`

</details>

## 4.3. mge-glyph-matrix

### General

The GlyphMatrix technique is based on a matrix where rows and columns represent data items in a cluster, and the cells contain glyphs encoding attributes that describe a pairwise relationship. The default glyph is a star-plot-like shape, with a variable number of axes used to encode values of selected data attributes. By pointing a glyph in the matrix, it is possib




### Properties

<details>
<summary>Click to expand !</summary>
<p>

| Property            | Attribute             | Description                                                             | Type     | Default           |
| ------------------- | --------------------- | ----------------------------------------------------------------------- | -------- | ----------------- |
| `_cellCoordScale`   | `_cell-coord-scale`   | Scale is used to determine the coordinates of cells and legend elements | `any`    | `scaleBand()`     |
| `_cellGlyph`        | `_cell-glyph`         | keeps data on the different types of documents (attributes)             | `any`    | `NumericGlyph(0)` |
| `_dragListenerL`    | `_drag-listener-l`    | Listener of legends                                                     | `any`    | `null`            |
| `_dragListenerM`    | `_drag-listener-m`    | Listener of Matrix                                                      | `any`    | `null`            |
| `_grpBarsLL`        | `_grp-bars-l-l`       | Select with all groups from left side legend bar                        | `any`    | `null`            |
| `_grpBarsTL`        | `_grp-bars-t-l`       | Select with all groups from top side legend bar                         | `any`    | `null`            |
| `_grpLeftLegend`    | `_grp-left-legend`    | Select with left side legend bar                                        | `any`    | `null`            |
| `_grpLines`         | `_grp-lines`          | Contains lines with cells in each line                                  | `any`    | `null`            |
| `_grpMatrix`        | `_grp-matrix`         | Select with matrix chart                                                | `any`    | `null`            |
| `_grpMatrixGlyph`   | `_grp-matrix-glyph`   | keeps data on the different types of documents (attributes)             | `any`    | `null`            |
| `_grpOverview`      | `_grp-overview`       | The group represents the matrix overview                                | `any`    | `null`            |
| `_grpTopLegend`     | `_grp-top-legend`     | Select with top side legend bar                                         | `any`    | `null`            |
| `_idClipLeft`       | `_id-clip-left`       | Left legend clipping area id                                            | `any`    | `undefined`       |
| `_idClipMatrix`     | `_id-clip-matrix`     | Matrix clipping area id                                                 | `any`    | `undefined`       |
| `_idClipTop`        | `_id-clip-top`        | Top legend clipping area id                                             | `any`    | `undefined`       |
| `_indexAttrLegend`  | `_index-attr-legend`  | The index of the attribute will be printed in the legend (node)         | `number` | `0`               |
| `_indexAttrSort`    | `_index-attr-sort`    | Attribute index used for sorting                                        | `number` | `0`               |
| `_matrixGlyphPanel` | `_matrix-glyph-panel` | Group represents the entire chart                                       | `any`    | `null`            |
| `_matrixHeight`     | `_matrix-height`      | Matrix area height (calculated)                                         | `number` | `0`               |
| `_matrixWidth`      | `_matrix-width`       | Matrix area width (calculated)                                          | `number` | `0`               |
| `_overviewScale`    | `_overview-scale`     | Scale is used to set the coordinates of the overview cursor             | `any`    | `scaleLinear()`   |
| `_vOrder`           | `_v-order`            | Indirect ordering vector                                                | `any`    | `null`            |
| `data`              | `data`                |                                                                         | `string` | `"[]"`            |
| `height`            | `height`              |                                                                         | `number` | `350`             |
| `width`             | `width`               |                                                                         | `number` | `350`             |


</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>

#### `acChangeAttrLegend(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acChangeVisibleLines(qtLines: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSortExec(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `addMatrixGlyph(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `cellColorsMap(colors: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `debug() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `getMaxVisibleLines() => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `getMinVisibleLines() => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `getVisibleLines() => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `glyph(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `indexAttrCellColor(_: any) => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `indexAttrLegend(_: any) => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `indexAttrSort(_: any) => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `pFontHeight(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `pLegendWidth(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setData(_: any, globalData: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setPanel(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setTTMatrixCell(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`

</details>


## 4.4. mge-iris

### General

The IRIS technique allows isolating a data item of interest (at the center) and showing all other data items with which it has a specific relationship in a circular view [25]. The data attributes of such pairwise relationships are encoded by the height and color of a bar placed between the item of interest and each related item. The user can place any item in the field of view

### Properties

<details>
<summary>Click to expand !</summary>
<p>

| Property          | Attribute           | Description                                                                         | Type     | Default     |
| ----------------- | ------------------- | ----------------------------------------------------------------------------------- | -------- | ----------- |
| `_cfgIndexAttr`   | `_cfg-index-attr`   | Contains the indexes of the attributes that can be configured in the graph          | `any`    | `undefined` |
| `_colorsBars`     | `_colors-bars`      | colors for the different types                                                      | `any`    | `undefined` |
| `_dataVis`        | `_data-vis`         | Vector of visible data. Points to the elements of model.data                        | `any`    | `undefined` |
| `_fishEyeArea`    | `_fish-eye-area`    | Contains the attribute of the fish eye area                                         | `any`    | `undefined` |
| `_focusArea`      | `_focus-area`       | Contains the attribute of the focused area                                          | `any`    | `undefined` |
| `_grpBars`        | `_grp-bars`         | Selection that contains all groups of bars                                          | `any`    | `undefined` |
| `_grpIris`        | `_grp-iris`         | Group representing IRIS                                                             | `any`    | `undefined` |
| `_hiddenArea`     | `_hidden-area`      | Contains the attribute of the hidden area                                           | `any`    | `undefined` |
| `_indexFirstData` | `_index-first-data` | Index in the "dataVis" vector where the first element of the data vector is located | `any`    | `undefined` |
| `_innerRadius`    | `_inner-radius`     | (calculated) radius of the circle where the centroid is inserted                    | `any`    | `undefined` |
| `_irisPanel`      | `_iris-panel`       | The dataset name being used                                                         | `any`    | `undefined` |
| `_maxHeightBar`   | `_max-height-bar`   | (calculated) distance occupied by the bars                                          | `any`    | `undefined` |
| `_minArea`        | `_min-area`         | Contains the attribute of the minimum area                                          | `any`    | `undefined` |
| `_nbOfTypesDoc`   | `_nb-of-types-doc`  | number of types of documents in the base                                            | `any`    | `undefined` |
| `_numMaxBars`     | `_num-max-bars`     | Maximum number of the bars                                                          | `any`    | `undefined` |
| `_numTotalBars`   | `_num-total-bars`   | Total number of the bars                                                            | `any`    | `undefined` |
| `_orders`         | `_orders`           | The orders of typesDocs                                                             | `any`    | `undefined` |
| `_outerRadius`    | `_outer-radius`     | (calculated) Outernal circle radius where the graph is drawn                        | `any`    | `undefined` |
| `_pDesloc`        | `_p-desloc`         | Percentage of center displacement                                                   | `any`    | `undefined` |
| `_vOrder`         | `_v-order`          | Indirect ordering vector                                                            | `any`    | `undefined` |
| `data`            | `data`              |                                                                                     | `string` | `"[]"`      |
| `height`          | `height`            |                                                                                     | `number` | `350`       |
| `width`           | `width`             |                                                                                     | `number` | `350`       |

</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>

#### `acSortExecAttribute() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSortExecText() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `addIrisChart(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `dataVisToNode(index: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getSourceObject() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getVOrder() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `putBarsOnIris() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setConfigCentroid(titulo: any, tituloGrau: any, textoBarra: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setData(_: any, globalData: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setIndexAttrBar(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setPanel(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpInnerRadius(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpMaxHeightBar(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setpOuterRadius(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `updateTextSize() => Promise<void>`



##### Returns

Type: `Promise<void>`

</details>

## 4.5. mge-listing


### General

The list of papers technique allows listing all the information related to the selected data. Listing all related items will help users have all the necessary information in the data discovery process


### Properties

<details>
<summary>Click to expand !</summary>
<p>


| Property               | Attribute                 | Description                                                   | Type       | Default                                        |
| ---------------------- | ------------------------- | ------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| `_colorsRect`          | --                        | Colors for the different types                                | `string[]` | `["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"]` |
| `_data`                | `_data`                   | List of items in the data                                     | `any`      | `null`                                         |
| `_grpPapers`           | `_grp-papers`             | Selection that contains all groups of bars                    | `any`      | `null`                                         |
| `_grpPapersList`       | `_grp-papers-list`        | Group representing IRIS                                       | `any`      | `null`                                         |
| `_maxLenghtTitleIndex` | `_max-lenght-title-index` | Maximum length of title                                       | `number`   | `7.8`                                          |
| `_maxNamesLenght`      | `_max-names-lenght`       | Maximum length of names                                       | `number`   | `87`                                           |
| `_names`               | `_names`                  | Selection that contains the names of the members of a cluster | `any`      | `null`                                         |
| `_papersListPanel`     | `_papers-list-panel`      | represents the panel associated with the graph                | `any`      | `null`                                         |
| `data`                 | `data`                    |                                                               | `string`   | `"[]"`                                         |
| `height`               | `height`                  |                                                               | `number`   | `400`                                          |
| `width`                | `width`                   |                                                               | `number`   | `350`              

</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>

#### `addPaperListChart(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `dataVisToNode(index: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setData(_: any, globalData: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setPanel(_: any) => Promise<void>`



##### Returns

Type: `Promise<void>`

</details>

## 4.6. mge-nodelink

### General

The NodeEdge diagram shows nodes as items and edges between them as relationships. The NodeEdge is used to provide an overview of any network defined within the dataset according to some criteria (e.g., keywords, co-publications, etc.).

### Properties

<details>
<summary>Click to expand !</summary>
<p>

| Property | Attribute | Description | Type     | Default |
| -------- | --------- | ----------- | -------- | ------- |
| `data`   | `data`    |             | `string` | `"[]"`  |
| `height` | `height`  |             | `number` | `350`   |
| `width`  | `width`   |             | `number` | `350`   |

</p>
</details>

### Methods

<details>
<summary>Click to expand !</summary>


#### `acChangeAttrSize(atributo: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acChangeCharge(value: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acChangeGravity(value: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acChangeLinkDistance(value: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSelectByName(nome: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `acSelectByNameCluster(nomeCluster: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `addNodeLinkChart(idDiv: any, divTag: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `getCharge() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getColorBreaks() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getColorScale() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getGravity() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getLinkDistance() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getQtEdges() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `getQtNodes() => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `indexAttrSize(_: any) => Promise<number>`



##### Returns

Type: `Promise<number>`



#### `resetHighSearch() => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setBox(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setData(_: any, globalData: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setItensContextMenu(itens: any) => Promise<void>`



##### Returns

Type: `Promise<void>`



#### `setLegend(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`



#### `setPanel(_: any) => Promise<any>`



##### Returns

Type: `Promise<any>`


</details>
