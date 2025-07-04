# Cobranças

Esta seção aborda todos os tipos de cobranças disponíveis na API Asaas.

## Tópicos sugeridos:

- Criação de cobranças (boleto, Pix, cartão de crédito/débito)
- Parcelamento e carnê
- Descontos, juros e multas
- Consulta e atualização de cobranças
- Cancelamento e estorno
- Exemplos de requisições e respostas
- Boas práticas para automação de cobranças

> Preencha cada tópico conforme for implementando a integração.

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