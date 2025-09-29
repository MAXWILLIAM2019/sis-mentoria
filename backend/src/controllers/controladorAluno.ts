/**
 * Controller de Aluno
 * 
 * Este módulo gerencia todas as operações relacionadas a alunos,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 * Implementa regras de negócio e validação de dados.
 */

import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { RequestComAutenticacao, RequestAluno, RespostaSucesso, RespostaErro, UtilitarioResposta } from '../types/requestResponse';
import { TipoUsuario } from '../types/interfaces';

// Importações dos modelos
const { Usuario, GrupoUsuario, AlunoInfo } = require('../models');
const { Op } = require('sequelize');

/**
 * Cria um novo aluno
 * 
 * @param {RequestAluno} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Aluno criado com status 201 ou mensagem de erro
 */
export const criarAluno = async (req: RequestAluno, res: Response): Promise<void> => {
  try {
    const { nome, email, cpf, senha } = req.body;
    
    if (!nome || !email || !cpf) {
      res.status(400).json(UtilitarioResposta.erro('Preencha nome, email e CPF.'));
      return;
    }

    // Verifica se já existe usuário com o mesmo email (login)
    const usuarioExistente = await Usuario.findOne({ where: { login: email } });
    if (usuarioExistente) {
      res.status(400).json(UtilitarioResposta.erro('Já existe um usuário com este email.'));
      return;
    }

    // Verifica se já existe usuário com o mesmo CPF
    const cpfExistente = await Usuario.findOne({ where: { cpf } });
    if (cpfExistente) {
      res.status(400).json(UtilitarioResposta.erro('Já existe um usuário com este CPF.'));
      return;
    }

    // Busca o grupo "aluno"
    const grupoObj = await GrupoUsuario.findOne({ where: { nome: 'aluno' } });
    if (!grupoObj) {
      res.status(400).json(UtilitarioResposta.erro('Grupo de usuário "aluno" não encontrado.'));
      return;
    }

    // Criptografa a senha se enviada, senão deixa nulo
    let senhaCriptografada: string | null = null;
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
      cpf: cpf
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

    res.status(201).json(UtilitarioResposta.sucesso('Aluno cadastrado com sucesso', {
      usuario: usuarioSemSenha,
      alunoInfo
    }));
  } catch (erro: any) {
    console.error('Erro ao cadastrar aluno:', erro);
    if (erro.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json(UtilitarioResposta.erro('Já existe um aluno cadastrado com este email ou CPF.'));
      return;
    }
    res.status(500).json(UtilitarioResposta.erro('Erro ao cadastrar aluno', erro.message));
  }
};

/**
 * Busca todos os alunos
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Array} Lista de todos os alunos cadastrados
 */
export const obterTodosAlunos = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
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
    const alunosFormatados = alunos.map((u: any) => ({
      id: u.IdUsuario,
      email: u.login,
      situacao: u.situacao,
      nome: u.nome || '',
      cpf: u.cpf || '',
      info: u.alunoInfo || {}
    }));

    res.json(UtilitarioResposta.sucesso('Alunos listados com sucesso', alunosFormatados));
  } catch (erro: any) {
    console.error('Erro ao listar alunos:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao listar alunos', erro.message));
  }
};

/**
 * Busca um aluno específico
 * 
 * @param {RequestAluno} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Dados do aluno encontrado ou mensagem de erro 404
 */
export const obterAlunoPorId = async (req: RequestAluno, res: Response): Promise<void> => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] } // Exclui o campo senha da resposta
    });
    
    if (!aluno) {
      res.status(404).json(UtilitarioResposta.erro('Aluno não encontrado'));
      return;
    }
    
    res.json(UtilitarioResposta.sucesso('Aluno encontrado com sucesso', aluno));
  } catch (erro: any) {
    console.error('Erro ao buscar aluno:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao buscar aluno', erro.message));
  }
};

/**
 * Atualiza os dados de um aluno
 * 
 * @param {RequestAluno} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Aluno atualizado ou mensagem de erro
 */
export const atualizarAluno = async (req: RequestAluno, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, biografia, formacao, isTrabalhando, isAceitaTermos } = req.body;

    // Validação de telefone se fornecido
    if (telefone !== undefined && telefone !== null && telefone !== '') {
      // Remove todos os caracteres não numéricos
      const apenasNumeros = telefone.replace(/\D/g, '');
      
      // Valida se tem 10 ou 11 dígitos (telefone brasileiro)
      if (apenasNumeros.length !== 10 && apenasNumeros.length !== 11) {
        res.status(400).json(UtilitarioResposta.erro(
          'Telefone deve ter 10 ou 11 dígitos (formato brasileiro)',
          'VALIDATION_ERROR',
          {
            field: 'telefone',
            received: telefone,
            expected: 'Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
          }
        ));
        return;
      }
      
      // Valida se contém apenas números válidos
      if (!/^\d{10,11}$/.test(apenasNumeros)) {
        res.status(400).json(UtilitarioResposta.erro(
          'Telefone deve conter apenas números válidos',
          'VALIDATION_ERROR',
          {
            field: 'telefone',
            received: telefone
          }
        ));
        return;
      }
    }

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
      res.status(404).json(UtilitarioResposta.erro('Aluno não encontrado.'));
      return;
    }

    // Verifica se o novo email já existe em outro usuário
    if (email && email !== usuario.login) {
      const emailExistente = await Usuario.findOne({ where: { login: email } });
      if (emailExistente) {
        res.status(400).json(UtilitarioResposta.erro('Já existe um usuário com este email.'));
        return;
      }
    }

    // Atualiza o usuário (CPF não pode ser alterado pelo próprio aluno)
    await usuario.update({
      nome: nome || usuario.nome,
      login: email || usuario.login
    });

    // Atualiza os dados no AlunoInfo
    const dadosAlunoInfo: any = {};
    if (email) dadosAlunoInfo.email = email;
    if (telefone !== undefined) dadosAlunoInfo.telefone = telefone;
    if (biografia !== undefined) dadosAlunoInfo.biografia = biografia;
    if (formacao !== undefined) dadosAlunoInfo.formacao = formacao;
    if (isTrabalhando !== undefined) dadosAlunoInfo.is_trabalhando = isTrabalhando;
    if (isAceitaTermos !== undefined) dadosAlunoInfo.is_aceita_termos = isAceitaTermos;

    if (Object.keys(dadosAlunoInfo).length > 0) {
      // Verificar se existe registro na tabela aluno_info
      const alunoInfoExistente = await AlunoInfo.findOne({ where: { IdUsuario: id } });
      
      if (alunoInfoExistente) {
        // Atualizar registro existente
        await AlunoInfo.update(
          dadosAlunoInfo,
          { where: { IdUsuario: id } }
        );
      } else {
        // Criar novo registro se não existir
        const dadosParaCriar = {
          IdUsuario: id,
          email: email || usuario.login, // Usar email fornecido ou login do usuário
          ...dadosAlunoInfo
        };
        await AlunoInfo.create(dadosParaCriar);
      }
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
      id: usuarioAtualizado?.IdUsuario,
      email: usuarioAtualizado?.login,
      situacao: usuarioAtualizado?.situacao,
      nome: usuarioAtualizado?.nome,
      cpf: usuarioAtualizado?.cpf,
      info: usuarioAtualizado?.alunoInfo,
      // Incluir dados específicos do aluno_info para facilitar o frontend
      telefone: usuarioAtualizado?.alunoInfo?.telefone,
      biografia: usuarioAtualizado?.alunoInfo?.biografia,
      formacao: usuarioAtualizado?.alunoInfo?.formacao,
      isTrabalhando: usuarioAtualizado?.alunoInfo?.is_trabalhando,
      isAceitaTermos: usuarioAtualizado?.alunoInfo?.is_aceita_termos
    };

    res.json(UtilitarioResposta.sucesso('Aluno atualizado com sucesso', resposta));
  } catch (erro: any) {
    console.error('Erro ao atualizar aluno:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao atualizar aluno', erro.message));
  }
};

/**
 * Deleta um aluno
 * 
 * @param {RequestAluno} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
export const deletarAluno = async (req: RequestAluno, res: Response): Promise<void> => {
  try {
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      res.status(404).json(UtilitarioResposta.erro('Aluno não encontrado'));
      return;
    }

    // Remove o aluno
    await aluno.destroy();
    res.json(UtilitarioResposta.sucesso('Aluno deletado com sucesso'));
  } catch (erro: any) {
    console.error('Erro ao deletar aluno:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao deletar aluno', erro.message));
  }
};

/**
 * Define ou altera uma senha para um aluno
 * 
 * Comportamento diferenciado:
 * - ALUNO: Requer senha atual para validação (alteração de senha)
 * - ADMINISTRADOR: Não requer senha atual (criação/definição de senha)
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
export const definirSenha = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    const userRole = req.user?.role;
    
    // Validações básicas
    if (!novaSenha) {
      res.status(400).json(UtilitarioResposta.erro('A nova senha é obrigatória'));
      return;
    }
    if (novaSenha.length < 6) {
      res.status(400).json(UtilitarioResposta.erro('A nova senha deve ter pelo menos 6 caracteres'));
      return;
    }
    
    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      res.status(404).json(UtilitarioResposta.erro('Usuário não encontrado'));
      return;
    }
    
    // Se for o próprio aluno alterando a senha, valida a senha atual
    if (userRole === TipoUsuario.ALUNO && req.user?.id === parseInt(id || '0')) {
      if (!senhaAtual) {
        res.status(400).json(UtilitarioResposta.erro('A senha atual é obrigatória'));
        return;
      }
      
      // Verifica se a senha atual está correta
      const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaAtualValida) {
        res.status(400).json(UtilitarioResposta.erro('Senha atual incorreta'));
        return;
      }
    }
    // Se for administrador, não precisa validar senha atual (pode criar/alterar senha)
    
    // Criptografa e salva a nova senha
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    await usuario.update({ senha: senhaCriptografada });
    
    const message = userRole === TipoUsuario.ADMINISTRADOR ? 'Senha definida com sucesso' : 'Senha alterada com sucesso';
    res.json(UtilitarioResposta.sucesso(message));
  } catch (erro: any) {
    console.error('Erro ao alterar senha:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao alterar senha', erro.message));
  }
};

/**
 * Gera uma senha aleatória para um aluno
 * 
 * @param {RequestAluno} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Senha gerada em texto plano e mensagem de sucesso
 */
export const gerarSenha = async (req: RequestAluno, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      res.status(404).json(UtilitarioResposta.erro('Usuário não encontrado'));
      return;
    }
    
    const senhaGerada = Math.random().toString(36).slice(-8);
    const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);
    await usuario.update({ senha: senhaCriptografada });
    
    res.json(UtilitarioResposta.sucesso('Senha gerada com sucesso', { senha: senhaGerada }));
  } catch (erro: any) {
    console.error('Erro ao gerar senha:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao gerar senha', erro.message));
  }
};

/**
 * Busca os planos associados ao aluno autenticado
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Array} Lista de planos associados ao aluno
 */
export const obterPlanosAluno = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    // O middleware de autenticação já adicionou req.aluno e req.user
    const alunoId = req.user?.id;
    
    if (!alunoId) {
      res.status(401).json(UtilitarioResposta.erro('Usuário não autenticado'));
      return;
    }
    
    // Importa os modelos necessários
    const { AlunoPlano, Plano } = require('../models');
    
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
      res.json(UtilitarioResposta.sucesso('Nenhum plano encontrado', []));
      return;
    }
    
    // Formata o resultado
    const planos = associacoes.map((associacao: any) => ({
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
    res.json(UtilitarioResposta.sucesso('Planos do aluno obtidos com sucesso', planos));
  } catch (erro: any) {
    console.error('Erro ao buscar planos do aluno:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao buscar planos do aluno', erro.message));
  }
};

/**
 * Busca as sprints associadas ao aluno logado através de seu plano
 * Se for administrador, retorna todas as sprints do sistema
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Array} Lista de sprints associadas ao aluno ou todas as sprints (se admin)
 */
export const obterSprintsAluno = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    // O middleware de autenticação já adicionou req.user com id e role
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId || !userRole) {
      res.status(401).json(UtilitarioResposta.erro('Usuário não autenticado'));
      return;
    }
    
    console.log(`===== INICIANDO BUSCA DE SPRINTS =====`);
    console.log(`ID do usuário autenticado: ${userId}, Role: ${userRole}`);
    console.log(`Dados do token:`, req.user);
    
    // Importa os modelos necessários
    const { AlunoPlano, Plano, Sprint, Meta } = require('../models');
    console.log(`Modelos importados com sucesso`);
    
    // Se for administrador, retorna todas as sprints do sistema
    if (userRole === TipoUsuario.ADMINISTRADOR) {
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
      res.json(UtilitarioResposta.sucesso('Sprints do sistema obtidas com sucesso', todasSprints || []));
      return;
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
      res.status(404).json(UtilitarioResposta.erro('Aluno não possui planos de estudo atribuídos'));
      return;
    }
    
    // Pega o primeiro plano (geralmente será apenas um)
    const planoId = associacoes[0].planoId;
    console.log(`Usando plano ID ${planoId} para buscar sprints`);
    
    if (!planoId) {
      console.log(`ERRO: ID do plano não encontrado na associação`);
      res.status(500).json(UtilitarioResposta.erro(
        'Erro ao identificar plano do aluno',
        'PLANO_ID_MISSING',
        'PlanoId ausente na associação'
      ));
      return;
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
      res.status(404).json(UtilitarioResposta.erro('Não há sprints cadastradas no plano de estudo'));
      return;
    }
    
    console.log(`${sprints.length} sprints encontradas para o aluno ID ${userId}`);
    console.log(`===== FINALIZANDO BUSCA DE SPRINTS =====`);
    res.json(UtilitarioResposta.sucesso('Sprints do aluno obtidas com sucesso', sprints));
  } catch (erro: any) {
    console.error('===== ERRO AO BUSCAR SPRINTS =====');
    console.error('Erro ao buscar sprints:', erro);
    console.error('Stack trace:', erro.stack);
    res.status(500).json(UtilitarioResposta.erro('Erro ao buscar sprints', erro.message));
  }
};

/**
 * Atualiza as configurações de notificação do aluno
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
export const atualizarNotificacoes = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notificacoes } = req.body;
    
    // Validações básicas
    if (!notificacoes || typeof notificacoes !== 'object') {
      res.status(400).json(UtilitarioResposta.erro('Configurações de notificação são obrigatórias'));
      return;
    }

    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      res.status(404).json(UtilitarioResposta.erro('Usuário não encontrado'));
      return;
    }

    // Busca ou cria o registro de aluno_info
    let alunoInfo = await AlunoInfo.findOne({ where: { IdUsuario: id } });
    
    if (!alunoInfo) {
      // Cria um novo registro se não existir
      alunoInfo = await AlunoInfo.create({
        IdUsuario: id,
        email: usuario.login,
        notif_novidades_plataforma: notificacoes.novidadesPlataforma ?? true,
        notif_mensagens_mentor: notificacoes.mensagensMentor ?? true,
        notif_novo_material: notificacoes.novoMaterial ?? true,
        notif_atividades_simulados: notificacoes.atividadesSimulados ?? false,
        notif_mentorias: notificacoes.mentorias ?? false
      });
    } else {
      // Atualiza o registro existente
      await alunoInfo.update({
        notif_novidades_plataforma: notificacoes.novidadesPlataforma ?? true,
        notif_mensagens_mentor: notificacoes.mensagensMentor ?? true,
        notif_novo_material: notificacoes.novoMaterial ?? true,
        notif_atividades_simulados: notificacoes.atividadesSimulados ?? false,
        notif_mentorias: notificacoes.mentorias ?? false
      });
    }

    res.json(UtilitarioResposta.sucesso('Configurações de notificação atualizadas com sucesso', {
      notificacoes: {
        novidadesPlataforma: alunoInfo.notif_novidades_plataforma,
        mensagensMentor: alunoInfo.notif_mensagens_mentor,
        novoMaterial: alunoInfo.notif_novo_material,
        atividadesSimulados: alunoInfo.notif_atividades_simulados,
        mentorias: alunoInfo.notif_mentorias
      }
    }));
  } catch (erro: any) {
    console.error('Erro ao atualizar notificações:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao atualizar notificações', erro.message));
  }
};

// Exportação padrão para compatibilidade com CommonJS
export default {
  criarAluno,
  obterTodosAlunos,
  obterAlunoPorId,
  atualizarAluno,
  deletarAluno,
  definirSenha,
  gerarSenha,
  obterPlanosAluno,
  obterSprintsAluno,
  atualizarNotificacoes
};

