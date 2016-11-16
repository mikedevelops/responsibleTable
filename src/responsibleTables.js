// TODO public method for returning table(s)
// TODO: handle tfoot
// TODO: handle tables with no th's
// TODO: handle duplicate ID's

require('classlist-polyfill');

const _defaultsDeep = require('lodash.defaultsDeep');
const _debounce = require('lodash.debounce');

const defaults = {
    activeClass: 'responsibleTable--active',
    columnHeadingClass: 'responsibleTable__column-heading',
    containerSelector: '.container',
    debounceRate: 200,
    subHeadingClass: 'responsibleTable__sub-heading',
    tableDataClass: 'responsibleTable__table-data',
    tableSelector: '.responsibleTable',
    debug: false
};


class ResponsibleTables {
    constructor (options) {
        ResponsibleTables.VERSION = '1.0.5';

        this.options = _defaultsDeep(options, defaults);
        this.originalTables = [].slice.call(document.querySelectorAll(this.options.tableSelector));
        this.tableData = [];
        this.regex = {
            tableCell: /(<t(?:d|h))(.*?)(>)/g,
            collspan: /colspan="([0-9]*)"/g,
            className: /class="(.*?)"/g,
            tableElement: /(<table)(.*?)(>)/g
        };

        this.registerEvents();
        this.init();
    }

    /**
     * initiate data, cache table, build / not build
     */
    init () {
        this.originalTables.map((table, index) => {
            // create tableData object per instance
            this.initiateTableData(table, index);
            // cache original state
            if (!this.tableData[index].cache.original) {
                this.cacheTable(table, index);
            }

            const { currentWidth, container } = this.tableData[index];

            // set table min width if we can
            if (currentWidth > container.width) {
                this.tableData[index].minWidth = currentWidth;
            }

            const { minWidth } = this.tableData[index];

            console.log('min-width: ', minWidth);
            console.log('container Width: ', container.width);

            // to build or not to build...
            if (minWidth > container.width) {
                this.build(table, index);
            }
        });
    }

    /**
     * refresh table state, update table & container width, build / not build
     */
    refresh () {
        this.originalTables.map((table, index) => {
            const { node } = this.tableData[index];

            // get current width of table
            this.tableData[index].currentWidth = node.getBoundingClientRect().width;

            console.log('table current width: ', this.tableData[index].currentWidth);

            // get current width of container
            if (this.tableData[index].container.node) {
                this.tableData[index].container.width = this.tableData[index].container.node.getBoundingClientRect().width;
            }

            const { currentWidth, minWidth, isResponsible } = this.tableData[index];

            // update min width
            if (currentWidth > this.tableData[index].container.width) {
                this.tableData[index].minWidth = currentWidth;
            }

            // to build or not to build...
            if (minWidth > this.tableData[index].container.width) {
                this.build(table, index);
            }
            else if (minWidth !== 0 && minWidth < this.tableData[index].container.width && isResponsible) {
                this.restoreTable(index);
            }
        });
    }

    /**
     * cache original & responsible version of table outerHTML
     * @param table {Element}
     * @param index {int}
     */
    cacheTable (table, index) {
        if (!this.tableData[index].isResponsible) {
            this.tableData[index].cache.original = table.outerHTML;
        }
        else {
            this.tableData[index].cache.responsible = table.outerHTML;
        }
    }

    /**
     * create table data object
     * @param table {Element}
     * @param index {int}
     */
    initiateTableData (table, index) {
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
        this.tableData[index].container.node = document.querySelector(this.options.containerSelector) || null;
        if (this.tableData[index].container.node) {
            this.tableData[index].container.width = this.tableData[index].container.node.getBoundingClientRect().width;
        }
    }

    /**
     * build responsible table
     * @param table {Element}
     * @param tableIndex {int}
     * @returns {boolean}
     */
    build (table, tableIndex) {
        if (this.options.debug) {
            this.testData.start = performance.now();
        }

        console.log('building...');

        if (!this.tableData[tableIndex].hasChanged) {
            const { rows } = this.tableData[tableIndex];

            let innerTableHTML = this.buildFirstRow(table);
            let tableHTML = this.regex.tableElement.exec(table.outerHTML)[0];

            // remove first row as we've already dealt with that
            rows.nodes.shift();

            // loop through rows excluding the first and build out the data
            rows.nodes.map((row, index) => {
                innerTableHTML += this.buildTableData(tableIndex, index);
            });

            tableHTML = this.addCellClass(tableHTML, this.options.activeClass);
            tableHTML += `${tableHTML}${innerTableHTML}</table>`;

            table.innerHTML = tableHTML;

            this.tableData[tableIndex].node = table;
            this.tableData[tableIndex].hasChanged = true;
            this.tableData[tableIndex].isResponsible = true;

            if (!this.tableData[tableIndex].cache.responsible) {
                this.cacheTable(table, tableIndex);
            }
        }
        // restore responsible table from cache if we have cached it
        else {
            this.tableData[tableIndex].node.outerHTML = this.tableData[tableIndex].cache.responsible;
            this.tableData[tableIndex].node = document.querySelector(this.options.tableSelector);
            this.tableData[tableIndex].isResponsible = true;
        }

        if (this.options.debug) {
            this.testData.finish = performance.now();
        }
    }

    /**
     * get table columns
     * @param table {Element}
     * @returns {array}
     */
    getColumns (table) {
        const firstRow = this.getRows(table)[0];
        return [].slice.call(firstRow.children);
    }

    /**
     * get table rows
     * @param table {Element}
     * @returns {array}
     */
     getRows (table) {
        return [].slice.call(table.getElementsByTagName('tr'));
    }

    /**
    * Get column headings
    * @param    {Element} table
    * @return   {Array} column headings
    **/
    getTableHeadings (table, index) {
        let headings = [];

        this.tableData[index].columns.nodes.map((column, columnIndex) => {
            headings.push(table.getElementsByTagName('th')[columnIndex].innerHTML);
        });

        return headings;
    }

    /**
     * build first row of responsible table
     * @param table {Element}
     * @param index {int}
     * @returns {Element}
     */
    buildFirstRow (table) {
        let firstCellHTML = table.querySelector('tr').children[0].outerHTML;

        firstCellHTML = this.replaceColspan(firstCellHTML, 2);

        // split element on opening tag
        const cellDataList = firstCellHTML.split(this.regex.tableCell);

        // return table row string
        return `<tr>${cellDataList.join('')}</tr>`;
    }

    /**
     * build table data
     * @param table {Element}
     * @param tableIndex {int}
     * @param rowIndex {int}
     */
    buildTableData (tableIndex, rowIndex) {
        const { columns, headings } = this.tableData[tableIndex];
        const cells = [].slice.call(this.tableData[tableIndex].rows.nodes[rowIndex].children);
        let firstCellHTML = cells[0].outerHTML;
        let tableDataHTML = '';

        firstCellHTML = this.replaceColspan(firstCellHTML, 2);
        firstCellHTML = this.addCellClass(firstCellHTML, this.options.subHeadingClass);
        firstCellHTML = `<tr>${firstCellHTML}</tr>`;
        tableDataHTML += firstCellHTML;

        // loop through each columns and build data, exclude first column as we've dealt with it above
        columns.nodes.map((column, index) => {
            if (index) {
                let row = `<tr><td>${headings.titles[index]}</td>`;
                let cell = cells[index].outerHTML;

                row = this.addCellClass(row, this.options.columnHeadingClass);
                cell = this.addCellClass(cell, this.options.tableDataClass);
                row += `${cell}</tr>`;
                tableDataHTML += row;
            }
        });

        return tableDataHTML;
    }

    /**
     * toggle table state and restore
     * @param index {int || null}
     */
    restoreTable (index = null) {
        if (this.options.debug) {
            this.testData.start = performance.now();
        }

        // if no index provided restore all tables
        if (index === null) {
            this.originalTables.map((table, index) => {
                if (this.tableData[index].isResponsible) {
                    table.outerHTML = this.tableData[index].cache.original;
                    this.tableData[index].isResponsible = false;
                    // TODO: Do we need this new node reference?
                    this.tableData[index].node = [].slice.call(document.querySelectorAll(this.options.tableSelector))[index];
                }
                else {
                    table.outerHTML = this.tableData[index].cache.responsible;
                    this.tableData[index].isResponsible = true;
                    // TODO: Do we need this new node reference?
                    this.tableData[index].node = [].slice.call(document.querySelectorAll(this.options.tableSelector))[index];
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
                this.tableData[index].node = document.querySelector(this.options.tableSelector);
            }
            else {
                this.tableData[index].isResponsible = true;
                this.tableData[index].node.outerHTML = this.tableData[index].cache.responsible;
                // TODO Do we need this node reference
                this.tableData[index].node = document.querySelector(this.options.tableSelector);
            }
        }

        if (this.options.debug) {
            this.testData.finish = performance.now();
        }
    }

    /**
     * Replace colspan attr value in a string
     * If collspan is not present, add it
     * @param string
     * @param colspan
     */
    replaceColspan (string, colspan) {
        if (this.regex.collspan.exec(string)) {
            string = string.replace(this.regex.collspan, `colspan="${colspan}"`);
        }
        else {
            let splitCell = string.split(this.regex.tableCell);

            splitCell[1] = `<td colspan="${colspan}"`;
            string = splitCell.join('');
        }

        return string;
    }

    /**
     * Add Cell Class
     * Add to current class or create class attr
     * @param string
     * @param className
     */
    addCellClass (string, className) {
        const classList = this.regex.className.exec(string);

        if (classList !== null) {
            const initialClass = classList[1];

            string = string.replace(this.regex.className, `class="${initialClass} ${className}"`);
        }
        else {
            let splitCell = string.split(this.regex.tableCell);

            splitCell[1] = `<td class="${className}"`;
            string = splitCell.join('');
        }

        return string;
    }

    /**
    * merge options & default objects
    * @param    {object} options
    * @param    {object} defaults
    **/
    extendDefaults (options, defaults) {
        if (typeof options === 'object') {
            for (let prop in options) {
                if (defaults.hasOwnProperty(prop)) {
                    defaults[prop] = options[prop];
                }
            }
        }
    }

    /**
    * de-bounce and add window resize
    **/
    registerEvents () {
        window.addEventListener('resize', _debounce(() => {
            this.refresh();
        }, this.options.debounceRate));
    }
}

module.exports = ResponsibleTables;
