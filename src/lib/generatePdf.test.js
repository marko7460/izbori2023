import fs from "fs";
import path from "path";
import { buildPdfFilename, generateVoterPdf } from "./generatePdf";

const fonts = {
  regular: fs.readFileSync(
    path.join(__dirname, "../../public/fonts/LiberationSerif-Regular.ttf")
  ),
  bold: fs.readFileSync(
    path.join(__dirname, "../../public/fonts/LiberationSerif-Bold.ttf")
  ),
};

function tinyPng() {
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
  return `data:image/png;base64,${png}`;
}

describe("generateVoterPdf", () => {
  test("builds a Cyrillic filename", () => {
    expect(buildPdfFilename("Марко Петровић")).toBe(
      "zahtev-glasanje-inostranstvo-марко-петровић.pdf"
    );
    expect(buildPdfFilename("")).toBe("zahtev-glasanje-inostranstvo.pdf");
  });

  test("creates a one-page PDF with the filled values", async () => {
    const pdfBytes = await generateVoterPdf(
      {
        fullName: "Марко Петровић",
        parentName: "Јован",
        jmbg: "0101990710121",
        serbiaAddress: "Кнеза Милоша 1, Београд",
        abroadAddress: "Main Street 10, Berlin",
        voteCityCountry: "Берлин, Немачка",
        date: "10.09.2026.",
        phone: "+49 151 000000",
        email: "marko@example.com",
        signatureDataUrl: tinyPng(),
      },
      fonts
    );

    expect(pdfBytes.byteLength).toBeGreaterThan(100000);

    const { PDFDocument } = await import("pdf-lib");
    const document = await PDFDocument.load(pdfBytes);
    expect(document.getPageCount()).toBe(1);
    const page = document.getPage(0);
    expect(Math.round(page.getWidth())).toBe(596);
    expect(Math.round(page.getHeight())).toBe(842);

    if (process.env.WRITE_SAMPLE_PDF) {
      fs.writeFileSync("/tmp/generated-form.pdf", Buffer.from(pdfBytes));
    }
  });
});
