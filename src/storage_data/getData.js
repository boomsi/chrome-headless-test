const localStr = getLocalStorage();
const sessionStr = getSessionStorage();

const oMeta = document.createElement("meta");
oMeta.name = "data-storage";
oMeta.dataset.localstorage = localStr;
oMeta.dataset.sessionstorage = sessionStr;
const oHead = document.getElementsByTagName("head")[0];
oHead.appendChild(oMeta);

function getLocalStorage() {
  const len = localStorage.length;
  const obj = {};
  for (let i = 0; i < len; i++) {
    const key = localStorage.key(i);
    obj[key] = localStorage.getItem(key);
  }
  return JSON.stringify(obj);
}

function getSessionStorage() {
  const len = sessionStorage.length;
  const obj = {};
  for (let i = 0; i < len; i++) {
    const key = sessionStorage.key(i);
    obj[key] = sessionStorage.getItem(key);
  }
  return JSON.stringify(obj);
}
