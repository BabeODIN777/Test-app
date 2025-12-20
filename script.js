// ==================== QRCODE LIBRARY CHECK ====================
// Check if QRCode library is loaded - put this at the VERY TOP of script.js
console.log('QRCode library available:', typeof QRCode !== 'undefined');
if (typeof QRCode !== 'undefined') {
    console.log('QRCode library version:', QRCode.version || 'Unknown');
} else {
    console.error('QRCode library failed to load!');
    
    // Try loading it dynamically as a fallback
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    script.onload = function() {
        console.log('QRCode library dynamically loaded');
    };
    script.onerror = function() {
        console.error('Failed to load QRCode library dynamically');
    };
    document.head.appendChild(script);
}

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

        // ==================== FUNCTIONS ====================
        const toggleTheme = () => {
            document.body.classList.toggle('light-mode', isLightMode.value);
            localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark');
        };

        const saveToStorage = () => {
            localStorage.setItem('inventory', JSON.stringify(inventory.value));
        };

        const saveItem = () => {
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

        const generateQR = async (item) => {
            console.log('Generating QR for:', item);
            console.log('QRCode available:', typeof QRCode !== 'undefined');
            
            if (typeof QRCode === 'undefined') {
                alert('QR Code library not loaded. Please refresh the page.');
                return;
            }
            
            qrItem.value = item;
            currentQRData.value = item;
            showQRModal.value = true;
            
            // Wait for modal to render
            await nextTick();
            
            const qrContainer = document.querySelector('.qr-code');
            console.log('QR container found:', !!qrContainer);
            
            if (!qrContainer) {
                console.error('QR container not found!');
                return;
            }
            
            qrContainer.innerHTML = '';
            
            // Use a very simple format for maximum compatibility
            const qrText = `PART:${item.partName}|CODE:${item.productCode}|CAR:${item.carModel}|PRICE:$${item.sellPrice}|QTY:${item.quantity}`;
            console.log('QR Text:', qrText);
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = 250;
            canvas.height = 250;
            qrContainer.appendChild(canvas);
            
            // Generate QR
            try {
                QRCode.toCanvas(canvas, qrText, {
                    width: 250,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'L' // Lowest error correction (more data, simpler code)
                }, function(error) {
                    if (error) {
                        console.error('QR generation error:', error);
                        // Create a simple QR code as fallback
                        createSimpleQR(canvas, item);
                    } else {
                        console.log('QR code generated successfully');
                        qrCodeInstance.value = canvas;
                    }
                });
            } catch (error) {
                console.error('QR code generation failed:', error);
                // Create a basic pattern as fallback
                createSimpleQR(canvas, item);
                qrCodeInstance.value = canvas;
            }
            
            // Helper function for simple QR when library fails
            const createSimpleQR = (canvas, item) => {
                const ctx = canvas.getContext('2d');
                
                // White background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 250, 250);
                
                // Black border for contrast
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.strokeRect(10, 10, 230, 230);
                
                // Draw QR-like pattern
                ctx.fillStyle = '#000000';
                
                // Draw position markers
                ctx.fillRect(30, 30, 50, 50);
                ctx.fillRect(170, 30, 50, 50);
                ctx.fillRect(30, 170, 50, 50);
                
                // Draw alignment patterns
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 5; j++) {
                        if ((i + j) % 2 === 0) {
                            ctx.fillRect(110 + i * 5, 110 + j * 5, 5, 5);
                        }
                    }
                }
                
                // Draw text
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('AUTO PARTS', 125, 70);
                
                ctx.font = '12px Arial';
                ctx.fillText(item.productCode, 125, 90);
                ctx.fillText(item.partName.substring(0, 20), 125, 210);
                ctx.fillText(`$${item.sellPrice} | Stock: ${item.quantity}`, 125, 230);
            };
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
                        .info { margin: 20px 0; text-align: left; }
                        .info p { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <h2>${currentQRData.value.partName}</h2>
                    <div>
                        <img src="${qrImageData}" width="200">
                    </div>
                    <div class="info">
                        <p><strong>Code:</strong> ${currentQRData.value.productCode}</p>
                        <p><strong>Car:</strong> ${currentQRData.value.carModel}</p>
                        <p><strong>Stock:</strong> ${currentQRData.value.quantity}</p>
                        <p><strong>Price:</strong> $${currentQRData.value.sellPrice.toFixed(2)}</p>
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
        };

        const applyFilters = () => {
            // Filters are automatically applied via computed property
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
        });

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
            exportAllToCSV
        };
    }
}).mount('#app');
