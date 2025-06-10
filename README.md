TypeScript based tool for Beyond All Reason players that simplifies the process of creating tweaks.

## Important

Whenever playing in a public lobby make sure people playing with you actually want to play it modded. Be polite and don't try to force it.

You will be required to boss yourself to be able to set the mod options.

## Tweak Units: Basic edits to specific units

- Find the units unitdefname in the unitNames file in this repository. For example: for pawn it's armpw.

- Consult the units file under within the units folder to check the current stats. For example: for pawn it's /units/ArmBots/armpw.lua

- Create a table representing the changes. For example, to change pawns metal cost to 10:
```lua
{
  armpw = { metalcost = 10 }
}
```


- Encode the table representation into base64. You can use https://www.base64encode.org/ for that. Make sure to tick "Perform URL-safe encoding" as shown in the image below. For example, using the above table the result is: `ewogIGFybXB3ID0geyBtZXRhbGNvc3QgPSAxMCB9Cn0=`. 

- Boss yourself (`!boss`), remove the `=` and the end of the result and set the modoption before game, example: "!bset tweakunits ewogIGFybXB3ID0geyBtZXRhbGNvc3QgPSAxMCB9Cn0"

Notice the result is `ewogIGFybXB3ID0geyBtZXRhbGNvc3QgPSAxMCB9Cn0` instead of `ewogIGFybXB3ID0geyBtZXRhbGNvc3QgPSAxMCB9Cn0=`

## Tweak Defs: Much more advanced, allows to change stuff for all units, or group of units in much shorter piece of code.

- Create a function representing the changes. For example, to change all units metal cost to 10:
```lua
for name, ud in pairs(UnitDefs) do
  if ud.metalcost then
    ud.metalcost = 10
  end
end
```


- Encode the function representation into base64. You can use https://www.base64encode.org/ for that. Make sure to tick "Perform URL-safe encoding" as shown in the image below. For example, using the above function the result is: `Zm9yIG5hbWUsIHVkIGluIHBhaXJzKFVuaXREZWZzKSBkbwogIGlmIHVkLm1ldGFsY29zdCB0aGVuCiAgICB1ZC5tZXRhbGNvc3QgPSAxMAogIGVuZAplbmQ=`

- Boss yourself (`!boss`), remove the `=` and the end of the result and set the modoption before game, example: "!bset tweakunits Zm9yIG5hbWUsIHVkIGluIHBhaXJzKFVuaXREZWZzKSBkbwogIGlmIHVkLm1ldGFsY29zdCB0aGVuCiAgICB1ZC5tZXRhbGNvc3QgPSAxMAogIGVuZAplbmQ"

Notice the result is `Zm9yIG5hbWUsIHVkIGluIHBhaXJzKFVuaXREZWZzKSBkbwogIGlmIHVkLm1ldGFsY29zdCB0aGVuCiAgICB1ZC5tZXRhbGNvc3QgPSAxMAogIGVuZAplbmQ` instead of `Zm9yIG5hbWUsIHVkIGluIHBhaXJzKFVuaXREZWZzKSBkbwogIGlmIHVkLm1ldGFsY29zdCB0aGVuCiAgICB1ZC5tZXRhbGNvc3QgPSAxMAogIGVuZAplbmQ=`

## Additional References:

- [ZK Guide](http://zero-k.info/mediawiki/Quick_Stat_Tweaks#Simple_Example)

## WYSIWYG Tweak Generator (Local Web App)

This tool provides a user-friendly interface to generate unit tweaks without manually creating Lua tables and encoding them.

**How to Use:**
1.  Download the following files into the same directory on your computer:
    *   `index.html`
    *   `script.js`
    *   `style.css`
    *   `unitData.js`
2.  Open `index.html` in your web browser (e.g., Chrome, Firefox).

**Operating Modes:**
The tool now operates in two modes, selectable via radio buttons at the top:
*   **Tweak Specific Units**: This is the default mode for making changes to individual units as described in the "Interface Guide for Tweak Specific Units Mode" below.
*   **Tweak Definitions (Advanced Lua Script)**: This mode allows you to input a custom Lua script for more complex or global tweaks (similar to the 'Tweak Defs' section in the original part of this README). See "Interface Guide for Tweak Definitions Mode" further below.

**Interface Guide for Tweak Specific Units Mode:**
*   **Filter Unit Groups**:
    Above the list of tweak entries, you'll find a 'Filter Unit Groups' section. This area contains checkboxes for major unit factions or groups. To keep this filter list manageable, groups with very few units (e.g., 5 or fewer) are consolidated.
    - Initially, all groups are checked (visible).
    - Uncheck any group's checkbox to hide units belonging to that group from all 'Unit Name' selection dropdowns on the page. This can make it much easier to find specific units by reducing the list size.
    - Re-check a box to make the units from that group visible again in the dropdowns.
*   **Unit Name**: Select the unit you want to modify. Units are grouped by major factions (e.g., Armada (arm), Cortex (cor), etc.). Units belonging to very small or unique factions/categories are consolidated into an 'Other Units' group. All groups, including 'Other Units', and units within them, are sorted alphabetically. If the unit you want isn't listed (e.g., a modded unit or a very new one), select the 'Other (Enter Below)' option at the very end of the list. This will reveal a text input field where you can type the exact unit definition name (e.g., `mycustomunitdefname`).
*   **Stat to Modify**: Select the specific unit statistic you wish to change. If the stat you want isn't listed, select the 'Other (Enter Below)' option. This will reveal a text input field where you can type the exact name of the custom stat (e.g., `maxammo`). The predefined list currently contains common stats and may be expanded in the future.
*   **New Value**: Enter the desired new value for the selected statistic.
*   **Adding Multiple Tweaks**: Click the 'Add Another Tweak' button to add a new row for defining an additional tweak. You can add as many tweaks as needed.
*   **Removing a Tweak**: Each tweak entry (except if it's the only one) will have a 'Remove' button next to it. Click this to delete that specific tweak definition.

**Interface Guide for Tweak Definitions Mode:**
When you select the 'Tweak Definitions (Advanced Lua Script)' mode:
*   The interface for tweaking specific units (including filters and multiple entries) will be hidden.
*   A large text area will appear, labeled 'Enter Lua Script'.
*   Enter your complete Lua script directly into this text area. An example is provided in the placeholder.
*   Click the **Generate All Tweaks** button.
*   The 'Generated Lua Table' output area will show your entered script for verification.
*   The 'Base64 Command String' output area will show the Base64 encoded version of your entire script.
*   **Important**: For these types of tweaks, you must use the in-game command `!bset tweakdefs <copied_base64_string>` (note the `tweakdefs` instead of `tweakunits`). The tool will also remind you of this in the success message.

**General Operation (Applicable to Both Modes):**
*   **Generate Button**: The button labeled "Generate All Tweaks" processes the inputs based on the currently selected mode.
*   **Output**:
    *   **Generated Lua Table**: Shows the Lua code that will be encoded. In "Tweak Specific Units" mode, this is the combined table of all defined unit changes. In "Tweak Definitions" mode, this is a direct copy of your input script.
    *   **Base64 Command String**: This is the final URL-safe Base64 encoded string.
    *   **Applying Tweaks**: The method for applying tweaks depends on the mode used:
        *   For **Tweak Specific Units** mode: Use `!bset tweakunits <copied_base64_string>`.
        *   For **Tweak Definitions** mode: Use `!bset tweakdefs <copied_base64_string>`.
        (Remember to boss yourself first using `!boss`, and ensure the copied string does not have any extra spaces or characters).

## Web UI for Base64 URL-Safe Encoding/Decoding

This project also includes a simple web interface for URL-safe Base64 encoding and decoding.

**Files:**
- `index.html`: The main HTML file for the web interface.
- `script.js`: Contains the JavaScript logic for encoding/decoding, utilizing the `base64-js` library.
- `style.css`: Basic styling for the web interface.

**Library Used:**
- **base64-js**: A pure JavaScript Base64 encoder/decoder.
  - CDN Link: `https://cdn.jsdelivr.net/npm/base64-js@1.5.1/base64js.min.js`
  - This library is used to handle the Base64 operations. For URL-safe encoding, the standard Base64 output will be modified by replacing `+` with `-`, `/` with `_`, and removing any `=` padding. For decoding, these URL-safe characters will be converted back to their standard Base64 equivalents before decoding.
