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
.
├── .github/workflows/ci.yml     # pipeline de CI
├── cypress/                      # configuração e testes
│   ├── e2e/                      # testes (*.cy.js)
│   ├── fixtures/                 # dados de teste
│   └── support/                  # comandos e utilitários
├── reports/                      # relatórios gerados
│   └── cypress/                  # saída do Mochawesome
│       ├── assets/               # recursos (imagens, CSS)
│       └── *.html                # relatórios HTML
├── cypress.config.js             # configuração do Cypress
├── package.json                  # dependências e scripts
├── package-lock.json             # lockfile das dependências
├── .gitignore                    # arquivos ignorados pelo Git
└── README.md                     # documentação principal
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

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.19.3'
      - run: npm ci
      - run: npm run test:cypress
      - uses: actions/upload-artifact@v3
        with:
          name: cypress-html-report
          path: reports/cypress/*.html
```

## Pontos de Atenção
