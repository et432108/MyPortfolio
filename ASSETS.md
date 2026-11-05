# Asset sources

Persona character artwork and audio © ATLUS / SEGA. Portfolio content © Ethan Pacheco. React and other bundled dependencies retain their own licenses; bundled license notices are in `dist/react-app.js.LEGAL.txt`.

The presentation uses assets extracted from the author's installed Steam copy of Persona 5 Royal. Original game archives were read-only; conversion and rendering used workspace copies. The repository contains the files used by the website, rather than the raw game archives or extraction workspace.

## Original artwork and audio

| Screen or element | Original source |
| --- | --- |
| Main menu | `BASE.CPK / CAMP/HEROTEX/P5_CAMPTOP_2D.DDS` |
| Profile | `BASE.CPK / CAMP/HEROTEX/P5_CAMPPARTY_2D.DDS` |
| Projects | `BASE.CPK / CAMP/HEROTEX/P5_CAMPITEM_2D01.DDS` |
| Experience | `BASE.CPK / CAMP/HEROTEX/P5_CAMPCOOP_2D01.DDS` |
| Skills | `BASE.CPK / CAMP/HEROTEX/P5_CAMPSKILL_2D01.DDS` |
| Résumé | `BASE.CPK / CAMP/HEROTEX/P5_CAMPSYSTEM_2D.DDS` |
| Contact | `BASE.CPK / CAMP/HEROTEX/P5_CAMPMISSION_2D.DDS` |
| Lettering / COMMAND | `EN.CPK / INIT/P5CAMP_00SPD.SPD`, atlas indices 3, 5, 7 |
| Selection shape | `EN.CPK / INIT/CAMP.PLG`, object 36 |
| Star background | `BASE.CPK / MINIGAME/FUGOU/STAR_BG.DDS` |
| Menu sounds | `SOUND_E.CPK / SOUND/SYSTEM.ACB` and `SYSTEM.AWB`, streams 170, 172, 177, 224 |

DDS artwork was converted to PNG using DirectXTex texconv. The selection geometry was converted to SVG from its original vertices and indices. CSS and JavaScript implement the portfolio layout and background movement.

## Animation

The model, skeleton, and textures originated in `BASE.CPK / INIT/MENU_C0001_001_A.GMD`; skeletal clips originated in `BASE.CPK / INIT/MENU_C0001_001_A.GAP`.

The runtime plays 297 frames across seven transitions, sampled for 120 Hz playback. Actual visible frame rate depends on the display and browser. The frame manifest identifies each sequence, timing, image rectangle, and original landing illustration. Frames are decoded before playback.

Profile uses Steam clip 45, retimed into a 0.5-second entrance, with the source head and neck transforms intact. A fitted whole-model camera follows the intended movement. An ink reveal introduces the Stats drawing, and the whole head/neck/collar/shoulder region switches together. The final frame matches the original illustration. The menu route remains ID 20.

Other transitions preserve the existing fitted cameras and terminal pose adjustments. Contact uses movement 35 and the phone illustration; Résumé uses 41 and its corresponding artwork. These are custom web adaptations of game assets, not an exact port of the game's renderer or transitions. Reference videos were used for comparison and are not embedded in the site.
