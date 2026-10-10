# Probar WinClone

## Abrir la versión portátil

Ejecuta `npm run build:portable`. Abre `dist/WinClone.html` con Chrome o Edge, pulsa la pantalla de bloqueo y después **Sign in**. La cuenta local inicial no tiene contraseña. El HTML lleva incluidos JavaScript, estilos, iconos y fondos; las funciones locales no necesitan Internet.

También se puede desplegar `dist/` después de `npm run build`, o desarrollar con `npm ci` y `npm run dev`. `npm run build` limpia `dist/`; genera el HTML portátil después si necesitas ambos formatos.

## Cosas que puedes probar

1. Abre **Notepad**, escribe una nota y pulsa **Save**. Dale un nombre. Ábrela desde **File Explorer → Documents**. **Export .txt** permite guardarla fuera de WinClone. Al cerrar con cambios sin guardar aparece una confirmación.
2. En **File Explorer**, crea, renombra, copia y elimina archivos. La papelera permite restaurarlos. También puedes importar archivos locales y alternar entre iconos y detalles.
3. Dibuja en **Paint**, guarda el PNG y ábrelo en **Photos**. Puedes usar una foto como fondo de escritorio.
4. Cambia tema, fondo y alineación de la barra en **Settings**. Recarga: los cambios se conservan en este navegador.
5. Añade tareas en **To Do** y eventos en **Calendar**. Recarga para comprobar su persistencia.
6. Prueba cálculos, temporizadores, cronómetro, alarmas y sesiones de concentración. Los avisos funcionan mientras la página sigue abierta.
7. Abre **Terminal** y ejecuta `help`, `cd Documents`, `write prueba.txt "Hola"` y `cat prueba.txt`.
8. Usa la búsqueda de la barra, los controles rápidos, las notificaciones y **Task View**. Los atajos originales del escritorio continúan disponibles.

Los datos se guardan en el almacenamiento de este navegador y tienen su límite de capacidad. Exporta los documentos e imágenes que quieras conservar independientemente. El ZIP portátil no contiene archivos personales ni estado del navegador.

## Servicios y permisos

La bandeja de correo es una demostración local: **Send locally** guarda el mensaje en enviados sin transmitir correo. La biblioteca de apps abre las aplicaciones incluidas, las fija o crea accesos directos. El terminal no ejecuta comandos del sistema operativo anfitrión.

Weather comienza con una muestra claramente identificada. **Get live forecast** consulta `api.open-meteo.com` y necesita conexión. Los sitios externos del navegador integrado pueden bloquear los iframes; **Open in browser** permite abrirlos en otra pestaña.

Cámara y captura solicitan permisos al pulsar sus botones. Su disponibilidad depende del navegador, la cámara y el contexto seguro. Si no son compatibles o se deniega el permiso, muestran un mensaje sin bloquear el escritorio. No se ha comprobado hardware real en la máquina cloud.

## Comprobaciones de desarrollo

`npm run build` comprueba TypeScript y genera la web. `npm run build:portable` comprueba TypeScript y genera el HTML autónomo.

La suite `npm run test:browser` usa Playwright Core y Chromium. En la máquina preparada ya están disponibles. En otro equipo, instala el paquete en una carpeta de herramientas fuera del proyecto y define `WINCLONE_PLAYWRIGHT_PATH` con su ruta; define `WINCLONE_CHROMIUM` con la ruta de Chromium/Chrome si no está en `/usr/bin/chromium`.

Con el servidor de desarrollo funcionando:

```bash
npm run test:browser -- http://127.0.0.1:5173/
```

Para comprobar el HTML autónomo sin conexiones de red:

```bash
npm run build:portable
npm run test:browser -- http://127.0.0.1:4173/WinClone.html --portable
```

En ese modo, Playwright entrega únicamente el contenido del HTML desde una ruta HTTP local simulada, bloquea las demás solicitudes y desactiva la red. No hace falta un servidor en 4173. El navegador administrado de esta máquina prohíbe `file://`, por lo que aquí se comprueba el contenido autónomo mediante esa ruta en lugar de afirmar una prueba directa por doble clic.

Las pruebas usan un perfil aislado y comprueban arranque, apertura de aplicaciones, guardado/exportación, asociación de archivos, protección de cambios, operaciones de papelera, dibujo, persistencia, cronómetro y controles del escritorio. Capturas de fallos y del escritorio se escriben en `dist/test-results/`.
