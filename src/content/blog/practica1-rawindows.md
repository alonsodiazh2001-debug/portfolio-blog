---
title: "Practica1 RAWindows"
description: ""
pubDate: 2026-11-25
tags: []
draft: false
---

![Captura 1](/images/practica1-rawindows/doc-1.jpg)

**Práctica 1: Administración de Procesos en Windows Server**

**Tarea 1: Identificación y Seguimiento**

Objetivo: usar herramientas gráficas y de línea de comandos en Windows.

1. **Herramientas Gráficas:**Abrir el **Administrador de Tareas**.En la pestaña **Detalles**, identificar el **PID** y la **Clase de Prioridad** de un proceso.

![Captura 2](/images/practica1-rawindows/doc-2.png)

- Abrir el **Monitor de Recursos** y analizar la actividad del disco, red y CPU por proceso.

![Captura 3](/images/practica1-rawindows/doc-3.png)

1. **PowerShell / CMD (Tasklist):**Ejecutar tasklist para obtener una lista de procesos.

![Captura 4](/images/practica1-rawindows/doc-4.png)

- Usar filtros para buscar procesos de servicios (ej. tasklist /svc /fi "imagename eq svchost.exe").

![Captura 5](/images/practica1-rawindows/doc-5.png)

- Mostrar la memoria usada y el PID: tasklist /v.

![Captura 6](/images/practica1-rawindows/doc-6.png)

1. **Reflexión**:
Una vez que has visto los comandos, realiza una reflexión y profundiza en las opciones del comando tasklist (tasklist /?). Justifica tus respuestas con pantallazos que ayuden a entenderlas.¿Qué opciones del comando crees que son las que más información te pueden dar y más usarías en el día a día?¿Por qué?Muestra algunos de los procesos del sistemaMuestra algunos de los procesos de usuario

**Tarea 2: Manipulación y Servicios**

Objetivo: manipular procesos y servicios del sistema.

1. **Terminación de Procesos (Taskkill):**Crear un proceso simple (ej. abrir notepad.exe).

![Captura 7](/images/practica1-rawindows/doc-7.png)

- Identificar su PID usando tasklist.

![Captura 8](/images/practica1-rawindows/doc-8.png)

- Terminar el proceso usando el nombre de la imagen: taskkill /im notepad.exe.

![Captura 9](/images/practica1-rawindows/doc-9.png)

- Terminar el proceso usando el PID: taskkill /pid <PID> /f (explicar el uso del /f para forzar).

![Captura 10](/images/practica1-rawindows/doc-10.png)

1. **Manipulación de Servicios (Demonios en Windows):**Abrir la consola de **Servicios (services.msc)**.Detener e iniciar un servicio no crítico (ej. "Cola de impresión").

![Captura 11](/images/practica1-rawindows/doc-11.png)

- Realizar la misma tarea usando PowerShell: Stop-Service spooler y Start-Service spooler.

![Captura 12](/images/practica1-rawindows/doc-12.png)

**Tarea 3: Arranque y Procesos Críticos**

Objetivo: identificar la secuencia de arranque de Windows y aplicar medidas de seguridad.

1. **Identificación de Procesos Críticos de Arranque:**En el Administrador de Tareas, buscar los procesos esenciales: **smss.exe** (Session Manager), **csrss.exe** (Client/Server Runtime), y **wininit.exe**.

![Captura 13](/images/practica1-rawindows/doc-13.png)

- Investiga sobre el proceso smss.exe es el proceso clave que inicia la sesión de usuario y la jerarquía.

Es el proceso clave de inicio en modo usuario que configura variables de entorno del sistema, crea las sesiones (la sesión 0 para servicios del sistema y las sesiones interactivas 1, 2... para usuarios)

1. **Comprobación de Seguridad:**Simular la detección: En la pestaña **Detalles** del Administrador de Tareas, añadir la columna **"Nombre de la imagen de la ruta"**.

![Captura 14](/images/practica1-rawindows/doc-14.png)

![Captura 15](/images/practica1-rawindows/doc-15.png)

- Si se detecta un proceso desconocido, comprobar su ruta de ejecución es la primera medida de seguridad. Si el proceso no se encuentra en el directorio estándar (C:\Windows\System32), debe ser investigado. ¿Por qué?

Si aparece un proceso con nombre sospechoso o similar al del sistema corriendo desde rutas como AppData, Temp o carpetas de usuario, puede ser malware o un binario suplantado

- **Principio de Privilegio:** Comprobar la columna **"Nombre de usuario"** y verificar que los servicios importantes no se estén ejecutando como el usuario SYSTEM o Administrador cuando no es estrictamente necesario.

![Captura 16](/images/practica1-rawindows/doc-16.png)

- Genera una situación en la que tengas en Notepad corriendo como proceso de usuario y otro corriendo con permisos de administrador.
