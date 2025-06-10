// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');
    console.log('Attempting to select elements...');

    // Get references to input elements
    const unitNameSelect = document.getElementById('unitNameSelect');
    console.log('unitNameSelect:', unitNameSelect);
    const statNameSelect = document.getElementById('statNameSelect');
    console.log('statNameSelect:', statNameSelect);
    const statValueInput = document.getElementById('statValue');
    console.log('statValueInput:', statValueInput);

    // Get references to output elements
    const luaOutputTextarea = document.getElementById('luaOutput');
    console.log('luaOutputTextarea:', luaOutputTextarea);
    const base64OutputTextarea = document.getElementById('base64Output');
    console.log('base64OutputTextarea:', base64OutputTextarea);

    // Get reference to the button
    const generateButton = document.getElementById('generateButton');
    console.log('generateButton:', generateButton);

    // Get reference to the messages div
    const messagesDiv = document.getElementById('messages');
    console.log('messagesDiv:', messagesDiv);

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

    console.log('Attempting to attach event listener to generateButton.');
    // Add event listener to the generate button
    generateButton.addEventListener('click', () => {
        console.log('generateButton click event fired!');

        // Clear previous messages
        messagesDiv.textContent = '';
        messagesDiv.className = ''; // Clear class

        // Retrieve values from input fields
        const unitNameValue = unitNameSelect.value;
        const statNameValue = statNameSelect.value;
        const statValueRaw = statValueInput.value; // Raw value before trim

        console.log('Unit Name Value:', unitNameValue);
        console.log('Stat Name Value:', statNameValue);
        console.log('Stat Value (raw):', statValueRaw);

        const statValueTrimmed = statValueRaw.trim();

        console.log('Performing validation...');
        // Basic validation
        if (!unitNameValue) {
            console.log('Validation failed: Unit Name is empty.');
            displayMessage('Please select a Unit Name.', 'error-message');
            return;
        }
        if (!statNameValue) {
            console.log('Validation failed: Stat Name is empty.');
            displayMessage('Please select a Stat to Modify.', 'error-message');
            return;
        }
        if (!statValueTrimmed) {
            console.log('Validation failed: New Value is empty.');
            displayMessage('Please fill in "New Value".', 'error-message');
            return;
        }
        console.log('Validation passed. Proceeding to generate Lua string.');

        // Determine if statValue is numeric or string
        let formattedStatValue;
        if (isNaN(parseFloat(statValueTrimmed))) {
            // Treat as string if not a number, enclose in quotes and escape existing quotes
            formattedStatValue = `"${statValueTrimmed.replace(/"/g, '\\"')}"`;
        } else {
            // Treat as number
            formattedStatValue = parseFloat(statValueTrimmed);
        }

        // Construct the Lua table string
        const luaString = `{ ${unitNameValue} = { ${statNameValue} = ${formattedStatValue} } }`;
        console.log('Generated Lua String:', luaString);

        // Convert the Lua string to a Uint8Array
        const encoder = new TextEncoder();
        const luaBytes = encoder.encode(luaString);

        // Use base64js.fromByteArray() to get the standard Base64 string
        const standardBase64 = base64js.fromByteArray(luaBytes);

        // Convert the standard Base64 string to URL-safe Base64
        let urlSafeBase64 = standardBase64.replace(/\+/g, '-').replace(/\//g, '_');
        urlSafeBase64 = urlSafeBase64.replace(/=+$/, ''); // Remove any trailing '=' characters
        console.log('Generated Base64 String:', urlSafeBase64);

        console.log('Attempting to display outputs.');
        // Display the generated Lua string
        console.log('Attempting to set Lua output. Element:', luaOutputTextarea);
        console.log('Lua string to set:', luaString);
        luaOutputTextarea.value = luaString;
        console.log('Lua output set. New value:', luaOutputTextarea.value);

        // Display the final URL-safe Base64 string
        console.log('Attempting to set Base64 output. Element:', base64OutputTextarea);
        console.log('Base64 string to set:', urlSafeBase64);
        base64OutputTextarea.value = urlSafeBase64;
        console.log('Base64 output set. New value:', base64OutputTextarea.value);

        // Display success message
        displayMessage('Tweak generated successfully!', 'success-message');
        console.log('generateButton click event processing complete.');
    });
});
