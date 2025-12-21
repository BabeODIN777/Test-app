const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        const inventory = ref(JSON.parse(localStorage.getItem('inventory')) || []);
        const activeTab = ref('add');
        const searchQuery = ref('');
        const isLightMode = ref(localStorage.getItem('theme') === 'light');
        const showDuplicateModal = ref(false);
        const showEditModal = ref(false);
        const duplicateItem = ref(null);
        const nextId = ref(inventory.value.length ? Math.max(...inventory.value.map(i => i.id)) + 1 : 1);
        const invoiceCounter = ref(JSON.parse(localStorage.getItem('invoiceCounter')) || 1);
        const invoiceNumberPrefix = 'INV-';
        
        const form = ref({
            company: '',
            productCode: '',
            partName: '',
            carModel: '',
            modelYear: '',
            quantity: 1,
            buyPrice: 0,
            sellPrice: 0
        });

        const editForm = ref({
            id: null,
            company: '',
            productCode: '',
            partName: '',
            carModel: '',
            modelYear: '',
            quantity: 1,
            buyPrice: 0,
            sellPrice: 0
        });

        const showInstallBtn = ref(false);
        let deferredPrompt = null;
        const showQRModal = ref(false);
        const qrItem = ref(null);
        const bulkTab = ref('import');
        const importResults = ref(null);
        const qrCodeInstance = ref(null);
        const currentQRData = ref(null);

        // ==================== SEARCH FILTERS STATE ====================
        const selectedCompany = ref('');
        const selectedCarModel = ref('');
        const selectedYear = ref('');

        // ==================== INVOICE SYSTEM STATE ====================
        const invoice = ref({
            id: Date.now(),
            invoiceNumber: '',
            customerName: '',
            customerPhone: '',
            date: new Date().toISOString().split('T')[0],
            items: [],
            subtotal: 0,
            grandTotal: 0
        });

        const invoiceHistory = ref(JSON.parse(localStorage.getItem('invoiceHistory')) || []);
        const itemSearch = ref('');
        const searchResults = ref([]);
        const selectedSearchItem = ref(null);
        const selectedInventoryItem = ref({ quantity: 1 });
        const manualItem = ref({ name: '', price: 0, quantity: 1 });

        // ==================== INVOICE FUNCTIONS - MOVE EARLIER ====================
        const generateInvoiceNumber = () => {
            const number = invoiceCounter.value.toString().padStart(7, '0');
            const invoiceNumber = `${invoiceNumberPrefix}${number}`;
            invoiceCounter.value++;
            localStorage.setItem('invoiceCounter', invoiceCounter.value);
            return invoiceNumber;
        };

        const createNewInvoice = () => {
            const invoiceNumber = generateInvoiceNumber();
            
            invoice.value = {
                id: Date.now(),
                invoiceNumber: invoiceNumber,
                customerName: '',
                customerPhone: '',
                date: new Date().toISOString().split('T')[0],
                items: [],
                subtotal: 0,
                grandTotal: 0
            };
            
            itemSearch.value = '';
            searchResults.value = [];
            selectedSearchItem.value = null;
            selectedInventoryItem.value = { quantity: 1 };
            manualItem.value = { name: '', price: 0, quantity: 1 };
        };

        const switchToInvoiceTab = () => {
            activeTab.value = 'invoice';
            createNewInvoice();
        };

        // ==================== COMPUTED PROPERTIES ====================
        const uniqueCompanies = computed(() => {
            const companies = new Set(inventory.value.map(item => item.company));
            return Array.from(companies).filter(c => c).sort();
        });

        const uniqueCarModels = computed(() => {
            const models = new Set(inventory.value.map(item => item.carModel));
            return Array.from(models).filter(m => m).sort();
        });

        const uniqueYears = computed(() => {
            const years = new Set(inventory.value.map(item => item.modelYear));
            return Array.from(years).filter(y => y).sort((a, b) => b.localeCompare(a));
        });

        const hasActiveFilters = computed(() => {
            return selectedCompany.value || selectedCarModel.value || selectedYear.value;
        });

        const filteredInventory = computed(() => {
            let filtered = inventory.value;
            
            if (searchQuery.value.trim()) {
                const query = searchQuery.value.toLowerCase();
                filtered = filtered.filter(item =>
                    item.partName.toLowerCase().includes(query) ||
                    item.carModel.toLowerCase().includes(query) ||
                    item.modelYear.toLowerCase().includes(query) ||
                    item.company.toLowerCase().includes(query) ||
                    item.productCode.toLowerCase().includes(query)
                );
            }
            
            if (selectedCompany.value) {
                filtered = filtered.filter(item => item.company === selectedCompany.value);
            }
            
            if (selectedCarModel.value) {
                filtered = filtered.filter(item => item.carModel === selectedCarModel.value);
            }
            
            if (selectedYear.value) {
                filtered = filtered.filter(item => item.modelYear === selectedYear.value);
            }
            
            return filtered;
        });

        const filteredCount = computed(() => filteredInventory.value.length);
        const totalItems = computed(() => inventory.value.length);
        const totalCost = computed(() => inventory.value.reduce((sum, item) => sum + item.buyPrice, 0));
        const totalProfit = computed(() => inventory.value.reduce((sum, item) => sum + (item.sellPrice - item.buyPrice), 0));
        const lowStockCount = computed(() => inventory.value.filter(item => item.quantity <= 2).length);

        const invoiceSubtotal = computed(() => {
            return invoice.value.items.reduce((sum, item) => {
                return sum + (item.unitPrice * item.quantity);
            }, 0);
        });

        const invoiceGrandTotal = computed(() => {
            return invoiceSubtotal.value;
        });

        const getNextInvoiceNumber = () => {
            const counter = JSON.parse(localStorage.getItem('invoiceCounter')) || 1;
            return `${invoiceNumberPrefix}${counter.toString().padStart(7, '0')}`;
        };

        // ==================== MAIN FUNCTIONS ====================
        const toggleTheme = () => {
            document.body.classList.toggle('light-mode', isLightMode.value);
            localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark');
        };

        const saveToStorage = () => {
            localStorage.setItem('inventory', JSON.stringify(inventory.value));
        };

        const saveItem = () => {
            if (parseFloat(form.value.sellPrice) < parseFloat(form.value.buyPrice)) {
                alert('Selling price must be greater than purchase price');
                return;
            }

            const newItem = {
                id: nextId.value++,
                ...form.value,
                buyPrice: parseFloat(form.value.buyPrice),
                sellPrice: parseFloat(form.value.sellPrice),
                quantity: parseInt(form.value.quantity)
            };

            const existing = inventory.value.find(item => item.productCode === newItem.productCode);
            if (existing) {
                duplicateItem.value = newItem;
                showDuplicateModal.value = true;
                return;
            }

            inventory.value.push(newItem);
            saveToStorage();
            resetForm();
            alert('Saved successfully!');
        };

        const addAsNew = () => {
            inventory.value.push({ ...duplicateItem.value, id: nextId.value++ });
            saveToStorage();
            showDuplicateModal.value = false;
            duplicateItem.value = null;
            resetForm();
            alert('Added as new item successfully!');
        };

        const editExisting = () => {
            showDuplicateModal.value = false;
            const existing = inventory.value.find(item => item.productCode === duplicateItem.value.productCode);
            if (existing) {
                openEdit(existing.id);
            }
            duplicateItem.value = null;
        };

        const openEdit = (id) => {
            const item = inventory.value.find(item => item.id === id);
            if (item) {
                editForm.value = { ...item };
                showEditModal.value = true;
            }
        };

        const updateItem = () => {
            if (parseFloat(editForm.value.sellPrice) < parseFloat(editForm.value.buyPrice)) {
                alert('Selling price must be greater than purchase price');
                return;
            }

            const index = inventory.value.findIndex(item => item.id === editForm.value.id);
            if (index !== -1) {
                inventory.value[index] = {
                    ...editForm.value,
                    buyPrice: parseFloat(editForm.value.buyPrice),
                    sellPrice: parseFloat(editForm.value.sellPrice),
                    quantity: parseInt(editForm.value.quantity)
                };
                saveToStorage();
                closeEditModal();
                alert('Updated successfully!');
            }
        };

        const deleteItem = (id) => {
            if (confirm('Are you sure you want to delete this item?')) {
                inventory.value = inventory.value.filter(item => item.id !== id);
                saveToStorage();
            }
        };

        const exportToCSV = () => {
            const headers = ['No.', 'Part Name', 'Type', 'Car Model', 'Model Year', 'Purchase Price', 'Selling Price', 'Quantity'];
            const rows = inventory.value.map((item, idx) => [
                idx + 1,
                `"${item.partName}"`,
                `"${item.carModel}"`,
                `"${item.company}"`,
                `"${item.modelYear}"`,
                item.buyPrice,
                item.sellPrice,
                item.quantity
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'auto_parts_inventory.csv';
            a.click();
        };

        const resetForm = () => {
            form.value = {
                company: '',
                productCode: '',
                partName: '',
                carModel: '',
                modelYear: '',
                quantity: 1,
                buyPrice: 0,
                sellPrice: 0
            };
        };

        const closeDuplicateModal = () => {
            showDuplicateModal.value = false;
            duplicateItem.value = null;
        };

        const closeEditModal = () => {
            showEditModal.value = false;
            editForm.value = {
                id: null,
                company: '',
                productCode: '',
                partName: '',
                carModel: '',
                modelYear: '',
                quantity: 1,
                buyPrice: 0,
                sellPrice: 0
            };
        };

        const installPWA = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(choice => {
                    if (choice.outcome === 'accepted') {
                        showInstallBtn.value = false;
                    }
                    deferredPrompt = null;
                });
            }
        };

        const nextTick = () => new Promise(resolve => setTimeout(resolve, 50));

        // ==================== QR CODE FUNCTIONS ====================
        const generateQR = async (item) => {
            qrItem.value = item;
            currentQRData.value = item;
            showQRModal.value = true;
            
            await nextTick();
            
            const qrContainer = document.querySelector('.qr-code');
            if (!qrContainer) {
                console.error('QR container not found!');
                return;
            }
            
            qrContainer.innerHTML = '';
            
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not loaded!');
                alert('QR Code library failed to load. Please refresh.');
                createSimplePlaceholder(qrContainer, item);
                return;
            }
            
            const qrText = `AUTO PARTS|${item.productCode}|${item.partName}|${item.carModel}|${item.modelYear}|$${item.sellPrice}`;
            
            try {
                const qr = new QRCode(qrContainer, {
                    text: qrText,
                    width: 250,
                    height: 250,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
                
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    qrCodeInstance.value = canvas;
                } else {
                    createSimplePlaceholder(qrContainer, item);
                }
                
            } catch (error) {
                console.error('QR Code generation failed:', error);
                createSimplePlaceholder(qrContainer, item);
            }
        };

        const createSimplePlaceholder = (container, item) => {
            container.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.width = 250;
            canvas.height = 250;
            container.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 250, 250);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, 240, 240);
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR CODE ERROR', 125, 120);
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.fillText('Library not loaded', 125, 150);
            ctx.fillText('Check console and refresh', 125, 170);
            qrCodeInstance.value = canvas;
        };

        const downloadQR = () => {
            if (!qrCodeInstance.value) {
                alert('Generate QR first!');
                return;
            }
            
            const link = document.createElement('a');
            const filename = currentQRData.value 
                ? `QR_${currentQRData.value.productCode}.png`
                : 'auto_parts_qr.png';
            
            link.download = filename;
            link.href = qrCodeInstance.value.toDataURL('image/png');
            link.click();
        };

        const printQR = () => {
            if (!qrCodeInstance.value || !currentQRData.value) {
                alert('Generate QR first!');
                return;
            }
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Allow popups to print.');
                return;
            }
            
            const qrImageData = qrCodeInstance.value.toDataURL('image/png');
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>QR Code</title>
                    <style>
                        body { font-family: Arial; padding: 20px; text-align: center; }
                        h2 { color: #333; }
                        .info { margin: 20px 0; text-align: left; display: inline-block; }
                        .info p { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <h2>${currentQRData.value.partName}</h2>
                    <div>
                        <img src="${qrImageData}" width="200">
                    </div>
                    <div class="info">
                        <p><strong>Part Name:</strong> ${currentQRData.value.partName}</p>
                        <p><strong>Code:</strong> ${currentQRData.value.productCode}</p>
                        <p><strong>Car:</strong> ${currentQRData.value.carModel}</p>
                        <p><strong>Year:</strong> ${currentQRData.value.modelYear}</p>
                        <p><strong>Price:</strong> $${currentQRData.value.sellPrice.toFixed(2)}</p>
                        <p><strong>Stock:</strong> ${currentQRData.value.quantity}</p>
                        <p><strong>Company:</strong> ${currentQRData.value.company}</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    <\/script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
        };

        const closeQRModal = () => {
            showQRModal.value = false;
            qrItem.value = null;
            qrCodeInstance.value = null;
        };

        const applyFilters = () => {
            console.log('Filters applied');
        };

        const clearFilters = () => {
            selectedCompany.value = '';
            selectedCarModel.value = '';
            selectedYear.value = '';
            searchQuery.value = '';
        };

        const downloadTemplate = () => {
            const headers = ['company', 'productCode', 'partName', 'carModel', 'modelYear', 'quantity', 'buyPrice', 'sellPrice'];
            const example = ['Toyota', 'TYT-2023-BRK', 'Brake Pad', 'Camry', '2023', '10', '25.50', '45.99'];
            const csv = [headers.join(','), example.join(',')].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'auto_parts_template.csv';
            a.click();
        };

        const handleImport = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim());
                const headers = lines[0].split(',').map(h => h.trim());
                
                let success = 0;
                let errors = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const item = {};
                    
                    headers.forEach((header, index) => {
                        item[header] = values[index] ? values[index].trim() : '';
                    });
                    
                    if (!item.productCode || !item.partName) {
                        errors.push(`Line ${i}: Missing required fields`);
                        continue;
                    }
                    
                    item.quantity = parseInt(item.quantity) || 1;
                    item.buyPrice = parseFloat(item.buyPrice) || 0;
                    item.sellPrice = parseFloat(item.sellPrice) || 0;
                    
                    const existing = inventory.value.find(i => i.productCode === item.productCode);
                    if (existing) {
                        Object.assign(existing, item);
                    } else {
                        item.id = nextId.value++;
                        inventory.value.push(item);
                    }
                    success++;
                }
                
                saveToStorage();
                
                importResults.value = {
                    success,
                    errors,
                    total: lines.length - 1
                };
                
                event.target.value = '';
            };
            reader.readAsText(file);
        };

        const exportAllToCSV = () => {
            const headers = ['company', 'productCode', 'partName', 'carModel', 'modelYear', 'quantity', 'buyPrice', 'sellPrice'];
            const rows = inventory.value.map(item => [
                `"${item.company}"`,
                `"${item.productCode}"`,
                `"${item.partName}"`,
                `"${item.carModel}"`,
                `"${item.modelYear}"`,
                item.quantity,
                item.buyPrice,
                item.sellPrice
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `auto_parts_backup_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        };

        // ==================== INVOICE FUNCTIONS ====================
        const searchItemsForInvoice = () => {
            if (!itemSearch.value.trim()) {
                searchResults.value = [];
                return;
            }
            
            const query = itemSearch.value.toLowerCase();
            searchResults.value = inventory.value.filter(item =>
                item.partName.toLowerCase().includes(query) ||
                item.productCode.toLowerCase().includes(query) ||
                item.carModel.toLowerCase().includes(query)
            ).slice(0, 5);
        };

        const selectSearchItem = (item) => {
            selectedSearchItem.value = item;
        };

        const addInventoryItem = () => {
            if (!selectedSearchItem.value) {
                alert('Please select an item from stock!');
                return;
            }
            
            const item = selectedSearchItem.value;
            const quantity = selectedInventoryItem.value.quantity || 1;
            
            const existingIndex = invoice.value.items.findIndex(i => 
                i.type === 'inventory' && i.itemId === item.id
            );
            
            if (existingIndex !== -1) {
                invoice.value.items[existingIndex].quantity += quantity;
            } else {
                invoice.value.items.push({
                    itemId: item.id,
                    type: 'inventory',
                    code: item.productCode,
                    description: item.partName,
                    unitPrice: item.sellPrice,
                    quantity: quantity,
                    carModel: item.carModel
                });
            }
            
            updateInvoiceTotal();
            
            selectedSearchItem.value = null;
            itemSearch.value = '';
            searchResults.value = [];
            selectedInventoryItem.value = { quantity: 1 };
        };

        const addManualItem = () => {
            if (!manualItem.value.name || !manualItem.value.price) {
                alert('Please fill in item name and price!');
                return;
            }
            
            const manual = manualItem.value;
            
            invoice.value.items.push({
                type: 'manual',
                code: null,
                description: manual.name,
                unitPrice: parseFloat(manual.price),
                quantity: parseInt(manual.quantity) || 1
            });
            
            updateInvoiceTotal();
            
            manualItem.value = { name: '', price: 0, quantity: 1 };
        };

        const removeInvoiceItem = (index) => {
            if (confirm('Are you sure you want to remove this item from the invoice?')) {
                invoice.value.items.splice(index, 1);
                updateInvoiceTotal();
            }
        };

        const updateInvoiceTotal = () => {
            invoice.value.subtotal = invoiceSubtotal.value;
            invoice.value.grandTotal = invoiceGrandTotal.value;
        };

        const saveInvoiceToHistory = () => {
            if (!invoice.value.customerName.trim()) {
                alert('Please fill in customer name!');
                return;
            }
            
            if (invoice.value.items.length === 0) {
                alert('Please add items to the invoice!');
                return;
            }
            
            updateInvoiceTotal();
            
            const invoiceToSave = {
                ...invoice.value,
                timestamp: new Date().toISOString(),
                items: JSON.parse(JSON.stringify(invoice.value.items))
            };
            
            invoiceHistory.value.push(invoiceToSave);
            localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory.value));
            
            alert('Invoice saved successfully!');
            createNewInvoice();
        };

        const viewInvoiceHistory = (historyInvoice) => {
            invoice.value = JSON.parse(JSON.stringify(historyInvoice));
            invoice.value.id = historyInvoice.id;
            activeTab.value = 'invoice';
        };

        const printInvoice = () => {
            if (!invoice.value.customerName.trim() || invoice.value.items.length === 0) {
                alert('Please fill in customer information and add items first!');
                return;
            }
            
            updateInvoiceTotal();
            
            const printWindow = window.open('', '_blank');
            const printContent = document.querySelector('.invoice-preview').innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice ${invoice.value.invoiceNumber}</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 20px; color: #000; }
                        .invoice-preview { max-width: 800px; margin: 0 auto; }
                        .preview-header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                        .preview-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .preview-table th, .preview-table td { border: 1px solid #000; padding: 10px; text-align: left; }
                        .preview-table th { background: #f0f0f0; }
                        .preview-totals { text-align: right; margin-top: 30px; font-size: 16px; }
                        .preview-footer { margin-top: 50px; text-align: center; color: #666; }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 1000);
                        };
                    <\/script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
        };

        const printInvoiceFromHistory = (historyInvoice) => {
            invoice.value = JSON.parse(JSON.stringify(historyInvoice));
            setTimeout(() => {
                printInvoice();
            }, 100);
        };

        const deleteInvoiceHistory = (invoiceId) => {
            if (confirm('Are you sure you want to delete this invoice from history?')) {
                invoiceHistory.value = invoiceHistory.value.filter(inv => inv.id !== invoiceId);
                localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory.value));
                alert('Invoice deleted successfully!');
            }
        };

        const saveInvoiceAsImage = () => {
            alert('To save as image, please use the print function and select "Save as PDF" or "Save as Image"');
            printInvoice();
        };

        const saveInvoiceAsPDF = () => {
            alert('To save as PDF, please use the print function and select "Save as PDF"');
            printInvoice();
        };

        const clearInvoice = () => {
            if (confirm('Are you sure you want to clear the current invoice? All data will be lost.')) {
                createNewInvoice();
            }
        };

        // ==================== MOUNTED ====================
        onMounted(() => {
            document.body.classList.toggle('light-mode', isLightMode.value);
            
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                showInstallBtn.value = true;
            });

            window.addEventListener('appinstalled', () => {
                showInstallBtn.value = false;
            });

            inventory.value = inventory.value.map(item => ({
                ...item,
                quantity: item.quantity || 1
            }));
            saveToStorage();
            
            if (!localStorage.getItem('invoiceCounter')) {
                if (invoiceHistory.value.length > 0) {
                    const invoiceNumbers = invoiceHistory.value
                        .filter(inv => inv.invoiceNumber && inv.invoiceNumber.startsWith(invoiceNumberPrefix))
                        .map(inv => {
                            const numStr = inv.invoiceNumber.replace(invoiceNumberPrefix, '');
                            return parseInt(numStr, 10) || 0;
                        });
                    
                    const maxNumber = Math.max(...invoiceNumbers, 0);
                    invoiceCounter.value = maxNumber + 1;
                    localStorage.setItem('invoiceCounter', invoiceCounter.value);
                }
            }
            
            createNewInvoice();
        });

        // ==================== RETURN ====================
        return {
            inventory,
            activeTab,
            searchQuery,
            isLightMode,
            showDuplicateModal,
            showEditModal,
            duplicateItem,
            form,
            editForm,
            showInstallBtn,
            showQRModal,
            qrItem,
            bulkTab,
            importResults,
            selectedCompany,
            selectedCarModel,
            selectedYear,
            uniqueCompanies,
            uniqueCarModels,
            uniqueYears,
            hasActiveFilters,
            filteredInventory,
            filteredCount,
            totalItems,
            totalCost,
            totalProfit,
            lowStockCount,
            toggleTheme,
            saveItem,
            addAsNew,
            editExisting,
            openEdit,
            updateItem,
            deleteItem,
            exportToCSV,
            closeDuplicateModal,
            closeEditModal,
            installPWA,
            generateQR,
            downloadQR,
            printQR,
            closeQRModal,
            applyFilters,
            clearFilters,
            downloadTemplate,
            handleImport,
            exportAllToCSV,
            switchToInvoiceTab,
            invoice,
            getNextInvoiceNumber,
            invoiceHistory,
            itemSearch,
            searchResults,
            selectedSearchItem,
            selectedInventoryItem,
            manualItem,
            invoiceSubtotal,
            invoiceGrandTotal,
            createNewInvoice,
            searchItemsForInvoice,
            selectSearchItem,
            addInventoryItem,
            addManualItem,
            removeInvoiceItem,
            updateInvoiceTotal,
            saveInvoiceToHistory,
            viewInvoiceHistory,
            printInvoice,
            printInvoiceFromHistory,
            deleteInvoiceHistory,
            saveInvoiceAsImage,
            saveInvoiceAsPDF,
            clearInvoice,
        };
    }
}).mount('#app');
