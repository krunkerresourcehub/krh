// Function to calculate statistics by category
function calculateClanStats() {
    const categories = {
        'Commanders': [],
        'Captains': [],
        'Soldiers': [],
        'Recruits': []
    };
    
    let currentCategory = null;
    let userLevel = null;
    let userRank = null;
    const currentUser = localStorage.getItem("krunker_username");
    
    // Loop through all elements to extract levels
    document.querySelectorAll('.scrollItem > div').forEach(element => {
        const text = element.textContent;
        
        // Detect category
        if (text.includes('Commanders')) currentCategory = 'Commanders';
        else if (text.includes('Captains')) currentCategory = 'Captains';
        else if (text.includes('Soldiers')) currentCategory = 'Soldiers';
        else if (text.includes('Recruits')) currentCategory = 'Recruits';
        
        // Extract level if we are in a category
        if (currentCategory && element.querySelector('.floatR')) {
            const levelText = element.querySelector('.floatR').textContent.trim();
            const level = parseInt(levelText);
            if (!isNaN(level)) {
                categories[currentCategory].push(level);
                
                // Check if this is the logged in user
                if (currentUser && text.includes(currentUser)) {
                    userLevel = level;
                    userRank = currentCategory;
                }
            }
        }
    });
    
    // Calculate averages
    const stats = {};
    for (const [category, levels] of Object.entries(categories)) {
        if (levels.length > 0) {
            const average = levels.reduce((a, b) => a + b, 0) / levels.length;
            stats[category] = {
                count: levels.length,
                average: Math.round(average * 10) / 10
            };
        }
    }
    
    return { stats, userLevel, userRank, currentUser };
}

// Function to create a new panel with statistics and chart
function addStatsPanel() {
    const { stats, userLevel, userRank, currentUser } = calculateClanStats();
    const statsPanel = document.querySelector('.clanStatH');
    
    if (statsPanel) {
        // Calculate global average
        let totalLevels = 0;
        let totalMembers = 0;
        
        Object.values(stats).forEach(stat => {
            totalLevels += stat.average * stat.count;
            totalMembers += stat.count;
        });
        
        const globalAverage = Math.round((totalLevels / totalMembers) * 10) / 10;
        
        // Create the new panel
        const newPanel = document.createElement('div');
        newPanel.className = 'clanStatH';
        newPanel.style.marginTop = '10px';
        newPanel.innerHTML = `
            <div style="color: rgba(255,255,255,.5); cursor: pointer;" class="statsToggleHeader">
                Average Level (Global)
                <span style="float:right;color: rgba(255,255,255,.5);">${globalAverage}</span>
                <span class="material-icons" style="float:right; margin-right: 10px; font-size: 18px;">expand_less</span>
            </div>
            <div class="statsContent">
                ${userLevel ? `
                <div style="color: rgba(2, 255, 255, 1); margin-top: 10px;">
                    Your Level (${currentUser})
                    <span style="float:right;color: rgba(2, 255, 255, 1);">${userLevel}</span>
                </div>
                ` : ''}
                <div style="margin-top: 15px; padding: 10px;">
                    <canvas id="clanLevelChart" style="max-height: 250px;"></canvas>
                </div>
            </div>
        `;
        
        // Insert the new panel after the existing panel
        statsPanel.parentNode.insertBefore(newPanel, statsPanel.nextSibling);
        
        // Add event handler for toggle
        const toggleHeader = newPanel.querySelector('.statsToggleHeader');
        const statsContent = newPanel.querySelector('.statsContent');
        const toggleIcon = toggleHeader.querySelector('.material-icons');
        
        toggleHeader.addEventListener('click', function() {
            if (statsContent.style.display === 'none') {
                statsContent.style.display = 'block';
                toggleIcon.textContent = 'expand_less';
            } else {
                statsContent.style.display = 'none';
                toggleIcon.textContent = 'expand_more';
            }
        });
        
        // Create the chart
        createChart(stats, userLevel, userRank);
        
        console.log('Nouveau panneau de statistiques créé:', stats);
        console.log('Moyenne globale:', globalAverage);
        console.log('Utilisateur:', currentUser, 'Niveau:', userLevel, 'Rang:', userRank);
    } else {
        console.error('Panneau de statistiques non trouvé');
    }
}

// Function to create the Chart.js chart
function createChart(stats, userLevel, userRank) {
    const ctx = document.getElementById('clanLevelChart');
    
    if (!ctx) {
        console.error('Canvas non trouvé');
        return;
    }
    
   // Prepare data for the chart
    const labels = ['Commanders', 'Captains', 'Soldiers', 'Recruits'];
    const data = labels.map(label => stats[label]?.average || 0);
    
    // Prepare datasets
    const datasets = [{
        label: 'Average Level by Rank',
        data: data,
        borderColor: 'rgba(64, 196, 255, 1)',
        backgroundColor: 'rgba(64, 196, 255, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(64, 196, 255, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
    }];
    
    // Add user point if available
    if (userLevel && userRank) {
        const userDataPoint = labels.map(label => label === userRank ? userLevel : null);
        
        datasets.push({
            label: 'Your Level',
            data: userDataPoint,
            borderColor: ' rgba(2, 255, 255, 1)',
            backgroundColor: 'r rgba(2, 255, 255, 1)',
            pointBackgroundColor: ' rgba(2, 255, 255, 1)',
            pointBorderColor: ' rgba(2, 255, 255, 1)',
            pointBorderWidth: 3,
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false,
            pointStyle: 'cross'
        });
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'rgba(255, 255, 255, 1)',
                    bodyColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(64, 196, 255, 1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Your Level') {
                                return 'Your Level: ' + context.parsed.y;
                            }
                            return 'Avg Level: ' + context.parsed.y.toFixed(1);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Level',
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Rank',
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Execute the script
addStatsPanel();
