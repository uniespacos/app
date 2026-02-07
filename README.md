# UniEspaços

## Sumário

- [UniEspaços](#uniespaços)
  - [Sumário](#sumário)
  - [Visão geral](#visão-geral)
  - [Estrutura do Projeto](#estrutura-do-projeto)
    - [Estrutura de pastas](#estrutura-de-pastas)
    - [Ambiente de desenvolvimento](#ambiente-de-desenvolvimento)
    - [Ambiente de produção](#ambiente-de-produção)
  - [Iniciando o projeto](#iniciando-o-projeto)
    - [Pré-requisitos](#pré-requisitos)
    - [Clonando o repositorio](#clonando-o-repositorio)
    - [Configurando o ambiente de desenvolvimento](#configurando-o-ambiente-de-desenvolvimento)
  - [Uso básico](#uso-básico)
    - [Acessando o container de workspace](#acessando-o-container-de-workspace)
    - [Rebuildando as imagens do ambiente](#rebuildando-as-imagens-do-ambiente)
    - [Excluindo os containers](#excluindo-os-containers)
    - [Acompanhando os logs](#acompanhando-os-logs)
  - [Deploy em Produção](#deploy-em-produção)
    - [Subindo atualização de codigo](#subindo-atualização-de-codigo)
    - [Detalhes técnicos](#detalhes-técnicos)

## Visão geral

O **UniEspaços** é um sistema web, projetado para funcionar como um ecossistema digital para a gestão completa do ciclo de vida das reservas de Espaços.

## Estrutura do Projeto

O projeto está organizado seguindo a estrutura padrão do laravel, com a adição de um diretorio chamado `docker`, que contém os arquivos de configuração de ambiente para fazer o deploy em produção.

### Estrutura de pastas

```
project-root/ 
├── app/ # Pasta do laravel e outras pastas de sua arquitetura
├── ...
├── docker/ 
│   ├── common/ # Configurações compartilhadas
│   ├── production/ # Configurações específicas do ambiente de produção
├── compose.dev.yaml # Docker Compose de desenvolvimento
├── compose.prod.yaml # Docker Compose de produção 
├── .env.dev # Arquivo de variavel de ambiente para desenvolvimento
└── .env.prod # Arquivo de variavel de ambiente para produção

```

### Ambiente de desenvolvimento

O ambiente de desenvolvimento está configurado atraves do arquivo `compose.dev.yml`. Esse arquivo está configurado para o processo de desenvolvimento facilitando nossa vida.

### Ambiente de produção

O ambiente de produção está configurado atraves do arquivo `compose.prod.yml`. Esse arquivo Docker Compose está otimizado para permformace e segurançã utilizando multiestagios de builds e runtime do docker. Utilizando o PHP-FPM como um dos instrumentos principais.

## Iniciando o projeto

Siga esses passos para iniciar o projeto do **UniEspaços**:

- Recomendação, Use linux, o ambiente docker é feito para rodar em qualquer sistema operacional compativo com o docker. Porem o docker é nativo do linux e voce vai ter menos dor de cabeça em configurar atravez dele.

### Pré-requisitos

- Docker e Docker Compose.
  - Caso seja necessário instalar basta seguir o guia de instação do docker.
    - [Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
    - [Linux](https://docs.docker.com/desktop/setup/install/linux/)
    - [Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
- PHP 8.2 ou superior
  - Windows [Site oficial do PHP](https://www.php.net/manual/pt_BR/install.windows.php) | [Video](https://www.youtube.com/watch?v=KdY63NHMAqU)
  - Linux [Debian/Based](https://www.php.net/manual/pt_BR/install.unix.debian.php) | [Curso em video](https://youtu.be/aUN0j5Q9quQ)
- Composer
  - Com o php instalado e configurado para aparecer em seu terminal, copiar e colar os comandos do manual do composer
  - [Site oficial do composer](https://getcomposer.org/download/)

### Clonando o repositorio

```bash
git clone git@github.com:uniespacos/app.git
cd app
```

### Configurando o ambiente de desenvolvimento

1. Copie o `.env.dev` para `.env`:

```bash
cp .env.dev .env
```

1. Rode o comando `composer install` para instalar todas dependencias

```bash
    composer install
```

1. Rode o comando do laravel `key:generate` para gerar a chave para aplicação

```bash
    php artisan key:generate
```

1. Inicie os serviços com docker compose:

```bash
docker compose -f compose.dev.yml up -d
```

1. Instale as dependencias e rode a migration com os seeders:

```bash
docker compose -f compose.dev.yml exec workspace bash
composer install
php artisan storage:link
php artisan migrate --seed
npm install
npm run dev
```

1. Access the Application:

Acesse o navegador no [http://localhost](http://localhost) e a aplicação estará em execução.

## Uso básico

aqui estão alguns comandos básicos para uso no desenvolvimento:

### Acessando o container de workspace

O Container workspace é um container que roda em paralelo e contem o Composer, NPM e outras ferramentas necessárias para o desenvolvimento de uma aplicação laravel.

O comando para acessar o terminal do container é:

```bash
docker compose -f compose.dev.yml exec workspace bash
```

### Rebuildando as imagens do ambiente

```bash
docker compose -f compose.dev.yml up -d --build
```

### Excluindo os containers

```bash
docker compose -f compose.dev.yml down
```

### Acompanhando os logs

```bash
docker compose -f compose.dev.yml logs -f
```

Comando para ver o log de um container em especifico:

```bash
docker compose -f compose.dev.yml logs -f web
```

## Deploy em Produção

A imagem de produção está configurada para ter todos os arquivos do projeto dentro dela, em caso de atualização do sistema é necessário derrubar o serviço atual e rebuildar a imagem docker do serviço web e php-fpm para poder atualizar com o novo codigo.

### Subindo atualização de codigo

1. Para garantir a segurança vamos e integridade dos dados vamos fazer o backup do banco de dados.

```bash
  docker exec -it app-postgres-1 pg_dump -U uniespacos uniespacos > backup.sql
```

1. Para não haver conflitos, vamos derrubar  os containers.

```bash
  docker compose -f compose.prod.yml down 
```

1. Agora vamos listar os volumes do docker e pegar o nome do volume referente ao public/assets.
obs.: Volume vai ser `app_uniespacos-public-assets`. Garanta que está excluindo exatamente esse.

```bash
  docker volume ls
```

1. Excluir o volume referente ao public assets compartilhados pelo web e php-fpm

```bash
  docker volume rm app_uniespacos-public-assets
```

1. Agora basta rodar o comando de subir o container rebuildando a imagem

```bash
  docker compose -f compose.prod.yml up --build -d
```

1. Agora verificar se o sistema está rodando ok no link [https://uniespacos.uesb.br/](https://uniespacos.uesb.br)

2. Deu problema e excluiu o banco? Faça o rollback atraves do backup gerado no inicio.

```bash
  docker exec -i app-postgres-1 psql -U uniespacos uniespacos < backup.sql
```

### Detalhes técnicos

- **PHP**: A verão **8.2.29 FPM** é usada por questões de compatibilidade e performace em ambos os ambientes, produção e desenvolvimento.
- **Node.js**: A versão **22.x** é utilizada para buildar os assets do react, e para o ambiente de desenvolvimento.
- **PostgreSQL**: Banco de dados relacional utilizado na versão 16.
- **Nginx**: Usado como um servidor web que vai servir a aplicação manipulando as requisições HTTP.
- **Docker Compose**: Orquestra os serviços e facilita o processo de iniciar ou parar o ambiente.
- **Health Checks**: Foi implementado no Docker-Compose todas as configurações para garantir que os sistemas vão estar operacionais.
