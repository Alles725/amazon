# Páginas institucionais do rodapé ("Conheça-nos" e "Ganhe dinheiro conosco")

Doze destinos do rodapé (`components/amazon/amazon-footer.tsx`) deixaram de ser
"Coming Soon" e passaram a usar um único template de conteúdo, no estilo das
páginas institucionais da Amazon.com.br. `/sell` continua com a landing própria
(`features/sell`) e aparece apenas na navegação do grupo.

| Rota | Flag / routeKey | Seções |
| --- | --- | --- |
| `/about` | `about` | Quem somos, O que fazemos, Como pensamos, CTA |
| `/corporate-information` | `corporateInformation` | Áreas da seção, aviso de documentos, Conduta e ética, FAQ, CTA |
| `/careers` | `careers` | Áreas de atuação, Como trabalhamos, Processo seletivo, aviso de vagas, FAQ, CTA |
| `/press` | `press` | Aviso de comunicados, Temas de cobertura, Recursos para jornalistas, CTA |
| `/community` | `community` | Compromisso, Frentes de atuação, Como acontece, aviso de projetos, CTA |
| `/accessibility` | `accessibility` | Compromisso, Recursos desta loja, Recursos em dispositivos, FAQ, CTA |
| `/amazon-science` | `amazonScience` | Abordagem, Áreas de pesquisa, Da pesquisa ao cliente, aviso de publicações, CTA |
| `/brand-protection` | `brandProtection` | Benefícios, Como começar, Propriedade intelectual, FAQ, CTA |
| `/supply` | `supply` | Como funciona, Tabela 1P x 3P, Jornada, Para quem, aviso de cadastro, FAQ |
| `/publish` | `publish` | Formatos, Como publicar, Autopublicação, aviso de livros, FAQ, CTA |
| `/associates` | `associates` | Como funciona, Para quem, Transparência, aviso de inscrição, FAQ, CTA |
| `/advertise` | `advertise` | Formatos de anúncio, Por que anunciar, Campanha, aviso de anúncios, FAQ, CTA |

## Arquitetura

`apps/storefront/src/features/corporate/`:

- `corporate-routes.ts` — chaves, grupos do rodapé e `CORPORATE_ROUTES` (lido pelo
  `app/layout.tsx` para renderizar essas rotas sem a navegação genérica).
- `corporate-types.ts` — modelo de conteúdo: `CorporatePage` (hero + blocos) e os
  blocos `split`, `cards`, `steps`, `compare`, `notice`, `faq` e `cta`.
- `know-us-content.ts` / `earn-content.ts` — o conteúdo das páginas, só strings.
- `corporate-content.ts` — registro (`CORPORATE_PAGES`, `getCorporatePage`).
- `corporate-body.tsx` — template (barra do grupo, hero, blocos, aviso acadêmico).
  Server component; o FAQ usa `<details>`/`<summary>` nativos (teclado sem JS).
- `corporate-icons.tsx` — ícones de linha e ilustração do hero, desenhados em SVG.
- `corporate-shell.tsx` — fonte local (Inter Tight, a mesma de `/sell` e `/help`),
  `AmazonHeader`/`AmazonFooter` e `corporateMetadata` (título "X | Amazon.com.br").
- `corporate.css` — estilos isolados em `.amazon-corp-page` (não usa `globals.css`).

Cada `app/<rota>/page.tsx` tem só `FeatureRoute` + `CorporatePageShell` e
`generateMetadata`. Para uma nova página, adicione a chave em `corporate-routes.ts`,
os dados em um dos arquivos de conteúdo e a rota com o mesmo padrão.

## Regras de conteúdo

Este é um projeto acadêmico. O texto descreve cada área em termos gerais e
atemporais e **não** inventa fatos apresentados como reais:

- nada de estatísticas, valores, taxas, anos, nomes de executivos, endereços,
  vagas, comunicados, artigos ou parceiros;
- onde a página real listaria registros, usa-se um bloco `notice` honesto
  (ex.: "Nenhum comunicado publicado nesta loja acadêmica", "Não há vagas abertas
  nesta demonstração");
- nenhum formulário coleta dados nem simula inscrição em programa real;
- CTAs apontam para rotas desta loja (`/sell`, `/help`, `/register`, `/login`,
  outras páginas institucionais) ou âncoras da própria página — sem URLs externas;
- sem imagens da Amazon: apenas ícones e ilustrações SVG próprias.

Todas as páginas terminam com um aviso de que o conteúdo é informativo e não
representa informações oficiais. `test/corporate-pages.spec.ts` verifica a
integridade dos dados (rotas, âncoras, ícones, ausência de números/URLs), a
renderização de cada página e o fallback para Coming Soon quando a flag é desligada.
