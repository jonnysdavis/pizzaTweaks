// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to input elements
    const unitNameSelect = document.getElementById('unitNameSelect');
    const statNameSelect = document.getElementById('statNameSelect');
    const statValueInput = document.getElementById('statValue');

    // Get references to output elements
    const luaOutputTextarea = document.getElementById('luaOutput');
    const base64OutputTextarea = document.getElementById('base64Output');

    // Get reference to the button
    const generateButton = document.getElementById('generateButton');

    // Get reference to the messages div
    const messagesDiv = document.getElementById('messages');

    // Function to display messages
    function displayMessage(message, type) {
        messagesDiv.textContent = message;
        messagesDiv.className = type; // e.g., 'error-message' or 'success-message'
    }

    // Populate Unit Names dropdown
    if (typeof unitDatabase !== 'undefined' && unitDatabase.units && unitDatabase.units.names) {
        Object.entries(unitDatabase.units.names).forEach(([unitDefName, readableName]) => {
            const option = document.createElement('option');
            option.value = unitDefName;
            option.textContent = `${readableName} (${unitDefName})`;
            unitNameSelect.appendChild(option);
        });
    } else {
        console.error('unitDatabase is not loaded or has an unexpected structure.');
        displayMessage('Error: Unit data could not be loaded. Please check console.', 'error-message');
        const option = document.createElement('option');
        option.textContent = 'Error loading unit names';
        option.disabled = true;
        unitNameSelect.appendChild(option);
    }

    // Populate Stat Names dropdown
    const commonStats = ['metalcost', 'energycost', 'buildcostenergy', 'buildcostmetal', 'buildtime', 'health', 'maxdamage', 'speed', 'description', 'tooltip', 'unitname'];
    commonStats.forEach(statName => {
        const option = document.createElement('option');
        option.value = statName;
        option.textContent = statName;
        statNameSelect.appendChild(option);
    });

    // Add event listener to the generate button
    generateButton.addEventListener('click', () => {
        // Clear previous messages
        messagesDiv.textContent = '';
        messagesDiv.className = ''; // Clear class

        // Retrieve values from input fields
        const unitName = unitNameSelect.value;
        const statName = statNameSelect.value;
        const statValue = statValueInput.value.trim();

        // Basic validation
        if (!unitName) {
            displayMessage('Please select a Unit Name.', 'error-message');
            return;
        }
        if (!statName) {
            displayMessage('Please select a Stat to Modify.', 'error-message');
            return;
        }
        if (!statValue) {
            displayMessage('Please fill in "New Value".', 'error-message');
            return;
        }

        // Determine if statValue is numeric or string
        let formattedStatValue;
        if (isNaN(parseFloat(statValue))) {
            // Treat as string if not a number, enclose in quotes and escape existing quotes
            formattedStatValue = `"${statValue.replace(/"/g, '\\"')}"`;
        } else {
            // Treat as number
            formattedStatValue = parseFloat(statValue);
        }

        // Construct the Lua table string
        const luaString = `{ ${unitName} = { ${statName} = ${formattedStatValue} } }`;

        // Display the generated Lua string
        luaOutputTextarea.value = luaString;

        // Convert the Lua string to a Uint8Array
        const encoder = new TextEncoder();
        const luaBytes = encoder.encode(luaString);

        // Use base64js.fromByteArray() to get the standard Base64 string
        const standardBase64 = base64js.fromByteArray(luaBytes);

        // Convert the standard Base64 string to URL-safe Base64
        let urlSafeBase64 = standardBase64.replace(/\+/g, '-').replace(/\//g, '_');
        urlSafeBase64 = urlSafeBase64.replace(/=+$/, ''); // Remove any trailing '=' characters

        // Display the final URL-safe Base64 string
        base64OutputTextarea.value = urlSafeBase64;

        // Display success message
        displayMessage('Tweak generated successfully!', 'success-message');
    });
});
