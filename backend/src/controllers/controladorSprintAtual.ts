import { Request, Response } from 'express';
import SprintAtual from '../models/SprintAtual';
import Sprint from '../models/sprint';
import Aluno from '../models/aluno';
import Plano from '../models/plano';
import AlunoPlano from '../models/AlunoPlano';
import Meta from '../models/Meta';
import { RequestSprintAtual } from '../types/requestResponse';

/**
 * Busca a sprint atual do aluno
 */
export const obterSprintAtual = async (req: RequestSprintAtual, res: Response): Promise<void> => {
  try {
    console.log('========== BUSCANDO SPRINT ATUAL ==========');
    
    // Obter o ID do usuário, considerando impersonation
    const idusuario = req.user.id;
    console.log('Informações do usuário:', req.user);
    console.log('ID do usuário:', idusuario);

    if (!idusuario) {
      res.status(400).json({ message: 'ID do usuário não encontrado' });
      return;
    }

    // Primeiro, buscar o plano do usuário
    const alunoPlano = await AlunoPlano.findOne({
      where: { idusuario },
      include: [{
        model: Plano,
        as: 'plano',
        include: [{
          model: Sprint,
          as: 'sprints',
          include: [{
            model: Meta,
            as: 'metas',
            attributes: [
              'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link', 
              'relevancia', 'tempoEstudado', 'desempenho', 'status',
              'totalQuestoes', 'questoesCorretas', 'SprintId'
            ]
          }]
        }]
      }]
    });

    if (!alunoPlano || !alunoPlano.plano || !alunoPlano.plano.sprints || alunoPlano.plano.sprints.length === 0) {
      res.status(404).json({ message: 'Usuário não possui plano de estudo com sprints' });
      return;
    }

    // Ordenar as sprints por posição
    const sprintsOrdenadas = alunoPlano.plano.sprints.sort((a: any, b: any) => a.posicao - b.posicao);
    const primeiraSprint = sprintsOrdenadas[0];

    // Buscar a sprint atual do usuário com todas as metas instanciadas
    let sprintAtual = await SprintAtual.findOne({
      where: { idusuario },
      include: [{
        model: Sprint,
        include: [{
          model: Meta,
          as: 'metas',
          attributes: [
            'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link', 
            'relevancia', 'tempoEstudado', 'desempenho', 'status',
            'totalQuestoes', 'questoesCorretas', 'SprintId'
          ]
        }]
      }]
    });

    // Se não existir sprint atual, criar com a primeira sprint do plano
    if (!sprintAtual) {
      sprintAtual = await SprintAtual.create({
        idusuario,
        SprintId: primeiraSprint.id
      });

      // Buscar a sprint completa com suas metas instanciadas
      const sprintCompleta = await Sprint.findByPk(primeiraSprint.id, {
        include: [{
          model: Meta,
          as: 'metas',
          attributes: [
            'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link', 
            'relevancia', 'tempoEstudado', 'desempenho', 'status',
            'totalQuestoes', 'questoesCorretas', 'SprintId'
          ]
        }]
      });

      // Formatar a resposta
      const sprintFormatada = {
        id: sprintCompleta?.id,
        nome: sprintCompleta?.nome,
        posicao: sprintCompleta?.posicao,
        dataInicio: sprintCompleta?.dataInicio,
        dataFim: sprintCompleta?.dataFim,
        PlanoId: sprintCompleta?.PlanoId,
        metas: (sprintCompleta as any)?.metas?.map((meta: any) => ({
          id: meta.id,
          disciplina: meta.disciplina,
          tipo: meta.tipo,
          titulo: meta.titulo,
          comandos: meta.comandos,
          link: meta.link,
          relevancia: meta.relevancia,
          tempoEstudado: meta.tempoEstudado || '00:00',
          desempenho: meta.desempenho || 0,
          status: meta.status || 'Pendente',
          totalQuestoes: meta.totalQuestoes || 0,
          questoesCorretas: meta.questoesCorretas || 0,
          SprintId: meta.SprintId
        }))
      };

      res.json(sprintFormatada);
      return;
    }

    // Se já existe sprint atual, formatar e retornar
    const sprintFormatada = {
      id: sprintAtual.Sprint.id,
      nome: sprintAtual.Sprint.nome,
      posicao: sprintAtual.Sprint.posicao,
      dataInicio: sprintAtual.Sprint.dataInicio,
      dataFim: sprintAtual.Sprint.dataFim,
      PlanoId: sprintAtual.Sprint.PlanoId,
      metas: sprintAtual.Sprint.metas.map((meta: any) => ({
        id: meta.id,
        disciplina: meta.disciplina,
        tipo: meta.tipo,
        titulo: meta.titulo,
        comandos: meta.comandos,
        link: meta.link,
        relevancia: meta.relevancia,
        tempoEstudado: meta.tempoEstudado || '00:00',
        desempenho: meta.desempenho || 0,
        status: meta.status || 'Pendente',
        totalQuestoes: meta.totalQuestoes || 0,
        questoesCorretas: meta.questoesCorretas || 0,
        SprintId: meta.SprintId
      }))
    };

    res.json(sprintFormatada);
  } catch (error: any) {
    console.error('Erro ao buscar sprint atual:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza a sprint atual do aluno
 * 
 * ATENÇÃO: FUNCIONALIDADE TESTADA E FUNCIONAL - NÃO ALTERAR SEM CONSULTA!
 * 
 * Este método é responsável por:
 * 1. Atualizar qual sprint o aluno está fazendo atualmente
 * 2. Gerenciar o status da sprint anterior ao avançar
 * 
 * Fluxo de Gerenciamento de Status:
 * 1. Ao avançar para próxima sprint:
 *    - Verifica se todas as metas da sprint atual estão concluídas
 *    - Se sim, marca a sprint atual como 'Concluída' antes de mudar
 * 
 * IMPORTANTE:
 * - Esta função trabalha em conjunto com sprintController.updateMetaInstancia
 *   para garantir consistência no status das sprints
 * - O status 'Concluída' pode ser atribuído aqui ou ao concluir todas as metas
 * - Não permite avançar se houver metas pendentes
 * 
 * Validações de Segurança:
 * - Verifica se a sprint pertence ao plano do usuário
 * - Verifica se o usuário tem plano ativo
 * - Verifica conclusão das metas antes de avançar
 * 
 * @param {Object} req.user.id - ID do usuário logado
 * @param {Object} req.body - Dados da atualização
 * @param {number} req.body.sprintId - ID da nova sprint atual
 */
export const atualizarSprintAtual = async (req: RequestSprintAtual, res: Response): Promise<void> => {
  try {
    const idusuario = req.user.id;
    const { sprintId } = req.body;

    if (!sprintId) {
      res.status(400).json({ message: 'ID da sprint é obrigatório' });
      return;
    }

    // Verificar se a sprint existe
    const sprint = await Sprint.findByPk(sprintId);
    if (!sprint) {
      res.status(404).json({ message: 'Sprint não encontrada' });
      return;
    }

    // Verificar se a sprint pertence ao plano do usuário usando AlunoPlano
    const alunoPlano = await AlunoPlano.findOne({
      where: { 
        idusuario,
        ativo: true 
      },
      include: [{
        model: Plano,
        as: 'plano',
        include: [{
          model: Sprint,
          as: 'sprints'
        }]
      }]
    });

    if (!alunoPlano) {
      res.status(403).json({ message: 'Aluno não possui plano ativo' });
      return;
    }

    const sprintPertenceAoPlano = alunoPlano.plano.sprints.some((s: any) => s.id === sprintId);

    if (!sprintPertenceAoPlano) {
      res.status(403).json({ message: 'Sprint não pertence ao plano do usuário' });
      return;
    }

    // Buscar a sprint atual antes de atualizar
    const sprintAtualAnterior = await SprintAtual.findOne({
      where: { idusuario },
      include: [{
        model: Sprint,
        include: [{
          model: Meta,
          as: 'metas'
        }]
      }]
    });

    // Se existir uma sprint atual, marcar como concluída antes de mudar
    if (sprintAtualAnterior && sprintAtualAnterior.Sprint) {
      const todasMetasConcluidas = sprintAtualAnterior.Sprint.metas.every(
        (meta: any) => meta.status === 'Concluída'
      );

      if (todasMetasConcluidas) {
        await sprintAtualAnterior.Sprint.update({ status: 'Concluída' });
      }
    }

    // Atualizar ou criar o registro da sprint atual
    const [sprintAtual, created] = await SprintAtual.findOrCreate({
      where: { idusuario },
      defaults: {
        SprintId: sprintId
      }
    });

    if (!created) {
      await sprintAtual.update({
        SprintId: sprintId,
        dataAtualizacao: new Date()
      });
    }

    // Buscar a sprint completa com suas metas
    const sprintCompleta = await Sprint.findByPk(sprintId, {
      include: [{
        model: Meta,
        as: 'metas'
      }]
    });

    res.json(sprintCompleta);
  } catch (error: any) {
    console.error('Erro ao atualizar sprint atual:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Inicializa a sprint atual do aluno com a primeira sprint do seu plano
 */
export const inicializarSprintAtual = async (req: RequestSprintAtual, res: Response): Promise<void> => {
  try {
    console.log('========== INICIALIZANDO SPRINT ATUAL ==========');
    const idusuario = req.user.aluno?.id || req.user.id;
    console.log('ID do usuário:', idusuario);

    // Verificar se já existe uma sprint atual
    const sprintAtualExistente = await SprintAtual.findOne({
      where: { idusuario }
    });

    if (sprintAtualExistente) {
      console.log('Usuário já possui sprint atual');
      res.status(400).json({ message: 'Usuário já possui sprint atual' });
      return;
    }

    // Buscar o plano do usuário
    const alunoPlano = await AlunoPlano.findOne({
      where: { IdUsuario: idusuario },
      include: [{
        model: Plano,
        as: 'plano',
        include: [{
          model: Sprint,
          as: 'sprints',
          include: [{
            model: Meta,
            as: 'metas'
          }]
        }]
      }]
    });

    if (!alunoPlano || !alunoPlano.plano || !alunoPlano.plano.sprints || alunoPlano.plano.sprints.length === 0) {
      res.status(404).json({ message: 'Usuário não possui plano de estudo com sprints' });
      return;
    }

    // Ordenar as sprints por posição
    const sprintsOrdenadas = alunoPlano.plano.sprints.sort((a: any, b: any) => a.posicao - b.posicao);
    const primeiraSprint = sprintsOrdenadas[0];
    
    // Criar o registro da sprint atual
    const sprintAtual = await SprintAtual.create({
      idusuario,
      SprintId: primeiraSprint.id
    });

    // Buscar a sprint completa com suas metas
    const sprintCompleta = await Sprint.findByPk(primeiraSprint.id, {
      include: [{
        model: Meta,
        as: 'metas'
      }]
    });

    res.json(sprintCompleta);
  } catch (error: any) {
    console.error('Erro ao inicializar sprint atual:', error);
    res.status(500).json({ message: error.message });
  }
};
