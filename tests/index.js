var expect = chai.expect;
var actual, expected;

describe('Setup', function () {
    it( 'Original instance of table outerHTML is cached', function () {
        var table = document.getElementById('table1');
        var plugin = new ResponsibleTable({tableSelector: '#table1', debug: true});

        plugin.cacheTable(table, 0);

        var actual = document.getElementById('table1').outerHTML;
        var expected = plugin.tableData[0].cache.original;

        expect(actual).to.be.equal(expected);
    });

    it ('Responsible instance of table outerHTML is cached', function () {
        var table = document.getElementById('table2');
        var plugin = new ResponsibleTable({tableSelector: '#table2', debug: true});

        plugin.init(true);

        var actual = document.getElementById('table2').outerHTML;
        var expected = plugin.tableData[0].cache.responsible;

        expect(actual).to.be.equal(expected);
    });
});

describe('Methods', function () {
    it ('getColumns() returns correct number of columns', function () {
        var table = document.getElementById('table3');
        var plugin = new ResponsibleTable({tableSelector: '#table3', debug: true});
        var actual = plugin.getColumns(table).length;
        var expected = table.querySelector('tr').children.length;

        expect(actual).to.be.equal(expected);
    });

    it ('getRows() returns correct number of rows', function () {
        var table = document.getElementById('table4');
        var plugin = new ResponsibleTable({tableSelector: '#table4', debug: true});
        var actual = plugin.getRows(table).length;
        var expected = table.querySelectorAll('tr').length;

        expect(actual).to.be.equal(expected);
    });

    it ('getTableHeadings() returns correct list of headings', function () {
        var table = document.getElementById('table5');
        var plugin = new ResponsibleTable({tableSelector: '#table5', debug: true});
        var expected = [];

        plugin.initiateTableData(table, 0);

        var actual = plugin.getTableHeadings(table, 0);

        for (var i = 0; i < plugin.getColumns(table).length; i++) {
            expected.push(table.querySelectorAll('th')[i].innerHTML);
        }

        expect(actual).to.deep.equal(expected);
    });

    it ('initiateTableData() creates tableData object with correct schema', function () {
        var table = document.getElementById('table6');
        var plugin = new ResponsibleTable({tableSelector: '#table6', debug: true});
        var expected = {
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

        // Grab the first & second level keys from objects
        // provided in object array, return the result of strict comparison
        function compareKeys(objectsArray) {
            var results = [[], []];

            objectsArray.map(function (obj, index) {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        results[index].push(key);
                    }

                    for (secondKey in obj[key]) {
                        if (obj[key].hasOwnProperty(secondKey)) {
                            results[index].push(secondKey);
                        }
                    }
                }
            });

            return JSON.stringify(results[0]) === JSON.stringify(results[1]);
        }

        plugin.initiateTableData(table, 0);

        var actual = plugin.tableData[0];

        expect(compareKeys([expected, actual])).to.be.true;
    });

    it ('restore() returns table to it\'s original HTML', function () {
        var table = document.getElementById('table7');
        var expected = table.outerHTML;
        var plugin = new ResponsibleTable({tableSelector: '#table7', debug: false});

        plugin.restoreTable();

        var actual = document.getElementById('table7').outerHTML;

        expect(actual).to.equal(expected);
    });

    it ('restore(0) returns first table to it\'s original HTML', function () {
        var table = document.getElementById('table9');
        var table2 = document.getElementById('table10');
        var expected = table.outerHTML;
        var expected2 = table2.outerHTML;
        var plugin = new ResponsibleTable({tableSelector: '.table10', debug: false});

        plugin.restoreTable(0);

        var actual = document.getElementById('table9').outerHTML;
        var actual2 = document.getElementById('table10').outerHTML;

        expect(actual).to.equal(expected);
        expect(actual2).to.not.equal(expected2);
    });

    it ('extendDefaults() combines options and defaults', function () {
        var table = document.getElementById('table11');
        var plugin = new ResponsibleTable({
            activeClass: 'fooBar'
        });

        var expected = {
            activeClass: 'fooBar',
            columnHeadingClass: 'responsibleTable__column-heading',
            containerSelector: '.container',
            subHeadingClass: 'responsibleTable__sub-heading',
            tableDataClass: 'responsibleTable__table-data',
            tableSelector: '.responsibleTable',
            debug: false
        }

        var actual = plugin.defaults;

        expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
    });
});

describe('Functionality', function () {
    it ('Correct number of additional rows have been created', function () {
        var table = document.getElementById('table8');
        var plugin = new ResponsibleTable({tableSelector: '#table8', debug: true});

        function rowCountAlgorhythm (table) {
            var rows = table.querySelectorAll('tr');
            var columns = rows[0].querySelectorAll('th');
            // length of colums * number of rows (minus first row which is table header) + amount of table headers
            return columns.length * (rows.length - 1) + 1;
        }

        var expected = rowCountAlgorhythm(table);

        plugin.init(true);

        var actual = document.getElementById('table8').querySelectorAll('tr').length;

        expect(actual).to.equal(expected);
    });

    it ('ResponsibleTable initiates if table is wider than container', function () {
        var table = document.getElementById('table12');
        var plugin = new ResponsibleTable({tableSelector: '#table12', debug: false, container: '.container'});
        var actual = plugin.tableData[0].cache.original;
        var expected = plugin.tableData[0].cache.responsible;

        expect(actual).to.not.equal(expected);
    });

    it ('ResponsibleTable does not initiate if container is wider than table', function () {
        var table = document.getElementById('table13');
        var plugin = new ResponsibleTable({tableSelector: '#table13', debug: false, containerSelector: '#t13Container'});
        var actual = plugin.tableData[0].cache.original;
        var expected = table.outerHTML;

        expect(actual).to.equal(expected);
    });
});
