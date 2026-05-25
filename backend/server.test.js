const request = require("supertest");


const API_URL = "http://localhost:3001";

describe("QA Backend - Testes da API", () => {
  let sessionIdCriada;

  // TESTE 1
  it("1. Deve listar as sessões (vazias ou existentes) com sucesso", async () => {
    const response = await request(API_URL).get("/sessions");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // TESTE 2
  it("2. Deve enviar uma mensagem, salvar no banco e receber resposta", async () => {
    const response = await request(API_URL)
      .post("/chat")
      .send({ message: "Olá, IA, apenas um teste automatizado." });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("reply");
    expect(response.body).toHaveProperty("sessionId");
    
    
    sessionIdCriada = response.body.sessionId; 
  }, 15000); 

  // TESTE 3
  it("3. Deve deletar a sessão de teste recém-criada", async () => {
    if (!sessionIdCriada) throw new Error("A sessão não foi criada no teste anterior.");

    const response = await request(API_URL).delete(`/sessions/${sessionIdCriada}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);

    
    const checkResponse = await request(API_URL).get(`/sessions/${sessionIdCriada}/messages`);
    expect(checkResponse.body.length).toBe(0);
  });
});