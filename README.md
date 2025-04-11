# Bitbucket Pipelines MCP Server

Um servidor MCP (Model Context Protocol) que fornece tools para interagir com o Bitbucket Pipelines. Este servidor pode ser usado por modelos de linguagem como o Claude para gerenciar pipelines do Bitbucket.

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
PORT=3444                                    # Porta do servidor (default: 3444)
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

### Sem Docker

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

## Uso

### Health Check
```bash
curl http://localhost:3444/health
```

### Chamando uma Tool
```bash
curl -X POST http://localhost:3444/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "mcp_bitbucket_list_pipelines",
    "params": {
      "page": 1,
      "pagelen": 10
    }
  }'
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run build`: Compila o projeto TypeScript
- `npm start`: Inicia o servidor
- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter

### Estrutura do Projeto

```
.
├── src/
│   ├── index.ts              # Ponto de entrada da aplicação
│   └── tools/
│       └── bitbucket-pipelines.ts  # Implementação das tools MCP
├── Dockerfile                # Configuração do Docker
├── docker-compose.yml        # Configuração do Docker Compose
├── package.json             # Dependências e scripts
└── tsconfig.json            # Configuração do TypeScript
```

## Segurança

O servidor inclui várias medidas de segurança:
- Helmet para headers HTTP seguros
- CORS configurado
- Validação de entrada com Zod
- Tratamento de erros robusto
- Logging de requisições com Morgan

## Monitoramento

- Health check disponível em `/health`
- Logs detalhados de requisições
- Tratamento e logging de exceções não capturadas

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request 