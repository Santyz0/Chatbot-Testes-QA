const tools = require('./tools');

describe("Testes Unitários - Função Calculate", () => {
  
  it("Deve calcular uma soma simples corretamente", () => {
    const resultado = tools.calculate("10 + 15");
    expect(resultado).toBe("25");
  });
});


describe("Testes Unitários - Função getTime", () => {
  
  beforeAll(() => {
    
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterAll(() => {
    
    jest.useRealTimers();
  });

  it("Deve retornar uma string contendo a data atual congelada", () => {
    const resultado = tools.getTime();
    
    
    expect(resultado).toContain("2026");
    
    
    expect(typeof resultado).toBe("string");
  });
});