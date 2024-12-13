document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/items';
    const itemsTableBody = document.querySelector('#itemsTable tbody');
    const modal = document.querySelector('#modal');
    const addItemBtn = document.querySelector('#addItemBtn');
    const saveItemBtn = document.querySelector('#saveItemBtn');
    const cancelBtn = document.querySelector('#cancelBtn');
    const modalTitle = document.querySelector('#modalTitle');

    // Form inputs
    const nameInput = document.querySelector('#name');
    const descriptionInput = document.querySelector('#description');
    const quantityInput = document.querySelector('#quantity');

    let editMode = false;
    let currentItemId = null;

    // Detailed logging function
    function debugLog(message, data = null) {
        console.log(`[DEBUG] ${message}`);
        if (data) console.log(JSON.stringify(data, null, 2));
    }

    // Load items from backend
    const loadItems = async () => {
        try {
            debugLog('Loading items...');
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                debugLog('Failed to fetch items', {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const items = await response.json();
            debugLog('Items loaded successfully', items);
            renderItems(items);
        } catch (error) {
            debugLog('Error loading items', error);
            alert(`Failed to load items: ${error.message}`);
        }
    };

    // Render items in the table
    const renderItems = (items) => {
        debugLog('Rendering items', items);
        itemsTableBody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>
                    <button class="editBtn" data-id="${item._id}">Edit</button>
                    <button class="deleteBtn" data-id="${item._id}">Delete</button>
                </td>
            `;
            
            // Add event listeners to edit and delete buttons
            row.querySelector('.editBtn').addEventListener('click', () => {
                debugLog('Edit button clicked', item);
                openEditModal(item);
            });
            row.querySelector('.deleteBtn').addEventListener('click', () => {
                debugLog('Delete button clicked', item._id);
                deleteItem(item._id);
            });
            
            itemsTableBody.appendChild(row);
        });
    };

    // Open modal for adding or editing an item
    const openEditModal = (item = null) => {
        debugLog('Opening edit modal', item);
        if (item) {
            // Edit mode
            editMode = true;
            currentItemId = item._id;
            modalTitle.textContent = 'Edit Item';
            nameInput.value = item.name;
            descriptionInput.value = item.description;
            quantityInput.value = item.quantity;
        } else {
            // Add mode
            editMode = false;
            currentItemId = null;
            modalTitle.textContent = 'Add New Item';
            nameInput.value = '';
            descriptionInput.value = '';
            quantityInput.value = '';
        }
        modal.style.display = 'block';
    };

    // Save item (add or edit)
    const saveItem = async () => {
        // Validate inputs
        if (!nameInput.value.trim()) {
            alert('Name is required');
            return;
        }

        const itemData = {
            name: nameInput.value.trim(),
            description: descriptionInput.value.trim(),
            quantity: quantityInput.value.trim()
        };

        debugLog('Saving item', {
            editMode,
            currentItemId,
            itemData
        });

        try {
            let response;
            if (editMode && currentItemId) {
                // Edit existing item
                debugLog('Attempting to edit item');
                response = await fetch(`${apiUrl}/${currentItemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                });
            } else {
                // Add new item
                debugLog('Attempting to add new item');
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                });
            }

            debugLog('Response details', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorBody = await response.text();
                debugLog('Error response body', errorBody);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
            }

            const responseData = await response.json();
            debugLog('Response data', responseData);

            // Close modal and refresh items
            modal.style.display = 'none';
            loadItems();
        } catch (error) {
            debugLog('Error saving item', error);
            alert(`Failed to save item: ${error.message}`);
        }
    };

    // Delete item
    const deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            loadItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(`Failed to delete item: ${error.message}`);
        }
    };

    // Event Listeners
    addItemBtn.addEventListener('click', () => {
        debugLog('Add Item button clicked');
        openEditModal();
    });
    saveItemBtn.addEventListener('click', () => {
        debugLog('Save Item button clicked');
        saveItem();
    });
    cancelBtn.addEventListener('click', () => {
        debugLog('Cancel button clicked');
        modal.style.display = 'none';
    });

    // Initial load of items
    loadItems();
});