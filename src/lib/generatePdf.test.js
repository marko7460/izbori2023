import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";
import {
  buildPdfFilename,
  generateVoterPdf,
  layoutMultilineField,
} from "./generatePdf";

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

  test("wraps long multiline voting locations cleanly without overflowing", async () => {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const regularFont = await doc.embedFont(new Uint8Array(fonts.regular), {
      subset: false,
    });

    const single = layoutMultilineField(regularFont, "Берлин, Немачка");
    expect(single.lines).toEqual(["Берлин, Немачка"]);
    expect(single.size).toBe(12);
    expect(single.baselines).toEqual([310.5]);
    expect(single.ruleY).toBe(312.7);

    const exampleText =
      "Делта, Британска Колумбија, Канада, или најближе место граду Ванкуверу";
    const wrapped = layoutMultilineField(regularFont, exampleText);
    expect(wrapped.lines.length).toBe(2);
    expect(wrapped.size).toBe(12);
    expect(wrapped.ruleY).toBe(312.7);
    wrapped.lines.forEach((line) => {
      expect(regularFont.widthOfTextAtSize(line, wrapped.size)).toBeLessThanOrEqual(
        232
      );
    });

    const explicitBreaks = layoutMultilineField(
      regularFont,
      "Делта, Британска Колумбија, Канада,\nили најближе место граду Ванкуверу\n(конзулат у Ванкуверу)"
    );
    expect(explicitBreaks.lines.length).toBe(3);
    expect(explicitBreaks.ruleY).toBeGreaterThan(312.7);
    expect(explicitBreaks.ruleY).toBeLessThanOrEqual(350);

    const veryLong = layoutMultilineField(
      regularFont,
      "Линија 1\nЛинија 2\nЛинија 3\nЛинија 4\nЛинија 5\nЛинија 6"
    );
    expect(veryLong.size).toBeLessThan(12);
    expect(veryLong.ruleY).toBeLessThanOrEqual(350);

    const unbroken = layoutMultilineField(regularFont, "А".repeat(60));
    expect(unbroken.lines.length).toBeGreaterThan(1);
    unbroken.lines.forEach((line) => {
      expect(
        regularFont.widthOfTextAtSize(line, unbroken.size)
      ).toBeLessThanOrEqual(232);
    });

    const pdfBytes = await generateVoterPdf(
      {
        fullName: "Марко Петровић",
        parentName: "Јован",
        jmbg: "0101990710121",
        serbiaAddress: "Кнеза Милоша 1, Београд",
        voteCityCountry: exampleText,
        date: "27.11.2026.",
        phone: "+1 604 555 0100",
        email: "marko@example.com",
        signatureDataUrl: tinyPng(),
      },
      fonts
    );
    const loaded = await PDFDocument.load(pdfBytes);
    expect(loaded.getPageCount()).toBe(1);
  });
});
