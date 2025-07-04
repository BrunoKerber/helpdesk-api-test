import { generateUsers, generateName } from "../support/faker";

describe('Testes de CRUD para /tickets', () => {
  let createdUser;
  let createdTicket;
  const statusOptions = ['Open', 'In Progress', 'Closed'];

  // Cria um usuário válido para os testes de ticket
  before(() => {
    const user = generateUsers();
    cy.request('POST', '/users', user).then((res) => {
      expect(res.status).to.eq(201);
      createdUser = res.body;
    });
  });

  describe('GET /tickets - Buscar tickets', () => {
    it('Deve retornar status 200 ao buscar ticket existente por ID', () => {
      // Cria ticket para garantir consulta válida;
      // Busca o ticket criado pelo ID;
      // Verifica se o status retornado é 200;
      // Verifica os campos do ticket retornado;
      const description = generateName();
      cy.request('POST', '/tickets', { userId: createdUser.id, description }).then((resCreate) => {
        expect(resCreate.status).to.eq(201);
        createdTicket = resCreate.body;
        cy.request('GET', `/tickets/${createdTicket.id}`).then((resGet) => {
          expect(resGet.status).to.eq(200);
          expect(resGet.body).to.have.all.keys('id', 'userId', 'description', 'status', 'createdAt');
          expect(resGet.body).to.include({
            id: createdTicket.id,
            userId: createdUser.id,
            description: createdTicket.description,
            status: createdTicket.status
          });
        });
      });
    });

    it('Deve retornar status 404 ao buscar ticket inexistente', () => {
      // Busca por um ID inexistente;
      // Verifica se retorna status 404 e mensagem esperada;
      const nonexistentId = Date.now();
      cy.request({
        method: 'GET',
        url: `/tickets/${nonexistentId}`,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property('error', 'Ticket not found.');
      });
    });
  });

  describe('POST /tickets - Criar tickets', () => {
    it('Deve retornar status 201 ao criar ticket com dados válidos', () => {
      // Prepara payload válido para um novo ticket;
      // Faz a requisição para criar o ticket;
      // Verifica se o status retornado é 201;
      // Verifica os campos do ticket criado;
      const newTicket = { userId: createdUser.id, description: generateName() };
      cy.request('POST', '/tickets', newTicket).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.all.keys('id', 'userId', 'description', 'status', 'createdAt');
        expect(res.body).to.include({
          userId: newTicket.userId,
          description: newTicket.description,
          status: 'Open'
        });
        createdTicket = res.body;
      });
    });

    it('Deve retornar status 400 ao criar ticket sem userId', () => {
      // Prepara payload sem userId;
      // Faz a requisição para criar ticket;
      // Verifica se o status retornado é 400;
      // Verifica mensagem de erro de campos obrigatórios;
      const invalidTicket = { description: generateName() };
      cy.request({
        method: 'POST',
        url: '/tickets',
        body: invalidTicket,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.property('error', 'The fields userId and description are required.');
      });
    });

    it('Deve retornar status 400 ao criar ticket sem description', () => {
      // Prepara payload sem description;
      // Faz a requisição para criar ticket;
      // Verifica se o status retornado é 400;
      // Verifica mensagem de erro de campos obrigatórios;
      const invalidTicket = { userId: createdUser.id };
      cy.request({
        method: 'POST',
        url: '/tickets',
        body: invalidTicket,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.property('error', 'The fields userId and description are required.');
      });
    });

    it('Deve retornar status 404 ao criar ticket com userId inexistente', () => {
      // Prepara payload com userId inexistente;
      // Faz a requisição para criar ticket;
      // Verifica se o status retornado é 404;
      // Verifica mensagem de erro indicando referência a usuário inexistente;
      const invalidTicket = { userId: Date.now(), description: generateName() };
      cy.request({
        method: 'POST',
        url: '/tickets',
        body: invalidTicket,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.error.toLowerCase()).to.include('user');
      });
    });
  });

  describe('PUT /tickets/:id/status - Atualizar tickets', () => {
    it('Deve retornar status 200 ao atualizar status do ticket existente', () => {
      // Seleciona status aleatório para atualização;
      // Faz a requisição para atualizar status do ticket;
      // Verifica se retorna status 200 e mensagem de sucesso;
      // Verifica se o ticket foi atualizado corretamente;
      const updatedStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      cy.request('PUT', `/tickets/${createdTicket.id}/status`, { status: updatedStatus })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('message', 'Ticket status updated successfully.');
        expect(res.body.ticket).to.have.property('status', updatedStatus);
      });
    });

    it('Deve retornar status 404 ao tentar atualizar o ticket com status inválido', () => {
      // Define status como "null" para simular envio inválido
      // Faz a requisição para atualizar o status do ticket com valor "null"
      // Verifica se retorna status 404 e mensagem de erro;
      const statusInvalid = "null";

      cy.request({
        method: 'PUT',
        url: `/tickets/${createdTicket.id}/status`,
        body: { status: statusInvalid },
        failOnStatusCode: false
      }).then((res) => {    
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property('message', 'Ticket not found.');
        expect(res.body).to.not.have.property('ticket');
      });
    });


    it('Deve retornar status 404 ao atualizar ticket inexistente', () => {
      // Tenta atualizar status para um ticket inexistente;
      // Verifica se retorna status 404 e mensagem de erro;
      const nonexistentId = Date.now();
      cy.request({
        method: 'PUT',
        url: `/tickets/${nonexistentId}/status`,
        body: { status: 'Closed' },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property('error', 'Ticket not found.');
      });
    });
  });

  describe('DELETE /tickets/:id - Excluir tickets', () => {
    it('Deve retornar status 200 ao excluir ticket existente', () => {
      // Faz a requisição para excluir ticket existente;
      // Verifica se o status retornado é 200;
      // Verifica mensagem de sucesso;
      cy.request('DELETE', `/tickets/${createdTicket.id}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('message', 'Ticket deleted successfully.');
      });
    });

    it('Deve retornar status 404 ao excluir ticket inexistente', () => {
      // Faz a requisição para excluir ticket com ID inexistente;
      // Verifica se retorna status 404 e mensagem esperada;
      const nonexistentId = Date.now();
      cy.request({
        method: 'DELETE',
        url: `/tickets/${nonexistentId}`,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property('error', 'Ticket not found.');
      });
    });
  });
});
