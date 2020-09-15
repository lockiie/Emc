const oracledb = require('oracledb')

exports.newAddress = async (req, res, next) => {
    const conn = await oracledb.getConnection()
    try {
        const country = await conn.execute(`BEGIN INSERT INTO TB_COUNTRY(COU_CITY, COU_UF) 
                                               VALUES (:COU_CITY, :COU_UF) RETURNING COU_ID INTO :ID;
                                               EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
                                               SELECT COU_ID INTO :ID FROM TB_COUNTRY 
                                               WHERE COU_CITY = :COU_CITY AND COU_UF = :COU_UF; END;`,
            {
                COU_CITY: req.body.address.COU_CITY, COU_UF: req.body.address.COU_UF.toUpperCase(),
                ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }, {})
        await conn.execute(`INSERT INTO TB_ADDRESS(ADR_NUMBER, ADR_COMPLEMENT, ADR_ZIP, PER_ID, COU_ID)
                                        VALUES(:ADR_NUMBER, :ADR_COMPLEMENT, :ADR_ZIP, :PER_ID, :COU_ID)`,
            {
                ADR_NUMBER: req.body.address.ADR_NUMBER, ADR_COMPLEMENT: req.body.address.ADR_COMPLEMENT,
                ADR_ZIP : req.body.address.ADR_ZIP, PER_ID: req.body.PER_ID,
                COU_ID: Number(country.outBinds.ID)
            }, {})

        await conn.commit()

        next()

    } catch (err) {
        await conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}

