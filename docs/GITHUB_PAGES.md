# GitHub Pages

El código fuente está en `main`. La versión generada está publicada en la rama `gh-pages`:

- `index.html`: aplicación autónoma, con código, estilos e imágenes incluidos.
- `.nojekyll`: indica que los archivos deben servirse directamente.
- `WinClone-probar.zip`: descarga para abrir también en local.

Para activar el sitio en GitHub, abre [Settings → Pages](https://github.com/miguelcoxcaballero/winclone/settings/pages), selecciona **Deploy from a branch**, rama **gh-pages**, carpeta **/ (root)** y pulsa **Save**.

Cuando GitHub complete el despliegue, la dirección será:

https://miguelcoxcaballero.github.io/winclone/

El ZIP quedará en `https://miguelcoxcaballero.github.io/winclone/WinClone-probar.zip`.

La activación y la respuesta pública no se pudieron comprobar desde el entorno cloud: el proxy devuelve 403 al conectar con `api.github.com` y `miguelcoxcaballero.github.io`. Ambos dominios se añadieron al borrador de red para revisión. El acceso Git sí funciona y las dos ramas se subieron y verificaron en el remoto. No se afirma que el sitio esté activo hasta observar un despliegue correcto o una respuesta pública.

Para actualizar el contenido, vuelve a generar `npm run build:portable`, toma la rama remota `gh-pages` en una carpeta temporal de publicación, sustituye `index.html` por el HTML generado, actualiza el ZIP y sube un commit normal. Conserva el historial y evita `--force`.
