'use strict';

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Category', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		cat_name: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		}
	}, {
		tableName: 'categories',
		timestamps: false
	});
};