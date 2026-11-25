import formacionData from './formacion.json';
import proyectosData from './proyectos.json';

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

export const formacion: FormacionItem[] = formacionData as FormacionItem[];

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

export const proyectos: ProyectoItem[] = proyectosData as ProyectoItem[];
