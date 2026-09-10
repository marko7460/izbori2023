# Захтев за гласање у иностранству

Client-side helper for the official Serbian request to be listed as voting abroad
(*Zahtev za upis u birački spisak podatka da će birač glasati u inostranstvu*).

**Live site:** [glasajmo.org](https://glasajmo.org/)

Fill the form, sign it, and save a PDF on your phone or computer. The PDF is built in the browser. Nothing is uploaded or stored on a server.

Попуните службени захтев, потпишите га и сачувајте PDF на свој уређај. Подаци остају код вас.

## What it does

- Collects the fields from the current official document, including parent’s name and a 13-digit JMBG drawn into character boxes
- Shows a live A4 preview of the filled form
- Lets you sign on a canvas
- Saves a one-page PDF locally (`Сачувај PDF на уређај`): share sheet on phones, download on laptops
- Offers print as a fallback
- Warns if required fields are empty, but still lets you save

After saving, attach a copy of a Serbian passport or ID card and send the request to a diplomatic-consular mission of the Republic of Serbia (in person, by post, fax, or email), as noted on the form.

The legal citation on the document is Article 16, paragraph 1 of the Law on the Unified Voter Register (*Zakon o Jedinstvenom biračkom spisku*, Official Gazette of RS Nos. 104/09, 99/11, 44/24 and 96/25).

## Privacy

No form values are sent to Firebase, analytics, or any backend. The only network requests are the page itself and the Liberation Serif fonts used to draw Cyrillic in the PDF.

## Local development

This is a [Create React App](https://github.com/facebook/create-react-app) project. Node.js and npm (or Yarn) are required.

```bash
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000). The page reloads on edits.

```bash
npm test          # Jest, interactive watch mode
npm test -- --watchAll=false
npm run build     # production bundle in build/
```

CI uses `npm ci && npm run build`. Do not run `npm run eject` unless you intend to take over the webpack/Babel config permanently.

## How the app is structured

| Path | Role |
| --- | --- |
| `src/VoterForm.js` | Form UI, validation, signature pad, save/print actions |
| `src/OfficialDocument.js` | On-screen A4 preview of the official layout |
| `src/lib/formCopy.js` | Official Serbian labels, notes, and empty values |
| `src/lib/generatePdf.js` | Builds the A4 PDF with `pdf-lib` and Liberation Serif |
| `src/lib/savePdf.js` | Web Share API on mobile; file download on desktop |
| `src/lib/jmbg.js` | Keeps JMBG input to 13 digits (no checksum check) |
| `public/fonts/` | Liberation Serif Regular/Bold (SIL Open Font License) |

The PDF filename looks like `zahtev-glasanje-inostranstvo-<name>.pdf`. On iOS, the share payload is the PDF file only, so the system does not also save a leftover text file.

## Deployment

Static hosting on Firebase (`izbori2023formular`), with the custom domain **glasajmo.org**.

GitHub Actions deploys on every merge to `master` (live channel) and publishes a preview channel for pull requests. See `.github/workflows/`.

To deploy locally you need the Firebase CLI and project credentials:

```bash
npm run build
npx firebase deploy --only hosting
```

## License

Application source is under the Apache License 2.0 (`src/LICENSE`). Liberation Serif fonts are under the SIL Open Font License 1.1 (`public/fonts/LICENSE-LiberationSerif.txt`).
