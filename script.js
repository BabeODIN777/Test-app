const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // ==================== LANGUAGE SYSTEM ====================
        const currentLanguage = ref(localStorage.getItem('language') || 'en');
        
        // Translation dictionary
        const translations = {
            en: {
                // App & Header
                appTitle: 'Auto Parts Management System',
                lightMode: '☀️ Light Mode',
                darkMode: '🌙 Dark Mode',
                installApp: 'Install App',
                
                // Tabs
                addPart: 'Add Part',
                stock: 'Stock',
                statistics: 'Statistics',
                importExport: 'Import/Export',
                invoice: 'Invoice',
                
                // Form Labels
                company: 'Company',
                enterCompany: 'Enter company name',
                partCode: 'Part Code',
                enterPartCode: 'Enter part code',
                partName: 'Part Name',
                enterPartName: 'Enter part name',
                carModel: 'Car Model',
                enterCarModel: 'Enter car model',
                modelYear: 'Model Year',
                enterModelYear: 'Enter model year',
                quantity: 'Quantity',
                purchasePrice: 'Purchase Price',
                sellingPrice: 'Selling Price',
                savePart: 'Save Part',
                
                // Stock Tab
                searchParts: 'Search parts...',
                allCompanies: 'All Companies',
                allCarModels: 'All Car Models',
                allModelYears: 'All Model Years',
                clearFilters: 'Clear Filters',
                showing: 'Showing',
                of: 'of',
                items: 'items',
                code: 'Code',
                purchase: 'Purchase',
                selling: 'Selling',
                profit: 'Profit',
                edit: 'Edit',
                delete: 'Delete',
                exportToCSV: 'Export to CSV',
                
                // Statistics
                totalItems: 'Total Items',
                totalCost: 'Total Cost',
                totalProfit: 'Total Profit',
                lowStockItems: 'Low Stock Items',
                
                // Bulk Operations
                importFromCSV: 'Import Parts from CSV File',
                importDescription: 'Import multiple parts at once using CSV file',
                clickToSelectCSV: 'Click to select CSV file',
                orDragAndDrop: 'Or drag and drop file here',
                downloadTemplate: 'Download Template',
                exportAll: 'Export All',
                importResults: 'Import Results',
                successfullyImported: 'Successfully imported',
                errors: 'Errors',
                clearResults: 'Clear Results',
                instructions: 'Instructions',
                instruction1: 'Download template file by clicking "Download Template" button',
                instruction2: 'Fill part information in CSV file',
                instruction3: 'Select file by clicking on gray area',
                instruction4: 'Parts will be imported automatically',
                note: 'Note: If part code already exists, it will update old data',
                
                // Invoice System
                createInvoice: 'Create Invoice',
                invoiceNumber: 'Invoice Number',
                newInvoice: 'New Invoice',
                save: 'Save',
                customerInformation: 'Customer Information',
                customerName: 'Customer Name',
                enterCustomerName: 'Enter customer name',
                date: 'Date',
                phoneNumber: 'Phone Number',
                phonePlaceholder: 'Phone number',
                addItemsToInvoice: 'Add Items to Invoice',
                searchFromStock: 'Search Items from Stock',
                searchItems: 'Search Items',
                searchByCodeOrName: 'Search by code or part name...',
                addFromStock: 'Add from Stock',
                addManualItem: 'Add Manual Item',
                itemName: 'Item Name',
                itemNamePlaceholder: 'Item name',
                price: 'Price',
                addManual: 'Add Manual',
                itemsInInvoice: 'Items in Invoice',
                no: 'No',
                description: 'Description',
                unitPrice: 'Unit Price',
                total: 'Total',
                actions: 'Actions',
                type: 'Type',
                subtotal: 'Subtotal',
                grandTotal: 'Grand Total',
                print: 'Print',
                saveAsImage: 'Save as Image',
                saveAsPDF: 'Save as PDF',
                clearInvoice: 'Clear Invoice',
                invoiceEmpty: 'Invoice is empty. Please add items from above!',
                invoiceHistory: 'Invoice History',
                unknownCustomer: 'Unknown Customer',
                view: 'View',
                thankYou: 'Thank you for your purchase!',
                contactUs: 'Please contact us directly if there are any issues with the invoice.',
                customer: 'Customer',
                phone: 'Phone',
                
                // Modals
                duplicateCode: 'Part Code',
                duplicatePrompt: 'Do you want to add as new item or edit existing item?',
                addNew: 'Add New',
                editExisting: 'Edit Existing',
                cancel: 'Cancel',
                editPart: 'Edit Part',
                saveChanges: 'Save Changes',
                qrCodeFor: 'QR Code for',
                car: 'Car',
                download: 'Download',
                close: 'Close',
                
                // Alerts & Messages
                model: 'Model',
                year: 'Year',
                stock: 'Stock'
            },
            km: {
                // App & Header
                appTitle: 'កម្មវិធីគ្រប់គ្រងគ្រឿងឡាន',
                lightMode: '☀️ ផ្ទាំងភ្លឺ',
                darkMode: '🌙 ផ្ទាំងងងឹត',
                installApp: 'ដំឡើងកម្មវិធី',
                
                // Tabs
                addPart: 'បន្ថែមគ្រឿង',
                stock: 'ស្តុកគ្រឿង',
                statistics: 'ស្ថិតិ',
                importExport: 'នាំចូល/ចេញ',
                invoice: 'វិក័យប័ត្រ',
                
                // Form Labels
                company: 'ក្រុមហ៊ុន',
                enterCompany: 'បញ្ចូលឈ្មោះក្រុមហ៊ុន',
                partCode: 'កូដគ្រឿង',
                enterPartCode: 'បញ្ចូលកូដគ្រឿង',
                partName: 'ឈ្មោះគ្រឿង',
                enterPartName: 'បញ្ចូលឈ្មោះគ្រឿង',
                carModel: 'ម៉ូដែលឡាន',
                enterCarModel: 'បញ្ចូលម៉ូដែលឡាន',
                modelYear: 'ឆ្នាំម៉ូដែល',
                enterModelYear: 'បញ្ចូលឆ្នាំម៉ូដែល',
                quantity: 'ចំនួន',
                purchasePrice: 'តម្លៃទិញ',
                sellingPrice: 'តម្លៃលក់',
                savePart: 'រក្សាទុកគ្រឿង',
                
                // Stock Tab
                searchParts: 'ស្វែងរកគ្រឿង...',
                allCompanies: 'គ្រប់ក្រុមហ៊ុន',
                allCarModels: 'គ្រប់ម៉ូដែលឡាន',
                allModelYears: 'គ្រប់ឆ្នាំម៉ូដែល',
                clearFilters: 'លុបតម្រង',
                showing: 'កំពុងបង្ហាញ',
                of: 'ក្នុងចំណោម',
                items: 'គ្រឿង',
                code: 'កូដ',
                purchase: 'ទិញ',
                selling: 'លក់',
                profit: 'ចំណេញ',
                edit: 'កែ',
                delete: 'លុប',
                exportToCSV: 'នាំចេញជា CSV',
                
                // Statistics
                totalItems: 'ទំនិញសរុប',
                totalCost: 'តម្លៃទិញសរុប',
                totalProfit: 'ប្រាក់ចំណេញសរុប',
                lowStockItems: 'គ្រឿងស្តុកទាប',
                
                // Bulk Operations
                importFromCSV: 'នាំចូលគ្រឿងពីឯកសារ CSV',
                importDescription: 'អាចនាំចូលគ្រឿងច្រើនក្នុងពេលតែមួយដោយប្រើឯកសារ CSV',
                clickToSelectCSV: 'ចុចដើម្បីជ្រើសរើសឯកសារ CSV',
                orDragAndDrop: 'ឬទាញឯកសារទម្លាក់នៅទីនេះ',
                downloadTemplate: 'ទាញយកគំរូ',
                exportAll: 'នាំចេញទាំងអស់',
                importResults: 'លទ្ធផលនាំចូល',
                successfullyImported: 'បានដាក់ចូលដោយជោគជ័យ',
                errors: 'មានកំហុស',
                clearResults: 'លុបលទ្ធផល',
                instructions: 'សេចក្តីណែនាំ',
                instruction1: 'ទាញយកឯកសារគំរូដោយចុចប៊ូតុង "ទាញយកគំរូ"',
                instruction2: 'បំពេញព័ត៌មានគ្រឿងទំនិញក្នុងឯកសារ CSV',
                instruction3: 'ជ្រើសរើសឯកសារដោយចុចត្រង់ផ្ទៃពណ៌ប្រផេះ',
                instruction4: 'គ្រឿងនឹងត្រូវបានដាក់ចូលដោយស្វ័យប្រវត្តិ',
                note: 'ព័ត៌មាន: ប្រសិនបើកូដគ្រឿងមានរួចហើយ វានឹងកែប្រែទិន្នន័យចាស់',
                
                // Invoice System
                createInvoice: 'បង្កើតវិក័យប័ត្រ',
                invoiceNumber: 'លេខវិក័យប័ត្រ',
                newInvoice: 'វិក័យប័ត្រថ្មី',
                save: 'រក្សាទុក',
                customerInformation: 'ព័ត៌មានអតិថិជន',
                customerName: 'ឈ្មោះអតិថិជន',
                enterCustomerName: 'បញ្ចូលឈ្មោះអតិថិជន',
                date: 'កាលបរិច្ឆេទ',
                phoneNumber: 'លេខទូរស័ព្ទ',
                phonePlaceholder: 'លេខទូរស័ព្ទ',
                addItemsToInvoice: 'បន្ថែមគ្រឿងក្នុងវិក័យប័ត្រ',
                searchFromStock: 'ស្វែងរកគ្រឿងពីស្តុក',
                searchItems: 'ស្វែងរកគ្រឿង',
                searchByCodeOrName: 'ស្វែងរកតាមកូដ ឬឈ្មោះគ្រឿង...',
                addFromStock: 'បន្ថែមពីស្តុក',
                addManualItem: 'បន្ថែមគ្រឿងដោយដៃ',
                itemName: 'ឈ្មោះគ្រឿង',
                itemNamePlaceholder: 'ឈ្មោះគ្រឿង',
                price: 'តម្លៃ',
                addManual: 'បន្ថែមដោយដៃ',
                itemsInInvoice: 'គ្រឿងក្នុងវិក័យប័ត្រ',
                no: 'ល',
                description: 'ពណ៌នា',
                unitPrice: 'តម្លៃឯកតា',
                total: 'សរុប',
                actions: 'សកម្មភាព',
                type: 'ប្រភេទ',
                subtotal: 'សរុបរង',
                grandTotal: 'សរុបរួម',
                print: 'បោះពុម្ព',
                saveAsImage: 'រក្សាទុកជារូបភាព',
                saveAsPDF: 'រក្សាទុកជា PDF',
                clearInvoice: 'លុបវិក័យប័ត្រ',
                invoiceEmpty: 'វិក័យប័ត្រទទេ។ សូមបន្ថែមគ្រឿងពីខាងលើ!',
                invoiceHistory: 'ប្រវត្តិវិក័យប័ត្រ',
                unknownCustomer: 'មិនស្គាល់អតិថិជន',
                view: 'មើល',
                thankYou: 'អរគុណសម្រាប់ការទិញឥវ៉ាន់!',
                contactUs: 'សូមទំនាក់ទំនងពួកយើងផ្ទាល់ប្រសិនបើមានបញ្ហាក្នុងវិក័យបត្រ។',
                customer: 'អតិថិជន',
                phone: 'ទូរស័ព្ទ',
                
                // Modals
                duplicateCode: 'កូដគ្រឿង',
                duplicatePrompt: 'តើអ្នកចង់បន្ថែមជាទំនិញថ្មី ឬកែប្រែទំនិញចាស់?',
                addNew: 'បន្ថែមថ្មី',
                editExisting: 'កែប្រែចាស់',
                cancel: 'បោះបង់',
                editPart: 'កែប្រែគ្រឿង',
                saveChanges: 'រក្សាទុក',
                qrCodeFor: 'QR Code សម្រាប់',
                car: 'ឡាន',
                download: 'ទាញយក',
                close: 'បិទ',
                
                // Alerts & Messages
                model: 'ម៉ូដែល',
                year: 'ឆ្នាំ',
                stock: 'ស្តុក'
            }
        };

        // Translation function
        const t = (key) => {
            return translations[currentLanguage.value]?.[key] || translations.en[key] || key;
        };

        // Change language function
        const changeLanguage = () => {
            localStorage.setItem('language', currentLanguage.value);
            // Update HTML lang attribute
            document.documentElement.lang = currentLanguage.value;
        };

        // ==================== REST OF YOUR ORIGINAL CODE ====================
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

        // ==================== INVOICE FUNCTIONS ====================
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
                alert(currentLanguage.value === 'km' ? 
                    'តម្លៃលក់ត្រូវតែធំជាង ឬស្មើតម្លៃទិញ' : 
                    'Selling price must be greater than purchase price');
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
            alert(currentLanguage.value === 'km' ? 'រក្សាទុកដោយជោគជ័យ!' : 'Saved successfully!');
        };

        const addAsNew = () => {
            inventory.value.push({ ...duplicateItem.value, id: nextId.value++ });
            saveToStorage();
            showDuplicateModal.value = false;
            duplicateItem.value = null;
            resetForm();
            alert(currentLanguage.value === 'km' ? 'បានបន្ថែមជាទំនិញថ្មីដោយជោគជ័យ!' : 'Added as new item successfully!');
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
                alert(currentLanguage.value === 'km' ? 
                    'តម្លៃលក់ត្រូវតែធំជាង ឬស្មើតម្លៃទិញ' : 
                    'Selling price must be greater than purchase price');
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
                alert(currentLanguage.value === 'km' ? 'កែប្រែដោយជោគជ័យ!' : 'Updated successfully!');
            }
        };

        const deleteItem = (id) => {
            if (confirm(currentLanguage.value === 'km' ? 
                'តើអ្នកប្រាកដជាចង់លុបគ្រឿងនេះទេ?' : 
                'Are you sure you want to delete this item?')) {
                inventory.value = inventory.value.filter(item => item.id !== id);
                saveToStorage();
            }
        };

        const exportToCSV = () => {
            const headers = currentLanguage.value === 'km' ? 
                ['ល.រ', 'ឈ្មោះគ្រឿង', 'ប្រភេទ', 'ម៉ូដែលឡាន', 'ឆ្នាំម៉ូដែល', 'តម្លៃទិញ', 'តម្លៃលក់', 'ចំនួន'] :
                ['No.', 'Part Name', 'Type', 'Car Model', 'Model Year', 'Purchase Price', 'Selling Price', 'Quantity'];
            
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
            a.download = currentLanguage.value === 'km' ? 'krom_krong_lan.csv' : 'auto_parts_inventory.csv';
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
                alert(currentLanguage.value === 'km' ? 
                    'QR Code library បរាជ័យក្នុងការផ្ទុក។ សូមធ្វើការ Refresh ។' : 
                    'QR Code library failed to load. Please refresh.');
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
                alert(currentLanguage.value === 'km' ? 'សូមបង្កើត QR ជាមុន!' : 'Generate QR first!');
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
                alert(currentLanguage.value === 'km' ? 'សូមបង្កើត QR ជាមុន!' : 'Generate QR first!');
                return;
            }
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert(currentLanguage.value === 'km' ? 'អនុញ្ញាតឱ្យបង្អួចលេចឡើងដើម្បីបោះពុម្ព។' : 'Allow popups to print.');
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
                        <p><strong>${t('partName')}:</strong> ${currentQRData.value.partName}</p>
                        <p><strong>${t('code')}:</strong> ${currentQRData.value.productCode}</p>
                        <p><strong>${t('car')}:</strong> ${currentQRData.value.carModel}</p>
                        <p><strong>${t('year')}:</strong> ${currentQRData.value.modelYear}</p>
                        <p><strong>${t('sellingPrice')}:</strong> $${currentQRData.value.sellPrice.toFixed(2)}</p>
                        <p><strong>${t('stock')}:</strong> ${currentQRData.value.quantity}</p>
                        <p><strong>${t('company')}:</strong> ${currentQRData.value.company}</p>
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
            a.download = currentLanguage.value === 'km' ? 'គំរូ_គ្រឿង_ឡាន.csv' : 'auto_parts_template.csv';
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
                        errors.push(`Line ${i}: ${currentLanguage.value === 'km' ? 'ខ្វះព័ត៌មានចាំបាច់' : 'Missing required fields'}`);
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
                alert(currentLanguage.value === 'km' ? 'សូមជ្រើសរើសគ្រឿងពីស្តុក!' : 'Please select an item from stock!');
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
                alert(currentLanguage.value === 'km' ? 'សូមបំពេញឈ្មោះ និងតម្លៃគ្រឿង!' : 'Please fill in item name and price!');
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
            if (confirm(currentLanguage.value === 'km' ? 
                'តើអ្នកចង់លុបគ្រឿងនេះពីវិក័យប័ត្រទេ?' : 
                'Are you sure you want to remove this item from the invoice?')) {
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
                alert(currentLanguage.value === 'km' ? 'សូមបំពេញឈ្មោះអតិថិជន!' : 'Please fill in customer name!');
                return;
            }
            
            if (invoice.value.items.length === 0) {
                alert(currentLanguage.value === 'km' ? 'សូមបន្ថែមគ្រឿងចូលក្នុងវិក័យប័ត្រ!' : 'Please add items to the invoice!');
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
            
            alert(currentLanguage.value === 'km' ? 'វិក័យប័ត្រត្រូវបានរក្សាទុកដោយជោគជ័យ!' : 'Invoice saved successfully!');
            createNewInvoice();
        };

        const viewInvoiceHistory = (historyInvoice) => {
            invoice.value = JSON.parse(JSON.stringify(historyInvoice));
            invoice.value.id = historyInvoice.id;
            activeTab.value = 'invoice';
        };

        const printInvoice = () => {
            if (!invoice.value.customerName.trim() || invoice.value.items.length === 0) {
                alert(currentLanguage.value === 'km' ? 
                    'សូមបំពេញព័ត៌មានអតិថិជន និងបន្ថែមគ្រឿងជាមុន!' : 
                    'Please fill in customer information and add items first!');
                return;
            }
            
            updateInvoiceTotal();
            
            const printWindow = window.open('', '_blank');
            const printContent = document.querySelector('.invoice-preview').innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${t('invoice')} ${invoice.value.invoiceNumber}</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', 'Khmer OS', sans-serif; padding: 20px; color: #000; }
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
            if (confirm(currentLanguage.value === 'km' ? 
                'តើអ្នកពិតជាចង់លុបវិក័យប័ត្រនេះពីប្រវត្តិទេ?' : 
                'Are you sure you want to delete this invoice from history?')) {
                invoiceHistory.value = invoiceHistory.value.filter(inv => inv.id !== invoiceId);
                localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory.value));
                alert(currentLanguage.value === 'km' ? 'វិក័យប័ត្រត្រូវបានលុបដោយជោគជ័យ!' : 'Invoice deleted successfully!');
            }
        };

        const saveInvoiceAsImage = () => {
            alert(currentLanguage.value === 'km' ? 
                'ដើម្បីរក្សាទុកជារូបភាព សូមប្រើឧបករណ៍បោះពុម្ព និងជ្រើសរើស "Save as PDF" ឬ "Save as Image"' : 
                'To save as image, please use the print function and select "Save as PDF" or "Save as Image"');
            printInvoice();
        };

        const saveInvoiceAsPDF = () => {
            alert(currentLanguage.value === 'km' ? 
                'ដើម្បីរក្សាទុកជា PDF សូមប្រើឧបករណ៍បោះពុម្ព និងជ្រើសរើស "Save as PDF"' : 
                'To save as PDF, please use the print function and select "Save as PDF"');
            printInvoice();
        };

        const clearInvoice = () => {
            if (confirm(currentLanguage.value === 'km' ? 
                'តើអ្នកពិតជាចង់លុបវិក័យប័ត្របច្ចុប្បន្នទេ? ទិន្នន័យនឹងត្រូវបាត់បង់។' : 
                'Are you sure you want to clear the current invoice? All data will be lost.')) {
                createNewInvoice();
            }
        };

        // ==================== MOUNTED ====================
        onMounted(() => {
            document.body.classList.toggle('light-mode', isLightMode.value);
            
            // Set initial language
            document.documentElement.lang = currentLanguage.value;
            
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
            // Language system
            currentLanguage,
            t,
            changeLanguage,
            
            // Original app state
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
