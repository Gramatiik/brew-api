/**
 * This class is used for simple error handling
 * it listens for server specific error name and sends custom response code and message
 */
export default class errorHandler {
    constructor(server) {
        this.srv = server;
    }

    /**
     * handle specific error
     * @param errName name of the error to catch
     *        (i.e. 'InternalServerError' minus the 'Error' part, so you should write 'InternalServer')
     * @param responseCode response http code to send
     * @param message
     */
    handle(errName, responseCode, message) {
        this.srv.on(errName, (req, res, err) => {
            res.send(responseCode, {
                error: {
                    code: err.name,
                    message: message
                }
            });
        });
    }
}
