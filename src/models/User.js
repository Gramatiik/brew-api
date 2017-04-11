/**
 * @apiDefine UserResponseFields
 *
 * @apiSuccess {Number}     User.id id of the record
 * @apiSuccess {String}     User.username Username (unique)
 * @apiSuccess {String}     User.email Email (unique)
 * @apiSuccess {String}     User.role role (user|contributor|admin)
 */

/**
 * @apiDefine UserUpdateParameters
 *
 * @apiParam {String}       [username] Updated username
 * @apiParam {String}       [email] Updated email
 * @apiParam {String}       [password] Updated password
 * @apiParam {String}       [role] Updated role
 */

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
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
            unique: false
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
