# FAQ (Perguntas Frequentes)

Esta seção reúne dúvidas comuns e soluções para problemas recorrentes na integração com o Asaas.

## Tópicos sugeridos:

- Erros comuns e como resolver
- Dúvidas sobre autenticação e chaves
- Limites e restrições da API
- Diferenças entre ambientes (sandbox x produção)
- Como testar integrações localmente
- Onde encontrar suporte e documentação oficial

## Assinaturas

Dúvidas frequentes sobre assinaturas na API do Asaas

**Posso criar assinaturas com período de gratuidade?**
Se você trabalha com um período de trial (7 dias grátis, por exemplo), poderá seguir da mesma forma e informar no campo nextDueDate a data da primeira cobrança. Assim, se o cartão for validado na criação, ele já será gravado para que o primeiro pagamento aconteça no dia informado por você.

Porém, se você criar a assinatura sem os dados do cartão e o pagador inserir depois os dados do cartão, o valor será descontado no momento que ele inserir o cartão, independente do nextDueDate.

**Como funcionam as notificações de assinaturas?**
As notificações em cobranças de assinaturas serão enviadas conforme as configurações de notificação definidas no cliente. Porém, existem algumas mudanças de acordo com a forma de pagamento, veja abaixo:

Quando a forma de pagamento é Cartão, mesmo que todas as notificações estejam habilitadas no cadastro do pagador, elas são enviadas apenas quando há confirmação de pagamento na primeira cobrança (tanto para o cliente quanto para o pagador) e/ou quando há confirmação de Pagamento em cobranças futuras (apenas para o cliente).

Notificação de cobranças antes do vencimento:
Essa notificação será enviada apenas se o cliente clicar manualmente no botão Reenviar E-mail/SMS/WhatsApp de notificação e a cobrança precisa estar com o status aguardando pagamento.
Notificação para cobranças vencidas:
Se essa opção estiver ativa, o sistema irá disparar uma notificação apenas se houver falha no pagamento.
Outras notificações, mesmo que habilitadas, não são disparadas.
Quando a forma de pagamento é Boleto/Pix ou Pergunte ao Cliente os envios das notificações são realizados conforme configurado, com exceção das notificações de Aviso de Geração de Cobrança, pois na assinatura as cobranças são geradas sempre com 40 dias de antecedência. Caso esteja habilitada, essa notificação será enviada apenas na primeira cobrança. Se a assinatura estiver definida como Pergunte ao Cliente e for paga com Cartão, as próximas serão definidas com a forma de pagamento Cartão, sendo assim, começa a seguir as regras de notificações para assinatura em cartão.

**Como acompanho os webhooks de cobranças de assinaturas?**
A assinatura é apenas uma configuração de como queremos que de fato a cobrança seja criada. O Asaas não possui webhooks próprios para as assinaturas, apenas das cobranças. Então, o gerenciamento deve ser realizado através dos webhooks de cobranças. Sempre ao criar uma nova assinatura, a primeira cobrança dela é gerada automaticamente e enviamos um webhook de PAYMENT_CREATED, onde nele contém o id do subscription. Toda cobrança que faça parte dessa assinatura, conterá o atributo subscription no JSON do webhook, por onde você poderá vincular que tal cobrança faz parte de determinada assinatura.

> Preencha cada tópico conforme for implementando a integração. 