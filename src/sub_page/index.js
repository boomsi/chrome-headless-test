const puppeteer = require("puppeteer");
const evaluateFunc = require("./evaluate");
const dict = require("./feature");

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

const URL = CONF.url;
const TOKEN = CONF.token;
const COOKIE = CONF.cookie;

/**
 * 1. 需要 hover/click 显示
 * 2. js绑定的跳转事件(绑定点击跳转/Tab页...)
 * 3. <a target='_blank' /> 新建标签页
 * 4. 分页数据？
 */
puppeteer.launch({ headless: false }).then(async (browser) => {
  console.time();
  const page = await browser.newPage();
  await page.goto(URL);

  if (TOKEN) {
    await page.evaluate((val) => {
      localStorage.setItem("token", val);
    }, TOKEN);
  }

  if (COOKIE) {
    page.on("request", async (request) => {
      request.continue([
        {
          headers: {
            cookie: COOKIE,
          },
        },
      ]);
    });
  }

  // 重新进入页面
  await page.goto(URL, { waitUntil: "networkidle0" });

  const list = await loopGoto(page);
  console.log(list);
  console.timeEnd();
  await browser.close();
});

async function loopGoto(page, initLink, all) {
  const parentLink = initLink || (await page.evaluate(evaluateFunc, dict));
  const res = all || [...parentLink];
  const newAdd = [];

  for await (url of parentLink) {
    await page.goto(URL + url, { waitUntil: "networkidle0" });
    const fullLink = await page.evaluate(evaluateFunc, dict);
    const addLink = fullLink.filter((str) => !(all || res).includes(str));

    if (addLink.length) {
      res.push(...addLink);
      newAdd.push(...addLink);
    }
  }

  if (newAdd.length) {
    await loopGoto(page, newAdd, res);
  }

  return res;
}
