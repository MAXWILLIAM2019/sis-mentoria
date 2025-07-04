> **ATENÇÃO:**
> Este é o documento oficial e completo da integração com a API Asaas.
> Ele serve como base para a documentação modular localizada em `docs/asaas/`.
> **Não altere este conteúdo sem aviso prévio!**
> Toda a documentação modular está atualizada e fiel a este arquivo.
> Para consultar a versão modularizada, acesse a pasta `docs/asaas/`.

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

---

## Cadastro de Clientes

Antes de criar uma cobrança ou assinatura, é necessário cadastrar o cliente e obter seu identificador único.

### Criar cliente
- Endpoint: `POST /v3/customers`
- Exemplo de requisição:
  ```json
  {
    "name": "Marcelo Almeida",
    "cpfCnpj": "24971563792",
    "mobilePhone": "4799376637"
  }
  ```
- O retorno trará um objeto JSON com o campo `id` (ex: `cus_000005219613`), que será usado para criar cobranças e assinaturas.

### Observações importantes
- O Asaas **permite clientes duplicados**. Para evitar, armazene os identificadores dos clientes criados ou faça uma busca antes de criar um novo.
- Consulte clientes existentes usando o endpoint de listagem (`GET /v3/customers`).

> Sempre cadastre ou recupere o cliente antes de criar cobranças ou planos recorrentes.

---

## Cobrança via Boleto

O Asaas permite criar cobranças por boleto de forma simples, parcelada e com regras de desconto, juros e multa.

### Criar cobrança simples por boleto
- Endpoint: `POST /v3/lean/payments`
- Exemplo:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "BOLETO",
    "value": 100.00,
    "dueDate": "2023-07-21"
  }
  ```
- O retorno inclui o campo `bankSlipUrl` (PDF do boleto).

### Cobrança parcelada (carnê)
- Exemplo:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "BOLETO",
    "value": 2000.00,
    "dueDate": "2023-07-21",
    "installmentCount": 10,
    "installmentValue": 200.00
  }
  ```
- O retorno traz o campo `installment` com o ID do parcelamento.
- Para gerar o carnê (PDF com todos os boletos):
  - `GET /v3/installments/{installmentId}/paymentBook`

### Boleto com desconto para pagamento antecipado
- Exemplo:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "BOLETO",
    "value": 2000.00,
    "dueDate": "2023-07-21",
    "discount": {
      "value": 10,
      "dueDateLimitDays": 5,
      "type": "PERCENTAGE"
    }
  }
  ```

### Boleto com juros e multa por atraso
- Exemplo:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "BOLETO",
    "value": 2000.00,
    "dueDate": "2023-07-21",
    "interest": { "value": 1 },
    "fine": { "value": 2 }
  }
  ```
- Juros: percentual ao mês; Multa: percentual sobre o valor em caso de atraso.

### Obter linha digitável do boleto
- Endpoint: `GET /v3/lean/payments/{id}/identificationField`
- Retorna:
  ```json
  {
    "identificationField": "00190000090275928800021932978170187890000005000",
    "nossoNumero": "6543",
    "barCode": "00191878900000050000000002759288002193297817"
  }
  ```
- Sempre recupere a linha digitável após qualquer atualização na cobrança.

### QRCode Pix no boleto
- Basta cadastrar uma chave Pix na sua conta Asaas para que o QRCode Pix apareça automaticamente nos PDFs dos boletos.

> Consulte a [referência completa do endpoint de cobranças](https://www.postman.com/asaasdev/asaas/api/1032fc01-9d0c-4877-8a48-ff31279f127b?action=share&creator=18837025) para mais detalhes.

---

## Cobrança via Pix / QR Code Dinâmico

O Asaas permite criar cobranças via Pix, gerando um QR Code dinâmico para pagamento instantâneo e recebimento rápido.

### Criar cobrança por Pix
- Endpoint: `POST /v3/lean/payments`
- Exemplo:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "PIX",
    "value": 100.90,
    "dueDate": "2023-07-21"
  }
  ```
- É necessário ter uma chave Pix cadastrada na conta para gerar QR Codes próprios.

### Obter QRCode e código copia e cola
- Endpoint: `GET /v3/payments/{id}/pixQrCode`
- Retorno inclui:
  - `encodedImage`: imagem do QRCode em Base64
  - `payload`: código copia e cola
  - `expirationDate`: data de expiração do QRCode

### Observações importantes
- O QRCode gerado é **dinâmico** e com vencimento (expira 12 meses após a data de vencimento).
- Pode ser impresso ou disponibilizado em documentos (boleto, carnê, etc).
- Só pode ser pago uma vez.
- Se não houver chave Pix cadastrada, o QR gerado será de uma instituição parceira e só poderá ser pago até 23:59 do mesmo dia (essa funcionalidade será descontinuada no futuro).
- Sempre gere um novo QRCode após qualquer atualização na cobrança.

> Consulte a [referência completa do endpoint de cobranças](https://www.postman.com/asaasdev/asaas/api/1032fc01-9d0c-4877-8a48-ff31279f127b?action=share&creator=18837025) para mais detalhes.

---

## QR Code Estático Pix

O QR Code estático funciona como um link de pagamento permanente: pode receber múltiplos pagamentos, só expira se você definir uma data de expiração e não exige cadastro prévio de cliente.

### Criar QR Code estático
- Endpoint: `POST /v3/pix/qrCodes/static`
- Exemplo:
  ```json
  {
    "addressKey": "b6295ee1-f054-47d1-9e90-ee57b74f60d9",
    "description": "Churrasco",
    "value": 50.00,
    "format": "ALL",
    "expirationDate": "2023-05-05 14:20:50",
    "expirationSeconds": null
  }
  ```
- O retorno inclui o `id` do QR Code e o `payload` com a imagem em Base64.

### Como funciona
- Não é necessário criar uma cobrança ou informar cliente previamente.
- Ao ser pago, o Asaas importa os dados do pagador e cria a cobrança automaticamente.

### Monitoramento de pagamentos
- Use webhooks para ser notificado de pagamentos recebidos. O campo `pixQrCodeId` no evento indica o QR Code estático utilizado.

### Consultar cobranças geradas por um QR Code estático
- Endpoint: `GET /v3/payments?pixQrCodeId={id}`
- Permite listar todas as cobranças criadas a partir daquele QR Code.

> Ideal para uso em estabelecimentos físicos, eventos ou qualquer situação em que o mesmo QR Code será utilizado por vários clientes.

---

## Cobrança via Cartão de Crédito

O Asaas permite cobranças à vista, parceladas e recorrentes via cartão de crédito, com segurança e praticidade.

### Criar cobrança simples (redirecionamento para fatura)
- Endpoint: `POST /v3/lean/payments`
- Exemplo:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "CREDIT_CARD",
    "value": 109.90,
    "dueDate": "2023-07-21"
  }
  ```
- O retorno inclui o campo `invoiceUrl`, para onde o cliente deve ser redirecionado para informar os dados do cartão.
- Se o `billingType` for `CREDIT_CARD` ou `UNDEFINED`, a opção de cartão de débito também estará disponível na fatura.

### Pagamento direto com dados do cartão
- Envie os dados do cartão e do titular junto com a cobrança:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "CREDIT_CARD",
    "value": 100.00,
    "dueDate": "2023-07-21",
    "creditCard": {
      "holderName": "marcelo h almeida",
      "number": "5162306219378829",
      "expiryMonth": "05",
      "expiryYear": "2024",
      "ccv": "318"
    },
    "creditCardHolderInfo": {
      "name": "Marcelo Henrique Almeida",
      "email": "marcelo.almeida@gmail.com",
      "cpfCnpj": "24971563792",
      "postalCode": "89223-005",
      "addressNumber": "277",
      "addressComplement": null,
      "phone": "4738010919",
      "mobilePhone": "47998781877"
    },
    "remoteIp": "116.213.42.532"
  }
  ```
- A captura é feita no momento da criação da cobrança.
- **Atenção:** Se capturar dados do cartão no seu sistema, use sempre HTTPS.

### Tokenização de cartão de crédito
- Após a primeira transação, a resposta trará o campo `creditCardToken`.
- Para próximas cobranças, basta enviar:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "CREDIT_CARD",
    "value": 100.00,
    "dueDate": "2023-07-21",
    "creditCardToken": "76496073-536f-4835-80db-c45d00f33695",
    "remoteIp": "116.213.42.532"
  }
  ```
- Para criar um token a qualquer momento:
  - Endpoint: `POST /v3/creditCard/tokenize`
  - Envie os dados do cartão e titular.
- O token é exclusivo por cliente.
- Em produção, a funcionalidade de tokenização precisa ser habilitada pelo gerente de contas.

### Parcelamento no cartão
- Para parcelar, envie os campos `installmentCount` e `installmentValue`:
  ```json
  {
    "customer": "cus_000005219613",
    "billingType": "CREDIT_CARD",
    "value": 2000.00,
    "dueDate": "2023-07-21",
    "installmentCount": 10,
    "installmentValue": 200,
    "creditCard": { ... },
    "creditCardHolderInfo": { ... },
    "remoteIp": "116.213.42.532"
  }
  ```
- Visa/Master: até 21x; outras bandeiras: até 12x.
- Para cobrança à vista, **não** envie os campos de parcelamento.

### Observações de segurança e boas práticas
- Sempre use HTTPS para capturar dados sensíveis.
- Configure timeout mínimo de 60 segundos para evitar duplicidades.
- Erros de cartão são genéricos por padrão; erros detalhados só mediante liberação pelo gerente de contas.
- O token de cartão só pode ser usado para o mesmo cliente.

> Consulte a [referência completa do endpoint de cobranças](https://www.postman.com/asaasdev/asaas/api/1032fc01-9d0c-4877-8a48-ff31279f127b?action=share&creator=18837025) para mais detalhes.

---

## Cobrança Parcelada

Para criar uma cobrança parcelada, utilize os campos `installmentCount` (número de parcelas) e `installmentValue` (valor de cada parcela) no lugar do campo `value`.

### Exemplo de cobrança parcelada
```json
{
  "customer": "{CUSTOMER_ID}",
  "billingType": "BOLETO",
  "installmentCount": 6,
  "installmentValue": 20,
  "dueDate": "2017-06-10",
  "description": "Pedido 056984",
  "externalReference": "056984",
  "discount": {
    "value": 10,
    "dueDateLimitDays": 0
  },
  "fine": {
    "value": 1
  },
  "interest": {
    "value": 2
  }
}
```
- O retorno trará a primeira cobrança do parcelamento e o campo `installment` com o ID do parcelamento.

### Parcelamento por valor total
- Se preferir, envie o campo `totalValue` no lugar de `installmentValue`.
- O sistema calculará o valor de cada parcela automaticamente, compensando diferenças na última parcela.

### Consultar todas as parcelas
- Endpoint: `GET /v3/installments/{installment_id}/payments`
- Retorna todas as cobranças geradas para o parcelamento.

### Observações importantes
- Para cobranças avulsas (1x), **não** use os campos de parcelamento; utilize apenas `value`.
- Parcelamento no cartão de crédito:
  - Visa/Master: até 21x
  - Outras bandeiras: até 12x
- Só use os campos de parcelamento para cobranças com 2 ou mais parcelas.

> Consulte a seção de parcelamentos da documentação para mais ações e detalhes.

---

## Redirecionamento após o Pagamento

É possível redirecionar o cliente de volta para sua aplicação após o pagamento ser concluído na interface do Asaas, usando a URL de Retorno (callback).

### Como funciona
- O atributo `callback` permite definir a URL para onde o cliente será enviado após o pagamento.
- Funciona para cobranças, links de pagamento e assinaturas.
- O redirecionamento pode ser automático (`autoRedirect: true`) ou manual (um botão "Ir para o site" será exibido).
- O autoRedirect funciona para pagamentos com confirmação instantânea (cartão, débito, Pix).
- A URL deve ser do mesmo domínio cadastrado nos dados comerciais da conta Asaas.

### Exemplo: cobrança com redirecionamento automático
```json
{
  "customer": "cus_000005219613",
  "billingType": "PIX",
  "value": 2000.00,
  "dueDate": "2023-07-21",
  "callback": {
    "successUrl": "https://seusite.com/redirect",
    "autoRedirect": false // omita ou defina como true para redirecionamento automático
  }
}
```
- O cliente será redirecionado para a URL após o pagamento, ou verá um botão caso `autoRedirect` seja `false`.
- Redirecione o cliente para o `invoiceUrl` retornado na resposta para iniciar o fluxo.

### Exemplo: link de pagamento com redirecionamento
```json
{
  "name": "Meu link de pagamento",
  "billingType": "UNDEFINED",
  "value": 2000.00,
  "chargeType": "DETACHED",
  "callback": {
    "successUrl": "https://seusite.com/redirect",
    "autoRedirect": false
  }
}
```

### Observações importantes
- O redirecionamento só ocorre após o pagamento ser concluído.
- Se o cliente acessar novamente a fatura/link após o pagamento, verá apenas a confirmação de pagamento.
- É possível atualizar a URL de retorno em cobranças e links de pagamento já criados.
- Para forçar o redirecionamento sempre, adicione `?autoRedirect=true` na URL da fatura.

> Use o redirecionamento para melhorar a experiência do usuário e integrar o fluxo de pagamento ao seu sistema.

---

## Chargeback

Quando uma cobrança sofre chargeback, o objeto de cobrança retorna o campo `chargeback` com informações detalhadas.

### Status possíveis (`chargeback.status`)
- `REQUESTED`: Chargeback solicitado
- `IN_DISPUTE`: Em disputa
- `DISPUTE_LOST`: Disputa perdida
- `REVERSED`: Estornado
- `DONE`: Finalizado

### Motivos possíveis (`chargeback.reason`)
- `ABSENCE_OF_PRINT`: Ausência de impressão
- `ABSENT_CARD_FRAUD`: Fraude em ambiente de cartão não presente
- `CARD_ACTIVATED_PHONE_TRANSACTION`: Transação telefônica ativada por cartão
- `CARD_FRAUD`: Fraude em ambiente de cartão presente
- `CARD_RECOVERY_BULLETIN`: Boletim de negativação de cartões
- `COMMERCIAL_DISAGREEMENT`: Desacordo comercial
- `COPY_NOT_RECEIVED`: Cópia não atendida
- `CREDIT_OR_DEBIT_PRESENTATION_ERROR`: Erro de apresentação de crédito/débito
- `DIFFERENT_PAY_METHOD`: Pagamento por outros meios
- `FRAUD`: Sem autorização do portador do cartão
- `INCORRECT_TRANSACTION_VALUE`: Valor da transação é diferente
- `INVALID_CURRENCY`: Moeda inválida
- `INVALID_DATA`: Dados inválidos
- `LATE_PRESENTATION`: Apresentação tardia
- `LOCAL_REGULATORY_OR_LEGAL_DISPUTE`: Contestação regulatória/legal local
- `MULTIPLE_ROCS`: ROCs múltiplos
- `ORIGINAL_CREDIT_TRANSACTION_NOT_ACCEPTED`: Transação de crédito original não aceita
- `OTHER_ABSENT_CARD_FRAUD`: Outras fraudes - Cartão ausente
- `PROCESS_ERROR`: Erro de processamento
- `RECEIVED_COPY_ILLEGIBLE_OR_INCOMPLETE`: Cópia atendida ilegível/incompleta
- `RECURRENCE_CANCELED`: Recorrência cancelada
- `REQUIRED_AUTHORIZATION_NOT_GRANTED`: Autorização requerida não obtida
- `RIGHT_OF_FULL_RECOURSE_FOR_FRAUD`: Direito de regresso integral por fraude
- `SALE_CANCELED`: Mercadoria/serviços cancelado
- `SERVICE_DISAGREEMENT_OR_DEFECTIVE_PRODUCT`: Mercadoria/serviço com defeito ou em desacordo
- `SERVICE_NOT_RECEIVED`: Mercadoria/serviços não recebidos
- `SPLIT_SALE`: Desmembramento de venda
- `TRANSFERS_OF_DIVERSE_RESPONSIBILITIES`: Transferência de responsabilidades diversas
- `UNQUALIFIED_CAR_RENTAL_DEBIT`: Débito de aluguel de carro não qualificado
- `USA_CARDHOLDER_DISPUTE`: Contestação do portador de cartão (EUA)
- `VISA_FRAUD_MONITORING_PROGRAM`: Programa Visa de monitoramento de fraude
- `WARNING_BULLETIN_FILE`: Arquivo boletim de advertência

### Como monitorar
- Sempre verifique o campo `chargeback` ao consultar uma cobrança.
- Use webhooks para ser notificado de alterações no status da cobrança.

> Para mais detalhes sobre chargeback, consulte a documentação oficial do Asaas.

---

## Estornos

Quando uma cobrança sofre estorno, o campo `refunds` é retornado no objeto da cobrança, contendo detalhes de cada estorno realizado.

### Exemplo de retorno
```json
"refunds": [
  {
    "dateCreated": "2022-02-21 10:28:40",
    "status": "DONE",
    "value": 2.00,
    "description": "Pagamento a mais",
    "transactionReceiptUrl": "https://www.asaas.com/comprovantes/6677732109104548"
  }
]
```

### Status possíveis (`refunds.status`)
- `PENDING`: Estorno pendente
- `CANCELLED`: Estorno cancelado
- `DONE`: Estorno concluído

### Como monitorar
- Sempre verifique o campo `refunds` ao consultar uma cobrança.
- Use webhooks para ser notificado de alterações no status da cobrança e de estornos.

> Consulte a documentação oficial do Asaas para mais detalhes sobre estornos e comprovantes.

---

## Assinaturas (Recorrência)

O Asaas permite criar assinaturas para cobranças recorrentes, ideais para planos mensais, anuais ou outros ciclos.

### Como funciona
- Uma assinatura gera cobranças automáticas para o cliente, conforme o ciclo definido (mensal, anual, etc).
- É possível definir valor, data de início, ciclo, quantidade de repetições, descontos, juros, multa e notificações.

### Criar assinatura
- Endpoint: `POST /v3/subscriptions`
- Exemplo de requisição: (aguardando envio do exemplo pelo usuário)
- O retorno trará o `id` da assinatura e os dados da próxima cobrança.

### Atualizar assinatura
- Endpoint: `PUT /v3/subscriptions/{id}`
- Permite alterar valor, ciclo, datas, etc.

### Cancelar assinatura
- Endpoint: `DELETE /v3/subscriptions/{id}`
- Cancela a recorrência e impede novas cobranças.

### Observações importantes
- Cada cobrança gerada pela assinatura pode ser consultada individualmente.
- Use webhooks para monitorar pagamentos, inadimplência, cancelamentos e renovações.
- O ciclo pode ser semanal, mensal, anual, bimestral, trimestral, semestral, etc.
- É possível criar assinaturas com cartão, boleto ou Pix.

> Consulte a [referência completa do endpoint de assinaturas](https://www.postman.com/asaasdev/asaas/api/1032fc01-9d0c-4877-8a48-ff31279f127b?action=share&creator=18837025) para mais detalhes.

### Exemplo breve de fluxo de assinatura mensal

- **Data de criação da assinatura:** 10/10
- **Configuração:**
  - nextDueDate: 15/10
  - cycle: MONTHLY

1. **Criação da primeira cobrança da assinatura**
   - dueDate: 15/10
   - Notificações enviadas referentes à primeira cobrança
2. **Criação da segunda cobrança da assinatura**
   - dueDate: 15/11
   - Notificação da segunda cobrança enviada em 05/11

Esse fluxo se repete conforme o ciclo definido na assinatura.

### Criando uma assinatura

Para criar uma assinatura, basta chamar o endpoint de assinaturas.

POST /v3/subscriptions
Confira a referência completa deste endpoint

JSON

{
  "customer": "cus_0T1mdomVMi39",
  "billingType": "BOLETO",
  "nextDueDate": "2023-10-15",
  "value": 19.9,
  "cycle": "MONTHLY",
  "description": "Assinatura Plano Pró"
}

O campo nextDueDate define quando será feita a primeira cobrança da assinatura, que irá seguir o ciclo conforme configurado. Os ciclos disponíveis são:

WEEKLY - Semanal
BIWEEKLY - Quinzenal (2 semanas)
MONTHLY - Mensal
QUARTERLY - Trimestral
SEMIANNUALLY - Semestral
YEARLY - Anual

A assinatura funciona como um agendador de criação de cobranças. No exemplo acima, uma nova cobrança do tipo boleto será criada mensalmente e enviada ao seu cliente, conforme configurações de notificação.

Depois de criada, você terá em mãos o ID da assinatura que segue um padrão semelhante a este: sub_VXJBYgP2u0eO.

Verificando se uma assinatura foi paga
Para saber se uma assinatura foi paga, você deve acompanhar o webhook para cobranças. Quando uma nova cobrança é criada referente a sua assinatura, você receberá um evento PAYMENT_CREATED e o campo subscription conterá o ID da sua assinatura.

Assim que a cobrança relacionada a assinatura, você receberá o evento PAYMENT_RECEIVED em caso de pagamento por boleto, como no exemplo.

Você também poderá verificar as cobranças criadas de uma assinatura através do endpoint:

GET /v3/subscriptions/{id}/payments
Confira a referência completa deste endpoit

Editar assinatura
É possível alterar todas as informações de uma assinatura do tipo BOLETO ou PIX.

POST /v3/subscriptions/{id}
Veja a referência completa deste endpoint.

Ao atualizar o valor da assinatura ou forma de pagamento somente serão afetadas mensalidade futuras. Para atualizar as mensalidades já criadas mas não pagas com a nova forma de pagamento e/ou novo valor, é necessário passar o parâmetro updatePendingPayments: true.

Recuperar cobranças da assinatura
Diferente de um parcelamento, em que no retorno da criação é devolvido o id da primeira cobrança, no caso de assinaturas, a cobrança é criada apenas depois da assinatura, e não junto, e por isso não é possível recuperar esse id no ato da criação.

Para ter acesso à primeira cobrança criada da assinatura, é necessário consumir a API uma segunda vez no endpoint:

GET /v3/subscriptions/{id}/payments
Veja a referência completa deste endpoint.

Esse endpoint irá retornar todas as cobranças já criadas nesta assinatura, assim como seus status.

### Criando assinatura com cartão de crédito

Assim como na cobrança, os dados do cartão e do portador podem ser enviados na requisição de criação da assinatura para que o pagamento já seja processado. A diferença é que no caso da cobrança o cartão do cliente é cobrado no momento da criação da mesma, já no caso da assinatura, o cartão será validado no momento da criação, porém a cobrança será feita somente no vencimento da primeira mensalidade. É importante ressaltar que a validação feita no momento a criação não garante que cobrança ocorrerá com sucesso no vencimento, pois neste meio-tempo o cartão pode ter sido cancelado, expirado, não ter limite, entre outros.

Para tal, ao executar a requisição de criação da assinatura, basta enviar os dados do cartão de crédito juntamente com os dados do titular através dos objetos creditCard e creditCardHolderInfo. Se a transação for autorizada a assinatura será criada e a API retornará HTTP 200. Caso contrário a assinatura não será persistida e será retornado HTTP 400.

📘
Dica!

Caso você queira criar uma assinatura que a primeira cobrança será cobrada no ato da criação, informe o nextDueDate como a data atual.

Uma vez criada a assinatura com cartão de crédito, a cobrança será feita mensalmente (ou outra periodicidade definida) no cartão do cliente até que ele se torne inválido ou você remova a assinatura.

🚧
Atenção

Caso você opte por capturar na interface do seu sistema os dados do cartão do cliente, é obrigatório o uso de SSL (HTTPS), caso contrário sua conta pode ser bloqueada para transações via cartão de crédito.
Para se evitar timeouts e decorrentemente duplicidades na captura, recomendamos a configuração de um timeout mínimo de 60 segundos para este request.
POST /v3/subscriptions
Confira a referência completa deste endpoint

JSON

{
  "customer": "cus_0T1mdomVMi39",
  "billingType": "CREDIT_CARD",
  "nextDueDate": "2023-10-15",
  "value": 19.9,
  "cycle": "MONTHLY",
  "description": "Assinatura Plano Pró",
  "creditCard": {
    "holderName": "marcelo h almeida",
    "number": "5162306219378829",
    "expiryMonth": "05",
    "expiryYear": "2021",
    "ccv": "318"
  },
  "creditCardHolderInfo": {
    "name": "Marcelo Henrique Almeida",
    "email": "marcelo.almeida@gmail.com",
    "cpfCnpj": "24971563792",
    "postalCode": "89223-005",
    "addressNumber": "277",
    "addressComplement": null,
    "phone": "4738010919",
    "mobilePhone": "47998781877"
  }
}

Como alterar a data de vencimento ou o valor?
Para conseguir alterar o valor ou vencimento de uma assinatura, você precisa obrigatoriamente ter a tokenização ativa em sua conta.

Essa funcionalidade permite você cobrar de seus clientes recorrentemente sem a necessidade deles informarem todos os dados de cartão de crédito novamente. Tudo isso de forma segura por meio de um token.

🚧
Atenção

A funcionalidade de tokenização está previamente habilitada em Sandbox e você já pode testá-la. Para uso em produção, é necessário solicitar a habilitação da funcionalidade ao seu gerente de contas. A habilitação da funcionalidade está sujeita a análise prévia, podendo ser aprovada ou negada de acordo com os riscos da operação.
O token é armazenado por cliente, não podendo ser utilizado em transações de outros clientes.
Para editar a assinatura você não precisa informar o token, mas precisa que ele esteja ativado em sua conta.

POST /v3/subscriptions/{id}
Veja a referência completa deste endpoint.

Além disso, ao atualizar o valor da assinatura ou forma de pagamento somente serão afetadas mensalidade futuras. Para atualizar as mensalidades já criadas mas não pagas com a nova forma de pagamento e/ou novo valor, é necessário passar o parâmetro updatePendingPayments: true.

Como alterar o cartão de crédito de uma assinatura?
Você pode atualizar o cartão de crédito de uma assinatura sem realizar uma cobrança imediata! Essa é a maneira recomendada para atualizar os dados do cartão em uma assinatura recorrente.

Atualizar sem cobrança imediata:

PUT /v3/subscriptions/{id}/creditCard
Veja a referência completa deste endpoint.

JSON

{
  "creditCard": {
    "holderName": "John Doe",
    "number": "1234567890123456",
    "expiryMonth": "4",
    "expiryYear": "2025",
    "ccv": "123"
  },
  "creditCardHolderInfo": {
    "name": "John Doe",
    "email": "john.doe@asaas.com",
    "cpfCnpj": "12345678901",
    "postalCode": "12345678",
    "addressNumber": "123",
    "addressComplement": null,
    "phone": null,
    "mobilePhone": null
  },
  "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99",
  "remoteIp": "116.213.42.532"
}

Como poderia fazer upgrade de um plano de assinatura?
Pode acontecer de você ter um cliente que fez uma assinatura mensal, mas no meio do período quer mudar o plano para um superior, mais caro, por exemplo ou migrar para o plano anual. Se você tiver a tokenização ativa na sua conta, poderá alterar o valor da assinatura e/ou data, caso contrário, o recomendado é remover a assinatura atual e criar uma nova em seguida.

Caso o seu cliente tenha valores proporcionais para acertar, recomendamos verificar as cobranças em aberto, calcular qual seria o valor extra, gerar uma nova cobrança do valor poporcional e depois editar sua assinatura para os novos valores e/ou data.

### Emitir notas fiscais automaticamente para assinaturas

Ao criar uma configuração, o Asaas irá gerar automaticamente as notas fiscais para as cobranças desta assinatura utilizando com base os valores definidos nesta configuração.

POST /v3/subscriptions/{id}/invoiceSettings
Confira a referência completa deste endpoint.

As notas serão geradas em conjunto com a criação das cobranças, tendo suas datas de emissão definidas a partir do valor enviado pelo parâmetro effectiveDatePeriod.

Caso a assinatura já possua cobranças, apenas serão geradas notas fiscais para as cobranças que se encaixam na configuração definida.

Os períodos de emissão disponíveis são:

ON_PAYMENT_CONFIRMATION - Emissão apenas quando cada cobrança for paga.
ON_PAYMENT_DUE_DATE - No dia do vencimento de cada cobrança.
BEFORE_PAYMENT_DUE_DATE - 5, 10, 15, 30 ou 60 dias antes do vencimento.
ON_DUE_DATE_MONTH - No 1º dia do mesmo mês do vencimento de cada cobrança.
ON_NEXT_MONTH - No 1º dia do mês seguinte ao mês do vencimento de cada cobrança.
Você pode informar o serviço municipal desejado enviando o identificador único do serviço do seu município por meio do atributo municipalServiceId, este pode ser obtido por meio da nossa seção de serviços municipais.

Caso a lista de serviços não seja disponibilizada, você deve obtêr o código do serviço municipal desejado manualmente junto a sua prefeitura e envia-lo por meio do atributo municipalServiceCode.

🚧
Atenção

Caso seja selecionado o período BEFORE_PAYMENT_DUE_DATE, também deve ser enviado o parâmetro daysBeforeDueDate, que determina quantos dias antes do vencimento será gerado a nota fiscal.
Os valores validos para o parâmetro daysBeforeDueDate são os inteiros: 5, 10, 15, 30 ou 60.
O parâmetro receivedOnly é necessário apenas quando utilizado o período ON_NEXT_MONTH, caso não enviado será definido como valor padrão false.

### Fluxo de bloqueio de assinatura por divergência de split

Quando uma cobrança recorrente é criada ou uma cobrança de assinatura é recebida, é verificado se o valor total do split configurado para a assinatura é superior ao valor líquido a receber. Caso isso ocorra, a assinatura será bloqueada, o split desabilitado e a criação de novas cobranças recorrentes também será interrompida. Nesse cenário, uma notificação será enviada via webhook, informando, no corpo da mensagem (propriedade additionalInfo), sobre o bloqueio e concedendo um prazo de 2 dias úteis para ajustar o split ou o valor da assinatura.

Se o ajuste do split ou do valor da assinatura for realizado dentro do prazo e o novo valor total do split estiver igual ou inferior ao valor líquido da assinatura, o desbloqueio será efetuado, permitindo a liberação da assinatura e a geração de novas cobranças com o split atualizado.

No entanto, caso o ajuste não seja feito no prazo estipulado, o bloqueio será encerrado automaticamente por expiração, e o split permanecerá desabilitado. Nesse cenário, uma nova notificação será enviada via webhook para informar sobre a expiração do bloqueio. No corpo da notificação, na propriedade additionalInfo, será incluída uma mensagem detalhando a liberação da assinatura e a criação de cobranças recorrentes sem o split configurado.

Eventos do webhook utilizados para comunicação:

Para o fluxo de bloqueio: SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK
Para o fluxo de desbloqueio por expiração do prazo: SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED 

---

## Link de Pagamento

O link de pagamentos é uma forma fácil de criar uma cobrança sem ter o cadastro do seu cliente ainda. Você pode criar cobranças avulsas, parceladas ou assinaturas. É possível definir um valor ou deixar seu cliente escolher.

Confira abaixo as principais diferenças entre criar uma cobrança e um link de pagamento:

Funcionalidade	Cobranças	Link de pagamentos
Criar uma cobrança enviando os dados do cliente	✅	❌
Criar uma cobrança sem enviar os dados do cliente	❌	✅
Cliente pode escolher o valor que irá pagar	❌	✅
Cliente pode escolher a quantidade de parcelas	❌	✅
Passo a passo para preenchimento de dados do cliente	❌	✅
É possível usar split	✅	❌

Ao criar um link de pagamento você tem acesso a um link que pode ser compartilhado para que os clientes prossigam com os pagamentos. 

### Criando um link de pagamentos

Para criar um link de pagamentos, basta chamar o endpoint de link de pagamentos.

POST /v3/paymentLinks
Confira a referência completa deste endpoint.

JSON

{
  "name": "Venda de livros",
  "description": "Qualquer livro por apenas R$: 50,00",
  "value": 50.00,
  "billingType": "UNDEFINED",
  "chargeType": "DETACHED",
  "dueDateLimitDays": 10
}

No exemplo acima, uma nova cobrança avulsa de R$ 50 será criada cada vez que um cliente preencher este link de pagamentos. Ele ficará ativo até que seja desabilitado ou deletado.

Também é possível criar link de pagamentos para pagamentos parcelados, nesse sentido você apenas informa qual a quantidade máxima de parcelas disponíveis e o cliente irá escolher qual forma deseja fazer o pagamento.

POST /v3/paymentLinks
Confira a referência completa deste endpoint.

JSON

{
  "billingType": "CREDIT_CARD",
  "chargeType": "INSTALLMENT",
  "name": "Venda de eletrônicos",
  "description": "Qualquer produto em até 10x de R$ 50,00",
  "value": 500.00,
  "maxInstallmentCount": 10,
  "notificationEnabled": false
}

No exemplo acima, como não temos BOLETO no billingType não foi necessário informar o campo dueDateLimitDays. Também definimos o notificationEnabled como false, dessa forma os clientes que preencherem este link de pagamento não terão notificações ativas.

Da mesma forma, também é possível criar links de pagamentos que criam assinaturas. Bastando informar o chargeType como RECURRENT.

POST /v3/paymentLinks
Confira a referência completa deste endpoint.

JSON

{
  "billingType": "CREDIT_CARD",
  "chargeType": "RECURRENT",
  "name": "Assinatura de livros",
  "description": "Receba um livro todo mês por R$: 50,00",
  "value": 50.00,
  "subscriptionCycle": "MONTHLY"
}

Como saber se um link de pagamentos foi pago?
Toda vez que um link de pagamentos é pago, você recebe um evento no Webhook para Cobranças. No JSON retornado você terá acesso ao campo paymentLink com o ID do seu link de pagamento.

Neste mesmo JSON você terá acesso ao customer com o ID do seu cliente, e poderá pegar os dados do mesmo caso precise usando o endpoint "Recuperar um único cliente".

Adicionando imagens em um link de pagamentos
É possível adicionar até 5 imagens em um link de pagamentos e você pode fazer isso chamando o endpoint abaixo:

POST /v3/paymentLinks/{id}/images
Confira a referência completa deste endpoint

Você pode definir se a imagem é a principal, com o campo main sendo enviado como true. O envio dos arquivos deve ser com o header Content-Type: multipart/form-data.

🚧
Duplicação de clientes em links de pagamento

No Asaas, é possível criar clientes com CPF/CNPJ duplicados. Pelo link de pagamento, como o cliente é sempre criado no momento da geração da cobrança, caso ele já exista no Asaas, o cliente será cadastrado novamente, aparecendo duas ou mais vezes (a depender da quantidade de vezes que gerou a cobrança). 

---

## Asaas Checkout

### Introdução

Saiba mais sobre o Asaas Checkout

Para iniciar no processo de criação de um Checkout Asaas, siga primeiramente as instruções de autenticação para obter a chave access_token.

Como criar um Checkout com a API do Asaas?

Se você quer criar checkouts de forma automatizada, o checkout Asaas te permite montar tudo via código — desde o tipo de cobrança até o redirecionamento do cliente depois do pagamento.

**Tenha sua chave de acesso (access_token)**
Antes de tudo, você precisa estar autenticado para usar a API. Isso é feito com o seu access_token, que funciona como sua senha de acesso para as requisições.
Se ainda não tem, acesse seu painel do Asaas e vá até Integrações > Chaves de API > Gerar chave de API.

**Monte a requisição para criar o checkout**
A criação do checkout é feita com uma requisição POST para este endpoint: https://api.asaas.com/v3/checkouts

No corpo da requisição, você define as informações do checkout, como:

- Forma de pagamento: Pix, Cartão de Crédito ou ambos.
- Tipo de cobrança: à vista, parcelada ou recorrente (assinaturas).
- Produtos ou serviços que estão sendo vendidos.
- Tempo de expiração do link de pagamento.
- Para onde o cliente será redirecionado depois da compra (URLs de sucesso, erro ou expiração).
- Dados do cliente (opcional).
- Split de pagamento (opcional, caso queira dividir o valor com outras contas). 

### Como informar os dados do cliente

No momento de criar um checkout, você tem três formas de informar os dados do cliente:

**Usando o campo customerData (dados manuais)**
Ideal para quando você ainda não tem o cliente cadastrado no Asaas ou quer preencher os dados automaticamente no checkout.

Você informa os dados diretamente no corpo da requisição.

Exemplo:

JSON

"customerData": {  
  "name": "Ana Paula",  
  "cpfCnpj": "12345678900",  
  "email": "ana@email.com",  
  "phone": "47988887777",  
  "address": "Rua das Flores",  
  "addressNumber": 123,  
  "complement": "Casa",  
  "postalCode": "89000000",  
  "province": "Centro",  
  "city": 4205407  
}
Esses dados já virão preenchidos na tela de checkout, facilitando o pagamento e reduzindo fricção para o cliente.

**Usando o campo customer (ID do cliente já cadastrado)**
Ideal para quem já cadastrou o cliente anteriormente via API ou painel Asaas.

Você só precisa informar o ID do cliente (ex: cus_000005821234), e o Asaas puxará os dados automaticamente.

Exemplo:

JSON

"customer": "cus_000005821234"
O checkout será gerado já com os dados do cliente preenchidos, como nome, e-mail, CPF, endereço, etc., conforme estão salvos no cadastro.

🚧
Atenção

Você deve usar apenas um dos dois campos: customerData ou customer.
Informar os dois ao mesmo tempo não é permitido.
Se for usar customer, certifique-se de que o cliente já exista na base do Asaas. 

**Deixando o seu cliente preencher os dados**

Caso não envie nenhuma das informações citadas acima, o seu cliente poderá informar os próprios dados diretamente na tela de checkout. 

### Checkout para Pix

Exemplo de checkout simples com Pix:

JSON

{
  "billingTypes": ["PIX"],
  "chargeTypes": ["DETACHED"],
  "minutesToExpire": 60,
  "callback": {
    "cancelUrl": "https://meusite.com/cancelado",
    "expiredUrl": "https://meusite.com/expirado",
    "successUrl": "https://meusite.com/sucesso"
  },
  "items": [
    {
      "name": "Curso de Marketing",
      "description": "Curso completo de marketing digital",
      "quantity": 1,
      "value": 297.00
    }
  ]
}

Esse exemplo cria um checkout com:

- Pagamento via Pix
- Link válido por 1 hora
- Produto chamado "Curso de Marketing" no valor de R$ 297,00
- Redirecionamento de volta para seu site

🚧
Atenção

- O campo items é obrigatório e define o que você está vendendo.
- Se você quiser preencher os dados do cliente automaticamente, pode incluir o campo customerData.
- Se estiver usando assinatura ou parcelamento, há campos extras específicos para isso. 

### Checkout para Cartão de Crédito

**Cartão de Crédito (à vista)**

Basta trocar o método de pagamento para CREDIT_CARD:

JSON

"billingTypes": ["CREDIT_CARD"]

Exemplo: Cartão de Crédito à Vista

JSON

{
  "billingTypes": ["CREDIT_CARD"],
  "chargeTypes": ["DETACHED"],
  "minutesToExpire": 60,
  "callback": {
    "cancelUrl": "https://meusite.com/cancelado",
    "expiredUrl": "https://meusite.com/expirado",
    "successUrl": "https://meusite.com/sucesso"
  },
  "items": [
    {
      "name": "Consultoria Financeira",
      "description": "Sessão única de consultoria",
      "imageBase64": "{{image1}}",
      "quantity": 1,
      "value": 150.00
    },
    {
      "description": "Camiseta Preta",
      "imageBase64": "{{image2}}",
      "name": "teste2",
      "quantity": 2,
      "value": 100.00
    }
  ],
  "customerData": {
    "name": "João da Silva",
    "cpfCnpj": "12345678909",
    "email": "joao@email.com",
    "phone": "47999998888",
    "address": "Rua das Palmeiras",
    "addressNumber": "100",
    "complement": "Apto 202",
    "postalCode": "89000000",
    "province": "Centro",
    "city": 4205407
  }
}

O cliente verá o campo para inserir os dados do cartão e fará um pagamento único (à vista). A cobrança será processada no valor total do item, sem opção de parcelamento visível.

**Cartão de Crédito (Parcelado)**

Para permitir parcelamento, adicione o tipo INSTALLMENT:

JSON

"billingTypes": ["CREDIT_CARD"],
"chargeTypes": ["DETACHED", "INSTALLMENT"]

Você também pode limitar o número máximo de parcelas com:

JSON

"installment": {
  "maxInstallmentCount": 3
}

Exemplo: Cartão de Crédito parcelado

JSON

{
    "billingTypes": [
        "CREDIT_CARD"
    ],
    "chargeTypes": [
        "INSTALLMENT"
    ],
    "minutesToExpire": 100,
    "callback": {
        "cancelUrl": "https://google.com/cancel",
        "expiredUrl": "https://google.com/expired",
        "successUrl": "https://google.com/success"
    },
    "items": [
        {
            "description": "Camiseta Branca",
            "imageBase64": "{{image1}}",
            "name": "teste2",
            "quantity": 2,
            "value": 100.00
        },
        {
            "description": "Camiseta Preta",
            "imageBase64": "{{image2}}",
            "name": "teste2",
            "quantity": 2,
            "value": 100.00
        }
    ],
    "installment": {
    "maxInstallmentCount": 6
  },
  "customerData": {
    "name": "Maria Oliveira",
    "cpfCnpj": "98765432100",
    "email": "maria@email.com",
    "phone": "47988887777",
    "address": "Av. Brasil",
    "addressNumber": "500",
    "complement": "Sala 12",
    "postalCode": "89012345",
    "province": "Centro",
    "city": 4205407
  }
}

Na tela de checkout, o cliente poderá escolher entre pagar à vista ou parcelar o valor em até 6 vezes (a quantidade das parcelas são definidas no maxInstallmentCount, nesse exemplo são 6) no cartão de crédito. O parcelamento aparecerá automaticamente conforme o valor e configurações. 

### Checkout com Assinatura (recorrente)

Caso queira que a cobrança seja em recorrência (por exemplo, todo mês), use o tipo RECURRENT:

JSON

{
    "billingTypes": [
        "CREDIT_CARD"
    ],
    "chargeTypes": [
        "RECURRENT"
    ],
    "minutesToExpire": 100,
    "callback": {
        "cancelUrl": "https://google.com/cancel",
        "expiredUrl": "https://google.com/expired",
        "successUrl": "https://google.com/success"
    },
    "items": [
        {
            "description": "Camiseta Branca",
            "imageBase64": "{{image1}}",
            "name": "teste2",
            "quantity": 2,
            "value": 100.00
        }
    ],
    "customerData": {
        "address": "Avenida Rolf Wiest",
        "addressNumber": "277",
        "city": 13660,
        "complement": "complemento",
        "cpfCnpj": "92593962046",
        "email": "testenovopagado@asaas.com",
        "name": "Teste Novo Pagador",
        "phone": "49999009999",
        "postalCode": "89223005",
        "province": "Bom Retiro"
    },
    "subscription": {
        "cycle": "MONTHLY",
        "endDate": "2025-10-31 15:02:38",
        "nextDueDate": "2024-10-31 15:02:38"
    }
}

Nesse exemplo, o checkout exibirá a opção para pagamento via cartão de crédito, e ao ser concluído, o Asaas criará uma assinatura com cobranças automáticas mensais (ou o ciclo escolhido) entre as datas indicadas. O cliente é cobrado sem precisar repetir o processo. 

### Checkout com Split de Pagamento

Você pode dividir automaticamente o valor recebido entre diferentes contas no Asaas.

Exemplo simples:

JSON

"splits": [
  {
    "walletId": "ID_DA_CARTEIRA_1",
    "fixedValue": 100.00
  },
  {
    "walletId": "ID_DA_CARTEIRA_2",
    "percentualValue": 50
  }
]

Com isso, ao receber o pagamento, o Asaas divide automaticamente o valor entre as carteiras indicadas:

- A Carteira 1 receberá R$ 100,00 fixos
- A Carteira 2 receberá 50% do valor restante 

### Link do checkout e redirecionamento do cliente

Depois de criado...

A API vai te retornar um ID único do checkout, como este:

JSON

"id": "c7b1c696-b27b-4d3d-80b9-d1c018e387f8"

Com o id retornado na requisição bem sucedida é possível exibir a tela de checkout montando a url da seguinte forma: https://asaas.com/checkoutSession/show?id=ID_RETORNADO

A tela de checkout será exibida de acordo com as informações definidas no body da requisição.

Exemplo de link:

JSON

https://asaas.com/checkoutSession/show?id=c7b1c696-b27b-4d3d-80b9-d1c018e387f8

Esse é o link que você pode enviar para seu cliente ou integrar no seu site.

Se o customerData for enviado na requisição, por exemplo, o campo de identificação e endereço virão automaticamente preenchidos. 

### Erros comuns e boas práticas

**Erros comuns**

Campos obrigatórios ausentes
JSON

{
   "errors": [
       {
           "code": "invalid_object",
           "description": "O campo items deve ser informado."
       }
   ]
}

Como evitar: Sempre preencha os campos obrigatórios:

- billingTypes
- chargeTypes
- callback com cancelUrl, expiredUrl, successUrl
- items com name, description, value, quantity

**Boas Práticas**

- Organização e clareza — Estruture suas requisições com indentação clara e nomeie bem seus itens (name, description) — isso ajuda na conversão e na visualização.
- Segurança — Mantenha seu access_token seguro e nunca exponha em repositórios públicos.
- Testes e ambiente sandbox — Use o ambiente de testes para validar integrações antes de ir para produção.
- Fluxo de expiração ajustado — Use minutesToExpire de forma estratégica.
- Experiência do cliente — Envie imagens base64 nos itens do checkout para uma tela mais visual e profissional. Preencha customerData sempre que possível para agilizar o preenchimento dos dados do cliente.
- Reaproveitamento — Cadastrou um cliente via API? Use o campo customer nas próximas vendas com esse mesmo comprador.
- Validação de regras de negócio — Confira se sua lógica de chargeTypes e billingTypes está conforme as seguintes combinações válidas: 

---

## Split de Pagamento

O split de pagamento é uma funcionalidade que permite "dividir" valores recebidos através dos pagamentos entre uma ou várias carteiras (contas ASAAS) automaticamente.

🚧  
O split de pagamentos é uma funcionalidade exclusiva da API do ASAAS, não podendo ser utilizado ou gerenciado através do uso pelo site;  
Caso não tenha uma integração API e queira utilizar o split, você poderá usar outras alternativas como o Pluga, Make ou nosso plugin para WooCommerce.  
Se a cobrança estiver sendo utilizada como garantia em uma operação de crédito, mesmo que em outra instituição financeira, o split não poderá ser realizado;  
Para realizar o split, é preciso possuir o walletId (ID da carteira) de todos os envolvidos no split. O walletId é um dado retornado automaticamente na criação de subcontas e também pode ser recuperado via requisição caso você possua a chave de API da conta destino.

Por exemplo, consideremos o seguinte cenário hipotético: João faz uma venda de R$ 200,00 e Marcelo deve receber 20% do valor da venda. Neste caso, a cobrança deve ser criada na conta do João (pois é ele quem fez venda ou prestou o serviço), e através das configurações de Split será indicado que Marcelo deve receber os 20% do valor da cobrança. Desta maneira, ao registrar o recebimento da cobrança, o Asaas fará o débito desses 20% do valor da cobrança da conta do João e creditará os 20% na conta de Marcelo.

📘  
O valor do split sempre será feito em cima do netValue que é o valor da cobrança descontados os valores de taxas aplicadas.

### Fluxo de funcionamento de um split

Ao configurar o Split é possível informar tanto valor fixo quanto percentual sobre a cobrança. No caso de percentual, o valor a ser transferido é calculado com base no valor líquido (após o desconto da tarifa do Asaas) da cobrança. Em caso de estorno da cobrança, o Split também será estornado, ou seja, todas as contas que receberam o saldo da cobrança em questão terão a transferência estornada.

#### O que preciso para utilizar o split?

Para fazer Split de cobranças é necessário que você tenha o walletId de todas as contas Asaas envolvidas nas transação.

🚧  
Não há limite no número de walletId a serem enviados no split. A limitação sempre será o valor líquido total da cobrança em casos de valores fixos e a distribuição de 100% nos splits em valores percentuais.

#### WalletId

O walletId é retornado pelo Asaas no momento da criação da conta via API. Caso você não o tenha armazenado ou a conta não tenha sido criada via API, acesse nossa seção recuperar walletId para mais detalhes sobre como obtê-lo.

🚧  
Você não deve indicar a própria carteira (walletId) ao realizar um split. Toda a diferença líquida que não foi direcionada via split será automaticamente creditada ao emissor da cobrança. Caso a própria carteira seja enviada na requisição, a API retornará uma exceção.

#### Status de Split

Os status disponíveis para Splits são:  
PENDING, AWAITING_CREDIT, CANCELLED, DONE, REFUSED e REFUNDED.

Caso o status do Split seja REFUSED também receberá o preenchimento do campo refusalReason:  
RECEIVABLE_UNIT_AFFECTED_BY_EXTERNAL_CONTRACTUAL_EFFECT: Split não executado devido à existência de efeitos de contrato.

#### Bloqueio por divergência de split

No momento em que ocorre o recebimento ou a antecipação de uma cobrança, caso o valor total do split seja superior ao valor líquido a receber, o montante e o split correspondente são bloqueados. Uma notificação via webhook é enviada, informando o bloqueio e concedendo um prazo de 2 dias úteis para ajuste do split.

Se o ajuste do split for realizado dentro do prazo e o novo valor total for igual ou inferior ao valor bloqueado, o desbloqueio é efetuado e o split processado. No entanto, caso o ajuste não seja feito dentro do prazo estipulado, o bloqueio é encerrado automaticamente por expiração, e os splits são cancelados. Nesse cenário, uma nova notificação via webhook é enviada, informando a liberação do valor e o cancelamento do split.

Eventos do webhook utilizados para comunicação:  
● Para o fluxo de bloqueio: PAYMENT_SPLIT_DIVERGENCE_BLOCK  
● Para o fluxo de desbloqueio por expiração do prazo: PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED

#### Valores permitidos para splits

Como indicado anteriormente, na criação ou atualização de splits você poderá trabalhar com valores fixos (fixedValue) ou valores percentuais (percentualValue).

O máximo possível de split aplicado em cada cobrança será o valor líquido da mesma (considerando o débito de taxas). caso trabalhe com splits fixos, ou 100% caso trabalhe com valores percentuais.

Também é possível trabalhar com as duas opções em conjunto, sendo que não há regra de prioridade para aplicação do split. O cálculo base sempre acontecerá em cima do valor líquido de sua cobrança.

Por exemplo, se você possui uma cobrança de R$100,00 no boleto bancário e sua taxa de boleto é de R$2,00, o valor líquido da mesma será de R$98,00.

Nesse cenário, se você criar um split fixo de R$50,00 e um split percentual de 50%, nessa mesma cobrança o Asaas lhe retornará uma exceção pelo seguinte motivo:

50% de R$98 (valor líquido) = R$49,00 + R$50,00 = R$99,00 (valor maior que o valor líquido).

#### Casas decimais no split

Para splits fixos (criados com fixedValue), aceitaremos apenas duas casas decimais. Ex: 9.32  
Para splits percentuais (criados com percentualValue), aceitaremos apenas quatro casas decimais. Ex: 92.3444 

### Split em cobranças avulsas

A única diferença entre a criação de uma cobrança avulsa com e sem Split se dará no envio do array split na requisição de criação de uma cobrança avulsa. Este array é chamado split e contém a lista de objetos walletId e valores a serem transferidos quando a cobrança for recebida:

JSON

{
   ...
   "splits":[
      {
         "walletId":"48548710-9baa-4ec1-a11f-9010193527c6",
         "fixedValue":20.00
      },
      {
         "walletId":"0b763922-aa88-4cbe-a567-e3fe8511fa06",
         "percentualValue":10.00
      }
   ]
}

📘  
Você só precisa adicionar informações de Split das contas que quer transferir uma parte do valor. O saldo restante fica todo na conta que emitiu a cobrança.

#### Atualizar Split da Cobrança

Para atualizar o split, basta recuperar o ID da cobrança e utilizar o método de Atualização de cobrança para realizar a atualização e informar os novos atributos de split.

JSON

{
    ...
    "splits":[
        {
            "walletId":"48548710-9baa-4ec1-a11f-9010193527c6",
            "fixedValue":10.00
        }
    ]
}

🚧  
Ao atualizar uma cobrança, caso não queira alterar as configurações do Split, não informe o parâmetro splits na requisição, pois passando null ou [] o Split será desativado.

❗️  
Se você excluir uma cobrança, as configurações de split serão removidas. Caso a cobrança seja restaurada e paga o split não estará mais configurado e não acontecerá. Portanto, caso a cobrança restaurada possuía split configurado antes da exclusão, certifique-se de configurar novamente o split.

#### Consultar Split em Cobrança

Para consultar as definições de split de uma determinada cobrança, você poderá utilizar o método de Listar Cobranças ou então Recuperar uma única cobrança.

Caso a cobrança possua split definido, a resposta lhe trará a lista de objetos das cobranças, onde você poderá visualizar o array de splits na raiz do payment. Caso o array não seja devolvido, indica que o split não está aplicado na cobrança.

Os dados de split aplicados na cobrança também serão enviados nos Webhooks disparados pelo ASAAS. 

### Split em parcelamentos

Ao utilizar o split em parcelamentos, temos duas formas de configurar a divisão do valor:

1. **Enviando o valor que deve ser aplicado em cada parcela, previamente calculado.**

Por exemplo, se você possui uma cobrança de R$100,00 que será dividida em 4 parcelas e precisará realizar um split total de R$40,00, você precisará enviar nas atribuições do split o valor de R$10,00 no campo fixedValue, sendo assim, serão aplicados R$10,00 de split para cada parcela automaticamente, garantindo o split de R$40,00 ao término da quitação do parcelamento.

JSON

{
   ...
   "totalValue":100.00,
   "installmentCount":4,
   "splits":[
      {
         "walletId":"48548710-9baa-4ec1-a11f-9010193527c6",
         "fixedValue":10.00
      }
   ]
}

2. **Enviando o valor total de split a ser abatido do valor total do parcelamento.**

Utilizando deste método o Asaas irá executar a divisão conforme o número de parcelas. Por exemplo, se você possui uma cobrança de R$300,00 que será dividida em 3 parcelas e precisará realizar um split total de R$100,00, você deve enviar nas atribuições do split o valor de R$100,00 no campo totalFixedValue, sendo assim, serão aplicados splits de R$33,33; R$33,33 e R$33,34 para cada parcela respectivamente de forma automática, garantindo o split de R$100,00 ao término da quitação do parcelamento.

JSON

{
   ...
   "totalValue":300.00,
   "installmentCount":3,
   "splits":[
      {
         "walletId":"0b763922-aa88-4cbe-a567-e3fe8511fa06",
         "totalFixedValue":100.00
      }
   ]
}

Para splits em porcentagem, o valor de percentualValue será aplicado a cada parcelamento da cobrança, então por exemplo se você tem uma cobrança de R$300,00 parcelados em 3 vezes com o percentualValue de 6% então em cada parcela o split será de R$6,00, assim totalizando R$18,00 de split nesta cobrança.

JSON

{
   ...
   "totalValue":100.00,
   "installmentCount":3,
   "splits":[
      {
         "walletId":"0b763922-aa88-4cbe-a567-e3fe8511fa06",
         "percentualValue": 6
      }
   ]
}

Caso precise aplicar um valor percentual em cima do valor total da cobrança, você pode calcular a porcentagem desejada e atribuir como um valor fixo no campo totalFixedValue. 

---

### Split em assinaturas

A única diferença entre a criação de uma assinatura com e sem Split se dará no envio do array split na requisição de criação de uma assinatura. Este array é chamado split e contém a lista de objetos walletId e valores a serem transferidos quando a cobrança for recebida.

JSON

{
    ...
    "splits":[
        {
            "walletId":"48548710-9baa-4ec1-a11f-9010193527c6",
            "fixedValue":20.00
        },
        {
            "walletId":"0b763922-aa88-4cbe-a567-e3fe8511fa06",
            "percentualValue":10.00
        }
    ]
}

🚧
O split configurado na assinatura servirá como um template, que será utilizado na criação de cada nova cobrança.

#### Atualizar Split da Assinatura

Para atualizar o split, basta recuperar o ID da assinatura e utilizar o método de Atualização de assinatura para realizar a atualização e informar os novos atributos de split.

JSON

{
    ...
    "splits":[
        {
            "walletId":"48548710-9baa-4ec1-a11f-9010193527c6",
            "fixedValue":10.00
        }
    ]
}

🚧
Ao atualizar uma assinatura, caso não queira alterar as configurações do Split, não informe o parâmetro splits na requisição, pois passando null ou [] o Split será desativado.

Cobranças já geradas não irão ser atualizadas. Para atualizar o split de cobranças já geradas será necessário fazê-lo manualmente em cada cobrança da assinatura, atualizando as cobranças.

#### Consultar Split em Assinatura

Para consultas as definições de split de uma determinada assinatura, você poderá utilizar o método de Listar Assinaturas ou então Recuperar uma única assinatura.

---

### Split em cobranças antecipadas

Caso você decida antecipar cobranças que possuam split aplicados, será preciso se atentar a algumas regras para uso de ambas as funcionalidades.

#### Split em valores fixos

Na antecipação de cobranças com split em valores fixos, no momento de definir os valores do split, é preciso observar que o valor máximo a ser aplicado como split será o valor líquido da cobrança, já deduzindo as taxas do Asaas e também as taxas da antecipação.

Caso o valor de split configurado exceda o valor final a ser recebido após a antecipação, não será possível prosseguir com a solicitação de antecipação no Asaas.

#### Split em valores percentuais

Na antecipação de cobranças com split em valores percentuais, o Asaas realizará o cálculo do valor a ser aplicado como split com base no valor líquido final que será recebido após a antecipação.

Ou seja, o valor final de crédito já antecipado será a base para o cálculo do percentual.

Por exemplo, se houver um split de 100% configurado em uma cobrança que foi antecipada, todo o valor recebido após o crédito da antecipação será aplicado como split seguindo a regra percentual.

---

### Consulta de splits via interface

É possível acompanhar o andamento de seus splits pagos e recebidos através da interface do Asaas. No menu principal, ao lado esquerdo, o menu Split de Pagamentos estará disponível caso sua conta tenha splits configurados.

Se desejar ver as estatísticas via API, você pode usar o endpoint de Recuperar valores de split.

📘
Essa opção não está disponível para contas white label, já que o cliente não tem acesso à aplicação web.

Nesta tela você também pode filtrar como desejar e exportar os dados em CSV.

---

## Notificações

### Introdução

As notificações são a maneira que o Asaas utiliza para manter você e seu cliente atualizados sobre a situação das cobranças, notificar recebimento, atraso, modificações, etc. É possível desabilitar todas as notificações para um determinado cliente utilizando o atributo notificationDisabled na criação de um novo cliente.

O Asaas envia notificações por WhatsApp, E-mail, SMS, Correios e Robô de Voz. Confira as notificações padrões que são configuradas para todos os clientes.

🚧
Taxas são aplicadas no envio de notificações de cobrança. Confira os valores na seção de Taxas no Minha conta.

📘
Para ativar notificações por voz (phoneCallEnabledForCustomer: true) é necessário que o cliente possua um telefone fixo ou móvel cadastrado.

Para saber mais sobre o produto de notificações clique aqui.

### Notificações padrões

Por padrão, a API cria as seguintes notificações ao cadastrar um novo cliente:

**Aviso de cobrança criada:**
Notificação é enviada no momento em que a cobrança é criada, exceto para cobranças criadas por assinaturas.

JSON

    {
        "object": "notification",
        "id": "not_NhHT6M5yUe0C",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": false,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": false,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_CREATED",
        "scheduleOffset": 0,
        "deleted": false
    }

**Aviso no dia do vencimento:**
Notificação enviada na data em que a cobrança vence.

JSON

    {
        "object": "notification",
        "id": "not_1igKsZL9xpsl",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": false,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": false,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_DUEDATE_WARNING",
        "scheduleOffset": 0,
        "deleted": false
    }

**Aviso de cobrança recebida**
Notificação enviada no momento em que o Asaas registra o recebimento de uma cobrança.

JSON

    {
        "object": "notification",
        "id": "not_f8JpoWuEjEKd",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": true,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": false,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_RECEIVED",
        "scheduleOffset": 0,
        "deleted": false
    }

**Linha digitável no dia do vencimento:**
Notificação enviada na data de vencimento da cobrança caso a fatura ou boleto não tenham sido visualizados pelo seu cliente.

JSON

    {
        "object": "notification",
        "id": "not_AWAz6FbrgCPG",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": false,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": false,
        "whatsappEnabledForCustomer": false,
        "event": "SEND_LINHA_DIGITAVEL",
        "scheduleOffset": 0,
        "deleted": false
    }

**Aviso de cobrança vencida**
Notificação enviada no momento em que o Asaas identifica que a cobrança venceu e não foi paga.

JSON

    {
        "object": "notification",
        "id": "not_2DMytOpRKux1",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": true,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": true,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_OVERDUE",
        "scheduleOffset": 0,
        "deleted": false
    }

**Aviso a cada 7 dias após vencimento:**
Notificação enviada a cada 7 dias enquanto a cobrança não for paga.

📘
Você pode notar que temos duas notificações com o evento PAYMENT_OVERDUE, porém esta existe a configuração do scheduleOffset definida, porém os IDs das notificações são diferentes.

JSON

    {
        "object": "notification",
        "id": "not_EDaloT543tss",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": false,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": true,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_OVERDUE",
        "scheduleOffset": 7,
        "deleted": false
    }

**Aviso 10 dias antes do vencimento:**
Notificação enviada 10 dias antes da data de vencimento da cobrança.

📘
Você pode notar que temos duas notificações com o evento PAYMENT_DUEDATE_WARNING, porém esta existe a configuração do scheduleOffset definida, porém os IDs das notificações são diferentes.

JSON

    {
        "object": "notification",
        "id": "not_uf8KkANRwUgh",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": false,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": false,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_DUEDATE_WARNING",
        "scheduleOffset": 10,
        "deleted": false
    }

**Aviso de cobrança atualizada:**
Notificação enviada sempre que alguma cobrança sofre alteração de data de vencimento ou valor.

JSON

    {
        "object": "notification",
        "id": "not_0YmiEVhOUsyJ",
        "customer": "cus_Y4AEif5zrMGK",
        "enabled": true,
        "emailEnabledForProvider": false,
        "smsEnabledForProvider": false,
        "emailEnabledForCustomer": true,
        "smsEnabledForCustomer": true,
        "phoneCallEnabledForCustomer": false,
        "whatsappEnabledForCustomer": false,
        "event": "PAYMENT_UPDATED",
        "scheduleOffset": 0,
        "deleted": false
    }

### Alterando notificações de um cliente

Cada cliente possui configurações de notificação e o Asaas sempre olhará para elas quando uma nova cobrança for criada. Você pode ligar ou desligar notificações, mudar a quantos dias antes elas serão enviadas ou definir que tipo de notificações acontecerão sempre que criar um novo cliente.

O primeiro passo, depois de ter criado seu cliente é verificar quais notificações foram criadas. Para isso basta chamar o endpoint "Recuperar notificações de um cliente".

GET /v3/customers/{id}/notifications
Confira a referência completa deste endpoint.

Ao chamar este endpoint, uma lista com todas as notificações criadas para este cliente será retornada:

JSON

{
  "object": "list",
  "hasMore": false,
  "totalCount": 8,
  "limit": 10,
  "offset": 0,
  "data": [
    {
      "object": "notification",
      "id": "not_000042762597",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": true,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_RECEIVED",
      "scheduleOffset": 0,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762598",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": true,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_OVERDUE",
      "scheduleOffset": 0,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762602",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": false,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_DUEDATE_WARNING",
      "scheduleOffset": 10,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762601",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": false,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_DUEDATE_WARNING",
      "scheduleOffset": 0,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762599",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": false,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_CREATED",
      "scheduleOffset": 0,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762600",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": false,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_UPDATED",
      "scheduleOffset": 0,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762604",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": false,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "SEND_LINHA_DIGITAVEL",
      "scheduleOffset": 0,
      "deleted": false
    },
    {
      "object": "notification",
      "id": "not_000042762603",
      "customer": "cus_000005358829",
      "enabled": true,
      "emailEnabledForProvider": false,
      "smsEnabledForProvider": false,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false,
      "event": "PAYMENT_OVERDUE",
      "scheduleOffset": 7,
      "deleted": false
    }
  ]
}

Tendo em mão os o ID de cada notificação você pode editá-la.

🚧
As notificações são fixas e criadas pelo Asaas não é possível excluí-las ou criar novas, apenas alterar.

Você pode escolher editar apenas uma notificação, fazendo a chamada ao endpoint "Atualizar notificação existente":

POST /v3/notifications/not_000042762599
Confira a referência completa deste endpoint.

JSON

{
  "enabled": true,
  "emailEnabledForProvider": false,
  "smsEnabledForProvider": false,
  "emailEnabledForCustomer": true,
  "smsEnabledForCustomer": false,
  "phoneCallEnabledForCustomer": false,
  "whatsappEnabledForCustomer": false
}

No exemplo acima modificamos a notificação de criação de pagamento para enviar somente um e-mail ao cliente.

Você também pode alterar todas as notificações juntas e deixar somente as notificações que você quiser ativadas, por exemplo, usando o endpoint "Atualizar notificações em lote":

POST /v3/notifications/batch
Confira a referência completa deste endpoint.

JSON

{
  "customer": "cus_Y4AEif5zrMGK",
  "notifications": [
    {
      "id": "not_f8JpoWuEjEKd",
      "enabled": true,
      "emailEnabledForProvider": true,
      "smsEnabledForProvider": true,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false
    },
    {
      "id": "not_f8JpoWuEjEKd",
      "enabled": true,
      "emailEnabledForProvider": true,
      "smsEnabledForProvider": true,
      "emailEnabledForCustomer": true,
      "smsEnabledForCustomer": true,
      "phoneCallEnabledForCustomer": false,
      "whatsappEnabledForCustomer": false
    }
  ]
}

---

## Webhook

### Introdução

Um Webhook é uma forma automatizada de enviar informações entre sistemas quando certos eventos ocorrem. Quando você ativa um Webhook, ele passará a enviar requisições POST para o endereço configurado sempre que determinado evento acontecer. Essa requisição incluirá informações sobre o evento e o recurso envolvido.

**Por que usar Webhooks?**
Se você deseja que os dados de pagamento ou informações de clientes estejam sempre sincronizados com sua aplicação, os Webhooks são a melhor solução. Eles funcionam como uma "API reversa", onde o Asaas realizará uma chamada HTTP REST na sua aplicação.

Para habilitar o recebimento de eventos de webhooks você precisa configurar a URL que receberá os eventos, o que pode ser feito via interface, acessando a aplicação web, ou via API. É possível cadastrar até 10 URLs de webhooks diferentes, e em cada uma você define quais eventos quer receber.

#### Habilitando um Webhook
Para ativar os Webhooks você deve acessar a área de Integrações do Asaas, na aba de Webhooks, e informar a URL da sua aplicação que deve receber o POST do Asaas. Você também pode configurar Webhooks via API. Confira os guias:

- Criar novo Webhook pela aplicação web
- Criar novo Webhook pela API

#### Boas práticas no uso de Webhooks
Utilize estas práticas para garantir que sua integração com Webhooks seja segura e funcione adequadamente.

- **Gerencie eventos duplicados**
  - Os webhooks garantem a entrega "at least once" (ao menos uma entrega). Isso significa que seu endpoint pode receber ocasionalmente o mesmo evento de webhook mais de uma vez. Você pode ignorar eventos duplicados utilizando idempotência. Uma maneira de fazer isso é registrando os eventos que já foram processados e ignorá-los caso sejam enviados novamente. Cada evento enviado pelos Webhooks possui um ID próprio, que se repete caso se trate do mesmo evento.

- **Configure apenas os tipos de eventos necessários para sua aplicação**
  - Configure apenas os tipos de eventos necessários para sua aplicação em cada Webhook. Receber tipos de eventos adicionais (ou todos os tipos de eventos) sobrecarrega seu servidor e não é recomendável.

- **Gerencie os eventos de forma assíncrona**
  - Você pode encontrar problemas de escalabilidade se optar por eventos síncronos ou ter problemas de sobrecarregamento no host em caso de picos de eventos em endpoints, por isso é melhor implementar o processamento da fila de eventos de forma assíncrona.

- **Verifique se os eventos foram enviados a partir do Asaas**
  - Para impedir que a sua aplicação receba requisições de outras origens, você tem a opção de utilizar um token para autenticar as requisições vindas do Asaas. Este token pode ser informado na configuração do Webhook. O token informado será enviado em todas as notificações no header asaas-access-token.

- **Retorne o mais rápido possível uma resposta de sucesso**
  - Para que o Asaas considere a notificação como processada com sucesso, o status HTTP da resposta deve ser maior ou igual a 200 e menor que 300. A sincronização é feita toda vez que há uma mudança em um evento, e caso seu sistema falhe em responder sucesso 15 vezes consecutivas, a fila de sincronização será interrompida. Novas notificações continuam sendo geradas e incluídas na fila de sincronia, porém não são enviadas para a sua aplicação. Após certificar-se que seu sistema responderá uma resposta de sucesso para o Asaas, basta reativar fila de sincronia acessando a área Minha Conta, aba Integração. Todos os eventos pendentes serão processados em ordem cronológica.

- **Fique atento para eventuais falhas de comunicação**
  - Se a sua aplicação retornar qualquer resposta HTTP que não é da família 200, a sua fila de eventos será interrompida e você receberá um e-mail de comunicação do Asaas para deixá-lo ciente disso. Fique atento para evitar ter problemas de sincronização de eventos.

❗️ **Atenção**

O Asaas guarda eventos de Webhooks por 14 dias. Você receberá um e-mail caso haja algum problema de comunicação e seus Webhooks pararem de funcionar.
Caso sua fila seja pausada, é de extrema importância que você resolva qualquer problema em até 14 dias para evitar perder informações importantes.
Os eventos que estiverem mais de 14 dias parados na fila serão excluídos permanentemente.

### Criar novo Webhook pela aplicação web

Você pode criar novos Webhooks utilizando a aplicação Web do Asaas, para isso acesse Menu do usuário > Integrações > Webhooks.

Em seu primeiro acesso você irá visualizar um botão para criar seu primeiro Webhook.

Ao clicar em "Criar Webhook" um formulário para mais informações irá aparecer. Na primeira etapa você precisa:

- Definir um nome;
- Definir a URL que receberá as informações dos eventos;
- Cadastrar um e-mail que será notificado em caso de erros de comunicação;
- Qual a versão da API;
- Definir um token de autenticação ou não: este token será enviado no header asaas-access-token em todas as chamadas do Asaas para sua aplicação;
- Se a fila de sincronização está ativada;
- Se o Webhook está ativado;
- Qual o tipo de envio: confira o artigo sobre os tipos de envio disponíveis.

Em sequência à configuração você precisará selecionar os eventos que deseja receber. Você pode conferir a lista completa de eventos na nossa documentação, basta selecionar os eventos que quiser receber em diversos produtos diferentes.

Você poderá ter até 10 Webhooks configurados por conta sem restrições de endereços. Você também pode editar ou excluir Webhooks criados.

### Criar novo Webhook pela API

Você pode criar novos Webhooks através da API, tanto para contas raiz quanto para subcontas. Você pode ter até 10 Webhooks configurados na sua conta e é você quem escolhe quais eventos cada Webhook irá receber.

Para criar um novo Webhook, vamos realizar uma chamada ao endpoint de Criar novo Webhook.

POST /v3/webhooks
Confira a referência completa deste endpoint

JSON

{
    "name": "Nome Exemplo",
    "url": "https://www.exemplo.com/webhook/asaas",
    "email": "marcelo.almeida@gmail.com",
    "enabled": true,
    "interrupted": false,
    "authToken": null,
    "sendType": "SEQUENTIALLY",
    "events": [
        "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
        "PAYMENT_CHECKOUT_VIEWED",
        "PAYMENT_BANK_SLIP_VIEWED",
        "PAYMENT_DUNNING_REQUESTED",
        "PAYMENT_DUNNING_RECEIVED",
        "PAYMENT_AWAITING_CHARGEBACK_REVERSAL",
        "PAYMENT_CHARGEBACK_DISPUTE",
        "PAYMENT_CHARGEBACK_REQUESTED",
        "PAYMENT_RECEIVED_IN_CASH_UNDONE",
        "PAYMENT_REFUND_IN_PROGRESS",
        "PAYMENT_REFUNDED",
        "PAYMENT_RESTORED",
        "PAYMENT_DELETED",
        "PAYMENT_OVERDUE",
        "PAYMENT_ANTICIPATED",
        "PAYMENT_RECEIVED",
        "PAYMENT_CONFIRMED",
        "PAYMENT_UPDATED",
        "PAYMENT_CREATED",
        "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
        "PAYMENT_APPROVED_BY_RISK_ANALYSIS",
        "PAYMENT_AWAITING_RISK_ANALYSIS",
        "PAYMENT_AUTHORIZED"
    ]
}

Na chamada acima, criamos um novo Webhook que receberá praticamente todos os eventos de cobrança existentes.

Pela API você também pode editar, excluir ou deletar os Webhooks da sua conta. Para listar todos os Webhooks, utilize o endpoint como uma chamada GET.

GET /v3/webhooks
Confira a referência completa deste endpoint

A partir deste endpoint você também pode verificar quais dos seus Webhooks estão com a fila interrompida.

### Receba eventos do Asaas no seu endpoint de Webhook

Configure uma URL de webhook para manter sua aplicação sempre atualizada com a integração da API.

Siga este tutorial para criar seu primeiro Webhook.

#### O objeto de evento
Eventos são objetos enviados em formato JSON via webhooks do Asaas. Eles são responsáveis por avisar quando algum evento aconteceu em sua conta.

Através dele você terá acesso ao id, event indicando qual seu evento e o objeto da entidade da qual o evento pertence, no exemplo abaixo temos o objeto payment com os dados da cobrança em questão.

JSON

{
   "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
   "event":"PAYMENT_RECEIVED",
   "dateCreated": "2024-06-12 16:45:03",
   "payment":{
      "object":"payment",
      "id":"pay_080225913252",
      ...
   }
}

Os webhooks são a forma que você usa para inscrever-se em eventos e receber notificações na sua aplicação sempre que o evento acontece.

#### Tipos de eventos
Os eventos são divididos por categorias relacionadas à entidade ao qual eles pertencem. Confira a página Eventos de Webhooks para conferir cada um.

#### Comece por aqui
Para começar a receber eventos através de webhooks na sua aplicação, siga os passos abaixo:

1. Acesse o ambiente de Sandbox;
2. Crie um endpoint na sua aplicação para receber requests HTTP do tipo POST;
3. Configure seu webhook usando nossa aplicação web ou via API;
4. Teste seu webhook;
5. Realize debug em problemas com eventos;
6. Após testado e validado, replique a configuração no ambiente de Produção;
7. Mantenha seu webhook seguro.

#### Crie um endpoint
Crie um endpoint que espera receber um objeto de evento em um evento de POST. Este endpoint também deve retornar o mais rápido possível uma resposta 200, para evitar problemas na fila de sincronização de eventos.

Abaixo um exemplo básico usando Node.js:

```js
const express = require('express');
const app = express();

app.post('/payments-webhook', express.json({type: 'application/json'}), (request, response) => {
  const body = request.body;

  switch (body.event) {
    case 'PAYMENT_CREATED':
      const payment = body.payment;
      createPayment(payment);
      break;
    case 'PAYMENT_RECEIVED':
      const payment = body.payment;
      receivePayment(payment)
      break;
    // ... trate outros eventos
    default:
      console.log(`Este evento não é aceito ${body.event}`);
  }

  // Retorne uma resposta para dizer que o webhook foi recebido
  response.json({received: true});
});

app.listen(8000, () => console.log('Running on port 8000'));
```

#### Configure seu webhook
Você pode realizar a configuração de um novo webhook via aplicação web ou via API.

Recomendamos, para testar seu webhook e sua integração, que você primeiro crie uma conta em Sandbox. Confira nossa documentação sobre o Sandbox e siga os passos. Você também pode seguir os tutoriais de criação de webhook:

- Criar novo webhook pela aplicação web
- Criar novo webhook pela API

#### Teste seu webhook
Com o webhook em Sandbox configurado, você pode testar seu código que está em localhost usando algumas aplicações que expõem o seu código local na web.

Recomendamos usar uma aplicação de confiança como o ngrok ou o Cloudflare Tunnel. Com ambas aplicações você pode definir uma url que pode utilizar na configuração do seu webhook.

#### Debugar integração com webhooks
Você pode facilmente debugar seu webhook através da nossa página de logs de Webhooks. Acesse Menu do Usuário > Integrações > Logs de Webhooks.

Nesta página você poderá visualizar todas as requisições enviadas via webhook para sua aplicação, qual o status retornado pelo seu servidor e também qual o conteúdo enviado. Essa página é relevante também quando você tiver problemas com a fila de sincronização pausada, confira a documentação para mais detalhes.

#### Mantenha seu webhook seguro
É altamente recomendado que você mantenha sua integração e todos os seus webhooks seguros. Como recomendação, o Asaas sugere:

- Confie somente nos IPs do Asaas para chamadas em webhooks: você pode realizar o bloqueio via firewall em todos os IPs que realizam chamadas nas suas URLs de webhooks, exceto os IPs oficiais do Asaas.
- Configure um accessToken: ao criar um novo webhook, você pode definir um código único para ele. Crie uma hash forte, de preferência um UUID v4, e confira sempre o header asaas-access-token para certificar que esta é uma chamada legítima.

### Como implementar idempotência em Webhooks

Os webhooks do Asaas garantem que os eventos serão enviados ao menos uma vez, ou seja, seguem a premissa "at least once". Isso significa que seu endpoint pode, ocasionalmente, receber o mesmo evento de webhook repetidamente em algumas situações esporádicas. Como, por exemplo, numa situação em que o Asaas não recebe uma resposta do seu endpoint.

Dito isso, o ideal é que sua aplicação saiba tratar os eventos recebidos com duplicidade utilizando idempotência e este artigo tem o objetivo de explicar como a idempotência funciona e como você pode proteger a sua aplicação.

#### O que é idempotência?
Idempotência se refere a capacidade que uma operação (função) tem de retornar constantemente o mesmo resultado independente da quantidade de vezes que possa ser executada, desde que os parâmetros se mantenham sempre os mesmos.

Trazendo para o contexto de webhook, se o Asaas ocasionalmente enviar o mesmo webhook duas vezes, o ideal é que a sua aplicação responda às duas requisições com HTTP Status 200, mantendo sempre o mesmo retorno da primeira requisição recebida.

#### Por que usar idempotência?
Antes de explicarmos o porquê de utilizar idempotência, vamos analisar os principais verbos HTTP: GET, PUT, DELETE e POST.

Aplicando os padrões REST corretamente na sua aplicação, os verbos GET, PUT e DELETE serão sempre idempotentes:

- O GET é um verbo de consulta que não altera o estado do recurso.
- O PUT, se executado diversas vezes com os mesmos parâmetros, sempre retornará o mesmo resultado.
- O DELETE na primeira requisição torna o estado do recurso como "excluído", mesmo que sejam enviadas outras requisições de DELETE, o estado do recurso se manterá o mesmo.

No entanto, o verbo POST é o único dos verbos HTTPs que não possui o comportamento de idempotência por padrão:

- O POST pode criar um novo recurso único a cada vez que a operação for executada.

Os webhooks que são disparados pelo Asaas, por padrão, utilizam o verbo POST e é por isso que é importante que a sua aplicação aplique o conceito de idempotência para que o recebimento de webhooks repetidos não interfira na lógica aplicada pelo seu sistema.

#### Estratégias de idempotência

##### Usando um index único no banco de dados
Os eventos enviados pelos Webhooks do Asaas possuem IDs únicos e, mesmo que eles sejam enviados mais de uma vez, você sempre receberá o mesmo ID. Uma das estratégias é criar uma fila de eventos no seu banco de dados e utilizar esse ID como uma chave única, desta maneira você não conseguirá salvar dois IDs iguais

SQL

```sql
CREATE TABLE asaas_events (
    id bigint PRIMARY KEY,
    asaas_event_id text UNIQUE NOT NULL,
    payload JSON NOT NULL,
    status ENUM('PENDING','DONE') NOT NULL
    [...]
);
```

O indicado é que ao receber o evento do Asaas na sua aplicação, você salve essa informação em uma tabela como mostrada acima e responda 200 para o Asaas para indicar o recebimento com sucesso. Lembre-se de retornar 200 somente após a confirmação da persistência do evento na sua tabela no banco de dados, pois não garantimos que este evento será reenviado automaticamente.

Após isso, crie uma rotina de processamento, como Cron Jobs ou Workers, para processar os eventos persistidos e não processados (status = PENDING), assim que finalizar o seu processamento, marque-os com o status DONE ou simplesmente remova o registro da tabela. Caso a ordem dos eventos seja importante para o seu sistema, lembre-se de buscar e processá-los de forma ascendente.

Node.js

```js
const express = require('express');
const app = express();

app.post('/asaas/webhooks/payments', express.json({type: 'application/json'}), async (request, response) => {
  const body = request.body;
  const eventId = body.id;
  const eventType = body.event;
  const payload = body; // Salvar o payload inteiro para verificar o "event" no processamento
  const status = "PENDING";
  
  await client
    .query("INSERT INTO asaas_events (asaas_event_id, payload, status) VALUES ($1, $2, $3)", [eventId, payload, status])
    .catch((e) => {
      // PostgreSQL code for unique violation
      if (e.code == "23505") {
        response.json({received: true});
        return;
      }
      throw e;
    });

  // Retorne uma resposta para dizer que o webhook foi recebido
  response.json({received: true});
});

app.listen(8000, () => console.log('Running on port 8000'));
```

Se o seu sistema recebe mais de centenas de milhares de eventos por dia, a indicação é utilizar uma solução de fila mais robusta, como Amazon SQS, RabbitMQ ou Kafka.

Nesta solução, além de resolver o ponto da idempotência, a sugestão também é que o processamento dos eventos seja assíncrono, logo tendo uma resposta mais rápida para o Asaas e uma vazão maior da fila de eventos enviados.

##### Salvar eventos já processados
Outra estratégia comum é realizar o processamento dos Webhooks e salvar o ID de cada evento em uma tabela.

SQL

```sql
CREATE TABLE asaas_processed_webhooks (
    id bigint PRIMARY KEY,
    asaas_evt_id text UNIQUE NOT NULL,
    [...]
);
```
Dessa forma você pode sempre verificar essa tabela quando receber um novo evento e verificar se o ID já foi processado anteriormente.

Node.js

```js
const express = require('express');
const app = express();

app.post('/asaas/webhooks/payments', express.json({type: 'application/json'}), async (request, response) => {
  const body = request.body;

  const eventId = body.id;

  await client
    .query("INSERT INTO asaas_processed_webhooks (asaas_evt_id) VALUES ($1)", [eventId])
    .catch((e) => {
      // PostgreSQL code for unique violation
      if (e.code == "23505") {
        response.json({received: true});
        return;
      }
      throw e;
    });

  switch (body.event) {
    case 'PAYMENT_CREATED':
      const payment = body.payment;
      createPayment(payment);
      break;
    // ... trate outros eventos
    default:
      console.log(`Este evento não é aceito ${body.event}`);
  }

  // Retorne uma resposta para dizer que o webhook foi recebido
  response.json({received: true});
});

app.listen(8000, () => console.log('Running on port 8000'));
```

Nesta solução, a tabela é usada como um check após o processamento, esse que é feito ainda nos 10s de limite de timeout que o Asaas tem da requisição.

### Polling vs. Webhooks

#### Por que é melhor usar Webhooks?

Digamos que um cliente entra no seu site/aplicação e realiza uma compra. O seu serviço de compras irá receber uma requisição, que irá enviar para o serviço de pagamentos, que irá chamar um gateway de pagamento do Asaas, correto?

Depois disso você tem duas formas de receber informações do Asaas:

**Fazer polling**
Após ter criado uma cobrança, a sua aplicação faz várias requisições no Asaas para verificar o status do pagamento, até que o Asaas retorne que ela foi paga.

Porém esta prática tem pontos negativos. Fazer polling implica em usar recursos tanto do lado da sua aplicação como no lado do Asaas. Podendo inclusive fazer sua chave de API ser bloqueada por quota limit.

**Webhooks**
Basicamente é um "me avise de volta em determinada URL quando você tem atualizações nesta cobrança". Quando o Asaas finalizar o processamento de um pagamento, você receberá em sua URL configurada o status do mesmo.

Dessa forma o paradigma mudou e o seu serviço de pagamento não precisa gastar recursos para verificar o status de uma cobrança.

Algumas dicas interessantes na hora de usar Webhooks:

- Você deve desenvolver uma API do seu lado responsável por receber as requisições do Webhook;
- É interessante que você crie regras no seu endpoint por razões de segurança. O Asaas possibilita que você defina uma authToken para cada Webhook, por exemplo;
- Caso algum problema aconteça na comunicação com sua API a sua fila é interrompida e você recebe um e-mail de aviso.

Além da economia de recursos, os Webhooks são uma garantia de que sua aplicação receberá um evento sempre que algo mudar no gateway. O polling pode funcionar para verificar se uma cobrança foi paga, porém não te avisará em caso de atraso no pagamento de um boleto ou quando o pagamento de um cartão de crédito efetivamente caiu na sua conta.

A utilização de Webhooks é a forma mais prática e segura de manter sua aplicação atualizada sobre tudo que acontece no gateway do Asaas.

### Tipos de envio

Os Webhooks possuem dois tipos de envio disponíveis: sequencial e não sequencial.

#### Qual a diferença entre os tipos de envio?
No envio Sequencial os eventos são enviados na ordem em que ocorreram. Já no envio Não sequencial, os eventos são enviados sem ordem e fluirão melhor, sendo que não é preciso esperar um envio terminar para começar outro.

#### Envio Sequencial
Um exemplo comum de envio sequencial é quando você quer que os eventos cheguem na mesma ordem em que o seu cliente realizou as ações.

No exemplo acima podemos ver que os eventos de um mesmo pagamento são enviados na sequência de que aconteceram. Dessa forma sabemos que o pagamento da cobrança foi realizado após o vencimento.

#### Envio Não sequencial
Quando você tem um ou poucos eventos selecionados para um Webhook você pode optar pelo envio Não Sequencial. Por exemplo um Webhook para verificar sucesso em transferências, caso você configure apenas os eventos para confirmar se uma transferência foi confirmada ou cancelada, você só receberá um evento por entidade e não precisa se preocupar com a sequencia em qual os eventos serão enviados.

No envio Não sequencial os eventos são enviados mais rapidamente, sem aguardar que os outros concluam e podem vir de várias entidades diferentes.

### Logs de Webhooks

❗️
O Asaas guarda eventos de Webhooks por 14 dias. Você receberá um e-mail caso haja algum problema de comunicação.

Caso sua fila seja pausada, é de extrema importância que você resolva qualquer problema para evitar perder informações importantes.

⚠️ Os eventos que estiverem mais de 14 dias parados na fila serão excluídos permanentemente.

É possível visualizar os Webhooks enviados e quais erros aconteceram, com detalhes na página de Logs de Webhooks na área de Integrações. Você também pode checar e configurar Webhooks via API, só não é possível visualizar os logs neste caso.

- Logs de Webhooks para você verificar erros que aconteceram de comunicação.

#### Visualização de logs de Webhooks de subcontas
Os logs de requisições e de Webhooks das subcontas estão disponíveis para a conta principal consultar via interface. No menu Integrações, nas abas de Logs de Requisições e Logs de Webhooks, utilize o filtro: "Tipo de Conta" e quando você seleciona "subcontas", um novo campo aparece para buscar pelo identificador da subconta. O campo Identificador da subconta é descritivo e só pode ser buscado uma subconta por vez.

### Fila pausada: Erro 400 (Bad Request)

O que fazer quando vejo este erro nos logs de Webhooks do Asaas?

O erro 400 geralmente significa que nós enviamos a solicitação, mas o sistema não conseguiu recebê-la por uma diferença na formatação esperada, como um atributo não-tratado, ou um retorno esperado que não é enviado por nós.

É importante verificar em nossas abas de webhook no menu lateral da documentação o modelo de payload enviado por nós, e se certificar de que seu sistema esteja tratando todos os eventos e que não esteja esperando atributos não-existentes.

### Erro 403 (Forbidden)

O que fazer quando vejo este erro nos logs de Webhooks do Asaas?

Esse tipo de retorno geralmente acontece quando o seu Firewall está bloqueando as conexões do Asaas para disparo das informações.

Nesse caso, precisa verificar as configurações do seu Firewall, seguindo essas orientações:

**Possíveis ajustes no seu firewall:**
Recomendamos certificar-se que o seu firewall não irá bloquear as requisições vindas do Asaas. Uma das maneiras de garantir isso é liberar todo o tráfego vindo dos IPs oficiais do Asaas.

Obs.: em sandbox podem haver outros IPs que necessitem de liberação.

O Asaas envia a requisição de webhook com o header: { User-Agent: Java/1.8.0_282 }. Certifique-se que seu provedor de firewall não bloqueia requisições com este header.

Caso sua solução de Firewall seja Cloudflare, existem configurações adicionais a serem feitas, que podem ser verificadas aqui.
Após verificar e se certificar de liberar esses pontos, você pode novamente reativar a sua fila para checar se os eventos serão sincronizados.

### Erro 404 (Not Found)

O que fazer quando vejo este erro nos logs de Webhooks do Asaas?

O erro 404 indica que o disparo do evento foi feito, mas a URL informada não nos encaminhou para um local existente. Isso pode indicar algum erro de digitação na URL, ou que o servidor está inativo ou foi mudado de local.

Certifique-se que não haja nenhum erro de digitação na sua URL, e também verifique se o local para onde estamos fazendo o disparo não está indisponível ou que a URL do servidor não foi alterada. Após isso, basta reconfigurar a URL no Asaas e reativar a fila.

### Erro 500 (Internal Server Error)

O que fazer quando vejo este erro nos logs de Webhooks do Asaas?

O erro de webhook 500, significa que a conexão com o seu servidor foi estabelecida, porém, a sua aplicação retornou erro. Isso ocorre geralmente devido a alguma exceção ocorrida no seu código/tecnologia.

Pode indicar uma adversidade no servidor. Isso pode ser devido a alguma incompatibilidade ou até mesmo configurações incorretas no servidor, como scripts errados, etc.

O erro 500, é um código muito abrangente. Mas, em geral, significa erros no servidor web, onde este não consegue finalizar a solicitação do usuário. E o servidor não consegue identificar o motivo disso.

### Erro Read Timed Out

O que fazer quando vejo este erro nos logs de Webhooks do Asaas?

A conexão com o seu servidor foi estabelecida e o evento foi disparado, porém, sua aplicação não retornou a resposta no tempo esperado.

No Asaas aguardamos a resposta por 10 segundos, caso não seja recebido o retorno nesse tempo, o webhook é disparado com o erro "Read Time Out". A sincronização é feita a cada 30 segundos, e caso seu sistema falhe em responder uma respostas de sucesso 15 vezes consecutivas, a fila de sincronização será interrompida.

Você precisará verificar em seu sistema, o tempo que está levando para nos retornar o webhook e caso esteja acima dos 10 segundos, fazer o ajuste necessário.

Após certificar-se que seu sistema responderá corretamente uma resposta da família 200 para o Asaas basta reativar fila de sincronia acessando a área Minha Conta, aba Integração, todos os eventos pendentes serão processados em ordem cronológica.

### Erro Connect Timed Out

O que fazer quando vejo este erro nos logs de Webhooks do Asaas?

O erro Connect timed out significa que a conexão não foi estabelecida após atingir o tempo limite.

Geralmente esse erro é quando há algo errado com sua conexão de rede local. No entanto, nem sempre é esse o caso.

Pode significar também que o seu site está tentando fazer mais do que seu servidor pode gerenciar. Isso é particularmente comum em hospedagem compartilhada, em que seu limite de memória é restrito.

Você precisará verificar em seu sistema, o que pode estar ocasionando esse erro e realizar a correção para que mesmo volte a funcionar normalmente e após isso, reativar a fila de sincronização de webhooks.

### Eventos para cobranças

Escute os eventos do Asaas para ter sua integração em dia.

Os Webhooks são a melhor e mais segura forma de manter os dados da sua aplicação atualizados com os dados do Asaas. Você sempre receberá um novo evento quando o status do Webhook mudar. Os eventos que o Asaas notifica são:

- PAYMENT_CREATED - Geração de nova cobrança.
- PAYMENT_AWAITING_RISK_ANALYSIS - Pagamento em cartão aguardando aprovação pela análise manual de risco.
- PAYMENT_APPROVED_BY_RISK_ANALYSIS - Pagamento em cartão aprovado pela análise manual de risco.
- PAYMENT_REPROVED_BY_RISK_ANALYSIS - Pagamento em cartão reprovado pela análise manual de risco.
- PAYMENT_AUTHORIZED - Pagamento em cartão que foi autorizado e precisa ser capturado.
- PAYMENT_UPDATED - Alteração no vencimento ou valor de cobrança existente.
- PAYMENT_CONFIRMED - Cobrança confirmada (pagamento efetuado, porém, o saldo ainda não foi disponibilizado).
- PAYMENT_RECEIVED - Cobrança recebida.
- PAYMENT_CREDIT_CARD_CAPTURE_REFUSED - Falha no pagamento de cartão de crédito
- PAYMENT_ANTICIPATED - Cobrança antecipada.
- PAYMENT_OVERDUE - Cobrança vencida.
- PAYMENT_DELETED - Cobrança removida.
- PAYMENT_RESTORED - Cobrança restaurada.
- PAYMENT_REFUNDED - Cobrança estornada.
- PAYMENT_PARTIALLY_REFUNDED - Cobrança estornada parcialmente.
- PAYMENT_REFUND_IN_PROGRESS - Estorno em processamento (liquidação já está agendada, cobrança será estornada após executar a liquidação).
- PAYMENT_RECEIVED_IN_CASH_UNDONE - Recebimento em dinheiro desfeito.
- PAYMENT_CHARGEBACK_REQUESTED - Recebido chargeback.
- PAYMENT_CHARGEBACK_DISPUTE - Em disputa de chargeback (caso sejam apresentados documentos para contestação).
- PAYMENT_AWAITING_CHARGEBACK_REVERSAL - Disputa vencida, aguardando repasse da adquirente.
- PAYMENT_DUNNING_RECEIVED - Recebimento de negativação.
- PAYMENT_DUNNING_REQUESTED - Requisição de negativação.
- PAYMENT_BANK_SLIP_VIEWED - Boleto da cobrança visualizado pelo cliente.
- PAYMENT_CHECKOUT_VIEWED - Fatura da cobrança visualizada pelo cliente.
- PAYMENT_SPLIT_CANCELLED - Cobrança teve um split cancelado.
- PAYMENT_SPLIT_DIVERGENCE_BLOCK - Valor da cobrança bloqueado por divergência de split.
- PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED - Bloqueio do valor da cobrança por divergência de split foi finalizado.

Cada vez que um Webhook de cobrança é enviado, junto dele é enviado um objeto em JSON via POST com os dados completos da cobrança. Conforme este exemplo:

```json
{
   "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
   "event":"PAYMENT_RECEIVED",
   "dateCreated": "2024-06-12 16:45:03",
   "payment":{
      "object":"payment",
      "id":"pay_080225913252",
      ...
   }
}
```

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma única cobrança" na documentação.

Tudo no Asaas é considerado uma cobrança, inclusive transferências diretas para a conta bancária, depósitos ou recebimentos via Pix. Portanto você recebe Webhooks de Cobranças para qualquer dinheiro que entrar na sua conta.

🚧
- Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
- Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.
- O array de split será devolvido apenas quando a cobrança possuir configurações de Split de Pagamento.

#### Como funciona o fluxo do Webhook de cobranças?
Veja mais detalhes sobre o fluxo de webhooks em recebimentos de cobranças no Asaas:

- Cobrança recebida em Boleto, sem atraso:
  - PAYMENT_CREATED > PAYMENT_CONFIRMED > PAYMENT_RECEIVED
- Cobrança recebida em Boleto, com atraso:
  - PAYMENT_CREATED > PAYMENT_OVERDUE > PAYMENT_CONFIRMED > PAYMENT_RECEIVED
- Cobrança recebida em Pix, sem atraso:
  - PAYMENT_CREATED -> PAYMENT_RECEIVED
- Cobrança recebida em Pix, com atraso:
  - PAYMENT_CREATED -> PAYMENT_OVERDUE -> PAYMENT_RECEIVED
- Cobrança recebida em Cartão de Crédito, sem atraso:
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (32 dias após PAYMENT_CONFIRMED)
- Cobrança recebida em Cartão de Débito, sem atraso:
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (3 dias após PAYMENT_CONFIRMED)
- Cobrança recebida em Cartão de Crédito, com atraso:
  - PAYMENT_CREATED -> PAYMENT_OVERDUE -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (32 dias após PAYMENT_CONFIRMED)
- Cobrança recebida em Cartão de Débito, com atraso:
  - PAYMENT_CREATED -> PAYMENT_OVERDUE -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (3 dias após PAYMENT_CONFIRMED)
- Cobrança estornada durante fase de confirmação (Cartão de Crédito/Débito):
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED -> PAYMENT_REFUNDED
- Cobrança estornada após recebimento (Cartão de Crédito/Débito):
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED -> PAYMENT_REFUNDED
- Cobrança estornada após recebimento (Boleto/Pix):
  - PAYMENT_CREATED -> PAYMENT_RECEIVED -> PAYMENT_REFUNDED
- Chargeback solicitado, disputa aberta e ganha pelo cliente Asaas:
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED ou PAYMENT_RECEIVED -> CHARGEBACK_REQUESTED -> CHARGEBACK_DISPUTE -> AWAITING_CHARGEBACK_REVERSAL -> PAYMENT_CONFIRMED ou PAYMENT_RECEIVED (depende se a cobrança já atingiu a data de crédito).
- Chargeback solicitado, disputa aberta e ganha pelo cliente:
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED ou PAYMENT_RECEIVED -> CHARGEBACK_REQUESTED -> CHARGEBACK_DISPUTE -> PAYMENT_REFUNDED
- Chargeback solicitado e disputa não aberta:
  - PAYMENT_CREATED -> PAYMENT_CONFIRMED ou PAYMENT_RECEIVED -> CHARGEBACK_REQUESTED -> PAYMENT_REFUNDED
- Cobrança confirmada em dinheiro:
  - PAYMENT_CREATED -> PAYMENT_RECEIVED (o billingType será "RECEIVED_IN_CASH").
- Cobrança em processo de negativação Serasa:
  - PAYMENT_CREATED -> PAYMENT_OVERDUE -> PAYMENT_DUNNING_REQUESTED
- Cobrança em processo de negativação Serasa recebida:
  - PAYMENT_CREATED -> PAYMENT_OVERDUE -> PAYMENT_DUNNING_REQUESTED -> PAYMENT_DUNNING_RECEIVED

É importante frisar que sempre que a cobrança sofrer atraso de vencimento, ela passará pelo status PAYMENT_OVERDUE.

Ocasionalmente, outros eventos podem ser disparados, como PAYMENT_DELETED, PAYMENT_RESTORED, PAYMENT_BANK_SLIP_VIEWED e PAYMENT_CHECKOUT_VIEWED, porém são eventos que não estão ligados com processos de recebimento de valores.

### Eventos para assinaturas

Escute os eventos do Asaas para ter sua integração em dia.

É possível utilizar webhook para que o seu sistema seja notificado sobre alterações que ocorram nas assinaturas. Os eventos que o Asaas notifica são:

- SUBSCRIPTION_CREATED - Geração de nova assinatura.
- SUBSCRIPTION_UPDATED - Alteração na assinatura.
- SUBSCRIPTION_INACTIVATED - Assinatura inativada.
- SUBSCRIPTION_DELETED - Assinatura removida.
- SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK - Assinatura bloqueada por divergência de split.
- SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED - Bloqueio da assinatura por divergência de split foi finalizado.

#### Exemplo de JSON a ser recebido [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
  "id": "evt_6561b631fa5580caadd00bbe3b858607&9193",
  "event": "SUBSCRIPTION_CREATED",
  "dateCreated": "2024-10-16 11:11:04",
  "subscription": {
    "object": "subscription",
    "id": "sub_m5gdy1upm25fbwgx",
    "dateCreated": "16/10/2024",
    "customer": "cus_000000008773",
    "paymentLink": null,
    "value": 19.9,
    "nextDueDate": "22/11/2024",
    "cycle": "MONTHLY",
    "description": "Assinatura Plano Pró",
    "billingType": "BOLETO",
    "deleted": false,
    "status": "ACTIVE",
    "externalReference": null,
    "sendPaymentByPostalService": false,
    "discount": {
      "value": 10,
      "limitDate": null,
      "dueDateLimitDays": 0,
      "type": "PERCENTAGE"
    },
    "fine": {
      "value": 1,
      "type": "PERCENTAGE"
    },
    "interest": {
      "value": 2,
      "type": "PERCENTAGE"
    },
    "split": [
      {
        "walletId": "a0188304-4860-4d97-9178-4da0cde5fdc1",
        "fixedValue": null,
        "percentualValue": 20,
        "externalReference": null,
        "description": null
      }
    ]
  }
}
```

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma única assinatura" na documentação.

🚧
- Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
- Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.
- O array de split será devolvido apenas quando a assinatura possuir configurações de Split de Pagamento.

### Eventos para notas fiscais

Escute os eventos do Asaas para ter sua integração em dia.

É possível utilizar webhook para que seu sistema seja notificado sobre alterações que ocorram nas notas fiscais. Os eventos que o Asaas notifica são:

- INVOICE_CREATED - Geração de nova nota fiscal.
- INVOICE_UPDATED - Alteração na nota fiscal.
- INVOICE_SYNCHRONIZED - Nota fiscal enviada para prefeitura.
- INVOICE_AUTHORIZED - Nota fiscal emitida.
- INVOICE_PROCESSING_CANCELLATION - Nota fiscal processando cancelamento.
- INVOICE_CANCELED - Nota fiscal cancelada.
- INVOICE_CANCELLATION_DENIED - Recusado o cancelamento da nota fiscal.
- INVOICE_ERROR - Nota fiscal com erro.

#### Exemplo de JSON a ser recebido [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
    "event": "INVOICE_CREATED",
    "dateCreated": "2024-06-12 16:45:03",
    "invoice": {
        "object": "invoice",
        "id": "inv_000000000232",
        "status": "SCHEDULED",
        "customer": "cus_000000002750",
        "type": "NFS-e",
        "statusDescription": null,
        "serviceDescription": "Nota fiscal da Fatura 101940. \nDescrição dos Serviços: ANÁLISE E DESENVOLVIMENTO DE SISTEMAS",
        "pdfUrl": null,
        "xmlUrl": null,
        "rpsSerie": null,
        "rpsNumber": null,
        "number": null,
        "validationCode": null,
        "value": 300,
        "deductions": 0,
        "effectiveDate": "2018-07-03",
        "observations": "Mensal referente aos trabalhos de Junho.",
        "estimatedTaxesDescription": "",
        "payment": "pay_145059895800",
        "installment": null,
        "taxes": {
            "retainIss": false,
            "iss": 3,
            "cofins": 3,
            "csll": 1,
            "inss": 0,
            "ir": 1.5,
            "pis": 0.65
        },
        "municipalServiceCode": "1.01",
        "municipalServiceName": "Análise e desenvolvimento de sistemas"
    }
}
```

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma nota fiscal" na documentação.

🚧
- Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
- Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.

### Eventos para transferências

Escute os eventos do Asaas para ter sua integração em dia.

É possível utilizar webhook para que seu sistema seja notificado sobre alterações que ocorram nas transferências bancárias e transferências entre contas Asaas. Os eventos que o Asaas notifica são:

- TRANSFER_CREATED - Geração de nova transferência.
- TRANSFER_PENDING - Transferência pendente de execução.
- TRANSFER_IN_BANK_PROCESSING - Transferência em processamento bancário.
- TRANSFER_BLOCKED - Transferência bloqueada.
- TRANSFER_DONE - Transferência realizada.
- TRANSFER_FAILED - Transferência falhou.
- TRANSFER_CANCELLED - Transferência cancelada.

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma única transferência" na documentação.

#### Exemplo de JSON a ser recebido para transferências bancárias [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
    "event": "TRANSFER_CREATED",
    "dateCreated": "2024-06-12 16:45:03",
    "transfer": {
        "object": "transfer",
        "id": "777eb7c8-b1a2-4356-8fd8-a1b0644b5282",
        "dateCreated": "2019-05-02",
        "status": "PENDING",
        "effectiveDate": null,
        "endToEndIdentifier": null,
        "type": "BANK_ACCOUNT",
        "value": 1000,
        "netValue": 1000,
        "transferFee": 0,
        "scheduleDate": "2019-05-02",
        "authorized": true,
        "failReason": null,
        "transactionReceiptUrl": null,
        "bankAccount": {
            "bank": {
                "ispb": "00000000",
                "code": "001",
                "name": "Banco do Brasil"
            },
            "accountName": "Conta Banco do Brasil",
            "ownerName": "Marcelo Almeida",
            "cpfCnpj": "***.143.689-**",
            "agency": "1263",
            "agencyDigit": "1",
            "account": "26544",
            "accountDigit": "1",
            "pixAddressKey": null
        },
        "operationType": "TED",
        "description": null
    }
}
```

#### Exemplo de JSON a ser recebido para transferências bancárias via Pix
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "event": "TRANSFER_CREATED",
    "transfer": {
        "object": "transfer",
        "id": "777eb7c8-b1a2-4356-8fd8-a1b0644b5282",
        "dateCreated": "2019-05-02",
        "status": "PENDING",
        "effectiveDate": null,
        "endToEndIdentifier": null,
        "type": "BANK_ACCOUNT",
        "value": 1000,
        "netValue": 1000,
        "transferFee": 0,
        "scheduleDate": "2019-05-02",
        "authorized": true,
        "failReason": null,
        "transactionReceiptUrl": null,
        "bankAccount": {
            "bank": {
                "ispb": "00000000",
                "code": "001",
                "name": "Banco do Brasil"
            },
            "accountName": "Conta Banco do Brasil",
            "ownerName": "Marcelo Almeida",
            "cpfCnpj": "***.143.689-**",
            "agency": "1263",
            "agencyDigit": "1",
            "account": "26544",
            "accountDigit": "1",
            "pixAddressKey": null
        },
        "operationType": "PIX",
        "description": "Transferência efetuada via Pix manual"
    }
}
```

#### Exemplo de JSON a ser recebido para transferências bancárias via Pix com chave
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "event": "TRANSFER_CREATED",
    "transfer": {
        "object": "transfer",
        "id": "777eb7c8-b1a2-4356-8fd8-a1b0644b5282",
        "dateCreated": "2019-05-02",
        "status": "PENDING",
        "effectiveDate": null,
        "endToEndIdentifier": null,
        "type": "BANK_ACCOUNT",
        "value": 1000,
        "netValue": 1000,
        "transferFee": 0,
        "scheduleDate": "2019-05-02",
        "authorized": true,
        "failReason": null,
        "transactionReceiptUrl": null,
        "bankAccount": {
            "bank": {
                "ispb": "00000000",
                "code": "001",
                "name": "Banco do Brasil"
            },
            "accountName": "Conta Banco do Brasil",
            "ownerName": "Marcelo Almeida",
            "cpfCnpj": "***.143.689-**",
            "agency": "1263",
            "agencyDigit": "1",
            "account": "26544",
            "accountDigit": "1",
            "pixAddressKey": "09413412375"
        },
        "operationType": "PIX",
        "description": "Transferência efetuada via Pix com chave"
    }
}
```

#### Exemplo de JSON a ser recebido para transferências entre contas Asaas [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "event": "TRANSFER_CREATED",
    "transfer": {
        "object": "transfer",
        "id": "dc0cd262-5050-4c82-bddc-dc2463f7ff07",
        "dateCreated": "2021-01-01",
        "status": "DONE",
        "effectiveDate": "2021-01-01 13:32:12",
        "endToEndIdentifier": null,
        "type": "ASAAS_ACCOUNT",
        "value": 1000,
        "transferFee": 0,
        "scheduleDate": "2021-11-17",
        "authorized": true,
        "walletId": "1f7184ab-9671-4f43-9ab5-c2349e7bf61",
        "account": {
            "name": "Marcelo Almeida",
            "cpfCnpj": "***.143.689-**"
        },
        "transactionReceiptUrl": "https://www.asaas.com/comprovantes/8962440029817277",
        "operationType": "INTERNAL",
        "description": null
    }
}
```

🚧 **Atenção**

- Transferências entre contas Asaas são realizadas instantaneamente. Caso a validação de evento crítico via Token APP ou Token SMS esteja habilitada para o agendamento de transferências, a transferência ficará pendente até que a validação seja realizada.
- Transferências via Pix não agendadas são realizadas instantaneamente. O Token APP e Token SMS devem estar desabilitados.

🚧
- Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
- Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.

### Eventos para pague contas

Escute os eventos do Asaas para ter sua integração em dia.

É possível utilizar webhook para que seu sistema seja notificado sobre alterações que ocorram no pagamento de contas. Os eventos que o Asaas notifica são:

- BILL_CREATED - Geração de um novo pague contas.
- BILL_PENDING - Pagamento de contas aguardando processamento.
- BILL_BANK_PROCESSING - Pagamento de contas aguardando processamento bancário.
- BILL_PAID - Pagamento de contas pago.
- BILL_CANCELLED - Pagamento de contas cancelado.
- BILL_FAILED - Pagamento de contas falhou.
- BILL_REFUNDED - Pagamento de contas estornado.

#### Exemplo de JSON a ser recebido [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
    "event":"BILL_PAID",
    "dateCreated": "2024-06-12 16:45:03",
    "bill": {
        "object": "bill",
        "id": "f1bce822-6f37-4905-8de8-f1af9f2f4bab",
        "status": "PAID",
        "value": 29.90,
        "discount": 0.00,
        "interest": 0.00,
        "fine": 0.00,
        "identificationField": "03399.77779 29900.000000 04751.101017 1 81510000002990",
        "dueDate": "2020-01-31",
        "scheduleDate": "2020-01-31",
        "paymentDate": null,
        "fee": 0.00,
        "description": "Celular 01/12",
        "companyName": null,
        "transactionReceiptUrl": "https://www.asaas.com/comprovantes/00016578",
        "canBeCancelled": false,
        "failReasons": null
    }
}
```

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar um único pagamento de contas" na documentação.

🚧
- Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
- Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.

### Eventos para antecipações

Escute os eventos do Asaas para ter sua integração em dia.

É possível utilizar webhook para que seu sistema seja notificado sobre alterações que ocorram nas antecipações. Os eventos que o Asaas notifica são:

- RECEIVABLE_ANTICIPATION_CANCELLED - Antecipação cancelada.
- RECEIVABLE_ANTICIPATION_SCHEDULED - Antecipação agendada.
- RECEIVABLE_ANTICIPATION_PENDING - Antecipação em análise.
- RECEIVABLE_ANTICIPATION_CREDITED - Antecipação creditada.
- RECEIVABLE_ANTICIPATION_DEBITED - Antecipação debitada.
- RECEIVABLE_ANTICIPATION_DENIED - Solicitação da antecipação negada.
- RECEIVABLE_ANTICIPATION_OVERDUE - Antecipação vencida.

#### Exemplo de JSON a ser recebido [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
  "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
  "event": "RECEIVABLE_ANTICIPATION_CREDITED",
  "dateCreated": "2024-06-12 16:45:03",
  "anticipation": {
    "object": "anticipation",
    "id": "29ad50e9-64ee-427e-a00c-a3999510ca0a",
    "installment": null,
    "payment": "pay_4310966350068380",
    "status": "CREDITED",
    "anticipationDate": "2022-09-19",
    "dueDate": "2022-09-30",
    "requestDate": "2022-09-19",
    "fee": 5.64,
    "anticipationDays": 11,
    "netValue": 302.37,
    "totalValue": 310,
    "value": 308.01,
    "denialObservation": null
  }
}
```

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma única antecipação" na documentação.

🚧
- Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
- Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.

### Eventos para verificar situação da conta

Escute os eventos do Asaas para ter sua integração em dia.

É possível utilizar webhook para que seu sistema seja notificado sobre alterações que ocorram na situação de contas. Os eventos que o Asaas notifica são:

- ACCOUNT_STATUS_BANK_ACCOUNT_INFO_APPROVED - Conta bancária aprovada
- ACCOUNT_STATUS_BANK_ACCOUNT_INFO_AWAITING_APPROVAL - Conta bancária está em análise
- ACCOUNT_STATUS_BANK_ACCOUNT_INFO_PENDING - Conta bancária voltou para pendente
- ACCOUNT_STATUS_BANK_ACCOUNT_INFO_REJECTED - Conta bancária reprovada
- ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED - Informações comerciais aprovada
- ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL - Informações comerciais em análise
- ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING - Informações comerciais voltou para pendente
- ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED - Informações comerciais reprovada
- ACCOUNT_STATUS_DOCUMENT_APPROVED - Documentos aprovados
- ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL - Documentos em análise
- ACCOUNT_STATUS_DOCUMENT_PENDING - Documentos voltaram para pendente
- ACCOUNT_STATUS_DOCUMENT_REJECTED - Documentos reprovados
- ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED - Conta aprovada
- ACCOUNT_STATUS_GENERAL_APPROVAL_AWAITING_APPROVAL - Conta em análise
- ACCOUNT_STATUS_GENERAL_APPROVAL_PENDING - Conta voltou para pendente
- ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED - Conta reprovada

### Exemplo de JSON a ser recebido [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo:

```json
{
    "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
    "event": "ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED",
    "dateCreated": "2024-06-12 16:45:03",
    "accountStatus": {
        "id": "175027c1-029c-41e5-8b9a-e289b9788c33",
        "commercialInfo": "APPROVED",
        "bankAccountInfo": "APPROVED",
        "documentation": "APPROVED",
        "general": "APPROVED"
    }
}
```

👍 **Retorno do Webhook com tipagem e ENUMs**

Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Consultar situação cadastral da conta" na documentação.

🚧
Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.
Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.

### Eventos para Checkout

Escute os eventos do Asaas para ter sua integração em dia.

Os Webhooks são a melhor e mais segura forma de manter os dados da sua aplicação atualizados com os dados do Asaas. Você sempre receberá um novo evento quando o status do Webhook mudar.

Como utilizar os webhooks do checkout:

POST https://api.asaas.com/api/v3/webhooks
header: access_token

```json
{  
  "name": "teste",  
  "url": "https://minha-url.com",  
  "sendType": "SEQUENTIALLY",  
  "email": "teste@teste.com",  
  "enabled": true,  
  "interrupted": false,  
  "events": [  
    "CHECKOUT_CREATED",  
    "CHECKOUT_CANCELED",  
    "CHECKOUT_EXPIRED",  
    "CHECKOUT_PAID"  
  ]  
}
```

O endpoint de webhook do checkout é o mesmo utilizado para criação de webhook do Asaas e podemos encontrar mais informações na documentação padrão da API.

A única mudança são os eventos do checkout, no body params da requisição deve ser adicionado os eventos que desejamos acompanhar:

- CHECKOUT_CREATED - Checkout criado
- CHECKOUT_CANCELED - Checkout cancelado
- CHECKOUT_EXPIRED - Checkout expirado
- CHECKOUT_PAID - Checkout pago

Feita a configuração acima, o webhook do checkout passará a enviar requisições para a url configurada. Segue exemplo da requisição POST que será feita pelo webhook para a sua URL cadastrada:

```json
{  
  "id": "evt_37260be8159d4472b4458d3de13efc2d&15370",  
  "event": "CHECKOUT_CREATED",  
  "dateCreated": "2024-10-31 18:07:47",  
  "checkout": {  
    "id": "2bd251f0-09b2-44ff-8a0c-a5cb29e5bbda",  
    "link": null,  
    "status": "ACTIVE",  
    "minutesToExpire": 10,  
    "billingTypes": [  
      "MUNDIPAGG_CIELO"  
    ],  
    "chargeTypes": [  
      "RECURRENT"  
    ],  
    "callback": {  
      "cancelUrl": "https://google.com",  
      "successUrl": "https://google.com",  
      "expiredUrl": "https://google.com"  
    },  
    "items": [  
      {  
        "name": "teste2",  
        "description": "teste",  
        "quantity": 2,  
        "value": 100  
      },  
      {  
        "name": "teste2",  
        "description": "teste2",  
        "quantity": 2,  
        "value": 100  
      }  
    ],  
    "subscription": {  
      "cycle": "MONTHLY",  
      "nextDueDate": "2024-10-31T03:00:00+0000",  
      "endDate": "2025-10-29T03:00:00+0000"  
    },  
    "installment": null,  
    "split": [  
      {  
        "walletId": "c1ad713f-77fc-45b0-b734-b2ff9970d6d8",  
        "fixedValue": 2,  
        "percentualValue": null,  
        "totalFixedValue": null  
      },  
      {  
        "walletId": "c1ad713f-77fc-45b0-b734-b2ff9970d6d8",  
        "fixedValue": null,  
        "percentualValue": 2,  
        "totalFixedValue": null  
      }  
    ],  
    "customer": "cus_000000018936",  
    "customerData": null  
  }  
}
```

</rewritten_file>
