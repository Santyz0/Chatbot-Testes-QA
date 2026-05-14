// dbUtils.test.js
const Database = require('better-sqlite3');
const { criarSessao } = require('./dbUtils');

describe("Testes Unitários - Banco de Dados SQLite", () => {
  let dbMemoria;

  // Roda UMA VEZ antes de todos os testes começarem
  beforeAll(() => {
    // O ':memory:' avisa o SQLite para não criar um arquivo .db, mas usar a RAM
    dbMemoria = new Database(':memory:');
    
    // Criamos a tabela idêntica à do projeto real
    dbMemoria.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  // Roda UMA VEZ no final de tudo para limpar a memória
  afterAll(() => {
    dbMemoria.close();
  });

  it("Deve criar uma sessão com sucesso no banco de dados", () => {
    // 1. Executamos a nossa função passando o banco da memória
    const sucesso = criarSessao(dbMemoria, "sessao-qa-123");
    
    // 2. Garantimos que a função não deu erro
    expect(sucesso).toBe(true);

    // 3. Vamos no banco de dados verificar se a linha realmente está lá!
    const sessaoSalva = dbMemoria.prepare('SELECT * FROM sessions WHERE id = ?').get("sessao-qa-123");
    
    expect(sessaoSalva).not.toBeUndefined();
    expect(sessaoSalva.id).toBe("sessao-qa-123");
  });

  it("Deve retornar falso se tentarmos criar duas sessões com o mesmo ID (Primary Key)", () => {
    // Tentamos inserir a mesma sessão do teste anterior
    const sucesso = criarSessao(dbMemoria, "sessao-qa-123");
    
    // Como 'id' é PRIMARY KEY, o SQLite vai bloquear e nossa função deve retornar false
    expect(sucesso).toBe(false);
  });

});