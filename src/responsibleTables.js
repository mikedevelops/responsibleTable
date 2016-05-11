class ResponsibleTable {
    constructor (options) {
        // defaults
        this.defaults = {
            activeClass: 'responsibleTable--active',
            columnHeadingClass: 'responsibleTable__column-heading',
            containerSelector: '.container',
            subHeadingClass: 'responsibleTable__sub-heading',
            tableDataClass: 'responsibleTable__table-data',
            tableSelector: '.responsibleTable'
        }

        this.extendDefaults(options, this.defaults);

        // vars
        this.originalTables = [].slice.call(document.querySelectorAll(this.defaults.tableSelector));
        this.containers = [].slice.call(document.querySelectorAll(this.defaults.containerSelector));
        this.columnHeadings = [];

        // cache
        this.cache = {
            original: [],
            responsible: []
        };

        // init
        this.init();
    }

    // initiate & build
    init () {
        this.originalTables.map(function (table, index) {
            this.cache.original.push(table.outerHTML);

            var fragment = document.createDocumentFragment();
            // -1 to account for th
            var rows = table.querySelectorAll('tr');
            var columns = rows[0].children;

            // build referecne to column headings
            for (var i = 0; i < columns.length; i++) {
                this.columnHeadings.push(columns[i].innerHTML);
            }

            fragment.appendChild(this.buildFirstRow(table));

            // loop through rows excluding the first and build out the data
            for (var i = 1; i < rows.length; i++) {
                fragment.appendChild(this.buildTableData(table, i));
            }

            // remove original first row
            rows[0].parentNode.removeChild(rows[0]);

            // append fragment to container
            table.querySelector('tbody').appendChild(fragment);
            table.classList.add(this.defaults.activeClass);

            // cache new table
            this.cache.responsible.push(table.outerHTML);
        }.bind(this));
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
