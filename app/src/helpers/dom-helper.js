export default class DOMhelper {
  static parseStrToDOM(str) {
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/html");
  }

  static wrapTextNode(dom) { //we go deep into each last text node
    const body = dom.body;
    let textNodes = [];
    
    function recursy(element) {
      element.childNodes.forEach(node => {
        
        if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
          textNodes.push(node);
        } else {
          recursy(node);
        }
      })
    }

    recursy(body);

    textNodes.forEach((node, i) => {
      const wrapper = dom.createElement("text-editor");
      node.parentNode.replaceChild(wrapper, node);
      wrapper.appendChild(node);              // adding custom tag "text-editor" to each text node
      wrapper.setAttribute("nodeId", i)       // To have chanse to compare both DOM obj(Real and virtual) we have to add id to each custom tag
    })

    return dom;
  }

  static serializedDomToString(dom) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(dom);
  }

  static unwrapTextNodes(dom) {
    dom.body.querySelectorAll("text-editor").forEach(element => {
      element.parentNode.replaceChild(element.firstChild, element);
    })
  }

  static wrapImages(dom) {
    dom.body.querySelectorAll('img').forEach((img, i) => {
      img.setAttribute('editableimgid', i)
    })
    return dom;
  }

  static unWrapImages(dom) {
    dom.body.querySelectorAll('[editableimgid]').forEach((img, i) => {
      img.removeAttribute('editableimgid')
    })
  }
}