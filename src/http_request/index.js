const puppeteer = require("puppeteer");

const URL = "http://www.douban.com";
const TOKEN = "";

puppeteer
  .launch({ headless: true, timeout: 30000 })
  .then(async (browser) => {
    const page = await browser.newPage();

    page.on("requestfinished", async (request) => {
      const data = {
        request_headers: request.headers(),
        method: request.method(),
        payload: request.postData(),
        url: request.url(),
        resource_type: request.resourceType(),
        response_headers: request.response().headers(),
        address: request.response().remoteAddress(),
        status: request.response().status(),
        statusText: request.response().statusText(),
      };

      if (request.resourceType() === "fetch") {
        data.response_data = await request.response().text();
      }
      console.log(data);
    });

    await page.goto(URL);
    if (TOKEN) {
      await page.evaluate(() => {
        localStorage.setItem("token", TOKEN);
      });
    }
    await page.goto(URL, { waitUntil: "networkidle0" });

    // click
    // await page.tap(".ant-btn-primary");

    await browser.close();
  })
  .catch((err) => {
    console.log(err);
  });
