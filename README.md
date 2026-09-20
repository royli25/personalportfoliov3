# Portfolio V3

Figma frame `10:6` in `3CmUPYHoDdhxMMAJ4IAWKx`, built on the V2 Next.js / React stack.

```sh
npm install
npm run dev
# http://localhost:3003
npm run typecheck
npm run build
```

V2 remains independent. V3 includes a snapshot of all V2 public assets, project data, case studies, interactive components and the BluePrint demo.

- Home UI: `src/components/v3/portfolio.tsx`
- V3 styling: `src/app/v3.css`
- Project copy: `src/data/site.ts` and `src/data/case-studies.ts`
- Gallery contents: `public/visuals/` and `public/components/` (read at build time)
- Exact exported Figma artwork: `public/figma/`
- Playground: `/playground`; standalone BluePrint: `/demo/blueprintx`

Recent Thoughts retains the supplied design's draft titles. Dates and article links are not available, so entries are labelled Draft. X, LinkedIn and Substack labels are unavailable until real profile URLs are supplied. The email link works. The desktop corner opens the preserved playground.
