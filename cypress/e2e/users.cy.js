import { generateUsers, generateName, generateEmail }  from "../support/faker";
import { isValidEmail, isValidName } from "../support/utils/validators";

describe('Testes de CRUD para /users', () => {
  describe('GET /users - Buscar usuários', () => {
    it('Deve retornar status 200 ao listar usuários com campos válidos', () => {
      // Faz a requisição para listar todos os usuários;
      // Verifica se o status retornado é 200;
      // Verifica se cada usuário contém id, name e email;
      // Valida se nome e email seguem formato esperado;
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        response.body.forEach(user => {
          expect(user).to.have.all.keys('id', 'name', 'email');
          expect(isValidEmail(user.email)).to.be.true;
          expect(isValidName(user.name)).to.be.true;
        });
      });
    });

    it('Deve retornar status 200 ao buscar usuário por ID existente', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona um usuário aleatório da lista;
      // Faz a requisição para buscar o usuário pelo ID;
      // Verifica se o status retornado é 200;
      // Verifica se os dados retornados correspondem ao usuário selecionado;
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const randomUser = response.body[Math.floor(Math.random() * response.body.length)];
        cy.request('GET', `/users/${randomUser.id}`).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.include({
            id: randomUser.id,
            name: randomUser.name,
            email: randomUser.email
          });
        });
      });
    });

    it('Deve retornar status 404 ao buscar usuário inexistente', () => {
      // Faz a requisição para listar todos os usuários;
      // Determina um ID maior que o último existente;
      // Faz a requisição para buscar usuário com ID inexistente;
      // Verifica se o status retornado é 404;
      // Verifica se a mensagem de erro informa 'User not found.';
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const lastId = Math.max(...response.body.map(u => u.id));
        const nonexistentId = lastId + 1;
        cy.request({
          method: 'GET',
          url: `/users/${nonexistentId}`,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body).to.have.property('error', 'User not found.');
        });
      });
    });
  });

  describe('POST /users - Criar usuários', () => {
    it('Deve retornar status 201 ao criar usuário com dados válidos', () => {
      // Gera dados válidos para um novo usuário;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 201;
      // Verifica se o usuário criado contém id, name e email;
      // Verifica se os dados retornados correspondem aos enviados;
      const user = generateUsers();
      cy.request('POST', '/users', user).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.all.keys('id', 'name', 'email');
        expect(response.body).to.include({
          name: user.name,
          email: user.email
        });
      });
    });

    it('Deve retornar status 400 ao criar usuário com nome válido e email vazio', () => {
      // Gera um nome válido e define email vazio;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      const invalidUser = {
        name: generateName(),
        email: ''
      };
      cy.request({
        method: 'POST',
        url: '/users',
        body: invalidUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'The fields name and email are required.');
      });
    });

    it('Deve retornar status 400 ao criar usuário com nome e email vazios', () => {
      // Define name e email vazios;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      const invalidUser = { name: '', email: '' };
      cy.request({
        method: 'POST',
        url: '/users',
        body: invalidUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'The fields name and email are required.');
      });
    });

    it('Deve retornar status 409 ao criar usuário com nome e email já existentes', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona um usuário existente;
      // Faz a requisição para criar usuário com mesmo name e email;
      // Verifica se o status retornado é 409;
      // Verifica se a mensagem de erro indica duplicidade;
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const existingUser = response.body[Math.floor(Math.random() * response.body.length)];
        cy.request({
          method: 'POST',
          url: '/users',
          body: { name: existingUser.name, email: existingUser.email },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body).to.have.property('error', 'A user with this name or email already exists.');
        });
      });
    });

    it('Deve retornar status 409 ao criar usuário com nome duplicado e email novo', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona um nome existente;
      // Gera um email novo;
      // Faz a requisição para criar usuário com nome duplicado e email novo;
      // Verifica se o status retornado é 409;
      // Verifica se a mensagem de erro indica duplicidade;
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const duplicatedName = response.body[Math.floor(Math.random() * response.body.length)].name;
        const newEmail = generateEmail();
        cy.request({
          method: 'POST',
          url: '/users',
          body: { name: duplicatedName, email: newEmail },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body).to.have.property('error', 'A user with this name or email already exists.');
        });
      });
    });

    it('Deve retornar status 409 ao criar usuário com email duplicado e nome novo', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona um email existente;
      // Gera um nome novo;
      // Faz a requisição para criar usuário com email duplicado e nome novo;
      // Verifica se o status retornado é 409;
      // Verifica se a mensagem de erro indica duplicidade;
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const duplicatedEmail = response.body[Math.floor(Math.random() * response.body.length)].email;
        const newName = generateName();
        cy.request({
          method: 'POST',
          url: '/users',
          body: { name: newName, email: duplicatedEmail },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body).to.have.property('error', 'A user with this name or email already exists.');
        });
      });
    });

    it('Deve retornar status 400 ao criar usuário com nome vazio e email válido', () => {
      // Define name vazio e gera um email válido;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      const invalidUser = { name: '', email: generateEmail() };
      cy.request({
        method: 'POST',
        url: '/users',
        body: invalidUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'The fields name and email are required.');
      });
    });

    it('Deve retornar status 400 ao criar usuário com caracteres especiais nos campos', () => {
      // Define name e email com caracteres especiais;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      const invalidUser = {
        name: '!@#$%^&*()_+={}[]|\":;"<>,.?/~',
        email: '()<>[]:;@\\,.'
      };
      cy.request({
        method: 'POST',
        url: '/users',
        body: invalidUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'The fields name and email are required.');
      });
    });

    it('Deve retornar status 400 ao criar usuário com espaços nos campos', () => {
      // Define name e email apenas com espaços;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      const invalidUser = { name: ' ', email: ' ' };
      cy.request({
        method: 'POST',
        url: '/users',
        body: invalidUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'The fields name and email are required.');
      });
    });

    it('Deve retornar status 400 ao criar usuário simulando SQL Injection', () => {
      // Define name e email simulando SQL Injection;
      // Faz a requisição para criar o usuário;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      const invalidUser = { name: 'SELECT * FROM Users;', email: 'DROP TABLE users;' };
      cy.request({
        method: 'POST',
        url: '/users',
        body: invalidUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'The fields name and email are required.');
      });
    });
  });

  describe('PUT /users - Atualizar usuários', () => {
    it('Deve retornar status 200 ao atualizar usuário existente com dados válidos', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona um usuário aleatório;
      // Define novos dados válidos para atualização;
      // Faz a requisição para atualizar o usuário pelo ID;
      // Verifica se o status retornado é 200;
      // Verifica se o usuário foi atualizado corretamente;
      // Verifica se a resposta contém mensagem de sucesso;
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const user = response.body[Math.floor(Math.random() * response.body.length)];
        const updatedData = { name: 'Joao dos Testes', email: 'joaodostestes@gmail.com' };
        cy.request({
          method: 'PUT',
          url: `/users/${user.id}`,
          body: updatedData
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.user).to.include({
            id: user.id,
            name: updatedData.name,
            email: updatedData.email
          });
          expect(res.body).to.have.property('message', 'User updated successfully.');
        });
      });
    });

    it('Deve retornar status 404 ao atualizar ID inexistente', () => {
      // Faz a requisição para listar todos os usuários;
      // Determina um ID inexistente maior que o último;
      // Gera dados válidos para atualização;
      // Faz a requisição para atualizar com ID inexistente;
      // Verifica se o status retornado é 404;
      // Verifica se a mensagem de erro informa 'User not found.';
      const validData = { name: generateName(), email: generateEmail() };
      cy.request('GET', '/users').then((response) => {
        expect(response.status).to.eq(200);
        const lastId = Math.max(...response.body.map(u => u.id));
        const nonexistentId = lastId + 1;
        cy.request({
          method: 'PUT',
          url: `/users/${nonexistentId}`,
          body: validData,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body).to.have.property('error', 'User not found.');
        });
      });
    });

    it('Deve retornar status 400 ao atualizar usuário com dados inválidos', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona um usuário existente;
      // Define nome e email vazios;
      // Faz a requisição para atualizar o usuário pelos novos dados;
      // Verifica se o status retornado é 400;
      // Verifica se a mensagem de erro indica campos obrigatórios;
      cy.request('GET', '/users').then((response) => {
        const user = response.body[0];
        const invalidData = { name: '', email: '' };
        cy.request({
          method: 'PUT',
          url: `/users/${user.id}`,
          body: invalidData,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body).to.have.property('error', 'The fields name and email are required.');
        });
      });
    });

    it('Deve retornar status 409 ao atualizar usuário causando duplicidade', () => {
      // Faz a requisição para listar todos os usuários;
      // Seleciona dois usuários distintos;
      // Tenta atualizar o primeiro com dados do segundo;
      // Verifica se o status retornado é 409;
      // Verifica se a mensagem de erro indica duplicidade;
      cy.request('GET', '/users').then((response) => {
        const [userA, userB] = response.body;
        cy.request({
          method: 'PUT',
          url: `/users/${userA.id}`,
          body: { name: userB.name, email: userB.email },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body).to.have.property('error', 'A user with this name or email already exists.');
        });
      });
    });
  });

  describe('DELETE /users - Excluir usuários', () => {
    it('Deve retornar status 200 ao excluir usuário existente', () => {
      // Gera dados válidos para um novo usuário;
      // Faz a requisição para criar o usuário;
      // Faz a requisição para excluir o usuário criado;
      // Verifica se o status retornado é 200;
      // Verifica se a resposta contém mensagem de sucesso;
      // Verifica se os dados retornados correspondem ao usuário deletado;
      const user = generateUsers();
      cy.request('POST', '/users', user).then((resPost) => {
        cy.request('DELETE', `/users/${resPost.body.id}`).then((resDel) => {
          expect(resDel.status).to.eq(200);
          expect(resDel.body).to.have.property('message', 'User deleted successfully.');
          expect(resDel.body.user).to.include({
            id: resPost.body.id,
            name: user.name,
            email: user.email
          });
        });
      });
    });

    it('Deve retornar status 404 ao excluir usuário inexistente', () => {
      // Faz a requisição para listar todos os usuários;
      // Determina um ID maior que o último existente;
      // Faz a requisição para excluir usuário com ID inexistente;
      // Verifica se o status retornado é 404;
      // Verifica se a mensagem de erro informa 'User not found.';
      cy.request('GET', '/users').then((response) => {
        const lastId = Math.max(...response.body.map(u => u.id));
        const nonexistentId = lastId + 1;
        cy.request({
          method: 'DELETE',
          url: `/users/${nonexistentId}`,
          failOnStatusCode: false
        }).then((resDel) => {
          expect(resDel.status).to.eq(404);
          expect(resDel.body).to.have.property('error', 'User not found.');
        });
      });
    });
  });
});
