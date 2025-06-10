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

    // --- Helper function to get faction info ---
    function getFactionInfo(unitDefName) {
        if (!unitDatabase || !unitDatabase.units || !unitDatabase.units.factions) {
            // Fallback if unitDatabase or factions not loaded
            let prefix = unitDefName.substring(0, 3); // Default to first 3
            if (unitDefName.startsWith("raptor_")) prefix = "raptor";
            else if (unitDefName.startsWith("scav")) prefix = "scav";
            else if (unitDefName.startsWith("critter_")) prefix = "critter";
            else if (unitDefName.startsWith("lootbox")) prefix = "lootbox";
            else if (unitDefName.startsWith("chip")) prefix = "chip";

            return { prefix: prefix, displayName: prefix.charAt(0).toUpperCase() + prefix.slice(1) };
        }

        const factionMap = unitDatabase.units.factions;
        const knownPrefixes = {
            "arm": factionMap["arm"] || "Armada",
            "cor": factionMap["cor"] || "Cortex",
            "leg": factionMap["leg"] || "Legion",
            "raptor": "Raptors", // Covers raptor_
            "scav": "Scavengers", // Covers scavenger, scav
            "critter": "Critters",
            "chip": "Chip",
            "lootbox": "Lootboxes",
            // Add other specific multi-letter prefixes here if needed
        };

        for (const key in knownPrefixes) {
            if (unitDefName.startsWith(key)) {
                return { prefix: key, displayName: knownPrefixes[key] };
            }
        }

        // Default fallback for prefixes not in knownPrefixes (e.g. "xmasball")
        let prefix = unitDefName.match(/^[a-zA-Z]+/)?.[0] || "other"; // Get first word part
        if (prefix.length > 7 && prefix.includes('_')) { // like dbg_sphere
             prefix = prefix.substring(0, prefix.indexOf('_'));
        } else if (prefix.length > 7) { // for long prefixes without underscore
            prefix = unitDefName.substring(0,3); // fallback to first 3
        }


        return { prefix: prefix, displayName: prefix.charAt(0).toUpperCase() + prefix.slice(1) };
    }


    // --- Function to populate a unit select dropdown with optgroups ---
    function populateUnitSelect(unitSelectElement) {
        unitSelectElement.innerHTML = ''; // Clear previous options

        if (typeof unitDatabase !== 'undefined' && unitDatabase.units && unitDatabase.units.names) {
            const groupedUnits = {};

            Object.entries(unitDatabase.units.names).forEach(([unitDefName, readableName]) => {
                const faction = getFactionInfo(unitDefName);
                const groupKey = `${faction.displayName} (${faction.prefix})`;

                if (!groupedUnits[groupKey]) {
                    groupedUnits[groupKey] = [];
                }

                const option = document.createElement('option');
                option.value = unitDefName;
                option.textContent = `${readableName} (${unitDefName})`;
                groupedUnits[groupKey].push(option);
            });

            const sortedGroupLabels = Object.keys(groupedUnits).sort();

            sortedGroupLabels.forEach(groupLabel => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = groupLabel;

                const optionsInGroup = groupedUnits[groupLabel];
                // Sort options within the group by their textContent (readable name)
                optionsInGroup.sort((a, b) => a.textContent.localeCompare(b.textContent));

                optionsInGroup.forEach(option => {
                    optgroup.appendChild(option);
                });
                unitSelectElement.appendChild(optgroup);
            });

        } else {
            console.error('unitDatabase is not loaded or has an unexpected structure for unit population.');
            const errorOption = document.createElement('option');
            errorOption.textContent = 'Error loading units';
            errorOption.disabled = true;
            unitSelectElement.appendChild(errorOption);
        }

        // Add "Other" option for custom unit name, outside any optgroup
        const customOption = document.createElement('option');
        customOption.value = '_custom_';
        customOption.textContent = 'Other (Enter Below)';
        unitSelectElement.appendChild(customOption);
    }


    // --- Function to populate a stat select dropdown ---
    function populateStatSelect(statSelectElement) {
        statSelectElement.innerHTML = ''; // Clear previous options
        commonStats.forEach(statName => {
            const option = document.createElement('option');
            option.value = statName;
            option.textContent = statName;
            statSelectElement.appendChild(option);
        });
        const otherOption = document.createElement('option');
        otherOption.value = '_custom_';
        otherOption.textContent = 'Other (Enter Below)';
        statSelectElement.appendChild(otherOption);
    }

    // --- Function to handle stat dropdown change ---
    function handleStatDropdownChange(event) {
        const statSelect = event.target;
        const tweakEntryDiv = statSelect.closest('.tweak-entry');
        if (!tweakEntryDiv) return;
        const customInput = tweakEntryDiv.querySelector('.customStatNameInput');
        if (!customInput) return;

        if (statSelect.value === '_custom_') {
            customInput.style.display = 'inline-block';
        } else {
            customInput.style.display = 'none';
            customInput.value = '';
        }
    }

    // --- Function to handle unit dropdown change ---
    function handleUnitDropdownChange(event) {
        const unitSelect = event.target;
        const tweakEntryDiv = unitSelect.closest('.tweak-entry');
        if (!tweakEntryDiv) return;
        const customUnitInput = tweakEntryDiv.querySelector('.customUnitNameInput');
        if (!customUnitInput) return;

        if (unitSelect.value === '_custom_') {
            console.log('Custom unit selected. Showing input.');
            customUnitInput.style.display = 'inline-block';
        } else {
            console.log('Predefined unit selected. Hiding custom unit input.');
            customUnitInput.style.display = 'none';
            customUnitInput.value = '';
        }
    }

    // --- Event delegation for dropdown changes within tweakEntriesContainer ---
    if (tweakEntriesContainer) {
        tweakEntriesContainer.addEventListener('change', function(event) {
            if (event.target.classList.contains('statNameSelect')) {
                console.log('Change event detected on a statNameSelect element.');
                handleStatDropdownChange(event);
            } else if (event.target.classList.contains('unitNameSelect')) {
                console.log('Change event detected on a unitNameSelect element.');
                handleUnitDropdownChange(event);
            }
        });
    }


    // --- Function to update visibility of Remove buttons ---
    function updateRemoveButtons() {
        const allEntries = tweakEntriesContainer.querySelectorAll('.tweak-entry');
        allEntries.forEach((entry) => {
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
        entryDiv.innerHTML = `
            <div>
                <label for="unitNameSelect_${entryIndex}">Unit Name:</label>
                <select id="unitNameSelect_${entryIndex}" name="unitNameSelect_${entryIndex}" class="unitNameSelect"></select>
                <input type="text" id="customUnitNameInput_${entryIndex}" name="customUnitNameInput_${entryIndex}" class="customUnitNameInput" style="display:none; margin-top: 5px;" placeholder="Enter custom unit def name">
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

        populateUnitSelect(unitSelect);
        populateStatSelect(statSelect);

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
        populateUnitSelect(initialUnitSelect);
        populateStatSelect(initialStatSelect);

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

    updateRemoveButtons();

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

                let unitNameValue = entryDiv.querySelector('.unitNameSelect').value;
                const customUnitNameInput = entryDiv.querySelector('.customUnitNameInput');
                let statNameValue = entryDiv.querySelector('.statNameSelect').value;
                const customStatNameInput = entryDiv.querySelector('.customStatNameInput');
                const statValueRaw = entryDiv.querySelector('.statValueInput').value;
                const statValueTrimmed = statValueRaw.trim();

                console.log(`Entry ${index}: UnitDropdown='${unitNameValue}', StatDropdown='${statNameValue}', RawValue='${statValueRaw}'`);

                if (unitNameValue === '_custom_') {
                    unitNameValue = customUnitNameInput.value.trim();
                    console.log(`Entry ${index}: Custom unit selected. CustomUnitName='${unitNameValue}'`);
                    if (!unitNameValue) {
                        displayMessage(`Error in Entry #${index + 1}: Custom unit name cannot be empty when 'Other' is selected.`, 'error-message');
                        validationFailed = true; return;
                    }
                }

                if (statNameValue === '_custom_') {
                    statNameValue = customStatNameInput.value.trim();
                    console.log(`Entry ${index}: Custom stat selected. CustomStatName='${statNameValue}'`);
                    if (!statNameValue) {
                        displayMessage(`Error in Entry #${index + 1}: Custom stat name cannot be empty when 'Other' is selected.`, 'error-message');
                        validationFailed = true; return;
                    }
                }

                if (!unitNameValue) {
                    displayMessage(`Error in Entry #${index + 1}: Please select or enter a Unit Name.`, 'error-message');
                    validationFailed = true; return;
                }
                if (!statNameValue) {
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
                    unitStatParts.push(`    ${stat} = ${combinedTweaks[unit][stat]}`);
                }
                luaStringParts.push(`  ${unit} = {\n${unitStatParts.join(',\n')}\n  }`);
            }
            const luaString = `{\n${luaStringParts.join(',\n')}\n}`;
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
