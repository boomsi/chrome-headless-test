const path = require("path");
const puppeteer = require("puppeteer");

PUPPETEER_HTTP_PROXY = "http://127.0.0.1:7890";
PUPPETEER_HTTPS_PROXY = "http://127.0.0.1:7890";
PUPPETEER_DOWNLOAD_PATH = path.resolve(__dirname, "assets");


puppeteer.launch({ headless: false }).then(async (Browser) => {

  
  
  // const context = await Browser.createIncognitoBrowserContext();
  // const context_id = context._id;

  // const page = await context.newPage();
  // await page.goto("http://www.baidu.com");

  // const page2 = await context.newPage();
  // await page2.goto("http://www.zhihu.com");

  // const page1 = await Browser.newPage();
  // await page1.goto("http://www.douban.com");




  // const page2 = await Browser._createPageInContext(context_id)
  // await page2.goto('http://www.zhihu.com')
});
