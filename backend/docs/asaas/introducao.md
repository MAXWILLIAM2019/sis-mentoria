# Integração com API Asaas – Guia Rápido

## Introdução

A API do Asaas permite automatizar cobranças, recebimentos e pagamentos de forma fácil e segura, suportando múltiplos meios de pagamento: **PIX, boleto bancário, cartão de crédito/débito e TED**. É ideal para negócios que precisam de:
- Gestão de assinaturas e planos recorrentes
- Cobranças avulsas e links de pagamento
- Split de pagamentos
- Notificações automáticas (webhooks)
- Cofre de cartão de crédito
- Antecipação de recebíveis

O Asaas é uma Instituição de Pagamento autorizada pelo Banco Central do Brasil e certificada PCI-DSS, garantindo segurança nas transações.

### Recursos principais para assinaturas e planos
- **Gestão de assinaturas**: Criação, alteração, cancelamento e consulta de planos recorrentes.
- **Cobranças automáticas**: Geração de cobranças recorrentes para clientes cadastrados.
- **Webhooks**: Notificações automáticas sobre eventos de pagamento, renovação, inadimplência, etc.

### Ambiente de testes (Sandbox)
- Utilize o ambiente sandbox para testar integrações sem riscos.
- Crie sua conta de testes em: https://sandbox.asaas.com/

### Suporte e Comunidade
- Portal de desenvolvedores: https://developers.asaas.com/
- Status dos serviços: https://status.asaas.com/
- Comunidade Discord e novidades: consulte o portal de devs.
- Suporte técnico: disponível para dúvidas e problemas de integração.

---

**Próximas seções:**
- Fluxo de criação de clientes e assinaturas
- Estrutura dos principais endpoints
- Boas práticas para webhooks e segurança

> Siga para a próxima seção para ver o fluxo básico de clientes e assinaturas.

---

## Canais de Suporte

Se tiver dúvidas ou problemas na integração, utilize os canais oficiais:

- **Suporte técnico (Integrações):**
  - E-mail: integracoes@asaas.com.br
  - Atendimento: dias úteis, das 8h às 17h
  - Tempo típico de resposta: até 2 horas em horário comercial

- **Comunidade Discord:**
  - Canal não oficial, respostas podem demorar mais
  - Possibilidade de ajuda de outros desenvolvedores
  - [Acesse o Discord do Asaas](https://discord.com/invite/asaas) (verifique o link oficial no portal de devs)

- **Contato comercial (Gerente de contas):**
  - WhatsApp: 0800 009 0037 (atendimento 24h)
  - Para dúvidas comerciais, liberações ou solicitações específicas

---

## Testes e Exploração via Postman

Você pode testar todos os endpoints da API Asaas utilizando a coleção oficial no Postman:

- **Acesse a coleção oficial:**
  - [Asaas API no Postman](https://www.postman.com/asaasdev/asaas/api/1032fc01-9d0c-4877-8a48-ff31279f127b?action=share&creator=18837025)

### Como usar:
1. No menu à esquerda do Postman, expanda "Asaas API" e clique em "Collection Asaas".
2. Clique em **Fork** (canto superior direito) e escolha o seu Workspace para copiar a coleção.
3. Configure as variáveis de ambiente (ex: `baseUrl`, `access_token`) conforme sua conta/sandbox.
4. Realize requisições de teste diretamente pelo Postman, explorando todos os endpoints documentados.

> A coleção do Postman é ideal para explorar, aprender e validar integrações antes de implementar no código.

---

## Autenticação e Segurança

A autenticação na API Asaas é feita via **API Key** (chave de acesso), que identifica sua conta e autoriza as operações.

### Como autenticar
- Inclua os seguintes headers em todas as requisições:
  ```json
  "Content-Type": "application/json",
  "User-Agent": "nome_da_sua_aplicacao",
  "access_token": "SUA_API_KEY"
  ```
- O header `User-Agent` é obrigatório para contas criadas a partir de 13/06/2024.
- Se a chave for inválida, ausente ou o header estiver incorreto, a API retorna **HTTP 401**.

### Segurança da chave de API
- **Nunca exponha sua chave de API** em código-fonte público, front-end, e-mails ou mensagens.
- Armazene a chave em variáveis de ambiente ou serviços de gerenciamento de segredos (ex: AWS Secrets Manager, Google Secret Manager, Azure Key Vault).
- Defina IPs autorizados para uso da chave, se possível.
- Faça rotação periódica das chaves e monitore o uso via logs.
- A chave é exibida apenas uma vez ao ser criada. Se perder, gere uma nova.
- Você pode criar até 10 chaves por conta, nomeá-las, definir expiração e desabilitar/habilitar conforme necessário.

### Ambientes
- **Sandbox (testes):** `https://api-sandbox.asaas.com/v3`
- **Produção:** `https://api.asaas.com/v3`
- As chaves de API são diferentes para cada ambiente.
- Sempre teste no sandbox antes de ir para produção.

### Boas práticas
- Use sempre HTTPS (TLS 1.2 ou 1.3).
- Restrinja o acesso à chave apenas a quem realmente precisa.
- Nunca armazene a chave em texto claro ou em arquivos acessíveis publicamente.
- Monitore e rotacione as chaves regularmente.

> Para obter sua chave de API, acesse a área de integrações no painel web do Asaas (apenas usuários administradores podem gerar chaves). 