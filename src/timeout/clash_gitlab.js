const puppeteer = require("puppeteer");

const TIMEOUT = "TimeoutError";

class SpiderPage {
  constructor({ target, token, deep = 1, cookie }) {
    this.options = {
      headless: true,
      ignoreHTTPSErrors: true,
      devtools: false,
    };
    this.target = target || "http://www.douban.com";
    this.token = token;
    this.deep = deep;
    this.cookie = cookie;
    this.timer = 5000;
  }

  async evaluateFunc(page) {
    await page.evaluate(async () => {
      while (1) {
        console.log(Math.random().toFixed(2));
      }
    });
  }

  timeoutPromise(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(TIMEOUT);
      }, delay);
    });
  }

  async imitation(browser, page, fn) {
    const res = await Promise.race([
      fn || this.evaluateFunc(page),
      this.timeoutPromise(this.timer),
    ]).catch((err) => {
      console.log(err);
      return err;
    });

    if (res === TIMEOUT) {
      // const dom = await page.$eval("body", (doms) => doms);

      console.log(1);
      await page.screenshot();
      console.log(2);

      // console.log(dom, "dom");
      console.log(cc, 11);
      console.log("> start close timeout tab");
      await this.closePage(browser, page);
      console.log("> end close timeout tab");
    }
  }

  async newPageWithNewContext(browser) {
    const { browserContextId } = await browser._connection.send(
      "Target.createBrowserContext"
    );
    const page = await browser._createPageInContext(browserContextId);
    page.browserContextId = browserContextId;
    return page;
  }

  async closePage(browser, page) {
    // await this.page.goto("about:blank");
    console.log(page.browserContextId);
    if (page.browserContextId != undefined) {
      await browser._connection.send("Target.disposeBrowserContext", {
        browserContextId: page.browserContextId,
      });
    } else {
      await page.close();
    }
  }

  async setStorage() {
    if (this.token) {
      await this.page.evaluate((val) => {
        localStorage.setItem("token", val);
      }, this.token);
    }

    if (this.cookie) {
      await this.page.setCookie(...this.cookie);
    }
  }

  start() {
    puppeteer
      .launch(this.options)
      .then(async (browser) => {
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.target);
        // await this.setStorage();
        // await page.goto(this.target, { waitUntil: "networkidle0" });

        // const page1 = await browser.newPage();
        // await page1.goto("https://www.zhihu.com/", {
        //   waitUntil: "networkidle0",
        // });

        // console.log("加载存在死循环的页面");
        // const page11 = await browser.newPage();
        // await page11
        //   .goto("http://10.0.23.80:8080", { timeout: 5000 })
        //   .catch(async (err) => {
        //     console.log(err, "1111");
        //     await page11.close();
        //     console.log("已关闭死循环页面");
        //   });

        console.log("模拟 evaluate 卡死");
        await this.imitation(browser, page);

        // const title = await page1.title();
        // console.log(title);

        await browser.close();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const spiderFunc = new SpiderPage({
  cookie: [
    { name: "csrftoken", value: "HtlbHXDjqRSu9r3QTIOKIKQZ3MajnVmM" },
    { name: "sessionid", value: "e6dqhmgbanfukkfh6ei6qpifi7sf8to4" },
  ],
});

spiderFunc.start();
