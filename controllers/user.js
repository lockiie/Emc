const oracledb = require('oracledb')

const md5 = require('md5')

const selectLogin = `SELECT P.PER_FIRSTNAME, P.PER_LASTNAME, P.PER_ID, P.PER_SOCIAL,P.PER_EMAIL, 
                            P.PER_PHONE, U.USR_ID, U.USR_INDENTIFICATION 
                     FROM TB_PERSONS P, TB_USERS U  
                     WHERE P.USR_ID = U.USR_ID 
                       AND U.USR_INDENTIFICATION = :USR_INDENTIFICATION
                       AND U.USR_PASSWORD = :USR_PASSWORD`

//post http://localhost:3000/user/newUser 
// {
//     "PER_FIRSTNAME": "Lucas",
//     "PER_LASTNAME": "Pechebelok",
//     "PER_SOCIAL":"12245426908",
//     "PER_PHONE": 44997627933,
//     "PER_EMAIL": "lucaspechebelok@gmail.com",
//     "PASSWORD": "PECHEBELOK" 
// }
exports.newUser = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const iuser = await conn.execute(
            `INSERT INTO TB_USERS
            (USR_INDENTIFICATION, USR_PASSWORD, USR_ID)
            VALUES
            (:USR_INDENTIFICATION, :USR_PASSWORD, NULL)
            RETURNING USR_ID INTO :ID`,
            {
                USR_PASSWORD: md5(req.body.PASSWORD + global.SALT_KEY), USR_INDENTIFICATION: req.body.PER_EMAIL,
                ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }, {
        }
        )
        const iperson = await conn.execute(
            `INSERT INTO TB_PERSONS (PER_FIRSTNAME, PER_LASTNAME, PER_SOCIAL, USR_ID, PER_EMAIL, PER_PHONE, PER_ID) 
            VALUES (:PER_FIRSTNAME, :PER_LASTNAME, :PER_SOCIAL, :USR_ID, :PER_EMAIL, :PER_PHONE, NULL)
            RETURNING PER_ID INTO :ID`,
            {
                PER_FIRSTNAME: req.body.PER_FIRSTNAME, PER_LASTNAME: req.body.PER_LASTNAME
                , PER_SOCIAL: req.body.PER_SOCIAL, USR_ID: Number(iuser.outBinds.ID),
                PER_EMAIL: req.body.PER_EMAIL, PER_PHONE: req.body.PER_PHONE,
                ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        }
        )
        conn.commit()
        res.status(200).json({
            PER_ID: Number(iperson.outBinds.ID), USR_ID: Number(iuser.outBinds.ID),
            message: 'Cadastrado com sucesso'
        })
    } catch (err) {
        conn.rollback()
        if (err.code = 00001) {
            res.status(500).json({ message: 'Email já cadastrado ' })
        } else {
            res.status(500).json(err.message)
        }
    } finally {
        conn.close()
    }
}
// http://localhost:3000/user/getUser/22
exports.getUser = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const result = await conn.execute(
            `SELECT P.PER_FIRSTNAME, P.PER_LASTNAME, P.PER_ID, P.PER_SOCIAL,P.PER_EMAIL, P.PER_PHONE,
                    U.USR_ID, U.USR_INDENTIFICATION
             FROM TB_PERSONS P, TB_USERS U 
             WHERE P.USR_ID = U.USR_ID
               AND U.USR_ID = :USR_ID`,
            { USR_ID: req.params.id }, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        }
        );
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}

//http://localhost:3000/user/updatePassword
// {
//     "USR_INDENTIFICATION" : "lucasgernandes@gmail.com",
//     "OLDPASSWORD": "PECHEBELOK123",
//     "NEWPASSWORD": "PECHEBELOK"
// }
exports.updatePassword = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const result = await conn.execute(
            selectLogin,
            { USR_PASSWORD: md5(req.body.OLDPASSWORD + global.SALT_KEY), USR_INDENTIFICATION: req.body.USR_INDENTIFICATION }, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        }
        )
        if (result.rows[0]) {
            await conn.execute(
                `UPDATE TB_USERS SET
                 USR_PASSWORD = :USR_PASSWORD
                 WHERE USR_ID = :USR_ID
                `,
                {
                    USR_ID: result.rows[0].USR_ID,
                    USR_PASSWORD: md5(req.body.NEWPASSWORD + global.SALT_KEY)
                }, {
            })

            conn.commit()
            res.status(200).json({
                message: "Senha alterada com sucesso !"
            })

        } else {
            res.status(403).json({
                message: "Senha incorreta!"
            })
        }
    } catch (err) {
        conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}
//http://localhost:3000/user/updateUser
// {
//     "PER_FIRSTNAME": "Lucas",
//     "PER_LASTNAME": "Pechebelok Hernandes",
//     "PER_SOCIAL":"12245426908",
//     "PER_PHONE": 44997627933,
//     "PER_EMAIL": "lucaspechebelok@gmail.com",
//     "PASSWORD": "PECHEBELOK",
//     "PER_ID": 4,
//     "USR_ID" : 22
// }
exports.updateUser = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {

        await conn.execute(
            `UPDATE TB_USERS SET
            USR_INDENTIFICATION = :USR_INDENTIFICATION
            WHERE USR_ID = :USR_ID
            `,
            {
                USR_INDENTIFICATION: req.body.PER_EMAIL,
                USR_ID: req.body.USR_ID
            }, {
        }
        )
        await conn.execute(
            `UPDATE TB_PERSONS SET
            PER_FIRSTNAME = :PER_FIRSTNAME, PER_LASTNAME = :PER_LASTNAME,
            PER_SOCIAL = :PER_SOCIAL, PER_EMAIL = :PER_EMAIL, PER_PHONE = :PER_PHONE
            WHERE PER_ID = :PER_ID`,
            {
                PER_FIRSTNAME: req.body.PER_FIRSTNAME, PER_LASTNAME: req.body.PER_LASTNAME
                , PER_SOCIAL: req.body.PER_SOCIAL, PER_EMAIL: req.body.PER_EMAIL, PER_PHONE: req.body.PER_PHONE,
                PER_ID: req.body.PER_ID
            }, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        }
        )
        conn.commit()
        res.status(200).json({
            message: 'Editado com sucesso'
        })
    } catch (err) {
        conn.rollback()
        if (err.code = 00001) {
            res.status(500).json({ message: 'Email já cadastrado ' })
        } else {
            res.status(500).json(err.message)
        }
    } finally {
        conn.close()
    }
}
//http://localhost:3000/user/login
// {
//     "USR_INDENTIFICATION" : "lucasgernandes@gmail.com",
//     "PASSWORD": "PECHEBELOK"

// }
exports.login = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const result = await conn.execute(
            selectLogin,
            { USR_PASSWORD: md5(req.body.PASSWORD + global.SALT_KEY), USR_INDENTIFICATION: req.body.USR_INDENTIFICATION },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            })
        if(result.rows[0]){
            await conn.execute('UPDATE TB_USERS SET USR_LASTLOGIN = SYSDATE WHERE USR_ID = :USR_ID',
            {USR_ID : result.rows[0].USR_ID})
            conn.commit()
            res.status(200).json(result.rows)
        }else{
            res.status(403).json({message: "Email ou senha incorreta!"})
        }   
    } catch (err) {
        conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}