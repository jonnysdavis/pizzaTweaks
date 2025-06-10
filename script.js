// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');
    console.log('Attempting to select elements...');

    let tweakEntryCounter = 0;
    const tweakEntriesContainer = document.getElementById('tweakEntriesContainer');
    console.log('tweakEntriesContainer:', tweakEntriesContainer);
    const addTweakButton = document.getElementById('addTweakButton');
    console.log('addTweakButton:', addTweakButton);
    const luaOutputTextarea = document.getElementById('luaOutput');
    console.log('luaOutputTextarea:', luaOutputTextarea);
    const base64OutputTextarea = document.getElementById('base64Output');
    console.log('base64OutputTextarea:', base64OutputTextarea);
    const generateButton = document.getElementById('generateButton');
    console.log('generateButton (Generate All Tweaks):', generateButton);
    const messagesDiv = document.getElementById('messages');
    console.log('messagesDiv:', messagesDiv);
    const unitGroupFiltersContainer = document.getElementById('unitGroupFiltersContainer');
    console.log('unitGroupFiltersContainer:', unitGroupFiltersContainer);

    const commonStats = ['metalcost', 'energycost', 'buildcostenergy', 'buildcostmetal', 'buildtime', 'health', 'maxdamage', 'speed', 'description', 'tooltip', 'unitname'];
    const knownNumericStats = new Set(['metalcost', 'energycost', 'buildtime', 'health', 'maxdamage', 'speed', 'buildcostenergy', 'buildcostmetal']);

    let unitGroups = {}; // Populated by buildUnitGroupsData
    let groupFilterState = {}; // Stores true/false for each group label

    function displayMessage(message, type) {
        messagesDiv.textContent = message;
        messagesDiv.className = type;
    }

    function getFactionInfo(unitDefName) {
        if (!unitDatabase || !unitDatabase.units || !unitDatabase.units.factions) {
            let prefix = unitDefName.substring(0, 3);
            if (unitDefName.startsWith("raptor_")) prefix = "raptor";
            else if (unitDefName.startsWith("scav")) prefix = "scav";
            else if (unitDefName.startsWith("critter_")) prefix = "critter";
            else if (unitDefName.startsWith("lootbox")) prefix = "lootbox";
            else if (unitDefName.startsWith("chip")) prefix = "chip";
            return { prefix: prefix, displayName: prefix.charAt(0).toUpperCase() + prefix.slice(1) };
        }
        const factionMap = unitDatabase.units.factions;
        const knownPrefixes = {
            "arm": factionMap["arm"] || "Armada", "cor": factionMap["cor"] || "Cortex", "leg": factionMap["leg"] || "Legion",
            "raptor": "Raptors", "scav": "Scavengers", "critter": "Critters", "chip": "Chip", "lootbox": "Lootboxes",
        };
        for (const key in knownPrefixes) {
            if (unitDefName.startsWith(key)) return { prefix: key, displayName: knownPrefixes[key] };
        }
        let prefix = unitDefName.match(/^[a-zA-Z]+/)?.[0] || "other";
        if (prefix.length > 7 && prefix.includes('_')) prefix = prefix.substring(0, prefix.indexOf('_'));
        else if (prefix.length > 7) prefix = unitDefName.substring(0,3);
        return { prefix: prefix, displayName: prefix.charAt(0).toUpperCase() + prefix.slice(1) };
    }

    function buildUnitGroupsData() {
        const SMALL_GROUP_THRESHOLD = 5;
        const initialUnitGroups = {};

        if (typeof unitDatabase !== 'undefined' && unitDatabase.units && unitDatabase.units.names) {
            Object.entries(unitDatabase.units.names).forEach(([unitDefName, readableName]) => {
                const faction = getFactionInfo(unitDefName);
                const groupKey = `${faction.displayName} (${faction.prefix})`;
                if (!initialUnitGroups[groupKey]) {
                    initialUnitGroups[groupKey] = [];
                }
                // Store option data, not the element itself yet
                initialUnitGroups[groupKey].push({ value: unitDefName, text: `${readableName} (${unitDefName})` });
            });
        } else {
            console.error('unitDatabase not loaded for buildUnitGroupsData.');
            unitGroups = {}; // Ensure unitGroups is empty or appropriately handled
            return;
        }

        const finalUnitGroups = {};
        let otherUnitsOptions = [];

        // Sort group keys before processing for consistent "Other Units" later if multiple small groups exist
        const sortedInitialGroupKeys = Object.keys(initialUnitGroups).sort();

        for (const groupKey of sortedInitialGroupKeys) {
            const optionsArray = initialUnitGroups[groupKey];
            // Sort options within this specific group first
            optionsArray.sort((a, b) => a.text.localeCompare(b.text));

            if (optionsArray.length <= SMALL_GROUP_THRESHOLD) {
                otherUnitsOptions.push(...optionsArray);
            } else {
                finalUnitGroups[groupKey] = optionsArray;
            }
        }

        if (otherUnitsOptions.length > 0) {
            // Sort all collected "other" units together
            otherUnitsOptions.sort((a, b) => a.text.localeCompare(b.text));
            finalUnitGroups['Other Units'] = otherUnitsOptions;
        }

        unitGroups = finalUnitGroups; // Assign consolidated groups to global variable
        console.log('Consolidated unitGroups data built:', unitGroups);
    }

    function populateUnitSelect(unitSelectElement) {
        const previouslySelectedValue = unitSelectElement.dataset.selectedValue || (unitSelectElement.options.length > 0 ? unitSelectElement.value : null);
        unitSelectElement.innerHTML = '';

        const sortedGroupLabels = Object.keys(unitGroups).sort();

        sortedGroupLabels.forEach(groupLabel => {
            if (groupFilterState[groupLabel]) { // Only populate if filter is true
                const optgroup = document.createElement('optgroup');
                optgroup.label = groupLabel;
                const optionsInGroup = unitGroups[groupLabel];
                optionsInGroup.forEach(optionData => {
                    const option = document.createElement('option');
                    option.value = optionData.value;
                    option.textContent = optionData.text;
                    optgroup.appendChild(option);
                });
                unitSelectElement.appendChild(optgroup);
            }
        });

        const customOption = document.createElement('option');
        customOption.value = '_custom_';
        customOption.textContent = 'Other (Enter Below)';
        unitSelectElement.appendChild(customOption);

        if (previouslySelectedValue) {
            // Check if the previously selected value is still valid under current filters
            let stillValid = false;
            if (previouslySelectedValue === '_custom_') {
                stillValid = true;
            } else {
                for (const groupLabel of sortedGroupLabels) {
                    if (groupFilterState[groupLabel] && unitGroups[groupLabel].some(opt => opt.value === previouslySelectedValue)) {
                        stillValid = true;
                        break;
                    }
                }
            }
            if (stillValid) {
                 unitSelectElement.value = previouslySelectedValue;
            } else {
                 // If previous selection is filtered out, default to first available or custom
                 if (unitSelectElement.options.length > 1) { // more than just _custom_
                    unitSelectElement.value = unitSelectElement.options[0].value; // first option in first visible group
                 } else {
                    unitSelectElement.value = '_custom_'; // only custom is left
                 }
            }
        }
         // Add/Update listener to store selection for next repopulation
        unitSelectElement.dataset.selectedValue = unitSelectElement.value; // Store current
    }

    function initializeUnitGroupFilters() {
        if (!unitGroupFiltersContainer) return;
        unitGroupFiltersContainer.innerHTML = '<p style="font-size: 0.9em; color: #555;">Uncheck groups to hide them from the unit selection dropdowns.</p>'; // Clear previous, keep instruction

        const sortedGroupLabels = Object.keys(unitGroups).sort();
        console.log('Initializing filters for groups:', sortedGroupLabels);

        sortedGroupLabels.forEach(groupLabel => {
            const checkboxId = `filter_${groupLabel.replace(/\W/g, '_')}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.value = groupLabel;
            checkbox.checked = true; // Default to all checked
            groupFilterState[groupLabel] = true; // Initialize state

            const label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.textContent = groupLabel;
            label.style.marginRight = '10px';
            label.style.marginLeft = '2px';


            checkbox.addEventListener('change', handleFilterChange);

            const wrapper = document.createElement('div');
            wrapper.style.display = 'inline-block'; // For better layout
            wrapper.style.marginRight = '15px';
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            unitGroupFiltersContainer.appendChild(wrapper);
        });
    }

    function handleFilterChange(event) {
        const groupLabel = event.target.value;
        groupFilterState[groupLabel] = event.target.checked;
        console.log('Filter changed for', groupLabel, 'to', groupFilterState[groupLabel]);
        repopulateAllUnitSelects();
    }

    function repopulateAllUnitSelects() {
        console.log('Repopulating all unit selects due to filter change...');
        const allUnitSelects = document.querySelectorAll('.unitNameSelect');
        allUnitSelects.forEach(selectElement => {
            populateUnitSelect(selectElement);
             // After repopulating, ensure the custom input visibility is correctly set based on current value
            const changeEvent = new Event('change', { bubbles: true }); // Create a new change event
            selectElement.dispatchEvent(changeEvent); // Dispatch it to trigger handleUnitDropdownChange
        });
        console.log('Finished repopulating all unit selects.');
    }


    function populateStatSelect(statSelectElement) {
        const previouslySelectedValue = statSelectElement.dataset.selectedValue || (statSelectElement.options.length > 0 ? statSelectElement.value : null);
        statSelectElement.innerHTML = '';
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
        if (previouslySelectedValue) statSelectElement.value = previouslySelectedValue;
        statSelectElement.dataset.selectedValue = statSelectElement.value;
    }

    function handleStatDropdownChange(event) {
        if (event.target.id === 'statNameSelect_0') { // Example of specific log if needed
             console.log('Handling change for the VERY FIRST stat dropdown (statNameSelect_0).');
        }
        const statSelect = event.target;
        const tweakEntryDiv = statSelect.closest('.tweak-entry');
        if (!tweakEntryDiv) { console.error("Could not find parent .tweak-entry for stat select"); return; }
        const customInput = tweakEntryDiv.querySelector('.customStatInputField');
        if (!customInput) { console.error("CRITICAL: .customStatInputField not found!", tweakEntryDiv); return; }
        console.log(`Current customStatInputField display style: '${customInput.style.display}'`);
        if (statSelect.value === '_custom_') { customInput.style.display = 'inline-block'; }
        else { customInput.style.display = 'none'; customInput.value = ''; }
        console.log(`New customStatInputField display style: '${customInput.style.display}'`);
    }

    function handleUnitDropdownChange(event) {
        if (event.target.id === 'unitNameSelect_0') {
            console.log('Handling change for the VERY FIRST unit dropdown (unitNameSelect_0).');
        }
        console.log('Unit dropdown changed:', event.target);
        console.log('Selected unit option value:', event.target.value);
        const unitSelect = event.target;
        const tweakEntryDiv = unitSelect.closest('.tweak-entry');
        console.log('Parent tweak entry div:', tweakEntryDiv);
        if (!tweakEntryDiv) { console.error('CRITICAL: Parent .tweak-entry not found!'); return; }
        const customUnitInput = tweakEntryDiv.querySelector('.customUnitNameInput');
        console.log('Found customUnitNameInput element:', customUnitInput);
        if (!customUnitInput) { console.error('CRITICAL: customUnitNameInput not found!', tweakEntryDiv); return; }
        console.log(`Current customUnitNameInput display style: '${customUnitInput.style.display}'`);
        if (unitSelect.value === '_custom_') { customUnitInput.style.display = 'inline-block'; }
        else { customUnitInput.style.display = 'none'; customUnitInput.value = ''; }
        console.log(`New customUnitNameInput display style: '${customUnitInput.style.display}'`);
    }

    if (tweakEntriesContainer) {
        tweakEntriesContainer.addEventListener('change', function(event) {
            const target = event.target;
            if (target.classList.contains('statNameSelect')) {
                console.log('Change event delegated for statNameSelect.');
                handleStatDropdownChange(event);
                 target.dataset.selectedValue = target.value; // Store selection
            } else if (target.classList.contains('unitNameSelect')) {
                console.log('Change event delegated for unitNameSelect.');
                handleUnitDropdownChange(event);
                 target.dataset.selectedValue = target.value; // Store selection
            }
        });
    }

    function updateRemoveButtons() { /* ... (no changes here) ... */ }

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
                <input type="text" id="customStatInputField_${entryIndex}" name="customStatInputField_${entryIndex}" class="customStatInputField" style="display:none; margin-top: 5px;" placeholder="Enter custom stat name">
            </div>
            <div>
                <label for="statValue_${entryIndex}">New Value:</label>
                <input type="text" id="statValue_${entryIndex}" name="statValue_${entryIndex}" class="statValueInput">
            </div>
            <button type="button" class="removeTweakButton">Remove</button>
        `;
        const unitSelect = entryDiv.querySelector(`#unitNameSelect_${entryIndex}`);
        const statSelect = entryDiv.querySelector(`#statNameSelect_${entryIndex}`);

        populateUnitSelect(unitSelect);
        populateStatSelect(statSelect);

        const removeButton = entryDiv.querySelector('.removeTweakButton');
        removeButton.addEventListener('click', () => { entryDiv.remove(); updateRemoveButtons(); });

        return entryDiv;
    }

    if (addTweakButton) {
        addTweakButton.addEventListener('click', () => {
            tweakEntryCounter++;
            const newEntry = createTweakEntry(tweakEntryCounter);
            tweakEntriesContainer.appendChild(newEntry);
            updateRemoveButtons();
        });
    }

    // Initial Setup
    buildUnitGroupsData(); // Build the unitGroups data once
    // Ensure unitGroupFiltersContainer is valid before calling initializeUnitGroupFilters
    if (unitGroupFiltersContainer) {
        initializeUnitGroupFilters(); // Then initialize filters (which uses unitGroups)
    } else {
        console.error("unitGroupFiltersContainer is null, skipping initializeUnitGroupFilters.");
    }

    const initialUnitSelect = document.getElementById('unitNameSelect_0');
    const initialStatSelect = document.getElementById('statNameSelect_0');
    const initialRemoveButton = document.querySelector('.tweak-entry:first-child .removeTweakButton');

    if (initialUnitSelect && initialStatSelect) {
        console.log('Populating initial (0th) tweak entry dropdowns.');
        populateUnitSelect(initialUnitSelect);
        populateStatSelect(initialStatSelect);
        if(initialRemoveButton){
            initialRemoveButton.addEventListener('click', () => {
                initialRemoveButton.parentElement.remove();
                updateRemoveButtons();
            });
        }
    } else {
        console.error('Initial unit or stat select not found!');
    }
    updateRemoveButtons();

    if (generateButton) { /* ... (Generate All Tweaks logic - no fundamental changes here, only relies on correct values from selects) ... */ }

    // --- Generate All Tweaks logic (shortened for brevity, no functional change from previous correct version) ---
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            console.log('Generate All Tweaks button click event fired!');
            messagesDiv.textContent = '';
            messagesDiv.className = '';
            const allEntries = tweakEntriesContainer.querySelectorAll('.tweak-entry');
            let combinedTweaks = {};
            let validationFailed = false;

            allEntries.forEach((entryDiv, index) => {
                if (validationFailed) return;
                let unitNameValue = entryDiv.querySelector('.unitNameSelect').value;
                const customUnitNameInput = entryDiv.querySelector('.customUnitNameInput');
                let statNameValue = entryDiv.querySelector('.statNameSelect').value;
                const customStatInputField = entryDiv.querySelector('.customStatInputField');
                const statValueRaw = entryDiv.querySelector('.statValueInput').value;
                const statValueTrimmed = statValueRaw.trim();

                if (unitNameValue === '_custom_') {
                    unitNameValue = customUnitNameInput.value.trim();
                    if (!unitNameValue) { displayMessage(`Error in Entry #${index + 1}: Custom unit name empty.`, 'error-message'); validationFailed = true; return; }
                }
                if (statNameValue === '_custom_') {
                    statNameValue = customStatInputField.value.trim();
                    if (!statNameValue) { displayMessage(`Error in Entry #${index + 1}: Custom stat name empty.`, 'error-message'); validationFailed = true; return; }
                }
                if (!unitNameValue) { displayMessage(`Error in Entry #${index + 1}: Unit Name empty.`, 'error-message'); validationFailed = true; return; }
                if (!statNameValue) { displayMessage(`Error in Entry #${index + 1}: Stat Name empty.`, 'error-message'); validationFailed = true; return; }
                if (!statValueTrimmed) { displayMessage(`Error in Entry #${index + 1}: New Value empty.`, 'error-message'); validationFailed = true; return; }

                let formattedStatValue;
                const currentStatNameLower = statNameValue.toLowerCase();
                if (knownNumericStats.has(currentStatNameLower)) {
                    const numValue = parseFloat(statValueTrimmed);
                    if (!isNaN(numValue)) formattedStatValue = numValue;
                    else { console.warn(`Value '${statValueTrimmed}' for numeric stat '${statNameValue}' is not number. Treating as string.`); formattedStatValue = `"${statValueTrimmed.replace(/"/g, '\\"')}"`; }
                } else formattedStatValue = `"${statValueTrimmed.replace(/"/g, '\\"')}"`;

                if (!combinedTweaks[unitNameValue]) combinedTweaks[unitNameValue] = {};
                combinedTweaks[unitNameValue][statNameValue] = formattedStatValue;
            });

            if (validationFailed) { luaOutputTextarea.value = ''; base64OutputTextarea.value = ''; return; }

            let luaStringParts = [];
            for (const unit in combinedTweaks) {
                let unitStatParts = [];
                for (const stat in combinedTweaks[unit]) unitStatParts.push(`    ${stat} = ${combinedTweaks[unit][stat]}`);
                luaStringParts.push(`  ${unit} = {\n${unitStatParts.join(',\n')}\n  }`);
            }
            const luaString = `{\n${luaStringParts.join(',\n')}\n}`;
            luaOutputTextarea.value = luaString;
            const encoder = new TextEncoder();
            const luaBytes = encoder.encode(luaString);
            const standardBase64 = base64js.fromByteArray(luaBytes);
            let urlSafeBase64 = standardBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            base64OutputTextarea.value = urlSafeBase64;
            displayMessage('All tweaks generated successfully!', 'success-message');
            console.log('Generate All Tweaks processing complete.');
        });
    }

});
