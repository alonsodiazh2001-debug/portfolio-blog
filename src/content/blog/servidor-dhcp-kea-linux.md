---
title: "Guía completa: Instalación y configuración de un servidor DHCP con Kea en Ubuntu Server"
description: "Memoria técnica paso a paso de laboratorio en entorno aislado: arquitectura de red dual (NAT + Red Interna), Netplan, configuración JSON de ISC Kea, validación DORA y troubleshooting."
pubDate: 2026-10-19
tags: ["Redes", "Linux", "Kea DHCP", "Netplan", "VirtualBox"]
---

En esta práctica de **Servicios de Red e Internet (2º ASIR)** desplegamos un servidor DHCP moderno con **ISC Kea (`kea-dhcp4-server`)** sobre **Ubuntu Server LTS** en un laboratorio virtualizado completamente aislado de la red física.

El objetivo no es solo levantar el servicio, sino justificar cada decisión técnica de diseño, segmentación de red, configuración en JSON y verificación del ciclo **DORA**.

---

## 1. Escenario de laboratorio y recursos

| Parámetro | Valor utilizado |
| :--- | :--- |
| **Sistema operativo servidor** | Ubuntu Server LTS (`jlahdserver`) |
| **Recursos recomendados** | 4 GB RAM · 2 vCPU · 20–25 GB disco dinámico con **LVM** |
| **Red de laboratorio aislada** | `192.168.50.0/24` |
| **IP estática del servidor** | `192.168.50.10/24` |
| **Rango DHCP asignado** | `192.168.50.100 - 192.168.50.200` |
| **Cliente de pruebas** | Ubuntu Desktop en la misma red interna |

### Decisiones clave durante la instalación

* **Particionamiento con LVM (Logical Volume Manager):** se optó por LVM frente a particiones estándar para poder ampliar o reorganizar volúmenes lógicos en caliente sin apagar el servidor ni perder datos.
* **Usuario sin `root` directo:** se creó una cuenta administrativa con acceso mediante `sudo` por buenas prácticas de seguridad, habilitando SSH para administrar el servidor cómodamente desde el host.

---

## 2. Arquitectura de interfaces de red

El servidor necesita **dos adaptadores de red** con propósitos separados:

1. **Adaptador 1 (`enp0s3`) — Modo NAT:** proporciona salida temporal hacia internet para actualizar índices y descargar paquetes sin exponer servicios hacia el exterior (`10.0.2.15/24`).
2. **Adaptador 2 (`enp0s8`) — Red Interna:** interfaz aislada donde el servidor Kea escuchará y repartirá direcciones (`192.168.50.10/24`).

> **Regla crítica de seguridad y red:** un servidor DHCP de pruebas **nunca** debe conectarse en modo puente a la red real del centro o de casa. Si respondiera a peticiones `DHCPDISCOVER` de la red física, provocaría conflictos de IP y denegación de servicio a otros equipos (*Rogue DHCP*).

---

## 3. IP estática con Netplan y comprobaciones previas

Antes de editar la configuración de red, guardamos una copia de respaldo del fichero original de Netplan:

```bash
sudo cp /etc/netplan/00-installer-config.yaml /etc/netplan/00-installer-config.yaml.bak
sudo nano /etc/netplan/00-installer-config.yaml
```

Definimos `enp0s3` por DHCP (NAT) y `enp0s8` con IP estática `192.168.50.10/24`:

```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: true
    enp0s8:
      addresses:
        - 192.168.50.10/24
```

Aplicamos la configuración y validamos tanto el direccionamiento como la salida a internet y resolución DNS:

```bash
sudo netplan apply
ip addr
ping -c 4 8.8.8.8
host www.google.es
```

![Comprobación de interfaces enp0s3 y enp0s8 con ip addr](/images/kea/03_ip_addr_servidor.png)

---

## 4. Instalación y respaldo de ISC Kea

Actualizamos repositorios, instalamos `kea-dhcp4-server` y realizamos una copia de seguridad del archivo JSON original antes de limpiarlo y adaptarlo:

```bash
sudo apt update
sudo apt install kea-dhcp4-server -y
sudo cp /etc/kea/kea-dhcp4.conf /etc/kea/kea-dhcp4.conf.bak
```

---

## 5. Configuración de `/etc/kea/kea-dhcp4.conf`

Editamos `/etc/kea/kea-dhcp4.conf` dejando únicamente las directivas necesarias para que el archivo sea legible y fácil de depurar:

* **`interfaces-config`:** restringe la escucha exclusivamente a `enp0s8` (la red interna).
* **`lease-database`:** almacenamiento persistente en CSV (`memfile`) en `/var/lib/kea/kea-leases4.csv`.
* **Temporizadores:** concesión válida de `7200` segundos (2 h), renovación (`renew-timer`) a `3600` s y `rebind-timer` a `5400` s.
* **`subnet4`:** subred `192.168.50.0/24`, pool `192.168.50.100 - 192.168.50.200`, puerta de enlace `192.168.50.10` y DNS `8.8.8.8, 1.1.1.1`.

```json
{
  "Dhcp4": {
    "interfaces-config": {
      "interfaces": [ "enp0s8" ]
    },
    "lease-database": {
      "type": "memfile",
      "persist": true,
      "name": "/var/lib/kea/kea-leases4.csv"
    },
    "valid-lifetime": 7200,
    "renew-timer": 3600,
    "rebind-timer": 5400,
    "subnet4": [
      {
        "id": 1,
        "subnet": "192.168.50.0/24",
        "pools": [
          { "pool": "192.168.50.100 - 192.168.50.200" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.50.10"
          },
          {
            "name": "domain-name-servers",
            "data": "8.8.8.8, 1.1.1.1"
          }
        ]
      }
    ]
  }
}
```

### Validación de sintaxis y arranque del servicio

Antes de reiniciar el demonio, comprobamos el JSON con el usuario del servicio (`_kea`):

```bash
sudo -u _kea kea-dhcp4 -t /etc/kea/kea-dhcp4.conf
sudo systemctl enable --now kea-dhcp4-server
sudo systemctl restart kea-dhcp4-server
sudo systemctl status kea-dhcp4-server
```

![Configuración JSON y validación con kea-dhcp4 -t](/images/kea/06_kea_conf_servidor.png)

---

## 6. Pruebas en el cliente y verificación del ciclo DORA

Conectamos una máquina cliente Ubuntu Desktop a la misma **Red Interna** con configuración automática por DHCP. El cliente recibió la primera dirección del pool (`192.168.50.100/24`) y respondió correctamente al `ping` hacia el servidor (`192.168.50.10`):

![Cliente Ubuntu con IP 192.168.50.100 y ping exitoso al servidor](/images/kea/07_cliente_ip_ping.png)

En el servidor verificamos tanto el registro persistente de concesiones como los logs del servicio en `journalctl`, donde se aprecian los cuatro pasos del intercambio **DORA**:

1. `DHCPDISCOVER (type 1)` — el cliente busca un servidor DHCP en `enp0s8`.
2. `DHCPOFFER (type 2)` — Kea ofrece `192.168.50.100`.
3. `DHCPREQUEST (type 3)` — el cliente solicita formalmente la IP ofrecida.
4. `DHCPACK (type 5)` — Kea confirma la concesión por `7200` segundos.

```bash
sudo cat /var/lib/kea/kea-leases4.csv
sudo journalctl -u kea-dhcp4-server -n 8 --no-pager
```

![Archivo kea-leases4.csv y trazas DORA en journalctl](/images/kea/08_leases_servidor.png)

---

## 7. Problemas encontrados y cómo se resolvieron

* **Errores de sintaxis JSON al editar `kea-dhcp4.conf`:** una coma faltante o mal cerrada impedía arrancar `kea-dhcp4-server`. Se resolvió limpiando los comentarios extensos del fichero de ejemplo para dejar solo las directivas activas y validando siempre con `sudo -u _kea kea-dhcp4 -t /etc/kea/kea-dhcp4.conf` antes de reiniciar el servicio.
* **Aplicación de cambios en Netplan:** tras modificar el YAML es imprescindible ejecutar `sudo netplan apply` y comprobar la interfaz asignada con `ip addr` para confirmar que `enp0s8` mantiene `192.168.50.10/24`.
