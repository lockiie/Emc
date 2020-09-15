const oracledb = require('oracledb')
//http://localhost:3000/sale/newSale
// {
//     "CON_ID": 1,
//     "PER_ID": 5,
//     "COM_ID": 2,
//     "ADR_ID": null,
//     "items" : [
//         {
//             "PRO_ID": 40,
//             "SLI_QTD": 692,
//             "SLI_PRICE": 20.55
//         },
//         {
//             "PRO_ID": 43,
//             "SLI_QTD": 8,
//             "SLI_PRICE": 99.5
//         }
//     ]
// }
exports.newSale = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const sale = await conn.execute(`INSERT INTO TB_SALES (CON_ID, PER_ID, COM_ID, ADR_ID) 
                                VALUES (:CON_ID, :PER_ID, :COM_ID, :ADR_ID)
                                RETURNING SAL_ID INTO :ID`,
            {
                COM_ID: req.body.COM_ID, CON_ID : req.body.CON_ID, PER_ID : req.body.PER_ID,
                ADR_ID : req.body.ADR_ID,
                ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }, {})
        await INS_SALES_ITEMS(req.body.items, conn, Number(sale.outBinds.ID)) 

        await conn.commit()
        res.status(200).json({
            message: "Venda cadastrada com sucesso!"
        })
    } catch (err) {
        conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}

async function INS_SALES_ITEMS(items, conn, SAL_ID) {
    await conn.executeMany(`INSERT INTO TB_SALES_ITEMS(SLI_QTD, SLI_PRICE, PRO_ID, SAL_ID)
                            VALUES(:SLI_QTD, :SLI_PRICE, :PRO_ID, ${SAL_ID}) `
        , items, {
        bindDefs: {
            SLI_QTD: { type: oracledb.NUMBER },
            SLI_PRICE: { type: oracledb.NUMBER },
            PRO_ID: { type: oracledb.NUMBER }
        }
    })
}

