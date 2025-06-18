# Log Parser FPS - API

API para processar logs de partidas de FPS, calcular estatísticas de jogadores, partidas e eventos.

---

## Descrição

A API recebe arquivos de log contendo informações de partidas, processa os eventos (inicio/fim de partida, abates, etc), persiste os dados e expõe endpoints para consulta de partidas, jogadores e eventos.

---


## Compilar e rodar

```bash
npm install
npm run start:dev
```

Acesse os endpoints em `http://localhost:3000`.

---


## Rodar testes
```bash
# unit tests
$  npm  run  test

# e2e tests
$  npm  run  test:e2e

# test coverage
$  npm  run  test:cov
```

## Arquitetura

O projeto segue princípios de arquitetura limpa e DDD (Domain-Driven Design), utilizando o framework [NestJS](https://nestjs.com/):

-  **Camada de Application/Controllers**: Recebe as requisições HTTP e delega para os serviços de domínio.

-  **Camada de Domain/Services**: Contém a lógica de negócio, como processamento de kills, criação de partidas, estatísticas, etc.

-  **Entities**: Representam as tabelas do banco de dados (Match, Player, Event, PlayerMatchStats, Award).

-  **DTOs**: Objetos de transferência de dados para validação e tipagem das requisições. (Nesse projeto, ele é usado também pra comunicação entre serviços, para garantir consistência dos dados a serem manipulados)

-  **Repositórios TypeORM**: Camada de abstração para persistência e consulta dos dados.

-  **Banco de dados**: SQLite
---

### Decisões técnicas e de design

-  **TypeORM + SQLite**: Escolhido pela simplicidade para prototipação e testes locais.

-  **Separação de camadas**: Controllers apenas recebem requisições e delegam para os serviços, mantendo lógica de negócio isolada.

-  **Validação com class-validator**: Todos os DTOs são validados automaticamente.

-  **Upload de logs em memória**: O arquivo é processado diretamente sem ser salvo em disco.

- **Persistência**: Os logs são convertidos para a tabela `events` para consistencia e padronização dos dados.

-  **Suporte a múltiplas partidas por log**: O parser reconhece e processa vários blocos de partidas em um único upload.

-  **Extensível para regras de negócio**: Fácil adicionar novas regras (awards, streaks, etc).

**obs:**
-  **Enums como string no banco**: Para compatibilidade com SQLite, enums são salvos como `varchar`.
---

## Entidades e Relacionamentos
O sistema utiliza as seguintes entidades:

### Match
- Representa uma partida.
- **Campos:** `id`, `matchNumber`, `startTime`, `endTime`, `createdAt`, `updatedAt`
- **Relacionamentos:**
	- Possui vários `Event` (OneToMany)
	- Possui vários `PlayerMatchStats` (OneToMany)
	- Possui vários `Award` (OneToMany)

### Player
- Representa um jogador.
- **Campos:** `id`, `name`, `createdAt`, `updatedAt`
- **Relacionamentos:**
	- Pode ser killer ou victim em vários `Event` (OneToMany)
	- Possui vários `PlayerMatchStats` (OneToMany)
	- Possui vários `Award` (OneToMany)

### Event
- Representa um evento de jogo (kill, morte, etc).
- **Campos:** `id`, `occurredAt`, `weapon`, `createdAt`, `updatedAt`
- **Relacionamentos:**
	- Relacionado a um `Match` (ManyToOne)
	- Killer: relacionado a um `Player` (ManyToOne)
	- Victim: relacionado a um `Player` (ManyToOne)

### PlayerMatchStats
- Estatísticas de um jogador em uma partida específica.
- **Campos:** `id`, `team`, `kills`, `deaths`, `createdAt`, `updatedAt`
- **Relacionamentos:**
	- Relacionado a um `Player` (ManyToOne)
	- Relacionado a um `Match` (ManyToOne)

### Award
- Prêmios concedidos a jogadores por conquistas especiais.
- **Campos:** `id`, `type`, `createdAt`, `updatedAt`
- **Relacionamentos:**
	- Relacionado a um `Player` (ManyToOne)
	- Relacionado a um `Match` (ManyToOne)

---

## Endpoints
### Upload de Log
-  **POST /matches/upload**

  Upload de um arquivo de log(.txt) para processamento.

  Corpo: multipart/form-data (campo `file`)

- Exemplo de Resposta:

```json

{
  "message": "Log file processed successfully"
}

```

-  **Exemplo de uso (curl):**

```bash

curl -F 'file=@log.txt' http://localhost:3000/matches/upload

```

### Listar Eventos
-  **GET /matches/events**

  Lista todos os eventos (kills, mortes) processados.

- Exemplo de Resposta:

```json
[
    {
        "id": 1,
        "match": {
            "id": 1,
            "matchNumber": 11348965,
            "startTime": "2019-04-23T18:34:22.000Z",
            "endTime": "2019-04-23T18:39:22.000Z",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "occurredAt": "2019-04-23T18:36:04.000Z",
        "killer": {
            "id": 1,
            "name": "Roman",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "victim": {
            "id": 2,
            "name": "Nick",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "weapon": "M16",
        "createdAt": "2025-06-18T18:01:35.000Z",
        "updatedAt": "2025-06-18T18:01:35.000Z"
    },
    {
        "id": 2,
        "match": {
            "id": 1,
            "matchNumber": 11348965,
            "startTime": "2019-04-23T18:34:22.000Z",
            "endTime": "2019-04-23T18:39:22.000Z",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "occurredAt": "2019-04-23T18:36:33.000Z",
        "killer": {
            "id": 3,
            "name": "<WORLD>",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "victim": {
            "id": 2,
            "name": "Nick",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "weapon": "DROWN",
        "createdAt": "2025-06-18T18:01:35.000Z",
        "updatedAt": "2025-06-18T18:01:35.000Z"
    }
]

```

### Listar Partidas
-  **GET /matches**

  Lista todas as partidas registradas.

- Exemplo de Resposta:

```json

[
    {
        "id": 1,
        "matchNumber": 11348965,
        "startTime": "2019-04-23T18:34:22.000Z",
        "endTime": "2019-04-23T18:39:22.000Z",
        "createdAt": "2025-06-18T18:01:35.000Z",
        "updatedAt": "2025-06-18T18:01:35.000Z"
    }
]

```

-  **GET /matches/:matchNumber**
- Detalha uma partida específica, incluindo:
	- id,
	- matchNumber,
	- startTime,
	- endTime

- players:
	- name,
	- team,
	- kills,
	- deaths,
	- score

- Exemplo de Resposta:

```json
{
    "id": 1,
    "matchNumber": 11348965,
    "startTime": "2019-04-23T18:34:22.000Z",
    "endTime": "2019-04-23T18:39:22.000Z",
    "players": [
        {
            "name": "Roman",
            "team": "TERRORISTS",
            "kills": 1,
            "deaths": 0,
            "score": 1
        },
        {
            "name": "Nick",
            "team": "COUNTER_TERRORISTS",
            "kills": 0,
            "deaths": 2,
            "score": -2
        },
        {
            "name": "<WORLD>",
            "team": null,
            "kills": 0,
            "deaths": 0,
            "score": 0
        }
    ]
}
```



### Estatísticas de Jogadores em Partidas
-  **GET /player-match-stats**

  Lista todas as estatísticas de um determinado jogador em uma determinada partida (PlayerMatchStats).

- Exemplo de Resposta:

```json
[
    {
        "id": 1,
        "player": {
            "id": 1,
            "name": "Roman",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "match": {
            "id": 1,
            "matchNumber": 11348965,
            "startTime": "2019-04-23T18:34:22.000Z",
            "endTime": "2019-04-23T18:39:22.000Z",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "team": "TERRORISTS",
        "kills": 1,
        "deaths": 0,
        "createdAt": "2025-06-18T18:01:35.000Z",
        "updatedAt": "2025-06-18T18:01:35.000Z"
    },
    {
        "id": 2,
        "player": {
            "id": 2,
            "name": "Nick",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "match": {
            "id": 1,
            "matchNumber": 11348965,
            "startTime": "2019-04-23T18:34:22.000Z",
            "endTime": "2019-04-23T18:39:22.000Z",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "team": "COUNTER_TERRORISTS",
        "kills": 0,
        "deaths": 2,
        "createdAt": "2025-06-18T18:01:35.000Z",
        "updatedAt": "2025-06-18T18:01:35.000Z"
    },
    {
        "id": 3,
        "player": {
            "id": 3,
            "name": "<WORLD>",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "match": {
            "id": 1,
            "matchNumber": 11348965,
            "startTime": "2019-04-23T18:34:22.000Z",
            "endTime": "2019-04-23T18:39:22.000Z",
            "createdAt": "2025-06-18T18:01:35.000Z",
            "updatedAt": "2025-06-18T18:01:35.000Z"
        },
        "team": null,
        "kills": 0,
        "deaths": 0,
        "createdAt": "2025-06-18T18:01:35.000Z",
        "updatedAt": "2025-06-18T18:01:35.000Z"
    }
]
```

---

## Exemplo de Log Aceito

```json
23/04/2019 15:34:22 - New match 11348965 has started
23/04/2019 15:34:22 - TERRORISTS: [Roman], COUNTER_TERRORISTS: [Nick]
23/04/2019 15:36:04 - Roman killed Nick using M16
23/04/2019 15:36:33 - <WORLD> killed Nick by DROWN
23/04/2019 15:39:22 - Match 11348965 has ended
```

# Melhorias

- Mudança dos ids para uuid a fim de:
	- evitar vazamento de informações por ID sequencial.
	- gerar IDs client-side ou em serviços distribuídos.
	- replicação ou sharding no futuro.

- Implementar sistema de pontuacao com kda para gerar um score mais preciso.
- Transformar as `weapons` em uma tabela ao inves de um enum dentro do código
