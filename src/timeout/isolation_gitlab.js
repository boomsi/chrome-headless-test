const puppeteer = require("puppeteer");

const IP = 'http://xx.xx.x.x'

class SpiderPage {
  constructor({ target, token, deep = 1, cookie }) {
    this.options = {
      headless: false,
      ignoreHTTPSErrors: true,
      devtools: false,
    };
    this.target = target;
    this.token = token;
    this.deep = deep;
    this.cookie = cookie;
    this.timer = 5000;
  }

  async setStorage() {
    // if (this.token) {
    //   await this.page.evaluate((val) => {
    //     localStorage.setItem("token", val);
    //   }, this.token);
    // }

    if (this.cookie) {
      await this.page.setCookie(...this.cookie);
    }
  }

  async setStorage1() {
    // if (this.token) {
    //   await this.page.evaluate((val) => {
    //     localStorage.setItem("token", val);
    //   }, this.token);
    // }

    if (this.cookie) {
      await this.page1.setCookie(...this.cookie);
    }
  }

  async newPageWithNewContext(browser) {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    return page;

    // const { browserContextId } = await browser._connection.send(
    //   "Target.createBrowserContext"
    // );
    // const page = await browser._createPageInContext(browserContextId);
    // page.browserContextId = browserContextId;
    // return page;
  }

  async closePage(browser, page) {
    // await this.page.goto("about:blank");
    if (page.browserContextId != undefined) {
      await browser._connection.send("Target.disposeBrowserContext", {
        browserContextId: page.browserContextId,
      });
    } else {
      await page.close();
    }
  }

  start() {
    puppeteer
      .launch(this.options)
      .then(async (browser) => {
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.target);
        await this.setStorage();
        await page.goto(this.target, { waitUntil: "networkidle0" });

        //  创建隔离环境
        const page1 = await this.newPageWithNewContext(browser);
        this.page1 = page1;
        // await this.setStorage1();
        await page1.goto(this.target, { waitUntil: "networkidle0" });

        const page2 = await this.newPageWithNewContext(browser);
        await page2.goto(this.target, { waitUntil: "networkidle0" });

        // 非隔离环境
        // const page2 = await browser.newPage();
        // await page2.goto(this.target);

        // await browser.close();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const spiderFunc = new SpiderPage({
  target: IP,
  cookie: [
    { name: "csrftoken", value: "HtlbHXDjqRSu9r3QTIOKIKQZ3MajnVmM" },
    { name: "sessionid", value: "e6dqhmgbanfukkfh6ei6qpifi7sf8to4" },
  ],
});

spiderFunc.start();
