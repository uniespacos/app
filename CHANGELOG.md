# Changelog

## [1.1.13](https://github.com/uniespacos/app/compare/v1.1.12...v1.1.13) (2026-02-28)


### Bug Fixes

* **security:** harden institucional controllers and policies for multi-tenancy and authorization ([a585957](https://github.com/uniespacos/app/commit/a585957e4a264df30f498c72241dacfa8454d58c))

## [1.1.12](https://github.com/uniespacos/app/compare/v1.1.11...v1.1.12) (2026-02-28)


### Bug Fixes

* **ci:** correct syntax for staging path variable in deployment step ([1e152d0](https://github.com/uniespacos/app/commit/1e152d06a557894509ad669bbfde2e8701809b9d))
* **deploy:** use ssh pipe to create Caddyfile on server ([13559dc](https://github.com/uniespacos/app/commit/13559dc7f461ffb794c360f676cdf819f4539278))

## [1.1.11](https://github.com/uniespacos/app/compare/v1.1.10...v1.1.11) (2026-02-28)


### Bug Fixes

* **notifications:** standardize user variable in ReservationFailedNotification ([44d2a42](https://github.com/uniespacos/app/commit/44d2a42d8e05c5d16b99955b7de93945e3221f67))

## [1.1.10](https://github.com/uniespacos/app/compare/v1.1.9...v1.1.10) (2026-02-28)


### Bug Fixes

* **notifications:** standardize user variable in failed reservation emails to fix test ([e915b82](https://github.com/uniespacos/app/commit/e915b82fd57454e2d0b583aacebc83524f325108))

## [1.1.9](https://github.com/uniespacos/app/compare/v1.1.8...v1.1.9) (2026-02-28)


### Bug Fixes

* **deploy:** automate removal of poisoned Caddyfile directory on staging ([396f367](https://github.com/uniespacos/app/commit/396f367a1d9c65e61698cbad59a812890d8ef8db))

## [1.1.8](https://github.com/uniespacos/app/compare/v1.1.7...v1.1.8) (2026-02-28)


### Bug Fixes

* **deploy:** ensure staging Caddyfile is copied to the server ([09e9ee3](https://github.com/uniespacos/app/commit/09e9ee35c2324647bfcf964a62422e59cb6378b7))

## [1.1.7](https://github.com/uniespacos/app/compare/v1.1.6...v1.1.7) (2026-02-28)


### Bug Fixes

* **deploy:** force new release for Caddy migration ([3d3ca7d](https://github.com/uniespacos/app/commit/3d3ca7d2a19429deed94fb447060067149cb5774))

## [1.1.6](https://github.com/uniespacos/app/compare/v1.1.5...v1.1.6) (2026-02-28)


### Bug Fixes

* **deploy:** resolve route naming conflict and harden deployment script ([572841b](https://github.com/uniespacos/app/commit/572841b5137c8eac590fdc8357d8c1a15717cdf9))

## [1.1.5](https://github.com/uniespacos/app/compare/v1.1.4...v1.1.5) (2026-02-28)


### Bug Fixes

* **deploy:** separate docker metadata actions for app and web images to prevent tag overriding ([d2543db](https://github.com/uniespacos/app/commit/d2543dba7813c027b825ce0b6868ee826223aad6))

## [1.1.4](https://github.com/uniespacos/app/compare/v1.1.3...v1.1.4) (2026-02-28)


### Bug Fixes

* **deploy:** wait for container readiness to prevent OCI exec pipe errors ([da78779](https://github.com/uniespacos/app/commit/da78779ad5532f65a9d4c9fd9c6d0324d1813f13))

## [1.1.3](https://github.com/uniespacos/app/compare/v1.1.2...v1.1.3) (2026-02-28)


### Miscellaneous Chores

* **deploy:** improve staging deployment script for robustness ([efe2a3a](https://github.com/uniespacos/app/commit/efe2a3ad96ed54f8163422407ca566463bd30af0))

## [1.1.2](https://github.com/uniespacos/app/compare/v1.1.1...v1.1.2) (2026-02-28)


### Bug Fixes

* **deploy:** make database backup fault-tolerant on staging ([199627d](https://github.com/uniespacos/app/commit/199627d84b83c7401b8dcfb747344cd7e6bf78a7))

## [1.1.1](https://github.com/uniespacos/app/compare/v1.1.0...v1.1.1) (2026-02-28)


### Bug Fixes

* **deploy:** ensure backup directory is created before backup ([ab9415a](https://github.com/uniespacos/app/commit/ab9415a5455fb076882c3f6e066c46da305c83af))

## [1.1.0](https://github.com/uniespacos/app/compare/v1.0.0...v1.1.0) (2026-02-28)


### Features

* add botão para navegar para semana atual ([7b14d27](https://github.com/uniespacos/app/commit/7b14d2714c888655c8717d16f92b7a439d96a030))
* add descricao ao espaco ([94809c3](https://github.com/uniespacos/app/commit/94809c33456a2a6ff82790bf7c180a77903a6dff))
* Add new release workflow ([a9e51fd](https://github.com/uniespacos/app/commit/a9e51fdce1dfa387e787da519c9e59926372b696))
* add Portainer deployment workflow ([2a353f1](https://github.com/uniespacos/app/commit/2a353f1d0a8dd1324d4f5383fcc5c490ce502436))
* add unidade_id e modulo_id as interfaces ([59dde78](https://github.com/uniespacos/app/commit/59dde7895588b33942f5346882782e4a68897e63))
* Add UniEspaços DevOps specialist skill documentation ([8af1bbb](https://github.com/uniespacos/app/commit/8af1bbb44ecaec1f9d69fa009e6c927702a67423))
* Add UniEspaços DevOps specialist skill documentation ([9fbac1e](https://github.com/uniespacos/app/commit/9fbac1ea53f24f5f949a08cd5d9c9f2b8f306380))
* Add UniEspaços documentation updater skill documentation ([8af1bbb](https://github.com/uniespacos/app/commit/8af1bbb44ecaec1f9d69fa009e6c927702a67423))
* Add UniEspaços documentation updater skill documentation ([9fbac1e](https://github.com/uniespacos/app/commit/9fbac1ea53f24f5f949a08cd5d9c9f2b8f306380))
* Add UniEspaços full-stack developer skill documentation ([8af1bbb](https://github.com/uniespacos/app/commit/8af1bbb44ecaec1f9d69fa009e6c927702a67423))
* Add UniEspaços full-stack developer skill documentation ([9fbac1e](https://github.com/uniespacos/app/commit/9fbac1ea53f24f5f949a08cd5d9c9f2b8f306380))
* adicionando campos a tabela reservas e corrigindo models ([8a8aa5a](https://github.com/uniespacos/app/commit/8a8aa5aab36609af38a4bd46c80940be6426f30f))
* adicionar arquivo de ambiente ao serviço web no compose.prod.yml ([f3468bb](https://github.com/uniespacos/app/commit/f3468bb47ad6305bab48471d526a2d0134b91dfb))
* adicionar configuração de ambiente e workflows para construção e publicação de imagens Docker ([0397b49](https://github.com/uniespacos/app/commit/0397b496d134d87823f59446dea395986117e167))
* adicionar configuração de ambiente para Docker Compose e criar arquivo stack.env ([5e0242f](https://github.com/uniespacos/app/commit/5e0242fa42fd72ccce183191df39472602850c99))
* adicionar configuração do Xdebug e melhorar o ambiente de desenvolvimento ([86c9b15](https://github.com/uniespacos/app/commit/86c9b152355d185eb526adac72df72de040807c2))
* adicionar diretrizes de segurança para UniEspaços e melhorar responsividade do componente Agenda ([#121](https://github.com/uniespacos/app/issues/121)) ([70e4f43](https://github.com/uniespacos/app/commit/70e4f435454d3727391a80aed245ec4f95d4f980))
* adicionar documentação para a habilidade de especialista em DevOps do UniEspaços ([62117d1](https://github.com/uniespacos/app/commit/62117d10e2cda355fbf86f1e2d603c378e675ca0))
* adicionar geração de certificados SSL auto-assinados e ajustar healthcheck do PostgreSQL ([b124683](https://github.com/uniespacos/app/commit/b124683b2cd79972f591b8259c18c8242064d569))
* adicionar seção de licença ao README e incluir arquivo LICENSE ([3cbbc66](https://github.com/uniespacos/app/commit/3cbbc660023856ed44d2f37a487c2cdcc50d6d50))
* adicionar variáveis WEB_PORT e WEB_PORT_SSL ao ambiente e atualizar compose.prod.yml para usá-las ([3023360](https://github.com/uniespacos/app/commit/30233601a52ec75ae58c27f4700ea2f0b29fcb23))
* adicionar verificação de prontidão do banco de dados Postgres no pipeline CI ([ffcc503](https://github.com/uniespacos/app/commit/ffcc5034166409199dca6f7b9fd724e457dd97d0))
* adicionar verificação de saúde ao worker de fila no Docker Compose ([dc96778](https://github.com/uniespacos/app/commit/dc967784c8174dfdd603c60c738e9b9498085f76))
* adicionar worker de fila ao Docker Compose e ajustar formatação do serviço adminer ([068a4c7](https://github.com/uniespacos/app/commit/068a4c74cca0376173ededb932fdf98a981d9fe9))
* adicionar workflow de validação de configuração de produção e ajustes no Docker Compose ([18d5588](https://github.com/uniespacos/app/commit/18d55888c24efdf34baaa35505a59d2ce146501e))
* aprimorar ambiente de desenvolvimento com Docker e scripts de inicialização ([29d1d6a](https://github.com/uniespacos/app/commit/29d1d6a371c66e612dad5191dd947b6b084b1d42))
* aprimorar geração e verificação de certificados SSL no workflow de produção ([a00882a](https://github.com/uniespacos/app/commit/a00882a0fd60cf968b189e5fe011a706170b86ec))
* aprimorar verificação e geração de certificados SSL no workflow de produção ([3dd4233](https://github.com/uniespacos/app/commit/3dd42333852d0fd3229b323af1e1054e266a17d2))
* atualizar caminhos do Dockerfile para usar variável PORTAINER_PATH ([c94d311](https://github.com/uniespacos/app/commit/c94d311b752605c7449fc7cfe086f4ccbc2d9f23))
* atualizar geração de certificados SSL e ajustar healthcheck do PostgreSQL ([a875be4](https://github.com/uniespacos/app/commit/a875be432ab11856327b31dc454da8058f389110))
* **ci:** adicionar backup de banco de dados e configuração de Nginx … ([#61](https://github.com/uniespacos/app/issues/61)) ([88000d2](https://github.com/uniespacos/app/commit/88000d2c16aafecb4daaddd5cd1a427b7b6263d4))
* **ci:** adicionar backup de banco de dados e configuração de Nginx para produção ([5b55494](https://github.com/uniespacos/app/commit/5b554944c6a9e169fe2c2331f4e2f40aab24838a))
* **ci:** adicionar instalação de dependências do Node e execução de testes frontend no workflow CI/CD ([3992f64](https://github.com/uniespacos/app/commit/3992f64c2cbc623e34928506ef709f36bbe6b960))
* **ci:** atualizar configuração do SSH para usar chave Ed25519 e adicionar verbosidade ao comando SSH ([d0806db](https://github.com/uniespacos/app/commit/d0806db730c17f428d5da9795fa8c062bf78bd99))
* **ci:** Consolidate and improve CI/CD pipeline ([d3d0164](https://github.com/uniespacos/app/commit/d3d0164577d02c034cbe24ad9e71c603e672b490))
* criando indices e jobs para melhor performace de manipulação dos eventos em torno de uma reserva ([9aef03c](https://github.com/uniespacos/app/commit/9aef03c08d1a0aa3ab9129df465d5af4afa284d1))
* **deps:** adicionar ts-node como dependência de desenvolvimento ([3998f8c](https://github.com/uniespacos/app/commit/3998f8c2e60dbbbdf5c43b12bf358b1b4222b94b))
* **docs:** add project roadmap and update documentation skills ([e5c1be5](https://github.com/uniespacos/app/commit/e5c1be55fd54d55a4cb0a6e5bcb58cea732fd7a2))
* implementar pipeline CI/CD completo com linting, testes e deploy ([d1d4618](https://github.com/uniespacos/app/commit/d1d4618bc7508561f06c8bf0a8cd30a0069c7bea))
* implementar pipeline CI/CD completo com verificação de qualidade, testes e deploy em produção ([9ff7546](https://github.com/uniespacos/app/commit/9ff754693758b9285769c9818f3e6bf56e179d61))
* Introduce PHP Laravel skill with extensive capabilities ([8af1bbb](https://github.com/uniespacos/app/commit/8af1bbb44ecaec1f9d69fa009e6c927702a67423))
* Introduce PHP Laravel skill with extensive capabilities ([9fbac1e](https://github.com/uniespacos/app/commit/9fbac1ea53f24f5f949a08cd5d9c9f2b8f306380))
* **nginx:** atualizar configuração do Nginx para redirecionamento HTTP e melhorar segurança ([fd53533](https://github.com/uniespacos/app/commit/fd535330c71c82cabcac187dfed5d3a730ddecb7))
* **nginx:** atualizar configuração do Nginx para suporte a SSL e redirecionamento HTTP para HTTPS ([502657b](https://github.com/uniespacos/app/commit/502657bb91a6affd351da99ed214d584e7ec6e36))
* **sidebar:** add unit tests for sidebar and fix cookie handling in tests ([5709191](https://github.com/uniespacos/app/commit/570919116a30fe42b01a893f2a6a77a9e5b6c902))
* **ssl:** adicionar suporte a variáveis de ambiente para caminhos de certificados SSL ([fc4e934](https://github.com/uniespacos/app/commit/fc4e9343aaef30b3b710a7c2c4455d858286b300))


### Bug Fixes

* adicionar suporte a pull requests nos workflows de CI/CD ([2bec595](https://github.com/uniespacos/app/commit/2bec5957ef45e813c674cceb714d087bd0c97657))
* ajustar comandos do Docker Compose para não reconstruir imagens desnecessariamente ([2e57474](https://github.com/uniespacos/app/commit/2e57474d2de0ef6099ffcac7bc53660c118f5e4a))
* ajustar formatação e espaçamento em workflows do GitHub ([5f34f9f](https://github.com/uniespacos/app/commit/5f34f9f468d01ec1e69f10f8b1468c9a5a5a98a6))
* ajustar validação e formatação do telefone no registro de usuário ([#116](https://github.com/uniespacos/app/issues/116)) ([f2c1f42](https://github.com/uniespacos/app/commit/f2c1f42b18858c8f64452f25124fc905e1dfc3a6))
* ajustar variáveis de ambiente no stack.env para correspondência com .env ([31e67ee](https://github.com/uniespacos/app/commit/31e67eef0b433e0bd80407bc64e3c53d52965686))
* alterando storage link para dentro do dockerfile php-fpm ([7586f11](https://github.com/uniespacos/app/commit/7586f118ca42af27c35f341b67681331e9a9bbf8))
* atualizar a versão do PHP para 8.4 e otimizar a cópia de arquivos no Dockerfile ([2558ff6](https://github.com/uniespacos/app/commit/2558ff6eb8496fdb232c867d64da2a65247dfb37))
* atualizar arquivos de ambiente para stack.env em serviços no Docker Compose ([5e5971a](https://github.com/uniespacos/app/commit/5e5971aac874c95921dca609089af9457dd7e99c))
* atualizar configuração de envio de e-mails para SMTP ([3a7dee2](https://github.com/uniespacos/app/commit/3a7dee2cbf43176e09c3dc05cd702d77ded6dc81))
* browser tab title not updating correctly ([#110](https://github.com/uniespacos/app/issues/110)) ([#115](https://github.com/uniespacos/app/issues/115)) ([7fddcca](https://github.com/uniespacos/app/commit/7fddcca880bc302aef8483eaa56f7c585c687acc))
* **ci:** adicionar condição para execução do job de build e push apenas em eventos de push ([f54c889](https://github.com/uniespacos/app/commit/f54c889278c6ce5057e5e4b15f7d4bc5dde784dd))
* **ci:** Adicionar etapa para corrigir permissões e ajustar variáveis de ambiente no docker-compose ([f3a0f2e](https://github.com/uniespacos/app/commit/f3a0f2e05675d8e7728b3b185f20c9e5cead038f))
* **ci:** adicionar instalação e configuração do cloudflared para proxy SSH no deploy ([3aa5e6b](https://github.com/uniespacos/app/commit/3aa5e6b54d25f02da24f02b5b0d9883f3d87ee50))
* **ci:** ajustar configuração do SSH para usar variáveis de ambiente com cloudflared ([504ce27](https://github.com/uniespacos/app/commit/504ce277d9e0e99b2dd9783a6a1c321d8de8831d))
* **ci:** Ajustar permissões de usuário para instalação de dependências PHP no workflow ([dd174bf](https://github.com/uniespacos/app/commit/dd174bfda7f3e6050df8043cd821735354a76e68))
* **ci:** atualizar chave APP_KEY e ajustar estrutura do diretório de build no workflow CI/CD ([53ed3d5](https://github.com/uniespacos/app/commit/53ed3d571b22440ad578ace147311548ece2ab8b))
* **ci:** Atualizar comando de correção de permissões para incluir diretório vendor ([eb73265](https://github.com/uniespacos/app/commit/eb7326564c9f6b9eda06140bd6e868408b91927a))
* **ci:** corrigir comando de execução de testes para usar bash e configurar NVM ([a447d98](https://github.com/uniespacos/app/commit/a447d98bffd268b536ecd665c1f1c4ed4e56b6a1))
* **ci:** criar e definir permissões para diretórios graváveis no workflow de testes ([f459272](https://github.com/uniespacos/app/commit/f459272042d254ef76710caa3bfe68898053c167))
* **ci:** Ensure workspace is ready before composer install and correct ci.yml structure ([d93e20f](https://github.com/uniespacos/app/commit/d93e20f5e27417241e69697956978ed71ddba9dc))
* **ci:** expor UID e GID no workflow de testes para garantir permissões corretas ([859324a](https://github.com/uniespacos/app/commit/859324a3f72601d523fbe723d7e1ce4870954c26))
* **ci:** Improve workspace readiness check with timeout and health status verification ([0bc1223](https://github.com/uniespacos/app/commit/0bc12234ea2f5daed6e14b4e3fa844ee04f4e5db))
* **ci:** mover variáveis de ambiente para a seção correta no job de deploy para staging ([c170ff8](https://github.com/uniespacos/app/commit/c170ff83e5fb296711c88a11878a1c8e0bd9eaaa))
* **ci:** refatorar etapas de configuração e teste no workflow CI/CD para melhorar a legibilidade e a manutenção ([9a5cf91](https://github.com/uniespacos/app/commit/9a5cf917b670023b28ff17cf67aaeeb2a7f98229))
* **ci:** remover espaços em branco desnecessários e ajustar formatação no workflow CI/CD ([59baffc](https://github.com/uniespacos/app/commit/59baffc7ad44df98212ab4311bbc650d7241b95b))
* **ci:** remover etapas de formatação e depuração do container, mantendo a correção de permissões ([69117ac](https://github.com/uniespacos/app/commit/69117ac337fc2138c5662314a3d34753bbd8396a))
* **ci:** Reorganizar etapa de correção de permissões para garantir execução correta no workflow ([921c379](https://github.com/uniespacos/app/commit/921c37929b3939b451cd1e78024bf24e61b8ac6d))
* **ci:** Separate build and startup steps for services and add debug logs ([8ee21c7](https://github.com/uniespacos/app/commit/8ee21c7b420b1b2647adba72fa05b96625500957))
* **ci:** Set permissions for workspace directory in CI workflow ([e3ad8fd](https://github.com/uniespacos/app/commit/e3ad8fddd4a3ef8356ab187b8447bc7a8fba918a))
* **ci:** Set write permissions for Laravel directories in CI workflow ([5d3e34f](https://github.com/uniespacos/app/commit/5d3e34fcb5df7f8581027f76228e25aa17f37983))
* correção bug avaliarreserva recorrente ([6a20687](https://github.com/uniespacos/app/commit/6a206876e8cd68f16d3a42b04392d12009b364ff))
* correção de logo do uniespacos ([08ddf43](https://github.com/uniespacos/app/commit/08ddf43e68cdb5caf28c426a3101736b82d58f6c))
* correção no slot header com o horario ([b3fc0ad](https://github.com/uniespacos/app/commit/b3fc0ad4d3f6f30025009c141a47bfc613dfe0f8))
* correção nome de modulo EspacoCard ([bd5f589](https://github.com/uniespacos/app/commit/bd5f589383a25181cf5a7224ccdcae07fdfb9bbc))
* correção slotcell ([8285851](https://github.com/uniespacos/app/commit/82858513b1bb3cf5d7f4aa91f3df79a540b254ce))
* corrigindo logica de filtro de busca de espaços ([0749f8f](https://github.com/uniespacos/app/commit/0749f8f836b35ce74a60be97faa29f77ce22a159))
* corrigir a formatação do bloco de código no README.md ([fb45fdf](https://github.com/uniespacos/app/commit/fb45fdfa67adcdce6842c3d3e20798e36b19e338))
* corrigir branches em workflows para usar 'development' ao invés de 'develop' e remover push desnecessário no deploy ([c004b76](https://github.com/uniespacos/app/commit/c004b76a5f149ed25b93493a226706e35fbf4e3d))
* corrigir caminhos do Dockerfile para caminhos relativos no compose.prod.yml ([8bbc815](https://github.com/uniespacos/app/commit/8bbc8157f224244144709db7fd96b0a99493e03e))
* corrigir configuração do workflow de validação de produção e ajustar variáveis de ambiente ([2a1d55d](https://github.com/uniespacos/app/commit/2a1d55d763153910f8161f94c30824f3d932d97c))
* corrigir cópia do arquivo .env para o ambiente de CI ([260a98e](https://github.com/uniespacos/app/commit/260a98e7386f7d7824dee52a22ef63b46795dec8))
* corrigir criação do arquivo .env para o ambiente de CI e ajustar variáveis críticas ([9b34863](https://github.com/uniespacos/app/commit/9b34863483f13058fa74dbf6b536ef8a0fc317ef))
* corrigir variáveis de autenticação no template de implantação do Portainer ([2cacbb5](https://github.com/uniespacos/app/commit/2cacbb531476eb78840624872a43128a2d2d484d))
* ensure staging deployment uses development image tag ([#65](https://github.com/uniespacos/app/issues/65)) ([71827f5](https://github.com/uniespacos/app/commit/71827f540a3194c013d82c48a6210452f813dc74))
* espacos favoritos, redirecionando para agenda de espaco ([c444d5a](https://github.com/uniespacos/app/commit/c444d5a9ee3830d9b44b6cd070c055a6b2964b15))
* espacos que gerencio ([860fb24](https://github.com/uniespacos/app/commit/860fb240a4363362b5474e1a3dbfe3c13cf5963c))
* Import useCallback hook ([#114](https://github.com/uniespacos/app/issues/114)) ([8af1bbb](https://github.com/uniespacos/app/commit/8af1bbb44ecaec1f9d69fa009e6c927702a67423))
* otimizar a geração de arquivos .env e stack.env no workflow de validação de produção ([da2aa3e](https://github.com/uniespacos/app/commit/da2aa3ea1059ef5da56dfcd6e4d340eec538d5f1))
* **release:** update config to manifest v4 structure ([9a45908](https://github.com/uniespacos/app/commit/9a45908061209bdbf287d16961d843c2320f2c02))
* remove console.log ([ad7f504](https://github.com/uniespacos/app/commit/ad7f504731c9b15402c7f751b6826860c337b7a0))
* removendo reservas inativas do dashboard ([03ed7e7](https://github.com/uniespacos/app/commit/03ed7e768c2cdd74f514598e0d311c35cbd25df6))
* removendo reservas inativas do minhas reservas ([e8fe93e](https://github.com/uniespacos/app/commit/e8fe93efbcf19a074ac0b2bd7828abf0408c2b5a))
* remover a propriedade "peer" de várias dependências no package-lock.json ([6ff4527](https://github.com/uniespacos/app/commit/6ff452739c8f831d05600421b7a55216e7863aaa))
* remover tipo não utilizado "@types/testing-library__jest-dom" do tsconfig.json ([4818d26](https://github.com/uniespacos/app/commit/4818d26e17013ea89775443650b24260bfa1f142))
* remover variáveis de porta do serviço web no compose.prod.yml ([8cb4988](https://github.com/uniespacos/app/commit/8cb4988c1161443bb43d30823581cea154536752))
* **reservations:** Resolve date selection and recurrence bugs ([#113](https://github.com/uniespacos/app/issues/113)) ([9fbac1e](https://github.com/uniespacos/app/commit/9fbac1ea53f24f5f949a08cd5d9c9f2b8f306380))
* Resolve test suite errors ([bcfb586](https://github.com/uniespacos/app/commit/bcfb58635c2afe45367c9c069439da629b973137))
* set default locale to pt-BR for Calendar component ([#97](https://github.com/uniespacos/app/issues/97)) ([73f5db5](https://github.com/uniespacos/app/commit/73f5db523c854dd39d06f212dc0230c4685b00fa))
* Setup PostgreSQL service for CI tests and add missing ReservaMiddleware ([c903196](https://github.com/uniespacos/app/commit/c9031968c8e9598f99c2e2e68cd55c14bbfe2dc1))
* **sidebar:** persist state using cookies ([2b80efe](https://github.com/uniespacos/app/commit/2b80efe5c1c60f053a976ef73dc17b2618054734))
* substituir a construção de imagens Docker por imagens pré-construídas no compose.prod.yml ([3a71b45](https://github.com/uniespacos/app/commit/3a71b45f3d79af667f92a4b0db4f61eb4ad666f4))
* **tests:** adicionar verificação para método withoutVite no TestCase e corrigir formatação no ExampleTest ([12c114e](https://github.com/uniespacos/app/commit/12c114e1e018fd8b33ea16b293fe4668aaf57b5d))
* **tests:** remover espaço em branco desnecessário no método setUp e adicionar nova linha no final do arquivo ExampleTest ([9fd628d](https://github.com/uniespacos/app/commit/9fd628d8b995ecd9eba56c51f3eb7383670aee1d))
* Update .gitignore to include .gemini directory ([8af1bbb](https://github.com/uniespacos/app/commit/8af1bbb44ecaec1f9d69fa009e6c927702a67423))
* Update .gitignore to include .gemini directory ([9fbac1e](https://github.com/uniespacos/app/commit/9fbac1ea53f24f5f949a08cd5d9c9f2b8f306380))
* Use docker compose wait for workspace service readiness ([3ba851e](https://github.com/uniespacos/app/commit/3ba851e289dcf1c55e9954deae09fc93812b1920))


### Miscellaneous Chores

* add queue-worker ([ee38933](https://github.com/uniespacos/app/commit/ee3893399e004bd32e6efbe390954e43a4febcb8))
* adicionar desabilitação de tipos explícitos do TypeScript em vários arquivos ([b093aed](https://github.com/uniespacos/app/commit/b093aed9f6d2767a7484294caaa3d449fc8df039))
* atualizar dependências e ajustar configurações do TypeScript ([dc1a58a](https://github.com/uniespacos/app/commit/dc1a58a2a1b05159682bca135cacc12243cb6a72))
* **ci:** remove develop branch from pull request triggers in CI/CD workflow ([81ecfde](https://github.com/uniespacos/app/commit/81ecfde4bb18b139858a56ca7380489c8466c7f2))
* **deps:** update package-lock.json ([5760636](https://github.com/uniespacos/app/commit/5760636c92e5966d8a4f7ca42e2a9f1645773fa8))
* kickstart release-please ([8ed9799](https://github.com/uniespacos/app/commit/8ed979937317688a2e06cc2d3a900e32f595438d))
* remover eventos de pull_request e branches desnecessários do workflow de validação de produção ([a51e8b6](https://github.com/uniespacos/app/commit/a51e8b6da733f821a1b9eb016d4b1cba8ac4c4ff))
* update dependencies and clean up code ([4e0d2c1](https://github.com/uniespacos/app/commit/4e0d2c108ba2336496776308a9f78ff2bb0d149f))
* update docs ([#118](https://github.com/uniespacos/app/issues/118)) ([e0507f0](https://github.com/uniespacos/app/commit/e0507f0ea8ce9833167ab9d77f454ad99548e1a7))
* update npm dependencies ([55a549e](https://github.com/uniespacos/app/commit/55a549ecf3d2016684c87f78c4ec93cea12a7f3c))
