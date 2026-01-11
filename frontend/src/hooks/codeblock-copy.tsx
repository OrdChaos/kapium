import { useEffect } from 'react';

declare global {
  interface Window {
    copyToClipboard: (el: HTMLElement) => void;
  }
}

export const useGlobalCopy = () => {
  useEffect(() => {
    window.copyToClipboard = (el: HTMLElement) => {
      const wrapper = el.closest('.code-block-wrapper');
      const codeElement = wrapper?.querySelector('pre code') as HTMLElement;

      if (!codeElement) {
        console.error('未找到代码元素');
        return;
      }

      const codeToCopy = codeElement.innerText;
      const originalText = el.innerText;

      const showSuccess = () => {
        el.innerText = 'Copied!';
        el.classList.add('copy-success');

        setTimeout(() => {
          el.innerText = originalText;
          el.classList.remove('copy-success');
        }, 500);
      };

      // 优先 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codeToCopy)
          .then(showSuccess)
          .catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = codeToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();

          const success = document.execCommand('copy');
          document.body.removeChild(textarea);

          if (success) {
            showSuccess();
          } else {
            console.error('execCommand copy 失败');
          }
        } catch (err) {
          console.error('无法复制代码', err);
        }
      }
    };

    return () => {
      delete (window as any).copyToClipboard;
    };
  }, []);
};
