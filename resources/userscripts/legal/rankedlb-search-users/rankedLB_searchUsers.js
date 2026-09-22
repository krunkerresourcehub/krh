const originalFetch = window.fetch;
window.fetch = function (...args) {
    let url = args[0];

    if (typeof url === 'string' && url.includes('api.krunker.io/leaderboards/rankings/season')) {
        console.log('Krunker API request detected!');

        // Modify limit=50 to limit=1000
        if (url.includes('limit=50')) {
            args[0] = url.replace('limit=50', 'limit=1000');
            console.log('Limit modified from 50 to 1000');
        }

        // Intercept response
        return originalFetch.apply(this, args).then(response => {
            const clonedResponse = response.clone();

            clonedResponse.json().then(data => {
                console.log('Data received:', data);

                // Remove existing search bar if it exists
                const existingSearchBar = document.querySelector('.krunker-search-container');
                if (existingSearchBar) {
                    console.log('Removing existing search bar');
                    existingSearchBar.remove();
                }

                setupSearchBar();
            });

            return response;
        });
    }

    return originalFetch.apply(this, args);
};

// Function to create and configure the search bar
function setupSearchBar() {
    // Check if search bar already exists
    if (document.querySelector('.krunker-search-container')) {
        console.log('Search bar already exists, removing it');
        document.querySelector('.krunker-search-container').remove();
    }

    // Create container for input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'krunker-search-container';
    searchContainer.style.cssText = `
        position: relative;
        display: inline-flex;
        align-items: center;
        margin: 0 15px;
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search players...';
    searchInput.className = 'krunker-search-input';
    searchInput.style.cssText = `
        padding: 10px 16px 10px 40px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.3);
        color: #ffffff;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        outline: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 220px;
        backdrop-filter: blur(10px);
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    `;

    searchContainer.appendChild(searchInput);

    // Events for styling
    searchInput.addEventListener('focus', () => {
        searchInput.style.background = 'rgba(0, 0, 0, 0.4)';
        searchInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        searchInput.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.05)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.background = 'rgba(0, 0, 0, 0.3)';
        searchInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        searchInput.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3)';
    });

    // Add CSS style
    if (!document.querySelector('#krunker-search-style')) {
        const style = document.createElement('style');
        style.id = 'krunker-search-style';
        style.textContent = `
            .krunker-search-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }
        `;
        document.head.appendChild(style);
    }

    // Insert search bar
    const regionIndicator = document.querySelector('.region-indicator.svelte-mqcul7');
    if (regionIndicator) {
        regionIndicator.parentNode.insertBefore(searchContainer, regionIndicator);
        console.log('Search bar added!');

        // Configure search functionality
        setupSearchFunctionality(searchInput);
    } else {
        console.log('Region indicator not found, retrying...');
        setTimeout(() => setupSearchBar(), 500);
    }
}

// Function for search and filtering
function setupSearchFunctionality(searchInput) {
    const dataTable = document.querySelector('.data-table.svelte-1enb567 tbody');
    if (!dataTable) {
        console.log('Table not found yet, retrying...');
        setTimeout(() => setupSearchFunctionality(searchInput), 500);
        return;
    }

    const allRows = Array.from(dataTable.querySelectorAll('tr'));
    const originalNames = allRows.map(row => {
        const nameCell = row.querySelector('.name-cell a');
        return nameCell ? nameCell.textContent : '';
    });

    function filterRows(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        allRows.forEach((row, index) => {
            const nameCell = row.querySelector('.name-cell a');
            if (!nameCell) return;

            const playerName = originalNames[index];
            const playerNameLower = playerName.toLowerCase();

            if (term === '' || playerNameLower.includes(term)) {
                row.style.display = '';
                visibleCount++;

                // Highlight found text
                if (term !== '') {
                    const startIndex = playerNameLower.indexOf(term);
                    const endIndex = startIndex + term.length;
                    const before = playerName.substring(0, startIndex);
                    const match = playerName.substring(startIndex, endIndex);
                    const after = playerName.substring(endIndex);

                    nameCell.innerHTML = `${before}<span style="background: rgba(255, 215, 0, 0.3); color: #FFD700; font-weight: 600; padding: 2px 4px; border-radius: 3px;">${match}</span>${after}`;
                } else {
                    nameCell.textContent = playerName;
                }
            } else {
                row.style.display = 'none';
            }
        });

        // Handle "no results" message
        const oldNoResults = dataTable.querySelector('.no-results-row');
        if (oldNoResults) oldNoResults.remove();

        if (visibleCount === 0 && term !== '') {
            const noResultsRow = document.createElement('tr');
            noResultsRow.className = 'no-results-row';
            noResultsRow.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.5); font-size: 16px;">
                    No players found matching "<span style="color: #FFD700">${searchTerm}</span>"
                </td>
            `;
            dataTable.appendChild(noResultsRow);
        }

        console.log(`Search: "${searchTerm}" - ${visibleCount} results found`);
    }

    // Event listeners for search
    searchInput.addEventListener('input', (e) => filterRows(e.target.value));

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterRows('');
            searchInput.blur();
        }
    });

    console.log('Search functionality activated!');
}

// Observer to detect page changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            const dataTable = document.querySelector('.data-table.svelte-1enb567 tbody');
            const searchInput = document.querySelector('.krunker-search-input');

            if (dataTable && searchInput) {
                // Reset search when data changes
                setupSearchFunctionality(searchInput);
            }
        }
    });
});

// Observe content changes
const targetNode = document.querySelector('.content.svelte-mqcul7');
if (targetNode) {
    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });
}

console.log(`[LombreScripts] [ranked_leaderboard.js] Configuration loaded`);
