'use strict';

module.exports = function (sequelize, DataTypes) {
	var Brewery = sequelize.define('Brewery', {
		id: {
			type: DataTypes.INTEGER(21),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		address1: {
			type: DataTypes.STRING,
			allowNull: false
		},
		address2: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		city: {
			type: DataTypes.STRING,
			allowNull: false
		},
		state: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		code: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		country: {
			type: DataTypes.STRING,
			allowNull: false
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		website: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		descript: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		add_user: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: null
		},
		last_mod: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		}
	}, {
		tableName: 'breweries',
		timestamps: false,
		classMethods: {
			associate: function associate(models) {
				Brewery.hasOne(models.BreweryGeocode, { foreignKey: 'brewery_id' });
				Brewery.hasMany(models.Beer, { foreignKey: 'brewery_id' });
			}
		}
	});

	return Brewery;
};