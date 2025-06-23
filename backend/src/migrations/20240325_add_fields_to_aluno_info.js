module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('aluno_info', 'telefone', {
            type: Sequelize.STRING(20),
            allowNull: true
        });

        await queryInterface.addColumn('aluno_info', 'status_cadastro', {
            type: Sequelize.ENUM('PRE_CADASTRO', 'PAGAMENTO_PENDENTE', 'PAGAMENTO_CONFIRMADO', 'PLANO_ATRIBUIDO', 'ATIVO'),
            defaultValue: 'PRE_CADASTRO',
            allowNull: false
        });

        await queryInterface.addColumn('aluno_info', 'status_pagamento', {
            type: Sequelize.ENUM('PENDENTE', 'CONFIRMADO', 'CANCELADO'),
            defaultValue: 'PENDENTE',
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('aluno_info', 'telefone');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_aluno_info_status_cadastro');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_aluno_info_status_pagamento');
        await queryInterface.removeColumn('aluno_info', 'status_cadastro');
        await queryInterface.removeColumn('aluno_info', 'status_pagamento');
    }
}; 