const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing mobile view with filled form...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=450,900']
  });

  let page;
  try {
    page = await browser.newPage();
    
    // Start in mobile viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    
    console.log('Navigating to http://localhost:3000 in mobile view...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Filling form in mobile view...');
    
    // Fill fields
    const inputs = await page.$$('input');
    
    if (inputs[0]) await inputs[0].type('Марко Петровић', { delay: 30 });
    if (inputs[1]) await inputs[1].type('Јован', { delay: 30 });
    if (inputs[2]) await inputs[2].type('0101990710121', { delay: 30 });
    if (inputs[3]) await inputs[3].type('Кнеза Милоша 1, Београд', { delay: 30 });
    if (inputs[4]) await inputs[4].type('Hauptstrasse 10, Berlin', { delay: 30 });
    if (inputs[5]) await inputs[5].type('Берлин, Немачка', { delay: 30 });
    
    const dateInput = await page.$('input[type="date"]');
    if (dateInput) await dateInput.type('2026-09-10');
    
    const allInputs = await page.$$('input:not([type="date"])');
    if (allInputs[6]) await allInputs[6].type('+49 151 000000', { delay: 30 });
    
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) await emailInput.type('marko@example.com', { delay: 30 });
    
    console.log('Drawing signature in mobile view...');
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 20, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + 20);
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height - 20);
      await page.mouse.move(box.x + box.width * 0.6, box.y + 20);
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height - 20);
      await page.mouse.up();
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Scroll through the page to capture everything
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Take mobile screenshots at different scroll positions
    await page.screenshot({ path: '/tmp/mobile-filled-top.png', fullPage: false });
    
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(resolve => setTimeout(resolve, 300));
    await page.screenshot({ path: '/tmp/mobile-filled-mid.png', fullPage: false });
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 300));
    await page.screenshot({ path: '/tmp/mobile-filled-bottom.png', fullPage: false });
    
    // Full page screenshot
    await page.screenshot({ path: '/tmp/mobile-filled-full.png', fullPage: true });

    // Check JMBG in mobile
    const mobileCheck = await page.evaluate(() => {
      const text = document.body.textContent;
      const singleDigits = Array.from(document.querySelectorAll('*')).filter(el => {
        const t = el.textContent?.trim();
        return t && t.length === 1 && /[0-9]/.test(t) && el.children.length === 0;
      });
      
      return {
        hasFullJMBG: text.includes('0101990710121'),
        digitBoxes: singleDigits.length,
        digits: singleDigits.slice(0, 13).map(el => el.textContent),
        hasMarko: text.includes('Марко'),
        hasBeograd: text.includes('Београд'),
        hasBerlin: text.includes('Берлин')
      };
    });
    
    console.log('\n=== MOBILE VIEW WITH FILLED FORM ===');
    console.log('JMBG digit boxes:', mobileCheck.digitBoxes >= 13 ? '✓' : '✗', `(${mobileCheck.digitBoxes})`);
    console.log('Digits found:', mobileCheck.digits.join(''));
    console.log('Full JMBG string:', mobileCheck.hasFullJMBG ? '✓' : '✗');
    console.log('Cyrillic text:', mobileCheck.hasMarko && mobileCheck.hasBeograd && mobileCheck.hasBerlin ? '✓' : '✗');
    console.log('\nMobile screenshots:');
    console.log('  - /tmp/mobile-filled-top.png (viewport top)');
    console.log('  - /tmp/mobile-filled-mid.png (viewport middle)');
    console.log('  - /tmp/mobile-filled-bottom.png (viewport bottom)');
    console.log('  - /tmp/mobile-filled-full.png (full page)');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
