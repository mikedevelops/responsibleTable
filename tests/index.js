expect = chai.expect;

describe('Setup', function () {
    var actual, expected;

    it('Original instance of table outerHTML is cached', function () {
        var table = document.getElementById('table1');
        var plugin = new ResponsibleTable({tableSelector: '#table1', debug: true});

        plugin.cacheTable(table);
        actual = table.outerHTML;
        expected = plugin.cache.original[0];

        expect(actual).to.be.equal(expected);
    });

    it('Responsible instance of table outerHTML is cached', function () {
        var table = document.getElementById('table2');
        var plugin = new ResponsibleTable({tableSelector: '#table2', debug: true});

        plugin.init();
        actual = table.outerHTML;
        expected = plugin.cache.responsible[0];

        expect(actual).to.be.equal(expected);
    });
});

describe('Methods', function () {
    var actual, expected;

    it ('getColumns() returns correct number of columns', function () {
        var table = document.getElementById('table3');
        var plugin = new ResponsibleTable({tableSelector: '#table3', debug: true});
        var actual = plugin.getColumns(table).length;
        var expected = table.querySelector('tr').children.length;

        expect(actual).to.be.equal(expected);
    });

    it('getRows() returns correct number of rows', function () {
        var table = document.getElementById('table4');
        var plugin = new ResponsibleTable({tableSelector: '#table4', debug: true});
        var actual = plugin.getRows(table).length;
        var expected = table.querySelectorAll('tr').length;

        expect(actual).to.be.equal(expected);
    });

    it('getTableHeadings() returns correct list of headings', function () {
        var table = document.getElementById('table5');
        var plugin = new ResponsibleTable({tableSelector: '#table5', debug: true});
        var expected = [];

        plugin.init();

        var actual = plugin.getTableHeadings(table, 0);

        console.log(actual);

        for (var i = 0; i < plugin.getColumns(table).length; i++) {
            expected.push(table.querySelectorAll('th')[i].innerHTML);
        }

        expect(actual).to.deep.equal(expected);
    });
});
