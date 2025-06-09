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
