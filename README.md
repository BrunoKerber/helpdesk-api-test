# Helpdesk API Test

Testes automatizados de API REST para os endpoints `/users` e `/tickets`, para uma api de Helpdesk.

## Tecnologias e Versões

- **Node.js**: 20.19.3
- **npm**: 9.8.1
- **Cypress**: 14.5.1
- **Mochawesome**: 7.1.3
- **mochawesome-merge**: 5.0.0
- **mochawesome-report-generator**: 6.2.0
- **@faker-js/faker**: 9.9.0

## Estrutura de Pastas

```
.github/
└── workflows/
    └── ci.yml                # pipeline de CI

cypress/
├── e2e/                      # testes (*.cy.js)
│   ├── tickets.cy.js
│   └── users.cy.js
├── fixtures/                 
│   └── example.json
└── support/
    ├── commands.js           # custom commands do Cypress
    ├── e2e.js                # hooks globais
    └── utils/                # funções auxiliares
        ├── validators.js
        ├── faker.js
        └── ...

reports/                       # gerado pelo script de relatório
└── cypress/
    ├── assets/               
    └── *.html                # relatórios Mochawesome

cypress.config.js             # configuração do Cypress
package.json                  # dependências e scripts
package-lock.json             # lockfile
.gitignore                    # o que não vai para o Git
README.md                     # documentação principal

```

## Instalação e Execução

1. Clone o repositório da API (servidor):

```bash
git clone https://github.com/automacaohml/helpdesk-api.git
cd helpdesk-api
```

2. Instale as dependências do servidor e rode-o:

```bash
npm install
npm start
```

3. Abra um novo terminal, clone este repositório de testes e acesse a pasta:

```bash
git clone git clone https://github.com/BrunoKerber/helpdesk-api-test.git
cd helpdesk-api-test
```

4. Instale as dependências de teste com versões exatas:

```bash
npm install --save-dev \
  cypress@14.5.1 \
  mochawesome@7.1.3 \
  mochawesome-merge@5.0.0 \
  mochawesome-report-generator@6.2.0 \
  @faker-js/faker@9.9.0
```

5. Execute os testes:

- **Headless e geração de HTML**

  ```bash
  npm run test:cypress
  ```

- **Modo interativo**

  ```bash
  npx cypress open
  ```

## Scripts Disponíveis

| Comando                    | Descrição                                         |
| -------------------------- | ------------------------------------------------- |
| `npm run test:cypress`     | Executa Cypress (reporter: mochawesome, html)     |
| `npm run test:full-report` | (Opcional) encadeia merge e geração se necessário |

## CI com GitHub Actions

Arquivo: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: ["main"]
  pull_request:
  workflow_dispatch:

jobs:
  cypress-tests:
    runs-on: ubuntu-latest

    steps:
      # 1) Checkout deste repositório de testes
      - name: Checkout Tests
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      # 2) Clone o servidor Helpdesk API
      - name: Clone API Server
        run: git clone https://github.com/automacaohml/helpdesk-api.git server

      # 3) Cache de dependências do servidor
      - name: Cache server dependencies
        uses: actions/cache@v3
        with:
          path: server/node_modules
          key: server-deps-${{ hashFiles('server/package-lock.json') }}
          restore-keys: server-deps-

      # 4) Cache de dependências dos testes
      - name: Cache test dependencies
        uses: actions/cache@v3
        with:
          path: node_modules
          key: test-deps-${{ hashFiles('package-lock.json') }}
          restore-keys: test-deps-

      # 5) Setup Node.js (Node 22 para atender mochawesome-merge)
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 22.x

      # 6-8) Instalar deps, iniciar API e rodar Cypress
      - name: Install deps, start API and run Cypress
        env:
          TERM: xterm
        run: |
          # ----- dependências dos testes (raiz) -----
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi

          # ----- dependências do servidor -----
          if [ -f server/package-lock.json ]; then
            (cd server && npm ci)
          else
            (cd server && npm install)
          fi

          # ----- inicia API em segundo plano -----
          (cd server && node server.js &)   

          # ----- espera a porta 3000 abrir -----
          npx wait-on tcp:3000 --timeout 60000

          # ----- executa Cypress -----
          npm run test:cypress

      # 9) Upload do relatório HTML
      - name: Upload HTML Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-html-report
          path: reports/cypress/*.html
```

## Observações
- Foi criado no projeto o arquivo ci.yml que configura pipeline no github actions, que ao realizar o commit será
realizada a execução dos testes. As falhas nos testes não indicam problemas na automação, mas sim pontos em que 
necessitam de correção, ou o comportamento não é o esperado a nível de negócio.


## Pontos de Melhoria
- Adicionar autenticação para chamar os serviços.
- Ajustar os serviços considerando mensagens mais apropriadas e status code corretos.
- Ajustar os serviços receberem somente os dados corretos, pois aceita nome inválido, email inválido e afins.
- Cuidar, pois os serviços estão passíveis de SQL Injection;
- Existem cenários em que se duplica ID. Que no caso é no serviço /users que quando excluimos(DEL) um user, ao
 inserir um user novo (POST), é gerada a duplicidade de ID retornada no (GET).
- Ajustar serviços a fim de evitar duplicidades que está sendo possível. Tanto de users, quanto de tickets.
- Serviço de tickets poderiam possuir um título.
- Serviço de tickets permite inserir qualquer status.
- Adicionar filtros e paginação nos serviços, pois dependendo da quantidade de registros, pode se ter problema
de performance.





## Próximos Passos
- Implementação de page-object no projeto que trará uma melhora significativa para o projeto.
