import { PDFDocument, rgb } from "pdf-lib";
import fontkitImport from "@pdf-lib/fontkit";
import {
  HEADER_LINES,
  LABELS,
  NOTE_LINES,
  PASSPORT_NOTE,
  TITLE_LINES,
} from "./formCopy";

const fontkit = fontkitImport.default || fontkitImport;

const PAGE_WIDTH = 595.5;
const PAGE_HEIGHT = 842;
const INK = rgb(0, 0, 0);

const toPdfY = (topY) => PAGE_HEIGHT - topY;

function drawLine(page, x1, y1, x2, y2) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness: 1,
    color: INK,
  });
}

function fittedSize(font, text, maxWidth, maxSize, minSize = 8) {
  if (!text) {
    return maxSize;
  }

  let size = maxSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.25;
  }
  return size;
}

function drawFittedText(page, font, text, x, y, maxWidth, maxSize) {
  if (!text) {
    return;
  }

  const size = fittedSize(font, text, maxWidth, maxSize);
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: INK,
  });
}

function asFontBytes(input) {
  if (!input) {
    throw new Error("Missing font bytes");
  }
  if (typeof input === "string" || input instanceof ArrayBuffer) {
    return input;
  }
  return new Uint8Array(input);
}

// Box edges from the official Word 2016 form (A4), left side of each vertical rule.
const JMBG_EDGES = [
  291.4, 309.9, 328.5, 347.0, 365.6, 384.2, 402.7, 421.3, 439.8, 458.4, 476.9,
  495.5, 514.1, 532.5,
];

function jmbgBoxCenters() {
  return JMBG_EDGES.slice(0, -1).map(
    (start, index) => (start + JMBG_EDGES[index + 1]) / 2
  );
}

function drawFormChrome(page, regularFont, boldFont) {
  page.drawText(HEADER_LINES[0], {
    x: 72,
    y: toPdfY(85.4),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText(HEADER_LINES[1], {
    x: 72,
    y: toPdfY(99.2),
    size: 12,
    font: regularFont,
    color: INK,
  });

  const titleWidths = TITLE_LINES.map((line, index) =>
    (index === 0 ? boldFont : boldFont).widthOfTextAtSize(line, 12)
  );
  const titleXs = titleWidths.map((width) => (PAGE_WIDTH - width) / 2);

  page.drawText(TITLE_LINES[0], {
    x: titleXs[0],
    y: toPdfY(140.9),
    size: 12,
    font: boldFont,
    color: INK,
  });
  page.drawText(TITLE_LINES[1], {
    x: titleXs[1],
    y: toPdfY(154.7),
    size: 12,
    font: boldFont,
    color: INK,
  });
  page.drawText(TITLE_LINES[2], {
    x: titleXs[2],
    y: toPdfY(168.5),
    size: 12,
    font: boldFont,
    color: INK,
  });

  page.drawText("1. Име и презиме", {
    x: 82.2,
    y: toPdfY(228.8),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("2. Име једног родитеља", {
    x: 82.2,
    y: toPdfY(253.9),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("3. Јединствени матични број грађана", {
    x: 82.2,
    y: toPdfY(304.1),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("4. Адреса пребивалишта у Р. Србији", {
    x: 82.2,
    y: toPdfY(331.6),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("5. Адреса боравка у иностранству", {
    x: 82.2,
    y: toPdfY(356.6),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("6. Град, држава – где желим да гласам", {
    x: 82.2,
    y: toPdfY(381.2),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("у иностранству", {
    x: 102,
    y: toPdfY(395.1),
    size: 12,
    font: regularFont,
    color: INK,
  });

  const ruleRight = 532.8;
  drawLine(page, 291.6, toPdfY(234.6), ruleRight, toPdfY(234.6));
  drawLine(page, 291.6, toPdfY(259.7), ruleRight, toPdfY(259.7));
  drawLine(page, 291.6, toPdfY(337.4), ruleRight, toPdfY(337.4));
  drawLine(page, 291.6, toPdfY(362.4), ruleRight, toPdfY(362.4));
  drawLine(page, 291.6, toPdfY(398.0), ruleRight, toPdfY(398.0));

  const jmbgTop = toPdfY(284.8);
  const jmbgBottom = toPdfY(312.6);
  JMBG_EDGES.forEach((x) => {
    drawLine(page, x, jmbgBottom, x, jmbgTop);
  });
  drawLine(page, JMBG_EDGES[0], jmbgTop, JMBG_EDGES[JMBG_EDGES.length - 1], jmbgTop);
  drawLine(
    page,
    JMBG_EDGES[0],
    jmbgBottom,
    JMBG_EDGES[JMBG_EDGES.length - 1],
    jmbgBottom
  );

  page.drawText(PASSPORT_NOTE, {
    x: 102,
    y: toPdfY(475.0),
    size: 12,
    font: regularFont,
    color: INK,
  });

  drawLine(page, 128.7, toPdfY(525.8), 212.4, toPdfY(525.8));
  drawLine(page, 341.8, toPdfY(550.4), ruleRight, toPdfY(550.4));
  drawLine(page, 341.8, toPdfY(606.7), ruleRight, toPdfY(606.7));
  drawLine(page, 341.8, toPdfY(659.3), ruleRight, toPdfY(659.3));
  drawLine(page, 66.6, toPdfY(728.0), ruleRight, toPdfY(728.0));

  page.drawText(LABELS.date, {
    x: 159.6,
    y: toPdfY(542.4),
    size: 10,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.signature, {
    x: 420.8,
    y: toPdfY(566.4),
    size: 9,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.phone, {
    x: 408.1,
    y: toPdfY(622.7),
    size: 9,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.email, {
    x: 421.0,
    y: toPdfY(675.2),
    size: 9,
    font: regularFont,
    color: INK,
  });

  NOTE_LINES.forEach((line, index) => {
    page.drawText(line, {
      x: 72,
      y: toPdfY(755.8 + index * 10.35),
      size: 9,
      font: regularFont,
      color: INK,
    });
  });
}

async function embedSignature(pdfDoc, page, signatureDataUrl) {
  if (!signatureDataUrl || !signatureDataUrl.startsWith("data:image")) {
    return;
  }

  const base64 = signatureDataUrl.split(",")[1];
  if (!base64) {
    return;
  }

  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const image = signatureDataUrl.includes("image/jpeg")
    ? await pdfDoc.embedJpg(bytes)
    : await pdfDoc.embedPng(bytes);

  const maxWidth = 180;
  const maxHeight = 48;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  page.drawImage(image, {
    x: 348,
    y: toPdfY(550.4),
    width,
    height,
  });
}

export async function generateVoterPdf(values, fonts) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Keep the full Cyrillic font. Subsetting can drop Serbian letters such as Б and л.
  const regularFont = await pdfDoc.embedFont(asFontBytes(fonts.regular), {
    subset: false,
  });
  const boldFont = await pdfDoc.embedFont(asFontBytes(fonts.bold), {
    subset: false,
  });
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  drawFormChrome(page, regularFont, boldFont);

  const fieldWidth = 232;
  drawFittedText(
    page,
    regularFont,
    values.fullName,
    296,
    toPdfY(232.4),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.parentName,
    296,
    toPdfY(257.5),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.serbiaAddress,
    296,
    toPdfY(335.2),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.abroadAddress,
    296,
    toPdfY(360.2),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.voteCityCountry,
    296,
    toPdfY(395.8),
    fieldWidth,
    12
  );

  const jmbg = String(values.jmbg || "").replace(/\D/g, "").slice(0, 13);
  jmbgBoxCenters().forEach((center, index) => {
    const digit = jmbg[index];
    if (!digit) {
      return;
    }
    const size = 14;
    const width = regularFont.widthOfTextAtSize(digit, size);
    page.drawText(digit, {
      x: center - width / 2,
      y: toPdfY(306.4),
      size,
      font: regularFont,
      color: INK,
    });
  });

  drawFittedText(page, regularFont, values.date, 132, toPdfY(523.6), 76, 12);
  drawFittedText(page, regularFont, values.phone, 348, toPdfY(604.5), 180, 11);
  drawFittedText(page, regularFont, values.email, 348, toPdfY(657.1), 180, 11);

  await embedSignature(pdfDoc, page, values.signatureDataUrl);

  return pdfDoc.save();
}

export function buildPdfFilename(fullName) {
  const slug = String(fullName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .slice(0, 40);

  return slug
    ? `zahtev-glasanje-inostranstvo-${slug}.pdf`
    : "zahtev-glasanje-inostranstvo.pdf";
}
