const OPTIONAL_KEYS = [
  'MediaPlayPause',
  'MediaPlay',
  'MediaPause',
  'ColorF0Red',
  'ColorF1Green',
  'ColorF2Yellow',
  'ColorF3Blue'
];

export function initTizenPower() {
  // Samsung TV screensaver API (Tizen TV / webapis)
  try {
    const appcommon = globalThis?.webapis?.appcommon;
    if (appcommon?.setScreenSaver) {
      appcommon.setScreenSaver(appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
    }
  } catch (error) {
    console.warn('webapis.appcommon.setScreenSaver failed', error);
  }
  // Fallback: generic Tizen power API (works on some platforms)
  try {
    globalThis?.tizen?.power?.request('SCREEN', 'SCREEN_NORMAL');
  } catch (error) {
    console.warn('tizen.power.request failed', error);
  }
}

export function initTizenRemoteKeys() {
  const tvInput = globalThis?.tizen?.tvinputdevice;
  if (!tvInput) return;

  try {
    if (typeof tvInput.registerKeyBatch === 'function') {
      tvInput.registerKeyBatch(OPTIONAL_KEYS);
      return;
    }
  } catch (error) {
    console.warn('registerKeyBatch failed, falling back to registerKey', error);
  }

  OPTIONAL_KEYS.forEach((key) => {
    try {
      tvInput.registerKey(key);
    } catch (error) {
      console.warn(`Unable to register remote key: ${key}`, error);
    }
  });
}

export function isTizenDevice() {
  return Boolean(globalThis?.tizen?.tvinputdevice);
}
