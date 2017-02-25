import ErrorHandler from "./errorHandler";
/**
 * Define here errors you wish to give a custom handle (i.e. SQL errors)
 * @param server restify server instance
 */
export default function (server) {

    let handler = new ErrorHandler(server);

    //handle unique field error
    handler.handle('SequelizeUniqueConstraint', 406, 'Field must be unique');
}
