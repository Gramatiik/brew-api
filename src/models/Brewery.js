module.exports = function(sequelize, DataTypes) {
	let Brewery = sequelize.define('Brewery', {
		id: {
			type: DataTypes.INTEGER(21),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		address1: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		address2: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		city: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		state: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		code: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		country: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		website: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		descript: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		add_user: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: "0"
		},
		last_mod: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: "0000-00-00 00:00:00"
		}
	}, {
		tableName: 'breweries',
		timestamps: false,
		classMethods:{
			associate: function (models) {
				Brewery.hasOne(models.BreweryGeocode, { foreignKey: 'brewery_id'});
				Brewery.hasMany(models.Beer, { foreignKey: 'brewery_id'});
            }
        }
	});

	return Brewery;
};
