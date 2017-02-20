import db from "../models";
import jwt from "jwt-simple";
let jwtConfig = require(__dirname + "/../config/jwt-config.json");

export default function authEndpoints(server) {

    server.post({
            url: "/auth/jwt",
            validation: {
                content: {
                    username: { isRequired: true},
                    password: { isRequired: true}
                }
            }
        },
        (req, res, next) => {

            //grab username and password
            let username = req.body.username;
            let password = req.body.password;

            //try to find matching user
            db.User.findOne({
                where: {
                    username: username,
                    password: password
                }
            }).then( (user) => {
                if(!user) {
                    res.send({
                        message: "Invalid credentials"
                    });
                } else {
                    //generate token
                    let payload = { id: user.id, username: user.username };
                    let token = jwt.encode(payload, jwtConfig["jwt-secret"]);

                    res.send({ token: token });
                }

                return next();

            }).catch( (err) => {
                return next(err);
            });
        });
}




