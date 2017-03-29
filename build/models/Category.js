"use strict";

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
		},
		last_mod: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: "0000-00-00 00:00:00"
		}
	}, {
		tableName: 'categories',
		timestamps: false
	});
};