module.exports = async function evaluateFunc(dict) {
  const link = [];
  const clickDom = [];

  function loopDom(parentNode = "body", tree = []) {
    const children =
      typeof parentNode === "string"
        ? [...document.querySelector(parentNode).children]
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

  function getAttrs(dom) {
    const attrs = [...dom.attributes];
    const attrsList = {};

    attrs.forEach((attr) => {
      if (attr.nodeName === "href" && /^\/\S+$/.test(attr.nodeValue)) {
        link.push(attr.nodeValue);
      }

      if (
        (attr.nodeName === "class" &&
        dict.feature_class.filter((reg) => attr.nodeValue?.match(new RegExp(reg))?.length)) ||
        dict.feature_attr_name.filter(reg => attr.nodeValue?.match(new RegExp(reg)))?.length
      ) {
        console.log(dom)
        clickDom.push(dom)
      }

      attrsList[attr.nodeName] = attr.nodeValue;
    });

    return attrsList;
  }

  loopDom();

  // 处理可点击的dom
  // console.log(clickDom)
  // clickDom.forEach(dom => {
  //   dom.click()
  //   loopDom()
  // })

  return link;
};
