# Chatbot IA + Testes de Qualidade

### Tecnologias Utilizadas
Front-end: React, Vite, TypeScript, CSS3 (com layout customizado em tela cheia centralizada).

Back-end: Node.js, Express, SQLite3.

IA: Groq Cloud SDK.

Suíte de Testes: Vitest, React Testing Library, Cypress (E2E).

#

### ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- ![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)


- Uma chave de acesso válida à API da Groq Cloud.


#

### 🚀 Instalação e Execução (Passo a Passo)
- Clonar o Repositório

    ```
    git clone <url-do-seu-repositorio> <br>
    cd Chatbot-Testes-QA
    ```
- Configurar e Rodar o Back-end
Entre na pasta do servidor:

    ```
    cd backend
    ```
- Instale as dependências necessárias:

    ```
    npm install
    ```




- Abra o arquivo .env e insira a sua chave secreta da Groq:

  ```
  GROQ_API_KEY=sua_chave_do_groq_aqui
  PORT=3001
  ```

- Inicie o servidor:
  ```
  npm start
  ```

> [Nota] : 
<br> Ao iniciar, o código verifica automaticamente se o arquivo chat.db existe. Caso não exista, o SQLite criará o banco e as tabelas necessárias na hora.

- Configurar e Rodar o Front-end

Abra um novo terminal na raiz do projeto e acesse a pasta da interface:

  ```
  cd front/agente
  ```
- Instale as dependências:

```
npm install
```
- Inicie o servidor de desenvolvimento do Vite:

```
npm run dev
```
Acesse a aplicação através do endereço local fornecido (geralmente http://localhost:5173).

### 🗃️ Modelagem do Banco de Dados (SQLite)
O banco de dados é gerado dinamicamente na inicialização do servidor com a seguinte estrutura relacional estável:

```
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

### 🧪 Suíte de Testes Automatizados

O projeto implementa com rigor a Pirâmide de Testes de Software, garantindo alta confiabilidade e blindagem contra bugs.

#### Testes de Componente e Interface (Front-end) <br>
Valida o comportamento isolado dos componentes React, simulação de digitação e renderização sem quebras.

Ferramentas: Vitest, React Testing Library.

Como rodar: Acesse front/agente e execute:

```
npm test
```

#### Testes de Integração (Back-end)
Garante a comunicação síncrona entre as rotas Express, as operações de escrita/leitura no banco de dados local SQLite e o parse correto das respostas recebidas da Groq.

Como rodar: Acesse a pasta backend e execute:

```
npm test
```

#### Testes End-to-End - E2E (Ponta a Ponta)
Simula uma jornada real do usuário no sistema: carregamento da página, clique para criação de nova sessão, digitação no input e envio de prompt matemático, tratando problemas de concorrência de rede (Race Conditions) com interceptações assíncronas dedicadas (cy.intercept e cy.wait).

Ferramenta: Cypress.

Como rodar: Com o front-end e o back-end rodando, abra um terceiro terminal em front/agente e execute:

```
npx cypress open
```

### 🔒 Segurança e Boas Práticas de Controle de Versão
Para manter a integridade do código e a segurança das credenciais em ambientes públicos, as seguintes proteções foram aplicadas via .gitignore:


> [chat.db]: O arquivo de banco de dados gerado em tempo de execução permanece estritamente local, assegurando que dados de teste de uma máquina não causem conflito no merge de branches.

> [node_modules/]: Ocultado para otimizar o tempo de sincronização e clonagem do repositório.

Documentação técnica desenvolvida por Sandro Roberto Tavares da Silva para a disciplina de Teste de Software - 5º Período.