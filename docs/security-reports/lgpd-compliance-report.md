# Relatório de Conformidade e Segurança de Dados (LGPD) - UniEspaços

**Data:** 27 de Fevereiro de 2026
**Responsável:** Agente Security Development Specialist (@uniespacos-secdev-specialist)
**Participantes (Revisão Técnica):** @uniespacos-fullstack-dev, @laravel-backend-architect, @devops-docker-laravel, @02-php-laravel, @laravel-vite

---

## 1. Análise Inicial de Vulnerabilidades LGPD (@uniespacos-secdev-specialist)

Após uma auditoria focada na Lei Geral de Proteção de Dados (LGPD) e na segurança dos dados do usuário, identifiquei as seguintes vulnerabilidades críticas (não repetidas de relatórios anteriores):

### 1.1 Ausência de Consentimento Explícito e Termos de Uso (LGPD Art. 8)
- **Componente:** `RegisteredUserController@store` e `resources/js/pages/auth/register.tsx`.
- **Vulnerabilidade:** O formulário de registro atual coleta Nome, E-mail e Telefone sem exigir que o usuário marque um checkbox de consentimento explícito para os Termos de Uso e Política de Privacidade. A coleta de dados sem base legal formalizada (neste caso, o consentimento) fere a LGPD.

### 1.2 Perda de Integridade Histórica vs. Direito ao Esquecimento (LGPD Art. 18, VI e Art. 12)
- **Componente:** `ProfileController@destroy` e Migrations (`onDelete('set null')`).
- **Vulnerabilidade:** Atualmente, quando o usuário exclui a conta, o método `$user->delete()` remove fisicamente o registro (Hard Delete). O banco de dados está configurado para setar `user_id = null` nas tabelas `reservas`, `agendas` e `horarios`. Embora isso atenda ao Direito ao Esquecimento, **destrói a integridade estatística e de auditoria** da instituição (não se sabe mais se a reserva foi feita por um aluno, professor, etc., apenas que foi anulada). A LGPD incentiva a *Anonimização* para fins estatísticos.

### 1.3 Ausência de Portabilidade de Dados (LGPD Art. 18, V)
- **Componente:** Tela de Perfil (`ProfileController`).
- **Vulnerabilidade:** A LGPD garante ao titular o direito de receber seus dados em formato estruturado. O painel atual permite visualizar e editar os dados, mas não existe uma funcionalidade de "Exportar Meus Dados" (que incluiria histórico de reservas e horários avaliados).

### 1.4 Risco de Exposição de PII em Arquivos de Log da Aplicação
- **Componente:** Rotinas de Job e `Log::error()` em *Controllers* (ex: `ReservaController`, `GestorReservaController`).
- **Vulnerabilidade:** Em caso de exceções severas (ex: falhas de envio de notificação ou banco de dados), o Laravel injeta o *Stack Trace* inteiro ou os dados do Request no `storage/logs/laravel.log`. Isso pode incluir senhas puras, e-mails e telefones. Se o volume Docker for exposto, ocorre o vazamento de PII em texto plano.

---

## 2. Discussão e Questionamentos dos Agentes Especialistas

Conforme protocolo, o relatório inicial foi submetido à bancada de agentes desenvolvedores para validação arquitetural e técnica. Abaixo estão os questionamentos levantados:

**🗣️ @laravel-backend-architect (Arquitetura Backend):**
> *"Sobre o item 1.2 (Direito ao Esquecimento): Setar `user_id = null` é péssimo para a consistência dos relatórios da instituição. Eu questiono se o Hard Delete é o melhor caminho. Minha sugestão: em vez de apagar o usuário, devemos criar um `AnonymizationService`. Quando o usuário solicita exclusão, nós rodamos um update trocando o `name` para 'Usuário Anonimizado', apagamos o `email`, criptografamos ou apagamos o `telefone`, removemos os tokens, mas **mantemos o registro do usuário com o `setor_id`**. Assim, preservamos a integridade das `reservas` e `horarios` para métricas, sem manter o PII. O que acha?"*

**🗣️ @uniespacos-fullstack-dev (Fullstack & UI):**
> *"Concordo com o backend. Sobre o item 1.3 (Portabilidade), gerar um JSON com todo o histórico de reservas de um usuário antigo pode ser uma query pesada e travar o request HTTP se ele tiver milhares de slots. Questiono a abordagem síncrona: sugiro que a exportação dispare um Laravel Job em background que monte um `.zip` e notifique o usuário via Reverb ou E-mail com o link de download seguro, expirável em 24h."*

**🗣️ @02-php-laravel (Especialista Laravel):**
> *"Sobre o item 1.1 (Consentimento): Apenas colocar o checkbox no registro não cobre os usuários que já estão no banco de dados. Precisamos criar um `PrivacyPolicyMiddleware` que verifique se o usuário aceitou a versão atual (v1.0) dos termos. Se ele logar e o `accepted_policy_version` for null ou desatualizado, ele deve ser forçado a aceitar antes de acessar o `/dashboard`."*

**🗣️ @laravel-vite (Especialista Frontend):**
> *"Apoiando a ideia do middleware (02-php-laravel), no frontend (React/Inertia), se essa variável vier falsa nas props globais, podemos interceptar o layout principal e forçar a abertura de um modal não-fechável com a política, em vez de fazer um redirect brusco, mantendo a UX fluida."*

**🗣️ @devops-docker-laravel (DevOps & Infra):**
> *"Para o item 1.4 (Logs com PII): Apenas pedir aos devs para 'tomarem cuidado com os Logs' não funciona a longo prazo. Sugiro resolvermos isso na infra: vamos configurar um `Processor` customizado no Monolog (`config/logging.php`) que use regex para anonimizar automaticamente padrões de e-mail e telefone de qualquer string antes de gravar no arquivo físico dentro do container Docker."*

---

## 3. Relatório Final e Plano de Ação Robusto (@uniespacos-secdev-specialist)

Após absorver as excelentes considerações técnicas dos agentes especialistas, reformulei as resoluções para garantir máxima conformidade com a LGPD e estabilidade arquitetural.

### Tabela de Resoluções e Prioridades (Atualizada)

| ID | Título / Vulnerabilidade LGPD | Ação Corretiva Arquitetural (Consolidada) | Prioridade |
|:---|:---|:---|:---:|
| **LGPD-01** | **Gestão de Consentimento e Termos (Art. 8)** | **1.** Adicionar colunas `accepted_terms_at` e `terms_version` na tabela `users`.<br>**2.** Criar um `PrivacyPolicyMiddleware` no backend.<br>**3.** Implementar um Modal no Inertia Layout (Sugerido pelo @laravel-vite) para forçar o aceite dos usuários legados ao fazerem login. | **Crítica** |
| **LGPD-02** | **Anonimização Estruturada (Direito ao Esquecimento - Art. 18, VI)** | **1.** Abandonar o `Hard Delete` que gera `user_id = null`.<br>**2.** Criar um `AnonymizeUserJob` que recebe o pedido de exclusão.<br>**3.** O Job apagará dados PII (`email`, `telefone`, `password`, `profile_pic`) e trocará o nome para "Usuário Excluído", mantendo a chave primária e o vínculo com a `Instituição`/`Setor` para fins estritamente estatísticos (Art. 12 da LGPD). | **Alta** |
| **LGPD-03** | **Prevenção de PII em Logs de Contêiner (Art. 15, I)** | **1.** Criar um classe `PiiScrubberProcessor` e registrá-la no `config/logging.php` para o Monolog.<br>**2.** O processor interceptará mensagens de log usando expressões regulares para mascarar e-mails (`***@dominio.com`) e CPFs/Telefones presentes em stack traces antes de escrever no volume físico do Docker (Sugerido pelo @devops-docker-laravel). | **Alta** |
| **LGPD-04** | **Portabilidade de Dados Assíncrona (Art. 18, V)** | **1.** Adicionar botão "Exportar Meus Dados" no componente de Perfil.<br>**2.** A rota disparará um `ExportUserDataJob` no backend.<br>**3.** O Job agregará o histórico de reservas e perfis em um JSON/CSV estruturado, gerará um arquivo `.zip` e notificará o titular pelo canal de WebSockets (Reverb) com uma URL assinada (Signed URL) que expira em 24h. | **Média** |

---
**Conclusão da Auditoria SecOps:**
As soluções discutidas garantem que o UniEspaços cumpra os pilares da LGPD (Transparência, Consentimento, Portabilidade e Anonimização) sem sacrificar a performance do Laravel/React ou a integridade estatística dos dados no PostgreSQL. As tarefas acima devem ser incorporadas ao Roadmap do projeto (`ROADMAP.md`).