import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock do Fetch Global
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), 
  })
));

describe('QA Frontend - Testes de Interface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TESTE 4
  it('4. Deve renderizar a interface inicial perfeitamente', async () => {
    render(<App />);
    
    // O 'await findBy' segura o teste até o useEffect inicial terminar de rodar!
    expect(await screen.findByText('+ Novo Chat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Adicione uma mensagem...')).toBeInTheDocument();
    
    const btnEnviar = screen.getByText('Enviar');
    expect(btnEnviar).toBeInTheDocument();
    expect(btnEnviar).toBeDisabled();
  });

  // TESTE 5
  it('5. Deve permitir digitar e habilitar o botão de envio', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/chat')) {
        return Promise.resolve({
          json: () => Promise.resolve({ reply: 'Simulação da IA', sessionId: '123' })
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    }));

    render(<App />);
    
    // Espera a tela estabilizar do useEffect
    await screen.findByText('+ Novo Chat');

    const input = screen.getByPlaceholderText('Adicione uma mensagem...');
    const btnEnviar = screen.getByText('Enviar');

    await userEvent.type(input, 'Testando o frontend automatizado!');
    
    expect(btnEnviar).not.toBeDisabled();
  });
});