# Relatório Adicional de Análise de Segurança - UniEspaços

**Data:** 27 de Fevereiro de 2026
**Analista:** Agente Security Development Specialist (@uniespacos-secdev-specialist)

Esta segunda análise aprofundou a investigação no código do UniEspaços, ignorando as vulnerabilidades anteriormente reportadas e focando em novos vetores de ataque relacionados à arquitetura Multi-Tenant (Instituições), Data Protection e Autorização.

---

## 🛑 Crítico (Critical)

### 1. IDOR Cross-Tenant em Controladores Institucionais (Administrativos)
- **Componentes Afetados:** Todos os controllers no diretório `app/Http/Controllers/Institucional/` (ex: `InstitucionalUsuarioController`, `InstitucionalSetorController`, `InstitucionalEspacoController`) e os respectivos FormRequests (`UpdateSetorRequest`, `UpdateEspacoRequest`, etc.).
- **Descrição:** O middleware `InstitucionalMiddleware` e os métodos `authorize()` nos FormRequests verificam apenas se o usuário possui `permission_type_id === 1` (Admin). No entanto, não há verificação de escopo de *Tenant* (Instituição). Um administrador da "Instituição A" pode editar as permissões, atualizar ou até mesmo **deletar** (`User::findOrFail($id)->delete()`) um usuário, espaço ou setor da "Instituição B", bastando fornecer o ID correspondente via URL ou payload.
- **Correção Sugerida:** Nos métodos de *read*, *update* e *delete*, garantir que a entidade recuperada (User, Setor, Espaco, etc.) pertence à mesma `instituicao_id` do administrador logado (`Auth::user()->setor->unidade->instituicao_id`). Adoção do uso de Global Scopes para queries de usuários com `permission_type_id === 1`.

### 2. Abuso de Reservas Cross-Tenant (Criação de Reserva sem Escopo)
- **Componentes Afetados:** `app/Http/Requests/StoreReservaRequest.php` e a lógica de criação de reservas.
- **Descrição:** O `StoreReservaRequest` valida se o `agenda_id` submetido existe no banco (`exists:agendas,id`), mas falha ao validar se o usuário que está criando a reserva pertence à mesma Instituição do `Espaço/Agenda` desejado. Um usuário comum pode submeter reservas para agendas de outras instituições simplesmente iterando IDs de agenda no payload.
- **Correção Sugerida:** Criar e aplicar uma *Validation Rule* customizada no campo `horarios_solicitados.*.agenda_id` que valide se o `agenda->espaco->andar->modulo->unidade->instituicao_id` é igual à instituição do usuário autenticado.

---

## 🚨 Alto (High)

### 3. Vazamento de PII (Exposição de Dados Sensíveis) via Eager Loading
- **Componentes Afetados:** `app/Http/Controllers/EspacoController.php` (método `show`).
- **Descrição:** O método `show` do `EspacoController` carrega a relação `agendas.horarios.reserva.user` inteira e a passa diretamente para o componente Inertia (Frontend). Isso expõe os dados sensíveis dos usuários que fizeram a reserva (como `email` e `telefone`) a qualquer pessoa autenticada que visualize o calendário do espaço. Fere diretamente a regra de *Data Minimization* das diretrizes do projeto.
- **Correção Sugerida:** Refinar o carregamento das relações no Eloquent para selecionar apenas as colunas públicas estritamente necessárias, como por exemplo: `reserva.user:id,name`. Ocultar completamente PII (`email`, `telefone`) na serialização dos horários renderizados no calendário.

---

*Análise baseada nos fluxos descritos na Skill @uniespacos-secdev-specialist. Vulnerabilidades previamente reportadas (como IDORs em visualização e edição de reservas, XSS na paginação e portas Docker) não foram incluídas neste documento.*