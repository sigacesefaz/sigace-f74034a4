# SIGACE - Sistema Integrado de Gestão e Acompanhamento de Processos

## Tecnologias Utilizadas

- **Frontend**:
  - Vite (build tool)
  - React (biblioteca JavaScript)
  - TypeScript (tipagem estática)
  - Tailwind CSS (estilização)
  - shadcn-ui (componentes UI)

- **Backend**:
  - Node.js (runtime JavaScript)
  - Supabase (banco de dados PostgreSQL)

- **Outras Ferramentas**:
  - ESLint (análise de código)
  - PostCSS (processamento CSS)
  - Bun (gerenciador de pacotes)

## Funcionalidades Principais

### Tela de Login
- Autenticação de usuários
- Validação de credenciais
- Recuperação de senha

### Tela Principal (Dashboard)
- Visão geral de processos
- Gráficos e métricas
- Acesso rápido às funcionalidades

### Gestão de Processos
- Cadastro de novos processos
- Consulta e filtragem avançada
- Acompanhamento de movimentações
- Upload de documentos relacionados

### Cadastro de Usuários
- Criação de novos usuários
- Atribuição de perfis e permissões
- Edição e desativação de contas

### Relatórios
- Geração de relatórios personalizados
- Exportação em PDF e Excel
- Filtros avançados

## Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:
- `processes` - Armazena informações básicas dos processos
- `process_details` - Detalhes específicos de cada processo
- `process_movements` - Movimentações e histórico
- `process_subjects` - Assuntos e classificações
- `users` - Cadastro de usuários do sistema

## Como Executar o Projeto Localmente

1. Clone o repositório:
```sh
git clone <URL_DO_REPOSITÓRIO>
```

2. Instale as dependências:
```sh
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` baseado no `.env.example`
- Preencha com as credenciais do Supabase

4. Inicie o servidor de desenvolvimento:
```sh
npm run dev
```

5. Acesse no navegador:
```
http://localhost:3000
```

## Implantação em Produção

O projeto pode ser implantado em qualquer serviço de hospedagem que suporte aplicações Node.js, como:
- Vercel
- Netlify
- Render
- Railway

Para implantação com Supabase, consulte a documentação oficial em https://supabase.com/docs
