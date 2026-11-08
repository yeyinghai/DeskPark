/**
 * App 外壳（Android APK）启动逻辑：
 * 构建时注入 VITE_REMOTE_URL（线上网页地址）后，启动先探测服务器——
 * 能连上就直接打开线上版本（新游戏、新规则随 Docker 更新自动生效，不必重装 APK）；
 * 连不上（无网络 / 服务器维护）就使用 APK 内置的离线版本，单人模式照常可玩。
 * 普通网页构建不注入该变量，这里什么也不做。
 */
const PROBE_TIMEOUT_MS = 6000;

function remoteTarget(): URL | null {
  const remote = import.meta.env.VITE_REMOTE_URL as string | undefined;
  if (!remote) return null;
  try {
    const target = new URL(remote);
    return location.origin === target.origin ? null : target;
  } catch {
    return null;
  }
}

/** 当前是否为 App 内置的离线版本（可以尝试切换到线上版本） */
export function isOfflineShell(): boolean {
  return remoteTarget() !== null;
}

/** 服务器连得上就跳转到线上版本并返回 true；否则返回 false */
export async function openRemoteIfOnline(): Promise<boolean> {
  const target = remoteTarget();
  if (!target) return false;
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
  // 保留内置版本里的路由（如 #/room/ABCD）；「新建房间」需要重新发起，回到大厅
  const hash = /^#\/room\/new/i.test(location.hash) ? '' : location.hash;
  location.replace(target.origin + target.pathname + hash);
  return true;
}
