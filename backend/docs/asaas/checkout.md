# Checkout

Esta seção detalha como utilizar o Checkout do Asaas para pagamentos online.

## Tópicos sugeridos:

- Criação de checkouts (configuração, tipos de cobrança)
- Redirecionamento e URLs de callback
- Checkout para Pix, cartão, parcelado, recorrente
- Customização de tela e experiência do usuário
- Eventos e webhooks do checkout
- Exemplos de requisições e respostas
- Boas práticas para integração de checkout

> Preencha cada tópico conforme for implementando a integração. 

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