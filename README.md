# Portfolio y Blog Técnico — Alonso Díaz

Web personal y blog técnico desarrollado con **Astro** y **Tailwind CSS**, desplegado en **Cloudflare Pages**.

Reúne mi formación en **ASIR**, certificación en ciberseguridad, laboratorios de sistemas y redes, y guías prácticas paso a paso.

## Stack

- **Framework:** Astro 5
- **Estilos:** Tailwind CSS v4
- **Contenido del blog:** Markdown (Astro Content Collections)
- **Despliegue:** Cloudflare Pages

## Estructura principal

```text
src/
├── components/   # Paleta de navegación rápida (Ctrl + K)
├── content/blog/ # Artículos técnicos en Markdown
├── data/         # Datos de perfil, formación, stack y proyectos
├── layouts/      # Layout base
├── pages/        # Inicio, /proyectos y /blog
└── styles/       # Estilos globales
```

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # Verificación de tipos TypeScript
npm run build    # Build estática en dist/
```
