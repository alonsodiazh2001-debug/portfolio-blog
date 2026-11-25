---
title: "Bastionado de Apache2: Autenticación con MySQL (mod_authn_dbd) y hashes Bcrypt"
description: "Cómo proteger rutas web en Apache2 autenticando contra MySQL, generando contraseñas cifradas con bcrypt mediante htpasswd y aplicando buenas prácticas de seguridad."
pubDate: 2026-11-24
tags: ["Ciberseguridad", "Apache2", "MySQL", "Bcrypt", "Hardening"]
---

En **Seguridad y Alta Disponibilidad (2º ASIR)** implementamos control de acceso en **Apache2** delegando la verificación de usuarios a una base de datos **MySQL** mediante `mod_authn_dbd`, evitando contraseñas en texto plano gracias a **bcrypt**.

---

## 1. Instalación y bastionado inicial de MySQL

Instalamos `mysql-server` y ejecutamos el asistente oficial de endurecimiento (`mysql_secure_installation`) para deshabilitar accesos anónimos, logins remotos de `root` y bases de prueba:

```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo mysql_secure_installation
```

> **Buena práctica de mínimo privilegio:** en lugar de otorgar `ALL PRIVILEGES ON *.*` al usuario que usará Apache, en producción conviene crear un usuario exclusivo con permisos **únicamente de lectura (`SELECT`)** sobre la tabla de autenticación.

---

## 2. Módulos de Apache2 para conexión DBD con MySQL

Instalamos el driver MySQL para APR-Util y habilitamos los módulos `dbd` y `authn_dbd` en Apache2:

```bash
sudo apt install apache2 libaprutil1-dbd-mysql -y
sudo a2enmod dbd authn_dbd
sudo systemctl restart apache2
```

---

## 3. Base de datos y tabla de usuarios

Creamos la base de datos `db_autoriza`, el usuario de solo lectura `apache_auth` (cambia la contraseña por una robusta en tu entorno) y la tabla `TB_USUARIOS`:

```sql
CREATE DATABASE db_autoriza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'apache_auth'@'localhost' IDENTIFIED BY 'TU_PASSWORD_SEGURA';
GRANT SELECT ON db_autoriza.* TO 'apache_auth'@'localhost';
FLUSH PRIVILEGES;

USE db_autoriza;

CREATE TABLE TB_USUARIOS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL UNIQUE,
    passwd VARCHAR(255) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1
);
```

---

## 4. Generación de hashes Bcrypt con `htpasswd`

Nunca debemos guardar contraseñas en texto plano en la base de datos. Con `htpasswd -nbB` generamos un hash **bcrypt** (`$2y$...`):

```bash
htpasswd -nbB usuario miclave_segura
```

Salida de ejemplo:

```text
usuario:$2y$05$jIrGOJFpQYdwh1ufU/NQ8.vygFkNrccDMyE2JD2NjAAwxFILJBmNa
```

Insertamos el registro en MySQL guardando únicamente el hash:

```sql
USE db_autoriza;
INSERT INTO TB_USUARIOS (username, passwd)
VALUES ('usuario', '$2y$05$jIrGOJFpQYdwh1ufU/NQ8.vygFkNrccDMyE2JD2NjAAwxFILJBmNa');
```

---

## 5. Configurar la conexión DBD en Apache2

Editamos `/etc/apache2/mods-available/dbd.conf` (y verificamos permisos restringidos `640` con propietario `root:www-data` para proteger las credenciales de conexión):

```apache
DBDriver mysql
DBDParams "host=127.0.0.1 port=3306 dbname=db_autoriza user=apache_auth pass=TU_PASSWORD_SEGURA"
DBDMin 1
DBDKeep 2
DBDMax 10
DBDExptime 300
```

Creamos el directorio protegido y una página de prueba:

```bash
sudo mkdir -p /var/www/html/mi_primer_site/ddbb
echo "<h1>Zona restringida con Base de Datos</h1>" | sudo tee /var/www/html/mi_primer_site/ddbb/index.html
```

En el archivo de configuración del sitio (`/etc/apache2/sites-available/mi_primer_site.conf`), añadimos el bloque `<Directory>`:

```apache
<Directory /var/www/html/mi_primer_site/ddbb>
    AuthType Basic
    AuthName "Zona restringida"
    AuthBasicProvider dbd
    AuthDBDUserPWQuery "SELECT passwd FROM TB_USUARIOS WHERE username = %s AND enabled = 1"
    Require valid-user
</Directory>
```

---

## 6. Validación y notas de seguridad para producción

Comprobamos la sintaxis antes de recargar Apache:

```bash
sudo apachectl -t
sudo systemctl reload apache2
```

* Si devuelve `Syntax OK`, al acceder a `/mi_primer_site/ddbb/` en modo incógnito el navegador solicitará usuario y contraseña y Apache validará el hash bcrypt directamente contra MySQL.
* **Importante en entornos reales:** `AuthType Basic` envía las credenciales codificadas en Base64 (no cifradas), por lo que en producción **siempre debe combinarse con HTTPS (TLS)** para evitar captura de credenciales en tránsito.
