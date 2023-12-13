
const popup = document.createElement('div');
    
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
        let table = tables[attackTableIndex]; // Select the second table
        let summary = processTable(table);
        displayPopup(summary);
    }
}



function processTable(table) {
    console.log("Processing table:", table);
    let rows = table.rows;
    let attacksSummary = [];

    // Assuming the first row is the header and can be skipped
    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].cells;

        // Check if the required cells exist
        if (cells.length >= 3) {
            let attackInfo = {
                attacker: cells[0] ? cells[0].textContent.trim() : 'N/A',
                defender: cells[1] ? cells[1].textContent.trim() : 'N/A',
                time: cells[2] ? cells[2].textContent.trim() : 'N/A'
            };

            attacksSummary.push(attackInfo);
        }
    }

    return attacksSummary;
}


function displayPopup(summary) {
    console.log("Displaying popup with summary:", summary);
    // Clear existing content in the popup
    popup.textContent = '';

    // Create a list element to display attacks
    let list = document.createElement('ul');
    for (const attack of summary) {
        let listItem = document.createElement('li');
        listItem.textContent = `Attacker: ${attack.attacker}, Defender: ${attack.defender}, Time: ${attack.time}`;
        list.appendChild(listItem);
    }

    popup.appendChild(list);
}

