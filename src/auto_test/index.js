const puppeteer = require("puppeteer");

const URL = "http://127.0.0.1:8000";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsInVzZXJfaWQiOiI1ZWZmMDIxZDNmOWI1ZjVlYzg4YmZmZGIiLCJqd3RpZCI6Imp3dGlkIiwiaWF0IjoxNjIwODEyMDQ4LCJleHAiOjE2MjA4MTU2NDh9.N0Zh90enmNhzwaCn-WPlEluahOUICFssF-QEYpsaEAg";

class AutoTest {
  constructor(url) {
    this.url = url;
  }

  start() {
    puppeteer.launch({ headless: true }).then(async (browser) => {
      const page = await browser.newPage();
      await page.goto(this.url, { waitUntil: "networkidle0" });
      await page.evaluate((token) => {
        localStorage.setItem("token", token);
      }, TOKEN);
      await page.goto(this.url, { waitUntil: "networkidle0" });

      // 点击添加
      await page.tap(".ant-btn-primary");

      // 输入目标
      await page.type("#start_url", "1.1.1.12", { delay: 200 });
      await page.tap(".ant-form a._3CQRR7VrHEwWsldgfi-SFB");
      await page.waitForSelector(
        "._2EoCrdium9NiWpHJKinOPS .ant-spin-container li",
        { visible: true }
      );
      await page.tap("._2EoCrdium9NiWpHJKinOPS .ant-spin-container li");

      // 点击确定
      await page.tap("._1xfGKuo0xSlfQHUBsN1jjR button[type=submit]");

      // 判断是否成功
      await page.reload({ waitUntil: "networkidle0" });
      const result = await page.evaluate(() => {
        const val = document.querySelector(
          ".ant-table-wrapper .ant-table-tbody tr:first-child td:nth-of-type(2)"
        )?.innerText;
        return val === "1.1.1.12";
      });

      if (result) {
        console.log("> Test ok");
      }

      await browser.close();
    });
  }
}

const auto = new AutoTest(URL);

auto.start();
