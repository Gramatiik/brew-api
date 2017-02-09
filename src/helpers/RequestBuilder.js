export default class RequestBuilder {

    /**
     * @constructor Build a new sequelize using RequestBuilder
     * @param req {Object} request object (used to retrieve query params).
     * @param db {Object} sequelize database object (used to describe database models).
     * @param modelName {String} model you want to query.
     * @param defaultOptions {object} default sequelize options you want to use.
     */
    constructor(req, db, modelName, defaultOptions) {
        this.req = req;
        this.db = db;

        //used to validate fields
        this.modelName = modelName;

        this.defaultOptions = defaultOptions;
        this.buildingQuery = {};
    }

    /**
     * @description Enables the ability to choose which fields to query
     * usage : "fields=<field1>,<field2>..."
     * (comma separated list of fields)
     * @returns {RequestBuilder}
     */
    enableFieldsSelection() {
        if(this.req.params.fields) {
            if(this.req.params.fields === '*') {
                delete this.defaultOptions.attributes;
            } else {
                this.buildingQuery.attributes = this.req.params.fields.split(',');
            }
        }
        return this;
    }

    /**
     * @description Enables the ability to deactivate the query to related models
     * by default related models are included in response (e.g. you will get beers that belongs
     * to a brewery if you GET a brewery endpoint.
     * usage : "recursive=<boolean>"
     * @returns {RequestBuilder}
     */
    enableRecursivity() {
        if(this.req.params.recursive && this.req.params.recursive === 'false')
            delete this.defaultOptions.include; //Delete query for related models if they exist
        return this;
    }

    /**
     * @description Enables the processing of ordering queries in request
     * pass maxLimit and defaultLimit in parameter object to define the maximum of results to return
     * and the default result number in case no limit was specified.
     * There are no restrictions on offset parameter.
     * usage : "limit=<number>" and "offset=<number>"
     * @returns {RequestBuilder}
     */
    enablePagination() {
        let limit = parseInt(this.req.params.limit, 10);
        let offset = parseInt(this.req.params.offset, 10);
        let maxLimit = this.defaultOptions.maxLimit;
        let defaultLimit = this.defaultOptions.defaultLimit;

        if(limit && limit > 0) {
            if(maxLimit && limit > maxLimit) {
                throw new Error("Can't query more than " + maxLimit + " responses for this endpoint");
            } else {
                this.buildingQuery.limit = parseInt(limit, 10);
            }
        } else {
            if(defaultLimit) {
                this.buildingQuery.limit = defaultLimit;
            }
        }

        //no special restrictions on offset parameter
        if(offset && offset > 0) {
            this.buildingQuery.offset = parseInt(offset, 10);
        }
        return this
    }

    /**
     * @description enables the ability to order responses.
     * usage : "order=<field>:<asc|desc>" (note the semicolon between field and order direction)
     * @returns {RequestBuilder}
     */
    enableOrdering() {
        let ordering = this.req.params.order;
        if(ordering) {
            ordering = ordering.split(':');

            //uppercase ordering keyword (ASC or DESC) for SQL query
            ordering[1].toUpperCase();

            this.buildingQuery.order = [ordering]
        }
        return this;
    }

    /**
     * @description Returns the object corresponding to this query
     * that will be interpreted by sequelize.
     * @returns {Object}
     */
    finalize() {
        //merge defaultOptions with the builded query
        this.buildingQuery = Object.assign(this.buildingQuery, this.defaultOptions);

        //return the builded query !
        return this.buildingQuery;
    }
}