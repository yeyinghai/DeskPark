import '@park/engine';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { toast } from './components/ui';
import { isOfflineShell, openRemoteIfOnline } from './lib/appShell';
import { loadCharacters } from './lib/characters';
import './styles/tokens.css';
import './styles/global.css';
import './components/components.css';
import './components/mahjong.css';
import './screens/table.css';

function start(): void {
  void loadCharacters();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// APK 外壳：联网时跳转到线上最新版本，离线时使用内置版本
void openRemoteIfOnline().then((redirected) => {
  if (redirected) return;
  start();
  if (isOfflineShell()) setTimeout(() => toast('未连上服务器，已进入离线版（单人可玩）'), 600);
});
