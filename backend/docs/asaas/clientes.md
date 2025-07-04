# Clientes

Esta seção detalha tudo sobre cadastro, consulta e gestão de clientes na API Asaas.

## Tópicos sugeridos:

- Como cadastrar um novo cliente
- Consulta de clientes existentes
- Atualização e remoção de clientes
- Campos obrigatórios e opcionais
- Boas práticas para evitar duplicidade
- Exemplo de requisições e respostas
- Notificações relacionadas a clientes

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