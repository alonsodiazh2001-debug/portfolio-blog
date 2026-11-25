# Portfolio y Blog Técnico — Alonso Díaz

Web personal minimalista en tema oscuro construida con **Astro** y **Tailwind CSS**, pensada para publicar en **Cloudflare Pages** de forma gratuita.

## Comandos

```bash
npm install
npm run dev      # Servidor local en http://localhost:4321
npm run check    # Verificación de tipos TypeScript
npm run build    # Genera el sitio estático en dist/
npm run preview  # Previsualiza la build de producción
```

## Cómo personalizar

- **Perfil, formación, stack y proyectos:** edita [src/data/profile.ts](src/data/profile.ts).
- **Artículos del blog:** añade archivos `.md` dentro de [src/content/blog/](src/content/blog/).
- **Estilos globales y tema oscuro:** [src/styles/global.css](src/styles/global.css).

## Publicación en Cloudflare Pages

1. Sube este proyecto a un repositorio en GitHub.
2. En **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**, selecciona tu repositorio.
3. Configura:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
