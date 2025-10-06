var selectedRow = null;
function onformsubmit(e) {
    event.preventDefault();
    var formData = readForData()

    if (selectedRow === null) {
        insertDataNewRecord(formData)
    }
    else {
        updateRecord(formData);
    }
    resetForm();
}
//Retrieve the data
function readForData() {
    var formData = {};
    formData["productCode"] = document.getElementById("productcode").value
    formData["product"] = document.getElementById("product").value
    formData["qty"] = document.getElementById("qty").value
    formData["perPrice"] = document.getElementById("perprice").value

    console.log('formData', formData);
    return formData;
}
//insert the data
function insertDataNewRecord(data) {
    console.log('data')
    console.log(data)
    var table = document.getElementById("storelist").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.length);
    var cell1 = newRow.insertCell(0);
    cell1.innerHTML = data.productCode;
    // cell1.innerHTML = '123456';
    var cell2 = newRow.insertCell(1);
    cell2.innerHTML = data.product;
    var cell3 = newRow.insertCell(2);
    cell3.innerHTML = data.qty
    var cell4 = newRow.insertCell(3);
    cell4.innerHTML = data.perPrice
    var cell5 = newRow.insertCell(4);
    cell5.innerHTML = `<button onclick='onEdit(this)'>Edit</button> <button onClick='onDelete(this)'>Delete</button>`

}
//Edit the data
function onEdit(td) {
    selectedRow = td.parentElement.parentElement;
    document.getElementById('productcode').value = selectedRow.cells[0].innerHTML;
    document.getElementById('product').value = selectedRow.cells[1].innerHTML;
    document.getElementById('qty').value = selectedRow.cells[2].innerHTML;
    document.getElementById('perprice').value = selectedRow.cells[3].innerHTML;

}
function updateRecord(formData) {
    selectedRow.cells[0].innerHTML = formData.productCode;
    selectedRow.cells[1].innerHTML = formData.product;
    selectedRow.cells[2].innerHTML = formData.qty;
    selectedRow.cells[3].innerHTML = formData.perPrice;
}
//delete the data
function onDelete(td) {
    if (confirm('Do you want to delete this record?')) {
        row = td.parentElement.parentElement;
        document.getElementById('storelist').deleteRow(row.rowIndex)
    }
    resetForm();
}
//reset the data
function resetForm() {
    document.getElementById('productcode').value = '';
    document.getElementById('product').value = '';
    document.getElementById('qty').value = '';
    document.getElementById('perprice').value = '';


}