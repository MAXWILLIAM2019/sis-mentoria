/**
 * Migration: Adicionar campo CEP na tabela aluno_info
 * Data: 2024-12-20
 * Descrição: Adiciona o campo 'cep' na tabela aluno_info para armazenar o CEP dos alunos
 */

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Adicionando campo CEP na tabela aluno_info...');
      
      await queryInterface.addColumn('aluno_info', 'cep', {
        type: DataTypes.STRING(9), // Formato: 00000-000
        allowNull: true,
        comment: 'CEP do aluno'
      });
      
      console.log('Campo CEP adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar campo CEP:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removendo campo CEP da tabela aluno_info...');
      
      await queryInterface.removeColumn('aluno_info', 'cep');
      
      console.log('Campo CEP removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover campo CEP:', error);
      throw error;
    }
  }
}; 