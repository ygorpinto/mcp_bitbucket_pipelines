#!/usr/bin/env node

// Teste simples para o servidor MCP
import { spawn } from 'child_process';

// Inicia o servidor
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', process.stderr],
  env: {
    ...process.env
  }
});

// Envia uma mensagem de inicialização para o servidor
const initializeMsg = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    name: "Test Client",
    version: "1.0.0"
  }
};

// Função para enviar uma mensagem
function sendMessage(message) {
  const jsonStr = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(jsonStr, 'utf8')}\r\n\r\n`;
  server.stdin.write(header + jsonStr);
}

// Faz o parsing das mensagens recebidas
let buffer = '';
let contentLength = null;

server.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // Enquanto temos dados para processar
  while (buffer.length > 0) {
    // Se ainda não temos o comprimento do conteúdo, procura o cabeçalho
    if (contentLength === null) {
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break; // Cabeçalho incompleto
      
      const header = buffer.substring(0, headerEnd);
      const match = header.match(/Content-Length: (\d+)/i);
      if (!match) {
        console.error('Cabeçalho inválido:', header);
        buffer = buffer.substring(headerEnd + 4); // Pula o cabeçalho inválido
        continue;
      }
      
      contentLength = parseInt(match[1], 10);
      buffer = buffer.substring(headerEnd + 4);
    }
    
    // Se temos dados suficientes, processa a mensagem
    if (buffer.length >= contentLength) {
      const message = buffer.substring(0, contentLength);
      buffer = buffer.substring(contentLength);
      contentLength = null;
      
      // Processa a mensagem
      try {
        const json = JSON.parse(message);
        console.log('Resposta recebida:', JSON.stringify(json, null, 2));
        
        // Se recebemos uma resposta ao initialize, enviamos mais mensagens
        if (json.id === 1) {
          // Envia uma mensagem de "initialzed" para completar a inicialização
          sendMessage({
            jsonrpc: "2.0",
            method: "initialized",
            params: {}
          });
          
          // Lista as ferramentas disponíveis
          sendMessage({
            jsonrpc: "2.0",
            id: 2,
            method: "listTools",
            params: {}
          });
          
          // Chama a ferramenta de listar pipelines
          setTimeout(() => {
            sendMessage({
              jsonrpc: "2.0",
              id: 3,
              method: "callTool",
              params: {
                name: "mcp_bitbucket_list_pipelines"
              }
            });
          }, 500);
        }
        
        // Após receber todas as respostas, encerra o teste
        if (json.id === 3) {
          setTimeout(() => {
            console.log('Teste concluído com sucesso!');
            server.stdin.end();
            process.exit(0);
          }, 500);
        }
      } catch (e) {
        console.error('Erro ao analisar a mensagem:', e);
      }
    } else {
      // Precisamos de mais dados
      break;
    }
  }
});

// Envia a mensagem inicial
sendMessage(initializeMsg);

// Trata erros
server.on('error', (err) => {
  console.error('Erro no servidor:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Servidor encerrado com código ${code}`);
  process.exit(code || 0);
}); 