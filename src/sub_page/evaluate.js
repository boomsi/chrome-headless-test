module.exports = async function evaluateFunc(dict) {
  const link = [];

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

      attrsList[attr.nodeName] = attr.nodeValue;
    });

    return attrsList;
  }

  loopDom();

  return link;
};
