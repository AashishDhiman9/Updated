document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recordForm');
    const customColumnForm = document.getElementById('customColumnForm');
    const recordsTableBody = document.getElementById('recordsTableBody');
    const customColumnsHead = document.getElementById('customColumnsHead');
    const totalSales = document.getElementById('totalSales');
    const totalExpenditure = document.getElementById('totalExpenditure');
    const totalProfit = document.getElementById('totalProfit');
    const downloadPDFButton = document.getElementById('downloadPDF');

    let records = JSON.parse(localStorage.getItem('records')) || [];
    let customColumns = JSON.parse(localStorage.getItem('customColumns')) || [];

    function updateLocalStorage() {
        localStorage.setItem('records', JSON.stringify(records));
        localStorage.setItem('customColumns', JSON.stringify(customColumns));
    }

    function updateTable() {
        recordsTableBody.innerHTML = '';
        records.forEach((record, index) => {
            const row = document.createElement('tr');
            let customColumnsData = '';
            customColumns.forEach(col => {
                customColumnsData += `<td>${record[col] || ''}</td>`;
            });
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.incomeSource}</td>
                <td>${record.sales}</td>
                <td>${record.expenditureDetails}</td>
                <td>${record.expenditure}</td>
                <td>${record.profit}</td>
                ${customColumnsData}
                <td><button class="deleteButton" data-index="${index}">Delete</button></td>
            `;
            recordsTableBody.appendChild(row);
        });
    }

    function updateTotals() {
        const salesSum = records.reduce((sum, record) => sum + record.sales, 0);
        const expenditureSum = records.reduce((sum, record) => sum + record.expenditure, 0);
        const profitSum = salesSum - expenditureSum;

        totalSales.textContent = salesSum;
        totalExpenditure.textContent = expenditureSum;
        totalProfit.textContent = profitSum;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const date = document.getElementById('date').value;
        const incomeSource = document.getElementById('incomeSource').value;
        const sales = parseFloat(document.getElementById('sales').value);
        const expenditureDetails = document.getElementById('expenditureDetails').value || 'N/A';
        const expenditure = parseFloat(document.getElementById('expenditure').value) || 0;
        const profit = sales - expenditure;

        const record = { date, incomeSource, sales, expenditureDetails, expenditure, profit };

        customColumns.forEach(col => {
            record[col] = '';
        });

        records.push(record);

        updateTable();
        updateTotals();
        updateLocalStorage();
        form.reset();
    });

    customColumnForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const customColumnName = document.getElementById('customColumnName').value;
        customColumns.push(customColumnName);

        customColumnsHead.innerHTML += `<th>${customColumnName}</th>`;

        records.forEach(record => {
            record[customColumnName] = '';
        });

        updateTable();
        updateLocalStorage();
        customColumnForm.reset();
    });

    recordsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('deleteButton')) {
            const index = event.target.getAttribute('data-index');
            records.splice(index, 1);
            updateTable();
            updateTotals();
            updateLocalStorage();
        }
    });

    downloadPDFButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text('Nitin General Store - Report', 10, 10);

        const headers = ["Date", "Income Source", "Sales", "Expenditure Details", "Expenditure", "Profit", ...customColumns];
        const data = records.map(record => [
            record.date, record.incomeSource, record.sales, record.expenditureDetails,
            record.expenditure, record.profit, ...customColumns.map(col => record[col])
        ]);

        doc.autoTable({
            head: [headers],
            body: data
        });

        doc.save('khata_record.pdf');
    });

    function initializeTableHeader() {
        customColumns.forEach(col => {
            customColumnsHead.innerHTML += `<th>${col}</th>`;
        });
    }

    initializeTableHeader();
    updateTable();
    updateTotals();
});
