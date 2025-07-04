# Segurança

Esta seção apresenta as melhores práticas de segurança para integração com a API Asaas.

## Tópicos sugeridos:

- Armazenamento seguro da API Key
- Uso de variáveis de ambiente e secret managers
- Controle de acesso e restrição de IPs
- Uso obrigatório de HTTPS
- Rotação e monitoramento de chaves
- Tratamento de erros e mensagens amigáveis
- Boas práticas para ambientes (dev, test, prod)

> Preencha cada tópico conforme for implementando a integração.

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