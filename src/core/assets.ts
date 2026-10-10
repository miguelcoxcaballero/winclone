/** The portable HTML supplies embedded originals; the hosted build uses public/. */
export function assetUrl(path: string): string {
  const assets = (window as Window & { __WINCLONE_ASSETS__?: Record<string,string> }).__WINCLONE_ASSETS__;
  return assets?.[path.replace(/^\.\//, '')] ?? path;
}
