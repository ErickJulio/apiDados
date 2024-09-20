# apiDados
# Documentação do Fluxo de Integração e Execução de Testes da API com Cypress

## Fluxo Geral
Este documento descreve o fluxo completo de execução de testes automatizados para uma API usando Cypress. O fluxo inclui o setup inicial, a configuração do ambiente, a instalação de dependências, a execução dos testes e as etapas pós-execução.

## Passos do Job

### 1. **Set up job**
   - Esta etapa inicializa o job de CI (Continuous Integration), preparando o ambiente onde as próximas ações serão executadas. Pode incluir a configuração de variáveis de ambiente ou pré-requisitos básicos.

### 2. **Checkout repositório da API**
   - Neste passo, o repositório da API é clonado ou acessado pela pipeline. A versão mais recente do código da API é trazida para ser utilizada e configurada no ambiente de execução.
   
### 3. **Checkout repositório do Cypress**
   - O código do Cypress, contendo os testes automatizados, é verificado e baixado. Isso permite que os testes sejam executados mais tarde contra a API.

### 4. **Configurar o Node.js**
   - Aqui, o ambiente Node.js é configurado. Dependendo das versões suportadas pela API e Cypress, essa etapa garante que a versão correta do Node.js esteja ativa para rodar os testes e a aplicação.

### 5. **Instalar dependências API**
   - Todas as bibliotecas e pacotes necessários para a API funcionar corretamente são instalados usando o gerenciador de pacotes, como `npm` ou `yarn`. Isso garante que a API esteja pronta para iniciar.

### 6. **Instalar dependências Cypress**
   - Similar à etapa anterior, aqui são instaladas as dependências que o Cypress precisa para funcionar corretamente. Isso inclui pacotes de teste e ferramentas necessárias para a automação.

### 7. **Iniciar API no Render**
   - A API é iniciada no serviço **Render**, que é um serviço de hospedagem de aplicativos. Esta etapa inicia a API em um ambiente de produção ou de desenvolvimento para ser testada.

### 8. **Aguardar a API estar pronta**
   - Após a API ser iniciada, esta etapa garante que o job espera até que a API esteja totalmente pronta e funcional para receber os testes automatizados.

### 9. **Executar testes do Cypress**
   - O Cypress executa os testes automatizados que foram previamente definidos no repositório de testes. Esses testes validam as funcionalidades e integridade da API, garantindo que o sistema esteja funcionando como esperado.

### 10. **Post Configurar o Node.js**
   - Etapa de "limpeza" que é executada após a configuração inicial do Node.js. Aqui, qualquer configuração ou cache pode ser gerenciado para garantir que o ambiente seja mantido limpo para futuras execuções.

### 11. **Post checkout repositório do Cypress**
   - Similar à etapa anterior, este é o processo pós-checkout para o repositório Cypress, onde qualquer cache ou configuração do Cypress pode ser ajustado após a execução dos testes.

### 12. **Post checkout repositório da API**
   - Após a execução da API, essa etapa lida com quaisquer ações pós-execução, como limpeza de caches, encerramento de processos ou remoção de artefatos temporários.

### 13. **Complete job**
   - Última etapa do job. Aqui, o job é marcado como completo, com a finalização de todas as ações necessárias e a coleta de resultados, caso haja necessidade de envio de relatórios ou logs.

## Cypress e Render 

### 1. **Iniciar API no Render**
   - Endpoint: `POST /iniciar-api`
   - Este endpoint é responsável por iniciar a aplicação da API no serviço Render. Ele configura o ambiente de produção ou staging e prepara a aplicação para aceitar requisições.
   
### 2. **Executar testes do Cypress**
   - Endpoint: `GET /executar-testes`
   - O Cypress faz chamadas para diversos endpoints da API para validar o comportamento da aplicação. Este endpoint coordena o disparo e a execução desses testes no ambiente configurado.

---

## Observações

- O uso de dois checkouts distintos para a API e Cypress garante que cada um tenha seu próprio fluxo de configuração e dependências, reduzindo possíveis conflitos.
- As etapas "Post" são importantes para a manutenção do ambiente de CI, garantindo que futuros jobs sejam executados de maneira limpa e sem artefatos residuais de execuções anteriores.
- O Cypress, sendo uma ferramenta poderosa de automação, valida não só o comportamento funcional da API, mas também pode ser utilizado para validar a performance em pequenos cenários.

![diagram](https://github.com/user-attachments/assets/561fad01-2449-4464-ae15-2a28e36edece)
