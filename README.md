# Bitbucket Pipelines MCP Server

Um servidor Express que fornece uma API RESTful para gerenciar pipelines do Bitbucket. Este servidor permite listar, executar e parar pipelines de forma simples e segura.

## 🚀 Funcionalidades

- Listar pipelines de um repositório
- Executar pipeline em branch ou commit específico
- Verificar status de uma pipeline
- Parar uma pipeline em execução
- Suporte a variáveis de pipeline
- Validação robusta de entrada
- Tratamento de erros adequado
- Segurança com CORS e Helmet

## 📋 Pré-requisitos

- Node.js >= 14
- npm ou yarn
- Token de acesso do Bitbucket com permissões apropriadas
- Docker (opcional, para deploy)

## 🔧 Instalação Local

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
export BITBUCKET_ACCESS_TOKEN="seu-token-aqui"
# Opcional: export BITBUCKET_API_URL="https://api.bitbucket.org/2.0"
```

4. Inicie o servidor:
```bash
npm start
```

## 🐳 Deploy com Docker

1. Construa a imagem:
```bash
docker build -t bitbucket-pipelines-mcp .
```

2. Execute o container:
```bash
docker run -d \
  -p 3444:3444 \
  -e BITBUCKET_ACCESS_TOKEN="seu-token-aqui" \
  --name bitbucket-pipelines-mcp \
  bitbucket-pipelines-mcp
```

## 🔌 Uso com Cursor

Para usar este servidor como um MCP client no Cursor, adicione a seguinte configuração ao seu arquivo `~/.cursor/mcp.json`:

```json
{
  "bitbucket-pipelines": {
    "type": "http",
    "url": "http://localhost:3444",
    "headers": {
      "Authorization": "Bearer seu-token-aqui"
    }
  }
}
```

## 🔑 Configuração

O servidor requer apenas uma configuração obrigatória:

- `BITBUCKET_ACCESS_TOKEN`: Token de acesso do Bitbucket

Configuração opcional:
- `BITBUCKET_API_URL`: URL base da API do Bitbucket (padrão: https://api.bitbucket.org/2.0)
- `PORT`: Porta do servidor (padrão: 3444)

## 📚 API

### Listar Pipelines

```http
GET /api/pipelines?workspace={workspace}&repo_slug={repo_slug}
```

Parâmetros de query:
- `workspace`: Nome do workspace (obrigatório)
- `repo_slug`: Nome do repositório (obrigatório)
- `sort`: Ordenação (opcional)
- `page`: Número da página (opcional)
- `pagelen`: Itens por página (opcional, 1-100)

### Executar Pipeline

```http
POST /api/pipelines?workspace={workspace}&repo_slug={repo_slug}
```

Parâmetros de query:
- `workspace`: Nome do workspace (obrigatório)
- `repo_slug`: Nome do repositório (obrigatório)

Body:
```json
{
  "branch": "main",           // ou "commit": "hash-do-commit"
  "variables": {              // opcional
    "DEPLOY_ENV": "staging",
    "DEBUG": "true"
  }
}
```

### Verificar Status da Pipeline

```http
GET /api/pipelines/{pipelineUuid}?workspace={workspace}&repo_slug={repo_slug}
```

Parâmetros:
- `pipelineUuid`: UUID da pipeline (obrigatório)
- `workspace`: Nome do workspace (obrigatório)
- `repo_slug`: Nome do repositório (obrigatório)

### Parar Pipeline

```http
POST /api/pipelines/{pipelineUuid}/stop?workspace={workspace}&repo_slug={repo_slug}
```

Parâmetros:
- `pipelineUuid`: UUID da pipeline (obrigatório)
- `workspace`: Nome do workspace (obrigatório)
- `repo_slug`: Nome do repositório (obrigatório)

## 📝 Exemplos

### Listar Pipelines
```bash
curl "http://localhost:3444/api/pipelines?workspace=my-workspace&repo_slug=my-repo"
```

### Executar Pipeline
```bash
curl -X POST "http://localhost:3444/api/pipelines?workspace=my-workspace&repo_slug=my-repo" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "main",
    "variables": {
      "DEPLOY_ENV": "staging"
    }
  }'
```

### Verificar Status
```bash
curl "http://localhost:3444/api/pipelines/123e4567-e89b-12d3-a456-426614174000?workspace=my-workspace&repo_slug=my-repo"
```

### Parar Pipeline
```bash
curl -X POST "http://localhost:3444/api/pipelines/123e4567-e89b-12d3-a456-426614174000/stop?workspace=my-workspace&repo_slug=my-repo"
```

## 🛡️ Segurança

O servidor inclui várias medidas de segurança:

- Validação de entrada com Zod
- Headers de segurança via Helmet
- CORS configurado
- Sanitização de parâmetros
- Tratamento adequado de erros

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 