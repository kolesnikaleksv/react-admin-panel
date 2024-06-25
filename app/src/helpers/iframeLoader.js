// import { reject, resolve } from "core-js/fn/promise";

HTMLIFrameElement.prototype.load = function (url, callback) {
  const iframe = this;

  try {
    iframe.src = url + "?rnd=" + Math.random().toString().substring(2);
  } catch (error) {
    if(!callback) {
      return new Promise((resolve, regect) => {
        regect(error);
      }) 
    } else {
      callback(error);
    }
  }

  const maxTime = 60000;
  const interval = 200;

  let timeCount = 0;

  if(!callback) {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if(!iframe) return clearInterval(timer);
        timeCount++;
        if(iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
          clearInterval(timer);
          resolve();
        } else if (timeCount * interval > maxTime) {
          reject(new Error("Iframe load fale"));
        }
      }, interval)
    })
  } else {
    const timer = setInterval(() => {
      if(!iframe) return clearInterval(timer);
      timeCount++;
      if(iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
        clearInterval(timer);
        callback();
      } else if (timeCount * interval > maxTime) {
        callback(new Error("Iframe load fale"));
      }
    }, interval)
  }
}