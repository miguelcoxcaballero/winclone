# Icon assets

The Windows reference images in `src/assets/windows` replace the original hand-drawn approximations. They are bundled locally and embedded in the portable HTML, so the interface never depends on a third-party icon CDN.

Sources:

- [Microsoft Terminal](https://github.com/microsoft/terminal), revision `7d06b26f73ef4bcb78b56647c395251eeee4c2bc`: `res/terminal/Terminal.svg`.
- [FadeMind/W-ICO](https://github.com/FadeMind/W-ICO): selected Windows 11 application images. The collection also contains custom variants; inclusion here is not a claim that Microsoft published that repository. ICO images are decoded at their largest available size and saved as PNG without drawing or changing their pixels.
- [hesphoros/windows11-icons](https://github.com/hesphoros/windows11-icons): selected system and app PNG images. The source describes these as images extracted from Windows 11.
- [Win11React](https://github.com/blueedgetechno/win11React), revision `afb02e797106c208314abbf837ec11bf50da9d62`: Outlook image.
- Start and favicon use a shared four-square Windows symbol with straight corners.

`sources.json` records the exact source path, downloaded-byte SHA-256 and bundled-byte SHA-256 for each reference image. Local personal overrides in `src/custom-assets/icons` take priority.

Microsoft owns its app artwork and trademarks. The third-party collections do not grant a blanket license to Microsoft's artwork; their repository terms must not be treated as an asset license. This browser recreation is not affiliated with Microsoft. The images improve icon fidelity; they do not establish pixel-for-pixel parity with every current Windows build or Store app update.
