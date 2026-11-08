/**
 * App 外壳（Android APK）启动逻辑：
 * 构建时注入 VITE_REMOTE_URL（线上网页地址）后，启动先探测服务器——
 * 能连上就直接打开线上版本（新游戏、新规则随 Docker 更新自动生效，不必重装 APK）；
 * 连不上（无网络 / 服务器维护）就使用 APK 内置的离线版本，单人模式照常可玩。
 * 普通网页构建不注入该变量，这里什么也不做。
 */
const PROBE_TIMEOUT_MS = 2500;

export async function openRemoteIfOnline(): Promise<boolean> {
  const remote = import.meta.env.VITE_REMOTE_URL as string | undefined;
  if (!remote) return false;
  let target: URL;
  try {
    target = new URL(remote);
  } catch {
    return false;
  }
  if (location.origin === target.origin) return false; // 已在线上版本
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    // no-cors：只关心能否连通，不读取内容
    await fetch(new URL('healthz', target).href, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: ctrl.signal,
    });
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
  // 保留内置版本里的路由（如 #/room/ABCD）
  location.replace(target.origin + target.pathname + location.hash);
  return true;
}
