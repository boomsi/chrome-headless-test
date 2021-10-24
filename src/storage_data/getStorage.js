const puppeteer = require("puppeteer");
const path = require("path");

PUPPETEER_HTTP_PROXY = "http://127.0.0.1:7890";
PUPPETEER_HTTPS_PROXY = "http://127.0.0.1:7890";
PUPPETEER_DOWNLOAD_PATH = path.resolve(__dirname, "assets");

puppeteer
  .launch({ headless: true, timeout: 30000 })
  .then(async (browser) => {
    const page = await browser.newPage();

    await page.goto("http://www.baidu.com", { waitUntil: "networkidle0" });

    // const cookie = await page.cookies()
    // console.log(cookie)

    // 获取storage - 1
    // await page.addScriptTag({
    //   path: path.resolve(__dirname, "getData.js"),
    // });
    // const val = await page.$eval("head meta[name=data-storage]", (option) => ({
    //   local: JSON.parse(option.getAttribute("data-localstorage")),
    //   session: JSON.parse(option.getAttribute("data-sessionstorage")),
    // }));
    // console.log(val);

    const localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
    const sessionStorage = await page.evaluate(() =>  Object.assign({}, window.sessionStorage));
    console.log(localStorage, sessionStorage)

    await browser.close();
  })
  .catch((err) => {
    console.log(err);
  });

// exports = async function getStorageData(page) {
//   await page.addScriptTag({
//     path: path.resolve(__dirname, "getData.js"),
//   });

//   // 获取storage
//   const val = await page.$eval("head meta[name=data-storage]", (option) => ({
//     local: JSON.parse(option.getAttribute("data-localstorage")),
//     session: JSON.parse(option.getAttribute("data-sessionstorage")),
//   }));
//   return val;
// };
