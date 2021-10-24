const puppeteer = require("puppeteer");
const evaluateFunc = require("./evaluate");
const dict = require("./feature");

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
  dklhfg;

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
      .launch({ headless: false, ignoreHTTPSErrors: true, devtools: true })
      .then(async (browser) => {
        console.time();
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.target);
        await this.setStorage();

        // 重新进入页面
        await page.goto(this.target, { waitUntil: "networkidle0" });

        //  创建隔离环境
        // const page1 = await this.newPageWithNewContext(browser);
        // await page1.goto(this.target, { waitUntil: "networkidle0" });

        const list = await this.loopGoto();
        console.log(list);
        console.timeEnd();
        // await browser.close();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const spiderFunc = new SpiderPage({
  cookie: [
    { name: "csrftoken", value: "tTHdbtBqDlccbqHc2wV7PvMGlIjgQhW9" },
    { name: "sessionid", value: "8ftdrntij8vfwrlb85mu08w2rzh5onsw" },
  ],
});

const spiderFunc1 = new SpiderPage({
  // cookie: [
  //   { name: "csrftoken", value: "tTHdbtBqDlccbqHc2wV7PvMGlIjgQhW9" },
  //   { name: "sessionid", value: "8ftdrntij8vfwrlb85mu08w2rzh5onsw" },
  // ],
});

spiderFunc.start();

setTimeout(() => {
  spiderFunc1.start();
}, 2000);
