const puppeteer = require("puppeteer");

puppeteer.launch({headless: false}).then(async browser => {
  const page = await browser.newPage()

  await page.goto('http://rlzyxc.cn/')


 })