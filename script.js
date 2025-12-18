let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let nextId = inventory.length ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
let duplicateItem = null;
let addAsNewFlag = false;
let currentSearch = [];

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`button[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    if (tab === 'stock') renderInventory();
    if (tab === 'stats') updateStats();
}

function saveItem(event) {
    event.preventDefault();
    const item = {
        id: nextId++,
        company: document.getElementById('company').value,
        productCode: document.getElementById('productCode').value,
        partName: document.getElementById('partName').value,
        carModel: document.getElementById('carModel').value,
        modelYear: document.getElementById('modelYear').value,
        buyPrice: parseFloat(document.getElementById('buyPrice').value),
        sellPrice: parseFloat(document.getElementById('sellPrice').value),
    };
    const file = document.getElementById('productImage').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            item.image = e.target.result;
            proceedToSave(item);
        };
        reader.readAsDataURL(file);
    } else {
        proceedToSave(item);
    }
}

function proceedToSave(item) {
    const existing = inventory.find(i => i.productCode === item.productCode);
    if (existing && !addAsNewFlag) {
        duplicateItem = item;
        document.getElementById('duplicateCode').textContent = item.productCode;
        document.getElementById('duplicateModal').style.display = 'flex';
    } else {
        if (addAsNewFlag) addAsNewFlag = false;
        inventory.push(item);
        saveToStorage();
        renderInventory();
        updateStats();
        document.querySelector('form').reset();
    }
}

function saveToStorage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory() {
    let list = inventory.filter(i =>
        currentSearch.length === 0 ||
        currentSearch.some(term =>
            i.partName.toLowerCase().includes(term) ||
            i.carModel.toLowerCase().includes(term) ||
            i.modelYear.toLowerCase().includes(term) ||
            i.company.toLowerCase().includes(term) ||
            i.productCode.toLowerCase().includes(term)
        )
    );
    document.getElementById('stockTableBody').innerHTML = list.map((i, idx) => {
        return `
            <tr>
                <td>${idx + 1}</td>
                <td>${i.partName}</td>
                <td>${i.carModel}</td>
                <td>${i.company}</td>
                <td>${i.modelYear}</td>
                <td>$${i.buyPrice.toFixed(2)}</td>
                <td>$${i.sellPrice.toFixed(2)}</td>
                <td>$${i.sellPrice.toFixed(2)}</td>
                <td>
                    <button class="edit" onclick="openEdit(${i.id})">កែ</button>
                    <button class="delete" onclick="deleteItem(${i.id})">លុប</button>
                </td>
            </tr>
        `;
    }).join("");
}

function searchItems() {
    const input = document.getElementById('searchInput').value.toLowerCase().trim();
    currentSearch = input ? input.split(/\s+/) : [];
    renderInventory();
}

function updateStats() {
    const totalProfit = inventory.reduce((s, i) => s + (i.sellPrice - i.buyPrice), 0);
    const totalValue = inventory.reduce((s, i) => s + i.sellPrice, 0);
    const lowStock = 0;
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('totalValue').textContent = totalValue.toFixed(2);
    document.getElementById('totalProfit').textContent = totalProfit.toFixed(2);
    document.getElementById('lowStock').textContent = lowStock;
}

function exportToCSV() {
    const csv = ['ល.រ,ឈ្មោះគ្រឿង,ប្រភេទ,ម៉ូដែលឡាន,ឆ្នាំម៉ូដែល,តម្លៃទិញ,តម្លៃលក់,តម្លៃសរុប'];
    inventory.forEach((i, idx) => {
        csv.push(`${idx + 1},"${i.partName}","${i.carModel}","${i.company}","${i.modelYear}",${i.buyPrice},${i.sellPrice},${i.sellPrice}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'krom_krong_lan.csv';
    a.click();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode', document.getElementById('darkModeToggle').checked);
}

function openEdit(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        document.getElementById('editId').value = id;
        document.getElementById('editCompany').value = item.company;
        document.getElementById('editProductCode').value = item.productCode;
        document.getElementById('editPartName').value = item.partName;
        document.getElementById('editCarModel').value = item.carModel;
        document.getElementById('editModelYear').value = item.modelYear;
        document.getElementById('editBuyPrice').value = item.buyPrice;
        document.getElementById('editSellPrice').value = item.sellPrice;
        document.getElementById('editModal').style.display = 'flex';
    }
}

function updateItem(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('editId').value);
    const item = inventory.find(i => i.id === id);
    if (item) {
        item.company = document.getElementById('editCompany').value;
        item.productCode = document.getElementById('editProductCode').value;
        item.partName = document.getElementById('editPartName').value;
        item.carModel = document.getElementById('editCarModel').value;
        item.modelYear = document.getElementById('editModelYear').value;
        item.buyPrice = parseFloat(document.getElementById('editBuyPrice').value);
        item.sellPrice = parseFloat(document.getElementById('editSellPrice').value);
        saveToStorage();
        renderInventory();
        updateStats();
        closeModal();
    }
}

function deleteItem(id) {
    if (confirm('តើអ្នកប្រាកដជាចង់លុបគ្រឿងនេះទេ?')) {
        inventory = inventory.filter(i => i.id !== id);
        saveToStorage();
        renderInventory();
        updateStats();
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function closeDuplicateModal() {
    document.getElementById('duplicateModal').style.display = 'none';
    duplicateItem = null;
}

function addAsNew() {
    addAsNewFlag = true;
    proceedToSave(duplicateItem);
    closeDuplicateModal();
}

function editExisting() {
    closeDuplicateModal();
    const existing = inventory.find(i => i.productCode === duplicateItem.productCode);
    openEdit(existing.id);
}

document.addEventListener('DOMContentLoaded', () => {
    switchTab('add');
    updateStats();
});
```    const