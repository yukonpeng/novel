/**
 * 复制文本到剪贴板。
 * 优先使用 Clipboard API（扩展页面 / https 下可用），
 * file:// 等非安全上下文回退到隐藏 textarea + execCommand。
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (!document.execCommand('copy')) {
      throw new Error('execCommand copy failed');
    }
  } finally {
    textarea.remove();
  }
}
