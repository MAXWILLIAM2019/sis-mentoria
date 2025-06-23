import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import AcompanharSprints from '../pages/AcompanharSprints/AcompanharSprints';
import AlunoDashboard from '../pages/Aluno/Dashboard';
import TodasSprints from '../pages/Aluno/TodasSprints';
import RegisterPlan from '../pages/RegisterPlan/RegisterPlan';
import ListPlans from '../pages/ListPlans/ListPlans';
import EditPlan from '../pages/EditPlan/EditPlan';
import RegisterSprint from '../pages/RegisterSprint/RegisterSprint';
import Layout from '../components/Layout/Layout';
import AlunoLayout from '../components/Layout/AlunoLayout';
import authService from '../services/authService';
import RegisterStudent from '../pages/RegisterStudent/RegisterStudent';
import Sprints from '../pages/Sprints/Sprints';
import Disciplinas from '../pages/Disciplinas/Disciplinas';
import CadastrarDisciplina from '../pages/CadastrarDisciplina/CadastrarDisciplina';
import AlunoEstatisticas from '../pages/AlunoEstatisticas/AlunoEstatisticas';
import PlanSprints from '../pages/PlanSprints/PlanSprints';
import Checkout from '../pages/Checkout/Checkout';

// Componente para rotas protegidas de administrador
const AdminRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  if (!isAuthenticated || userRole !== 'administrador') {
    console.log('Usuário não autenticado como administrador, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('Administrador autenticado, renderizando rota protegida');
  return <Layout>{children}</Layout>;
};

// Componente para rotas protegidas de aluno
const AlunoRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  if (!isAuthenticated || userRole !== 'aluno') {
    console.log('Usuário não autenticado como aluno, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('Aluno autenticado, renderizando rota protegida');
  return <AlunoLayout>{children}</AlunoLayout>;
};

// Componente para rotas protegidas para qualquer usuário autenticado
const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* === ROTAS DE PAGAMENTO === */}
        {/* 
         * Página de Checkout - Sistema de Pagamentos Asaas
         * 
         * TIPOS DE PLANOS DISPONÍVEIS:
         * - Assinatura Mensal Recorrente (R$ 297,00/mês - sem parcelamento)
         * - Pacote 3 Meses (R$ 282,15/mês × 3 = R$ 846,45 total - 5% desconto)
         * - Pacote 6 Meses (R$ 267,30/mês × 6 = R$ 1.603,80 total - 10% desconto)
         * 
         * ROTA PÚBLICA - Permite novos clientes comprarem diretamente
         */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* Rotas protegidas de administrador */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/acompanhar-sprints"
          element={
            <AdminRoute>
              <AcompanharSprints />
            </AdminRoute>
          }
        />

        {/* Rotas de Planos */}
        <Route
          path="/planos"
          element={
            <AdminRoute>
              <ListPlans />
            </AdminRoute>
          }
        />
        <Route
          path="/planos/cadastrar"
          element={
            <AdminRoute>
              <RegisterPlan />
            </AdminRoute>
          }
        />
        <Route
          path="/planos/editar/:id"
          element={
            <AdminRoute>
              <EditPlan />
            </AdminRoute>
          }
        />

        {/* Rotas de Sprints */}
        <Route
          path="/sprints/cadastrar/:planoId"
          element={
            <AdminRoute>
              <RegisterSprint />
            </AdminRoute>
          }
        />
        <Route
          path="/sprints"
          element={
            <AdminRoute>
              <Sprints />
            </AdminRoute>
          }
        />
        <Route
          path="/sprints/editar/:id"
          element={
            <AdminRoute>
              <RegisterSprint />
            </AdminRoute>
          }
        />

        {/* Rotas de Alunos */}
        <Route
          path="/alunos/cadastrar"
          element={
            <AdminRoute>
              <RegisterStudent />
            </AdminRoute>
          }
        />
        <Route
          path="/alunos"
          element={
            <AdminRoute>
              <div>Listar Alunos (em desenvolvimento)</div>
            </AdminRoute>
          }
        />
        <Route
          path="/alunos/editar/:id"
          element={
            <AdminRoute>
              <div>Editar Aluno (em desenvolvimento)</div>
            </AdminRoute>
          }
        />

        {/* Rotas de Disciplinas */}
        <Route
          path="/disciplinas"
          element={
            <AdminRoute>
              <Disciplinas />
            </AdminRoute>
          }
        />
        <Route
          path="/disciplinas/cadastrar"
          element={
            <AdminRoute>
              <CadastrarDisciplina />
            </AdminRoute>
          }
        />
        <Route
          path="/disciplinas/editar/:id"
          element={
            <AdminRoute>
              <CadastrarDisciplina />
            </AdminRoute>
          }
        />

        {/* Rotas de Aluno (área do aluno) */}
        <Route
          path="/aluno/dashboard"
          element={
            <AlunoRoute>
              <AlunoDashboard />
            </AlunoRoute>
          }
        />
        <Route
          path="/aluno/sprints"
          element={
            <AlunoRoute>
              <TodasSprints />
            </AlunoRoute>
          }
        />
        <Route
          path="/aluno/perfil"
          element={
            <AlunoRoute>
              <div>Meu Perfil (em desenvolvimento)</div>
            </AlunoRoute>
          }
        />
        <Route
          path="/aluno/estatisticas"
          element={
            <AlunoRoute>
              <AlunoEstatisticas />
            </AlunoRoute>
          }
        />

        {/* Rota de Sprints de um Plano */}
        <Route
          path="/planos/:id/sprints"
          element={
            <AdminRoute>
              <PlanSprints />
            </AdminRoute>
          }
        />

        {/* Rota de Cadastro de Sprint vinculada a um Plano */}
        <Route
          path="/planos/:planoId/sprints/cadastrar"
          element={
            <AdminRoute>
              <RegisterSprint />
            </AdminRoute>
          }
        />

        {/* Redireciona a raiz para o login do aluno */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Redireciona qualquer rota não definida para o login do aluno */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; 