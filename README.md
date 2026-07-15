# Proyecto: aplicación de pictogramas
La idea de este proyecto es crear un proyecto en el cual se puede usar una aplicación donde las personas con discapacidad puedan usarla para comunicarse


## PWA


Una aplicación PWA es una aplicación que se compila mediante cpdigo como HTLM, CSS Y JavaScript [Introducción a las aplicaciones web progresivas (PWA)](https://learn.microsoft.com/es-es/microsoft-edge/progressive-web-apps/).


La idea principal de esta aplicación, es ofrecer un entorno con pictogramas tal y como se muestra en la imagen.

![Muestra de la interfaz de la imagen](Imagenes_readme/muestra.jpg)


En la imagen se muestran como se observa la apliación, esta cuenta con secciones como: **Personas**, **Acciones**, **Descripción**, etc; que son donde se encuentran los botones de las palabras a elegir por el usuario.

Tal como se muestra, el usuario puede elegir en la aplicación, cual palanbra usar tocando el ícono, ejemplo: **Yo**. Tal como se muestra a continuación:

![ejemplo_yo](Imagenes_readme/yo.jpg)

Cuando se tocan estos pictogramas, el audio procede a salir cuando se le da al botón de ***Hablar***

También está la opción de cribir, en la cual el usuario puede escribir las frases que desee y estas salen en forma de audio.

![ejemplo_yo](Imagenes_readme/escribir.jpg)

Seguir.



## **Sobre el código**

# manifest.json

Este es un archivo json donde cada línea hace lo siguiente:

1. `` "name" `` y `` "short_name" `` es el nombre completo y el nombre corto que se va a mostrar debajo del ícono en la pantalla de inicio.
2. `` "star_url" `` caul es el archivo que abre cuando se toca el ícono.
3. `` "background_color" `` y `` "background_color" `` son los colores que usa el sistema colores que usa el sistema mienstras la app carga y en la barra de estado.
4. `` "icons" `` es la lista de íconos.


# service-worker.js


1. `` "NOMBRE_CACHE" `` es una caja donde se guardad los archivos, el v1 es porque es la versión uno, cuando se quiera cambiar se le pone v2 y se crea una nueva caja.

2. `` "ARCHIVOS_A_GUARDAR" `` es la lista de lo que neesita la aplicación para funcionar sin conexión.
3. Eventos:
   1. `` "install" `` es un evento que solo pasa una vez, la primera vez que alguien visita la app, ahí se descarga y guarda todo.
   2. `` "fetch" `` pasa siempre, cada vez que la página pide cualquier recurso. si lo tiene guardado usa ese recurso, sino lo busca en internet.