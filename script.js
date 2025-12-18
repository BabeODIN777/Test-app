function saveItem(e) {
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

    if (existingItem) {
        // បង្ហាញ modal សួរជម្រើស
        document.getElementById('duplicateCode').textContent = productCode;
        document.getElementById('duplicateModal').classList.add('active');

        // រក្សាទិន្នន័យបណ្តោះអាសន្នសម្រាប់ប្រើក្រោយ
        pendingItem = newItem;

        const file = document.getElementById('productImage').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => { pendingItem.image = reader.result; };
            reader.readAsDataURL(file);
        }

        return; // ឈប់នៅទីនេះ រង់ចាំជម្រើសពី modal
    }

    // បើគ្មានកូដស្ទួន → បន្ថែមធម្មតា
    finalizeAdd(newItem);
}

function addNewItem() {
    if (!pendingItem) return;
    finalizeAdd(pendingItem);
}

function finalizeAdd(item) {
    item.id = Date.now();

    const file = document.getElementById('productImage').files[0];
    if (file && !item.image) {
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

function completeAdd(item) {
    inventory.push(item);
    localStorage.setItem("autoPartsInventory", JSON.stringify(inventory));
    document.querySelector('#add-tab form').reset();
    pendingItem = null;
    closeDuplicateModal();
    switchTab("stock");
    renderInventory(); // បន្ថែមដើម្បី refresh ភ្លាមៗ
    updateStats();
}
