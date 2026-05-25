// dbUtils.test.js
const Database = require('better-sqlite3');
const { criarSessao } = require('./dbUtils');

describe("Testes Unitários - Banco de Dados SQLite", () => {
  let dbMemoria;

  // Roda UMA VEZ antes de todos os testes começarem
  beforeAll(() => {
    
    dbMemoria = new Database(':memory:');
    
    
    dbMemoria.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  
  afterAll(() => {
    dbMemoria.close();
  });

  it("Deve criar uma sessão com sucesso no banco de dados", () => {
    const sucesso = criarSessao(dbMemoria, "sessao-qa-123");
    
    expect(sucesso).toBe(true);

    const sessaoSalva = dbMemoria.prepare('SELECT * FROM sessions WHERE id = ?').get("sessao-qa-123");
    
    expect(sessaoSalva).not.toBeUndefined();
    expect(sessaoSalva.id).toBe("sessao-qa-123");
  });

  it("Deve retornar falso se tentarmos criar duas sessões com o mesmo ID (Primary Key)", () => {
   
    const sucesso = criarSessao(dbMemoria, "sessao-qa-123");
    
    // Como 'id' é PRIMARY KEY, o SQLite vai bloquear e nossa função deve false
    expect(sucesso).toBe(false);
  });

});