import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INPUT_FILE  = resolve(__dirname, '../public/mitra-id.html');
const OUTPUT_PDF  = resolve(__dirname, '../public/mitra-id.pdf');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TOTAL         = 9;
const VIEWPORT_W    = 390;   // iPhone 14 width
const SCALE         = 3;     // deviceScaleFactor → 1170px actual
const PDF_PAGE_W_PT = 595.28; // A4 width in points

// Override CSS: expand every slide to auto-height so we capture full content
function buildPrintHtml(source) {
  const override = `
<style id="__pdf_print">
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
html, body {
  margin: 0 !important; padding: 0 !important;
  width: ${VIEWPORT_W}px !important;
  height: auto !important;
  overflow: visible !important;
  background: #0e0a20 !important;
}
.deck {
  position: relative !important;
  top: auto !important; left: auto !important;
  right: auto !important; bottom: auto !important;
  width: ${VIEWPORT_W}px !important;
  height: auto !important;
  overflow: visible !important;
  background: transparent !important;
}
/* Each slide: auto-height, full content visible */
.slide {
  position: relative !important;
  inset: auto !important;
  display: flex !important;
  flex-direction: column !important;
  width: ${VIEWPORT_W}px !important;
  height: auto !important;
  min-height: 640px !important;
  overflow: visible !important;
  flex-shrink: 0 !important;
  opacity: 1 !important;
  transform: none !important;
}
/* Unlock scrollable content areas */
.scroll {
  overflow: visible !important;
  height: auto !important;
  flex: none !important;
}
/* s1-body: don't force height */
.s1-body {
  min-height: 560px !important;
}
/* Fix radial gradients: avoid transparent → black interpolation on iOS */
.slide-dark .glow-a {
  background: radial-gradient(circle,
    rgba(232,20,122,.28) 0%, rgba(26,19,48,0) 70%) !important;
}
.slide-dark .glow-b {
  background: radial-gradient(circle,
    rgba(22,48,160,.26) 0%, rgba(26,19,48,0) 70%) !important;
}
/* Hide nav */
#nav, .snum { display: none !important; }
</style>`;

  return source.replace('</head>', override + '\n</head>');
}

(async () => {
  console.log('📄 Reading source HTML…');
  const source    = readFileSync(INPUT_FILE, 'utf8');
  const printHtml = buildPrintHtml(source);

  const tmpPath = INPUT_FILE.replace('.html', '__print_tmp.html');
  writeFileSync(tmpPath, printHtml);

  console.log('🚀 Launching Chrome…');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  // Tall enough that no content overflows out of view while expanding
  await page.setViewport({ width: VIEWPORT_W, height: 2400, deviceScaleFactor: SCALE });

  console.log('🌐 Loading page…');
  await page.goto('file://' + tmpPath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 900));

  // Screenshot each slide at its actual full content height
  const slideHandles = await page.$$('.slide');
  console.log(`📸 Capturing ${slideHandles.length} slides…`);

  const jpegs  = [];
  const heights = [];

  for (let i = 0; i < slideHandles.length; i++) {
    const box = await slideHandles[i].boundingBox();
    if (!box) { console.warn(`  slide ${i+1}: no bounding box`); continue; }

    const h = Math.ceil(box.height);
    heights.push(h);

    const jpeg = await page.screenshot({
      type:    'jpeg',
      quality: 94,
      clip: { x: box.x, y: box.y, width: VIEWPORT_W, height: h },
    });
    jpegs.push(jpeg);
    process.stdout.write(`  ✓ slide ${i + 1}/${slideHandles.length}  (${VIEWPORT_W}×${h})\n`);
  }

  await browser.close();
  try { unlinkSync(tmpPath); } catch {}

  // Assemble PDF — each page sized to the slide's actual aspect ratio
  console.log('\n📄 Assembling PDF…');
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Jodohmu — Program Kemitraan');
  pdfDoc.setAuthor('Jodohmu');

  for (let i = 0; i < jpegs.length; i++) {
    const slideH     = heights[i];
    const pageH_pt   = PDF_PAGE_W_PT * (slideH / VIEWPORT_W);
    const pdfPage    = pdfDoc.addPage([PDF_PAGE_W_PT, pageH_pt]);

    const img = await pdfDoc.embedJpg(jpegs[i]);
    pdfPage.drawImage(img, {
      x: 0, y: 0,
      width:  PDF_PAGE_W_PT,
      height: pageH_pt,
    });
  }

  const pdfBytes = await pdfDoc.save();
  writeFileSync(OUTPUT_PDF, pdfBytes);

  const mb = (pdfBytes.length / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Saved → ${OUTPUT_PDF}`);
  console.log(`   ${mb} MB  |  portrait  |  ${jpegs.length} pages`);
})();
