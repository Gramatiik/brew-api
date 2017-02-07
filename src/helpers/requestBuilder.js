export default class RequestBuilder {
    constructor(req,db,defaultOptions) {
        this.req = req;
        this.db = db;
        this.defaultOptions = defaultOptions;
        this.buidingQuery = {};

        console.log(this.req);
    }

    processFields() {
        if(this.req.params.fields) {
            if(this.req.params.fields !== '*') {
                //build an array from comma separated fields
                this.buidingQuery.attributes = this.req.params.fields.split(',');
            }
        }

        return this;
    }

    processRecursivity() {
        if(this.req.params.recursive && this.req.params.recursive === 'false')
            delete this.defaultOptions.include; //Delete related models if they exist

        return this;
    }

    processWhereClause() {
        this.buidingQuery.where = {id: this.req.params.id};
        return this;
    }

    finalize() {
        //merge defaultOptions with the builded query
        this.buidingQuery = Object.assign(this.buidingQuery, this.defaultOptions);

        //return the builded query !
        return this.buidingQuery;
    }
}