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

        // ==================== UPDATED QR CODE FUNCTIONS ====================
        const generateQR = async (item) => {
            qrItem.value = item;
            currentQRData.value = item;
            showQRModal.value = true;
            
            // Wait for modal to render
            await nextTick();
            
            const qrContainer = document.querySelector('.qr-code');
            if (!qrContainer) {
                console.error('QR container not found!');
                return;
            }
            
            // Clear previous QR code
            qrContainer.innerHTML = '';
            
            // Check if QRCode library is available
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not loaded!');
                alert('QR Code library failed to load. Please check the console and refresh.');
                createSimplePlaceholder(qrContainer, item);
                return;
            }
            
            // Format data for QR code - keep it simple for scanning
            const qrText = `AUTO PARTS|${item.productCode}|${item.partName}|${item.carModel}|${item.modelYear}|$${item.sellPrice}`;
            
            // Generate QR code using qrcodejs library
            try {
                // Create QRCode instance - this automatically generates the QR in the container
                const qr = new QRCode(qrContainer, {
                    text: qrText,
                    width: 250,
                    height: 250,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H // High error correction
                });
                
                // Store the canvas for download/print
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    qrCodeInstance.value = canvas;
                    console.log('QR code generated successfully!');
                    
                    // Test if it's a real QR code
                    testQRCode(canvas);
                } else {
                    console.warn('Canvas not found, using fallback');
                    createSimplePlaceholder(qrContainer, item);
                }
                
            } catch (error) {
                console.error('QR Code generation failed:', error);
                createSimplePlaceholder(qrContainer, item);
            }
        };

        // Test function to verify QR code is real
        const testQRCode = (canvas) => {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Count black pixels
            let blackPixels = 0;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] < 128 && data[i + 1] < 128 && data[i + 2] < 128) {
                    blackPixels++;
                }
            }
            
            const totalPixels = data.length / 4;
            const blackRatio = (blackPixels / totalPixels) * 100;
            
            console.log('QR Code Quality Check:');
            console.log(`- Total pixels: ${totalPixels}`);
            console.log(`- Black pixels: ${blackPixels}`);
            console.log(`- Black pixel ratio: ${blackRatio.toFixed(2)}%`);
            
            // A real QR code typically has 20-40% black pixels
            if (blackRatio < 10) {
                console.warn('Warning: Low black pixel ratio - QR may not scan well');
            }
        };

        // Simple placeholder (only used if QR library fails)
        const createSimplePlaceholder = (container, item) => {
            container.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.width = 250;
            canvas.height = 250;
            container.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            
            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 250, 250);
            
            // Black border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, 240, 240);
            
            // Error message
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
                        <p><strong>ឈ្មោះគ្រឿង:</strong> ${currentQRData.value.partName}</p>
                        <p><strong>កូដ:</strong> ${currentQRData.value.productCode}</p>
                        <p><strong>ឡាន:</strong> ${currentQRData.value.carModel}</p>
                        <p><strong>ឆ្នាំ:</strong> ${currentQRData.value.modelYear}</p>
                        <p><strong>តម្លៃលក់:</strong> $${currentQRData.value.sellPrice.toFixed(2)}</p>
                        <p><strong>ស្តុក:</strong> ${currentQRData.value.quantity}</p>
                        <p><strong>ក្រុមហ៊ុន:</strong> ${currentQRData.value.company}</p>
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
