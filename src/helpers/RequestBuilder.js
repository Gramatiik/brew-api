export default class RequestBuilder {
    constructor(req, db, modelName, defaultOptions) {
        this.req = req;
        this.db = db;

        //used to validate fields
        this.modelName = modelName;

        this.defaultOptions = defaultOptions;
        this.buildingQuery = {};
    }

    //for 'fields‘ parameter
    enableFields() {
        if(this.req.params.fields && this.req.params.fields !== '*') {
            this.buildingQuery.attributes = this.req.params.fields.split(',');
        }
        return this;
    }

    //for 'recursive' parameter
    enableRecursivity() {
        if(this.req.params.recursive && this.req.params.recursive === 'false')
            delete this.defaultOptions.include; //Delete query for related models if they exist
        return this;
    }

    //for 'limit' and 'offset' parameters
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

    enableOrdering() {
        let ordering = this.req.params.order;
        if(ordering) {
            ordering = ordering.split(':');
            ordering[1].toUpperCase();

            this.buildingQuery.order = [ordering]
        }
        return this;
    }

    finalize() {
        //merge defaultOptions with the builded query
        this.buildingQuery = Object.assign(this.buildingQuery, this.defaultOptions);

        //return the builded query !
        return this.buildingQuery;
    }
}