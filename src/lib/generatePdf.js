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

function jmbgBoxCenters() {
  const edges = [
    292.5, 311.5, 330.5, 348.5, 367.5, 386.5, 405.5, 423.5, 442.5, 461.5,
    480.5, 498.5, 517.5, 540.5,
  ];
  return edges.slice(0, -1).map((start, index) => (start + edges[index + 1]) / 2);
}

function drawFormChrome(page, regularFont, boldFont) {
  page.drawText(HEADER_LINES[0], {
    x: 72,
    y: toPdfY(85.8),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText(HEADER_LINES[1], {
    x: 72,
    y: toPdfY(99.6),
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
    y: toPdfY(140.99),
    size: 12,
    font: boldFont,
    color: INK,
  });
  page.drawText(TITLE_LINES[1], {
    x: titleXs[1],
    y: toPdfY(154.79),
    size: 12,
    font: boldFont,
    color: INK,
  });
  page.drawText(TITLE_LINES[2], {
    x: titleXs[2],
    y: toPdfY(168.59),
    size: 12,
    font: boldFont,
    color: INK,
  });

  page.drawText("1. Име и презиме", {
    x: 82.5,
    y: toPdfY(229.04),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("2. Име једног родитеља", {
    x: 82.5,
    y: toPdfY(253.34),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("3. Јединствени матични број грађана", {
    x: 82.5,
    y: toPdfY(303.43),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("4. Адреса пребивалишта у Р. Србији", {
    x: 82.5,
    y: toPdfY(330.78),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("5. Адреса боравка у иностранству", {
    x: 82.5,
    y: toPdfY(355.83),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("6. Град, држава – где желим да гласам", {
    x: 82.5,
    y: toPdfY(380.88),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("у иностранству", {
    x: 102,
    y: toPdfY(394.68),
    size: 12,
    font: regularFont,
    color: INK,
  });

  drawLine(page, 293, toPdfY(234.5), 541, toPdfY(234.5));
  drawLine(page, 293, toPdfY(259.5), 541, toPdfY(259.5));
  drawLine(page, 292, toPdfY(284.5), 541, toPdfY(284.5));
  drawLine(page, 292, toPdfY(311.5), 541, toPdfY(311.5));
  drawLine(page, 293, toPdfY(336.5), 541, toPdfY(336.5));
  drawLine(page, 293, toPdfY(361.5), 541, toPdfY(361.5));
  drawLine(page, 293, toPdfY(387.5), 541, toPdfY(387.5));

  const jmbgTop = toPdfY(284.5);
  const jmbgBottom = toPdfY(311.5);
  [
    292.5, 311.5, 330.5, 348.5, 367.5, 386.5, 405.5, 423.5, 442.5, 461.5, 480.5,
    498.5, 517.5, 540.5,
  ].forEach((x) => {
    drawLine(page, x, jmbgBottom, x, jmbgTop);
  });

  page.drawText(PASSPORT_NOTE, {
    x: 72,
    y: toPdfY(453.63),
    size: 12,
    font: regularFont,
    color: INK,
  });

  drawLine(page, 129, toPdfY(493.5), 280, toPdfY(493.5));
  drawLine(page, 344, toPdfY(518.5), 541, toPdfY(518.5));
  drawLine(page, 344, toPdfY(564.5), 541, toPdfY(564.5));
  drawLine(page, 344, toPdfY(614.5), 541, toPdfY(614.5));
  drawLine(page, 129, toPdfY(683.5), 541, toPdfY(683.5));

  page.drawText(LABELS.date, {
    x: 129,
    y: toPdfY(512.43),
    size: 10,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.signature, {
    x: 425.75,
    y: toPdfY(534.78),
    size: 9,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.phone, {
    x: 394,
    y: toPdfY(580.68),
    size: 9,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.email, {
    x: 425,
    y: toPdfY(631.02),
    size: 9,
    font: regularFont,
    color: INK,
  });

  NOTE_LINES.forEach((line, index) => {
    page.drawText(line, {
      x: 72,
      y: toPdfY(711.02 + index * 10.35),
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
    x: 352,
    y: toPdfY(518.5),
    width,
    height,
  });
}

export async function generateVoterPdf(values, fonts) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFont = await pdfDoc.embedFont(asFontBytes(fonts.regular), {
    subset: true,
  });
  const boldFont = await pdfDoc.embedFont(asFontBytes(fonts.bold), {
    subset: true,
  });
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  drawFormChrome(page, regularFont, boldFont);

  const fieldWidth = 244;
  drawFittedText(
    page,
    regularFont,
    values.fullName,
    297,
    toPdfY(232.5),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.parentName,
    297,
    toPdfY(257.5),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.serbiaAddress,
    297,
    toPdfY(334.5),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.abroadAddress,
    297,
    toPdfY(359.5),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.voteCityCountry,
    297,
    toPdfY(385.5),
    fieldWidth,
    12
  );

  const jmbg = String(values.jmbg || "").replace(/\D/g, "").slice(0, 13);
  jmbgBoxCenters().forEach((center, index) => {
    const digit = jmbg[index];
    if (!digit) {
      return;
    }
    const size = 12;
    const width = regularFont.widthOfTextAtSize(digit, size);
    page.drawText(digit, {
      x: center - width / 2,
      y: toPdfY(305.5),
      size,
      font: regularFont,
      color: INK,
    });
  });

  drawFittedText(page, regularFont, values.date, 140, toPdfY(491.5), 180, 12);
  drawFittedText(page, regularFont, values.phone, 350, toPdfY(562.5), 185, 11);
  drawFittedText(page, regularFont, values.email, 350, toPdfY(612.5), 185, 11);

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
