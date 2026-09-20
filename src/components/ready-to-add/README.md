# Ready to Add (ported)

`ready-to-add.tsx` and `icons.tsx` are copied verbatim from the Component Lab
(`~/Developer/PersonalPortfolio/Components/src/lab/ready-to-add/`), where this
component is actually developed — its NOTES.md, demo harness, and Figma
provenance live there. **The lab is the source of truth**: iterate there,
then re-copy both files here. Don't patch this copy in place, or the two
will drift the way band-card once did in BlueprintX.

`demo-data.ts` is the lab demo's sample record (the MSRP resource from
`demo.tsx`), carried over the same way — the card is a pure render of its
props, so the data travels with the port.

The portfolio consumes it through `shell/live-demo-tile.tsx` — the
components-gallery tile that plays its recording while it's the primary
card in the scroll, and swaps in this live card on hover.
