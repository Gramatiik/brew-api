import db from "../models";
import jwt from "jwt-simple";
import md5 from "md5";
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
                    password: md5(password)
                }
            }).then( (user) => {
                if(!user) {
                    res.send({
                        message: "Invalid credentials"
                    });
                } else {
                    //generate token
                    let now = Math.round(new Date().getTime() / 1000);

                    let payload = {
                        iat: now,
                        exp: now + 60*60, //TODO : make expiration time configurable
                        id: user.id,
                        username: user.username,
                        role: user.role
                    };

                    let token = jwt.encode(payload, jwtConfig["jwt-secret"], 'HS256', {});

                    res.send({ token: token });
                }

                return next();

            }).catch( (err) => {
                return next(err);
            });
        });
}




