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

        this.extendDefaults(options, this.defaults);

        // vars
        this.originalTables = [].slice.call(document.querySelectorAll(this.defaults.tableSelector));
        this.tableProps = {};
        this.containers = [].slice.call(document.querySelectorAll(this.defaults.containerSelector));
        this.columnHeadings = [];

        // cache
        this.cache = {
            original: [],
            responsible: []
        };

        // init
        if (!this.defaults.debug) {
            this.init();
        }
    }

    // initiate & build
    init () {
        this.originalTables.map(function (table, index) {
            // cache original state
            this.cacheTable(table, 'oringial');

            // not sure where this stuff should live, yet
            var rows = this.getRows(table);
            var columns = this.getColumns(table);
            var fragment = document.createDocumentFragment();

            // initialise tableProp object
            this.tableProps[index] = {rows: 0, columns: 0}
            this.tableProps[index].rows = rows.length;
            this.tableProps[index].columns = columns.length;
            this.tableProps[index].headings = this.getTableHeadings(table, index);

            // fragment.appendChild(this.buildFirstRow(table));

            // // loop through rows excluding the first and build out the data
            // for (var i = 1; i < rows.length; i++) {
            //     fragment.appendChild(this.buildTableData(table, i));
            // }

            // // remove original first row
            // rows[0].parentNode.removeChild(rows[0]);

            // // append fragment to container
            // table.querySelector('tbody').appendChild(fragment);
            // table.classList.add(this.defaults.activeClass);

            // cache new table
            this.cache.responsible.push(table.outerHTML);
        }.bind(this));
    }

    /**
    * Cache instance of table in current state as string
    * @param {HTMLElement} table
    **/
    cacheTable (table) {
        if (!table.classList.contains(this.defaults.activeClass)) {
            this.cache.original.push(table.outerHTML);
        }
        else {
            this.cache.responsible.push(table.outerHTML);
        }
    }

    /**
    * Get columns
    * @param    {HTMLElement} table
    * @return   {nodeList} columns
    **/
    getColumns (table) {
        // potentially better way of getting this, maybe get largets row instead of assuming the first
        var firstRow = this.getRows(table)[0];
        return firstRow.children;
    }

    /**
    * Get rows
    * @param    {HTMLElement} table
    * @return   {nodeList} rows
    **/
    getRows (table) {
        return table.getElementsByTagName('tr');
    }

    /**
    * Get column headings
    * @param    {HTMLElement} table
    * @return   {Array} column headings
    **/
    getTableHeadings (table, index) {
        var headings = [];
        console.log(this.tableProps[index].columns);
        for (var i = 0; i < this.tableProps[index].columns; i++) {
            console.log(table.getElementsByTagName('th')[i]);

            headings.push(table.getElementsByTagName('th')[i].innerHTML);
        }

        return headings;
    }

    // first row will be first th
    buildFirstRow (table, fragment) {
        // this might not be a th, fix that
        var firstCell = table.querySelector('th');
        var firstRow = document.createElement('tr');
        var thisCell = document.createElement('th');

        thisCell.innerHTML = firstCell.innerHTML;
        thisCell.setAttribute('colspan', 2);
        firstRow.appendChild(thisCell);

        return firstRow;
    }

    buildTableData (table, index) {
        var thisFragment = document.createDocumentFragment();
        var rows = table.querySelectorAll('tr');
        var firstRow = document.createElement('tr');
        // replace 1 for i when looping though rows
        var cells = rows[index].querySelectorAll('td');
        var firstCell = cells[0];

        // append first cell as data heading
        firstCell.setAttribute('colspan', 2);
        firstCell.classList.add(this.defaults.subHeadingClass);
        firstRow.appendChild(firstCell);
        thisFragment.appendChild(firstRow);

        // loop through each column exluding first and
        // populate data
        for (var i = 1; i < cells.length; i++) {
            var thisRow = document.createElement('tr');
            var thisHeading = document.createElement('td');

            thisHeading.innerHTML = this.columnHeadings[i];

            // TODO: this might not be a 'th', fix that
            thisHeading.classList.add(this.defaults.columnHeadingClass);
            thisRow.appendChild(thisHeading);
            cells[i].classList.add(this.defaults.tableDataClass);
            thisRow.appendChild(cells[i]);
            thisFragment.appendChild(thisRow);
        }

        return thisFragment;
    }

    restore () {
        this.originalTables.map(function (table, index) {
            table.outerHTML = this.cache.original[index];
        }.bind(this));
    }

    extendDefaults (options, defaults) {
        if (typeof options === 'object') {
            for (var prop in options) {
                if (defaults.hasOwnProperty(prop)) {
                    defaults[prop] = options[prop];
                }
            }
        }
    }
}
