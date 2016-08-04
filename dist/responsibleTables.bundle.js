!function e(t,a,n){function i(s,o){if(!a[s]){if(!t[s]){var r="function"==typeof require&&require;if(!o&&r)return r(s,!0);if(l)return l(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var u=a[s]={exports:{}};t[s][0].call(u.exports,function(e){var a=t[s][1][e];return i(a?a:e)},u,u.exports,e,t,a,n)}return a[s].exports}for(var l="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(e,t,a){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},l=function(){function e(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,a,n){return a&&e(t.prototype,a),n&&e(t,n),t}}(),s=function(){function e(t){n(this,e),this.defaults={activeClass:"responsibleTable--active",columnHeadingClass:"responsibleTable__column-heading",containerSelector:".container",debounceRate:200,subHeadingClass:"responsibleTable__sub-heading",tableDataClass:"responsibleTable__table-data",tableSelector:".responsibleTable",debug:!1},this.extendDefaults(t,this.defaults),this.originalTables=[].slice.call(document.querySelectorAll(this.defaults.tableSelector)),this.tableData=[],this.testData={start:0,finish:0,result:function(){return Math.round(this.finish-this.start)?""+Math.round(this.finish-this.start):"< 1"}},this.registerEvents(),this.init()}return l(e,[{key:"init",value:function(){var e=this;!(arguments.length<=0||void 0===arguments[0])&&arguments[0];this.originalTables.forEach(function(t,a){e.initiateTableData(t,a),e.tableData[a].cache.original||e.cacheTable(t,a)})}},{key:"refresh",value:function(){var e=this;this.originalTables.forEach(function(t,a){e.tableData[a].currentWidth=e.tableData[a].node.getBoundingClientRect().width,e.tableData[a].container.node&&(e.tableData[a].container.width=e.tableData[a].container.node.getBoundingClientRect().width),e.build(t,a)})}},{key:"cacheTable",value:function(e,t){this.tableData[t].isResponsible?this.tableData[t].cache.responsible=e.outerHTML:this.tableData[t].cache.original=e.outerHTML}},{key:"initiateTableData",value:function(e,t){this.tableData[t]={currentWidth:0,isResponsible:!1,hasChanged:!1,minWidth:0,node:null,cache:{original:"",responsible:""},rows:{nodes:null,length:0},columns:{nodes:null,length:0},headings:{nodes:null,titles:[]},container:{node:null,width:0},fragment:null},this.tableData[t].node=e,this.tableData[t].currentWidth=e.getBoundingClientRect().width,this.tableData[t].rows.nodes=this.getRows(e),this.tableData[t].rows.length=this.tableData[t].rows.nodes.length,this.tableData[t].columns.nodes=this.getColumns(e),this.tableData[t].columns.length=this.tableData[t].columns.nodes.length,this.tableData[t].headings.titles=this.getTableHeadings(e,t),this.tableData[t].container.node=document.querySelector(this.defaults.containerSelector)||null,this.tableData[t].container.node&&(this.tableData[t].container.width=this.tableData[t].container.node.getBoundingClientRect().width),this.tableData[t].fragment=document.createDocumentFragment()}},{key:"build",value:function(e,t){var a=this;if(this.testData.start=performance.now(),this.tableData[t].hasChanged)this.tableData[t].node.outerHTML=this.tableData[t].cache.responsible,this.tableData[t].node=document.querySelector(this.defaults.tableSelector),this.tableData[t].isResponsible=!0;else{this.tableData[t].minWidth=this.tableData[t].currentWidth,this.tableData[t].fragment=document.createDocumentFragment(),this.tableData[t].fragment.appendChild(this.buildFirstRow(e,t)),this.tableData[t].rows.nodes.forEach(function(n,i){i&&a.tableData[t].fragment.appendChild(a.buildTableData(e,t,i))});var n=e.cloneNode(!1);n.appendChild(this.tableData[t].fragment),e.innerHTML=n.innerHTML,e.classList.add(this.defaults.activeClass),this.tableData[t].node=e,this.tableData[t].hasChanged=!0,this.tableData[t].isResponsible=!0,this.tableData[t].cache.responsible||this.cacheTable(e,t)}this.testData.finish=performance.now()}},{key:"getColumns",value:function(e){var t=this.getRows(e)[0];return[].slice.call(t.children)}},{key:"getRows",value:function(e){return[].slice.call(e.getElementsByTagName("tr"))}},{key:"getTableHeadings",value:function(e,t){var a=[];return this.tableData[t].columns.nodes.forEach(function(t,n){a.push(e.getElementsByTagName("th")[n].innerHTML)}),a}},{key:"buildFirstRow",value:function(e,t){var a=e.querySelector("th"),n=document.createElement("tr"),i=document.createElement("th");return i.innerHTML=a.innerHTML,i.setAttribute("colspan",2),n.appendChild(i),n}},{key:"buildTableData",value:function(e,t,a){var n=this,i=document.createDocumentFragment(),l=document.createElement("tr"),s=this.tableData[t].rows.nodes[a].querySelectorAll("td"),o=s[0];return o.setAttribute("colspan",2),o.classList.add(this.defaults.subHeadingClass),l.appendChild(o),i.appendChild(l),this.tableData[t].columns.nodes.forEach(function(e,a){if(a){var l=document.createElement("tr"),o=document.createElement("td");o.innerHTML=n.tableData[t].headings.titles[a],o.classList.add(n.defaults.columnHeadingClass),l.appendChild(o),s[a].classList.add(n.defaults.tableDataClass),l.appendChild(s[a]),i.appendChild(l)}}),i}},{key:"restoreTable",value:function(){var e=this,t=arguments.length<=0||void 0===arguments[0]?null:arguments[0];this.testData.start=performance.now(),null===t?this.originalTables.forEach(function(t,a){e.tableData[a].isResponsible?(t.outerHTML=e.tableData[a].cache.original,e.tableData[a].isResponsible=!1,e.tableData[a].node=[].slice.call(document.querySelectorAll(e.defaults.tableSelector))[a]):(t.outerHTML=e.tableData[a].cache.responsible,e.tableData[a].isResponsible=!0,e.tableData[a].node=[].slice.call(document.querySelectorAll(e.defaults.tableSelector))[a])}):this.tableData[t].isResponsible?(this.tableData[t].isResponsible=!1,this.tableData[t].node.outerHTML=this.tableData[t].cache.original,this.tableData[t].node=document.querySelector(this.defaults.tableSelector)):(this.tableData[t].isResponsible=!0,this.tableData[t].node.outerHTML=this.tableData[t].cache.responsible,this.tableData[t].node=document.querySelector(this.defaults.tableSelector)),this.testData.finish=performance.now()}},{key:"extendDefaults",value:function(e,t){if("object"===("undefined"==typeof e?"undefined":i(e)))for(var a in e)t.hasOwnProperty(a)&&(t[a]=e[a])}},{key:"registerEvents",value:function(){var e=this;window.addEventListener("resize",this.debounce(function(){e.refresh()},this.defaults.debounceRate))}},{key:"debounce",value:function(e,t,a){var n=this,i=arguments,l=void 0;return function(){var s=n,o=i,r=function(){l=null,a||e.apply(s,o)},c=a&&!l;clearTimeout(l),l=setTimeout(r,t),c&&e.apply(s,o)}}}]),e}();t.exports=s},{}]},{},[1]);
//# sourceMappingURL=responsibleTables.bundle.js.map
