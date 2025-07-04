# Webhooks

Esta seção explica como configurar, consumir e garantir a segurança dos webhooks do Asaas.

## Tópicos sugeridos:

- O que são webhooks e para que servem
- Como configurar webhooks na API Asaas
- Eventos disponíveis e exemplos de payloads
- Boas práticas de segurança (token, IP, HTTPS)
- Idempotência e tratamento de eventos duplicados
- Logs e troubleshooting de webhooks
- Exemplos de implementação (Node.js, outros)

> Preencha cada tópico conforme for implementando a integração. 

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