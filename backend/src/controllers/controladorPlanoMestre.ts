import { Request, Response } from 'express';
import { PlanoMestre, SprintMestre, MetaMestre, Plano, Sprint, Meta, AlunoPlano } from '../models';
import sequelize from '../db';
import { RequestPlanoMestre } from '../types/requestResponse';
import { StatusSprint } from '../types/interfaces';

/**
 * Controller para gerenciamento de Planos Mestre (Templates)
 * 
 * ATENÇÃO: FUNCIONALIDADE TESTADA E FUNCIONAL - NÃO ALTERAR SEM CONSULTA!
 * 
 * Este módulo implementa o conceito de templates (PlanoMestre) e instâncias (Plano).
 * Os templates são mantidos pelos administradores e usados para gerar planos
 * personalizados para cada aluno.
 * 
 * Hierarquia de Templates:
 * - PlanoMestre (template principal)
 *   └─ SprintMestre (templates de sprints)
 *      └─ MetaMestre (templates de metas)
 * 
 * Ao criar uma instância, toda essa estrutura é copiada e personalizada
 * para o aluno, mantendo referência ao template original.
 */

/**
 * Lista todos os planos mestre ativos
 * 
 * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
 * 
 * Retorna apenas planos mestre ativos com sua estrutura completa:
 * - Dados do plano mestre
 * - Sprints mestre associadas
 * - Metas mestre de cada sprint
 * 
 * IMPORTANTE: Mantenha a ordenação das sprints por posição
 */
export const listarPlanosMestre = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Buscando planos mestre...');
    
    const planosMestre = await PlanoMestre.findAll({
      where: { ativo: true },
      include: [{
        model: SprintMestre,
        as: 'sprintsMestre',
        include: [{
          model: MetaMestre,
          as: 'metasMestre'
        }],
        order: [['posicao', 'ASC']]
      }],
      order: [['nome', 'ASC']]
    });
    
    console.log(`${planosMestre.length} planos mestre encontrados`);
    res.json(planosMestre);
  } catch (error: any) {
    console.error('Erro ao listar planos mestre:', error);
    res.status(500).json({ 
      message: 'Erro ao listar planos mestre',
      error: error.message 
    });
  }
};

/**
 * Busca um plano mestre específico por ID
 */
export const buscarPlanoMestrePorId = async (req: RequestPlanoMestre, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Buscando plano mestre ID: ${id}`);
    
    const planoMestre = await PlanoMestre.findByPk(id, {
      include: [{
        model: SprintMestre,
        as: 'sprintsMestre',
        include: [{
          model: MetaMestre,
          as: 'metasMestre'
        }],
        order: [['posicao', 'ASC']]
      }]
    });
    
    if (!planoMestre) {
      res.status(404).json({ message: 'Plano mestre não encontrado' });
      return;
    }
    
    console.log(`Plano mestre encontrado: ${planoMestre.nome}`);
    res.json(planoMestre);
  } catch (error: any) {
    console.error('Erro ao buscar plano mestre:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar plano mestre',
      error: error.message 
    });
  }
};

/**
 * Cria um novo plano mestre
 */
export const criarPlanoMestre = async (req: RequestPlanoMestre, res: Response): Promise<void> => {
  try {
    const { nome, cargo, descricao, duracao, versao } = req.body;
    
    console.log('Criando novo plano mestre:', nome);
    
    const novoPlanoMestre = await PlanoMestre.create({
      nome,
      cargo,
      descricao,
      duracao,
      versao: versao || '1.0',
      ativo: true
    });
    
    console.log(`Plano mestre criado com ID: ${novoPlanoMestre.id}`);
    res.status(201).json(novoPlanoMestre);
  } catch (error: any) {
    console.error('Erro ao criar plano mestre:', error);
    res.status(500).json({ 
      message: 'Erro ao criar plano mestre',
      error: error.message 
    });
  }
};

/**
 * Cria uma instância personalizada de um plano mestre para um aluno
 * 
 * ATENÇÃO: MÉTODO CRÍTICO - TESTADO E FUNCIONAL - NÃO ALTERAR SEM CONSULTA!
 * 
 * Este é um dos métodos mais importantes do sistema, responsável por:
 * 1. Criar uma cópia personalizada de um plano mestre
 * 2. Copiar toda a estrutura de sprints e metas
 * 3. Associar o plano ao aluno
 * 
 * Fluxo detalhado:
 * 1. Validação inicial:
 *    - Verifica dados obrigatórios (planoMestreId, idUsuario)
 *    - Busca o plano mestre com sua estrutura completa
 * 
 * 2. Criação do Plano:
 *    - Copia dados básicos do plano mestre
 *    - Mantém referência ao template via plano_mestre_id
 * 
 * 3. Criação das Sprints:
 *    - Para cada sprint do template:
 *      - Copia dados da sprint
 *      - Calcula datas com base na duração
 *      - Mantém referência via sprint_mestre_id
 * 
 * 4. Criação das Metas:
 *    - Para cada meta do template:
 *      - Copia dados da meta
 *      - Associa à sprint correta
 *      - Mantém referência via meta_mestre_id
 * 
 * 5. Associação com Aluno:
 *    - Cria registro em AlunoPlano
 *    - Define ativo = true
 *    - Configura datas e status inicial
 * 
 * IMPORTANTE:
 * - Todo o processo é executado em uma transação
 * - Se qualquer etapa falhar, todas as alterações são revertidas
 * - Mantém rastreabilidade completa ao template original
 * - Define ativo = true na associação com o aluno
 * 
 * @param {Object} req.body
 * @param {number} req.body.planoMestreId - ID do template a ser instanciado
 * @param {number} req.body.idUsuario - ID do aluno que receberá o plano
 * @param {Date} [req.body.dataInicio] - Data de início (opcional)
 * @param {string} [req.body.status] - Status inicial (opcional)
 * @param {string} [req.body.observacoes] - Observações iniciais (opcional)
 */
export const criarInstancia = async (req: RequestPlanoMestre, res: Response): Promise<void> => {
  try {
    const { planoMestreId, idUsuario, dataInicio, status, observacoes } = req.body;

    console.log('Criando instância do plano mestre:', { planoMestreId, idUsuario });

    // Validar dados obrigatórios
    if (!planoMestreId || !idUsuario) {
      res.status(400).json({
        message: 'planoMestreId e idUsuario são obrigatórios'
      });
      return;
    }

    // Buscar o plano mestre com suas sprints e metas
    const planoMestre = await PlanoMestre.findByPk(planoMestreId, {
      include: [{
        model: SprintMestre,
        as: 'sprintsMestre',
        include: [{
          model: MetaMestre,
          as: 'metasMestre'
        }],
        order: [['posicao', 'ASC']]
      }]
    });

    if (!planoMestre) {
      res.status(404).json({
        message: 'Plano mestre não encontrado'
      });
      return;
    }

    console.log(`Plano mestre encontrado: ${planoMestre.nome}`);

    // Criar uma transação para garantir consistência
    const transaction = await sequelize.transaction();

    try {
      // 1. Criar o plano personalizado baseado no mestre
      const novoPlano = await Plano.create({
        nome: planoMestre.nome,
        cargo: planoMestre.cargo,
        descricao: planoMestre.descricao || `Plano personalizado baseado em: ${planoMestre.nome}`,
        duracao: planoMestre.duracao,
        plano_mestre_id: planoMestreId
      }, { transaction });

      console.log(`Plano criado com ID: ${novoPlano.id}`);

      // 2. Criar as sprints baseadas nas sprints mestre
      let dataInicioAtual = new Date(dataInicio || new Date());
      
      for (const sprintMestre of (planoMestre as any).sprintsMestre) {
        console.log(`Criando sprint: ${sprintMestre.nome}`);
        
        // Calcular data de fim baseada na duração em dias
        const dataFimAtual = new Date(dataInicioAtual);
        // Calcular duração baseada nas datas da sprint mestre ou usar 7 dias como padrão
        const duracaoDias = sprintMestre.dataInicio && sprintMestre.dataFim 
          ? Math.ceil((new Date(sprintMestre.dataFim as string).getTime() - new Date(sprintMestre.dataInicio as string).getTime()) / (1000 * 60 * 60 * 24))
          : 7;
        dataFimAtual.setDate(dataFimAtual.getDate() + duracaoDias);
        
        const novaSprint = await Sprint.create({
          nome: sprintMestre.nome,
          dataInicio: dataInicioAtual,
          dataFim: dataFimAtual,
          posicao: sprintMestre.posicao,
          PlanoId: novoPlano.id,
          sprint_mestre_id: sprintMestre.id,
          status: StatusSprint.EM_ANDAMENTO
        }, { transaction });
        
        // Próxima sprint começa no dia seguinte ao fim da atual
        dataInicioAtual = new Date(dataFimAtual);
        dataInicioAtual.setDate(dataInicioAtual.getDate() + 1);

        // 3. Criar as metas baseadas nas metas mestre
        for (const metaMestre of sprintMestre.metasMestre) {
          console.log(`Criando meta: ${metaMestre.titulo}`);
          
          // Validar o tipo da meta - converter para os valores aceitos pelo ENUM
          let tipoMeta = metaMestre.tipo;
          const tiposValidos = ['teoria', 'questoes', 'revisao', 'reforco'];
          if (!tiposValidos.includes(tipoMeta)) {
            tipoMeta = 'teoria'; // Valor padrão se o tipo não for válido
          }

          // Usar a mesma posição da meta mestre
          await Meta.create({
            disciplina: metaMestre.disciplina,
            tipo: tipoMeta,
            titulo: metaMestre.titulo,
            comandos: metaMestre.comandos,
            link: metaMestre.link,
            relevancia: metaMestre.relevancia,
            SprintId: novaSprint.id,
            meta_mestre_id: metaMestre.id,
            posicao: metaMestre.posicao
          }, { transaction });
        }
      }

      // 4. Associar o plano ao aluno
      await AlunoPlano.create({
        IdUsuario: idUsuario,
        PlanoId: novoPlano.id,
        dataInicio: dataInicio || new Date(),
        status: status || 'não iniciado',
        observacoes: observacoes || '',
        ativo: true
      }, { transaction });

      // Confirmar a transação
      await transaction.commit();

      console.log('Instância criada com sucesso');
      
      res.status(201).json({
        message: 'Plano personalizado criado com sucesso',
        plano: {
          id: novoPlano.id,
          nome: novoPlano.nome,
          cargo: novoPlano.cargo,
          template_origem_id: planoMestreId
        }
      });

    } catch (error) {
      // Reverter a transação em caso de erro
      await transaction.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Erro ao criar instância do plano mestre:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};
