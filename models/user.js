module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        admin_id:{
           type: DataTypes.INTEGER
        }
    });
};