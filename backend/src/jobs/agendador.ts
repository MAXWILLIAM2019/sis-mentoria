import * as cron from 'node-cron';
import * as jobRanking from './jobRanking';

/**
 * Interface para definir o status de um job
 */
interface StatusJob {
  id: number;
  ativo: boolean;
}

/**
 * Interface para o status geral do agendador
 */
interface StatusAgendador {
  isRunning: boolean;
  totalJobs: number;
  jobs: StatusJob[];
}

/**
 * Agendador de jobs para o sistema de ranking
 */
class AgendadorJobs {
  private jobs: cron.ScheduledTask[] = [];
  private isRunning: boolean = false;

  /**
   * Inicia todos os jobs agendados
   */
  public iniciar(): void {
    if (this.isRunning) {
      console.log('⚠️  Scheduler já está em execução');
      return;
    }

    console.log('🚀 Iniciando agendador de jobs...');

    // Job 1: Atualização do ranking a cada 10 segundos (desenvolvimento)
    const rankingJobSchedule = cron.schedule('*/10 * * * * *', async () => {
      await jobRanking.executarAtualizacao();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Job 2: Limpeza semanal (segunda-feira às 02:00)
    const limpezaJob = cron.schedule('0 2 * * 1', async () => {
      await jobRanking.executarLimpeza();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Armazena referências dos jobs
    this.jobs = [rankingJobSchedule, limpezaJob];

    // Inicia todos os jobs
    this.jobs.forEach(job => job.start());

    this.isRunning = true;

    console.log('✅ Agendador iniciado com sucesso!');
    console.log('📅 Jobs agendados:');
    console.log('   • Ranking: a cada 10 segundos (desenvolvimento)');
    console.log('   • Limpeza: 02:00 (segundas-feiras)');
  }

  /**
   * Para todos os jobs
   */
  public parar(): void {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler não está em execução');
      return;
    }

    console.log('🛑 Parando agendador de jobs...');

    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isRunning = false;

    console.log('✅ Agendador parado com sucesso!');
  }

  /**
   * Executa job de ranking manualmente (para testes)
   */
  public async executarRankingManual(): Promise<void> {
    console.log('🔧 Executando job de ranking manualmente...');
    await jobRanking.executarAtualizacao();
  }

  /**
   * Executa limpeza manualmente (para testes)
   */
  public async executarLimpezaManual(): Promise<void> {
    console.log('🔧 Executando limpeza manualmente...');
    await jobRanking.executarLimpeza();
  }

  /**
   * Obtém status dos jobs
   */
  public obterStatus(): StatusAgendador {
    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.length,
      jobs: this.jobs.map((job, index) => ({
        id: index,
        ativo: true // Jobs ativos enquanto estão na lista
      }))
    };
  }
}

export default new AgendadorJobs();
