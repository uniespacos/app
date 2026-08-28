# Sprint 7 — Consolidação Retroativa: Rename de Rotas Administrativas

**Status:** Planejamento

**Objetivo:** Renomear o prefixo de rotas `/institucional/*` para `/administrativo/*` de forma atômica, atualizando simultaneamente a URL e o nome de rota, e refletindo as mudanças nas 51 referências de `'institucional.*'` em `resources/js` (TypeScript/React).

**Justificativa:** O prefixo `/institucional/*` vira um nome impróprio assim que o `gestor_unidade` recebe permissão para operar as mesmas rotas (decisão P-05/06 já fechada) — uma pessoa que gerencia um campus não é "institucional". O novo prefixo `/administrativo/` alinha a rota à estrutura de arquivos já existente no frontend (`resources/js/presentation/pages/Administrativo/`), em vez de introduzir um terceiro vocabulário. Isso melhora a legibilidade do código e a coerência da semântica de navegação.

---

## ⚠️ Bloco de Destaque: Por Que NÃO `/gestao/`?

O projeto já usa **dois** prefixos de rota:

1. `/institucional/*` — rotas administrativas (9 ocorrências em `routes/web.php`)
2. `/gestor/*` — rotas específicas do gestor (2 ocorrências: `/gestor/reservas`, `/gestor/relatorios`)

A sugestão inicial de usar `/gestao/` foi **descartada** porque ficaria a apenas **uma letra** de `/gestor/` — confuso para quem lê URLs, logs e código. O prefixo `/administrativo/` resolve isso sem ambiguidade e ainda oferece alinhamento semântico com a estrutura visual do projeto:

| Elemento | Hoje | Proposto |
|---|---|---|
| Rota | `/institucional/modulos` | `/administrativo/modulos` |
| Nome de rota | `institucional.modulos.index` | `administrativo.modulos.index` |
| Diretório de página | `pages/Administrativo/Modulos/` | `pages/Administrativo/Modulos/` ← (sem mudança) |

---

## O Que Este Sprint Entrega

- ✅ Renomear `Route::prefix('institucional')->name('institucional.')` para `Route::prefix('administrativo')->name('administrativo.')` em `routes/web.php` — **mudança única e atômica**
- ✅ Atualizar as 51 referências de `'institucional.*'` em `resources/js` para `'administrativo.*'`
- ✅ Verificar que nenhuma rota nomeada `institucional.*` continua acessível
- ✅ Garantir que nenhuma referência a `route('institucional...')` sobrevive no frontend tipado
- ✅ Atualizar testes de backend que referenciam rotas por nome
- ✅ Auditoria de e-mails e notificações para URLs hardcoded antigas

---

## O Que Este Sprint NÃO Entrega

- ❌ Nenhuma feature nova
- ❌ Nenhuma mudança de lógica de negócio ou autorização
- ❌ Nenhuma mudança de schema ou model
- ❌ Nenhuma refatoração de componentes (exceto para usar os nomes de rota renomeados)

Este sprint é **puramente mecânico** — rename em massa e ajustes cascata.

---

## Definição de Versão Estável (Fim de Sprint)

Uma versão estável deste sprint significa:

- [ ] Rota `Route::prefix('institucional')` **não existe mais** em `routes/web.php`
- [ ] Rota `Route::prefix('administrativo')` existe e nome é `->name('administrativo.')`
- [ ] Nenhuma chamada a `route('institucional.*')` ou `route_match('institucional.*')` sobrevive em `resources/js`
- [ ] `npx tsc --noEmit` retorna exit code 0 (Ziggy resolve as rotas sem erro)
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` sem novas supressões
- [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde, incluindo testes que referenciam rotas por nome
- [ ] Nenhum e-mail ou notificação referencia URLs antigas `/institucional/*`
- [ ] Um usuário autenticado com permissão `secao.gestao-modulos` consegue navegar para `/administrativo/modulos` e todas as ações continuam funcionando
- [ ] Tentativa de acessar `/institucional/*` deve retornar 404 (rota não existe)

---

## Dependências

- **Todos os sprints anteriores (0–6):** Este é o sprint de fechamento. Qualquer mudança de autorização, schema ou lógica deve estar consolidada.
- **Nenhum sprint futuro depende deste:** É consolidação retroativa, não pré-requisito.

---

## Riscos Relacionados

| ID | Descrição | Probabilidade | Impacto | Mitigação |
|---|---|---|:---:|:---:|---|
| R-15 | Semântica de Rotas — prefixo descritivo | Alta | Baixo (cosmético) | Este sprint resolve. |
| Regressão de Links | Bookmarks externos ou links hardcoded em documentação apontam para `/institucional/*` | Baixa | Médio (quebra para usuário externo) | Considerar redirect 301 em `routes/web.php` se documentação pública existir; caso contrário, é quebra esperada e comunicada em notas de release. |
| Regressão de Testes | Testes que usam `route()` com o nome antigo falham silenciosamente se Ziggy não capturar | Baixa | Médio (testes falsos) | `npx tsc` e `npx jest` cobrem isso. |

---

## Referências Cruzadas

- **Documento de origem:** `docs/auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md`, seção 7.1 e seção 8 (inventário)
- **Decisão P-29 + D-7:** `docs/auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`, seções 2.6 e 3-D.1
- **Fluxos de tela:** `docs/v2.0/02-fluxos-e-diagramas/02-fluxos-de-tela.md` (sem mudança de fluxo, só de nomes visuais)
- **Matriz de rastreabilidade:** `docs/v2.0/04-roadmap/matriz-rastreabilidade.md`

---

## Próximos Passos (Após Merge)

- Comunicar a mudança em release notes ou changelog
- Se houver documentação pública externa, atualizar links
- Verificar que bookmarks de usuários e documentação interna apontam para `/administrativo/*`
