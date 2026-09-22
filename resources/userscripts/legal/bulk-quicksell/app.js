(function() {
    // Add checkboxes to each item card
    function addCheckboxesToItems() {
        const marketCards = document.querySelectorAll('.marketCard');
        
        marketCards.forEach(card => {
            if (!card.querySelector('.item-checkbox')) {
                const cardActions = card.querySelector('.cardActions');
                
                if (cardActions) {
                    // Create checkbox container
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.className = 'checkbox-container';
                    checkboxContainer.style.cssText = `
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 8px 12px;
                        margin: 5px;
                        position: relative;
                        z-index: 1000;
                        background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(25, 118, 210, 0.15));
                        border: 2px solid rgba(33, 150, 243, 0.4);
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        min-height: 32px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    `;
                    
                    // Hover effects for container
                    checkboxContainer.onmouseover = () => {
                        checkboxContainer.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.25), rgba(25, 118, 210, 0.25))';
                        checkboxContainer.style.borderColor = '#2196F3';
                        checkboxContainer.style.transform = 'translateY(-1px)';
                        checkboxContainer.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)';
                    };
                    
                    checkboxContainer.onmouseout = () => {
                        const checkbox = checkboxContainer.querySelector('.item-checkbox');
                        if (checkbox && checkbox.checked) {
                            checkboxContainer.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.25), rgba(56, 142, 60, 0.25))';
                            checkboxContainer.style.borderColor = '#4CAF50';
                        } else {
                            checkboxContainer.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(25, 118, 210, 0.15))';
                            checkboxContainer.style.borderColor = 'rgba(33, 150, 243, 0.4)';
                        }
                        checkboxContainer.style.transform = 'translateY(0)';
                        checkboxContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    };
                    
                    // Create functional checkbox
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'item-checkbox';
                    checkbox.style.cssText = `
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                        accent-color: #4CAF50;
                        margin-right: 8px;
                        position: relative;
                        z-index: 1001;
                        pointer-events: auto;
                    `;
                    
                    // Create label
                    const label = document.createElement('span');
                    label.className = 'select-label';
                    label.textContent = 'SELECT';
                    label.style.cssText = `
                        color: #2196F3;
                        font-size: 12px;
                        cursor: pointer;
                        user-select: none;
                        position: relative;
                        z-index: 1001;
                        pointer-events: auto;
                        font-family: 'Roboto', sans-serif;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: color 0.2s ease;
                    `;
                    
                    // Update appearance based on state
                    const updateAppearance = () => {
                        if (checkbox.checked) {
                            checkboxContainer.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.25), rgba(56, 142, 60, 0.25))';
                            checkboxContainer.style.borderColor = '#4CAF50';
                            label.textContent = 'SELECTED';
                            label.style.color = '#4CAF50';
                            checkbox.style.accentColor = '#4CAF50';
                        } else {
                            checkboxContainer.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(25, 118, 210, 0.15))';
                            checkboxContainer.style.borderColor = 'rgba(33, 150, 243, 0.4)';
                            label.textContent = 'SELECT';
                            label.style.color = '#2196F3';
                            checkbox.style.accentColor = '#2196F3';
                        }
                    };
                    
                    // Event for entire container - expanded click area
                    checkboxContainer.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        checkbox.checked = !checkbox.checked;
                        updateAppearance();
                        updateSelectedCount();
                        
                        // Immediate visual click effect
                        checkboxContainer.style.transform = 'scale(0.95)';
                        requestAnimationFrame(() => {
                            checkboxContainer.style.transform = 'scale(1)';
                        });
                    };
                    
                    // Events for checkbox
                    checkbox.onclick = (e) => {
                        e.stopPropagation();
                    };
                    
                    checkbox.onchange = () => {
                        updateAppearance();
                        updateSelectedCount();
                    };
                    
                    // Event for label
                    label.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    };
                    
                    // Initial assembly
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(label);
                    
                    updateAppearance();
                    
                    cardActions.style.position = 'relative';
                    cardActions.style.zIndex = '999';
                    
                    cardActions.parentNode.insertBefore(checkboxContainer, cardActions);
                }
            }
        });
    }

    // Extract item ID from a card
    function getItemIdFromCard(card) {
        const quickSellButton = card.querySelector('[onclick*="quickSell"]');
        if (quickSellButton) {
            const onclick = quickSellButton.getAttribute('onclick');
            const match = onclick.match(/quickSell\((\d+),/);
            return match ? parseInt(match[1]) : null;
        }
        return null;
    }

    // Main function to sell all selected items
    function sellSelectedItems() {
        const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            alert('No items selected! Please select items first.');
            return;
        }

        const itemIds = [];
        selectedCheckboxes.forEach(checkbox => {
            const card = checkbox.closest('.marketCard');
            const itemId = getItemIdFromCard(card);
            if (itemId) {
                itemIds.push(itemId);
            }
        });

        if (itemIds.length === 0) {
            alert('Could not retrieve item IDs! Please try again.');
            return;
        }

        const confirmMessage = `Are you sure you want to sell ${itemIds.length} item(s)?\n\nThis action cannot be undone!`;
        if (!confirm(confirmMessage)) {
            return;
        }

        console.log(`Starting to sell ${itemIds.length} items...`);
        
        let currentIndex = 0;

        function sellNextItem() {
            if (currentIndex >= itemIds.length) {
                console.log('All items sold successfully!');
                alert("All items sold! You probably need to reload the page to see updated inventory.");
                
                // Uncheck all checkboxes
                document.querySelectorAll('.item-checkbox:checked').forEach(cb => {
                    cb.checked = false;
                    const container = cb.closest('.checkbox-container');
                    if (container) {
                        const label = container.querySelector('.select-label');
                        container.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(25, 118, 210, 0.15))';
                        container.style.borderColor = 'rgba(33, 150, 243, 0.4)';
                        label.textContent = 'SELECT';
                        label.style.color = '#2196F3';
                    }
                });
                updateSelectedCount();
                return;
            }

            const itemId = itemIds[currentIndex];
            console.log(`Selling item ${currentIndex + 1}/${itemIds.length} (ID: ${itemId})`);

            // Execute quickSell
            quickSell(itemId, 1, 84);

            // Wait for popup and select "All"
            setTimeout(() => {
                const selectElement = document.querySelector("#quickSellSelect");
                if (selectElement) {
                    const allOption = document.querySelector("#quickSellSelect > option:nth-child(3)");
                    if (allOption) {
                        selectElement.value = allOption.value;
                        console.log(`Selected "All" option for item ${itemId}`);
                        
                        // Click confirmation button
                        setTimeout(() => {
                            const confirmButton = document.querySelector("#quickSellBtn");
                            if (confirmButton) {
                                confirmButton.click();
                                console.log(`Confirmed sale for item ${itemId}`);
                                
                                // Execute showPopup() after sale
                                setTimeout(() => {
                                    if (typeof showPopup === 'function') {
                                        showPopup();
                                        console.log(`Refreshed UI after selling item ${itemId}`);
                                    } else {
                                        console.warn('showPopup function not found');
                                    }
                                    
                                    // Move to next item
                                    currentIndex++;
                                    setTimeout(sellNextItem, 200);
                                }, 200);
                            } else {
                                console.error(`Confirmation button not found for item ${itemId}`);
                                currentIndex++;
                                setTimeout(sellNextItem, 100);
                            }
                        }, 200);
                    } else {
                        console.error(`"All" option not found for item ${itemId}`);
                        currentIndex++;
                        setTimeout(sellNextItem, 100);
                    }
                } else {
                    console.error(`quickSellSelect not found for item ${itemId}`);
                    currentIndex++;
                    setTimeout(sellNextItem, 200);
                }
            }, 200);
        }

        // Start selling
        sellNextItem();
    }

    // Make element draggable
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let isDragging = false;
        
        // Create drag handle (title bar)
        const dragHandle = element.querySelector('h3');
        dragHandle.style.cursor = 'move';
        dragHandle.style.userSelect = 'none';
        
        dragHandle.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            isDragging = true;
            
            // Add dragging visual feedback
            element.style.opacity = '0.8';
            element.style.transform = 'scale(1.02)';
            element.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.7)';
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Calculate new position
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;
            
            // Keep panel within viewport bounds
            const rect = element.getBoundingClientRect();
            const maxTop = window.innerHeight - rect.height;
            const maxLeft = window.innerWidth - rect.width;
            
            newTop = Math.max(0, Math.min(newTop, maxTop));
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.right = 'auto';
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            isDragging = false;
            
            // Remove dragging visual feedback
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            element.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
            
            // Save position to localStorage
            localStorage.setItem('quickSellPanelLeft', element.style.left);
            localStorage.setItem('quickSellPanelTop', element.style.top);
        }
    }

    // Create control panel
    function createControlPanel() {
        if (document.querySelector('#quickSellPanel')) return;

        const panel = document.createElement('div');
        panel.id = 'quickSellPanel';
        
        // Get saved position from localStorage or use default
        const savedLeft = localStorage.getItem('quickSellPanelLeft');
        const savedTop = localStorage.getItem('quickSellPanelTop');
        
        panel.style.cssText = `
            position: fixed;
            top: ${savedTop || '20px'};
            ${savedLeft ? `left: ${savedLeft};` : 'right: 20px;'}
            background: linear-gradient(135deg, rgba(30, 34, 42, 0.95), rgba(25, 29, 35, 0.95));
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            width: 280px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(33, 150, 243, 0.3);
            transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Quick Sell Panel ↔️';
        title.style.cssText = `
            color: #2196F3;
            margin: 0 0 15px 0;
            font-size: 16px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: move;
            user-select: none;
            padding: 5px;
            border-radius: 5px;
            transition: background 0.2s ease;
        `;
        
        // Add hover effect to title to indicate it's draggable
        title.onmouseover = () => {
            title.style.background = 'rgba(33, 150, 243, 0.1)';
        };
        title.onmouseout = () => {
            title.style.background = 'transparent';
        };

        const selectedCountDiv = document.createElement('div');
        selectedCountDiv.id = 'selectedCount';
        selectedCountDiv.textContent = 'Selected items: 0';
        selectedCountDiv.style.cssText = `
            color: #4CAF50;
            margin-bottom: 15px;
            font-size: 14px;
            text-align: center;
            font-weight: 600;
        `;

        const sellButton = document.createElement('button');
        sellButton.textContent = 'SELL ALL SELECTED ITEMS';
        sellButton.style.cssText = `
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
        `;
        sellButton.onmouseover = () => sellButton.style.background = 'linear-gradient(135deg, #d32f2f, #c62828)';
        sellButton.onmouseout = () => sellButton.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
        sellButton.onclick = sellSelectedItems;

        const selectAllButton = document.createElement('button');
        selectAllButton.textContent = 'SELECT ALL';
        selectAllButton.style.cssText = `
            width: 100%;
            padding: 10px;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        `;
        selectAllButton.onmouseover = () => selectAllButton.style.background = 'linear-gradient(135deg, #1976D2, #1565C0)';
        selectAllButton.onmouseout = () => selectAllButton.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        selectAllButton.onclick = () => {
            const checkboxes = document.querySelectorAll('.item-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
                const container = cb.closest('.checkbox-container');
                const label = container.querySelector('.select-label');
                if (container && label) {
                    if (cb.checked) {
                        container.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.25), rgba(56, 142, 60, 0.25))';
                        container.style.borderColor = '#4CAF50';
                        label.textContent = 'SELECTED';
                        label.style.color = '#4CAF50';
                    } else {
                        container.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(25, 118, 210, 0.15))';
                        container.style.borderColor = 'rgba(33, 150, 243, 0.4)';
                        label.textContent = 'SELECT';
                        label.style.color = '#2196F3';
                    }
                }
            });
            updateSelectedCount();
            
            selectAllButton.textContent = allChecked ? 'SELECT ALL' : 'DESELECT ALL';
        };

        panel.appendChild(title);
        panel.appendChild(selectedCountDiv);
        panel.appendChild(sellButton);
        panel.appendChild(selectAllButton);

        document.body.appendChild(panel);
        
        // Make the panel draggable
        makeDraggable(panel);
    }

    // Update selected items counter
    function updateSelectedCount() {
        const count = document.querySelectorAll('.item-checkbox:checked').length;
        const countDiv = document.querySelector('#selectedCount');
        if (countDiv) {
            countDiv.textContent = `Selected items: ${count}`;
        }
    }

    // Initialize
    addCheckboxesToItems();
    createControlPanel();
    
    // Observer to add checkboxes to new elements
    const observer = new MutationObserver(() => {
        addCheckboxesToItems();
    });
    
    const marketList = document.getElementById('marketList');
    if (marketList) {
        observer.observe(marketList, { childList: true, subtree: true });
    }
    console.log('Select your items and click "SELL ALL SELECTED ITEMS" to begin.');
})();
