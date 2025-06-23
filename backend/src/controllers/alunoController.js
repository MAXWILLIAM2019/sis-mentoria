/**
 * Controller de Aluno
 * 
 * Este módulo gerencia todas as operações relacionadas a alunos,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 * Implementa regras de negócio e validação de dados.
 * 
 * ⚠️  ATENÇÃO DESENVOLVEDOR: 
 * Este arquivo contém lógica crítica de pagamentos integrada com Asaas.
 * NÃO ALTERE sem consultar a equipe de desenvolvimento.
 * Alterações podem quebrar o fluxo de pagamentos e causar problemas financeiros.
 */
const { Usuario, Op } = require('../models');
const GrupoUsuario = require('../models/GrupoUsuario');
const AlunoInfo = require('../models/AlunoInfo');
const asaasService = require('../services/asaasService');

/**
 * Limpa o CPF mantendo apenas os 11 dígitos
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {string} CPF apenas com 11 dígitos
 */
const limparCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
};

/**
 * Cria um novo aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} req.body.nome - Nome do aluno
 * @param {string} req.body.email - Email do aluno (deve ser único)
 * @param {string} req.body.cpf - CPF do aluno (deve ser único)
 * @param {string} [req.body.senha] - Senha do aluno (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Aluno criado com status 201 ou mensagem de erro
 */
exports.createAluno = async (req, res) => {
  try {
    const { nome, email, cpf, senha } = req.body;
    if (!nome || !email || !cpf) {
      return res.status(400).json({ message: 'Preencha nome, email e CPF.' });
    }

    // Verifica se já existe usuário com o mesmo email (login)
    const usuarioExistente = await Usuario.findOne({ where: { login: email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Já existe um usuário com este email.' });
    }

    // Verifica se já existe usuário com o mesmo CPF
    const cpfExistente = await Usuario.findOne({ where: { cpf } });
    if (cpfExistente) {
      return res.status(400).json({ message: 'Já existe um usuário com este CPF.' });
    }

    // Busca o grupo "aluno"
    const grupoObj = await GrupoUsuario.findOne({ where: { nome: 'aluno' } });
    if (!grupoObj) {
      return res.status(400).json({ message: 'Grupo de usuário "aluno" não encontrado.' });
    }

    // Criptografa a senha se enviada, senão deixa nulo
    let senhaCriptografada = null;
    if (senha) {
      senhaCriptografada = await bcrypt.hash(senha, 10);
    }

    // Cria o usuário
    const novoUsuario = await Usuario.create({
      login: email,
      senha: senhaCriptografada,
      grupo: grupoObj.IdGrupo,
      situacao: true,
      nome: nome,
      cpf: limparCPF(cpf)
    });

    // Cria info complementar
    const novoAlunoInfo = await AlunoInfo.create({
      IdUsuario: novoUsuario.IdUsuario,
      email
    });

    // Monta resposta (sem senha)
    const usuarioSemSenha = novoUsuario.toJSON();
    delete usuarioSemSenha.senha;
    const alunoInfo = novoAlunoInfo.toJSON();

    res.status(201).json({ usuario: usuarioSemSenha, alunoInfo });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Já existe um aluno cadastrado com este email ou CPF.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar aluno', error: error.message });
  }
};

/**
 * Busca todos os alunos
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de todos os alunos cadastrados
 */
exports.getAllAlunos = async (req, res) => {
  try {
    console.log('Buscando todos os alunos (nova estrutura)...');
    // Busca todos os usuários do grupo aluno, incluindo info complementar
    const alunos = await Usuario.findAll({
      include: [
        {
          model: GrupoUsuario,
          as: 'grupoUsuario',
          where: { nome: 'aluno' },
          attributes: []
        },
        {
          model: AlunoInfo,
          as: 'alunoInfo',
        }
      ],
      attributes: ['IdUsuario', 'login', 'situacao', 'nome', 'cpf'],
      order: [['IdUsuario', 'ASC']]
    });
    // Formatar resposta
    const alunosFormatados = alunos.map(u => ({
      id: u.IdUsuario,
      email: u.login,
      situacao: u.situacao,
      nome: u.nome || '',
      cpf: u.cpf || '',
      info: u.alunoInfo || {}
    }));
    res.json(alunosFormatados);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ 
      message: 'Erro ao listar alunos',
      error: error.message 
    });
  }
};

/**
 * Busca um aluno específico
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados do aluno encontrado ou mensagem de erro 404
 */
exports.getAlunoById = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] } // Exclui o campo senha da resposta
    });
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar aluno',
      error: error.message 
    });
  }
};

/**
 * Atualiza os dados de um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.id - ID do aluno
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} [req.body.nome] - Nome do aluno
 * @param {string} [req.body.email] - Email do aluno
 * @param {string} [req.body.cpf] - CPF do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Aluno atualizado ou mensagem de erro
 */
exports.updateAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cpf } = req.body;

    // Busca o usuário
    const usuario = await Usuario.findOne({
      where: { IdUsuario: id },
      include: [
        {
          model: GrupoUsuario,
          as: 'grupoUsuario',
          where: { nome: 'aluno' },
          attributes: []
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    // Verifica se o novo CPF já existe em outro usuário
    if (cpf && cpf !== usuario.cpf) {
      const cpfExistente = await Usuario.findOne({ where: { cpf } });
      if (cpfExistente) {
        return res.status(400).json({ message: 'Já existe um usuário com este CPF.' });
      }
    }

    // Verifica se o novo email já existe em outro usuário
    if (email && email !== usuario.login) {
      const emailExistente = await Usuario.findOne({ where: { login: email } });
      if (emailExistente) {
        return res.status(400).json({ message: 'Já existe um usuário com este email.' });
      }
    }

    // Atualiza o usuário
    await usuario.update({
      nome: nome || usuario.nome,
      login: email || usuario.login,
      cpf: limparCPF(cpf) || usuario.cpf
    });

    // Atualiza o email no AlunoInfo
    if (email) {
      await AlunoInfo.update(
        { email },
        { where: { IdUsuario: id } }
      );
    }

    // Busca o usuário atualizado
    const usuarioAtualizado = await Usuario.findOne({
      where: { IdUsuario: id },
      include: [
        {
          model: AlunoInfo,
          as: 'alunoInfo'
        }
      ],
      attributes: ['IdUsuario', 'login', 'situacao', 'nome', 'cpf']
    });

    // Monta resposta
    const resposta = {
      id: usuarioAtualizado.IdUsuario,
      email: usuarioAtualizado.login,
      situacao: usuarioAtualizado.situacao,
      nome: usuarioAtualizado.nome,
      cpf: usuarioAtualizado.cpf,
      info: usuarioAtualizado.alunoInfo
    };

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ message: 'Erro ao atualizar aluno', error: error.message });
  }
};

/**
 * Deleta um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.deleteAluno = async (req, res) => {
  try {
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Remove o aluno
    await aluno.destroy();
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Define uma senha para um aluno existente
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} req.body - Dados da requisição
 * @param {string} req.body.senha - Nova senha do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.definirSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;
    if (!senha) {
      return res.status(400).json({ message: 'A senha é obrigatória' });
    }
    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await usuario.update({ senha: senhaCriptografada });
    res.json({ message: 'Senha definida com sucesso' });
  } catch (error) {
    console.error('Erro ao definir senha:', error);
    res.status(500).json({ message: 'Erro ao definir senha', error: error.message });
  }
};

/**
 * Gera uma senha aleatória para um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Senha gerada em texto plano e mensagem de sucesso
 */
exports.gerarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const senhaGerada = Math.random().toString(36).slice(-8);
    const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);
    await usuario.update({ senha: senhaCriptografada });
    res.json({ message: 'Senha gerada com sucesso', senha: senhaGerada });
  } catch (error) {
    console.error('Erro ao gerar senha:', error);
    res.status(500).json({ message: 'Erro ao gerar senha', error: error.message });
  }
};

/**
 * Busca os planos associados ao aluno autenticado
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de planos associados ao aluno
 */
exports.getAlunoPlanos = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.aluno e req.user
    const alunoId = req.user.id;
    
    // Importa os modelos necessários
    const AlunoPlano = require('../models/AlunoPlano');
    const Plano = require('../models/Plano');
    
    console.log(`Buscando planos para o aluno ID ${alunoId}`);
    
    // Busca as associações aluno-plano
    const associacoes = await AlunoPlano.findAll({
      where: { alunoId },
      include: [{
        model: Plano,
        as: 'plano'
      }]
    });
    
    if (!associacoes || associacoes.length === 0) {
      console.log(`Nenhum plano encontrado para o aluno ID ${alunoId}`);
      return res.json([]);
    }
    
    // Formata o resultado
    const planos = associacoes.map(associacao => ({
      id: associacao.id,
      alunoId: associacao.alunoId,
      planoId: associacao.planoId,
      dataInicio: associacao.dataInicio,
      dataPrevisaoTermino: associacao.dataPrevisaoTermino,
      dataConclusao: associacao.dataConclusao,
      status: associacao.status,
      progresso: associacao.progresso,
      observacoes: associacao.observacoes,
      plano: associacao.plano
    }));
    
    console.log(`${planos.length} planos encontrados para o aluno ID ${alunoId}`);
    res.json(planos);
  } catch (error) {
    console.error('Erro ao buscar planos do aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar planos do aluno',
      error: error.message 
    });
  }
};

/**
 * Busca as sprints associadas ao aluno logado através de seu plano
 * Se for administrador, retorna todas as sprints do sistema
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de sprints associadas ao aluno ou todas as sprints (se admin)
 */
exports.getAlunoSprints = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.user com id e role
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`===== INICIANDO BUSCA DE SPRINTS =====`);
    console.log(`ID do usuário autenticado: ${userId}, Role: ${userRole}`);
    console.log(`Dados do token:`, req.user);
    
    // Importa os modelos necessários
    const { AlunoPlano, Plano, Sprint, Meta } = require('../models');
    console.log(`Modelos importados com sucesso`);
    
    // Se for administrador, retorna todas as sprints do sistema
    if (userRole === 'administrador') {
      console.log(`Usuário é administrador - buscando todas as sprints do sistema`);
      
      const todasSprints = await Sprint.findAll({
        include: [
          {
            model: Meta,
            as: 'metas'
          },
          {
            model: Plano,
            as: 'Plano'
          }
        ],
        order: [
          ['PlanoId', 'ASC'],
          ['posicao', 'ASC'],
          ['dataInicio', 'ASC']
        ]
      });
      
      console.log(`${todasSprints?.length || 0} sprints encontradas no sistema para administrador`);
      return res.json(todasSprints || []);
    }
    
    // Busca as associações aluno-plano
    console.log(`Buscando associações do aluno ID ${userId} com planos...`);
    const associacoes = await AlunoPlano.findAll({
      where: { IdUsuario: userId },
      include: [{
        model: Plano
      }]
    });
    
    console.log(`Número de associações encontradas: ${associacoes?.length || 0}`);
    if (associacoes && associacoes.length > 0) {
      console.log(`Primeira associação:`, JSON.stringify(associacoes[0].toJSON(), null, 2));
    }
    
    if (!associacoes || associacoes.length === 0) {
      console.log(`Nenhum plano encontrado para o aluno ID ${userId}`);
      return res.status(404).json({ 
        message: 'Aluno não possui planos de estudo atribuídos' 
      });
    }
    
    // Pega o primeiro plano (geralmente será apenas um)
    const planoId = associacoes[0].planoId;
    console.log(`Usando plano ID ${planoId} para buscar sprints`);
    
    if (!planoId) {
      console.log(`ERRO: ID do plano não encontrado na associação`);
      return res.status(500).json({ 
        message: 'Erro ao identificar plano do aluno',
        details: 'PlanoId ausente na associação' 
      });
    }
    
    // Busca as sprints associadas ao plano
    console.log(`Buscando sprints do plano ID ${planoId}...`);
    const sprints = await Sprint.findAll({
      where: { PlanoId: planoId },
      include: [{
        model: Meta,
        as: 'metas'
      }],
      order: [
        ['posicao', 'ASC'],
        ['dataInicio', 'ASC']
      ]
    });
    
    console.log(`Número de sprints encontradas: ${sprints?.length || 0}`);
    if (sprints && sprints.length > 0) {
      console.log(`Primeira sprint ID: ${sprints[0].id}, Nome: ${sprints[0].nome}`);
      console.log(`Número de metas na primeira sprint: ${sprints[0].metas?.length || 0}`);
    }
    
    if (!sprints || sprints.length === 0) {
      console.log(`Nenhuma sprint encontrada para o plano ID ${planoId}`);
      return res.status(404).json({ 
        message: 'Não há sprints cadastradas no plano de estudo' 
      });
    }
    
    console.log(`${sprints.length} sprints encontradas para o aluno ID ${userId}`);
    console.log(`===== FINALIZANDO BUSCA DE SPRINTS =====`);
    res.json(sprints);
  } catch (error) {
    console.error('===== ERRO AO BUSCAR SPRINTS =====');
    console.error('Erro ao buscar sprints:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Erro ao buscar sprints',
      error: error.message 
    });
  }
};

/**
 * 🔥 PRÉ-CADASTRO INTELIGENTE - VERSÃO 2.0
 * 
 * ⚠️  CRÍTICO: NÃO ALTERAR SEM CONSULTAR EQUIPE DE DESENVOLVIMENTO
 * 
 * Esta função implementa um sistema inteligente de pré-cadastro que permite:
 * 1. Novos usuários: Criação completa do usuário
 * 2. Usuários existentes: Reutilização para novas compras
 * 
 * 🏗️  ARQUITETURA IMPLEMENTADA:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    FLUXO PRÉ-CADASTRO V2.0                     │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 1. Validações básicas (campos obrigatórios, emails, CPF)       │
 * │ 2. Busca usuário existente por CPF (limpo, sem formatação)     │
 * │ 3. USUÁRIO EXISTENTE:                                          │
 * │    ├── Reutiliza usuário                                       │
 * │    ├── UPSERT aluno_info (atualiza ou cria)                   │
 * │    ├── Valida mudança de email                                 │
 * │    └── Atualiza dados se necessário                           │
 * │ 4. USUÁRIO NOVO:                                               │
 * │    ├── Valida email único                                      │
 * │    ├── Cria usuário                                            │
 * │    └── UPSERT aluno_info                                       │
 * │ 5. Cliente Asaas (sempre executado):                           │
 * │    └── getOrCreateCustomer() - reutiliza ou cria              │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 🔧 PROBLEMAS RESOLVIDOS:
 * ✅ Constraint UNIQUE na tabela aluno_info (IdUsuario)
 * ✅ Usuários existentes podem fazer novas compras
 * ✅ Reutilização de clientes Asaas (evita duplicações)
 * ✅ Validação inteligente de emails (permite mudança para mesmo usuário)
 * ✅ Status de pagamento resetado para novas compras
 * 
 * 🚨 PONTOS CRÍTICOS DE SEGURANÇA:
 * - CPF é a chave de identificação principal (sempre limpo)
 * - Email pode ser alterado, mas deve ser único globalmente
 * - UPSERT garante que não há duplicação em aluno_info
 * - Cliente Asaas é reutilizado por idusuario (constraint UNIQUE)
 * - Status de pagamento sempre resetado para 'PENDENTE'
 * 
 * 📊 TABELAS IMPACTADAS:
 * - usuario: Criação ou reutilização
 * - aluno_info: UPSERT por IdUsuario (UNIQUE constraint)
 * - asaas_cliente: Reutilização por idusuario (UNIQUE constraint)
 * 
 * 🔄 INTEGRAÇÃO COM ASAAS:
 * - getOrCreateCustomer() gerencia cliente automaticamente
 * - Suporte a múltiplas compras do mesmo usuário
 * - Histórico de pagamentos mantido
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Dados do pré-cadastro
 * @param {string} req.body.nome - Nome completo
 * @param {string} req.body.email - Email (pode ser alterado)
 * @param {string} req.body.emailConfirmacao - Confirmação do email
 * @param {string} req.body.telefone - Telefone formatado
 * @param {string} req.body.cpf - CPF (chave de identificação)
 * @param {string} req.body.cep - CEP
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Usuário e cliente Asaas (status 200 para existente, 201 para novo)
 * 
 * @version 2.0
 * @since 2024-12-21
 * @author Equipe de Desenvolvimento
 * 
 * ⚠️  HISTÓRICO DE ALTERAÇÕES:
 * - v1.0: Bloqueava usuários existentes
 * - v2.0: Permite reutilização de usuários existentes
 * 
 * 🚫 NÃO ALTERE ESTE MÉTODO SEM:
 * 1. Consultar a equipe de desenvolvimento
 * 2. Testar em ambiente de desenvolvimento
 * 3. Validar integração com Asaas
 * 4. Verificar constraints do banco de dados
 */
exports.preCadastro = async (req, res) => {
    try {
        const { nome, email, emailConfirmacao, telefone, cpf, cep } = req.body;

        // Validações básicas
        if (!nome || !email || !emailConfirmacao || !telefone || !cpf || !cep) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        if (email !== emailConfirmacao) {
            return res.status(400).json({ error: 'Os emails não conferem' });
        }

        // Validar CPF usando a validação do Asaas
        if (!asaasService._validarCPF(cpf)) {
            return res.status(400).json({ error: 'CPF inválido' });
        }

        // 🔄 NOVA LÓGICA: Verificar se usuário já existe (por CPF)
        const usuarioExistenteCPF = await Usuario.findOne({ 
            where: { cpf: limparCPF(cpf) },
            include: [{
                model: AlunoInfo,
                as: 'alunoInfo',
                required: false
            }]
        });

        let usuario, alunoInfo, asaasCliente;
        let isNovoUsuario = false;

        if (usuarioExistenteCPF) {
            // ✅ USUÁRIO JÁ EXISTE - Reutilizar para nova compra
            console.log(`🔄 Usuário existente encontrado - ID: ${usuarioExistenteCPF.IdUsuario}, Nome: ${usuarioExistenteCPF.nome}`);
            
            usuario = usuarioExistenteCPF;
            alunoInfo = usuarioExistenteCPF.alunoInfo;

            // 🔄 USAR UPSERT para criar ou atualizar alunoInfo
            const [alunoInfoResult, created] = await AlunoInfo.upsert({
                IdUsuario: usuario.IdUsuario,
                email,
                cpf: limparCPF(cpf),
                telefone,
                cep,
                status_cadastro: 'PRE_CADASTRO',
                status_pagamento: 'PENDENTE', // Resetar para nova compra
                data_criacao: new Date()
            }, {
                returning: true // PostgreSQL retorna o registro
            });

            // O upsert retorna [instance, created] no PostgreSQL
            alunoInfo = alunoInfoResult;
            console.log(`📝 AlunoInfo ${created ? 'criado' : 'atualizado'} para usuário ID: ${usuario.IdUsuario}`);

            // Verificar se email mudou e se o novo email já está em uso
            if (usuario.login !== email) {
                const emailJaUsado = await Usuario.findOne({ 
                    where: { 
                        login: email,
                        IdUsuario: { [Op.ne]: usuario.IdUsuario } // Diferente do usuário atual
                    } 
                });
                
                if (emailJaUsado) {
                    return res.status(400).json({ 
                        error: 'Este email já está sendo usado por outro usuário' 
                    });
                }

                // Atualizar email/login do usuário
                await usuario.update({ login: email });
                console.log(`📧 Email do usuário atualizado: ${email}`);
            }

        } else {
            // 🆕 USUÁRIO NOVO - Criar normalmente
            console.log(`🆕 Criando novo usuário: ${nome}`);
            
            // Validar se email já está em uso por outro usuário
            const usuarioExistenteEmail = await Usuario.findOne({ where: { login: email } });
            if (usuarioExistenteEmail) {
                return res.status(400).json({ error: 'Email já cadastrado no sistema' });
            }

            // Criar usuário com dados básicos
            usuario = await Usuario.create({
                nome,
                cpf: limparCPF(cpf),
                login: email,
                grupo: 1, // Grupo de alunos
                situacao: true
            });

            // Criar registro em aluno_info usando upsert (por segurança)
            const [alunoInfoResult, created] = await AlunoInfo.upsert({
                IdUsuario: usuario.IdUsuario,
                email,
                cpf: limparCPF(cpf),
                telefone,
                cep,
                status_cadastro: 'PRE_CADASTRO',
                status_pagamento: 'PENDENTE',
                data_criacao: new Date()
            }, {
                returning: true
            });

            alunoInfo = alunoInfoResult;

            isNovoUsuario = true;
            console.log(`✅ Novo usuário criado - ID: ${usuario.IdUsuario}`);
        }

        // 🎯 CRIAR/REUTILIZAR CLIENTE ASAAS (sempre executado)
        asaasCliente = await asaasService.getOrCreateCustomer({
            idusuario: usuario.IdUsuario,
            nome: usuario.nome,
            email: alunoInfo.email,
            telefone: alunoInfo.telefone,
            cpf: alunoInfo.cpf,
            cep: alunoInfo.cep,
            grupo: 1
        });

        console.log(`🎯 Cliente Asaas: ${asaasCliente.id_cliente_asaas} (${isNovoUsuario ? 'novo' : 'existente'})`);

        return res.status(isNovoUsuario ? 201 : 200).json({
            message: isNovoUsuario ? 'Pré-cadastro realizado com sucesso' : 'Usuário existente - prosseguindo com nova compra',
            usuario: {
                id: usuario.IdUsuario,
                nome: usuario.nome,
                email: alunoInfo.email,
                isNovoUsuario
            },
            asaasCliente
        });

    } catch (error) {
        console.error('Erro ao realizar pré-cadastro:', error);
        return res.status(500).json({ 
            error: 'Erro ao realizar pré-cadastro',
            details: error.message 
        });
    }
};

module.exports = {
  createAluno: exports.createAluno,
  getAllAlunos: exports.getAllAlunos,
  getAlunoById: exports.getAlunoById,
  updateAluno: exports.updateAluno,
  deleteAluno: exports.deleteAluno,
  definirSenha: exports.definirSenha,
  gerarSenha: exports.gerarSenha,
  getAlunoPlanos: exports.getAlunoPlanos,
  getAlunoSprints: exports.getAlunoSprints,
  preCadastro: exports.preCadastro
}; 