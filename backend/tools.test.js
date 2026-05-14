const tools = require('./tools');

describe("Testes Unitários - Função Calculate", () => {
  // ... seus testes da calculadora continuam aqui ...
  it("Deve calcular uma soma simples corretamente", () => {
    const resultado = tools.calculate("10 + 15");
    expect(resultado).toBe("25");
  });
});

// 🟢 NOVO TESTE UNITÁRIO AQUI:
describe("Testes Unitários - Função getTime", () => {
  
  beforeAll(() => {
    // Nós "congelamos" o relógio do Node.js para uma data fictícia fixa
    // Vamos usar a data do ano novo de 2026 como exemplo
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterAll(() => {
    // É fundamental devolver o relógio ao normal no final do teste
    jest.useRealTimers();
  });

  it("Deve retornar uma string contendo a data atual congelada", () => {
    const resultado = tools.getTime();
    
    // Como congelamos no ano de 2026, temos certeza absoluta que "2026" estará no texto
    expect(resultado).toContain("2026");
    
    // Garantimos que a função não quebrou e retornou um texto
    expect(typeof resultado).toBe("string");
  });
});