const iframeId = 'icabod-iframe';
const iframeSrc = 'http://localhost:4200/embedded';
window.onload = async () => {
  function displayMessage(evt) {
    if (evt.origin === 'http://localhost:4200') {
      console.log(`Received ${evt.data} from ${evt.origin}`);
      const data = JSON.parse(evt.data);
      if (data?.response) {
        hideIframe();
      }
    } else {
      console.warn(evt.origin);
    }
  }
  if (window.addEventListener) {
    window.addEventListener('message', displayMessage, false);
  } else {
    window.attachEvent('onmessage', displayMessage);
  }
  injectIframe();
};
function injectIframe() {
  let iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.id = iframeId;
  iframe.style.zIndex = '99999';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.border = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
}
function hideIframe () {
  const iframe = document.getElementById(iframeId);
  iframe.style.display = 'none';
}
function showIframe () {
  const iframe = document.getElementById(iframeId);
  iframe.style.display = 'block';
}
function login() {
  showIframe();
  const iframeWindow = document.getElementById(iframeId).contentWindow;
  const msg = JSON.stringify({ request: 'login', network: 'delphinet' });
  iframeWindow.postMessage(msg, iframeSrc);
}
function send() {
  showIframe();
  const iframeWindow = document.getElementById(iframeId).contentWindow;
  const msg = JSON.stringify({ request: 'send', network: 'delphinet', destination: 'tz1NBvY7qUedReRcYx8gqV34c8fUuks8o8Nr', amount: '10000' });
  iframeWindow.postMessage(msg, iframeSrc);
}