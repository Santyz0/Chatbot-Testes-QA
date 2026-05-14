const request = require("supertest");

// Vamos apontar para o servidor que já estará rodando
const API_URL = "http://localhost:3001";

describe("QA Backend - Testes da API", () => {
  let sessionIdCriada;

  // TESTE 1: Garantir que o banco de dados lista as conversas
  it("1. Deve listar as sessões (vazias ou existentes) com sucesso", async () => {
    const response = await request(API_URL).get("/sessions");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // TESTE 2: Simular o chat e a IA
  it("2. Deve enviar uma mensagem, salvar no banco e receber resposta", async () => {
    const response = await request(API_URL)
      .post("/chat")
      .send({ message: "Olá, IA, apenas um teste automatizado." });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("reply");
    expect(response.body).toHaveProperty("sessionId");
    
    // Guardamos o ID dessa conversa teste para apagá-la no próximo passo
    sessionIdCriada = response.body.sessionId; 
  }, 15000); // Timeout de 15s para dar tempo da API da Groq responder

  // TESTE 3: Garantir que a exclusão funciona
  it("3. Deve deletar a sessão de teste recém-criada", async () => {
    if (!sessionIdCriada) throw new Error("A sessão não foi criada no teste anterior.");

    const response = await request(API_URL).delete(`/sessions/${sessionIdCriada}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);

    // Valida se as mensagens sumiram do banco de dados
    const checkResponse = await request(API_URL).get(`/sessions/${sessionIdCriada}/messages`);
    expect(checkResponse.body.length).toBe(0);
  });
});