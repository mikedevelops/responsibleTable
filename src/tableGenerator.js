require('classlist-polyfill');

const random = require('random-number');

export default class TableGenerator {
    constructor () {
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

     buildTable (mode) {
        if (document.getElementById(this.tableId)) {
            document.getElementById(this.tableId).remove();
            document.getElementById('container').remove();
        }

        const generatedContainer = document.createElement('div');
        const generatedTable = document.createElement('table');

        generatedTable.id = this.tableId;
        // just because it's easier for now
        generatedTable.className = `${this.tableId} responsibleTable`;
        generatedContainer.id = 'container';
        generatedContainer.className = 'container';
        generatedContainer.style.width = `${this.containerWidth}%`;

        switch (mode) {
            case 'auto':
                for (let i = this.rows; i--;) {
                    let row = document.createElement('tr');
                    let first = i === this.rows -1;

                    for (let i = this.columns; i--;) {
                        let data = (first) ? document.createElement('th') : document.createElement('td');
                        data.innerHTML = this.generateData[random({min: 0, max: this.generateData.length - 1, integer: true})];
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

    handleFormSubmit () {
        this.form.addEventListener('submit', function (submit) {
            submit.preventDefault();

            // true = html // false = auto
            const formMode = document.getElementById('htmlRadio').checked;

            this.containerWidth = document.getElementById('containerWidth').value;

            if (formMode) {
                console.log('html form!');
                document.getElementById(this.tableContainer).appendChild(this.buildTable('html'));
            }
            else {
                this.rows = document.getElementById('rowCount').value;
                this.columns = document.getElementById('columnCount').value;
                document.getElementById(this.tableContainer).appendChild(this.buildTable('auto'));
            }

            console.log(formMode);


            const event = new Event('tableGenerator::complete');
            window.dispatchEvent(event);
        }.bind(this));
    }

    toggleForm (mode) {
        switch (mode) {
            case 'html':
                this.autoForm.classList.add('form-mode--active');
                this.htmlForm.classList.remove('form-mode--active');

                this.autoFormInputs.map(input => {
                    input.removeAttribute('disabled');
                });
                this.htmlFormInputs.map(input => {
                    input.setAttribute('disabled', 'disabled');
                });
                break;
            case 'auto':
                this.htmlForm.classList.add('form-mode--active');
                this.autoForm.classList.remove('form-mode--active');

                this.htmlFormInputs.map(input => {
                    input.removeAttribute('disabled');
                });
                this.autoFormInputs.map(input => {
                    input.setAttribute('disabled', 'disabled');
                });
                break;
        }
    }

    toggleMode () {
        const modeRadioGroup = document.getElementById('formModeGroup');
        const inputQuery = 'input[type="text"], input[type="radio"], input[type="range"], input[type="number"], textarea';

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

    registerEvents () {
        this.handleFormSubmit();
        this.toggleMode();
    }
}
