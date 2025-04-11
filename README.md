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

### Com Docker (Recomendado)

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd bitbucket-pipelines-mcp
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Inicie o servidor:
```bash
docker-compose up -d
```

4. Para verificar o status do servidor:
```bash
# Torne o script executável
chmod +x docker-mcp-test.js
# Execute o script
node docker-mcp-test.js
```

5. Para interagir com o servidor usando o script cliente:
```bash
# Torne o script executável
chmod +x docker-mcp-client.js
# Execute o script
node docker-mcp-client.js
```

6. Para interagir manualmente com o servidor:
```bash
# Exemplo de chamada direta
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"name":"Test Client","version":"1.0.0","protocolVersion":"0.3.0","capabilities":{},"clientInfo":{"name":"Test Client","version":"1.0.0"}}}' | docker exec -i bitbucket-pipelines-mcp_mcp-server_1 node dist/index.js
```

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

## Integração com o Cursor

### Método 1: Editando o arquivo `mcp.json` diretamente (Recomendado)

A maneira mais direta e eficiente de integrar com o Cursor é editar o arquivo `mcp.json` principal:

1. Certifique-se de que o servidor Docker MCP está rodando:
```bash
npm run docker:up
```

2. Localize o arquivo `mcp.json` no diretório de configuração do Cursor:
   - Linux: `~/.cursor/mcp.json`
   - macOS: `~/Library/Application Support/Cursor/mcp.json`
   - Windows: `%APPDATA%\Cursor\mcp.json`

3. Edite o arquivo `mcp.json` e adicione a seguinte configuração na seção principal:

```json
"bitbucket-pipelines": {
  "command": "docker",
  "args": [
    "exec",
    "-i",
    "bitbucket-pipelines-mcp_mcp-server_1",
    "node",
    "dist/index.js"
  ]
}
```

4. Salve o arquivo e reinicie o Cursor.

5. Agora você pode usar as ferramentas do Bitbucket Pipelines diretamente no Cursor, chamando-as usando:
```
@bitbucket-pipelines
```

### Método 2: Usando um arquivo de configuração separado

Para usar o Bitbucket Pipelines MCP diretamente no Cursor IDE, siga estas etapas:

1. Certifique-se de que o servidor Docker MCP está rodando:
```bash
npm run docker:up
```

2. Crie um arquivo `mcp.config.json` na raiz do projeto com o seguinte conteúdo:
```json
{
  "name": "bitbucket-pipelines-mcp",
  "description": "Bitbucket Pipelines MCP Server para interagir com o Bitbucket Pipelines",
  "version": "1.0.0",
  "command": {
    "binary": "docker",
    "args": ["exec", "-i", "bitbucket-pipelines-mcp_mcp-server_1", "node", "dist/index.js"]
  },
  "tools": [
    {
      "name": "mcp_bitbucket_list_pipelines",
      "description": "Lista pipelines com suporte a paginação"
    },
    {
      "name": "mcp_bitbucket_trigger_pipeline",
      "description": "Dispara um novo pipeline"
    },
    {
      "name": "mcp_bitbucket_get_pipeline_status",
      "description": "Obtém o status de um pipeline específico"
    },
    {
      "name": "mcp_bitbucket_stop_pipeline",
      "description": "Para a execução de um pipeline"
    }
  ]
}
```

3. Copie este arquivo para o diretório de configuração do Cursor:
```bash
# Para Linux
mkdir -p ~/.config/Cursor/mcp/
cp mcp.config.json ~/.config/Cursor/mcp/bitbucket-pipelines-mcp.json

# Para macOS
mkdir -p ~/Library/Application\ Support/Cursor/mcp/
cp mcp.config.json ~/Library/Application\ Support/Cursor/mcp/bitbucket-pipelines-mcp.json

# Para Windows
mkdir -p %AppData%\Cursor\mcp\
copy mcp.config.json %AppData%\Cursor\mcp\bitbucket-pipelines-mcp.json
```

4. Reinicie o Cursor para aplicar as alterações.

5. Agora você pode usar as ferramentas do Bitbucket Pipelines diretamente no Cursor, chamando-as com:
```
@modelcontextprotocol/bitbucket-pipelines-mcp
```

6. Para acessar uma ferramenta específica, use:
```
@modelcontextprotocol/bitbucket-pipelines-mcp/mcp_bitbucket_list_pipelines
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

## Testando com Comandos Diretos

Você pode testar o servidor manualmente usando os seguintes comandos:

### Inicialização
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"name":"Test Client","version":"1.0.0","protocolVersion":"0.3.0","capabilities":{},"clientInfo":{"name":"Test Client","version":"1.0.0"}}}' | docker exec -i bitbucket-pipelines-mcp_mcp-server_1 node dist/index.js
```

### Listar Ferramentas
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | docker exec -i bitbucket-pipelines-mcp_mcp-server_1 node dist/index.js
```

### Chamar uma Ferramenta
```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"mcp_bitbucket_list_pipelines","input":{"page":1,"pagelen":5}}}' | docker exec -i bitbucket-pipelines-mcp_mcp-server_1 node dist/index.js
``` 

