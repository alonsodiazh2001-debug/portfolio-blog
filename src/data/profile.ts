export interface FormacionItem {
  titulo: string;
  centro: string;
  periodo: string;
  estado?: string;
  ubicacion?: string;
  descripcion: string;
}

export interface SkillGroup {
  categoria: string;
  items: string[];
}

export interface ProyectoItem {
  titulo: string;
  categoria: 'Ciberseguridad' | 'Sistemas' | 'Redes' | 'Cloud y Docker' | 'Web y BBDD';
  resumen: string;
  tecnologias: string[];
  enlace?: string;
  destacado?: boolean;
}

export const profile = {
  nombre: 'Alonso Díaz',
  rol: 'Estudiante de ASIR · Sistemas, Redes, Cloud y Ciberseguridad',
  estado: 'ASIR en curso · Finalización prevista julio 2027',
  ubicacion: 'Madrid, España',
  descripcionCorta:
    'Estudiante de Administración de Sistemas Informáticos en Red (ASIR) en el IES Alto Jarama. Enfocado en administración Linux/Windows Server, servicios de red, virtualización, cloud en AWS y ciberseguridad.',
  github: 'https://github.com/alonsodiazh2001-debug',
  // Contacto público opcional:
  email: '',
  linkedin: '',
  idiomas: [
    { nombre: 'Español', nivel: 'Nativo' },
    { nombre: 'Inglés', nivel: 'B1' },
  ],
};

export const formacion: FormacionItem[] = [
  {
    titulo: 'CFGS Administración de Sistemas Informáticos en Red (ASIR)',
    centro: 'IES Alto Jarama',
    periodo: 'Sep 2025 – Jul 2027',
    estado: 'En curso',
    ubicacion: 'Torrelaguna, Madrid',
    descripcion:
      'Administración avanzada de Windows Server y Linux, servicios de red e internet (DHCP, DNS, HTTP), virtualización y contenedores Docker, arquitectura en la nube, seguridad y alta disponibilidad, bases de datos e implantación de aplicaciones web.',
  },
  {
    titulo: 'Carrera Profesional de Analista Junior en Ciberseguridad',
    centro: 'Cisco Networking Academy · IES Alto Jarama',
    periodo: 'Nov 2026',
    estado: 'Certificado',
    descripcion:
      'Formación práctica en análisis de vulnerabilidades, monitorización de redes, defensa de endpoints, gestión de amenazas y fundamentos de respuesta ante incidentes.',
  },
  {
    titulo: 'Computación e Informática',
    centro: 'Instituto de Capacitación, Evaluación y Desarrollo Profesional',
    periodo: 'Formación previa',
    descripcion:
      'Base sólida en fundamentos informáticos, herramientas ofimáticas y manejo técnico de sistemas.',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    categoria: 'Sistemas Operativos',
    items: [
      'Windows Server (AD, GPO, DNS, DHCP, WSUS)',
      'Ubuntu Server / Debian / Arch Linux',
      'Bash Scripting',
      'Instalaciones desatendidas e ISOs',
      'Rescuezilla / FSArchiver / Foxclone',
    ],
  },
  {
    categoria: 'Redes y Servicios',
    items: [
      'IPv4 / IPv6 y Subredes',
      'VLANs, Spanning Tree y Enrutamiento',
      'Kea DHCP',
      'BIND9 DNS',
      'Netplan',
      'Nmap / Wireshark / dig / traceroute',
    ],
  },
  {
    categoria: 'Cloud y Virtualización',
    items: [
      'AWS (Cloud Foundations)',
      'Docker',
      'VMware',
      'VirtualBox',
      'UTM',
    ],
  },
  {
    categoria: 'Ciberseguridad',
    items: [
      'Cisco Junior Cybersecurity Analyst',
      'Port Security',
      'Retos Atenea (CCN-CERT)',
      'Pautas de seguridad y alta disponibilidad',
    ],
  },
  {
    categoria: 'Bases de Datos y Web',
    items: [
      'Oracle Database',
      'MySQL / SQL',
      'Pila LAMP',
      'HTML / CSS / JavaScript / PHP',
      'XML / XSD / DTD / XSLT / XQuery',
    ],
  },
];

export const proyectos: ProyectoItem[] = [
  {
    titulo: 'Autenticación Segura en Apache2 con MySQL y Bcrypt',
    categoria: 'Ciberseguridad',
    destacado: true,
    resumen:
      'Control de acceso HTTP en Apache2 mediante mod_authn_dbd y MySQL, almacenando credenciales con hashes bcrypt generados con htpasswd y aplicando principios de mínimo privilegio.',
    tecnologias: ['Apache2', 'MySQL', 'Bcrypt', 'mod_authn_dbd', 'Linux'],
    enlace: 'https://github.com/alonsodiazh2001-debug',
  },
  {
    titulo: 'Auditoría de Puertos y Servicios con Nmap y NSE',
    categoria: 'Ciberseguridad',
    destacado: true,
    resumen:
      'Prácticas de reconocimiento y análisis de superficie de exposición en entornos controlados: escaneo TCP/UDP, detección de SO, virtual hosts y scripts NSE de vulnerabilidades.',
    tecnologias: ['Nmap', 'NSE (Lua)', 'TCP/UDP', 'Wireshark', 'Linux'],
    enlace: 'https://github.com/alonsodiazh2001-debug',
  },
  {
    titulo: 'Servidor DHCP con Kea y Zonas DNS en BIND9',
    categoria: 'Redes',
    destacado: true,
    resumen:
      'Despliegue de servidor DHCP moderno con ISC Kea (proceso DORA, reservas y rangos) junto con configuración de zonas directas e inversas en BIND9 y validación mediante dig y Wireshark.',
    tecnologias: ['Linux', 'Kea DHCP', 'BIND9', 'Netplan', 'Wireshark'],
    enlace: 'https://github.com/alonsodiazh2001-debug',
  },
  {
    titulo: 'Infraestructura Windows Server y Despliegues Automatizados',
    categoria: 'Sistemas',
    destacado: true,
    resumen:
      'Laboratorio multi-máquina con Active Directory, políticas de grupo (GPO), DNS/DHCP integrado, WSUS y creación de instalaciones desatendidas mediante archivos de respuesta.',
    tecnologias: ['Windows Server', 'Active Directory', 'GPO', 'WSUS', 'VirtualBox'],
    enlace: 'https://github.com/alonsodiazh2001-debug',
  },
  {
    titulo: 'Topologías Empresariales y Seguridad en Switching',
    categoria: 'Redes',
    destacado: true,
    resumen:
      'Diseño y simulación de redes segmentadas con VLANs, prevención de bucles con Spanning Tree (STP), tablas MAC estáticas, seguridad de puertos y acceso a internet desde LAN.',
    tecnologias: ['Cisco Packet Tracer', 'VLANs', 'STP', 'Port Security', 'IPv4'],
  },
  {
    titulo: 'Entornos Contenerizados con Docker y Pila LAMP',
    categoria: 'Cloud y Docker',
    destacado: true,
    resumen:
      'Creación de entornos reproducibles con Docker para servicios web y bases de datos relacionales, además de implantación de aplicaciones sobre pila LAMP (Linux, Apache, MySQL, PHP).',
    tecnologias: ['Docker', 'LAMP', 'MySQL', 'Oracle DB', 'PHP'],
  },
  {
    titulo: 'Laboratorios de Respaldo y Recuperación en Linux/Windows',
    categoria: 'Sistemas',
    resumen:
      'Prácticas comparativas de clonación, copias de seguridad en frío/caliente y restauración de sistemas operativos utilizando Rescuezilla, FSArchiver y Foxclone.',
    tecnologias: ['Linux', 'Rescuezilla', 'FSArchiver', 'Foxclone', 'Bash'],
  },
  {
    titulo: 'Prácticas Web y Tratamiento de Datos Estructurados',
    categoria: 'Web y BBDD',
    resumen:
      'Desarrollo de prácticas de cliente-servidor con JavaScript y PHP, diseño lógico/conceptual de bases de datos SQL y validación/transformación de documentos XML con XSD y XSLT.',
    tecnologias: ['JavaScript', 'PHP', 'SQL', 'XML / XSLT', 'Astro'],
  },
];
