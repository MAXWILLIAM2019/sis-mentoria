/**
 * Página de Checkout - Sistema de Pagamentos Asaas
 * 
 * TIPOS DE PLANOS DISPONÍVEIS:
 * 1. ASSINATURA MENSAL RECORRENTE - Cobrança automática todo mês
 * 2. PACOTE 3 MESES - Pagamento único para 3 meses de acesso
 * 3. PACOTE 6 MESES - Pagamento único para 6 meses de acesso
 * 
 * FORMAS DE PAGAMENTO SUPORTADAS:
 * - Cartão de Crédito
 * - Boleto Bancário
 * - PIX
 * 
 * INTEGRAÇÃO: Backend já implementado com Asaas API
 * AMBIENTE: Sandbox (desenvolvimento) / Produção (configurável)
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import styles from './Checkout.module.css';

/**
 * CONFIGURAÇÃO DOS TIPOS DE PLANOS
 * 
 * VALORES ATUALIZADOS:
 * - ASSINATURA_MENSAL: R$ 297,00/mês (sem parcelamento)
 * - PACOTE_3_MESES: R$ 282,15/mês (5% desconto) = R$ 846,45 total
 * - PACOTE_6_MESES: R$ 267,30/mês (10% desconto) = R$ 1.603,80 total
 * 
 * Estrutura padronizada para os planos oferecidos:
 * - tipo: Identificador único do tipo de plano
 * - nome: Nome exibido para o usuário
 * - descricao: Descrição detalhada do plano
 * - valor: Valor base mensal (R$)
 * - duracao: Duração em meses
 * - recorrente: Se é cobrança recorrente ou única
 * - destaque: Se deve ser destacado na interface
 */
const TIPOS_PLANOS = {
  ASSINATURA_MENSAL: {
    tipo: 'ASSINATURA_MENSAL',
    nome: 'Assinatura Mensal',
    descricao: 'Cobrança automática todo mês. Cancele quando quiser.',
    valor: 297.00,
    duracao: 1,
    recorrente: true,
    destaque: false,
    icone: '🔄'
  },
  PACOTE_3_MESES: {
    tipo: 'PACOTE_3_MESES', 
    nome: 'Pacote 3 Meses',
    descricao: 'Pagamento único para 3 meses de acesso completo.',
    valor: 282.15, // Valor mensal com 5% desconto (297 * 0.95)
    duracao: 3,
    recorrente: false,
    destaque: false,
    icone: '📦'
  },
  PACOTE_6_MESES: {
    tipo: 'PACOTE_6_MESES',
    nome: 'Pacote 6 Meses', 
    descricao: 'Pagamento único para 6 meses. Melhor custo-benefício!',
    valor: 267.30, // Valor mensal com 10% desconto (297 * 0.90)
    duracao: 6,
    recorrente: false,
    destaque: true, // Plano recomendado
    icone: '⭐'
  }
};

/**
 * FORMAS DE PAGAMENTO SUPORTADAS
 * Mapeamento para integração com Asaas API
 */
const FORMAS_PAGAMENTO = {
  CARTAO_CREDITO: {
    id: 'CARTAO_CREDITO',
    nome: 'Cartão de Crédito',
    descricao: 'Aprovação imediata',
    icone: '💳'
  },
  PIX: {
    id: 'PIX',
    nome: 'PIX',
    descricao: 'Pagamento instantâneo',
    icone: '📱'
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados do formulário
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: '',
    email: '',
    confirmarEmail: '',
    cpf: '',
    telefone: '',
    cep: ''
  });
  
  // Estados para dados do cartão
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });
  
  // Estados para validação de email
  const [emailErrors, setEmailErrors] = useState({
    email: '',
    confirmarEmail: ''
  });
  
  // Estados para validação de CPF e telefone
  const [fieldErrors, setFieldErrors] = useState({
    cpf: '',
    telefone: ''
  });
  
  // Estados para validação do cartão
  const [cartaoErrors, setCartaoErrors] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });
  
  // Estado para controlar etapas do checkout
  const [etapaAtual, setEtapaAtual] = useState('selecao_plano'); // selecao_plano, dados_usuario, pagamento, confirmacao

  useEffect(() => {
    // Carrega dados do usuário se estiver logado (opcional)
    if (authService.isAuthenticated()) {
      carregarDadosUsuario();
    }
    
    // Verifica se há um plano pré-selecionado na URL
    const planoUrl = searchParams.get('plano');
    if (planoUrl && TIPOS_PLANOS[planoUrl]) {
      setPlanoSelecionado(TIPOS_PLANOS[planoUrl]);
      setEtapaAtual('dados_usuario');
    }
  }, [navigate, searchParams]);

  /**
   * Carrega dados do usuário logado (se disponível)
   */
  const carregarDadosUsuario = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.aluno) {
        setDadosUsuario({
          nome: response.data.aluno.nome || '',
          email: response.data.aluno.email || '',
          confirmarEmail: response.data.aluno.email || '',
          cpf: response.data.aluno.cpf || '',
          telefone: response.data.aluno.telefone || '',
          cep: response.data.aluno.cep || ''
        });
      }
    } catch (error) {
      // Usuário não logado - isso é normal para checkout público
      console.log('Usuário não autenticado - checkout público');
    }
  };

  /**
   * Calcula o valor total do plano selecionado
   */
  const calcularValorTotal = (plano) => {
    return plano.valor * plano.duracao;
  };

  /**
   * Calcula o desconto em relação ao plano mensal
   */
  const calcularDesconto = (plano) => {
    if (plano.tipo === 'ASSINATURA_MENSAL') return 0;
    const valorMensal = TIPOS_PLANOS.ASSINATURA_MENSAL.valor;
    const descontoMensal = valorMensal - plano.valor;
    return (descontoMensal / valorMensal) * 100;
  };

  /**
   * Manipula a seleção de plano
   */
  const handleSelecionarPlano = (plano) => {
    setPlanoSelecionado(plano);
    setEtapaAtual('dados_usuario');
  };

  // Função para validar formato de email
  const validarFormatoEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para formatar número do cartão
  const formatarNumeroCartao = (numero) => {
    const apenasNumeros = numero.replace(/\D/g, '');
    return apenasNumeros.replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
  };

  // Função para formatar validade do cartão (MM/AA)
  const formatarValidade = (validade) => {
    const apenasNumeros = validade.replace(/\D/g, '');
    if (apenasNumeros.length >= 2) {
      return apenasNumeros.substring(0, 2) + '/' + apenasNumeros.substring(2, 4);
    }
    return apenasNumeros;
  };

  // Função para validar número do cartão (Luhn algorithm simplificado)
  const validarNumeroCartao = (numero) => {
    const apenasNumeros = numero.replace(/\D/g, '');
    return apenasNumeros.length >= 13 && apenasNumeros.length <= 19;
  };

  // Função para validar validade do cartão
  const validarValidade = (validade) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(validade)) return false;
    
    const [mes, ano] = validade.split('/');
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear() % 100;
    const mesAtual = dataAtual.getMonth() + 1;
    
    const anoCartao = parseInt(ano);
    const mesCartao = parseInt(mes);
    
    if (anoCartao < anoAtual) return false;
    if (anoCartao === anoAtual && mesCartao < mesAtual) return false;
    
    return true;
  };

  // Função para validar CVV
  const validarCVV = (cvv) => {
    return cvv.length >= 3 && cvv.length <= 4;
  };

  // Função para formatar CPF
  const formatarCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para validar CPF
  const validarCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Função para validar telefone
  const validarTelefone = (telefone) => {
    const numbers = telefone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  // Função para formatar CEP
  const formatarCEP = (cep) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para validar CEP
  const validarCEP = (cep) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
  };

  // Função para validar email em tempo real
  const validarEmail = (campo, valor) => {
    let erro = '';
    
    if (valor.trim() === '') {
      erro = '';
    } else if (!validarFormatoEmail(valor)) {
      erro = 'Email inválido';
    }
    
    setEmailErrors(prev => ({
      ...prev,
      [campo]: erro
    }));
  };

  // Função para validar confirmação de email
  const validarConfirmacaoEmail = (confirmarEmail) => {
    let erro = '';
    
    if (confirmarEmail.trim() === '') {
      erro = '';
    } else if (!validarFormatoEmail(confirmarEmail)) {
      erro = 'Email inválido';
    } else if (confirmarEmail !== dadosUsuario.email) {
      erro = 'Emails não coincidem';
    }
    
    setEmailErrors(prev => ({
      ...prev,
      confirmarEmail: erro
    }));
  };

  /**
   * Manipula mudanças nos dados do usuário
   */
  const handleDadosChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formatação automática
    if (name === 'cpf') {
      formattedValue = formatarCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatarTelefone(value);
    } else if (name === 'cep') {
      formattedValue = formatarCEP(value);
    }
    
    setDadosUsuario(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Remove erro quando o usuário começa a digitar
    if (name === 'email' || name === 'confirmarEmail') {
      setEmailErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    } else if (name === 'cpf' || name === 'telefone' || name === 'cep') {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Manipula quando o usuário sai dos campos
   */
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      let erro = '';
      if (value.trim() === '') {
        erro = '';
      } else if (!validarCPF(value)) {
        erro = 'CPF inválido';
      }
      
      setFieldErrors(prev => ({
        ...prev,
        cpf: erro
      }));
    } else if (name === 'telefone') {
      let erro = '';
      if (value.trim() === '') {
        erro = '';
      } else if (!validarTelefone(value)) {
        erro = 'Telefone inválido';
      }
      
      setFieldErrors(prev => ({
        ...prev,
        telefone: erro
      }));
    } else if (name === 'cep') {
      let erro = '';
      if (value.trim() === '') {
        erro = '';
      } else if (!validarCEP(value)) {
        erro = 'CEP inválido';
      }
      
      setFieldErrors(prev => ({
        ...prev,
        cep: erro
      }));
    }
  };

  /**
   * Manipula mudanças nos dados do cartão
   */
  const handleCartaoChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;
    
    // Formatação específica para cada campo
    if (name === 'numero') {
      valorFormatado = formatarNumeroCartao(value);
    } else if (name === 'validade') {
      valorFormatado = formatarValidade(value);
    } else if (name === 'cvv') {
      valorFormatado = value.replace(/\D/g, '').substring(0, 4);
    } else if (name === 'nome') {
      valorFormatado = value.toUpperCase();
    }
    
    setDadosCartao(prev => ({
      ...prev,
      [name]: valorFormatado
    }));
    
    // Limpa erros quando o usuário começa a digitar
    if (cartaoErrors[name]) {
      setCartaoErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Valida campos do cartão no blur
   */
  const handleCartaoBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero') {
      if (value.trim() && !validarNumeroCartao(value)) {
        setCartaoErrors(prev => ({
          ...prev,
          numero: 'Número do cartão inválido'
        }));
      } else {
        setCartaoErrors(prev => ({
          ...prev,
          numero: ''
        }));
      }
    }
    
    if (name === 'validade') {
      if (value.trim() && !validarValidade(value)) {
        setCartaoErrors(prev => ({
          ...prev,
          validade: 'Data de validade inválida'
        }));
      } else {
        setCartaoErrors(prev => ({
          ...prev,
          validade: ''
        }));
      }
    }
    
    if (name === 'cvv') {
      if (value.trim() && !validarCVV(value)) {
        setCartaoErrors(prev => ({
          ...prev,
          cvv: 'CVV deve ter 3 ou 4 dígitos'
        }));
      } else {
        setCartaoErrors(prev => ({
          ...prev,
          cvv: ''
        }));
      }
    }
    
    if (name === 'nome') {
      if (value.trim() && value.trim().length < 2) {
        setCartaoErrors(prev => ({
          ...prev,
          nome: 'Nome deve ter pelo menos 2 caracteres'
        }));
      } else {
        setCartaoErrors(prev => ({
          ...prev,
          nome: ''
        }));
      }
    }
  };

  /**
   * Valida os dados do usuário
   */
  const validarDadosUsuario = () => {
    const { nome, email, confirmarEmail, cpf, telefone, cep } = dadosUsuario;
    
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Email válido é obrigatório');
      return false;
    }
    
    if (!confirmarEmail.trim() || confirmarEmail !== email) {
      setError('Email de confirmação deve ser igual ao email');
      return false;
    }
    
    if (!cpf.trim() || !validarCPF(cpf)) {
      setError('CPF válido é obrigatório');
      return false;
    }
    
    if (!telefone.trim() || !validarTelefone(telefone)) {
      setError('Telefone válido é obrigatório');
      return false;
    }
    
    if (!cep.trim() || !validarCEP(cep)) {
      setError('CEP válido é obrigatório');
      return false;
    }
    
    return true;
  };

  /**
   * Valida os dados do cartão (se cartão foi selecionado)
   */
  const validarDadosCartao = () => {
    if (formaPagamento !== 'CARTAO_CREDITO') {
      return true; // Não precisa validar se não é cartão
    }
    
    const { numero, nome, validade, cvv } = dadosCartao;
    
    if (!numero.trim() || !validarNumeroCartao(numero)) {
      setError('Número do cartão é obrigatório e deve ser válido');
      return false;
    }
    
    if (!nome.trim() || nome.trim().length < 2) {
      setError('Nome no cartão é obrigatório');
      return false;
    }
    
    if (!validade.trim() || !validarValidade(validade)) {
      setError('Data de validade é obrigatória e deve ser válida');
      return false;
    }
    
    if (!cvv.trim() || !validarCVV(cvv)) {
      setError('CVV é obrigatório e deve ter 3 ou 4 dígitos');
      return false;
    }
    
    return true;
  };

  /**
   * Processa o pagamento via API Asaas
   * FLUXO: 1. Pré-cadastro → 2. Pagamento → 3. Confirmação
   */
  const processarPagamento = async () => {
    if (!validarDadosUsuario()) return;
    if (!validarDadosCartao()) return;
    if (!formaPagamento) {
      setError('Selecione uma forma de pagamento');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('=== INICIANDO PROCESSO DE PAGAMENTO ===');
      
      // ETAPA 1: PRÉ-CADASTRO DO ALUNO (transparente)
      console.log('Etapa 1: Realizando pré-cadastro do aluno...');
      
      const dadosPreCadastro = {
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        emailConfirmacao: dadosUsuario.confirmarEmail, // Campo obrigatório no backend
        cpf: dadosUsuario.cpf.replace(/\D/g, ''), // Remove formatação
        telefone: dadosUsuario.telefone.replace(/\D/g, ''), // Remove formatação
        cep: dadosUsuario.cep.replace(/\D/g, '') // Remove formatação
      };

      const preCadastroResponse = await api.post('/alunos/pre-cadastro', dadosPreCadastro);
      
      if (!preCadastroResponse.data.usuario) {
        throw new Error(preCadastroResponse.data.error || 'Erro no pré-cadastro');
      }

      console.log('Pré-cadastro realizado com sucesso:', preCadastroResponse.data.usuario.id);
      const alunoId = preCadastroResponse.data.usuario.id;

      // ETAPA 2: PROCESSAR PAGAMENTO
      console.log('Etapa 2: Processando pagamento...');
      
      // Prepara dados para envio (agora com ID do aluno)
      const dadosPagamento = {
        usuario: {
          ...dadosUsuario,
          idusuario: alunoId, // ID do aluno pré-cadastrado
          cpf: dadosUsuario.cpf.replace(/\D/g, ''), // Remove formatação
          telefone: dadosUsuario.telefone.replace(/\D/g, ''), // Remove formatação
          cep: dadosUsuario.cep.replace(/\D/g, '') // Remove formatação
        },
        plano: {
          id: alunoId, // Usar o ID do aluno como referência
          nome: planoSelecionado.nome,
          valor: planoSelecionado.valor,
          // Inclui dados do cartão dentro do plano se cartão foi selecionado
          ...(formaPagamento === 'CARTAO_CREDITO' && {
            cartao: {
              numero: dadosCartao.numero.replace(/\D/g, ''), // Remove formatação
              nome: dadosCartao.nome,
              validade: dadosCartao.validade,
              cvv: dadosCartao.cvv
            }
          })
        },
        tipoPagamento: planoSelecionado.recorrente ? 'ASSINATURA' : 'PACOTE',
        formaPagamento: formaPagamento,
        duracaoMeses: planoSelecionado.duracao
      };

      let pagamentoResponse;
      
      if (planoSelecionado.recorrente) {
        // Cria assinatura mensal recorrente
        pagamentoResponse = await api.post('/asaas/criar-assinatura', dadosPagamento);
      } else {
        // Cria pagamento único para pacote
        pagamentoResponse = await api.post('/asaas/criar-pagamento-pacote', {
          ...dadosPagamento,
          numeroParcelas: 1 // Pagamento único
        });
      }

      // ETAPA 3: VERIFICAR SUCESSO E FINALIZAR
      if (pagamentoResponse.data.success) {
        console.log('Pagamento processado com sucesso!');
        setSuccess('Pagamento processado com sucesso!');
        setEtapaAtual('confirmacao');
        // Não redireciona automaticamente - usuário fica na página de confirmação
      } else {
        setError(pagamentoResponse.data.message || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro no processo de pagamento:', error);
      
      // Mensagens específicas para diferentes tipos de erro
      if (error.response?.data?.error) {
        // Erros específicos do pré-cadastro
        if (error.response.data.error.includes('Email já cadastrado')) {
          setError('Este email já está cadastrado. Faça login para continuar.');
        } else if (error.response.data.error.includes('CPF já cadastrado')) {
          setError('Este CPF já está cadastrado. Faça login para continuar.');
        } else {
          setError(error.response.data.error);
        }
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao processar pagamento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza a seleção de planos
   */
  const renderSelecaoPlano = () => (
    <div className={styles.selecaoPlano}>
      <h2>Escolha seu Plano</h2>
      <p className={styles.subtitulo}>Selecione o plano que melhor se adapta às suas necessidades</p>
      
      <div className={styles.planosGrid}>
        {Object.values(TIPOS_PLANOS).map((plano) => (
          <div 
            key={plano.tipo}
            className={`${styles.planoCard} ${plano.destaque ? styles.destaque : ''}`}
            onClick={() => handleSelecionarPlano(plano)}
          >
            {plano.destaque && <div className={styles.tagDestaque}>Recomendado</div>}
            
            <div className={styles.planoIcone}>{plano.icone}</div>
            <h3>{plano.nome}</h3>
            <p className={styles.planoDescricao}>{plano.descricao}</p>
            
            <div className={styles.precoContainer}>
              <div className={styles.precoMensal}>
                R$ {plano.valor.toFixed(2).replace('.', ',')}
                <span>/mês</span>
              </div>
              
              {plano.duracao > 1 && (
                <div className={styles.precoTotal}>
                  Total: R$ {calcularValorTotal(plano).toFixed(2).replace('.', ',')}
                </div>
              )}
              
              {calcularDesconto(plano) > 0 && (
                <div className={styles.desconto}>
                  {calcularDesconto(plano).toFixed(0)}% de desconto
                </div>
              )}
            </div>
            
            <button className={styles.btnSelecionar}>
              Selecionar Plano
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  /**
   * Renderiza o formulário de dados do usuário
   */
  const renderDadosUsuario = () => (
    <div className={styles.dadosUsuario}>
      <h2>Confirme seus Dados</h2>
      <div className={styles.planoSelecionadoInfo}>
        <span>Plano selecionado: <strong>{planoSelecionado.nome}</strong></span>
        <span>Valor: <strong>R$ {calcularValorTotal(planoSelecionado).toFixed(2).replace('.', ',')}</strong></span>
      </div>
      
      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label>Nome Completo</label>
          <input
            type="text"
            name="nome"
            value={dadosUsuario.nome}
            onChange={handleDadosChange}
            placeholder="Seu nome completo"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={dadosUsuario.email}
            onChange={handleDadosChange}
            onBlur={() => validarEmail('email', dadosUsuario.email)}
            placeholder="seu@email.com"
            required
            className={emailErrors.email ? styles.error : ''}
          />
          {emailErrors.email && <span className={styles.fieldError}>{emailErrors.email}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label>Confirmar Email</label>
          <input
            type="email"
            name="confirmarEmail"
            value={dadosUsuario.confirmarEmail}
            onChange={handleDadosChange}
            onBlur={() => validarConfirmacaoEmail(dadosUsuario.confirmarEmail)}
            placeholder="seu@email.com"
            required
            className={emailErrors.confirmarEmail ? styles.error : ''}
          />
          {emailErrors.confirmarEmail && <span className={styles.fieldError}>{emailErrors.confirmarEmail}</span>}
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>CPF</label>
            <input
              type="text"
              name="cpf"
              value={dadosUsuario.cpf}
              onChange={handleDadosChange}
              onBlur={handleFieldBlur}
              placeholder="000.000.000-00"
              maxLength="14"
              required
              className={fieldErrors.cpf ? styles.error : ''}
            />
            {fieldErrors.cpf && <span className={styles.fieldError}>{fieldErrors.cpf}</span>}
          </div>
          
          <div className={styles.formGroup}>
            <label>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={dadosUsuario.telefone}
              onChange={handleDadosChange}
              onBlur={handleFieldBlur}
              placeholder="(11) 99999-9999"
              maxLength="15"
              required
              className={fieldErrors.telefone ? styles.error : ''}
            />
            {fieldErrors.telefone && <span className={styles.fieldError}>{fieldErrors.telefone}</span>}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label>CEP</label>
          <input
            type="text"
            name="cep"
            value={dadosUsuario.cep}
            onChange={handleDadosChange}
            onBlur={handleFieldBlur}
            placeholder="00000-000"
            maxLength="9"
            required
            className={fieldErrors.cep ? styles.error : ''}
          />
          {fieldErrors.cep && <span className={styles.fieldError}>{fieldErrors.cep}</span>}
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.btnVoltar}
            onClick={() => setEtapaAtual('selecao_plano')}
          >
            Voltar
          </button>
          <button 
            type="button" 
            className={styles.btnContinuar}
            onClick={() => setEtapaAtual('pagamento')}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );

  /**
   * Renderiza as opções de pagamento
   */
  const renderPagamento = () => (
    <div className={styles.pagamento}>
      <h2>Forma de Pagamento</h2>
      <div className={styles.resumoPedido}>
        <h3>Resumo do Pedido</h3>
        <div className={styles.resumoItem}>
          <span>{planoSelecionado.nome}</span>
          <span>R$ {calcularValorTotal(planoSelecionado).toFixed(2).replace('.', ',')}</span>
        </div>
        <div className={styles.resumoTotal}>
          <span>Total</span>
          <span>R$ {calcularValorTotal(planoSelecionado).toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
      
      <div className={styles.formasPagamento}>
        <h3>Selecione a forma de pagamento</h3>
        {Object.values(FORMAS_PAGAMENTO).map((forma) => (
          <div 
            key={forma.id}
            className={`${styles.formaPagamentoCard} ${formaPagamento === forma.id ? styles.selecionada : ''}`}
            onClick={() => setFormaPagamento(forma.id)}
          >
            <div className={styles.formaPagamentoIcone}>{forma.icone}</div>
            <div className={styles.formaPagamentoInfo}>
              <h4>{forma.nome}</h4>
              <p>{forma.descricao}</p>
            </div>
            <div className={styles.formaPagamentoRadio}>
              <input 
                type="radio" 
                name="formaPagamento" 
                value={forma.id}
                checked={formaPagamento === forma.id}
                onChange={() => setFormaPagamento(forma.id)}
              />
            </div>
          </div>
        ))}
        
        {/* Campos do cartão - aparecem quando cartão é selecionado */}
        {formaPagamento === 'CARTAO_CREDITO' && (
          <div className={styles.form}>
            <h3>Dados do Cartão</h3>
            
            <div className={styles.formGroup}>
              <label>Número do Cartão</label>
              <input
                type="text"
                name="numero"
                value={dadosCartao.numero}
                onChange={handleCartaoChange}
                onBlur={handleCartaoBlur}
                placeholder="0000 0000 0000 0000"
                maxLength="19"
                autoComplete="off"
                data-form-type="other"
                required
                className={cartaoErrors.numero ? styles.error : ''}
              />
              {cartaoErrors.numero && <span className={styles.fieldError}>{cartaoErrors.numero}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Nome no Cartão</label>
              <input
                type="text"
                name="nome"
                value={dadosCartao.nome}
                onChange={handleCartaoChange}
                onBlur={handleCartaoBlur}
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                autoComplete="off"
                data-form-type="other"
                required
                className={cartaoErrors.nome ? styles.error : ''}
              />
              {cartaoErrors.nome && <span className={styles.fieldError}>{cartaoErrors.nome}</span>}
            </div>
            
            <div className={styles.formRow}>
                              <div className={styles.formGroup}>
                  <label>Validade</label>
                  <input
                    type="text"
                    name="validade"
                    value={dadosCartao.validade}
                    onChange={handleCartaoChange}
                    onBlur={handleCartaoBlur}
                    placeholder="MM/AA"
                    maxLength="5"
                    autoComplete="off"
                    data-form-type="other"
                    required
                    className={cartaoErrors.validade ? styles.error : ''}
                  />
                  {cartaoErrors.validade && <span className={styles.fieldError}>{cartaoErrors.validade}</span>}
                </div>
              
                              <div className={styles.formGroup}>
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={dadosCartao.cvv}
                    onChange={handleCartaoChange}
                    onBlur={handleCartaoBlur}
                    placeholder="000"
                    maxLength="4"
                    autoComplete="off"
                    data-form-type="other"
                    required
                    className={cartaoErrors.cvv ? styles.error : ''}
                  />
                  {cartaoErrors.cvv && <span className={styles.fieldError}>{cartaoErrors.cvv}</span>}
                </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.btnVoltar}
          onClick={() => setEtapaAtual('dados_usuario')}
        >
          Voltar
        </button>
        <button 
          type="button" 
          className={styles.btnFinalizar}
          onClick={processarPagamento}
          disabled={loading || !formaPagamento}
        >
          {loading ? 'Processando...' : 'Finalizar Pagamento'}
        </button>
      </div>
    </div>
  );

  /**
   * Renderiza a confirmação do pagamento
   */
  const renderConfirmacao = () => (
    <div className={styles.confirmacao}>
      <div className={styles.sucessoIcone}>✅</div>
      <h2>Pagamento Realizado com Sucesso!</h2>
      <p>Sua conta foi criada e seu plano foi ativado!</p>
      <div className={styles.detalhesConfirmacao}>
        <p><strong>Plano:</strong> {planoSelecionado.nome}</p>
        <p><strong>Valor:</strong> R$ {calcularValorTotal(planoSelecionado).toFixed(2).replace('.', ',')}</p>
        <p><strong>Forma de Pagamento:</strong> {FORMAS_PAGAMENTO[formaPagamento]?.nome}</p>
        <p><strong>Email:</strong> {dadosUsuario.email}</p>
      </div>
      <div className={styles.proximosPassos}>
        <h3>Próximos Passos:</h3>
        <ol>
          <li>Verifique seu email para confirmar o cadastro</li>
          <li>Faça login com seu email para acessar o sistema</li>
          <li>Comece a usar todas as funcionalidades do seu plano</li>
        </ol>
      </div>
      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.btnFinalizar}
          onClick={() => navigate('/login')}
        >
          Fazer Login Agora
        </button>
        <button 
          type="button" 
          className={styles.btnVoltar}
          onClick={() => window.location.reload()}
        >
          Fazer Nova Compra
        </button>
      </div>
    </div>
  );

  // Função para obter a classe do container baseada na etapa
  const getContainerClass = () => {
    switch (etapaAtual) {
      case 'selecao_plano':
        return `${styles.container} ${styles.containerSelecaoPlano}`;
      case 'dados_usuario':
        return `${styles.container} ${styles.containerDadosUsuario}`;
      case 'pagamento':
        return `${styles.container} ${styles.containerPagamento}`;
      case 'confirmacao':
        return `${styles.container} ${styles.containerConfirmacao}`;
      default:
        return styles.container;
    }
  };

  return (
    <div className={styles.checkout}>
      <div className={getContainerClass()}>
        {/* Indicador de progresso */}
        <div className={styles.progressoContainer}>
          <div className={styles.progresso}>
            <div className={`${styles.step} ${etapaAtual === 'selecao_plano' ? styles.ativo : ''} ${['dados_usuario', 'pagamento', 'confirmacao'].includes(etapaAtual) ? styles.concluido : ''}`}>
              <span>1</span>
              <label>Plano</label>
            </div>
            <div className={`${styles.step} ${etapaAtual === 'dados_usuario' ? styles.ativo : ''} ${['pagamento', 'confirmacao'].includes(etapaAtual) ? styles.concluido : ''}`}>
              <span>2</span>
              <label>Dados</label>
            </div>
            <div className={`${styles.step} ${etapaAtual === 'pagamento' ? styles.ativo : ''} ${etapaAtual === 'confirmacao' ? styles.concluido : ''}`}>
              <span>3</span>
              <label>Pagamento</label>
            </div>
            <div className={`${styles.step} ${etapaAtual === 'confirmacao' ? styles.ativo : ''}`}>
              <span>4</span>
              <label>Confirmação</label>
            </div>
          </div>
        </div>

        {/* Mensagens de erro e sucesso */}
        {error && <div className={styles.erro}>{error}</div>}
        {success && <div className={styles.sucesso}>{success}</div>}

        {/* Conteúdo baseado na etapa atual */}
        {etapaAtual === 'selecao_plano' && renderSelecaoPlano()}
        {etapaAtual === 'dados_usuario' && renderDadosUsuario()}
        {etapaAtual === 'pagamento' && renderPagamento()}
        {etapaAtual === 'confirmacao' && renderConfirmacao()}
      </div>
    </div>
  );
} 