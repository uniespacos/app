# Relatório de Análise de Segurança - UniEspaços

**Data:** 27 de Fevereiro de 2026
**Analista:** Agente Security Development Specialist (@uniespacos-secdev-specialist)

Esta análise foi conduzida com base nas diretrizes de segurança da stack do UniEspaços (Laravel, React, Inertia, Docker, Nginx) para identificar vulnerabilidades e propor correções priorizadas.

---

## 🛑 Crítico (Critical)

### 1. Insecure Direct Object Reference (IDOR) em `EspacoController`
- **Componentes Afetados:** `app/Http/Controllers/EspacoController.php` (métodos `show`, `favoritar` e `desfavoritar`).
- **Descrição:** O método `show` não verifica se o Espaço acessado (`$espaco`) pertence à `Instituição` do usuário autenticado. Qualquer usuário logado pode visualizar dados detalhados ou favoritar/desfavoritar espaços de outras Instituições apenas alterando o ID na URL (ex: `/espacos/{id}`).
- **Correção Sugerida:** Implementar uma Policy (`EspacoPolicy`) e utilizar `$this->authorize('view', $espaco)` no método `show`. Nos métodos de favoritos, validar também se o espaço está visível/acessível para o usuário antes de processar o `attach/detach`.

### 2. Insecure Direct Object Reference (IDOR) em `ReservaController`
- **Componentes Afetados:** `app/Http/Controllers/ReservaController.php` (métodos `index`, `show` e `edit`), mapeado na [Issue #119](https://github.com/uniespacos/app/issues/119).
- **Descrição:** Falta de autorização. O sistema não valida se o usuário autenticado possui as devidas permissões (dono da reserva ou gestor) antes de injetar e carregar os dados de uma reserva específica nas páginas de listagem e edição.
- **Correção Sugerida:** Aplicar `$this->authorize('view', $reserva)` e `$this->authorize('update', $reserva)` nas respectivas rotas de visualização e edição (conforme issue gerada).

---

## 🚨 Alto (High)

### 3. Exposição Indevida de Portas Internas na Infraestrutura
- **Componentes Afetados:** `compose.prod.yml` (serviços `postgres` e `reverb`).
- **Descrição:** O arquivo do docker de produção expõe portas internas críticas (`5432` do PostgreSQL e `9000` do Reverb) diretamente para a rede do host (`"5432:5432"`, `"9000:9000"`). Isso desrespeita o princípio de isolamento de rede, aumentando consideravelmente a superfície de ataque externo caso o firewall do host falhe.
- **Correção Sugerida:** Remover o mapeamento de portas (`ports:`) desses serviços no `compose.prod.yml`. O acesso ao banco e as comunicações internas do Reverb devem ocorrer estritamente através da rede interna (`uniespacos-production`) mapeada para os containers de proxy (Nginx) ou aplicação (App).

---

## ⚠️ Médio (Medium)

### 4. Cabeçalhos de Segurança Ausentes no Nginx
- **Componentes Afetados:** `docker/production/nginx/default.ssl.conf`.
- **Descrição:** O Nginx está configurado de maneira permissiva. O servidor está retornando sua versão exata nas respostas (o que facilita o *fingerprinting*) e faltam cabeçalhos de proteção nativos do navegador.
- **Correção Sugerida:** Adicionar as seguintes diretivas:
  ```nginx
  server_tokens off;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss:;" always;
  ```

### 5. Risco Potencial de Cross-Site Scripting (XSS) na Paginação do React
- **Componentes Afetados:** Componentes de listagem em `resources/js/` (ex: `ReservasList.tsx`, `EspacosPage.tsx`, `paginacao-listas.tsx`).
- **Descrição:** Links de paginação fornecidos pelo backend utilizam `dangerouslySetInnerHTML={{ __html: link.label }}`. O paginador do Laravel geralmente escapa o conteúdo de forma segura e injeta caracteres HTML para setas (`&laquo;`), porém, esse padrão é arriscado se a lógica de paginação for customizada posteriormente e permitir dados provindos do usuário.
- **Correção Sugerida:** Considerar sanitizar o conteúdo do label utilizando uma biblioteca como o `DOMPurify` no frontend ou substituir o mapeamento dos labels (`&laquo;` / `&raquo;`) por SVGs/Ícones controlados internamente pelo React.

---

## ✅ Baixo / Boas Práticas (Low / Best Practices)

### 6. Mass Assignment Control
- **Componentes Afetados:** `app/Models/User.php`.
- **Descrição:** O modelo de usuário contém campos sensíveis no `$fillable` (ex: `permission_type_id`, `setor_id`). 
- **Situação Atual:** As rotas atuais do sistema lidam de forma explícita com o Request e não utilizam o método `$request->all()`. Dessa forma, não é uma falha ativa no momento.
- **Correção Sugerida (Defesa em Profundidade):** Se o uso do `$fillable` não for estritamente obrigatório, mudar a abordagem ou ter muito cuidado em futuros Controllers/Jobs para evitar a injeção do `$request->all()`.

---
*Análise baseada nos fluxos descritos na Skill @uniespacos-secdev-specialist.*