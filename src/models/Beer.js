module.exports = function(sequelize, DataTypes) {
	let Beer = sequelize.define('Beer', {
		id: {
			type: DataTypes.INTEGER(21),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		brewery_id: {
			type: DataTypes.INTEGER(21),
			allowNull: false,
			defaultValue: "0"
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		cat_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: "0"
		},
        style_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: "0"
		},
		abv: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: "0"
		},
		ibu: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: "0"
		},
		srm: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: "0"
		},
		upc: {
			type: DataTypes.INTEGER(40),
			allowNull: false,
			defaultValue: "0"
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
		tableName: 'beers',
		timestamps: false,
        classMethods:{
            associate: function (models) {
                Beer.belongsTo(models.Brewery, { foreignKey: 'brewery_id'});
                Beer.belongsTo(models.Category, { foreignKey: 'cat_id'});
                Beer.belongsTo(models.Style, { foreignKey: 'style_id'});
            }
        }
	});

	return Beer;
};
