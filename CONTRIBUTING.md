# Guia de Contribuição

Obrigado por considerar contribuir para o Bitbucket Pipelines MCP! Este documento contém diretrizes para contribuir com o projeto.

## Código de Conduta

Ao participar deste projeto, você concorda em seguir nosso Código de Conduta:

- Use linguagem acolhedora e inclusiva
- Seja respeitoso com diferentes pontos de vista e experiências
- Aceite críticas construtivas de forma educada
- Foque no que é melhor para a comunidade
- Demonstre empatia para com outros membros da comunidade

## Como Contribuir

### Reportando Bugs

Se você encontrar um bug, por favor, abra uma issue detalhando:

1. **Título claro e descritivo**
2. **Passos para reproduzir o problema**
3. **Comportamento esperado vs. comportamento atual**
4. **Ambiente** (sistema operacional, versão do Node.js, etc.)
5. **Capturas de tela** (se aplicável)

### Sugerindo Melhorias

Para sugestões de novas funcionalidades ou melhorias:

1. **Descreva claramente a sugestão**
2. **Explique por que seria útil**
3. **Descreva o comportamento esperado**
4. **Forneça exemplos de uso** (se aplicável)

### Pull Requests

Para submeter um Pull Request:

1. **Faça fork do repositório**
2. **Crie um branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Desenvolva sua funcionalidade**, seguindo as convenções de código
4. **Escreva testes** para sua funcionalidade
5. **Certifique-se de que todos os testes passem**
6. **Commit suas alterações** seguindo as convenções de commit
7. **Push para o branch** (`git push origin feature/nova-funcionalidade`)
8. **Abra um Pull Request**

## Padrões de Código

### Convenções de Estilo

- Use TypeScript para todo o código
- Siga o estilo de código existente no projeto
- Use dois espaços para indentação
- Use interfaces para tipos sempre que possível
- Documente funções públicas

### Testes

- Escreva testes unitários para todas as funcionalidades
- Mantenha a cobertura de testes alta
- Use mocks adequados para APIs externas

### Convenções de Commit

- Use mensagens de commit claras e descritivas
- Estruture as mensagens seguindo o padrão convencional:
  - `feat:` para novas funcionalidades
  - `fix:` para correções de bugs
  - `docs:` para alterações na documentação
  - `test:` para adição ou correção de testes
  - `refactor:` para refatorações
  - `chore:` para tarefas de manutenção

## Estrutura do Projeto

```
.
├── src/                # Código fonte
│   ├── index.ts        # Ponto de entrada
│   ├── tools/          # Implementação das ferramentas MCP
│   └── types/          # Definições de tipos
├── test/               # Testes
│   ├── unit/           # Testes unitários
│   └── mocks/          # Mocks para testes
├── docker-compose.yml  # Configuração do Docker
└── package.json        # Dependências e scripts
```

## Processo de Desenvolvimento

1. **Escolha uma issue** para trabalhar ou crie uma nova
2. **Discuta a abordagem** se for uma alteração significativa
3. **Implemente a solução** seguindo as convenções de código
4. **Escreva testes** para sua implementação
5. **Atualize a documentação** se necessário
6. **Submeta um Pull Request**

## Fluxo de Revisão

1. Mantenedores do projeto revisarão seu Pull Request
2. Feedback será fornecido
3. Alterações podem ser solicitadas
4. Após aprovação, seu PR será mesclado

## Lançamento de Versões

O projeto segue [Versionamento Semântico](https://semver.org/):

- **Major** (1.0.0): Mudanças incompatíveis com versões anteriores
- **Minor** (0.1.0): Adições de funcionalidades compatíveis
- **Patch** (0.0.1): Correções de bugs compatíveis

## Perguntas?

Se você tiver dúvidas sobre o processo de contribuição, não hesite em abrir uma issue solicitando esclarecimentos.

Obrigado por contribuir! 