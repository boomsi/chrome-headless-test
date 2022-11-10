const puppeteer = require("puppeteer");

const IP = 'http://xx.xx.xx.xx'

class Cookies {
  constructor({ target, cookie }) {
    this.target = target;
    this.cookie = cookie;
  }

  start() {
    puppeteer
      .launch({ ignoreHTTPSErrors: true, headless: false, devtools: true })
      .then(async (browser) => {
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.target, { waitUntil: "load" });
        //模拟登录成功
        await page.setCookie(...this.cookie);

        page.on("requestfinished", async (request) => {
          const response = request.response();

          const newCookie = response.headers()["set-cookie"];
          // ?.match(/(?<=sessionid=)\S+(?=;)/);
          if (newCookie) {
            await page.evaluate((sessionVal) => {
              sessionStorage.setItem("cookie", sessionVal);
            }, newCookie);
          }
        });

        await page.goto(this.target, { waitUntil: "networkidle0" });

        await page.deleteCookie({ name: "sessionid" }, { name: "csrftoken" });

        await page.setRequestInterception(true);
        page.on("request", async (interceptedRequest) => {
          const cookieVal = await page.evaluate(() =>
            sessionStorage.getItem("cookie")
          );
          await interceptedRequest.continue({
            headers: {
              Cookie: cookieVal,
            },
          });
        });

        // await page.reload()

        // const page1 = browser.newPage();
        // await page1.goto(this.target);

        const list = browser.process();
        console.log(list);

        // await browser.close();
      });
  }
}

const func = new Cookies({
  target: IP,
  cookie: [
    { name: "csrftoken", value: "Jga5iQOATSEqKNeC7AdRiG5c5jyc1Lxc" },
    { name: "sessionid", value: "npq4xblg0uu5ycfbme9jnxutc77lo1za" },
  ],
});

func.start();
