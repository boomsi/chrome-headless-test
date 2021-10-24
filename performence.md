### ISSUE

1. 同 chrome 隔离 上下文

- 开启多个隐身模式窗口（一个浏览器实例）
  - https://github.com/puppeteer/puppeteer/issues/85
  - https://github.com/puppeteer/puppeteer/issues/6875

2. 限制最大占用内存

- Chrome in Docker
- pm2 限制 Node 内存占用，超出重启（每隔 30s 检查一次内存）
  - https://pm2.keymetrics.io/docs/usage/memory-limit/

3. tab 页进程崩溃卡死关闭当前 tab

- 目标页面存在内存泄漏（实际检测存在死循环 js 代码的页面）
  可以通过 page.goto('', {timeout: xxx})监听到，在 catch 关闭当前 tab
- 在 page.evaluate 中代码问题导致页面卡死无响应
  - 增加 page.evaluate promise 超时
    - 无头模式测试可以顺利关闭，并不影响其他 tab，有头模式会无法关闭 tab，只能关闭该浏览器实例

### FIX

1.  - 能够区分创建的匿名 tab
    - 持久化 Browser Context，避免 puppeteer 突然中断状态丢失 | 保存当前页面上下文（sessionStorage、localStorage...）

2.  - 有头模式，会卡死无法被 catch
    - 页面超时后获取页面截图/结构 | 获取页面结构增加超时时间
