const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  let page;
  try {
    page = await browser.newPage();
    
    // Navigate to the form
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Take initial screenshot
    console.log('Taking initial desktop screenshot...');
    await page.screenshot({ path: '/tmp/desktop-initial.png', fullPage: false });

    // Explore form structure
    const formInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map((inp, idx) => ({
        index: idx,
        type: inp.type,
        placeholder: inp.placeholder,
        name: inp.name,
        id: inp.id,
        label: inp.labels?.[0]?.textContent?.trim() || 
               inp.previousElementSibling?.textContent?.trim() ||
               inp.parentElement?.previousElementSibling?.textContent?.trim() || ''
      }));
    });
    
    console.log('Form inputs found:', JSON.stringify(formInfo, null, 2));

    // Fill fields using more robust approach
    console.log('Filling form fields...');
    
    // Get all inputs
    const inputs = await page.$$('input');
    
    // Fill by index based on typical form order
    if (inputs[0]) {
      await inputs[0].click();
      await inputs[0].type('Марко Петровић', { delay: 50 });
      console.log('Filled field 1: Име и презиме');
    }
    
    if (inputs[1]) {
      await inputs[1].click();
      await inputs[1].type('Јован', { delay: 50 });
      console.log('Filled field 2: Име једног родитеља');
    }
    
    if (inputs[2]) {
      await inputs[2].click();
      await inputs[2].type('0101990710121', { delay: 50 });
      console.log('Filled field 3: ЈМБG');
    }
    
    if (inputs[3]) {
      await inputs[3].click();
      await inputs[3].type('Кнеза Милоша 1, Београд', { delay: 50 });
      console.log('Filled field 4: Адреса у Србији');
    }
    
    if (inputs[4]) {
      await inputs[4].click();
      await inputs[4].type('Hauptstrasse 10, Berlin', { delay: 50 });
      console.log('Filled field 5: Адреса у иностранству');
    }
    
    if (inputs[5]) {
      await inputs[5].click();
      await inputs[5].type('Берлин, Немачка', { delay: 50 });
      console.log('Filled field 6: Град, држава');
    }
    
    // Find and fill date input
    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.click({ clickCount: 3 });
      await dateInput.type('2026-09-10');
      console.log('Filled date field');
    }
    
    // Find and fill phone (usually input[type="tel"] or after date)
    const allInputs = await page.$$('input:not([type="date"])');
    if (allInputs.length > 6) {
      await allInputs[6].click();
      await allInputs[6].type('+49 151 000000', { delay: 50 });
      console.log('Filled phone field');
    }
    
    // Find and fill email
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.click();
      await emailInput.type('marko@example.com', { delay: 50 });
      console.log('Filled email field');
    } else if (allInputs.length > 7) {
      await allInputs[7].click();
      await allInputs[7].type('marko@example.com', { delay: 50 });
      console.log('Filled email field (by index)');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Draw LARGE signature
    console.log('Drawing large signature...');
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      console.log('Canvas found at:', box);
      
      // Draw a large zigzag signature filling most of the canvas
      const startX = box.x + 30;
      const endX = box.x + box.width - 30;
      const startY = box.y + 30;
      const endY = box.y + box.height - 30;
      const midY = box.y + box.height / 2;
      
      await page.mouse.move(startX, midY);
      await page.mouse.down();
      
      // Large zigzag
      await page.mouse.move(startX + (endX - startX) * 0.15, startY);
      await page.mouse.move(startX + (endX - startX) * 0.30, endY);
      await page.mouse.move(startX + (endX - startX) * 0.45, startY);
      await page.mouse.move(startX + (endX - startX) * 0.60, endY);
      await page.mouse.move(startX + (endX - startX) * 0.75, startY);
      await page.mouse.move(startX + (endX - startX) * 0.90, midY);
      
      await page.mouse.up();
      console.log('Signature drawn');
    } else {
      console.log('Canvas not found');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Scroll to see full preview
    await page.evaluate(() => {
      const preview = document.querySelector('[class*="preview"]');
      if (preview) preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Take desktop screenshot with filled form
    console.log('Taking desktop filled form screenshot...');
    await page.screenshot({ path: '/tmp/desktop-filled.png', fullPage: true });

    // Verify JMBG boxes
    const jmbgAnalysis = await page.evaluate(() => {
      const allText = document.body.textContent;
      const preview = document.body;
      
      // Find elements that look like JMBG boxes (single digit in small box)
      const singleDigitElements = Array.from(preview.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.length === 1 && /[0-9]/.test(text) && el.children.length === 0;
      });
      
      // Also check for the full JMBG string
      const hasFullJMBG = allText.includes('0101990710121');
      
      return {
        singleDigitBoxes: singleDigitElements.length,
        hasFullJMBG,
        sampleDigits: singleDigitElements.slice(0, 15).map(el => el.textContent)
      };
    });
    console.log('JMBG analysis:', jmbgAnalysis);

    // Check Cyrillic rendering
    const cyrillicCheck = await page.evaluate(() => {
      const text = document.body.textContent;
      return {
        hasMarko: text.includes('Марко'),
        hasPetrovic: text.includes('Петровић'),
        hasJovan: text.includes('Јован'),
        hasBeograd: text.includes('Београд'),
        hasBerlin: text.includes('Берлин'),
        hasNemacka: text.includes('Немачка')
      };
    });
    console.log('Cyrillic check:', cyrillicCheck);

    // Check signature visibility
    const signatureCheck = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { found: false };
      
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Count non-white pixels
      let nonWhitePixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
          nonWhitePixels++;
        }
      }
      
      return {
        found: true,
        width: canvas.width,
        height: canvas.height,
        nonWhitePixels,
        hasDrawing: nonWhitePixels > 100
      };
    });
    console.log('Signature check:', signatureCheck);

    // Click save button
    console.log('Looking for save button...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    const buttonTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim());
    });
    console.log('Button texts:', buttonTexts);
    
    // Click the save button
    const saveButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(b => 
        b.textContent.includes('Сачувај') || 
        b.textContent.includes('PDF') ||
        b.textContent.toUpperCase().includes('SAVE')
      );
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    });
    
    console.log('Save button clicked:', saveButtonClicked);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot after save
    await page.screenshot({ path: '/tmp/desktop-after-save.png', fullPage: false });

    // Check for success message
    const successMessage = await page.evaluate(() => {
      const body = document.body.textContent;
      return body.includes('сачуван') || body.includes('успешно') || body.includes('Done');
    });
    console.log('Success message visible:', successMessage);

    // Now test mobile view
    console.log('\n=== TESTING MOBILE VIEW ===');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Scroll down to see everything on mobile
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Take mobile screenshot
    await page.screenshot({ path: '/tmp/mobile-view.png', fullPage: true });

    // Check mobile JMBG boxes
    const mobileJmbgAnalysis = await page.evaluate(() => {
      const allText = document.body.textContent;
      const singleDigitElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.length === 1 && /[0-9]/.test(text) && el.children.length === 0;
      });
      const hasFullJMBG = allText.includes('0101990710121');
      
      return {
        singleDigitBoxes: singleDigitElements.length,
        hasFullJMBG,
        sampleDigits: singleDigitElements.slice(0, 15).map(el => el.textContent)
      };
    });
    console.log('Mobile JMBG analysis:', mobileJmbgAnalysis);

    console.log('\n' + '='.repeat(60));
    console.log('=== TEST RESULTS ===');
    console.log('='.repeat(60));
    console.log(`\nDesktop JMBG boxes: ${jmbgAnalysis.singleDigitBoxes >= 13 ? '✓' : '✗'} (found ${jmbgAnalysis.singleDigitBoxes} digit boxes)`);
    console.log(`Full JMBG string: ${jmbgAnalysis.hasFullJMBG ? '✓' : '✗'}`);
    console.log(`\nCyrillic rendering:`);
    console.log(`  - Марко Петровић: ${cyrillicCheck.hasMarko && cyrillicCheck.hasPetrovic ? '✓' : '✗'}`);
    console.log(`  - Јован: ${cyrillicCheck.hasJovan ? '✓' : '✗'}`);
    console.log(`  - Београд: ${cyrillicCheck.hasBeograd ? '✓' : '✗'}`);
    console.log(`  - Берлин, Немачка: ${cyrillicCheck.hasBerlin && cyrillicCheck.hasNemacka ? '✓' : '✗'}`);
    console.log(`\nSignature: ${signatureCheck.hasDrawing ? '✓ visible' : '✗ not detected'} (${signatureCheck.nonWhitePixels} non-white pixels)`);
    console.log(`PDF save: ${saveButtonClicked ? '✓ button clicked' : '✗ button not found'}`);
    console.log(`Success message: ${successMessage ? '✓' : '✗'}`);
    console.log(`\nMobile JMBG boxes: ${mobileJmbgAnalysis.singleDigitBoxes >= 13 ? '✓' : '✗'} (found ${mobileJmbgAnalysis.singleDigitBoxes} digit boxes)`);
    console.log(`Mobile full JMBG: ${mobileJmbgAnalysis.hasFullJMBG ? '✓' : '✗'}`);
    console.log('\nScreenshots saved:');
    console.log('  - /tmp/desktop-initial.png');
    console.log('  - /tmp/desktop-filled.png');
    console.log('  - /tmp/desktop-after-save.png');
    console.log('  - /tmp/mobile-view.png');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.error(error.stack);
  } finally {
    if (page) {
      await page.screenshot({ path: '/tmp/error-state.png', fullPage: true }).catch(() => {});
    }
    console.log('\nKeeping browser open for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
})();
