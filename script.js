const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // ==================== ORIGINAL CORE STATE ====================
        const inventory = ref(JSON.parse(localStorage.getItem('inventory')) || []);
        const activeTab = ref('add');
        const searchQuery = ref('');
        const isLightMode = ref(localStorage.getItem('theme') === 'light');
        const showDuplicateModal = ref(false);
        const showEditModal = ref(false);
        const duplicateItem = ref(null);
        const nextId = ref(inventory.value.length ? Math.max(...inventory.value.map(i => i.id)) + 1 : 1);

        // Form models
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

        // ==================== NEW FEATURES STATE ====================
        const showInstallBtn = ref(false);
        let deferredPrompt = null; // Note: not reactive

        const showQRModal = ref(false);
        const qrItem = ref(null);
        const bulkTab = ref('import');
        const importResults = ref(null);
        const qrCodeInstance = ref(null);

        // ==================== COMPUTED PROPERTIES ====================
        const filteredInventory = computed(() => {
            if (!searchQuery.value.trim()) return inventory.value;
            const query = searchQuery.value.toLowerCase();
            return inventory.value.filter(item =>
                item.partName.toLowerCase().includes(query) ||
                item.carModel.toLowerCase().includes(query) ||
                item.modelYear.toLowerCase().includes(query) ||
                item.company.toLowerCase().includes(query) ||
                item.productCode.toLowerCase().includes(query)
            );
        });

        const totalItems = computed(() => inventory.value.length);
        const totalCost = computed(() => inventory.value.reduce((sum, item) => sum + item.buyPrice, 0));
        const totalProfit = computed(() => inventory.value.reduce((sum, item) => sum + (item.sellPrice - item.buyPrice), 0));
        const lowStockCount = computed(() => inventory.value.filter(item => item.quantity <= 2).length);

        // ==================== ORIGINAL CORE FUNCTIONS ====================
        const toggleTheme = () => {
            document.body.classList.toggle('light-mode', isLightMode.value);
            localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark');
        };

        const saveToStorage = () => {
            localStorage.setItem('inventory', JSON.stringify(inventory.value));
        };

        const saveItem = () => {
            // Validate sell price >= buy price
            if (parseFloat(form.value.sellPrice) < parseFloat(form.value.buyPrice)) {
                alert('តម្លៃលក់ត្រូវតែធំជាង ឬស្មើតម្លៃទិញ');
                return;
            }

            const newItem = {
                id: nextId.value++,
                ...form.value,
                buyPrice: parseFloat(form.value.buyPrice),
                sellPrice: parseFloat(form.value.sellPrice),
                quantity: parseInt(form.value.quantity)
            };

            // Check for duplicate product code
            const existing = inventory.value.find(item => item.productCode === newItem.productCode);
            if (existing) {
                duplicateItem.value = newItem;
                showDuplicateModal.value = true;
                return;
            }

            inventory.value.push(newItem);
            saveToStorage();
            resetForm();
            alert('រក្សាទុកដោយជោគជ័យ!');
        };

        const addAsNew = () => {
            inventory.value.push({ ...duplicateItem.value, id: nextId.value++ });
            saveToStorage();
            showDuplicateModal.value = false;
            duplicateItem.value = null;
            resetForm();
            alert('បានបន្ថែមជាទំនិញថ្មីដោយជោគជ័យ!');
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
            // Validate sell price >= buy price
            if (parseFloat(editForm.value.sellPrice) < parseFloat(editForm.value.buyPrice)) {
                alert('តម្លៃលក់ត្រូវតែធំជាង ឬស្មើតម្លៃទិញ');
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
                alert('កែប្រែដោយជោគជ័យ!');
            }
        };

        const deleteItem = (id) => {
            if (confirm('តើអ្នកប្រាកដជាចង់លុបគ្រឿងនេះទេ?')) {
                inventory.value = inventory.value.filter(item => item.id !== id);
                saveToStorage();
            }
        };

        const exportToCSV = () => {
            const headers = ['ល.រ', 'ឈ្មោះគ្រឿង', 'ប្រភេទ', 'ម៉ូដែលឡាន', 'ឆ្នាំម៉ូដែល', 'តម្លៃទិញ', 'តម្លៃលក់', 'ចំនួន'];
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
            a.download = 'krom_krong_lan.csv';
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

        // ==================== PWA INSTALL FUNCTIONS ====================
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

        // ==================== QR CODE FUNCTIONS ====================
        const nextTick = () => new Promise(resolve => setTimeout(resolve, 50));

        const generateQR = async (item) => {
            qrItem.value = item;
            showQRModal.value = true;
            
            // Wait for DOM to update
            await nextTick();
            
            // Clear previous QR
            const qrContainer = document.querySelector('.qr-code');
            if (qrContainer) qrContainer.innerHTML = '';
            
            // Create QR data
            const qrData = JSON.stringify({
                partName: item.partName,
                productCode: item.productCode,
                carModel: item.carModel,
                company: item.company,
                buyPrice: item.buyPrice,
                sellPrice: item.sellPrice,
                quantity: item.quantity,
                id: item.id,
                timestamp: new Date().toISOString()
            });
            
            // Generate QR Code using pure JavaScript (no external library)
            generateQRCodeCanvas(qrData, qrContainer);
        };

        const generateQRCodeCanvas = (data, container) => {
    // Clear container first
    container.innerHTML = '';
    
    // Generate real QR code
    QRCode.toCanvas(container, data, {
        width: 180,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function(error) {
        if (error) {
            console.error('QR Code error:', error);
            // Fallback to simple pattern if QR library fails
            const canvas = document.createElement('canvas');
            canvas.width = 180;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 180, 180);
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.fillText('Auto Parts', 50, 90);
            ctx.font = '10px Arial';
            ctx.fillText(qrItem.value.productCode, 60, 110);
            container.appendChild(canvas);
            qrCodeInstance.value = canvas;
        } else {
            // Store the canvas element for download/print
            qrCodeInstance.value = container.querySelector('canvas');
        }
    });
};
            
            // Add text
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText('Auto Parts', 60, 170);
            
            container.appendChild(canvas);
            qrCodeInstance.value = canvas;
        };

        const downloadQR = () => {
            if (!qrCodeInstance.value) return;
            
            const link = document.createElement('a');
            link.download = `QR_${qrItem.value.productCode}.png`;
            link.href = qrCodeInstance.value.toDataURL('image/png');
            link.click();
        };

        const printQR = () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - ${qrItem.value.partName}</title>
                        <style>
                            body { font-family: Arial; padding: 20px; text-align: center; }
                            h2 { color: #333; }
                            .info { margin: 20px 0; text-align: left; }
                            .info p { margin: 5px 0; }
                        </style>
                    </head>
                    <body>
                        <h2>${qrItem.value.partName}</h2>
                        <div>
                            <img src="${qrCodeInstance.value.toDataURL('image/png')}" width="200">
                        </div>
                        <div class="info">
                            <p><strong>Code:</strong> ${qrItem.value.productCode}</p>
                            <p><strong>Car:</strong> ${qrItem.value.carModel}</p>
                            <p><strong>Stock:</strong> ${qrItem.value.quantity}</p>
                            <p><strong>Price:</strong> $${qrItem.value.sellPrice.toFixed(2)}</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        };

        const closeQRModal = () => {
            showQRModal.value = false;
            qrItem.value = null;
            qrCodeInstance.value = null;
        };

        // ==================== BULK IMPORT/EXPORT ====================
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
                
                // Process each line (skip header)
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const item = {};
                    
                    headers.forEach((header, index) => {
                        item[header] = values[index] ? values[index].trim() : '';
                    });
                    
                    // Validate required fields
                    if (!item.productCode || !item.partName) {
                        errors.push(`Line ${i}: Missing required fields`);
                        continue;
                    }
                    
                    // Convert numeric fields
                    item.quantity = parseInt(item.quantity) || 1;
                    item.buyPrice = parseFloat(item.buyPrice) || 0;
                    item.sellPrice = parseFloat(item.sellPrice) || 0;
                    
                    // Check for duplicates
                    const existing = inventory.value.find(i => i.productCode === item.productCode);
                    if (existing) {
                        // Update existing
                        Object.assign(existing, item);
                    } else {
                        // Add new
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
                
                // Reset file input
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

        // ==================== MOUNTED HOOK ====================
        onMounted(() => {
            // Initialize theme
            document.body.classList.toggle('light-mode', isLightMode.value);
            
            // PWA event listeners
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                showInstallBtn.value = true;
            });

            window.addEventListener('appinstalled', () => {
                showInstallBtn.value = false;
            });

            // Ensure existing items have quantity field (for backward compatibility)
            inventory.value = inventory.value.map(item => ({
                ...item,
                quantity: item.quantity || 1
            }));
            saveToStorage();
        });

        // ==================== RETURN ALL TO TEMPLATE ====================
        return {
            // Original state
            inventory,
            activeTab,
            searchQuery,
            isLightMode,
            showDuplicateModal,
            showEditModal,
            duplicateItem,
            form,
            editForm,
            // New state
            showInstallBtn,
            showQRModal,
            qrItem,
            bulkTab,
            importResults,
            // Computed properties
            filteredInventory,
            totalItems,
            totalCost,
            totalProfit,
            lowStockCount,
            // Original methods
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
            // New methods
            installPWA,
            generateQR,
            downloadQR,
            printQR,
            closeQRModal,
            downloadTemplate,
            handleImport,
            exportAllToCSV
        };
    }
}).mount('#app');
