const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");

module.export = initPuppeteerPool = (options = {}) => {
  const {
    max = 10,
    min = 2,
    maxUses = 2048,
    testOnBorrow = true,
    autostart = false,
    idleTimeoutMillis = 3600000,
    evictionRunIntervalMillis = 180000,
    puppeteerArgs = {},
    validator = () => Promise.resolve(true),
    ...otherConfig
  } = options;

  const factory = {
    create: () =>
      puppeteer.launch(puppeteerArgs).then((instance) => {
        // 创建一个 puppeteer 实例 ，并且初始化使用次数为 0
        instance.useCount = 0;
        return instance;
      }),
    destroy: (instance) => {
      instance.close();
    },
    validate: (instance) => {
      // 执行一次自定义校验，并且校验实例已使用次数。 当 返回 reject 时 表示实例不可用
      return validator(instance).then((valid) =>
        Promise.resolve(valid && (maxUses <= 0 || instance.useCount < maxUses))
      );
    },
  };

  const config = {
    max,
    min,
    testOnBorrow,
    autostart,
    idleTimeoutMillis,
    evictionRunIntervalMillis,
    ...otherConfig,
  };

  const pool = genericPool.createPool(factory, config);

  const genericAcquire = pool.acquire.bind(pool);
  // 重写了原有池的消费实例的方法。添加一个实例使用次数的增加
  pool.acquire = () =>
    genericAcquire().then((instance) => {
      instance.useCount += 1;
      return instance;
    });
  pool.use = (fn) => {
    let resource;
    return pool
      .acquire()
      .then((r) => {
        resource = r;
        return resource;
      })
      .then(fn)
      .then(
        (result) => {
          // 不管业务方使用实例成功与否都表示一下实例消费完成
          pool.release(resource);
          return result;
        },
        (err) => {
          pool.release(resource);
          throw err;
        }
      );
  };
  return pool;

  pool.drain().then(function () {
    pool.clear();
  });
};
