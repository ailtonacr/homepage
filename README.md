# Ailton.dev.br — Portfólio editorial

Portfólio pessoal de Ailton Rodrigues, implementado em Astro e TypeScript a partir do design do Figma:
https://www.figma.com/design/kfbZl1LOxYt9vIxsvlqT7H

## Arquitetura

- Astro 5 com renderização estática (SSG), sem React e sem servidor de renderização.
- CSS autoral responsivo, inspirado no design original: azul, verde-petróleo, DM Sans, Instrument Serif e IBM Plex Mono.
- Astro Content Collections + MDX para projetos e estudos de caso, com schema tipado.
- Cloudflare Workers Static Assets, com publicação pelo Wrangler.
- Google Analytics 4 opcional, carregado exclusivamente após consentimento explícito.

## Desenvolvimento

Requer Node.js 22 ou superior.

- Instalar dependências: npm ci
- Desenvolvimento local: npm run dev
- Build de produção: npm run build
- Preview do Worker: npm run preview
- Validar empacotamento sem publicar: npx wrangler deploy --dry-run
- Publicar: npm run build && npm run deploy

## Google Analytics 4

Defina PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX no ambiente de build. Se a variável estiver vazia, nenhuma tag do Analytics será carregada e o banner não será exibido.

O consentimento usa o modelo Basic: antes do aceite, nenhum script Google Analytics é carregado. A preferência é guardada no navegador e pode ser revisada pelo rodapé. A aceitação ativa o page_view; os eventos de clique em projetos e canais externos são enviados somente com a permissão ativa. Nenhum dado pessoal de formulário é enviado ao GA4.

Como é um site estático, variáveis PUBLIC_* são embutidas no build. Alterou o ID? Refaça build e deploy.

## Projetos e conteúdo

Adicione arquivos MDX em src/content/projects/ respeitando o schema de src/content.config.ts. A página inicial exibe até quatro projetos marcados como featured. O catálogo e as rotas de estudos de caso são gerados automaticamente.

Os repositórios de vários projetos são privados. Evite links de código não públicos. Campos opcionais website e repository só geram botões quando forem explicitamente definidos.

## Limitações atuais

- Contato via links funcionais para GitHub e LinkedIn. Não foi criado um backend fictício de formulário.
- Miniaturas são ilustrações HTML/CSS, não capturas de telas de produção.
- As fontes são carregadas do Google Fonts. Como refinamento de privacidade/desempenho, pode-se migrar para fontes hospedadas localmente.
- Antes de publicar em produção, revise dados, privacidade, links e histórico profissional.

## Figma

https://www.figma.com/design/kfbZl1LOxYt9vIxsvlqT7H
