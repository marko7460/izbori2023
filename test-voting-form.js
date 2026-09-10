const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to the form
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take initial screenshot
    console.log('Taking initial desktop screenshot...');
    await page.screenshot({ path: '/tmp/desktop-initial.png', fullPage: false });

    // Fill form fields
    console.log('Filling form fields...');
    
    // 1. Име и презиме
    await page.type('input[placeholder*="Као у пасошу"]', 'Марко Петровић');
    
    // 2. Име једног родитеља
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const parentInput = inputs.find(el => 
        el.previousElementSibling?.textContent?.includes('Име једног родитеља') ||
        el.placeholder?.includes('Име оца')
      );
      if (parentInput) parentInput.focus();
    });
    await page.keyboard.type('Јован');
    
    // 3. ЈМБГ
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const jmbgInput = inputs.find(el => 
        el.previousElementSibling?.textContent?.includes('ЈМБГ') ||
        el.placeholder?.includes('13 цифара')
      );
      if (jmbgInput) jmbgInput.focus();
    });
    await page.keyboard.type('0101990710121');
    
    // 4. Адреса пребивалишта у Р. Србији
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const addressInput = inputs.find(el => 
        el.previousElementSibling?.textContent?.includes('Адреса пребивалишта')
      );
      if (addressInput) addressInput.focus();
    });
    await page.keyboard.type('Кнеза Милоша 1, Београд');
    
    // 5. Адреса боравка у иностранству
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const foreignInput = inputs.find(el => 
        el.previousElementSibling?.textContent?.includes('Адреса боравка у иностранству')
      );
      if (foreignInput) foreignInput.focus();
    });
    await page.keyboard.type('Hauptstrasse 10, Berlin');
    
    // 6. Град, држава
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const cityInput = inputs.find(el => 
        el.previousElementSibling?.textContent?.includes('Град') ||
        el.placeholder?.includes('Франкфурт')
      );
      if (cityInput) cityInput.focus();
    });
    await page.keyboard.type('Берлин, Немачка');
    
    // Date
    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.click({ clickCount: 3 });
      await page.keyboard.type('09102026');
    }
    
    // Phone
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const phoneInput = inputs.find(el => 
        el.previousElementSibling?.textContent?.includes('телефон')
      );
      if (phoneInput) phoneInput.focus();
    });
    await page.keyboard.type('+49 151 000000');
    
    // Email
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const emailInput = inputs.find(el => el.type === 'email');
      if (emailInput) emailInput.focus();
    });
    await page.keyboard.type('marko@example.com');
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Draw LARGE signature
    console.log('Drawing signature...');
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      // Draw a large M shape
      await page.mouse.move(box.x + 20, box.y + box.height - 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.move(box.x + box.width / 3, box.y + box.height - 20);
      await page.mouse.move(box.x + box.width * 2 / 3, box.y + 20);
      await page.mouse.move(box.x + box.width - 20, box.y + box.height - 20);
      await page.mouse.up();
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take desktop screenshot with filled form
    console.log('Taking desktop filled form screenshot...');
    await page.screenshot({ path: '/tmp/desktop-filled.png', fullPage: true });

    // Verify JMBG boxes
    const jmbgBoxes = await page.evaluate(() => {
      const preview = document.querySelector('[class*="preview"]') || document.body;
      const jmbgElements = Array.from(preview.querySelectorAll('*')).filter(el => {
        return el.textContent && /[0-9]/.test(el.textContent) && 
               el.children.length === 0 && el.textContent.trim().length === 1;
      });
      return jmbgElements.length;
    });
    console.log(`Found ${jmbgBoxes} JMBG digit boxes in preview`);

    // Check if Cyrillic text is visible
    const cyrillicCheck = await page.evaluate(() => {
      const preview = document.querySelector('[class*="preview"]') || document.body;
      const text = preview.textContent || '';
      const hasCyrillic = /[А-Яа-яЋћЂђЖжШшЧчЂђ]/.test(text);
      const hasMarko = text.includes('Марко');
      const hasBeograd = text.includes('Београд');
      const hasBerlin = text.includes('Берлин');
      return { hasCyrillic, hasMarko, hasBeograd, hasBerlin };
    });
    console.log('Cyrillic check:', cyrillicCheck);

    // Click save button
    console.log('Clicking save PDF button...');
    const saveButton = await page.$('button:has-text("Сачувај")') || 
                       await page.evaluateHandle(() => {
                         const buttons = Array.from(document.querySelectorAll('button'));
                         return buttons.find(b => b.textContent.includes('Сачувај') || b.textContent.includes('PDF'));
                       });
    
    if (saveButton.asElement) {
      await saveButton.asElement().click();
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot after save
    await page.screenshot({ path: '/tmp/desktop-after-save.png', fullPage: false });

    // Check for success message
    const successMessage = await page.evaluate(() => {
      const body = document.body.textContent;
      return body.includes('сачуван') || body.includes('успешно');
    });
    console.log('Success message visible:', successMessage);

    // Now test mobile view
    console.log('Testing mobile view...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take mobile screenshot
    await page.screenshot({ path: '/tmp/mobile-view.png', fullPage: true });

    // Check mobile JMBG boxes
    const mobileJmbgBoxes = await page.evaluate(() => {
      const jmbgElements = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.textContent && /[0-9]/.test(el.textContent) && 
               el.children.length === 0 && el.textContent.trim().length === 1;
      });
      return jmbgElements.length;
    });
    console.log(`Mobile view: Found ${mobileJmbgBoxes} JMBG digit boxes`);

    console.log('\n=== TEST RESULTS ===');
    console.log(`Desktop JMBG boxes: ${jmbgBoxes >= 13 ? '✓' : '✗'} (${jmbgBoxes}/13)`);
    console.log(`Cyrillic text: ${cyrillicCheck.hasCyrillic ? '✓' : '✗'}`);
    console.log(`  - Марко visible: ${cyrillicCheck.hasMarko ? '✓' : '✗'}`);
    console.log(`  - Београд visible: ${cyrillicCheck.hasBeograd ? '✓' : '✗'}`);
    console.log(`  - Берлин visible: ${cyrillicCheck.hasBerlin ? '✓' : '✗'}`);
    console.log(`Save button worked: ${successMessage ? '✓' : '✗'}`);
    console.log(`Mobile JMBG boxes: ${mobileJmbgBoxes >= 13 ? '✓' : '✗'} (${mobileJmbgBoxes}/13)`);
    console.log('\nScreenshots saved:');
    console.log('  - /tmp/desktop-initial.png');
    console.log('  - /tmp/desktop-filled.png');
    console.log('  - /tmp/desktop-after-save.png');
    console.log('  - /tmp/mobile-view.png');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('\nKeeping browser open for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
})();
