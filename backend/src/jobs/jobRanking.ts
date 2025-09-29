import { QueryTypes } from 'sequelize';
import sequelize from '../db';

/**
 * Job para atualizar ranking semanal
 * Executa 3x ao dia: 08:00, 14:00, 20:00
 */
class JobRanking {
  private isRunning: boolean = false;

  /**
   * Executa a atualização do ranking
   */
  public async executarAtualizacao(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Job de ranking já está em execução, pulando...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔄 Iniciando atualização do ranking semanal...');

      // Chama a função PostgreSQL para atualizar ranking
      await sequelize.query('SELECT public.atualizar_ranking_semanal()', {
        type: QueryTypes.SELECT
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`✅ Ranking atualizado com sucesso em ${duration}s`);

    } catch (erro: any) {
      console.error('❌ Erro ao atualizar ranking:', erro.message);
      console.error('Stack trace:', erro.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Executa limpeza de dados antigos
   */
  public async executarLimpeza(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Job de limpeza já está em execução, pulando...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🧹 Iniciando limpeza de dados antigos do ranking...');

      // Remove registros de ranking com mais de 6 meses
      const resultado = await db.query(`
        DELETE FROM ranking_semanal 
        WHERE semana_inicio < NOW() - INTERVAL '6 months'
      `, {
        type: QueryTypes.DELETE
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`✅ Limpeza concluída em ${duration}s`);
      console.log(`📊 Registros removidos: ${resultado[1] || 0}`);

    } catch (erro: any) {
      console.error('❌ Erro na limpeza:', erro.message);
      console.error('Stack trace:', erro.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Verifica se o job está em execução
   */
  public estaExecutando(): boolean {
    return this.isRunning;
  }

  /**
   * Obtém estatísticas do ranking atual
   */
  public async obterEstatisticas(): Promise<any> {
    try {
      const resultado = await db.query(`
        SELECT 
          COUNT(*) as total_usuarios,
          AVG(pontuacao_final) as media_pontuacao,
          MAX(pontuacao_final) as maior_pontuacao,
          MIN(pontuacao_final) as menor_pontuacao
        FROM ranking_semanal 
        WHERE semana_inicio >= date_trunc('week', CURRENT_DATE)
      `, {
        type: QueryTypes.SELECT
      });

      return resultado[0] || {};
    } catch (erro: any) {
      console.error('❌ Erro ao obter estatísticas:', erro.message);
      return {};
    }
  }
}

const jobRanking = new JobRanking();

// Exportações nomeadas para compatibilidade
export const executarAtualizacao = jobRanking.executarAtualizacao.bind(jobRanking);
export const executarLimpeza = jobRanking.executarLimpeza.bind(jobRanking);
export const estaExecutando = jobRanking.estaExecutando.bind(jobRanking);
export const obterEstatisticas = jobRanking.obterEstatisticas.bind(jobRanking);

// Exportação padrão
export default jobRanking;
