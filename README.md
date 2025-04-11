# Bitbucket Pipelines MCP Server

Um servidor MCP (Model Context Protocol) que fornece tools para interagir com o Bitbucket Pipelines. Este servidor implementa o padrão MCP e pode ser usado por modelos de linguagem como o Claude para gerenciar pipelines do Bitbucket.

## Tools Disponíveis

### 1. `mcp_bitbucket_list_pipelines`
Lista pipelines com suporte a paginação.

**Parâmetros:**
```typescript
{
  page?: number;    // Número da página (default: 1)
  pagelen?: number; // Itens por página (default: 10)
}
```

### 2. `mcp_bitbucket_trigger_pipeline`
Dispara um novo pipeline.

**Parâmetros:**
```typescript
{
  target: {
    ref_type: string;   // Tipo de referência (ex: "branch", "tag")
    type: string;       // Tipo do alvo
    ref_name: string;   // Nome da referência (ex: "main", "develop")
    selector?: {        // Opcional
      type: string;
      pattern: string;
    }
  },
  variables?: Array<{   // Opcional
    key: string;
    value: string;
    secured?: boolean;
  }>
}
```

### 3. `mcp_bitbucket_get_pipeline_status`
Obtém o status de um pipeline específico.

**Parâmetros:**
```typescript
{
  uuid: string;  // UUID do pipeline
}
```

### 4. `mcp_bitbucket_stop_pipeline`
Para a execução de um pipeline.

**Parâmetros:**
```typescript
{
  uuid: string;  // UUID do pipeline
}
```

## Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` com as seguintes variáveis:

```env
# Obrigatórias
BITBUCKET_ACCESS_TOKEN=seu_token_aqui
BITBUCKET_WORKSPACE=seu_workspace
BITBUCKET_REPO_SLUG=seu_repositorio

# Opcionais
BITBUCKET_API_URL=https://api.bitbucket.org/2.0  # URL da API (default: https://api.bitbucket.org/2.0)
```

## Instalação e Execução

### Instalação Local

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd bitbucket-pipelines-mcp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Compile o projeto:
```bash
npm run build
```

5. Inicie o servidor:
```bash
npm start
```

## Uso com MCP

Este servidor implementa o Model Context Protocol (MCP), permitindo que modelos de linguagem interajam com o Bitbucket Pipelines. O servidor usa a interface StdioServerTransport, que permite a comunicação através do stdin/stdout.

### Exemplo de uso com o SDK do MCP

```typescript
import { Client } from '@modelcontextprotocol/sdk/client';
import { ChildProcessTransport } from '@modelcontextprotocol/sdk/client/child-process';

async function main() {
  // Inicializa o cliente MCP 
  const client = new Client({
    transport: new ChildProcessTransport({
      command: 'node',
      args: ['dist/index.js'],
      env: {
        BITBUCKET_ACCESS_TOKEN: 'seu_token',
        BITBUCKET_WORKSPACE: 'seu_workspace', 
        BITBUCKET_REPO_SLUG: 'seu_repositorio'
      }
    })
  });

  // Lista as ferramentas disponíveis
  const tools = await client.listTools();
  console.log('Ferramentas disponíveis:', tools);

  // Listar pipelines
  const pipelines = await client.callTool('mcp_bitbucket_list_pipelines', { page: 1, pagelen: 5 });
  console.log('Pipelines:', pipelines);

  // Fechar o cliente
  await client.close();
}

main().catch(console.error);
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run build`: Compila o projeto TypeScript
- `npm start`: Inicia o servidor 
- `npm run dev`: Inicia o servidor em modo de desenvolvimento usando ts-node
- `npm test`: Executa os testes

### Estrutura do Projeto

```
.
├── src/
│   ├── index.ts                # Ponto de entrada do servidor MCP
│   └── tools/
│       └── bitbucket-pipelines.ts  # Implementação das tools MCP
├── package.json               # Dependências e scripts 
└── tsconfig.json              # Configuração do TypeScript
```

## Implementando o Model Context Protocol

Este projeto utiliza o `@modelcontextprotocol/sdk` para implementar um servidor MCP. As principais características são:

1. **Comunicação via stdio**: O servidor se comunica através de stdin/stdout, o que permite integração fácil com LLMs.
2. **Formato padrão de tools**: Todas as ferramentas seguem o formato definido pelo protocolo MCP.
3. **Tratamento robusto de erros**: O protocolo MCP padroniza como os erros são comunicados ao cliente.

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request 

## Testando com a CLI do MCP

Se você tiver a ferramenta MCP CLI instalada (via npm install -g @modelcontextprotocol/sdk), você pode testar o servidor da seguinte forma:

```bash
# Inicie o servidor em um terminal
npm start

# Em outro terminal, use a CLI para enviar comandos
mcp client --cmd="node dist/index.js" list-tools

# Para chamar uma ferramenta específica
mcp client --cmd="node dist/index.js" call mcp_bitbucket_list_pipelines
``` 