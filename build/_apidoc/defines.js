/* Define reusable documentation here */
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
 * @apiDefine BeerPutParameters
 *
 * @apiParam {Number} [brewery_id] Associated brewery id
 * @apiParam {String} [name] Beer name
 * @apiParam {Number} [cat_id] Associated category id
 * @apiParam {Number} [style_id] Associated style id
 * @apiParam {Number} [abv] Alchool by volume value
 * @apiParam {Number} [ibu] International Bitterness Units
 * @apiParam {Number} [srm] Standard Reference Method
 * @apiParam {Number} [upc] Universal Product Code
 * @apiParam {String} [descript] Beer description
 */

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
 * @apiParam {String}       name Brewery name
 * @apiParam {String}       address1 Address line 1
 * @apiParam {String}       city City
 * @apiParam {String}       country Country
 *
 * @apiParam {String}       [country] Address2
 * @apiParam {String}       [state] State
 * @apiParam {String}       [code] ZIP code
 * @apiParam {String}       [phone] Phone number
 * @apiParam {String}       [website] Link to website
 * @apiParam {String}       [description] Brewery description
 */

/**
 * @apiDefine UserResponseFields
 * @apiSuccess {Number}     User.id id of the record
 * @apiSuccess {String}     User.username Username (unique)
 * @apiSuccess {String}     User.email Email (unique)
 */

/**
 * @apiDefine UserUpdateParameters
 * @apiParam {String}       [username] Updated username
 * @apiParam {String}       [email] Updated email
 * @apiParam {String}       [password] Updated password
 */
"use strict";