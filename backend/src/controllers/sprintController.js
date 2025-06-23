const { SprintMestre, MetaMestre, PlanoMestre, Sprint, Meta, Plano } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

/**
 * Controller de SprintMestre e Sprint
 * ATENÇÃO: Este controller gerencia tanto templates (mestre) quanto instâncias.
 * Algumas funções são específicas para módulos do sistema e NÃO devem ser alteradas
 * sem consulta prévia ao time de desenvolvimento.
 */

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Cria uma nova sprint mestre com suas metas mestre
 * Esta função é específica para o template de plano e é usada apenas na interface do administrador
 * 
 * Gerenciamento de Posições:
 * - Para evitar problemas de race condition ao criar múltiplas metas simultaneamente,
 *   usamos o índice do array + 1 como posição, garantindo posições únicas (1, 2, 3, etc.)
 * - Este método NÃO consulta o banco para determinar posições, evitando conflitos
 * - As posições são atribuídas sequencialmente na ordem em que as metas aparecem no array
 * 
 * Exemplo:
 * metas = [
 *   { titulo: "Meta 1" }, // receberá posição 1
 *   { titulo: "Meta 2" }, // receberá posição 2
 *   { titulo: "Meta 3" }  // receberá posição 3
 * ]
 */
exports.createSprint = async (req, res) => {
  try {
    // Log do header Authorization
    console.log('Authorization header recebido (cadastrar sprint mestre):', req.header('Authorization'));
    const { nome, dataInicio, dataFim, planoId, metas } = req.body;

    // Verificar se o planoId foi fornecido
    if (!planoId) {
      return res.status(400).json({ message: 'É necessário associar a sprint a um plano de estudo' });
    }

    // Verificar se o plano mestre existe
    const planoMestre = await PlanoMestre.findByPk(planoId);
    if (!planoMestre) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    // Determinar a próxima posição disponível para este plano mestre
    const ultimaSprintMestre = await SprintMestre.findOne({
      where: { PlanoMestreId: planoId },
      order: [['posicao', 'DESC']]
    });
    
    const proximaPosicao = ultimaSprintMestre ? ultimaSprintMestre.posicao + 1 : 1;

    // Criar a sprint mestre
    const sprintMestre = await SprintMestre.create({
      nome,
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      PlanoMestreId: planoId,
      posicao: proximaPosicao
    });

    // Criar as metas mestre associadas à sprint mestre
    if (metas && metas.length > 0) {
      const metasMestresCriadas = await Promise.all(
        metas.map(async (meta, index) => {
          // Se a posição não foi fornecida ou é 0, usar o índice + 1
          const posicao = meta.posicao && meta.posicao > 0 ? meta.posicao : index + 1;

          return MetaMestre.create({
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
            SprintMestreId: sprintMestre.id,
            posicao: posicao
          });
          })
      );
      
      // Adicionar as metas ao objeto de resposta para compatibilidade
      sprintMestre.metas = await Promise.all(metasMestresCriadas.map(async metaMestre => {
        const metaFormatada = {
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
        };
        return metaFormatada;
      }));
    }

    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: planoId, // Para compatibilidade com frontend
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio, // Agora aceita datas diretamente
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metas || [],
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    };

    res.status(201).json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao criar sprint mestre:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Busca todas as sprints mestre com suas metas mestre
 * Esta função é específica para templates e é usada apenas na interface do administrador
 */
exports.getAllSprints = async (req, res) => {
  try {
    const sprintsMestre = await SprintMestre.findAll({
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre'
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ],
      order: [
        ['PlanoMestreId', 'ASC'],
        ['posicao', 'ASC']
      ]
    });

    // Transformar para formato esperado pelo frontend
    const sprintsFormatadas = sprintsMestre.map(sprintMestre => ({
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: sprintMestre.PlanoMestreId, // Para compatibilidade
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio,
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre?.map(metaMestre => ({
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
      })) || [],
      Plano: sprintMestre.planoMestre ? {
        id: sprintMestre.planoMestre.id,
        nome: sprintMestre.planoMestre.nome,
        cargo: sprintMestre.planoMestre.cargo,
        duracao: sprintMestre.planoMestre.duracao
      } : null,
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    }));
    
    res.json(sprintsFormatadas);
  } catch (error) {
    console.error('Erro ao buscar sprints mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Busca uma sprint mestre específica com suas metas mestre
 * Esta função é específica para templates e é usada apenas na interface do administrador
 */
exports.getSprintById = async (req, res) => {
  try {
    const sprintMestre = await SprintMestre.findByPk(req.params.id, {
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre',
          order: [['id', 'ASC']]
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });
    
    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }
    
    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintMestre.id,
      nome: sprintMestre.nome,
             PlanoId: sprintMestre.PlanoMestreId,
       posicao: sprintMestre.posicao,
       dataInicio: sprintMestre.dataInicio,
       dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre?.map(metaMestre => ({
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
      })) || [],
      Plano: sprintMestre.planoMestre ? {
        id: sprintMestre.planoMestre.id,
        nome: sprintMestre.planoMestre.nome,
        cargo: sprintMestre.planoMestre.cargo,
        duracao: sprintMestre.planoMestre.duracao
      } : null,
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    };
    
    res.json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao buscar sprint mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Atualiza uma sprint mestre e suas metas mestre
 * Esta função é específica para templates e é usada apenas na interface do administrador
 * 
 * Gerenciamento de Posições:
 * - Ao atualizar metas existentes: mantém a posição original
 * - Ao criar novas metas: 
 *   1. Busca a maior posição atual uma única vez
 *   2. Incrementa a partir dessa posição para cada nova meta
 *   3. Usa um contador (proximaPosicao++) para garantir posições únicas
 * 
 * Exemplo de Atualização:
 * Estado Inicial:
 * - Meta A (id: 1, pos: 1)
 * - Meta B (id: 2, pos: 2)
 * 
 * Requisição:
 * metas = [
 *   { id: 1, titulo: "Meta A" },     // mantém posição 1
 *   { id: 2, titulo: "Meta B" },     // mantém posição 2
 *   { titulo: "Nova Meta C" },       // recebe posição 3
 *   { titulo: "Nova Meta D" }        // recebe posição 4
 * ]
 */
exports.updateSprint = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, planoId, metas } = req.body;
    
    const sprintMestre = await SprintMestre.findByPk(req.params.id);
    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Verificar se o plano mestre existe, se um ID foi fornecido
    if (planoId) {
      const planoMestre = await PlanoMestre.findByPk(planoId);
      if (!planoMestre) {
        return res.status(404).json({ message: 'Plano de estudo não encontrado' });
      }
    }

    // Atualizar dados da sprint mestre
    await sprintMestre.update({
      nome,
      dataInicio: dataInicio !== undefined ? dataInicio : sprintMestre.dataInicio,
      dataFim: dataFim !== undefined ? dataFim : sprintMestre.dataFim,
      PlanoMestreId: planoId || sprintMestre.PlanoMestreId
    });

    // Atualizar metas mestre (simplificado para templates)
    if (metas) {
      // Buscar metas mestre existentes
      const metasMestreExistentes = await MetaMestre.findAll({
        where: { SprintMestreId: sprintMestre.id }
      });

      // Mapear metas existentes por ID para fácil acesso
      const metasExistentesMap = new Map(
        metasMestreExistentes.map(meta => [meta.id, meta])
      );

      // Array para armazenar os IDs das metas que serão mantidas
      const idsMetasManter = [];

      // Processar cada meta da requisição
      for (const meta of metas) {
        if (meta.id && metasExistentesMap.has(meta.id)) {
          // Se a meta mestre já existe, atualizar
          const metaExistente = metasExistentesMap.get(meta.id);
          await metaExistente.update({
            disciplina: meta.disciplina,
            tipo: meta.tipo,
            titulo: meta.titulo,
            comandos: meta.comandos,
            link: meta.link,
            relevancia: meta.relevancia,
            tempoEstudado: meta.tempoEstudado !== undefined ? meta.tempoEstudado : metaExistente.tempoEstudado,
            desempenho: meta.desempenho !== undefined ? meta.desempenho : metaExistente.desempenho,
            status: meta.status !== undefined ? meta.status : metaExistente.status,
            totalQuestoes: meta.totalQuestoes !== undefined ? meta.totalQuestoes : metaExistente.totalQuestoes,
            questoesCorretas: meta.questoesCorretas !== undefined ? meta.questoesCorretas : metaExistente.questoesCorretas,
            // Se a posição não foi fornecida ou é 0, manter a posição atual
            posicao: meta.posicao && meta.posicao > 0 ? meta.posicao : metaExistente.posicao
          });
          idsMetasManter.push(meta.id);
        } else if (!meta.id) {
          // Se é uma nova meta mestre (sem ID), criar
          const novaMetaMestre = await MetaMestre.create({
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
            SprintMestreId: sprintMestre.id,
            // Se a posição não foi fornecida ou é 0, usar a próxima posição disponível
            posicao: meta.posicao && meta.posicao > 0 ? meta.posicao : proximaPosicao++
          });
          idsMetasManter.push(novaMetaMestre.id);
        }
      }

      // Remover apenas as metas que não estão mais presentes na requisição
      if (idsMetasManter.length > 0) {
        await MetaMestre.destroy({
          where: {
            SprintMestreId: sprintMestre.id,
            id: {
              [Op.notIn]: idsMetasManter
            }
          }
        });
      }
    }

    // Buscar sprint mestre atualizada com metas mestre
    const sprintMestreAtualizada = await SprintMestre.findByPk(sprintMestre.id, {
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre'
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });

    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintMestreAtualizada.id,
      nome: sprintMestreAtualizada.nome,
      PlanoId: sprintMestreAtualizada.PlanoMestreId,
      posicao: sprintMestreAtualizada.posicao,
      dataInicio: sprintMestreAtualizada.dataInicio,
      dataFim: sprintMestreAtualizada.dataFim,
      metas: sprintMestreAtualizada.metasMestre?.map(metaMestre => ({
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
        SprintId: sprintMestreAtualizada.id,
        posicao: metaMestre.posicao
      })) || [],
      Plano: sprintMestreAtualizada.planoMestre ? {
        id: sprintMestreAtualizada.planoMestre.id,
        nome: sprintMestreAtualizada.planoMestre.nome,
        cargo: sprintMestreAtualizada.planoMestre.cargo,
        duracao: sprintMestreAtualizada.planoMestre.duracao
      } : null,
      createdAt: sprintMestreAtualizada.createdAt,
      updatedAt: sprintMestreAtualizada.updatedAt
    };

    res.json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao atualizar sprint:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Deleta uma sprint mestre e suas metas mestre
 * Esta função é específica para templates e é usada apenas na interface do administrador
 */
exports.deleteSprint = async (req, res) => {
  try {
    const sprintMestre = await SprintMestre.findByPk(req.params.id);
    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Deletar metas mestre associadas
    await MetaMestre.destroy({
      where: { SprintMestreId: sprintMestre.id }
    });

    // Deletar sprint mestre
    await sprintMestre.destroy();

    res.json({ message: 'Sprint deletada com sucesso' });
  }
  catch (error) {
    console.error('Erro ao deletar sprint mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Reordena as sprints mestre de um plano mestre
 * Esta função é específica para templates e é usada apenas na interface do administrador
 */
exports.reordenarSprints = async (req, res) => {
  const { planoId, ordemSprints } = req.body;
  
  if (!planoId || !ordemSprints || !Array.isArray(ordemSprints) || ordemSprints.length === 0) {
    return res.status(400).json({ message: 'Dados inválidos. planoId e ordemSprints (array) são necessários' });
  }
  
  try {
    const planoMestre = await PlanoMestre.findByPk(planoId);
    if (!planoMestre) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Verificar se todas as sprints mestres pertencem ao plano mestre
    const sprintsMestre = await SprintMestre.findAll({
      where: { PlanoMestreId: planoId }
    });
    
    const sprintMestreIds = sprintsMestre.map(s => s.id);
    
    for (const id of ordemSprints) {
      if (!sprintMestreIds.includes(id)) {
        return res.status(400).json({ 
          message: `Sprint com ID ${id} não pertence ao plano ${planoId}` 
        });
      }
    }
    
    // Verificar se todos os IDs de sprints mestres do plano estão na ordemSprints
    if (new Set([...sprintMestreIds]).size !== new Set([...ordemSprints]).size) {
      return res.status(400).json({ 
        message: 'A lista de sprints fornecida não contém todas as sprints do plano'
      });
    }
    
    // Atualizar posições em uma transação para garantir consistência
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < ordemSprints.length; i++) {
        await SprintMestre.update(
          { posicao: i + 1 },
          { 
            where: { id: ordemSprints[i] },
            transaction: t
          }
        );
      }
    });
    
    // Retornar as sprints mestres reordenadas (formatadas para frontend)
    const sprintsMestreAtualizadas = await SprintMestre.findAll({
      where: { PlanoMestreId: planoId },
      order: [['posicao', 'ASC']],
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre'
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });

    // Transformar para formato esperado pelo frontend
    const sprintsFormatadas = sprintsMestreAtualizadas.map(sprintMestre => ({
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: sprintMestre.PlanoMestreId,
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio,
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre?.map(metaMestre => ({
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
      })) || [],
      Plano: sprintMestre.planoMestre ? {
        id: sprintMestre.planoMestre.id,
        nome: sprintMestre.planoMestre.nome,
        cargo: sprintMestre.planoMestre.cargo,
        duracao: sprintMestre.planoMestre.duracao
      } : null,
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    }));
    
    res.json(sprintsFormatadas);
  } catch (error) {
    console.error('Erro ao reordenar sprints mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Atualiza uma meta mestre (template)
 * Esta função é específica para templates e é usada apenas na interface do administrador
 */
exports.updateMetaMestre = async (req, res) => {
  try {
    const metaMestre = await MetaMestre.findByPk(req.params.id);
    if (!metaMestre) {
      return res.status(404).json({ message: 'Meta mestre não encontrada' });
    }

    const { disciplina, tipo, titulo, comandos, link, relevancia, tempoEstudado, desempenho, status, totalQuestoes, questoesCorretas } = req.body;

    await metaMestre.update({
      disciplina,
      tipo,
      titulo,
      comandos,
      link,
      relevancia,
      tempoEstudado: tempoEstudado !== undefined ? tempoEstudado : metaMestre.tempoEstudado,
      desempenho: desempenho !== undefined ? desempenho : metaMestre.desempenho,
      status: status !== undefined ? status : metaMestre.status,
      totalQuestoes: totalQuestoes !== undefined ? totalQuestoes : metaMestre.totalQuestoes,
      questoesCorretas: questoesCorretas !== undefined ? questoesCorretas : metaMestre.questoesCorretas
    });

    // Transformar para formato esperado pelo frontend
    const metaFormatada = {
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
      SprintId: metaMestre.SprintMestreId,
      createdAt: metaMestre.createdAt,
      updatedAt: metaMestre.updatedAt
    };

    res.json(metaFormatada);
  } catch (error) {
    console.error('Erro ao atualizar meta mestre:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo do aluno (Visualização de Metas)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Atualiza uma meta instanciada e gerencia o status da sprint
 * Esta função é específica para instâncias e é usada apenas na interface do aluno
 * 
 * Fluxo de Gerenciamento de Status:
 * 1. Quando uma meta é marcada como 'Concluída':
 *    - Se for a primeira meta concluída da sprint:
 *      -> Sprint muda de 'Pendente' para 'Em Andamento'
 *    - Se todas as metas forem concluídas:
 *      -> Sprint muda para 'Concluída'
 * 
 * IMPORTANTE:
 * - Esta função trabalha em conjunto com sprintAtualController.atualizarSprintAtual
 *   para garantir consistência no status das sprints
 * - O status 'Em Andamento' só é atribuído quando a primeira meta é concluída
 * - O status 'Concluída' pode ser atribuído aqui ou ao avançar para próxima sprint
 * 
 * @param {Object} req.params.id - ID da meta a ser atualizada
 * @param {Object} req.body - Dados da atualização
 * @param {string} req.body.status - Novo status da meta
 * @param {string} req.body.tempoEstudado - Tempo estudado (opcional)
 * @param {number} req.body.desempenho - Desempenho na meta (opcional)
 * @param {number} req.body.totalQuestoes - Total de questões (opcional)
 * @param {number} req.body.questoesCorretas - Questões corretas (opcional)
 */
exports.updateMetaInstancia = async (req, res) => {
  try {
    const meta = await Meta.findByPk(req.params.id);
    if (!meta) {
      return res.status(404).json({ message: 'Meta instanciada não encontrada' });
    }

    const { tempoEstudado, desempenho, status, totalQuestoes, questoesCorretas } = req.body;

    await meta.update({
      tempoEstudado: tempoEstudado !== undefined ? tempoEstudado : meta.tempoEstudado,
      desempenho: desempenho !== undefined ? desempenho : meta.desempenho,
      status: status !== undefined ? status : meta.status,
      totalQuestoes: totalQuestoes !== undefined ? totalQuestoes : meta.totalQuestoes,
      questoesCorretas: questoesCorretas !== undefined ? questoesCorretas : meta.questoesCorretas
    });

    // Se a meta foi concluída, verificar se todas as metas da sprint foram concluídas
    // ou se é a primeira meta concluída para atualizar o status da sprint
    if (status === 'Concluída') {
      const sprint = await Sprint.findByPk(meta.SprintId, {
        include: [{
          model: Meta,
          as: 'metas'
        }]
      });

      if (sprint) {
        const todasMetasConcluidas = sprint.metas.every(m => m.status === 'Concluída');
        
        if (todasMetasConcluidas) {
          await sprint.update({ status: 'Concluída' });
        } else if (sprint.status === 'Pendente') {
          // Se a sprint está pendente e temos uma meta concluída, mudar para Em Andamento
          await sprint.update({ status: 'Em Andamento' });
        }
      }
    }

    // Transformar para formato esperado pelo frontend
    const metaFormatada = {
      id: meta.id,
      disciplina: meta.disciplina,
      tipo: meta.tipo,
      titulo: meta.titulo,
      comandos: meta.comandos,
      link: meta.link,
      relevancia: meta.relevancia,
      tempoEstudado: meta.tempoEstudado,
      desempenho: meta.desempenho,
      status: meta.status,
      totalQuestoes: meta.totalQuestoes,
      questoesCorretas: meta.questoesCorretas,
      SprintId: meta.SprintId,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt
    };

    res.json(metaFormatada);
  } catch (error) {
    console.error('Erro ao atualizar meta instanciada:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo do aluno (Visualização de Sprints)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Busca sprints instanciadas de um plano
 * Esta função é específica para instâncias e é usada apenas na interface do aluno
 * para visualizar suas sprints e metas
 */
exports.buscarSprintsInstanciadasPorPlano = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Buscando sprints instanciadas do plano ID ${id}`);
    
    // Verificar se o plano existe
    const plano = await Plano.findByPk(id);
    if (!plano) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    
    // Buscar sprints do plano com suas metas
    const sprints = await Sprint.findAll({
      where: { PlanoId: id },
      include: [
        {
          model: Meta,
          as: 'metas',
          attributes: [
            'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link',
            'relevancia', 'tempoEstudado', 'desempenho', 'status',
            'totalQuestoes', 'questoesCorretas', 'posicao'
          ]
        },
        {
          model: Plano,
          attributes: ['id', 'nome', 'cargo', 'descricao']
        }
      ],
      order: [
        ['posicao', 'ASC'],
        ['nome', 'ASC'],
        [{ model: Meta, as: 'metas' }, 'posicao', 'ASC']
      ]
    });
    
    console.log(`${sprints.length} sprints encontradas para o plano ID ${id}`);
    
    res.json(sprints);
  } catch (error) {
    console.error('Erro ao buscar sprints do plano:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar sprints do plano', 
      details: error.message 
    });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Adiciona novas metas a uma sprint mestre existente através da importação de planilha
 * Esta função é específica para templates e é usada apenas na interface do administrador
 * 
 * Características importantes:
 * - Mantém as metas existentes intactas
 * - Adiciona apenas as novas metas importadas
 * - Valida posições para evitar conflitos com metas existentes
 * - Trabalha exclusivamente com MetaMestre (não afeta metas instanciadas)
 * 
 * Fluxo de importação:
 * 1. Valida se as posições das novas metas não conflitam com as existentes
 * 2. Cria apenas as novas metas mantendo as existentes
 * 3. Retorna a sprint atualizada com todas as metas (antigas + novas)
 * 
 * TODO: Este método será expandido futuramente para suportar também a adição
 * manual de metas individuais, além da importação em lote via planilha.
 * Ao implementar, manter a mesma lógica de validação de posições e
 * preservação das metas existentes.
 */
exports.adicionarMetas = async (req, res) => {
  try {
    const { id } = req.params;
    const metas = req.body;

    // Validar se a sprint existe
    const sprintMestre = await SprintMestre.findByPk(id, {
      include: [{
        model: MetaMestre,
        as: 'metasMestre'
      }]
    });

    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Validar se existem posições repetidas na planilha
    const posicoesNasPlanilha = metas.map(meta => meta.posicao);
    const posicoesUnicas = new Set(posicoesNasPlanilha);
    
    if (posicoesNasPlanilha.length !== posicoesUnicas.size) {
      // Encontrar as posições que se repetem
      const posicoesRepetidas = posicoesNasPlanilha.filter(
        (posicao, index) => posicoesNasPlanilha.indexOf(posicao) !== index
      );
      
      return res.status(400).json({ 
        message: `Existem posições repetidas na planilha: ${posicoesRepetidas.join(', ')}. Cada meta deve ter uma posição única.`
      });
    }

    // Obter posições já utilizadas na sprint
    const posicoesExistentes = new Set(sprintMestre.metasMestre.map(meta => meta.posicao));

    // Validar se alguma posição já está em uso na sprint
    for (const meta of metas) {
      if (posicoesExistentes.has(meta.posicao)) {
        return res.status(400).json({ 
          message: `A posição ${meta.posicao} já está em uso nesta sprint. Cada meta deve ter uma posição única.`
        });
      }
    }

    // Criar as novas metas
    const novasMetasMestre = await Promise.all(metas.map(meta => 
      MetaMestre.create({
        disciplina: meta.disciplina,
        tipo: meta.tipo,
        titulo: meta.titulo,
        comandos: meta.comandos || '',
        link: meta.link || '',
        relevancia: meta.relevancia,
        tempoEstudado: '00:00',
        desempenho: 0,
        status: 'Pendente',
        totalQuestoes: 0,
        questoesCorretas: 0,
        SprintMestreId: sprintMestre.id,
        posicao: meta.posicao
      })
    ));

    /**
     * Propagação automática das novas metas para todas as sprints instanciadas
     * TODO: No futuro, este processo poderá ser alterado para um sistema de aceite do aluno
     */
    // Buscar todas as sprints instanciadas desta sprint mestre
    const sprintsInstanciadas = await Sprint.findAll({
      where: { sprint_mestre_id: id }
    });

    // Criar as novas metas em cada sprint instanciada
    for (const sprint of sprintsInstanciadas) {
      await Promise.all(novasMetasMestre.map(metaMestre =>
        Meta.create({
          disciplina: metaMestre.disciplina,
          tipo: metaMestre.tipo,
          titulo: metaMestre.titulo,
          comandos: metaMestre.comandos,
          link: metaMestre.link,
          relevancia: metaMestre.relevancia,
          tempoEstudado: '00:00',
          desempenho: 0,
          status: 'Pendente',
          totalQuestoes: 0,
          questoesCorretas: 0,
          SprintId: sprint.id,
          posicao: metaMestre.posicao,
          meta_mestre_id: metaMestre.id
        })
      ));
    }

    // Buscar a sprint atualizada com todas as metas
    const sprintAtualizada = await SprintMestre.findByPk(id, {
      include: [{
        model: MetaMestre,
        as: 'metasMestre',
        order: [['posicao', 'ASC']]
      }]
    });

    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintAtualizada.id,
      nome: sprintAtualizada.nome,
      PlanoId: sprintAtualizada.PlanoMestreId,
      posicao: sprintAtualizada.posicao,
      dataInicio: sprintAtualizada.dataInicio,
      dataFim: sprintAtualizada.dataFim,
      metas: sprintAtualizada.metasMestre?.map(metaMestre => ({
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
        SprintId: sprintAtualizada.id,
        posicao: metaMestre.posicao
      })) || []
    };

    res.status(201).json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao adicionar metas:', error);
    res.status(400).json({ message: error.message });
  }
}; 