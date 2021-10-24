setTimeout(() => {
  console.log(1111)
}, 100000)



async new_context_page() {
  const context = await this.browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  return page;
}

async save_content() {
  try {
    const content = await self.page()
    self.res.content = content

  } catch (err) {
    console.log('> save page content failed')
  }
}


const utils = require("./dfetcher/utils");

new Promise((resolve, reject) => {
  resolve();
}).then(async () => {
  console.log(1);

  setTimeout(() => {
    console.log("timeout");
  }, 3000);

  await utils.sleep(5000);
  console.log(2);
});