# WeatherApp

Aplicación web sencilla de clima construida con HTML, CSS y JavaScript.

## Qué hace

La app consulta la API de clima para Buenos Aires y muestra el pronóstico de los próximos días en la interfaz del navegador.

## Estructura

- `index.html`: estructura principal de la página.
- `style.css`: estilos visuales de la aplicación.
- `script.js`: lógica para consultar la API y actualizar la UI.
- `APIConfig.js`: contiene la clave de acceso a la API.
- `example-ApiConfig.js`: plantilla segura de ejemplo para configurar la clave.

## Cómo arrancarla

1. Copiar `example-ApiConfig.js` y renombrarlo a `ApiConfig.js` o `APIConfig.js`, según el nombre que use tu proyecto.
2. Reemplazar el placeholder por tu clave real de WeatherAPI.
3. Abrir `index.html` en el navegador, o
4. servir la carpeta localmente con un servidor estático simple.

## Nota

El proyecto usa la API de WeatherAPI para obtener datos meteorológicos en tiempo real.

No requiere instalación de paquetes ni build tools; basta con abrir la página en un navegador y completar la clave en un archivo de configuración local. No dejes secretos reales dentro del repositorio.

## Configuración segura

Este repositorio no incluye una clave real. Para usar el proyecto:

1. copiar `example-ApiConfig.js`
2. renombrarlo a `ApiConfig.js` o `APIConfig.js` en tu entorno local
3. reemplazar `[ACÁ VA TU API KEY]` por tu clave real
4. guardar la versión real fuera del repositorio, por ejemplo en una carpeta local no versionada
5. no commitear ni pushear el archivo real de configuración