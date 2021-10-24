const puppeteer = require("puppeteer");

class Test {
  constructor() {
    this.options = { headless: false, timeout: 10000 };
  }

  start() {
    puppeteer
      .launch(this.options)
      .then(async (Browser) => {
        const page = await Browser.newPage();
        this.page = page;
        await page.goto("http://www.douban.com");

        await page.evaluate(() => {
          const timer = setTimeout(async () => {
            await page.close();
          }, 5000);

          while (1) {
            console.log(Math.random());
          }

          clearTimeout(timer);
        });

        await Browser.close();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const normal = new Test();

normal.start();
