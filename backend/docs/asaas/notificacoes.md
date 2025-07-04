# Notificações

Esta seção detalha como funcionam as notificações automáticas do Asaas para clientes e provedores.

## Tópicos sugeridos:

- Tipos de notificações disponíveis (e-mail, SMS, WhatsApp, voz)
- Configuração de notificações por cliente
- Eventos que disparam notificações
- Como editar e desabilitar notificações
- Exemplos de payloads de notificação
- Boas práticas para comunicação com o cliente

> Preencha cada tópico conforme for implementando a integração. 

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