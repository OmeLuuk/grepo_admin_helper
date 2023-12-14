// Define population cost for each unit type
const unitPopulationCosts = {
    "militia": 0,
    "sword": 1,
    "slinger": 1,
    "hoplite": 1,
    "archer": 1,
    "rider": 3,
    "chariot": 4,
    "catapult": 15,
    "hero": 0,
    "big transporter": 7,
    "bireme": 8,
    "attack ship": 10,
    "demolition ship": 8,
    "small transporter": 5,
    "trireme": 16,
    "colonize ship": 170,
    "godsent": 3,
    "minotaur": 30,
    "manticore": 45,
    "zyklop": 40,
    "harpy": 14,
    "medusa": 18,
    "centaur": 12,
    "pegasus": 20,
    "cerberus": 30,
    "fury": 55,
    "sea monster": 50,
    "griffin": 38,
    "calydonian_boar": 20,
    "siren": 16,
    "satyr": 16,
    "ladon": 180,
    "spartoi": 10
};

const popup = document.createElement('div');

let isPopupFolded = false;
let originalPopupHeight = '90vh'; // Default height
let currentMinAttacks = 3; // Default filter value

let firstRow = true;

let spamSummary = {}; // Outer dictionary keyed on date

function createAttackSummary() {
    return {
        arrivedAttacks: 0,
        averagePopulationArrivedAttacks: 0,
        nonArrivedAttacks: 0,
        hoursArrived: new Set(), // Using Set instead of Array
        hoursNotArrived: new Set() // Using Set instead of Array
    };
}

    
if (window.location.href.includes("grepolis.com/admin/commands")) {
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.right = '20px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '10px';
    popup.style.zIndex = '1000'; // Make sure it's on top of other elements
    popup.textContent = 'Hello World';

    // Append the popup to the body
    document.body.appendChild(popup);
}

let attackTableIndex = 12;

console.log("Content script loaded");

if (window.location.href.includes("grepolis.com/admin/commands")) {
    console.log("URL matches pattern");

    let tables = document.getElementsByTagName('table');
    console.log("Number of tables found:", tables.length);
    console.log("Loading table number", attackTableIndex);
    if (tables.length > 1) {
        let table = tables[attackTableIndex]; // Select the targeted table
        let data = processTable(table);
        managePopupDisplay(data);
    }
}


function processTable(table) {
    let rows = table.rows;
    let spamSummary = {};
    let totalAttacks = 0;
    let totalArrivedAttacks = 0;

    for (let i = 1; i < rows.length; i += 2) { // Skipping empty rows and header
        let cells = rows[i].cells;

        if (cells[1].textContent.trim().toLowerCase().startsWith("attack")) {
            let date = cells[8].textContent.trim().split(' ')[0]; // Extract date from Arrival
            let toPlayer = cells[5].textContent.trim();
            let arrived = cells[13].textContent.trim() === "Yes";
            let population = calculatePopulation(rows[i + 1]);
            let hour = parseInt(cells[8].textContent.trim().split(' ')[1].split(':')[0]); // Extract hour from Arrival

            if (!spamSummary[date]) {
                spamSummary[date] = {};
            }
            if (!spamSummary[date][toPlayer]) {
                spamSummary[date][toPlayer] = createAttackSummary();
            }

            let summary = spamSummary[date][toPlayer];
            if (arrived) {
                summary.arrivedAttacks++;
                summary.averagePopulationArrivedAttacks += population; // Will be divided by count later
                summary.hoursArrived.add(hour); // Using Set to avoid duplicates
            } else {
                summary.nonArrivedAttacks++;
                summary.hoursNotArrived.add(hour); // Using Set to avoid duplicates
            }
        }
    }

    // Calculate average population for arrived attacks and convert Sets to Arrays
    for (let date in spamSummary) {
        for (let player in spamSummary[date]) {
            let summary = spamSummary[date][player];
            if (summary.arrivedAttacks > 0) {
                summary.averagePopulationArrivedAttacks = Math.round(summary.averagePopulationArrivedAttacks / summary.arrivedAttacks);
            }
            summary.hoursArrived = Array.from(summary.hoursArrived);
            summary.hoursNotArrived = Array.from(summary.hoursNotArrived);
        }
    }

    for (let date in spamSummary) {
        for (let player in spamSummary[date]) {
            let summary = spamSummary[date][player];
            totalAttacks += summary.arrivedAttacks + summary.nonArrivedAttacks;
            totalArrivedAttacks += summary.arrivedAttacks;
        }
    }

    return {
        spamSummary: spamSummary,
        totalAttacks: totalAttacks,
        totalArrivedAttacks: totalArrivedAttacks
    };
}

function calculatePopulation(detailRow) {
    let nestedTable = detailRow.querySelector('table');
    let totalPopulation = 0;

    if (nestedTable) {
        // Collect all header cells
        let headerCells = [...nestedTable.querySelectorAll('tr th')];
        let dataRows = [...nestedTable.querySelectorAll('tr')].filter(row => row.querySelectorAll('td').length > 0);

        let unitTypeIndex = 0; // To keep track of the current unit type index

        dataRows.forEach(row => {
            let cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                // Check if we have exceeded the headerCells length and reset the index
                if (unitTypeIndex >= headerCells.length) {
                    unitTypeIndex = 0;
                }

                let unitType = headerCells[unitTypeIndex].textContent.trim().toLowerCase();
                unitTypeIndex++; // Move to next unit type

                if (unitPopulationCosts.hasOwnProperty(unitType)) {
                    let unitCount = parseInt(cell.textContent.trim()) || 0;
                    let unitPopulation = unitPopulationCosts[unitType];
                    totalPopulation += unitCount * unitPopulation;

                    if (firstRow) console.log(`Unit type: ${unitType}, Count: ${unitCount}, Unit population: ${unitPopulation}, Subtotal: ${unitCount * unitPopulation}`);
                }
            });
        });
    }

    if (firstRow) console.log(`Total population calculated: ${totalPopulation}`);
    firstRow = false;
    return totalPopulation;
}

function applyFilter(data) {
    displayPopup(data);
}

function displayPopup(data) {
    let spamSummary = data.spamSummary;
    let totalAttacks = data.totalAttacks;
    let totalArrivedAttacks = data.totalArrivedAttacks;

    popup.textContent = ''; // Clear existing content
    popup.style.position = 'fixed';
    popup.style.top = '10px'; // Top margin
    popup.style.right = '10px'; // Right margin
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '10px';
    popup.style.zIndex = '1000'; // Make sure it's on top of other elements
    popup.style.overflowY = 'auto'; // Enable vertical scrolling
    popup.style.maxHeight = '90vh'; // Maximum height (90% of the viewport height)
    popup.style.width = 'auto'; // Width can be adjusted as needed

    let foldButton = document.createElement('button');
    foldButton.textContent = 'Fold';
    foldButton.onclick = () => togglePopup(data);
    foldButton.style.position = 'absolute';
    foldButton.style.top = '10px';
    foldButton.style.right = '10px';
    popup.appendChild(foldButton);

    // Display total summary
    let summaryDiv = document.createElement('div');
    summaryDiv.textContent = `Total Attacks: ${totalAttacks}, Total Arrived Attacks: ${totalArrivedAttacks}`;
    summaryDiv.style.padding = '10px';
    summaryDiv.style.backgroundColor = '#f0f0f0';
    summaryDiv.style.marginBottom = '10px';
    popup.appendChild(summaryDiv);

    let filterDiv = document.createElement('div');
    let filterLabel = document.createElement('span');
    filterLabel.textContent = 'Minimum number of attacks to display: ';
    filterLabel.style.marginRight = '10px';

    let filterInput = document.createElement('input');
    filterInput.type = 'number';
    filterInput.value = currentMinAttacks; // Use global filter value
    filterInput.style.margin = '10px';
    filterInput.placeholder = 'Enter number';

    let filterButton = document.createElement('button');
    filterButton.textContent = 'Apply Filter';
    filterButton.onclick = () => {
        currentMinAttacks = parseInt(filterInput.value) || 0; // Update global filter value
        applyFilter(data);
    };

    filterDiv.appendChild(filterLabel);
    filterDiv.appendChild(filterInput);
    filterDiv.appendChild(filterButton);
    popup.appendChild(filterDiv);

    for (let date in spamSummary) {
        let dateHeader = document.createElement('h3');
        dateHeader.textContent = `Date: ${date}`;
        popup.appendChild(dateHeader);

        let table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        popup.appendChild(table);

        // Create table header
        let thead = document.createElement('thead');
        table.appendChild(thead);
        let headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        ['Player', 'Arrived Attacks', 'Avg. Pop. Arrived', 'Non-Arrived Attacks', 'Hours Arrived', 'Hours Not Arrived'].forEach(headerText => {
            let header = document.createElement('th');
            header.textContent = headerText;
            header.style.border = '1px solid black';
            header.style.padding = '5px';
            headerRow.appendChild(header);
        });

        // Create table body
        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // Add data rows
        for (let player in spamSummary[date]) {
            let attackData = spamSummary[date][player];
            let totalAttacks = attackData.arrivedAttacks + attackData.nonArrivedAttacks;

            // Skip rows that don't meet the filter criteria
            if (totalAttacks < currentMinAttacks) {
                continue; // Skip to the next iteration
            }

            let row = document.createElement('tr');
            tbody.appendChild(row);

            // Player
            let playerCell = document.createElement('td');
            playerCell.textContent = player;
            row.appendChild(playerCell);

            // Arrived Attacks
            let arrivedCell = document.createElement('td');
            arrivedCell.textContent = attackData.arrivedAttacks;
            row.appendChild(arrivedCell);

            // Avg. Pop. Arrived
            let avgPopCell = document.createElement('td');
            avgPopCell.textContent = Math.round(attackData.averagePopulationArrivedAttacks);
            row.appendChild(avgPopCell);

            // Non-Arrived Attacks
            let nonArrivedCell = document.createElement('td');
            nonArrivedCell.textContent = attackData.nonArrivedAttacks;
            row.appendChild(nonArrivedCell);

            // Hours Arrived
            let hoursArrivedCell = document.createElement('td');
            hoursArrivedCell.textContent = attackData.hoursArrived.join(', ');
            row.appendChild(hoursArrivedCell);

            // Hours Not Arrived
            let hoursNotArrivedCell = document.createElement('td');
            hoursNotArrivedCell.textContent = attackData.hoursNotArrived.join(', ');
            row.appendChild(hoursNotArrivedCell);
        }
    }
}

function togglePopup(data) {
    if (isPopupFolded) {
        // Restore the original height when unfolding
        popup.style.height = originalPopupHeight;
    } else {
        // Store the current height before folding
        originalPopupHeight = popup.style.height;
        popup.style.height = '50px';
    }
    isPopupFolded = !isPopupFolded;
    managePopupDisplay(data);
}

function managePopupDisplay(data) {
    if (isPopupFolded) {
        // Minimize the popup
        popup.textContent = '';
        popup.style.width = '50px';
        popup.style.overflowY = 'hidden';

        let unfoldButton = document.createElement('button');
        unfoldButton.textContent = 'Unfold';
        unfoldButton.onclick = () => togglePopup(data);
        popup.appendChild(unfoldButton);
    } else {
        // Display full content without changing the height
        displayPopup(data);
    }
}

