const OPTIONAL_KEYS = [
  'MediaPlayPause',
  'MediaPlay',
  'MediaPause',
  'ColorF0Red',
  'ColorF1Green',
  'ColorF2Yellow',
  'ColorF3Blue'
];

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
