# Cedar Ledger control

Standalone browser-only comparison of the existing business workspace design. Reuses the project's CSS; independently written plain HTML/JS. No chain SDK, contract, authentication, database or backend API. The current version includes a minimal MetaMask connection button that requests a public address only. USD values and payment actions are simulated bookkeeping. State persists in localStorage for this origin.

Purpose: compare URL security classification after removing the original blockchain integration. Different branding, code/runtime and deployment also change, so this is not a single-variable experiment and does not establish why another site is flagged.

Files to deploy: index.html, app.js, wallet.js, styles.css, control.css, favicon.svg (plus vercel.json when using that host). Do not treat a lack of warning as a security certification.

## Hosted comparison — 2026-10-23

### Independent hosting: GitHub Pages

- Live: https://maixuancanh.github.io/cedar-ledger-control/
- Source: https://github.com/maixuancanh/cedar-ledger-control
- GitHub Pages build completed; fetched page returns HTTP 200 with server GitHub.com, no redirect to Vercel.
- Same demo/browser checks pass; only application origin and Google Fonts requests observed. Evidence: github-pages-browser-evidence.json.
- MetaMask public scanner returns `{"hostname":"maixuancanh.github.io","recommendedAction":"BLOCK"}` for both the full project URL and account hostname. Evidence: github-pages-scan.json.
- This does not establish a Vercel-specific cause. The result concerns the shared account hostname and does not identify the project or content responsible. A scanner result alone does not reproduce an installed wallet extension alert.

### Vercel comparison

- URL: https://cedar-ledger-control.vercel.app
- Separate Vercel project: cedar-ledger-control. Deployment: dpl_Cpg5Fjde6TvSLTnYuKy7fkhNWKT6.
- Browser verification passed: create/verify/reserve/mark-paid, balance conservation, reload persistence, 390px no page overflow, zero JavaScript/console errors. Observed requests only to the application origin and Google Fonts; no backend or blockchain calls. See browser-evidence.json.
- MetaMask public URL scanner still returned BLOCK for this independent domain. Original application also returned BLOCK; app.uniswap.org returned VERIFIED as a known-site control. See security-scan.json.
- Therefore removing the chain integration did not eliminate the public scanner classification in this experiment. This does not identify the reason or prove that any particular contract is safe/unsafe. The scanner provides no reason. Because this version has no wallet connect, an actual wallet connection warning was not reproduced here.

## Minimal wallet connection added

The Connect MetaMask button uses EIP-6963 discovery, with an injected MetaMask fallback. The only wallet RPC request is eth_requestAccounts, issued after a user click. No signature, network switch, balances, contract calls, token approvals or transaction requests. The returned address stays in page memory and is not sent to a backend. Clear connection resets the display; it does not revoke wallet site permissions. Previous no-wallet browser/scan evidence describes the earlier version and does not validate the new connection behavior in an actual MetaMask extension.
