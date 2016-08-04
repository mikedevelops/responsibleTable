(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO public method for returning table(s)
// TODO: handle tfoot
// TODO: handle tables with no th's
// TODO: handle duplicate ID's

var ResponsibleTables = function () {
    function ResponsibleTables(options) {
        _classCallCheck(this, ResponsibleTables);

        ResponsibleTables.VERSION = '1.0.0';

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


    _createClass(ResponsibleTables, [{
        key: 'init',
        value: function init() {
            var _this = this;

            var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            this.originalTables.forEach(function (table, index) {
                // create tableData object per instance
                _this.initiateTableData(table, index);
                // cache original state
                if (!_this.tableData[index].cache.original) {
                    _this.cacheTable(table, index);
                }
                // to build or not to build...
                if (_this.tableData[index].currentWidth > _this.tableData[index].container.width) {
                    _this.tableData[index].minWidth = _this.tableData[index].currentWidth;
                }

                if (_this.tableData[index].minWidth > _this.tableData[index].container.width) {
                    _this.build(table, index);
                }
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
                if (_this2.tableData[index].currentWidth > _this2.tableData[index].container.width) {
                    _this2.tableData[index].minWidth = _this2.tableData[index].currentWidth;
                }

                if (_this2.tableData[index].minWidth > _this2.tableData[index].container.width) {
                    _this2.build(table, index);
                } else if (_this2.tableData[index].minWidth !== 0 && _this2.tableData[index].minWidth < _this2.tableData[index].container.width && _this2.tableData[index].isResponsible) {
                    _this2.restoreTable(index);
                }
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

            this.testData.start = performance.now();

            if (!this.tableData[tableIndex].hasChanged) {
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

    return ResponsibleTables;
}();

module.exports = ResponsibleTables;

},{}]},{},[1])


//# sourceMappingURL=responsibleTables.bundle.js.map
