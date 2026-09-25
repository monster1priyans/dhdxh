import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative } from './platform';

export interface OutFile { name: string; mime: string; text?: string; base64?: string }

/** Native: write to the app cache, then open the share sheet. Web: download. Nothing is uploaded. */
export async function deliverFiles(files: OutFile[], title: string): Promise<void> {
  if (isNative()) {
    const uris: string[] = [];
    for (const f of files) {
      const res = f.text !== undefined
        ? await Filesystem.writeFile({ path: f.name, data: f.text, directory: Directory.Cache, encoding: Encoding.UTF8 })
        : await Filesystem.writeFile({ path: f.name, data: f.base64 ?? '', directory: Directory.Cache });
      uris.push(res.uri);
    }
    await Share.share({ title, files: uris });
    return;
  }
  for (const f of files) {
    const blob = f.text !== undefined
      ? new Blob([f.text], { type: f.mime })
      : new Blob([Uint8Array.from(atob(f.base64 ?? ''), c => c.charCodeAt(0))], { type: f.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

/** Opens a file picker and returns the chosen file's text (web + Android WebView). */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) { resolve(null); return; }
      f.text().then(resolve, () => resolve(null));
    };
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

export const safeFileName = (s: string) => s.normalize('NFKD').replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') || 'profile';
