---
title: "Tu primera zona DNS con BIND9: apuntes paso a paso"
description: "Cómo declarar una zona directa en BIND9, crear registros SOA/NS/A y verificar la resolución con named-checkzone y dig."
pubDate: 2026-11-12
tags: ["Redes", "DNS", "BIND9", "Linux"]
---

Configurar un servidor **DNS** propio con **BIND9** es uno de los pilares de la administración de redes locales, tanto para servicios internos como para entornos con Active Directory o servidores web.

## 1. Declarar la zona en `named.conf.local`

Añadimos la zona directa en `/etc/bind/named.conf.local`:

```text
zone "asir.local" {
    type master;
    file "/etc/bind/db.asir.local";
};
```

## 2. Archivo de zona `/etc/bind/db.asir.local`

Un ejemplo limpio con registro `SOA`, `NS` y registros `A`:

```text
$TTL    604800
@       IN      SOA     ns1.asir.local. admin.asir.local. (
                              2         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      ns1.asir.local.
ns1     IN      A       192.168.50.10
web     IN      A       192.168.50.20
```

## 3. Comprobación antes de recargar

Antes de reiniciar el servicio, verifica tanto la configuración global como el archivo de zona:

```bash
sudo named-checkconf
sudo named-checkzone asir.local /etc/bind/db.asir.local
sudo systemctl reload bind9
```

Y realiza la consulta de prueba apuntando al servidor local:

```bash
dig @192.168.50.10 web.asir.local +short
```
