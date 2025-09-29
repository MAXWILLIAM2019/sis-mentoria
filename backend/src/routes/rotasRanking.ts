import * as express from 'express';
import { Response } from 'express';
import { QueryTypes } from 'sequelize';
import db from '../db';
import authMiddleware from '../middleware/autenticacao';
import { RequestRanking } from '../types/requestResponse';

const router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/rankingSchemas.js

/**
 * @swagger
 * /api/ranking/:
 *   get:
 *     summary: Obter ranking global semanal
 *     description: Retorna o ranking semanal de todos os alunos com paginação. O ranking é baseado na pontuação final calculada a partir do desempenho nas questões respondidas durante a semana atual.
 *     tags: [Ranking]
 *     parameters:
 *       - in: query
 *         name: limite
 *         required: false
 *         description: Número de itens por página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *           example: 25
 *       - in: query
 *         name: pagina
 *         required: false
 *         description: Número da página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Ranking carregado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingResponse'
 *             examples:
 *               ranking_completo:
 *                 summary: Ranking com múltiplos alunos
 *                 value:
 *                   success: true
 *                   message: "Ranking carregado com sucesso!"
 *                   data:
 *                     ranking:
 *                       - posicao: 1
 *                         nome_usuario: "Ana Souza"
 *                         total_questoes: 30
 *                         total_acertos: 28
 *                         percentual_acerto: 93.33
 *                         pontuacao_final: 95.50
 *                       - posicao: 2
 *                         nome_usuario: "João Silva"
 *                         total_questoes: 25
 *                         total_acertos: 22
 *                         percentual_acerto: 88.00
 *                         pontuacao_final: 89.20
 *                       - posicao: 3
 *                         nome_usuario: "Maria Santos"
 *                         total_questoes: 20
 *                         total_acertos: 18
 *                         percentual_acerto: 90.00
 *                         pontuacao_final: 87.80
 *                     paginacao:
 *                       pagina: 1
 *                       limite: 50
 *                       total: 3
 *                       totalPaginas: 1
 *                       temProxima: false
 *                       temAnterior: false
 *                     semana:
 *                       inicio: "2024-01-15"
 *                       fim: "2024-01-21"
 *               ranking_vazio:
 *                 summary: Ranking sem alunos
 *                 value:
 *                   success: true
 *                   message: "Ranking carregado com sucesso!"
 *                   data:
 *                     ranking: []
 *                     paginacao:
 *                       pagina: 1
 *                       limite: 50
 *                       total: 0
 *                       totalPaginas: 0
 *                       temProxima: false
 *                       temAnterior: false
 *                     semana:
 *                       inicio: "2024-01-15"
 *                       fim: "2024-01-21"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */

// Controller que consulta a tabela ranking_semanal real
const obterRanking = async (req: RequestRanking, res: Response): Promise<void> => {
  try {
    const { limite = '50', pagina = '1' } = req.query;
    const limiteNum = parseInt(limite);
    const paginaNum = parseInt(pagina);
    const offset = (paginaNum - 1) * limiteNum;

    // Consulta a tabela ranking_semanal real
    const ranking = await db.query(`
      SELECT 
        posicao,
        nome_usuario,
        total_questoes,
        total_acertos,
        percentual_acerto,
        pontuacao_final
      FROM public.ranking_semanal 
      WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
      ORDER BY posicao
      LIMIT :limite OFFSET :offset
    `, {
      replacements: { limite: limiteNum, offset },
      type: QueryTypes.SELECT
    });

    // Conta total de alunos no ranking
    const totalResult = await db.query(`
      SELECT COUNT(*) as total
      FROM public.ranking_semanal 
      WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
    `, {
      type: QueryTypes.SELECT
    });

    const totalAlunos = (totalResult[0] as any)?.total || 0;
    const totalPaginas = Math.ceil(totalAlunos / limiteNum);

    // Calcula início e fim da semana atual
    const semanaInicio = new Date();
    semanaInicio.setDate(semanaInicio.getDate() - semanaInicio.getDay() + 1); // Segunda-feira
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6); // Domingo

    res.json({
      success: true,
      message: 'Ranking carregado com sucesso!',
      data: {
        ranking,
        paginacao: {
          pagina: paginaNum,
          limite: limiteNum,
          total: totalAlunos,
          totalPaginas,
          temProxima: paginaNum < totalPaginas,
          temAnterior: paginaNum > 1
        },
        semana: {
          inicio: semanaInicio.toISOString().split('T')[0],
          fim: semanaFim.toISOString().split('T')[0]
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/ranking/meu-ranking:
 *   get:
 *     summary: Obter posição do usuário logado no ranking
 *     description: Retorna a posição e dados do usuário autenticado no ranking semanal atual. Se o usuário não estiver no ranking desta semana, retorna data como null.
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do ranking do usuário obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeuRankingResponse'
 *             examples:
 *               usuario_no_ranking:
 *                 summary: Usuário está no ranking
 *                 value:
 *                   success: true
 *                   data:
 *                     posicao:
 *                       posicao: 2
 *                       nome_usuario: "João Silva"
 *                       total_questoes: 25
 *                       total_acertos: 22
 *                       percentual_acerto: 88.00
 *                       pontuacao_final: 89.20
 *                     semana:
 *                       inicio: "2024-01-15"
 *                       fim: "2024-01-21"
 *               usuario_sem_ranking:
 *                 summary: Usuário não está no ranking
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Usuário não encontrado no ranking desta semana"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */

const obterMeuRanking = async (req: RequestRanking, res: Response): Promise<void> => {
  try {
    const userId = req.user.id; // ID do usuário logado

    // Consulta a posição do usuário no ranking atual
    const meuRanking = await db.query(`
      SELECT 
        posicao,
        nome_usuario,
        total_questoes,
        total_acertos,
        percentual_acerto,
        pontuacao_final
      FROM public.ranking_semanal 
      WHERE id_usuario = :userId 
        AND semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    if (meuRanking.length === 0) {
      res.json({
        success: true,
        data: null,
        message: 'Usuário não encontrado no ranking desta semana'
      });
      return;
    }

    // Calcula início e fim da semana atual
    const semanaInicio = new Date();
    semanaInicio.setDate(semanaInicio.getDate() - semanaInicio.getDay() + 1); // Segunda-feira
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6); // Domingo

    res.json({
      success: true,
      data: {
        posicao: meuRanking[0],
        semana: {
          inicio: semanaInicio.toISOString().split('T')[0],
          fim: semanaFim.toISOString().split('T')[0]
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter meu ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

router.get('/', obterRanking as any);
router.get('/meu-ranking', authMiddleware.autenticacao, obterMeuRanking as any);

export default router;
