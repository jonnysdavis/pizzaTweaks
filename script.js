// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');
    console.log('Attempting to select elements...');

    // Counter for unique IDs for new tweak entries
    let tweakEntryCounter = 0;

    // Container for all tweak entries
    const tweakEntriesContainer = document.getElementById('tweakEntriesContainer');
    console.log('tweakEntriesContainer:', tweakEntriesContainer);

    // "Add Another Tweak" button
    const addTweakButton = document.getElementById('addTweakButton');
    console.log('addTweakButton:', addTweakButton);

    // Get references to output elements
    const luaOutputTextarea = document.getElementById('luaOutput');
    console.log('luaOutputTextarea:', luaOutputTextarea);
    const base64OutputTextarea = document.getElementById('base64Output');
    console.log('base64OutputTextarea:', base64OutputTextarea);

    // Get reference to the main "Generate All Tweaks" button
    const generateButton = document.getElementById('generateButton');
    console.log('generateButton (Generate All Tweaks):', generateButton);

    // Get reference to the messages div
    const messagesDiv = document.getElementById('messages');
    console.log('messagesDiv:', messagesDiv);

    // Common stats list
    const commonStats = ['metalcost', 'energycost', 'buildcostenergy', 'buildcostmetal', 'buildtime', 'health', 'maxdamage', 'speed', 'description', 'tooltip', 'unitname'];

    // Function to display messages
    function displayMessage(message, type) {
        messagesDiv.textContent = message;
        messagesDiv.className = type;
    }

    // --- Function to populate a stat select dropdown ---
    function populateStatSelect(statSelectElement) {
        commonStats.forEach(statName => {
            const option = document.createElement('option');
            option.value = statName;
            option.textContent = statName;
            statSelectElement.appendChild(option);
        });
        // Add "Other" option
        const otherOption = document.createElement('option');
        otherOption.value = '_custom_';
        otherOption.textContent = 'Other (Enter Below)';
        statSelectElement.appendChild(otherOption);
    }

    // --- Function to handle stat dropdown change ---
    function handleStatDropdownChange(event) {
        const statSelect = event.target;
        const tweakEntryDiv = statSelect.closest('.tweak-entry');
        if (!tweakEntryDiv) {
            console.error('Could not find parent .tweak-entry for stat select:', statSelect);
            return;
        }
        const customInput = tweakEntryDiv.querySelector('.customStatNameInput');
        if (!customInput) {
            console.error('Could not find .customStatNameInput in entry:', tweakEntryDiv);
            return;
        }

        if (statSelect.value === '_custom_') {
            console.log('Custom stat selected. Showing input.');
            customInput.style.display = 'inline-block'; // Or 'block' depending on desired layout
        } else {
            console.log('Predefined stat selected. Hiding custom input.');
            customInput.style.display = 'none';
            customInput.value = ''; // Clear it when hidden
        }
    }

    // --- Event delegation for stat dropdown changes ---
    if (tweakEntriesContainer) {
        tweakEntriesContainer.addEventListener('change', function(event) {
            if (event.target.classList.contains('statNameSelect')) {
                console.log('Change event detected on a statNameSelect element.');
                handleStatDropdownChange(event);
            }
        });
    }


    // --- Function to update visibility of Remove buttons ---
    function updateRemoveButtons() {
        const allEntries = tweakEntriesContainer.querySelectorAll('.tweak-entry');
        allEntries.forEach((entry) => { // Removed index as it's not used
            const removeButton = entry.querySelector('.removeTweakButton');
            if (removeButton) {
                removeButton.style.display = allEntries.length > 1 ? 'inline-block' : 'none';
            }
        });
        console.log('Remove buttons updated. Total entries:', allEntries.length);
    }

    // --- Function to create a new tweak entry ---
    function createTweakEntry(entryIndex) {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('tweak-entry');
        // Ensure IDs are unique for labels as well if needed, or ensure they point to correct input
        entryDiv.innerHTML = `
            <div>
                <label for="unitNameSelect_${entryIndex}">Unit Name:</label>
                <select id="unitNameSelect_${entryIndex}" name="unitNameSelect_${entryIndex}" class="unitNameSelect"></select>
            </div>
            <div>
                <label for="statNameSelect_${entryIndex}">Stat to Modify:</label>
                <select id="statNameSelect_${entryIndex}" name="statNameSelect_${entryIndex}" class="statNameSelect"></select>
                <input type="text" id="customStatNameInput_${entryIndex}" name="customStatNameInput_${entryIndex}" class="customStatNameInput" style="display:none; margin-top: 5px;" placeholder="Enter custom stat name">
            </div>
            <div>
                <label for="statValue_${entryIndex}">New Value:</label>
                <input type="number" id="statValue_${entryIndex}" name="statValue_${entryIndex}" class="statValueInput">
            </div>
            <button type="button" class="removeTweakButton">Remove</button>
        `;

        const unitSelect = entryDiv.querySelector(`#unitNameSelect_${entryIndex}`);
        const statSelect = entryDiv.querySelector(`#statNameSelect_${entryIndex}`);
        const removeButton = entryDiv.querySelector('.removeTweakButton');

        // Populate Unit Names dropdown for the new entry
        if (typeof unitDatabase !== 'undefined' && unitDatabase.units && unitDatabase.units.names) {
            Object.entries(unitDatabase.units.names).forEach(([unitDefName, readableName]) => {
                const option = document.createElement('option');
                option.value = unitDefName;
                option.textContent = `${readableName} (${unitDefName})`;
                unitSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.textContent = 'Error loading units';
            option.disabled = true;
            unitSelect.appendChild(option);
        }

        // Populate Stat Names dropdown for the new entry (including "Other")
        populateStatSelect(statSelect); // Use the helper function

        // Add event listener to the new Remove button
        removeButton.addEventListener('click', () => {
            console.log('Remove button clicked for entry.');
            entryDiv.remove();
            updateRemoveButtons();
        });

        console.log(`Created new tweak entry with index ${entryIndex}`);
        return entryDiv;
    }

    // --- Event Listener for "Add Another Tweak" button ---
    if (addTweakButton) {
        addTweakButton.addEventListener('click', () => {
            console.log('Add Another Tweak button clicked.');
            tweakEntryCounter++;
            const newEntry = createTweakEntry(tweakEntryCounter);
            tweakEntriesContainer.appendChild(newEntry);
            updateRemoveButtons();
        });
    } else {
        console.error('addTweakButton not found!');
    }

    // --- Initial Population for the first entry (index 0) ---
    const initialUnitSelect = document.getElementById('unitNameSelect_0');
    const initialStatSelect = document.getElementById('statNameSelect_0');
    const initialRemoveButton = document.querySelector('.tweak-entry:first-child .removeTweakButton');

    if (initialUnitSelect && initialStatSelect) {
        console.log('Populating initial (0th) tweak entry dropdowns.');
        // Populate Unit Names for the first entry
        if (typeof unitDatabase !== 'undefined' && unitDatabase.units && unitDatabase.units.names) {
            Object.entries(unitDatabase.units.names).forEach(([unitDefName, readableName]) => {
                const option = document.createElement('option');
                option.value = unitDefName;
                option.textContent = `${readableName} (${unitDefName})`;
                initialUnitSelect.appendChild(option);
            });
        } else {
            console.error('unitDatabase is not loaded or has an unexpected structure for initial entry.');
            displayMessage('Error: Unit data could not be loaded. Please check console.', 'error-message');
            const option = document.createElement('option');
            option.textContent = 'Error loading unit names';
            option.disabled = true;
            initialUnitSelect.appendChild(option);
        }

        // Populate Stat Names for the first entry (including "Other")
        populateStatSelect(initialStatSelect); // Use the helper function

        if(initialRemoveButton){
            initialRemoveButton.addEventListener('click', () => {
                console.log('Remove button clicked for initial entry.');
                initialRemoveButton.parentElement.remove();
                updateRemoveButtons();
            });
        }

    } else {
        console.error('Initial unit or stat select (unitNameSelect_0, statNameSelect_0) not found!');
    }

    updateRemoveButtons(); // Initial call

    // --- Event Listener for "Generate All Tweaks" button ---
    console.log('Attempting to attach event listener to generateButton (Generate All Tweaks).');
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            console.log('Generate All Tweaks button click event fired!');

            messagesDiv.textContent = '';
            messagesDiv.className = '';

            const allEntries = tweakEntriesContainer.querySelectorAll('.tweak-entry');
            let combinedTweaks = {};
            let validationFailed = false;

            console.log(`Processing ${allEntries.length} tweak entries.`);

            allEntries.forEach((entryDiv, index) => {
                if (validationFailed) return;

                const unitNameValue = entryDiv.querySelector('.unitNameSelect').value;
                let statNameValue = entryDiv.querySelector('.statNameSelect').value; // Note: 'let' now
                const customStatNameInput = entryDiv.querySelector('.customStatNameInput');
                const statValueRaw = entryDiv.querySelector('.statValueInput').value;
                const statValueTrimmed = statValueRaw.trim();

                console.log(`Entry ${index}: Unit='${unitNameValue}', StatDropdown='${statNameValue}', RawValue='${statValueRaw}'`);

                if (statNameValue === '_custom_') {
                    statNameValue = customStatNameInput.value.trim();
                    console.log(`Entry ${index}: Custom stat selected. CustomStatName='${statNameValue}'`);
                    if (!statNameValue) {
                        displayMessage(`Error in Entry #${index + 1}: Custom stat name cannot be empty when 'Other' is selected.`, 'error-message');
                        validationFailed = true; return;
                    }
                }

                if (!unitNameValue) {
                    displayMessage(`Error in Entry #${index + 1}: Please select a Unit Name.`, 'error-message');
                    validationFailed = true; return;
                }
                if (!statNameValue) { // This will now catch empty custom stat names too
                    displayMessage(`Error in Entry #${index + 1}: Please select or enter a Stat to Modify.`, 'error-message');
                    validationFailed = true; return;
                }
                if (!statValueTrimmed) {
                    displayMessage(`Error in Entry #${index + 1}: Please fill in "New Value".`, 'error-message');
                    validationFailed = true; return;
                }

                let formattedStatValue;
                if (isNaN(parseFloat(statValueTrimmed))) {
                    formattedStatValue = `"${statValueTrimmed.replace(/"/g, '\\"')}"`;
                } else {
                    formattedStatValue = parseFloat(statValueTrimmed);
                }

                if (!combinedTweaks[unitNameValue]) {
                    combinedTweaks[unitNameValue] = {};
                }
                combinedTweaks[unitNameValue][statNameValue] = formattedStatValue;
                console.log(`Entry ${index} processed. Current combinedTweaks:`, JSON.stringify(combinedTweaks));
            });

            if (validationFailed) {
                console.log('Validation failed for one or more entries. Aborting generation.');
                luaOutputTextarea.value = '';
                base64OutputTextarea.value = '';
                return;
            }

            console.log('All entries validated. Proceeding to generate final Lua string.');

            let luaStringParts = [];
            for (const unit in combinedTweaks) {
                let unitStatParts = [];
                for (const stat in combinedTweaks[unit]) {
                    unitStatParts.push(` ${stat} = ${combinedTweaks[unit][stat]}`);
                }
                luaStringParts.push(`${unit} = {\n    ${unitStatParts.join(',\n    ')}\n  }`);
            }
            const luaString = `{\n  ${luaStringParts.join(',\n  ')}\n}`; // Added more newlines for readability
            console.log('Generated Final Lua String:', luaString);

            const encoder = new TextEncoder();
            const luaBytes = encoder.encode(luaString);
            const standardBase64 = base64js.fromByteArray(luaBytes);
            let urlSafeBase64 = standardBase64.replace(/\+/g, '-').replace(/\//g, '_');
            urlSafeBase64 = urlSafeBase64.replace(/=+$/, '');
            console.log('Generated Final Base64 String:', urlSafeBase64);

            console.log('Attempting to display final outputs.');
            console.log('Attempting to set Lua output. Element:', luaOutputTextarea);
            console.log('Lua string to set:', luaString);
            luaOutputTextarea.value = luaString;
            console.log('Lua output set. New value:', luaOutputTextarea.value);

            console.log('Attempting to set Base64 output. Element:', base64OutputTextarea);
            console.log('Base64 string to set:', urlSafeBase64);
            base64OutputTextarea.value = urlSafeBase64;
            console.log('Base64 output set. New value:', base64OutputTextarea.value);

            displayMessage('All tweaks generated successfully!', 'success-message');
            console.log('Generate All Tweaks button click event processing complete.');
        });
    } else {
        console.error('Generate All Tweaks button (generateButton) not found!');
    }
});
