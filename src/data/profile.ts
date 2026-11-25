import formacionData from './formacion.json';
import perfilData from './perfil.json';
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

export const profile = perfilData.profile;
export const formacion: FormacionItem[] = formacionData as FormacionItem[];
export const skillGroups: SkillGroup[] = perfilData.skillGroups as SkillGroup[];
export const proyectos: ProyectoItem[] = proyectosData as ProyectoItem[];
