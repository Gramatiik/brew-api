/**
 * @apiDefine BreweryResponseFields
 * Response fields for brewery endpoint
 *
 * @apiSuccess {Number}     Brewery.id id of the record
 * @apiSuccess {Number}     Brewery.name Name of this brewery
 * @apiSuccess {Number}     Brewery.address1 First address line
 * @apiSuccess {Number}     Brewery.address2 Second address line
 * @apiSuccess {Number}     Brewery.city City
 * @apiSuccess {String}     Brewery.state State (if applicable)
 * @apiSuccess {String}     Brewery.code ZIP code
 * @apiSuccess {String}     Brewery.country Country
 * @apiSuccess {String}     Brewery.phone Phone
 * @apiSuccess {String}     Brewery.website Website
 * @apiSuccess {String}     Brewery.descript Description
 * @apiSuccess {Object}     Brewery.BreweryGeocode Geocode related object
 * @apiSuccess {Object[]}   Brewery.Beers Beers that belong to this brewery
 */

/**
 * @apiDefine BreweryPostParameters
 *
 * @apiParam {String}       name Brewery name
 * @apiParam {String}       address1 Address line 1
 * @apiParam {String}       city City
 * @apiParam {String}       country Country
 *
 * @apiParam {String}       [address2] Address line 2
 * @apiParam {String}       [state] State
 * @apiParam {String}       [code] ZIP code
 * @apiParam {String}       [phone] Phone number
 * @apiParam {String}       [website] Link to website
 * @apiParam {String}       [description] Brewery description
 */

 /**
  * @apiDefine BreweryPutParameters
  *
  * @apiParam {String}       [name] Brewery name
  * @apiParam {String}       [address1] Address line 1
  * @apiParam {String}       [address2] Address line 2
  * @apiParam {String}       [city] City
  * @apiParam {String}       [country] Country
  * @apiParam {String}       [state] State
  * @apiParam {String}       [code] ZIP code
  * @apiParam {String}       [phone] Phone number
  * @apiParam {String}       [website] Link to website
  * @apiParam {String}       [description] Brewery description
  */

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
