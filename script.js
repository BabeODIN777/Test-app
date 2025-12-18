let inventory = JSON.parse(localStorage.getItem("autoPartsInventory")) || [];
let currentSearch = [];
let pendingItem = null; // ទុក item ដែលកំពុងរង់ចាំបញ្ចូល (បន្ទាប់ពីបិទ modal)

function switchTab(name){
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
    document.getElementById(name+"-tab").classList.add('active');
    if(name==="stock") renderInventory();
    if(name==="stats") updateStats();
}

function saveItem(e){
    e.preventDefault();

    const productCode = document.getElementById('productCode').value.trim();

    // ប្រមូលទិន្នន័យ item មុនពេលពិនិត្យ duplicate
    const newItem = {
        company: document.getElementById('company').value,
        productCode: productCode,
        partName: document.getElementById('partName').value,
        carModel: document.getElementById('carModel').value,
        modelYear: document.getElementById('modelYear').value,
        buyPrice: +document.getElementById('buyPrice').value,
        sellPrice: +document.getElementById('sellPrice').value,
        image: null
    };

    // ពិនិត្យមើលថាមានកូដនេះរួចឬនៅ
    const existingItem = inventory.find(i => i.productCode === productCode);

    if(existingItem){
        // បង្ហាញ modal សួរជម្រើស
        document.getElementById('duplicateCode').textContent = productCode;
        document.getElementById('duplicateModal').classList.add('active');

        // រក្សាទិន្នន័យបណ្តោះអាសន្នសម្រាប់ប្រើក្រោយ
        pendingItem = newItem;

        const file = document.getElementById('productImage').files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = () => { pendingItem.image = reader.result; };
            reader.readAsDataURL(file);
        }

        return; // ឈប់នៅទីនេះ រង់ចាំជម្រើសពី modal
    }

    // បើគ្មានកូដស្ទួន → បន្ថែមធម្មតា
    finalizeAdd(newItem);
}

function addNewItem(){
    if(!pendingItem) return;
    finalizeAdd(pendingItem);
}

function finalizeAdd(item){
    item.id = Date.now();

    const file = document.getElementById('productImage').files[0];
    if(file && !item.image){
        const reader = new FileReader();
        reader.onload = () => {
            item.image = reader.result;
            completeAdd(item);
        };
        reader.readAsDataURL(file);
        return; // រង់ចាំ reader រួចសិន
    } else {
        completeAdd(item);
    }
}

function completeAdd(item){
    inventory.push(item);
    localStorage.setItem("autoPartsInventory", JSON.stringify(inventory));
    document.querySelector('#add-tab form').reset();
    pendingItem = null;
    closeDuplicateModal();
    switchTab("stock");
    renderInventory(); // Refresh the list immediately
    updateStats();
}

function addAsNew(){
    addNewItem();
}

function editExisting(){
    const productCode = document.getElementById('productCode').value.trim();
    const existingItem = inventory.find(i => i.productCode === productCode);

    if(existingItem){
        document.getElementById('company').value = existingItem.company;
        document.getElementById('productCode').value = existingItem.productCode;
        document.getElementById('partName').value = existingItem.partName;
        document.getElementById('carModel').value = existingItem.carModel;
        document.getElementById('modelYear').value = existingItem.modelYear;
        document.getElementById('buyPrice').value = existingItem.buyPrice;
        document.getElementById('sellPrice').value = existingItem.sellPrice;

        alert("ទិន្នន័យចាស់ត្រូវបានបំពេញមកហើយ។ សូមកែប្រែ រួចចុច 'រក្សាទុក' ម្តងទៀត។");
    }
    closeDuplicateModal();
}

function closeDuplicateModal(){
    document.getElementById('duplicateModal').classList.remove('active');
    pendingItem = null;
}

function renderInventory(){
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
    document.getElementById('inventoryList').innerHTML = list.map(i => {
        let p = i.sellPrice - i.buyPrice;
        return `
        <div class="inventory-item">
            <div class="item-top">
                <div class="item-left">
                    <div class="item-name">${i.partName}</div>
                    <div class="item-code">${i.productCode}</div>
                    <div class="detail-row">
                        <span class="detail-chip">${i.carModel}</span>
                        <span class="detail-chip year">${i.modelYear}</span>
                    </div>
                    <div class="detail-company">${i.company}</div>
                </div>
                <div class="item-right">
                    ${i.image ? `<img src="${i.image}" class="item-image">` : ""}
                </div>
            </div>
            <div class="price-section">
                <div><div class="price-value buy">$${i.buyPrice}</div>ទិញ</div>
                <div><div class="price-value sell">$${i.sellPrice}</div>លក់</div>
                <div><div class="price-value profit">$${p}</div>ចំណេញ</div>
            </div>
            <div class="actions">
                <button class="edit" onclick="openEdit(${i.id})">✏️</button>
                <button class="delete" onclick="deleteItem(${i.id})">🗑️</button>
            </div>
        </div>`;
    }).join("");
}

function searchItems(){
    const terms = document.getElementById('searchInput').value.toLowerCase().split("+").map(s=>s.trim()).filter(Boolean);
    currentSearch = terms;
    renderInventory();
}

function openEdit(id){
    const item = inventory.find(i => i.id === id);
    if(!item) return;
    document.getElementById('editId').value = item.id;
    document.getElementById('editCompany').value = item.company;
    document.getElementById('editProductCode').value = item.productCode;
    document.getElementById('editPartName').value = item.partName;
    document.getElementById('editCarModel').value = item.carModel;
    document.getElementById('editModelYear').value = item.modelYear;
    document.getElementById('editBuyPrice').value = item.buyPrice;
    document.getElementById('editSellPrice').value = item.sellPrice;
    document.getElementById('editModal').classList.add('active');
}

function updateItem(e){
    e.preventDefault();
    const id = parseInt(document.getElementById('editId').value);
    const index = inventory.findIndex(i => i.id === id);
    if(index === -1) return;
    inventory[index] = {
        ...inventory[index],
        company: document.getElementById('editCompany').value,
        productCode: document.getElementById('editProductCode').value,
        partName: document.getElementById('editPartName').value,
        carModel: document.getElementById('editCarModel').value,
        modelYear: document.getElementById('editModelYear').value,
        buyPrice: +document.getElementById('editBuyPrice').value,
        sellPrice: +document.getElementById('editSellPrice').value
    };
    localStorage.setItem("autoPartsInventory", JSON.stringify(inventory));
    closeModal();
    renderInventory();
    updateStats();
}

function closeModal(){
    document.getElementById('editModal').classList.remove('active');
}

function deleteItem(id){
    if(confirm("លុបទំនិញនេះមែនទេ?")){
        inventory = inventory.filter(i => i.id !== id);
        localStorage.setItem("autoPartsInventory", JSON.stringify(inventory));
        renderInventory();
        updateStats();
    }
}

function updateStats(){
    const totalProfit = inventory.reduce((s,i) => s + (i.sellPrice - i.buyPrice), 0);
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('totalProfit').textContent = "$" + totalProfit.toFixed(2);
}

// Init
renderInventory();
updateStats();

// Dark Mode Toggle
function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('light-mode', !isDark); // Dark by default, toggle to light
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

// Init theme from localStorage
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'enabled') {
    document.getElementById('darkModeToggle').checked = true;
    document.body.classList.remove('light-mode');
} else {
    document.getElementById('darkModeToggle').checked = false;
    document.body.classList.add('light-mode');
}
