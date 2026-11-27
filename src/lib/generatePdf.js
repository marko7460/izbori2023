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
const RULE_RIGHT = 567.3;
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

function breakLongWord(font, word, maxWidth, size) {
  const parts = [];
  let current = "";
  for (const char of Array.from(word)) {
    const candidate = current + char;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      parts.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current) {
    parts.push(current);
  }
  return parts;
}

export function wrapTextLines(font, text, maxWidth, size) {
  const normalized = String(text || "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (!normalized) {
    return [];
  }

  const lines = [];
  for (const paragraph of normalized.split("\n")) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = "";
      }

      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
      } else {
        const chunks = breakLongWord(font, word, maxWidth, size);
        lines.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1] || "";
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines;
}

export function layoutMultilineField(
  font,
  text,
  {
    maxWidth = 232,
    maxSize = 12,
    minSize = 8,
    lineHeightRatio = 1.125,
    blockTopY = 287.0,
    singleLineBaselineY = 310.5,
    defaultRuleY = 312.7,
    maxRuleY = 350.0,
    ruleGap = 2.2,
  } = {}
) {
  const normalized = String(text || "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (!normalized) {
    return { lines: [], size: maxSize, baselines: [], ruleY: defaultRuleY };
  }

  const computeForSize = (size) => {
    const lines = wrapTextLines(font, normalized, maxWidth, size);
    if (lines.length <= 1) {
      return {
        lines,
        size,
        baselines: [singleLineBaselineY],
        ruleY: defaultRuleY,
      };
    }

    const lineHeight = size * lineHeightRatio;
    const firstBaselineY = blockTopY + (size * 10) / 12;
    const baselines = lines.map((_, index) => firstBaselineY + index * lineHeight);
    const ruleY = Math.max(
      defaultRuleY,
      baselines[baselines.length - 1] + ruleGap
    );
    return { lines, size, baselines, ruleY };
  };

  let layout = computeForSize(maxSize);
  for (let size = maxSize; size >= minSize; size -= 0.5) {
    layout = computeForSize(size);
    if (layout.ruleY <= maxRuleY) {
      return layout;
    }
  }

  const maxLines = Math.max(
    1,
    layout.baselines.filter((baseline) => baseline + ruleGap <= maxRuleY).length
  );
  const clampedLines = layout.lines.slice(0, maxLines);
  const lastIndex = clampedLines.length - 1;
  let lastLine = clampedLines[lastIndex] || "";
  const ellipsis = "…";
  while (
    lastLine.length > 0 &&
    font.widthOfTextAtSize(`${lastLine}${ellipsis}`, layout.size) > maxWidth
  ) {
    lastLine = lastLine.slice(0, -1).trimEnd();
  }
  clampedLines[lastIndex] = `${lastLine}${ellipsis}`;
  const clampedBaselines = layout.baselines.slice(0, maxLines);
  const clampedRuleY = Math.max(
    defaultRuleY,
    clampedBaselines[clampedBaselines.length - 1] + ruleGap
  );

  return {
    lines: clampedLines,
    size: layout.size,
    baselines: clampedBaselines,
    ruleY: clampedRuleY,
  };
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

// Box edges from the presidential-election form, left side of each vertical rule.
const JMBG_EDGES = [
  326.1, 345.1, 363.6, 382.6, 400.6, 419.1, 438.2, 456.2, 474.7, 493.7, 512.2,
  530.2, 548.7, 567.8,
];

function jmbgBoxCenters() {
  return JMBG_EDGES.slice(0, -1).map(
    (start, index) => (start + JMBG_EDGES[index + 1]) / 2
  );
}

function drawFormChrome(page, regularFont, boldFont) {
  page.drawText(HEADER_LINES[0], {
    x: 72,
    y: toPdfY(85.1),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText(HEADER_LINES[1], {
    x: 72,
    y: toPdfY(98.6),
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
    y: toPdfY(139.1),
    size: 12,
    font: boldFont,
    color: INK,
  });
  page.drawText(TITLE_LINES[1], {
    x: titleXs[1],
    y: toPdfY(152.6),
    size: 12,
    font: boldFont,
    color: INK,
  });
  page.drawText(TITLE_LINES[2], {
    x: titleXs[2],
    y: toPdfY(166.1),
    size: 12,
    font: boldFont,
    color: INK,
  });

  page.drawText("1. Име и презиме", {
    x: 122.2,
    y: toPdfY(220.1),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("2. Име једног родитеља", {
    x: 122.2,
    y: toPdfY(235.8),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("3. Јединствени матични број грађана", {
    x: 122.2,
    y: toPdfY(267.3),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("4. Адреса пребивалишта у Р. Србији", {
    x: 122.2,
    y: toPdfY(283.1),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("5. Град, држава – где желим да гласам у", {
    x: 122.2,
    y: toPdfY(298.8),
    size: 12,
    font: regularFont,
    color: INK,
  });
  page.drawText("иностранству", {
    x: 132.7,
    y: toPdfY(312.3),
    size: 12,
    font: regularFont,
    color: INK,
  });

  drawLine(page, 327.1, toPdfY(221.1), RULE_RIGHT, toPdfY(221.1));
  drawLine(page, 327.1, toPdfY(237.1), RULE_RIGHT, toPdfY(237.1));
  drawLine(page, 327.1, toPdfY(284.4), RULE_RIGHT, toPdfY(284.4));

  const jmbgTop = toPdfY(252.5);
  const jmbgBottom = toPdfY(268.5);
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
    x: 102.7,
    y: toPdfY(373.8),
    size: 12,
    font: regularFont,
    color: INK,
  });

  drawLine(page, 164.1, toPdfY(408.9), 246.9, toPdfY(408.9));
  drawLine(page, 377.5, toPdfY(424.3), RULE_RIGHT, toPdfY(424.3));
  drawLine(page, 377.5, toPdfY(459.8), RULE_RIGHT, toPdfY(459.8));
  drawLine(page, 377.5, toPdfY(506.1), RULE_RIGHT, toPdfY(506.1));
  drawLine(page, 377.5, toPdfY(566.2), RULE_RIGHT, toPdfY(566.2));

  page.drawText(LABELS.date, {
    x: 191.6,
    y: toPdfY(421.4),
    size: 10,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.signature, {
    x: 434,
    y: toPdfY(436.2),
    size: 9,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.phone, {
    x: 437.9,
    y: toPdfY(471.4),
    size: 9,
    font: regularFont,
    color: INK,
  });
  page.drawText(LABELS.email, {
    x: 456.5,
    y: toPdfY(517.9),
    size: 9,
    font: regularFont,
    color: INK,
  });

  NOTE_LINES.forEach((line, index) => {
    page.drawText(line, {
      x: 72,
      y: toPdfY(594.4 + index * 11.25),
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

  const maxWidth = 175;
  const maxHeight = 28;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  page.drawImage(image, {
    x: 382,
    y: toPdfY(424.3),
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
    331,
    toPdfY(219),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.parentName,
    331,
    toPdfY(235),
    fieldWidth,
    12
  );
  drawFittedText(
    page,
    regularFont,
    values.serbiaAddress,
    331,
    toPdfY(282.2),
    fieldWidth,
    12
  );
  const voteLayout = layoutMultilineField(regularFont, values.voteCityCountry, {
    maxWidth: fieldWidth,
  });
  drawLine(page, 327.1, toPdfY(voteLayout.ruleY), RULE_RIGHT, toPdfY(voteLayout.ruleY));
  voteLayout.lines.forEach((line, index) => {
    if (!line) {
      return;
    }
    page.drawText(line, {
      x: 331,
      y: toPdfY(voteLayout.baselines[index]),
      size: voteLayout.size,
      font: regularFont,
      color: INK,
    });
  });

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
      y: toPdfY(264.5),
      size,
      font: regularFont,
      color: INK,
    });
  });

  drawFittedText(page, regularFont, values.date, 168, toPdfY(406.7), 74, 12);
  drawFittedText(page, regularFont, values.phone, 382, toPdfY(457.6), 180, 11);
  drawFittedText(page, regularFont, values.email, 382, toPdfY(503.9), 180, 11);

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
