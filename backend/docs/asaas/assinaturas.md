# Assinaturas (Recorrência)

Esta seção detalha como criar, gerenciar e automatizar assinaturas recorrentes na API Asaas.

## Tópicos sugeridos:

- Criação de assinaturas (ciclos, valores, formas de pagamento)
- Consulta e atualização de assinaturas
- Cancelamento e reativação
- Upgrade/downgrade de planos
- Cobranças geradas por assinaturas
- Exemplos de requisições e respostas
- Boas práticas para gestão de recorrência

> Preencha cada tópico conforme for implementando a integração. 

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