// TODO
// public method for returning table(s)
class ResponsibleTable {
    constructor (options) {
        // defaults
        this.defaults = {
            activeClass: 'responsibleTable--active',
            columnHeadingClass: 'responsibleTable__column-heading',
            containerSelector: '.container',
            subHeadingClass: 'responsibleTable__sub-heading',
            tableDataClass: 'responsibleTable__table-data',
            tableSelector: '.responsibleTable',
            debug: false
        }
        // merge options and defaults
        this.extendDefaults(options, this.defaults);
        // vars
        this.originalTables = [].slice.call(document.querySelectorAll(this.defaults.tableSelector));
        this.tableData = [];
        this.columnHeadings = [];
        this.init();
    }

    /**
    * Loop through  original tables array and conditionally build responsible tables
    * @param {bool} force responsible table to build
    **/
    init (force = false) {
        this.originalTables.map((table, index) => {
            // create tableData object per instance
            this.initiateTableData(table, index);
            // cache original state
            if (!this.tableData[index].cache.original) {
                this.cacheTable(table, index);
            }
            // to build or not to build...
            if (!this.defaults.debug || force) {
                this.tableData[index].isResponsible = this.build(table, index, force);
            }
        });
    }

    /**
    * Cache instance of table in current state as string
    * @param {HTMLElement} table
    **/
    cacheTable (table, index, isResponsible) {
        // TODO: classlist fallback
        if (!table.classList.contains(this.defaults.activeClass)) {
            this.tableData[index].cache.original = table.outerHTML;
        }
        else {
            this.tableData[index].cache.responsible = table.outerHTML;
        }
    }

    /**
    * Initiate table data
    **/
    initiateTableData (table, index) {
        // Setup tableData
        this.tableData[index] = {
            isResponsible: false,
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
    * To build or not to build, that is the question...
    * @apram    {HTLMElement} table
    * @param    {int} table index
    * @return   {bool} has table been built
    **/
    build (table, tableIndex, force) {
        const tableWidth = table.getBoundingClientRect().width;
        // if table is wider, container is null or force is true -> build responsible table
        if (tableWidth > this.tableData[tableIndex].container.width || !this.tableData[tableIndex].container.node || force) {
            // create tablefragment
            this.tableData[tableIndex].fragment = document.createDocumentFragment();
            // append first row to fragment
            this.tableData[tableIndex].fragment.appendChild(this.buildFirstRow(table, tableIndex));
            // loop through rows excluding the first and build out the data
            this.tableData[tableIndex].rows.nodes.forEach((row, index) => {
                if (index) {
                    this.tableData[tableIndex].fragment.appendChild(this.buildTableData(table, tableIndex, index));
                }
            });
            // clone oriingal table node, excluding children
            const newTable = table.cloneNode(false);
            // append fragment to cloned node
            newTable.appendChild(this.tableData[tableIndex].fragment);
            // switch out innerHTML of old table for new
            table.innerHTML = newTable.innerHTML;
            // TODO: classList fallback
            table.classList.add(this.defaults.activeClass);
            // cache new table
            if (!this.tableData[tableIndex].cache.responsible) {
                this.cacheTable(table, tableIndex);
            }

            return true;
        }
        else {
            return false;
        }
    }

    /**
    * Get columns
    * @param    {HTMLElement} table
    * @return   {nodeList} columns
    **/
    getColumns (table) {
        // potentially better way of getting this, maybe get largets row instead of assuming the first
        const firstRow = this.getRows(table)[0];
        return [].slice.call(firstRow.children);
    }

    /**
    * Get rows
    * @param    {HTMLElement} table
    * @return   {nodeList} rows
    **/
    getRows (table) {
        return [].slice.call(table.getElementsByTagName('tr'));
    }

    /**
    * Get column headings
    * @param    {HTMLElement} table
    * @return   {Array} column headings
    **/
    getTableHeadings (table, index) {
        let headings = [];

        this.tableData[index].columns.nodes.forEach((column, index) => {
            headings.push(table.getElementsByTagName('th')[index].innerHTML);
        });

        return headings;
    }

    /**
    * Build first row
    * @param    {HTMLElement} table
    * @param    {int} table index
    * @return   {HTMLElement} table row
    **/
    buildFirstRow (table, index) {
        // this might not be a th, fix that
        const firstCell = table.querySelector('th');
        const firstRow = document.createElement('tr');
        const thisCell = document.createElement('th');

        thisCell.innerHTML = firstCell.innerHTML;
        thisCell.setAttribute('colspan', this.tableData[index].columns.length);
        firstRow.appendChild(thisCell);

        return firstRow;
    }

    /**
    * Build table data
    * @param    {HTMLElement} table
    * @param    {int} table index
    * @param    {int} row index
    * @return   {HTMLFragment} fragment containing table data
    **/
    buildTableData (table, tableIndex, rowIndex) {
        const fragment = document.createDocumentFragment();
        const firstRow = document.createElement('tr');
        const cells = this.tableData[tableIndex].rows.nodes[rowIndex].querySelectorAll('td');
        const firstCell = cells[0];
        // append first cell as data heading
        firstCell.setAttribute('colspan', this.tableData[tableIndex].columns.length);
        // TODO: fallback for ie9
        firstCell.classList.add(this.defaults.subHeadingClass);
        firstRow.appendChild(firstCell);
        fragment.appendChild(firstRow);
        // loop through each column exluding first and populate data
        this.tableData[tableIndex].columns.nodes.forEach((column, index) => {
            if (index) {
                const row = document.createElement('tr');
                const heading = document.createElement('td');

                heading.innerHTML = this.tableData[tableIndex].headings.titles[index];
                // TODO: this might not be a 'th', fix that
                // TODO: classlist fallback
                heading.classList.add(this.defaults.columnHeadingClass);
                row.appendChild(heading);
                // TODO: classlist fallback
                cells[index].classList.add(this.defaults.tableDataClass);
                row.appendChild(cells[index]);
                fragment.appendChild(row);
            }
        });

        return fragment;
    }

    /**
    * restore original table HTML
    * if no index argument is provided, restore all instances
    * @param {int} table index (optional)
    **/
    restoreTable (index = null) {
        // if no index provided restore all tables
        if (index === null) {
            this.originalTables.map((table, index) => {
                table.outerHTML = this.tableData[index].cache.original;
            });
        }
        // restore table index
        // TODO: perhaps need a method to return a table index,
        // how would a user know the table index?
        else {
            this.originalTables[index].outerHTML = this.tableData[index].cache.original;
        }
    }

    /**
    * merge options & default objects
    * @param    {obj} options
    * @param    {obj} defaults
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
}
