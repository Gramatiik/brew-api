module.exports = function(sequelize, DataTypes) {
	return sequelize.define('BreweryGeocode', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		brewery_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: "0"
		},
		latitude: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: "0"
		},
		longitude: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: "0"
		},
		accuracy: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		tableName: 'breweries_geocode',
		timestamps: false
	});
};
