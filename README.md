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

**Interface Guide:**
*   **Unit Name**: Select the unit you want to modify from the dropdown list. The list includes the readable name and the internal unit definition name (e.g., Pawn (armpw)).
*   **Stat to Modify**: Select the specific unit statistic you wish to change from the dropdown list (e.g., `metalcost`, `health`). The list currently contains common stats and may be expanded in the future.
*   **New Value**: Enter the desired new value for the selected statistic.
*   Click the **Generate Tweak** button.

**Output:**
*   **Generated Lua Table**: Shows the Lua code snippet that represents your tweak. This is for informational purposes.
*   **Base64 Command String**: This is the URL-safe Base64 encoded string you need for the game. Copy this string.
*   To apply the tweak in Beyond All Reason, use the in-game command: `!bset tweakunits <copied_base64_string>` (remember to boss yourself first using `!boss`, and ensure the copied string does not have any extra spaces or characters).

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
