// Wait for the DOM to be loaded before loading Chart.js
(function() {
    'use strict';

    let chartInstance = null;
    let playerCount = 10; // Default value

    // Function to load Chart.js
    function loadChartJS() {
        if (typeof Chart !== 'undefined') {
            console.log('Chart.js already loaded');
            initScoreChart();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = function() {
            console.log('Chart.js loaded successfully');
            initScoreChart();
        };
        script.onerror = function() {
            console.error('Failed to load Chart.js');
        };

        // Wait for head to be available
        if (document.head) {
            document.head.appendChild(script);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                document.head.appendChild(script);
            });
        }
    }

    // Function to extract leaderboard data
    function extractLeaderboardData() {
        const entries = document.querySelectorAll('#clanErr .settName');
        const data = [];

        entries.forEach((entry) => {
            // Extract username
            const link = entry.querySelector('a');
            const username = link ? link.textContent.trim() : 'Unknown';

            // Extract score
            const scoreDiv = entry.querySelector('div[style*="float:right"]');
            const scoreText = scoreDiv ? scoreDiv.textContent.trim() : '0';
            const score = parseInt(scoreText.replace(/,/g, '')) || 0;

            if (username !== 'Unknown' && score > 0) {
                data.push({ username, score });
            }
        });

        return data;
    }

    // Function to create player count selector dropdown
    function createPlayerCountSelector() {
        const setHed = document.querySelector("#clanErr > div.setHed");
        if (!setHed) return;

        // Remove old selector if it exists
        const existingSelector = document.getElementById('playerCountSelectorContainer');
        if (existingSelector) {
            existingSelector.remove();
        }

        // Create container for selector
        const container = document.createElement('div');
        container.id = 'playerCountSelectorContainer';
        container.style.cssText = 'padding: 10px; margin-top: 10px; background: rgba(0,0,0,0.2); border-radius: 4px; display: flex; align-items: center; gap: 10px;';

        // Create label
        const label = document.createElement('span');
        label.textContent = 'Number of players to display:';
        label.style.color = 'rgba(255, 255, 255, 0.9)';
        label.style.fontSize = '14px';
        container.appendChild(label);

        // Create selector dropdown
        const selector = document.createElement('select');
        selector.id = 'playerCountSelector';
        selector.style.cssText = 'padding: 5px; border-radius: 4px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.3);';

        // Add options
        [5, 10, 15, 20, 25, 50].forEach(count => {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = count;
            if (count === playerCount) {
                option.selected = true;
            }
            selector.appendChild(option);
        });

        container.appendChild(selector);

        // Insert container after .setHed
        setHed.insertAdjacentElement('afterend', container);

        // Add change event listener
        selector.addEventListener('change', function() {
            playerCount = parseInt(this.value);
            createScoreChart();
        });
    }

    // Function to create the chart
    function createScoreChart() {
        const setHed = document.querySelector("#clanErr > div.setHed");
        if (!setHed) {
            console.log('Element setHed not found');
            return;
        }

        // Create player count selector
        createPlayerCountSelector();

        // Remove old chart if it exists
        const existingContainer = document.getElementById('scoreChartContainer');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Destroy old chart instance
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const allData = extractLeaderboardData();
        if (allData.length === 0) {
            console.log('No leaderboard data found');
            return;
        }

        // Sort data by descending score
        allData.sort((a, b) => b.score - a.score);

        // Limit data to selected player count
        const data = allData.slice(0, playerCount);

        console.log('Creating chart with data:', data);

        // Create container for chart
        const container = document.createElement('div');
        container.id = 'scoreChartContainer';
        container.style.cssText = 'padding: 20px; margin-top: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;';

        // Create canvas for chart
        const canvas = document.createElement('canvas');
        canvas.id = 'scoreChart';
        canvas.style.height = '400px';
        container.appendChild(canvas);

        // Insert container after selector or after .setHed
        const selectorContainer = document.getElementById('playerCountSelectorContainer');
        if (selectorContainer) {
            selectorContainer.insertAdjacentElement('afterend', container);
        } else {
            setHed.insertAdjacentElement('afterend', container);
        }

        // Prepare data for Chart.js
        const labels = data.map(item => item.username);
        const scores = data.map(item => item.score);

        // Create chart
        const ctx = canvas.getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score (Last 7 Days)',
                    data: scores,
                    backgroundColor: [
                        'rgba(251, 192, 45, 0.8)',
                        'rgba(251, 192, 45, 0.7)',
                        'rgba(64, 196, 255, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(255, 87, 34, 0.8)',
                        'rgba(233, 30, 99, 0.8)',
                        'rgba(63, 81, 181, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(0, 188, 212, 0.8)',
                        'rgba(121, 85, 72, 0.8)',
                        'rgba(96, 125, 139, 0.8)',
                        'rgba(176, 190, 197, 0.8)',
                        'rgba(188, 170, 164, 0.8)',
                        'rgba(109, 76, 65, 0.8)',
                        'rgba(38, 50, 56, 0.8)',
                        'rgba(27, 94, 32, 0.8)',
                        'rgba(139, 195, 74, 0.8)',
                        'rgba(205, 220, 57, 0.8)',
                        'rgba(255, 235, 59, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(255, 87, 34, 0.8)',
                        'rgba(121, 85, 72, 0.8)',
                        'rgba(158, 158, 158, 0.8)'
                    ].slice(0, data.length),
                    borderColor: [
                        'rgba(251, 192, 45, 1)',
                        'rgba(251, 192, 45, 1)',
                        'rgba(64, 196, 255, 1)',
                        'rgba(76, 175, 80, 1)',
                        'rgba(156, 39, 176, 1)',
                        'rgba(255, 87, 34, 1)',
                        'rgba(233, 30, 99, 1)',
                        'rgba(63, 81, 181, 1)',
                        'rgba(255, 152, 0, 1)',
                        'rgba(0, 188, 212, 1)',
                        'rgba(121, 85, 72, 1)',
                        'rgba(96, 125, 139, 1)',
                        'rgba(176, 190, 197, 1)',
                        'rgba(188, 170, 164, 1)',
                        'rgba(109, 76, 65, 1)',
                        'rgba(38, 50, 56, 1)',
                        'rgba(27, 94, 32, 1)',
                        'rgba(139, 195, 74, 1)',
                        'rgba(205, 220, 57, 1)',
                        'rgba(255, 235, 59, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(255, 152, 0, 1)',
                        'rgba(255, 87, 34, 1)',
                        'rgba(121, 85, 72, 1)',
                        'rgba(158, 158, 158, 1)'
                    ].slice(0, data.length),
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'rgba(255, 255, 255, 1)',
                        bodyColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(251, 192, 45, 1)',
                        borderWidth: 2,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return 'Score: ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('Chart created successfully');
    }

    // Wait for windows to be defined and intercept switchTab
    function initScoreChart() {
        function waitForWindows() {
            if (typeof windows !== 'undefined' && windows[12]) {
                console.log('windows[12] found, intercepting switchTab');
                interceptSwitchTab();
            } else {
                console.log('Waiting for windows[12]...');
                setTimeout(waitForWindows, 500);
            }
        }

        function interceptSwitchTab() {
            const originalSwitchTab = windows[12].switchTab;

            windows[12].switchTab = function(tabIndex) {
                console.log('switchTab called with index:', tabIndex);

                // Call original function
                const result = originalSwitchTab.apply(this, arguments);

                // If tab 2 is selected, create chart
                if (tabIndex === 2) {
                    console.log('Tab 2 selected, creating chart...');
                    setTimeout(() => {
                        createScoreChart();
                    }, 300);
                }

                return result;
            };

            console.log('switchTab intercepted successfully');
        }

        waitForWindows();
    }

    // Start loading
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadChartJS);
    } else {
        loadChartJS();
    }

})();
