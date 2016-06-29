(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (!("classList" in document.createElement("_"))
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],2:[function(require,module,exports){
void function(root){

  function defaults(options){
    var options = options || {}
    var min = options.min
    var max = options.max
    var integer = options.integer || false
    if ( min == null && max == null ) {
      min = 0
      max = 1
    } else if ( min == null ) {
      min = max - 1
    } else if ( max == null ) {
      max = min + 1
    }
    if ( max < min ) throw new Error('invalid options, max must be >= min')
    return {
      min:     min
    , max:     max
    , integer: integer
    }
  }

  function random(options){
    options = defaults(options)
    if ( options.max === options.min ) return options.min
    var r = Math.random() * (options.max - options.min + Number(!!options.integer)) + options.min
    return options.integer ? Math.floor(r) : r
  }

  function generator(options){
    options = defaults(options)
    return function(min, max, integer){
      options.min     = min != null ? min : options.min
      options.max     = max != null ? max : options.max
      options.integer = integer != null ? integer : options.integer
      return random(options)
    }
  }

  module.exports =  random
  module.exports.generator = generator
  module.exports.defaults = defaults
}(this)

},{}],3:[function(require,module,exports){
'use strict';

var _responsibleTable = require('./responsibleTable');

var _responsibleTable2 = _interopRequireDefault(_responsibleTable);

var _tableGenerator = require('./tableGenerator');

var _tableGenerator2 = _interopRequireDefault(_tableGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const t0 = performance.now()initiatet responsibleTable = new ResponsibleTable();
// const t1 = performance.now();

var tableGenerator = new _tableGenerator2.default();
var consoleElement = document.getElementById('console');
var generatedContainer = document.getElementById('generatedContainer');
var mainContent = document.getElementById('main');

var start;
var finish;
var currentTable;

function consoleLog(log) {
    var output = document.createElement('p');
    var logs = consoleElement.querySelectorAll('.console__output');

    if (logs.length > 5) {
        logs[0].remove();
    }

    output.className = 'console__output';
    output.innerHTML = log;
    consoleElement.appendChild(output);
}

window.addEventListener('tableGenerator::complete', function () {
    var responsibleToggle = void 0;
    var thisTableLabel = 'Responsible table [' + tableGenerator.columns + ' x ' + tableGenerator.rows + ', ' + tableGenerator.rows * tableGenerator.columns + ' cells]';

    if (!document.getElementById('responsibleToggle')) {
        responsibleToggle = document.createElement('button');
        responsibleToggle.id = 'responsibleToggle';
        responsibleToggle.innerHTML = 'Toggle Responsible Table';
        mainContent.insertBefore(responsibleToggle, generatedContainer);
        responsibleToggle.addEventListener('click', function () {
            thisTableLabel = 'Responsible table [' + tableGenerator.columns + ' x ' + tableGenerator.rows + ', ' + tableGenerator.rows * tableGenerator.columns + ' cells]';

            if (!currentTable.tableData[0].isResponsible) {
                currentTable.build(currentTable.originalTables[0], 0);
                consoleLog(thisTableLabel + ' took <strong>' + currentTable.testData.result() + ' ms</strong> to build');
            } else {
                currentTable.restoreTable(0);
                consoleLog(thisTableLabel + ' took <strong>' + currentTable.testData.result() + ' ms</strong> to restore');
            }
        });
    } else {
        responsibleToggle = document.getElementById('responsibleToggle');
    }

    start = performance.now();

    currentTable = new _responsibleTable2.default({
        tableSelector: '.' + tableGenerator.tableId
    });

    finish = performance.now();

    consoleLog(thisTableLabel + ' took <strong>' + Math.round(finish - start) + ' ms</strong> to initiate');
});

window.addEventListener('tableGenerator::refresh', function () {
    currentTable.refresh();
});

},{"./responsibleTable":4,"./tableGenerator":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO public method for returning table(s)
// TODO: handle tfoot
// TODO: handle tables with no th's
// TODO: handle duplicate ID's

var ResponsibleTable = function () {
    function ResponsibleTable(options) {
        _classCallCheck(this, ResponsibleTable);

        // defaults
        this.defaults = {
            activeClass: 'responsibleTable--active',
            columnHeadingClass: 'responsibleTable__column-heading',
            containerSelector: '.container',
            debounceRate: 200,
            subHeadingClass: 'responsibleTable__sub-heading',
            tableDataClass: 'responsibleTable__table-data',
            tableSelector: '.responsibleTable',
            debug: false
        };
        // merge options and defaults
        this.extendDefaults(options, this.defaults);
        // vars
        this.originalTables = [].slice.call(document.querySelectorAll(this.defaults.tableSelector));
        this.tableData = [];
        this.testData = {
            start: 0,
            finish: 0,
            result: function result() {
                return Math.round(this.finish - this.start) ? '' + Math.round(this.finish - this.start) : '< 1';
            }
        };
        this.registerEvents();
        this.init();
    }

    /**
     * initiate data, cache table, build / not build
     * @param force {boolean}
     */


    _createClass(ResponsibleTable, [{
        key: 'init',
        value: function init() {
            var _this = this;

            var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            this.originalTables.forEach(function (table, index) {
                // create tableData object per instance
                _this.initiateTableData(table, index);

                console.log(_this.tableData);
                // cache original state
                if (!_this.tableData[index].cache.original) {
                    _this.cacheTable(table, index);
                }
                // to build or not to build...
                // this.build(table, index, force);
            });
        }

        /**
         * refresh table state, update table & container width, build / not build
         */

    }, {
        key: 'refresh',
        value: function refresh() {
            var _this2 = this;

            this.originalTables.forEach(function (table, index) {
                _this2.tableData[index].currentWidth = _this2.tableData[index].node.getBoundingClientRect().width;

                if (_this2.tableData[index].container.node) {
                    _this2.tableData[index].container.width = _this2.tableData[index].container.node.getBoundingClientRect().width;
                }

                // to build or not to build...
                _this2.build(table, index);
            });
        }

        /**
         * cache original & responsible version of table outerHTML
         * @param table {Element}
         * @param index {int}
         */

    }, {
        key: 'cacheTable',
        value: function cacheTable(table, index) {
            if (!this.tableData[index].isResponsible) {
                this.tableData[index].cache.original = table.outerHTML;
            } else {
                this.tableData[index].cache.responsible = table.outerHTML;
            }
        }

        /**
         * create table data object
         * @param table {Element}
         * @param index {int}
         */

    }, {
        key: 'initiateTableData',
        value: function initiateTableData(table, index) {
            this.tableData[index] = {
                currentWidth: 0,
                isResponsible: false,
                hasChanged: false,
                minWidth: 0,
                node: null,
                cache: {
                    original: '',
                    responsible: ''
                },
                rows: {
                    nodes: null,
                    length: 0
                },
                columns: {
                    nodes: null,
                    length: 0
                },
                headings: {
                    nodes: null,
                    titles: []
                },
                container: {
                    node: null,
                    width: 0
                },
                fragment: null
            };

            // original table node
            this.tableData[index].node = table;
            // width
            this.tableData[index].currentWidth = table.getBoundingClientRect().width;
            // rows
            this.tableData[index].rows.nodes = this.getRows(table);
            this.tableData[index].rows.length = this.tableData[index].rows.nodes.length;
            // columns
            this.tableData[index].columns.nodes = this.getColumns(table);
            this.tableData[index].columns.length = this.tableData[index].columns.nodes.length;
            // headings
            this.tableData[index].headings.titles = this.getTableHeadings(table, index);
            // container
            this.tableData[index].container.node = document.querySelector(this.defaults.containerSelector) || null;
            if (this.tableData[index].container.node) {
                this.tableData[index].container.width = this.tableData[index].container.node.getBoundingClientRect().width;
            }
            // fragment
            this.tableData[index].fragment = document.createDocumentFragment();
        }

        /**
         * build responsible table
         * @param table {Element}
         * @param tableIndex {int}
         * @returns {boolean}
         */

    }, {
        key: 'build',
        value: function build(table, tableIndex) {
            var _this3 = this;

            console.log('building...');

            this.testData.start = performance.now();

            if (!this.tableData[tableIndex].hasChanged) {
                this.tableData[tableIndex].minWidth = this.tableData[tableIndex].currentWidth;
                // create table fragment
                this.tableData[tableIndex].fragment = document.createDocumentFragment();
                // append first row to fragment
                this.tableData[tableIndex].fragment.appendChild(this.buildFirstRow(table, tableIndex));
                // loop through rows excluding the first and build out the data
                this.tableData[tableIndex].rows.nodes.forEach(function (row, index) {
                    if (index) {
                        _this3.tableData[tableIndex].fragment.appendChild(_this3.buildTableData(table, tableIndex, index));
                    }
                });
                // clone original table node, excluding children
                var newTable = table.cloneNode(false);
                // append fragment to cloned node
                newTable.appendChild(this.tableData[tableIndex].fragment);
                // switch out innerHTML of old table for new
                table.innerHTML = newTable.innerHTML;
                // TODO: classList fallback
                table.classList.add(this.defaults.activeClass);
                // update config with new node
                this.tableData[tableIndex].node = table;
                // record state change
                this.tableData[tableIndex].hasChanged = true;
                this.tableData[tableIndex].isResponsible = true;

                if (!this.tableData[tableIndex].cache.responsible) {
                    this.cacheTable(table, tableIndex);
                }
            }
            // restore responsible table from cache if we have cached it
            else {
                    this.tableData[tableIndex].node.outerHTML = this.tableData[tableIndex].cache.responsible;
                    // TODO Do we need this node reference
                    this.tableData[tableIndex].node = document.querySelector(this.defaults.tableSelector);
                    this.tableData[tableIndex].isResponsible = true;
                }

            this.testData.finish = performance.now();
        }

        /**
         * get table columns
         * @param table {Element}
         * @returns {array}
         */

    }, {
        key: 'getColumns',
        value: function getColumns(table) {
            // potentially better way of getting this, maybe get largest row instead of assuming the first
            var firstRow = this.getRows(table)[0];
            return [].slice.call(firstRow.children);
        }

        /**
         * get table rows
         * @param table {Element}
         * @returns {array}
         */

    }, {
        key: 'getRows',
        value: function getRows(table) {
            return [].slice.call(table.getElementsByTagName('tr'));
        }

        /**
        * Get column headings
        * @param    {Element} table
        * @return   {Array} column headings
        **/

    }, {
        key: 'getTableHeadings',
        value: function getTableHeadings(table, index) {
            var headings = [];

            this.tableData[index].columns.nodes.forEach(function (column, index) {
                headings.push(table.getElementsByTagName('th')[index].innerHTML);
            });

            return headings;
        }

        /**
         * build first row of responsible table
         * @param table {Element}
         * @param index {int}
         * @returns {Element}
         */

    }, {
        key: 'buildFirstRow',
        value: function buildFirstRow(table, index) {
            // this might not be a th, fix that
            var firstCell = table.querySelector('th');
            var firstRow = document.createElement('tr');
            var thisCell = document.createElement('th');

            thisCell.innerHTML = firstCell.innerHTML;
            thisCell.setAttribute('colspan', 2);
            firstRow.appendChild(thisCell);

            return firstRow;
        }

        /**
         * build table data
         * @param table {Element}
         * @param tableIndex {int}
         * @param rowIndex {int}
         * @returns {DocumentFragment}
         */

    }, {
        key: 'buildTableData',
        value: function buildTableData(table, tableIndex, rowIndex) {
            var _this4 = this;

            var fragment = document.createDocumentFragment();
            var firstRow = document.createElement('tr');
            var cells = this.tableData[tableIndex].rows.nodes[rowIndex].querySelectorAll('td');
            var firstCell = cells[0];
            // append first cell as data heading
            firstCell.setAttribute('colspan', 2);
            // TODO: fallback for ie9
            firstCell.classList.add(this.defaults.subHeadingClass);
            firstRow.appendChild(firstCell);
            fragment.appendChild(firstRow);
            // loop through each column exluding first and populate data
            this.tableData[tableIndex].columns.nodes.forEach(function (column, index) {
                if (index) {
                    var row = document.createElement('tr');
                    var heading = document.createElement('td');

                    heading.innerHTML = _this4.tableData[tableIndex].headings.titles[index];
                    // TODO: this might not be a 'th', fix that
                    // TODO: classlist fallback
                    heading.classList.add(_this4.defaults.columnHeadingClass);
                    row.appendChild(heading);
                    // TODO: classlist fallback
                    cells[index].classList.add(_this4.defaults.tableDataClass);
                    row.appendChild(cells[index]);
                    fragment.appendChild(row);
                }
            });

            return fragment;
        }

        /**
         * toggle table state and restore
         * @param index {int || null}
         */

    }, {
        key: 'restoreTable',
        value: function restoreTable() {
            var _this5 = this;

            var index = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            this.testData.start = performance.now();

            console.log('restoring...');
            // if no index provided restore all tables
            if (index === null) {
                this.originalTables.forEach(function (table, index) {
                    if (_this5.tableData[index].isResponsible) {
                        table.outerHTML = _this5.tableData[index].cache.original;
                        _this5.tableData[index].isResponsible = false;
                        // TODO: Do we need this new node reference?
                        _this5.tableData[index].node = [].slice.call(document.querySelectorAll(_this5.defaults.tableSelector))[index];
                    } else {
                        table.outerHTML = _this5.tableData[index].cache.responsible;
                        _this5.tableData[index].isResponsible = true;
                        // TODO: Do we need this new node reference?
                        _this5.tableData[index].node = [].slice.call(document.querySelectorAll(_this5.defaults.tableSelector))[index];
                    }
                });
            }
            // restore table index
            // TODO: perhaps need a method to return a table index,
            // how would a user know the table index?
            else {
                    if (this.tableData[index].isResponsible) {
                        this.tableData[index].isResponsible = false;
                        this.tableData[index].node.outerHTML = this.tableData[index].cache.original;
                        // TODO Do we need this node reference
                        this.tableData[index].node = document.querySelector(this.defaults.tableSelector);
                    } else {
                        this.tableData[index].isResponsible = true;
                        this.tableData[index].node.outerHTML = this.tableData[index].cache.responsible;
                        // TODO Do we need this node reference
                        this.tableData[index].node = document.querySelector(this.defaults.tableSelector);
                    }
                }

            this.testData.finish = performance.now();
        }

        /**
        * merge options & default objects
        * @param    {object} options
        * @param    {object} defaults
        **/

    }, {
        key: 'extendDefaults',
        value: function extendDefaults(options, defaults) {
            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
                for (var prop in options) {
                    if (defaults.hasOwnProperty(prop)) {
                        defaults[prop] = options[prop];
                    }
                }
            }
        }

        /**
        * de-bounce and add window resize
        **/

    }, {
        key: 'registerEvents',
        value: function registerEvents() {
            var _this6 = this;

            window.addEventListener('resize', this.debounce(function () {
                _this6.refresh();
            }, this.defaults.debounceRate));
        }

        /**
        * event de-bounce taken from Underscore.js
        **/

    }, {
        key: 'debounce',
        value: function debounce(func, wait, immediate) {
            var _this7 = this,
                _arguments = arguments;

            var timeout = void 0;
            return function () {
                var context = _this7,
                    args = _arguments;
                var later = function later() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }
    }]);

    return ResponsibleTable;
}();

exports.default = ResponsibleTable;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('classlist-polyfill');

var random = require('random-number');

var TableGenerator = function () {
    function TableGenerator() {
        _classCallCheck(this, TableGenerator);

        this.form = document.getElementById('tableGenerator');
        this.tableContainer = 'generatedContainer';
        this.UIContainer = 'generatedUIContainer';
        this.generateData = ['foo', 'bar', 'jurassic', 'park'];
        this.tableId = 'generatedTable';
        this.rows = 0;
        this.columns = 0;
        this.containerWidth = 0;

        this.registerEvents();
    }

    _createClass(TableGenerator, [{
        key: 'buildTable',
        value: function buildTable(mode) {
            if (document.getElementById(this.tableId)) {
                document.getElementById(this.tableId).remove();
                document.getElementById('container').remove();
            }

            var generatedContainer = document.createElement('div');
            var generatedTable = document.createElement('table');

            generatedTable.id = this.tableId;
            // just because it's easier for now
            generatedTable.className = this.tableId + ' responsibleTable';
            generatedContainer.id = 'container';
            generatedContainer.className = 'container';
            generatedContainer.style.width = this.containerWidth + '%';

            switch (mode) {
                case 'auto':
                    for (var i = this.rows; i--;) {
                        var row = document.createElement('tr');
                        var first = i === this.rows - 1;

                        for (var _i = this.columns; _i--;) {
                            var data = first ? document.createElement('th') : document.createElement('td');
                            data.innerHTML = this.generateData[random({ min: 0, max: this.generateData.length - 1, integer: true })];
                            row.appendChild(data);
                        }

                        generatedTable.appendChild(row);
                    }
                    break;
                case 'html':
                    generatedTable.innerHTML = document.getElementById('htmlEntry').value;
                    break;
            }

            generatedContainer.appendChild(generatedTable);

            return generatedContainer;
        }
    }, {
        key: 'handleFormSubmit',
        value: function handleFormSubmit() {
            this.form.addEventListener('submit', function (submit) {
                submit.preventDefault();

                // true = html // false = auto
                var formMode = document.getElementById('htmlRadio').checked;

                this.containerWidth = document.getElementById('containerWidth').value;

                if (formMode) {
                    console.log('html form!');
                    document.getElementById(this.tableContainer).appendChild(this.buildTable('html'));
                } else {
                    this.rows = document.getElementById('rowCount').value;
                    this.columns = document.getElementById('columnCount').value;
                    document.getElementById(this.tableContainer).appendChild(this.buildTable('auto'));
                }

                console.log(formMode);

                var event = new Event('tableGenerator::complete');
                window.dispatchEvent(event);
            }.bind(this));
        }
    }, {
        key: 'toggleForm',
        value: function toggleForm(mode) {
            switch (mode) {
                case 'html':
                    this.autoForm.classList.add('form-mode--active');
                    this.htmlForm.classList.remove('form-mode--active');

                    this.autoFormInputs.map(function (input) {
                        input.removeAttribute('disabled');
                    });
                    this.htmlFormInputs.map(function (input) {
                        input.setAttribute('disabled', 'disabled');
                    });
                    break;
                case 'auto':
                    this.htmlForm.classList.add('form-mode--active');
                    this.autoForm.classList.remove('form-mode--active');

                    this.htmlFormInputs.map(function (input) {
                        input.removeAttribute('disabled');
                    });
                    this.autoFormInputs.map(function (input) {
                        input.setAttribute('disabled', 'disabled');
                    });
                    break;
            }
        }
    }, {
        key: 'toggleMode',
        value: function toggleMode() {
            var modeRadioGroup = document.getElementById('formModeGroup');
            var inputQuery = 'input[type="text"], input[type="radio"], input[type="range"], input[type="number"], textarea';

            this.autoForm = document.querySelector('.form-mode--html');
            this.autoFormInputs = [].slice.call(this.autoForm.querySelectorAll(inputQuery));
            this.htmlForm = document.querySelector('.form-mode--auto');
            this.htmlFormInputs = [].slice.call(this.htmlForm.querySelectorAll(inputQuery));

            modeRadioGroup.addEventListener('click', function (click) {
                if (click.target.value) {
                    this.toggleForm(click.target.value);
                }
            }.bind(this));
        }
    }, {
        key: 'registerEvents',
        value: function registerEvents() {
            this.handleFormSubmit();
            this.toggleMode();
        }
    }]);

    return TableGenerator;
}();

exports.default = TableGenerator;

},{"classlist-polyfill":1,"random-number":2}]},{},[3])


//# sourceMappingURL=build.js.map
