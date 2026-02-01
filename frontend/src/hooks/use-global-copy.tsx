import { useEffect } from 'react';
import { toast } from 'sonner';

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
        return;
      }

      const codeToCopy = codeElement.innerText;

      const showSuccess = () => {
        toast.success('代码已复制', { duration: 2000 });
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
          toast.error('复制失败', { duration: 2000 });
        }
      }
    };

    return () => {
      delete (window as any).copyToClipboard;
    };
  }, []);
};
