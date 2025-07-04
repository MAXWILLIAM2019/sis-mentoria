# Links de Pagamento

Esta seção explica como criar e gerenciar links de pagamento no Asaas.

## Tópicos sugeridos:

- Criação de links de pagamento (avulso, parcelado, recorrente)
- Configuração de valores e parcelas
- Adição de imagens e customização
- Consulta e gerenciamento de links
- Eventos e webhooks relacionados a links de pagamento
- Exemplos de requisições e respostas
- Boas práticas para uso de links de pagamento

> Preencha cada tópico conforme for implementando a integração. 

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