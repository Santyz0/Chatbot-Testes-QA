/// <reference types="cypress" />
describe('Fluxo Completo: Agente de IA', () => {
  
  it('Deve aguardar todo o carregamento inicial, criar um novo chat e enviar uma conta matemática', () => {
    
    // 1. Interceptamos AS DUAS rotas que o React chama ao abrir a página
    cy.intercept('GET', '**/sessions').as('carregaSessoes');
    cy.intercept('GET', '**/messages').as('carregaMensagens');

    cy.visit('http://localhost:5173');

    // 2. Esperamos a lista lateral carregar
    cy.wait('@carregaSessoes');
    
    // 3. Esperamos o histórico do chat mais recente (a lasanha) carregar na tela principal
    cy.wait('@carregaMensagens');

    // 4. AGORA SIM! A página terminou tudo o que tinha para carregar. Podemos agir.
    cy.contains('button', 'novo chat', { matchCase: false }).click();

    // 5. Digita a mensagem
    cy.get('input').clear().type('Calcule para mim quanto é 10 + 15');

    // 6. Clica em enviar
    cy.contains('button', 'enviar', { matchCase: false }).click();

    // 7. Confirmações
    cy.contains('Calcule para mim quanto é 10 + 15').should('be.visible');
    cy.contains('25').scrollIntoView().should('be.visible');
  });

});