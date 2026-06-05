# Gestão de Frota - Backend

API corporativa de gestão de frota construída com NestJS, TypeORM, SQL Server, Redis, MongoDB, RabbitMQ e JWT.

## Recursos implementados

- Arquitetura modular com NestJS e TypeORM
- Autenticação JWT com `passport-jwt`
- Cache Redis para listagem de veículos
- Auditoria MongoDB para operações de veículos
- Publicação de eventos RabbitMQ para alterações em veículos
- Migrations TypeORM versionadas
- Validação de payload com `class-validator`
- Proteções de segurança: Helmet, Rate Limit, CORS
- Swagger disponível em `/docs`
- Healthcheck em `/api/v1/health`
- Versionamento de API com `v1`

## Instalação

```bash
npm install
```

## Configuração de ambiente

Edite o arquivo `.env` com os valores do seu ambiente.

Variáveis principais:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `REDIS_HOST`, `REDIS_PORT`, `CACHE_TTL`
- `MONGODB_URI`
- `RABBITMQ_URL`
- `RATE_LIMIT_TTL`, `RATE_LIMIT_MAX`

> Se estiver usando Docker Compose, o projeto também pode carregar essas variáveis automaticamente a partir do arquivo `.env`.

## Execução local

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000` e os endpoints em `http://localhost:3000/api/v1`.

## Docker

```bash
docker compose up --build
```

Após a inicialização, valide o app em `http://localhost:3000/api/v1/health`.

## Postman

O projeto inclui arquivos para importação no Postman:

- `postman/frota_collection.json`
- `postman/frota_environment.json`

### Importação recomendada

1. Importe `postman/frota_collection.json` como Collection.
2. Importe `postman/frota_environment.json` como Environment.
3. Selecione o environment `Frota Local`.
4. Verifique que `baseUrl` está definido como `http://localhost:3000`.
5. Rode primeiro `Health` e depois `Auth - Login`.

## Ordem de testes sugerida

1. `GET /api/v1/health`
2. `POST /api/v1/auth/login`
3. `GET /api/v1/brands`
4. `POST /api/v1/brands`
5. `GET /api/v1/models`
6. `POST /api/v1/models`
7. `GET /api/v1/vehicles`
8. `POST /api/v1/vehicles`
9. `GET /api/v1/vehicles/:id`
10. `PATCH /api/v1/vehicles/:id`
11. `DELETE /api/v1/vehicles/:id`

## Endpoints principais e formatos esperados

### Autenticação

- `POST /api/v1/auth/login`

Body JSON:

```json
{
  "email": "testel@example.com",
  "password": "testel123"
}
```

Resposta esperada:

```json
{
  "access_token": "..."
}
```

### Marcas

- `GET /api/v1/brands`
- `POST /api/v1/brands`

Body JSON:

```json
{
  "name": "Scania",
  "created_by": "testel123"
}
```

### Modelos

- `GET /api/v1/models`
- `POST /api/v1/models`

Body JSON:

```json
{
  "name": "R 450",
  "brand_id": "<BRAND_ID>",
  "created_by": "testel123"
}
```

### Veículos

- `GET /api/v1/vehicles`
- `POST /api/v1/vehicles`
- `GET /api/v1/vehicles/:id`
- `PATCH /api/v1/vehicles/:id`
- `DELETE /api/v1/vehicles/:id`

Body JSON para criação de veículo:

```json
{
  "license_plate": "ABC1D25",
  "chassis": "9BWZZZ377VT004000",
  "renavam": "12345678900",
  "year": 2026,
  "model_id": "<MODEL_ID>",
  "created_by": "testel123"
}
```

Body JSON para atualização de veículo (exemplo apenas ano):

```json
{
  "id":"77D3423E-F36B-1410-8A2E-006D25680754",
  "license_plate":"XYZ9T97",
  "chassis":"1ZKZZZ377VT003333",
  "renavam":"12999991234",
  "year":2025,
  "model_id":"80A8433E-F36B-1410-8A2B-006D25680754"
}
```

## Alterações importantes realizadas

- Ajustado o retorno de sucesso dos endpoints de criação de `brands`, `models` e `vehicles` para responder com:
  - `success: true`
  - `message`
  - `data`
- Corrigido bug em `PATCH /api/v1/vehicles/:id` para que a validação de duplicação de `license_plate`, `renavam` e `chassis` seja executada somente quando esses campos são enviados.
- Ajustado o fluxo de testes Postman para garantir que o token seja preenchido e usado corretamente.
- Descrição mais clara dos testes em sequência para evitar erros de formato e de rota.

## Observações de validação

- `POST /api/v1/brands` exige `name` e `created_by`.
- `POST /api/v1/models` exige `name`, `brand_id` e `created_by`.
- `POST /api/v1/vehicles` exige `license_plate`, `chassis`, `renavam`, `year`, `model_id` e `created_by`.
- `PATCH /api/v1/vehicles/:id` pode aceitar apenas o campo `year` sem validar duplicação se os outros campos não forem enviados.

## Migrations

Gerar nova migration:

```bash
npm run migration:generate -- <MigrationName>
```

Executar migrations:

```bash
npm run migration:run
```

## Seeds

Carregar dados iniciais:

```bash
npm run seed:vehicles
```

O arquivo `seed_vehicles.json` contém dados de marcas, modelos e veículos para carga inicial.

## Testes

Unitários e integração:

```bash
npm test -- --runInBand
```

Configuração local para testes

- Instale as definições de tipo do Jest (uma vez):

```bash
npm install --save-dev @types/jest
```

- Garanta que o `tsconfig.json` inclua `jest` em `compilerOptions.types` (ex.: `"types": ["node", "jest"]`).

- Rode os testes em modo desenvolvimento:

```bash
npm test -- --runInBand
```

- Se o editor (VS Code) continuar mostrando erros como `Cannot find name 'describe'`, reinicie o TypeScript Server (Command Palette → "TypeScript: Restart TS server") ou reinicie o editor.


E2E:

```bash
npm run test:e2e
```

## Swagger

Documentação disponível em:

`http://localhost:3000/docs`

## Observações finais

- A aplicação não utiliza `synchronize: true`; o banco é gerenciado por migrations.
- O cache Redis é invalidado ao criar, atualizar ou remover veículos.
- As respostas de erro são padronizadas com `success`, `message`, `details`, `timestamp` e `path`.
