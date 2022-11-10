const puppeteer = require("puppeteer");
const evaluate = require("../sub_page/evaluate");
// const getEvent = require("./get_event");

class Base {
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
    if (page.browserContextId != undefined) {
      await browser._connection.send("Target.disposeBrowserContext", {
        browserContextId: page.browserContextId,
      });
    } else {
      await page.close();
    }
  }

  async setStorage({ page, cookie, token }) {
    if (token) {
      await page.evaluate((val) => {
        localStorage.setItem("token", val);
      }, token);
    }

    if (cookie) {
      await page.setCookie(...cookie);
    }
  }
}

class Spider extends Base {
  constructor({ browserOptions = {}, scanOptions = [] }) {
    super();
    this.browserOptions = browserOptions;
    this.scanOptions = scanOptions;
  }

  async evaluateFunc() {
    const link = [];
    function getAttrs(dom) {
      const attrs = [...dom.attributes];
      const attrsList = {};
      attrs.forEach((attr) => {
        if (
          attr.nodeName === "href" &&
          /^\/|#\S+$/.test(attr.nodeValue) &&
          !attr.nodeValue.includes("logout")
        ) {
          link.push(attr.nodeValue);
        }
        attrsList[attr.nodeName] = attr.nodeValue;
      });
      return attrsList;
    }

    function loopDom(parentNode = "body", tree = []) {
      const children =
        typeof parentNode === "string"
          ? [...window.document.querySelector(parentNode).children]
          : [...parentNode.children];
      // no child
      if (children.length === 0) {
        return [];
      }
      children.forEach((child) => {
        const childTree = loopDom(child);
        tree.push({
          label: child.tagName,
          attr: getAttrs(child),
          child: childTree,
        });
      });
      return tree;
    }
    loopDom();
    return link;
  }

  async loopGoto({ page, deep, target, initLink, all, num = 1 }) {
    const parentLink = initLink;
    const res = all || [...parentLink];
    const newAdd = [];

    if (deep && num >= deep) {
      return res;
    }

    for await (const url of parentLink) {
      await page.goto(target + url, { waitUntil: "networkidle0" });
      const fullLink = await page.evaluate(this.evaluateFunc);
      const addLink = fullLink.filter((str) => !(all || res).includes(str));
      if (addLink.length) {
        res.push(...addLink);
        newAdd.push(...addLink);
      }
    }
    if (newAdd.length) {
      await this.loopGoto({
        page,
        target,
        deep,
        initLink: newAdd,
        all: res,
        num: num + 1,
      });
    }
    return res;
  }

  eventHook() {
    const domList = window.document.querySelectorAll("*");
    const hasEventList = [...domList].filter(
      (item) => Object.keys(window.getEventListeners(item)).length
    );
    return hasEventList.length;

    // const { result } = await client.send("Runtime.evaluate", {
    //   expression: "document.body",
    //   objectGroup: "provided",
    // });
    // console.log(JSON.stringify(result));
    // const { listeners } = await client.send("DOMDebugger.getEventListeners", {
    //   objectId: result.objectId,
    // });
    // console.log(JSON.stringify(listeners));
  }

  start() {
    puppeteer
      .launch(this.browserOptions)
      .then(async (browser) => {
        // FIXME 循环执行

        const option = this.scanOptions[0];
        await this.createPage(browser, option);

        // await browser.close();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async createPage(browser, options) {
    const { target, cookie, token, deep, ...conf } = options;

    const page = await super.newPageWithNewContext(browser);
    await super.setStorage({ page, cookie, token });
    await page.goto(target, conf);

    // 延时 等待页面跳转（微博）
    // await page.waitFor(6000);

    // 获取DOM绑定事件
    const client = await page.target().createCDPSession();
    const { result } = await client.send("Runtime.evaluate", {
      expression: "document.body",
      objectGroup: "provided",
    });
    const len = await client.send("DOMDebugger.getEventListeners", {
      objectId: result.objectId,
    });
    // const len = await page.evaluate(this.eventHook);
    console.log(len);

    const list = await this.loopGoto({
      page,
      deep,
      target,
      initLink: await page.evaluate(this.evaluateFunc),
    });
    console.log(list);
  }
}

const spider_sub_page = new Spider({
  browserOptions: { headless: true, devtools: true },
  scanOptions: [
    {
      target: "https://segmentfault.com/q/1010000003105895",
      // cookie: [
      //   { name: "csrftoken", value: "RJnkSLcsF3HuO4krzfSjLVF8CIQUR9mJ" },
      //   { name: "sessionid", value: "n20cvzdxealj630t3gt70fbws6hah4x9" },
      // ],
      // token:
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsInVzZXJfaWQiOiI1ZWZmMDIxZDNmOWI1ZjVlYzg4YmZmZGIiLCJqd3RpZCI6Imp3dGlkIiwiaWF0IjoxNjIxNTg4NzgzLCJleHAiOjE2MjE1OTIzODN9.u83FCBa4s8m8sp4YUEfv7gln1h4FYuD5drUHYtFfeAY",
      deep: 1,
      timeout: 30000,
      waitUntil: "networkidle0",
    },
  ],
});

spider_sub_page.start();
