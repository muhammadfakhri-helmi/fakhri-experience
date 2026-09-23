# ASSUMPTIONS AND VISUAL CONVENTIONS

All items here are ILLUSTRATIVE and are resolved from source `VIZ` so the scene holds no hardcoded engineering numbers.

| Item | Convention | Why |
|---|---|---|
| Pipe / housing diameters | Drawn ×1.5 (`viz.radialScale`) | Visibility of concentric strings |
| Riser diameter at GLOBAL scale | Further thickened | Otherwise sub-pixel over a compressed 600 m column |
| Water column | 25 m → MSL drawn at 0.15 height (`viz.waterColumnScale`) | Fit rig and wellhead in one view |
| Well below −60 m | Log-compressed (`viz.depthCompressFrom`) | 2.6 km of casing in one view; badge "DEPTH VISUALLY COMPRESSED" |
| Axial movement | ×100 (`viz.axialAmplification`); actual value shown alongside | 22.9 mm is invisible at true scale |
| Riser deflection with offset | Spline pinned at LFJ and rig, exponent `viz.riserOffsetShapeExp` | No displacement profile published |
| Current bow of riser | `viz.currentBow` | Concept only |
| Stack / conductor lean with offset | `viz.conductorDeflectionPerM` per metre offset | Conveys load path; no displacement data |
| VIV mode shape | Sine of reported mode number, amplitude `viz.vivAmplitude`, time ×`viz.vivTimeScale` | Frequencies reported; amplitude/coordinates not |
| Wave cycling | Heave/sway `viz.waveHeave`, not scaled to Hs | Concept of cyclic loading |
| RAO rings | Concept graphic only | RAOs published as charts, no matrices |
| Hull form, BOP/LMRP/THS shapes | Generic massing from reported heights/weights | No CAD supplied |
| Offset envelope outline | Digitised from published figures (DERIVED) | Status uses reported discrete limits (governing, symmetric) |
| Bending-moment profile | Digitised peaks and normalised shape (DERIVED) | For the 1-yr storm case only |
| Point of fixity | Placed at the top of cement (qualitative, from report narrative) | No numeric fixity depth published |
| Damage decomposition | Damage rate = 1 / factored life (DERIVED); ">10 y" drawn as zero | Shows why combined life is lower |
| Identities | Operator, contractor, rig, field, document numbers withheld | Knowledge delivery, not attribution |
