module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Style', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
        cat_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: "0"
		},
        style_name: {
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
		tableName: 'styles',
		timestamps: false
	});
};
