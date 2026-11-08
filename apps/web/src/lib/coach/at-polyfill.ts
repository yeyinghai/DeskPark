/**
 * Worker 不经过 Vite 注入的 core-js 补丁，这里给旧版 WebView（Chrome < 92）
 * 单独补上 Array/String.prototype.at，引擎里大量用到 `.at(-1)`。
 */
function at<T>(this: ArrayLike<T>, index: number): T | undefined {
  const len = this.length;
  let i = Math.trunc(index) || 0;
  if (i < 0) i += len;
  return i < 0 || i >= len ? undefined : this[i];
}

for (const proto of [Array.prototype, String.prototype] as object[]) {
  if (!('at' in proto)) {
    Object.defineProperty(proto, 'at', { value: at, writable: true, configurable: true });
  }
}

export {};
