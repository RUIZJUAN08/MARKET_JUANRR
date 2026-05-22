# Market Juanrr

Tienda virtual sencilla desarrollada en HTML, CSS y JavaScript puro.

## Descripción

Proyecto de tienda online desarrollado por Juan Manuel Ruiz.

- Listado de productos en una cuadrícula de 3 columnas.
- Búsqueda en tiempo real con sugerencias y sinónimos simples.
- Carrito persistente en `localStorage`.
- Sistema de login/registro simulado usando localStorage.
- Página de venta de productos con carga de imagen.
- Navegación por hash (`#home`, `#product-1`, `#login`, etc.).

## Estructura del proyecto

- `html/index.html` - punto de entrada de la aplicación.
- `css/tienda_virtual.css` - estilos principales de la tienda.
- `js/tienda_virtual.js` - lógica completa del frontend.
- `README.md` - documentación del proyecto.
- `.gitignore` - archivos y carpetas ignorados por Git.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage

## Cómo usar

1. Abre `index.html` en tu navegador.
2. Busca productos desde la barra de búsqueda.
3. Haz clic en una tarjeta para ver el detalle.
4. Agrega artículos al carrito y confirma la compra.
5. Regístrate o inicia sesión para guardar tu carrito.

## Notas importantes

- La aplicación funciona completamente en el navegador.
- Los datos se guardan localmente usando `localStorage`.
- Las imágenes de producto añadidas se guardan como data URLs.

## Mejoras incluidas

- Diseño responsive para móviles y tablets.
- Tarjetas clicables con detalle abierto automáticamente.
- Búsqueda dinámica que filtra los productos mientras escribes.
- Menú lateral y navegación accesible.
- Comentarios en el código para facilitar el mantenimiento.
