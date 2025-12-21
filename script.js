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

        // ==================== INVOICE COUNTER ====================
        const invoiceCounter = ref(1); // Start from 1
        const invoiceNumberPrefix = ref('INV-');

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

        // ==================== INVOICE SYSTEM STATE ====================
        const invoice = ref({
            id: null,
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

        // ==================== INVOICE COMPUTED PROPERTIES ====================
        const invoiceSubtotal = computed(() => {
            return invoice.value.items.reduce((sum, item) => {
                return sum + (item.unitPrice * item.quantity);
            }, 0);
        });

        const invoiceGrandTotal = computed(() => {
            return invoiceSubtotal.value;
        });

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

        // ... [keep all existing functions up to onMounted] ...

        // ==================== INVOICE FUNCTIONS ====================

        // Generate sequential invoice number
        const generateInvoiceNumber = () => {
            // Get the current counter from localStorage or start from 1
            const savedCounter = localStorage.getItem('invoiceCounter');
            if (savedCounter) {
                invoiceCounter.value = parseInt(savedCounter, 10);
            }
            
            // Generate the invoice number with leading zeros
            const invoiceNumber = invoiceCounter.value.toString().padStart(7, '0');
            invoiceCounter.value++;
            
            // Save the updated counter to localStorage
            localStorage.setItem('invoiceCounter', invoiceCounter.value);
            
            return `${invoiceNumberPrefix.value}${invoiceNumber}`;
        };

        // Get the next invoice number without incrementing (for display)
        const getNextInvoiceNumber = () => {
            const savedCounter = localStorage.getItem('invoiceCounter');
            const counter = savedCounter ? parseInt(savedCounter, 10) : 1;
            return `${invoiceNumberPrefix.value}${counter.toString().padStart(7, '0')}`;
        };

        // Create new invoice
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

        // Search inventory items for invoice
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

        // Select item from search results
        const selectSearchItem = (item) => {
            selectedSearchItem.value = item;
        };

        // Add inventory item to invoice
        const addInventoryItem = () => {
            if (!selectedSearchItem.value) {
                alert('សូមជ្រើសរើសគ្រឿងពីស្តុក!');
                return;
            }
            
            const item = selectedSearchItem.value;
            const quantity = selectedInventoryItem.value.quantity || 1;
            
            // Check stock availability
            if (item.quantity < quantity) {
                alert(`មិនមានស្តុកគ្រប់គ្រាន់! ស្តុកនៅសល់: ${item.quantity}`);
                return;
            }
            
            // Check if item already exists in invoice
            const existingIndex = invoice.value.items.findIndex(i => 
                i.type === 'inventory' && i.itemId === item.id
            );
            
            if (existingIndex !== -1) {
                // Update quantity
                const newQuantity = invoice.value.items[existingIndex].quantity + quantity;
                if (item.quantity < newQuantity) {
                    alert(`មិនមានស្តុកគ្រប់គ្រាន់! ស្តុកនៅសល់: ${item.quantity}`);
                    return;
                }
                invoice.value.items[existingIndex].quantity = newQuantity;
            } else {
                // Add new item
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
            
            // Update totals
            updateInvoiceTotal();
            
            // Reset selection
            selectedSearchItem.value = null;
            itemSearch.value = '';
            searchResults.value = [];
            selectedInventoryItem.value = { quantity: 1 };
        };

        // Add manual item to invoice
        const addManualItem = () => {
            if (!manualItem.value.name || !manualItem.value.price) {
                alert('សូមបំពេញឈ្មោះ និងតម្លៃគ្រឿង!');
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
            
            // Update totals
            updateInvoiceTotal();
            
            // Reset manual item form
            manualItem.value = { name: '', price: 0, quantity: 1 };
        };

        // Remove item from invoice
        const removeInvoiceItem = (index) => {
            if (confirm('តើអ្នកចង់លុបគ្រឿងនេះពីវិក័យប័ត្រទេ?')) {
                invoice.value.items.splice(index, 1);
                updateInvoiceTotal();
            }
        };

        // Update invoice totals
        const updateInvoiceTotal = () => {
            invoice.value.subtotal = invoiceSubtotal.value;
            invoice.value.grandTotal = invoiceGrandTotal.value;
        };

        // Save invoice to history
        const saveInvoiceToHistory = () => {
            if (!invoice.value.customerName.trim()) {
                alert('សូមបំពេញឈ្មោះអតិថិជន!');
                return;
            }
            
            if (invoice.value.items.length === 0) {
                alert('សូមបន្ថែមគ្រឿងចូលក្នុងវិក័យប័ត្រ!');
                return;
            }
            
            // Update totals before saving
            updateInvoiceTotal();
            
            // Update inventory for items sold
            invoice.value.items.forEach(item => {
                if (item.type === 'inventory') {
                    const inventoryItem = inventory.value.find(i => i.id === item.itemId);
                    if (inventoryItem) {
                        inventoryItem.quantity -= item.quantity;
                        if (inventoryItem.quantity < 0) inventoryItem.quantity = 0;
                    }
                }
            });
            
            saveToStorage();
            
            // Create a copy of the current invoice
            const invoiceToSave = {
                ...invoice.value,
                timestamp: new Date().toISOString(),
                items: JSON.parse(JSON.stringify(invoice.value.items)) // Deep copy
            };
            
            // Add to history
            invoiceHistory.value.push(invoiceToSave);
            
            // Save to localStorage
            localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory.value));
            
            alert(`វិក័យប័ត្រលេខ ${invoice.value.invoiceNumber} ត្រូវបានរក្សាទុកដោយជោគជ័យ!`);
            
            // Create new invoice
            createNewInvoice();
        };

        // View invoice from history
        const viewInvoiceHistory = (historyInvoice) => {
            invoice.value = JSON.parse(JSON.stringify(historyInvoice));
            activeTab.value = 'invoice';
        };

        // Print invoice
        const printInvoice = () => {
            if (!invoice.value.customerName.trim() || invoice.value.items.length === 0) {
                alert('សូមបំពេញព័ត៌មានអតិថិជន និងបន្ថែមគ្រឿងជាមុន!');
                return;
            }
            
            updateInvoiceTotal();
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('សូមអនុញ្ញាត popups ដើម្បីបោះពុម្ព!');
                return;
            }
            
            const printContent = document.querySelector('.invoice-preview').innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>វិក័យប័ត្រ ${invoice.value.invoiceNumber}</title>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: 'Arial', 'Khmer OS', sans-serif; 
                            padding: 20px; 
                            color: #000; 
                            direction: ltr;
                        }
                        .invoice-preview { 
                            max-width: 800px; 
                            margin: 0 auto; 
                        }
                        .preview-header { 
                            border-bottom: 2px solid #000; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px; 
                            text-align: center;
                        }
                        .invoice-number {
                            font-size: 24px;
                            font-weight: bold;
                            color: #333;
                            margin: 10px 0;
                        }
                        .preview-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                        }
                        .preview-table th, .preview-table td { 
                            border: 1px solid #000; 
                            padding: 10px; 
                            text-align: left; 
                        }
                        .preview-table th { 
                            background: #f0f0f0; 
                            font-weight: bold;
                        }
                        .preview-totals { 
                            text-align: right; 
                            margin-top: 30px; 
                            font-size: 16px; 
                        }
                        .preview-footer { 
                            margin-top: 50px; 
                            text-align: center; 
                            color: #666; 
                            border-top: 1px solid #000;
                            padding-top: 20px;
                        }
                        .customer-info {
                            margin: 20px 0;
                            padding: 15px;
                            background: #f9f9f9;
                            border-radius: 5px;
                        }
                        @media print {
                            body { 
                                padding: 0; 
                                margin: 0; 
                            }
                            .no-print { 
                                display: none; 
                            }
                        }
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

        // Print invoice from history
        const printInvoiceFromHistory = (historyInvoice) => {
            invoice.value = JSON.parse(JSON.stringify(historyInvoice));
            setTimeout(() => {
                printInvoice();
            }, 100);
        };

        // Delete invoice from history
        const deleteInvoiceHistory = (invoiceId) => {
            if (confirm('តើអ្នកពិតជាចង់លុបវិក័យប័ត្រនេះពីប្រវត្តិទេ?')) {
                invoiceHistory.value = invoiceHistory.value.filter(inv => inv.id !== invoiceId);
                localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory.value));
                alert('វិក័យប័ត្រត្រូវបានលុបដោយជោគជ័យ!');
            }
        };

        // Save invoice as image
        const saveInvoiceAsImage = () => {
            alert('ដើម្បីរក្សាទុកជារូបភាព សូមប្រើឧបករណ៍បោះពុម្ព និងជ្រើសរើស "Save as PDF" ឬ "Save as Image"');
            printInvoice();
        };

        // Save invoice as PDF
        const saveInvoiceAsPDF = () => {
            alert('ដើម្បីរក្សាទុកជា PDF សូមប្រើឧបករណ៍បោះពុម្ព និងជ្រើសរើស "Save as PDF"');
            printInvoice();
        };

        // Clear current invoice
        const clearInvoice = () => {
            if (confirm('តើអ្នកពិតជាចង់លុបវិក័យប័ត្របច្ចុប្បន្នទេ? ទិន្នន័យនឹងត្រូវបាត់បង់។')) {
                createNewInvoice();
            }
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
            
            // Initialize invoice counter
            const savedCounter = localStorage.getItem('invoiceCounter');
            if (!savedCounter) {
                // If no counter exists, set it based on existing invoices
                if (invoiceHistory.value.length > 0) {
                    // Find the highest invoice number
                    const numbers = invoiceHistory.value.map(inv => {
                        if (inv.invoiceNumber) {
                            const match = inv.invoiceNumber.match(/\d+/);
                            return match ? parseInt(match[0]) : 0;
                        }
                        return 0;
                    });
                    const maxNumber = Math.max(...numbers);
                    invoiceCounter.value = maxNumber + 1;
                    localStorage.setItem('invoiceCounter', invoiceCounter.value);
                } else {
                    // Start from 1
                    invoiceCounter.value = 1;
                    localStorage.setItem('invoiceCounter', 1);
                }
            } else {
                invoiceCounter.value = parseInt(savedCounter, 10);
            }
            
            // Initialize invoice
            createNewInvoice();
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
            invoice,
            invoiceHistory,
            itemSearch,
            searchResults,
            selectedSearchItem,
            selectedInventoryItem,
            manualItem,
            invoiceSubtotal,
            invoiceGrandTotal,
            getNextInvoiceNumber,
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
