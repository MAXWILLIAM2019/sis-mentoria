/**
 * Controller de Plano
 * 
 * Este módulo gerencia todas as operações relacionadas a planos de estudo,
 * incluindo criação, consulta, atualização e remoção (CRUD) de planos mestres.
 * Implementa regras de negócio e validação de dados.
 */

import { Response } from 'express';
import { RequestComAutenticacao, RequestPlano, RespostaSucesso, RespostaErro, UtilitarioResposta } from '../types/requestResponse';

// Importações dos modelos (ainda em JavaScript durante migração)
const { PlanoMestre, SprintMestre, MetaMestre, Plano, Disciplina, Assunto, Sprint, Meta } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

/**
 * Lista todos os planos mestre
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Array} Lista de todos os planos mestres ativos
 */
export const listarPlanos = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    console.log('1. Iniciando listagem de planos mestre (transparente)');
    
    // Verifica se os modelos estão disponíveis
    console.log('2. Verificando modelos disponíveis:', 
      'PlanoMestre:', !!PlanoMestre, 
      'Disciplina:', !!Disciplina, 
      'Assunto:', !!Assunto
    );
    
    // Tenta primeiro verificar se a tabela existe/está acessível
    try {
      console.log('3. Verificando acesso à tabela PlanosMestre');
      const testQuery = await PlanoMestre.findOne();
      console.log('4. Teste de acesso à tabela bem-sucedido:', !!testQuery);
    } catch (tableError: any) {
      console.error('5. Erro ao acessar tabela PlanosMestre:', tableError);
      res.status(500).json(UtilitarioResposta.erro(
        'Erro ao acessar tabela de planos',
        'TABLE_ACCESS_ERROR',
        tableError.message
      ));
      return;
    }
    
    // Tenta fazer a consulta principal
    console.log('6. Executando consulta principal');
    const planosMestre = await PlanoMestre.findAll({
      where: { ativo: true }, // Só buscar planos mestre ativos
      order: [['nome', 'ASC']] // Ordenar por nome
    });
    
    console.log('7. Consulta concluída, número de planos mestres encontrados:', planosMestre?.length || 0);
    
    // Se não houver planos, retorna um array vazio em vez de null/undefined
    if (!planosMestre || planosMestre.length === 0) {
      console.log('8. Nenhum plano mestre encontrado, retornando array vazio');
      res.json(UtilitarioResposta.sucesso('Nenhum plano encontrado', []));
      return;
    }
    
    // Transformar PlanoMestre para o formato esperado pelo frontend
    // O frontend espera o mesmo formato que os planos normais
    const planosFormatados = planosMestre.map((planoMestre: any) => ({
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio, pode ser implementado depois se necessário
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    }));
    
    console.log('9. Planos mestres encontrados e formatados, retornando dados');
    res.json(UtilitarioResposta.sucesso('Planos listados com sucesso', planosFormatados));
  } catch (erro: any) {
    console.error('10. Erro ao listar planos mestres:', erro);
    console.error('11. Stack trace:', erro.stack);
    res.status(500).json(UtilitarioResposta.erro('Erro ao listar planos', erro.message));
  }
};

/**
 * Busca um plano mestre específico
 * 
 * @param {RequestPlano} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Dados do plano mestre encontrado ou mensagem de erro 404
 */
export const buscarPlanoPorId = async (req: RequestPlano, res: Response): Promise<void> => {
  try {
    const planoMestre = await PlanoMestre.findByPk(req.params.id);

    if (!planoMestre) {
      res.status(404).json(UtilitarioResposta.erro('Plano não encontrado'));
      return;
    }

    // Transformar PlanoMestre para o formato esperado pelo frontend
    const planoFormatado = {
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio, pode ser implementado depois se necessário
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    };

    res.json(UtilitarioResposta.sucesso('Plano encontrado com sucesso', planoFormatado));
  } catch (erro: any) {
    console.error('Erro ao buscar plano mestre:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao buscar plano', erro.message));
  }
};

/**
 * Cria um novo plano mestre
 * 
 * @param {RequestPlano} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Plano mestre criado com status 201 ou mensagem de erro
 */
export const criarPlano = async (req: RequestPlano, res: Response): Promise<void> => {
  try {
    console.log('1. Recebendo dados do plano mestre:', req.body);
    const { nome, cargo, descricao, duracao, disciplinas } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !cargo || !descricao || !duracao) {
      console.log('2. Campos obrigatórios faltando:', { nome, cargo, descricao, duracao });
      res.status(400).json(UtilitarioResposta.erro('Todos os campos são obrigatórios'));
      return;
    }

    // Por enquanto, vamos ignorar as disciplinas para manter a simplicidade
    // Pode ser implementado depois se necessário
    if (disciplinas && Array.isArray(disciplinas) && disciplinas.length > 0) {
      console.log('3. Disciplinas fornecidas serão ignoradas por enquanto na migração inicial');
    }

    console.log('4. Criando plano mestre...');
    // Cria o plano mestre
    const planoMestre = await PlanoMestre.create({
      nome,
      cargo,
      descricao,
      duracao,
      versao: '1.0',
      ativo: true
    });

    console.log('5. Plano mestre criado:', planoMestre.toJSON());

    // Transformar PlanoMestre para o formato esperado pelo frontend
    const planoFormatado = {
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    };

    console.log('6. Plano mestre criado com sucesso e formatado para o frontend');
    res.status(201).json(UtilitarioResposta.sucesso('Plano criado com sucesso', planoFormatado));
  } catch (erro: any) {
    console.error('7. Erro ao criar plano mestre:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao criar plano', erro.message));
  }
};

/**
 * Atualiza um plano mestre
 * 
 * @param {RequestPlano} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Plano mestre atualizado ou mensagem de erro
 */
export const atualizarPlano = async (req: RequestPlano, res: Response): Promise<void> => {
  try {
    console.log('1. Iniciando atualização do plano mestre');
    console.log('2. ID recebido:', req.params.id);
    console.log('3. Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.params;
    const { nome, cargo, descricao, duracao, disciplinas } = req.body;

    console.log('4. Buscando plano mestre no banco...');
    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      console.log('5. Plano mestre não encontrado');
      res.status(404).json(UtilitarioResposta.erro('Plano não encontrado'));
      return;
    }
    console.log('6. Plano mestre encontrado:', planoMestre.toJSON());

    console.log('7. Atualizando dados do plano mestre...');
    // Atualiza o plano mestre
    await planoMestre.update({
      nome,
      cargo,
      descricao,
      duracao
    });
    console.log('8. Dados do plano mestre atualizados');

    // Por enquanto, ignorar disciplinas na migração inicial
    if (disciplinas && Array.isArray(disciplinas)) {
      console.log('9. Disciplinas fornecidas serão ignoradas por enquanto na migração inicial');
    }

    console.log('9. Formatando plano mestre atualizado...');
    // Transformar PlanoMestre para o formato esperado pelo frontend
    const planoFormatado = {
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    };

    console.log('10. Plano mestre atualizado e formatado para o frontend');
    res.json(UtilitarioResposta.sucesso('Plano atualizado com sucesso', planoFormatado));
  } catch (erro: any) {
    console.error('11. Erro ao atualizar plano mestre:', erro);
    console.error('12. Stack trace:', erro.stack);
    res.status(500).json(UtilitarioResposta.erro('Erro ao atualizar plano', erro.message));
  }
};

/**
 * Exclui um plano mestre (soft delete)
 * 
 * @param {RequestPlano} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
export const excluirPlano = async (req: RequestPlano, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      res.status(404).json(UtilitarioResposta.erro('Plano não encontrado'));
      return;
    }

    // Marcar como inativo ao invés de excluir fisicamente (soft delete)
    // Isso preserva a integridade referencial com instâncias já criadas
    await planoMestre.update({ ativo: false });

    res.json(UtilitarioResposta.sucesso('Plano excluído com sucesso'));
  } catch (erro: any) {
    console.error('Erro ao excluir plano mestre:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao excluir plano', erro.message));
  }
};

/**
 * Rota de teste
 * 
 * @param {RequestComAutenticacao} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Object} Mensagem de teste
 */
export const testarRota = (req: RequestComAutenticacao, res: Response): void => {
  res.json(UtilitarioResposta.sucesso('Rota de planos funcionando!'));
};

/**
 * Busca disciplinas de um plano mestre específico
 * 
 * @param {RequestPlano} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Array} Lista de disciplinas do plano mestre
 */
export const buscarDisciplinasPorPlano = async (req: RequestPlano, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Buscando disciplinas do plano mestre ${id}`);

    // Verifica se o plano mestre existe
    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      res.status(404).json(UtilitarioResposta.erro('Plano não encontrado'));
      return;
    }

    // Por enquanto, retornar array vazio na migração inicial
    // Pode ser implementado depois se necessário
    console.log(`Retornando disciplinas vazias para o plano mestre ${id} (migração inicial)`);
    res.json(UtilitarioResposta.sucesso('Disciplinas do plano obtidas com sucesso', []));
  } catch (erro: any) {
    console.error('Erro ao buscar disciplinas do plano mestre:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao buscar disciplinas do plano', erro.message));
  }
};

/**
 * Busca sprints de um plano mestre específico
 * 
 * @param {RequestPlano} req - Requisição HTTP
 * @param {Response} res - Resposta HTTP
 * @returns {Array} Lista de sprints do plano mestre com suas metas
 */
export const buscarSprintsPorPlano = async (req: RequestPlano, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log(`Buscando sprints do plano mestre ID ${id}`);
    
    // Verificar se o plano mestre existe
    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      res.status(404).json(UtilitarioResposta.erro('Plano não encontrado'));
      return;
    }
    
    // Buscar sprints mestre do plano mestre com suas metas mestre
    const sprintsMestre = await SprintMestre.findAll({
      where: { PlanoMestreId: id },
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre',
          order: [['id', 'ASC']]
        }
      ],
      order: [
        ['posicao', 'ASC'],
        ['nome', 'ASC']
      ]
    });
    
    // Transformar SprintMestre para o formato esperado pelo frontend
    const sprintsFormatadas = sprintsMestre.map((sprintMestre: any) => ({
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: id, // Manter compatibilidade com frontend
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio,
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre.map((metaMestre: any) => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestre.id,
        posicao: metaMestre.posicao
      })),
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    }));
    
    console.log(`${sprintsFormatadas.length} sprints mestre encontradas para o plano mestre ID ${id}`);
    
    res.json(UtilitarioResposta.sucesso('Sprints do plano obtidas com sucesso', sprintsFormatadas));
  } catch (erro: any) {
    console.error('Erro ao buscar sprints do plano mestre:', erro);
    console.error('Stack trace:', erro.stack);
    res.status(500).json(UtilitarioResposta.erro(
      'Erro ao buscar sprints do plano',
      'SPRINTS_FETCH_ERROR',
      erro.message
    ));
  }
};

// Exportação padrão para compatibilidade com CommonJS
export default {
  listarPlanos,
  buscarPlanoPorId,
  criarPlano,
  atualizarPlano,
  excluirPlano,
  testarRota,
  buscarDisciplinasPorPlano,
  buscarSprintsPorPlano
};



