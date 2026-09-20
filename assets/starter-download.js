'use strict';

let manifestPromise;

function crc32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    table[i] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = crc32Table();
const encoder = new TextEncoder();

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function writeUint16(view, offset, value) { view.setUint16(offset, value, true); }
function writeUint32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }

function makeStoredZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.path.replace(/\\/g, '/'));
    const data = file.data;
    const checksum = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, data.length);
    writeUint32(localView, 22, data.length);
    writeUint16(localView, 26, name.length);
    writeUint16(localView, 28, 0);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    localParts.push(local);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, data.length);
    writeUint32(centralView, 24, data.length);
    writeUint16(centralView, 28, name.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);
  return new Blob([...localParts, ...centralParts, end], {type: 'application/zip'});
}

async function getManifest() {
  manifestPromise ||= fetch('assets/starters/manifest.json?v=d1ec070f5910', {cache: 'no-cache'}).then(response => {
    if (!response.ok) throw new Error('Не удалось загрузить состав архива проекта.');
    return response.json();
  });
  return manifestPromise;
}

async function loadFiles(entries) {
  return Promise.all(entries.map(async entry => {
    if (typeof entry.content === 'string') {
      return {path: entry.path, data: encoder.encode(entry.content)};
    }
    const response = await fetch(entry.url);
    if (!response.ok) throw new Error(`Не удалось загрузить ${entry.path}`);
    return {path: entry.path, data: new Uint8Array(await response.arrayBuffer())};
  }));
}

async function downloadStarter(button) {
  const key = button.dataset.starter;
  const filename = button.dataset.filename || `${key}.zip`;
  const original = button.textContent;
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Собираем ZIP…';
  try {
    const manifest = await getManifest();
    const entries = manifest[key];
    if (!Array.isArray(entries) || !entries.length) throw new Error('Архив не найден в опубликованных материалах.');
    const blob = makeStoredZip(await loadFiles(entries));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    button.removeAttribute('aria-busy');
    button.textContent = original;
  }
}

export function bindStarterDownloads() {
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-starter]');
    if (!button) return;
    event.preventDefault();
    if (button.getAttribute('aria-busy') === 'true') return;
    try {
      await downloadStarter(button);
    } catch (error) {
      window.alert(`Архив не скачан: ${error.message}`);
    }
  });
}
