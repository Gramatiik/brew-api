/**
 * @apiDefine BeerResponseFields
 * Response fields for beer endpoint
 *
 * @apiSuccess {Number}     Beer.id record id
 * @apiSuccess {Number}     Beer.brewery_id id of related brewery
 * @apiSuccess {String}     Beer.name Name
 * @apiSuccess {String}     Beer.cat_id id of related category
 * @apiSuccess {String}     Beer.style_id id of related style
 * @apiSuccess {String}     Beer.abv Alchool by volume value
 * @apiSuccess {String}     Beer.ibu International Bitterness Units
 * @apiSuccess {String}     Beer.srm Standard Reference Method
 * @apiSuccess {String}     Beer.upc Universal Product Code
 * @apiSuccess {String}     Beer.descript Description
 */

 /**
  * @apiDefine BeerPostParameters
  *
  * @apiParam {String} name Beer name
  * @apiParam {Number} [cat_id] Associated category id
  * @apiParam {Number} [brewery_id] Associated Brewery ID
  * @apiParam {Number} [style_id] Associated style id
  * @apiParam {Number} abv Alchool by volume value
  * @apiParam {Number} [ibu] International Bitterness Units
  * @apiParam {Number} [srm] Standard Reference Method
  * @apiParam {Number} [upc] Universal Product Code
  * @apiParam {String} [descript] Beer description
  */

/**
 * @apiDefine BeerPutParameters
 *
 * @apiParam {String} [name] Beer name
 * @apiParam {Number} [cat_id] Associated category id
 * @apiParam {Number} [brewery_id] Associated brewery id
 * @apiParam {Number} [style_id] Associated style id
 * @apiParam {Number} [abv] Alchool by volume value
 * @apiParam {Number} [ibu] International Bitterness Units
 * @apiParam {Number} [srm] Standard Reference Method
 * @apiParam {Number} [upc] Universal Product Code
 * @apiParam {String} [descript] Beer description
 */
 
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
			allowNull: false
		},
		ibu: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		srm: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		upc: {
			type: DataTypes.INTEGER(40),
			allowNull: true
		},
		filepath: {
			type: DataTypes.STRING,
			allowNull: true
		},
		descript: {
			type: DataTypes.TEXT,
			allowNull: true
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
