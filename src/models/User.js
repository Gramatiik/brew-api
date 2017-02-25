module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER(21),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        }
    }, {
        tableName: 'users',
        timestamps: false
    });
};
