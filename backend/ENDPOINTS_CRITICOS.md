# 🚨 ENDPOINTS CRÍTICOS - SISTEMA DE MENTORIA

## ⚠️ ATENÇÃO DESENVOLVEDORES

Este documento lista os **endpoints críticos** do sistema que **NÃO DEVEM SER ALTERADOS** sem autorização expressa da equipe de desenvolvimento.

---

## 🔒 ENDPOINT: PRÉ-CADASTRO DE ALUNOS

### 📍 **Rota:** `POST /api/alunos/pre-cadastro`

### 🎯 **Finalidade:**
Endpoint responsável pelo pré-cadastro de alunos para integração com o sistema de pagamentos Asaas.

### 🔧 **Processo Executado:**
1. **Validações rigorosas** de dados (CPF, Email, Telefone)
2. **Verificação de duplicatas** no sistema
3. **Criação de usuário** na tabela `usuario`
4. **Criação de registro complementar** na tabela `aluno_info`
5. **Integração automática** com API do Asaas (criação de cliente)

### 📊 **Dados de Entrada:**
```json
{
  "nome": "string (obrigatório)",
  "email": "string (obrigatório, único)",
  "emailConfirmacao": "string (deve ser igual ao email)",
  "telefone": "string (obrigatório)", 
  "cpf": "string (obrigatório, único, validado)"
}
```

### 📤 **Dados de Saída:**
```json
{
  "message": "Pré-cadastro realizado com sucesso",
  "usuario": {
    "id": "number",
    "nome": "string",
    "email": "string"
  },
  "asaasCliente": {
    "idasaascliente": "number",
    "idusuario": "number", 
    "id_cliente_asaas": "string"
  }
}
```

### 🛡️ **Validações Implementadas:**
- ✅ **CPF:** Validação matemática (algoritmo da Receita Federal)
- ✅ **Email:** Formato válido e unicidade no sistema
- ✅ **Duplicatas:** CPF e email únicos
- ✅ **Campos obrigatórios:** Todos os campos são validados
- ✅ **Confirmação de email:** Deve ser exatamente igual

### 🔄 **Integrações:**
- **Asaas API:** Criação automática de cliente para pagamentos
- **Banco de dados:** Tabelas `usuario` e `aluno_info`
- **Sistema de validação:** CPF, email e telefone

### 🚨 **IMPACTOS DE ALTERAÇÕES NÃO AUTORIZADAS:**
- ❌ Falhas na criação de clientes no Asaas
- ❌ Inconsistências nos dados de pagamento
- ❌ Problemas na validação de CPF
- ❌ Quebra do fluxo de pré-cadastro
- ❌ Perda de dados de clientes
- ❌ Problemas de integração com gateway de pagamento

### 📊 **Status Atual:**
- 🟢 **FUNCIONAL** ✅
- 🟢 **TESTADO** ✅
- 🟢 **EM PRODUÇÃO** ✅

### 📅 **Histórico:**
- **Dezembro/2024:** Criação e implementação
- **Dezembro/2024:** Ajuste de formatação de CPF
- **Dezembro/2024:** Documentação e proteção crítica

---

## 📞 CONTATOS PARA AUTORIZAÇÃO

### 👥 **Equipe de Desenvolvimento:**
- **Lead Developer:** [Nome do Lead]
- **Tech Lead:** [Nome do Tech Lead] 
- **Product Owner:** [Nome do PO]

### 📧 **Contatos:**
- **Email:** dev-team@empresa.com
- **Slack:** #desenvolvimento
- **Jira:** [Projeto de Development]

---

## 🔐 PROTOCOLO DE ALTERAÇÕES

### ✅ **Antes de Alterar:**
1. **Solicitar autorização** à equipe de desenvolvimento
2. **Criar ticket** no sistema de issues
3. **Documentar** a necessidade da alteração
4. **Aguardar aprovação** formal

### 🧪 **Processo de Teste:**
1. **Ambiente de desenvolvimento** - Testes unitários
2. **Ambiente de homologação** - Testes de integração
3. **Ambiente de staging** - Testes end-to-end
4. **Aprovação** da equipe de QA
5. **Deploy em produção** - Com monitoramento

### 🚨 **Em Caso de Emergência:**
- **Contato imediato** com a equipe de desenvolvimento
- **Rollback** deve estar sempre disponível
- **Comunicação** com stakeholders
- **Documentação** do incidente

---

## 📋 CHECKLIST DE SEGURANÇA

- [ ] Autorização da equipe obtida
- [ ] Ticket criado e aprovado
- [ ] Testes em ambiente de desenvolvimento
- [ ] Testes em ambiente de homologação
- [ ] Aprovação do QA
- [ ] Backup do código atual
- [ ] Plano de rollback definido
- [ ] Monitoramento configurado
- [ ] Documentação atualizada

---

**⚠️ LEMBRE-SE: Este endpoint está diretamente ligado ao sistema financeiro. Qualquer erro pode impactar pagamentos e receitas da empresa!**

---

*Documento criado em: Dezembro/2024*  
*Última atualização: Dezembro/2024*  
*Versão: 1.0* 