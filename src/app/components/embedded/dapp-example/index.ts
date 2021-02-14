export class DappExample {
  private readonly iframeId = 'icabod-iframe';
  private readonly iframeSrc = 'http://localhost:4200/embedded';

  constructor() {
    window.onload = async () => {
      function displayMessage(evt) {
        if (evt.origin === 'http://localhost:4200') {
          console.log(`Received ${evt.data} from ${evt.origin}`);
          const data = JSON.parse(evt.data);
          if (data?.response) {
            hide();
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
  }

  injectIframe(): void {
    if (!getIframe()) {
      let iframe = document.createElement('iframe');
      iframe.src = this.iframeSrc;
      iframe.id = this.iframeId;
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
  }

  private getIframe() {
    document.getElementById(this.iframeId)
  }

  hide(): void {
    this.getIframe().display = 'none'
  }

  show(): void {
    this.getIframe().display = 'block'
  }

  private postMessage(message: any): void {
    this.getIframe().contentWindow.postMessage(
      JSON.stringify(message),
      this.iframeSrc
    )
  }

  login(): void {
    this.show();
    this.postMessage({ request: 'login', network: 'delphinet' })
  }

  send(): void {
    this.show();
    this.postMessage({ request: 'send', network: 'delphinet', destination: 'tz1NBvY7qUedReRcYx8gqV34c8fUuks8o8Nr', amount: '10000' })
  }
}
