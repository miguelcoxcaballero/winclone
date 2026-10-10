# GitHub Pages

El código fuente está en `main`. La versión generada está publicada en la rama `gh-pages`:

- `index.html`: aplicación autónoma, con código, estilos e imágenes incluidos.
- `.nojekyll`: indica que los archivos deben servirse directamente.
- `WinClone-probar.zip`: descarga para abrir también en local.

Para activar el sitio en GitHub, abre [Settings → Pages](https://github.com/miguelcoxcaballero/winclone/settings/pages), selecciona **Deploy from a branch**, rama **gh-pages**, carpeta **/ (root)** y pulsa **Save**.

Cuando GitHub complete el despliegue, la dirección será:

https://miguelcoxcaballero.github.io/winclone/

El ZIP quedará en `https://miguelcoxcaballero.github.io/winclone/WinClone-probar.zip`.

Pages está activado en `gh-pages` y GitHub confirmó un despliegue `built`. La dirección pública respondió HTTP 200 durante la comprobación del 10 de octubre de 2026.

Para actualizar el contenido, vuelve a generar `npm run build:portable`, toma la rama remota `gh-pages` en una carpeta temporal de publicación, sustituye `index.html` por el HTML generado, actualiza el ZIP y sube un commit normal. Conserva el historial y evita `--force`.
