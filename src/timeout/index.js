const puppeteer = require("puppeteer");
const evaluateFunc = require("./evaluate");
const dict = require("./feature");

const TIMEOUT = "TimeoutError";

/**
 * 1. 需要 hover/click 显示
 * 2. js绑定的跳转事件(绑定点击跳转/Tab页...)
 * 3. <a target='_blank' /> 新建标签页
 * 4. 分页
 */
class SpiderPage {
  constructor({ target, token, deep = 1, cookie }) {
    this.target = target;
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
      console.log("> start close timeout tab");
      await this.closePage(browser, page);
      console.log("> end close timeout tab");
    }
  }

  minimatch() {
    const CONF = {};
    process.argv.slice(2)?.forEach((str) => {
      try {
        const key = str.match(/(?<=--)\S+(?=\=)/)[0];
        const val = str.match(/(?<=\=)(\S|\s)+/)[0];
        CONF[key] = val;
      } catch (err) {
        throw new Error("> Parameter error");
      }
    });
    this.target = CONF.target;
    this.token = CONF.token;
    this.deep = CONF.deep;
  }

  async setStorage() {
    if (this.token) {
      await this.page.evaluate((val) => {
        localStorage.setItem("token", val);
      }, this.token);
    }

    if (this.cookie) {
      console.log(this.cookie);
      await this.page.setCookie(...this.cookie);
    }
  }

  async loopGoto(initLink, all, num = 1) {
    const parentLink =
      initLink || (await this.page.evaluate(evaluateFunc, dict));
    const res = all || [...parentLink];
    const newAdd = [];

    if (this.deep && num >= this.deep) {
      return res;
    }

    for await (const url of parentLink) {
      await this.page.goto(this.target + url, { waitUntil: "networkidle0" });
      const fullLink = await this.page.evaluate(evaluateFunc, dict);
      const addLink = fullLink.filter((str) => !(all || res).includes(str));
      if (addLink.length) {
        res.push(...addLink);
        newAdd.push(...addLink);
      }
    }

    if (newAdd.length) {
      await this.loopGoto(newAdd, res, num + 1);
    }

    return res;
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

  start() {
    this.minimatch();
    puppeteer
      .launch({ headless: true, ignoreHTTPSErrors: true, devtools: false })
      .then(async (browser) => {
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.target);
        await this.setStorage();
        await page.goto(this.target, { waitUntil: "networkidle0" });

        //  创建隔离环境
        // const page2 = await this.newPageWithNewContext(browser);
        // await page2.goto('http://www.douban.com', { waitUntil: "networkidle0" });
        // this.page2 = page2
        const list = await this.loopGoto();

        const page11 = await browser.newPage();
        console.log("> start loop1");
        await page11
          .goto("http://10.0.23.80:8080", { timeout: 3000 })
          .catch(async (err) => {
            console.log(err)
            await page11.close();
          });
        // console.log("> start loop2");
        // await this.imitation(browser, page11);
        console.log("> end loop");

        // 模拟tab卡死
        console.log("> start loop");
        await this.imitation(browser, page);
        const page1 = await browser.newPage();
        await page1.goto("https://www.zhihu.com/", {
          waitUntil: "networkidle0",
        });
        const title = await page1.title();
        console.log(title);

        console.log(list);
        console.timeEnd();
        await browser.close();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const spiderFunc = new SpiderPage({
  cookie: [
    { name: "csrftoken", value: "4Heqq53JRz3DhcR8bhzWPDr7ffwJaCqY" },
    { name: "sessionid", value: "h2d4oj3m851vxwe9nsbd3nibp4789vul" },
  ],
});

spiderFunc.start();
