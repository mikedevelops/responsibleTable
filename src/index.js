import ResponsibleTable from './responsibleTable';
import TableGenerator from './tableGenerator';

// const t0 = performance.now()initiatet responsibleTable = new ResponsibleTable();
// const t1 = performance.now();

const tableGenerator = new TableGenerator();
const consoleElement = document.getElementById('console');
const generatedContainer = document.getElementById('generatedContainer');
const mainContent = document.getElementById('main');

var start;
var finish;
var currentTable;

function consoleLog (log) {
    const output = document.createElement('p');
    const logs = consoleElement.querySelectorAll('.console__output');

    if (logs.length > 5) {
        logs[0].remove();
    }

    output.className = 'console__output';
    output.innerHTML = log;
    consoleElement.appendChild(output);
}

window.addEventListener('tableGenerator::complete', () => {
    let responsibleToggle;
    let thisTableLabel = `Responsible table [${tableGenerator.columns} x ${tableGenerator.rows}, ${tableGenerator.rows * tableGenerator.columns} cells]`;

    if (!document.getElementById('responsibleToggle')) {
        responsibleToggle = document.createElement('button');
        responsibleToggle.id = 'responsibleToggle';
        responsibleToggle.innerHTML = 'Toggle Responsible Table';
        mainContent.insertBefore(responsibleToggle, generatedContainer);
        responsibleToggle.addEventListener('click', function () {
            thisTableLabel = `Responsible table [${tableGenerator.columns} x ${tableGenerator.rows}, ${tableGenerator.rows * tableGenerator.columns} cells]`;

            if (!currentTable.tableData[0].isResponsible) {
                currentTable.build(currentTable.originalTables[0], 0);
                consoleLog(`${thisTableLabel} took <strong>${currentTable.testData.result()} ms</strong> to build`);
            }
            else {
                currentTable.restoreTable(0);
                consoleLog(`${thisTableLabel} took <strong>${currentTable.testData.result()} ms</strong> to restore`);
            }
        });
    }
    else {
        responsibleToggle = document.getElementById('responsibleToggle');
    }

    start = performance.now();

    currentTable = new ResponsibleTable({
        tableSelector: `.${tableGenerator.tableId}`
    });

    finish = performance.now();

    consoleLog(`${thisTableLabel} took <strong>${Math.round(finish - start)} ms</strong> to initiate`);
});

window.addEventListener('tableGenerator::refresh', () => {
    currentTable.refresh();
});

