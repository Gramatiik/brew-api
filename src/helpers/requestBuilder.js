//prend en paramètre la requête utilisateur et renvoie l'objet sequelize correspondant à la requête
export default function RequestBuilder(req, db, defaultOptions) {
    //include or not related models
    if(req.params.recursive && req.params.recursive === 'false')
        delete defaultOptions.include;
    //merge builded query and configuration object
    let query = Object.assign({include: []}, defaultOptions);
    query["where"] = {id: req.params.id};
    makefields(req.params.fields, query);
    return query;
}

function makefields(fields, buildQuery) {
    //if we want all fields
    if(fields) {
        if(fields === '*')
            return false;
        else {
            //return an array from comma separated fields
            buildQuery.attributes = fields.split(',');
            return true
        }
    }

}