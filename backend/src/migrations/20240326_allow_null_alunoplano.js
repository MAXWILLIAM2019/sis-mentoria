const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Permitir NULL no campo idalunoplano
        await queryInterface.changeColumn('asaas_pagamento', 'idalunoplano', {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'idalunoplano'
        });

        // Permitir NULL no campo PlanoId
        await queryInterface.changeColumn('asaas_pagamento', 'PlanoId', {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'PlanoId'
        });

        console.log('✅ Migration concluída: Campos idalunoplano e PlanoId agora permitem NULL');
    },

    down: async (queryInterface, Sequelize) => {
        // Reverter: tornar os campos obrigatórios novamente
        await queryInterface.changeColumn('asaas_pagamento', 'idalunoplano', {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'idalunoplano'
        });

        await queryInterface.changeColumn('asaas_pagamento', 'PlanoId', {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'PlanoId'
        });

        console.log('⚠️  Migration revertida: Campos idalunoplano e PlanoId voltaram a ser obrigatórios');
    }
}; 