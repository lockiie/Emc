const oracledb = require('oracledb')


// {
//     "SKU": 5,
//     "PRO_NAME": "TECLADO",
//     "PRO_VALUE": 120.5,
//     "PRO_OLDVALUE": 12.8,
//     "PRO_BARCODE": 123456789,
//     "COM_ID" : 2,
//     "images":[
//         {
//             "PRI_URL": "WWW.GOOOGLE.COM.BREMQKMEKQWWMKWEMKQWL",
//             "PRI_ORDER": 1
//         },
//          {
//             "PRI_URL": "WWW.GOOOGLE.COM.BREMQKMEKQWWMKWEMKQWL",
//             "PRI_ORDER": 2
//         }
//     ],
//     "categorys":[
//         {
//             "CTT_ID": 1,
//             "CAT_VALUE": "36"
//         },{
//             "CTT_ID": 2,
//             "CAT_VALUE": "Branca"
//         }
//     ]
// }
//http://localhost:3000/product/newProduct
exports.newProduct = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const product = await conn.execute(`INSERT INTO TB_PRODUCTS (PRO_SKU, PRO_NAME, PRO_VALUE, PRO_OLDVALUE, PRO_BARCODE, COM_ID) 
                                VALUES (:SKU , :PRO_NAME, :PRO_VALUE, :PRO_OLDVALUE, :PRO_BARCODE, :COM_ID)
                                RETURNING PRO_ID INTO :ID`,
            {
                SKU: req.body.SKU, PRO_NAME: req.body.PRO_NAME, PRO_VALUE: req.body.PRO_VALUE,
                PRO_OLDVALUE: req.body.PRO_OLDVALUE, PRO_BARCODE: req.body.PRO_BARCODE, COM_ID: req.body.COM_ID,
                ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }, {})
        await conn.executeMany(`INSERT INTO TB_PRODUCTS_IMAGES (PRO_ID, PRI_URL, PRI_ORDER) 
                                        VALUES (${Number(product.outBinds.ID)}, :PRI_URL, :PRI_ORDER)`
            , req.body.images, {
            bindDefs: {
                PRI_URL: { type: oracledb.STRING, maxSize: 200 },
                PRI_ORDER: { type: oracledb.NUMBER }
            }
        })

        await conn.executeMany(`INSERT INTO TB_CATEGORYS (PRO_ID, CAT_VALUE, CTT_ID) 
                                        VALUES (${Number(product.outBinds.ID)}, :CAT_VALUE, :CTT_ID)`
            , req.body.categorys, {
            bindDefs: {
                CAT_VALUE: { type: oracledb.STRING, maxSize: 200 },
                CTT_ID: { type: oracledb.NUMBER }
            }
        })

        await conn.commit()

        res.status(200).json({
            message: "Cadastrado com sucesso!"
        })
    } catch (err) {
        await conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}


// {http://localhost:3000/product/updateProduct
//     "PRO_ID": 43,
//     "SKU": 5,
//     "PRO_NAME": "TECLADO EDITADO",
//     "PRO_VALUE": 120.5,
//     "PRO_OLDVALUE": 12.8,
//     "PRO_BARCODE": 123456789,
//     "COM_ID" : 2,
//     "images":[
//         {
//             "PRI_URL": "WWW.GOOOGLE.COM.BREMQKMEKQWWMKWEMKQWLdkaaslçdksladlçdaskçslak",
//             "PRI_ORDER": 1,
//             "PRI_ID": 25
//         },
//          {
//             "PRI_URL": "WWW.GOOOGLE.COM.BREMQKMEKQWWMKWEMKQWLFDFD",
//             "PRI_ORDER": 2,
//             "PRI_ID" : 26
//         },
//          {
//             "PRI_URL": "WWW.GOOOGLE.COM.BREMQKMEKQWWMKWEMKQWLFDFD",
//             "PRI_ORDER": 3
//         },
//          {
//             "PRI_URL": "Weqweqweqweqw",
//             "PRI_ORDER": 4,
//             "PRI_ID": 71
//         }
//     ],
//     "categorys":[
//         {
//             "CTT_ID": 1,
//             "CAT_VALUE": "36"
//         },{
//             "CTT_ID": 2,
//             "CAT_VALUE": "Branca"
//         }
//     ]
// }
exports.updateProduct = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        const product = await conn.execute(`UPDATE TB_PRODUCTS SET PRO_SKU = :SKU, PRO_NAME = :PRO_NAME, 
                                                                   PRO_OLDVALUE = :PRO_OLDVALUE, PRO_VALUE = :PRO_VALUE,
                                                                   PRO_BARCODE = :PRO_BARCODE, COM_ID = :COM_ID
                                                                   WHERE PRO_ID = :PRO_ID`,
            {
                SKU: req.body.SKU, PRO_NAME: req.body.PRO_NAME, PRO_VALUE: req.body.PRO_VALUE,
                PRO_OLDVALUE: req.body.PRO_OLDVALUE, PRO_BARCODE: req.body.PRO_BARCODE, COM_ID: req.body.COM_ID,
                PRO_ID: req.body.PRO_ID
            }, {})

        await conn.executeMany(`BEGIN INSERT INTO TB_PRODUCTS_IMAGES (PRO_ID, PRI_URL, PRI_ORDER) 
                                      VALUES (${req.body.PRO_ID}, :PRI_URL, :PRI_ORDER);
                                EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
                                      UPDATE TB_PRODUCTS_IMAGES SET PRI_URL = :PRI_URL, PRI_ORDER = :PRI_ORDER
                                      WHERE PRI_ID = :PRI_ID; END;`
            , req.body.images, {
            bindDefs: {
                PRI_ID: { type: oracledb.NUMBER },
                PRI_URL: { type: oracledb.STRING, maxSize: 200 },
                PRI_ORDER: { type: oracledb.NUMBER }
            }
        })

        await conn.executeMany(`BEGIN INSERT INTO TB_CATEGORYS (PRO_ID, CAT_VALUE, CTT_ID) 
                                      VALUES (${req.body.PRO_ID}, :CAT_VALUE, :CTT_ID);
                                EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
                                      UPDATE TB_CATEGORYS SET CAT_VALUE = :CAT_VALUE
                                      WHERE CAT_ID = :CAT_ID; END;`
            , req.body.categorys, {
            bindDefs: {
                CAT_ID: { type: oracledb.NUMBER },
                CAT_VALUE: { type: oracledb.STRING, maxSize: 200 },
                CTT_ID: { type: oracledb.NUMBER }
            }
        })

        await conn.commit()

        res.status(200).json({
            message: "Editado com sucesso!"
        })
    } catch (err) {
        await conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}

//deleteProductImage

exports.deleteProductImage = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        await conn.execute(`DELETE FROM TB_PRODUCTS_IMAGES WHERE PRI_ID = :PRI_ID`
            , { PRI_ID: req.params.id })

        await conn.commit()

        res.status(200).json({
            message: "Removido com sucesso!"
        })
    } catch (err) {
        await conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}

//{http://localhost:3000/product/updateStockAdd
//     "stocks" : [
//         {
//             "PRO_ID": 40,
//             "COM_ID": 2,
//             "STK_QTD": -5
//         },
//         {
//             "PRO_ID": 43,
//             "COM_ID": 2,
//             "STK_QTD": 10
//         }
//     ]
// }
exports.updateStockAdd = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        await PCD_STOCK_UPDATE(req.body.stocks, conn, 1)
        await conn.commit()

        res.status(200).json({
            message: "Estoque atualizado com sucesso!"
        })
    } catch (err) {
        await conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}

async function PCD_STOCK_UPDATE(stocks, conn, action) {
    await conn.executeMany(`BEGIN PCD_STOCK_UPDATE(:STK_QTD, :PRO_ID, :COM_ID, ${action}); END;`
        , stocks, {
        bindDefs: {
            STK_QTD: { type: oracledb.NUMBER },
            PRO_ID: { type: oracledb.NUMBER },
            COM_ID: { type: oracledb.NUMBER }
        }
    })
}

exports.updateStock = async (req, res) => {
    const conn = await oracledb.getConnection()
    try {
        await PCD_STOCK_UPDATE(req.body.stocks, conn, 0)
        await conn.commit()

        res.status(200).json({
            message: "Estoque atualizado com sucesso!"
        })
    } catch (err) {
        await conn.rollback()
        res.status(500).json(err.message)
    } finally {
        conn.close()
    }
}








// exports.newProduct = async (req, res) => {
//     const conn = await oracledb.getConnection()
//     try {
//         await conn.executeMany(`INSERT INTO TB_PRODUCTS (PRO_SKU, PRO_NAME, PRO_VALUE, PRO_OLDVALUE, PRO_BARCODE, COM_ID) 
//                                 VALUES (:SKU , :PRO_NAME, :PRO_VALUE, :PRO_OLDVALUE, :PRO_BARCODE, :COM_ID)`
//             , [
//                 {
//                     SKU: 1,
//                     PRO_NAME: "TECLADO",
//                     PRO_VALUE: 12.6,
//                     PRO_OLDVALUE: 12.8,
//                     PRO_BARCODE: 123456789,
//                     COM_ID : 2
//                 },
//                 {
//                     SKU: 2,
//                     PRO_NAME: "TECLADO",
//                     PRO_VALUE: 12.6,
//                     PRO_OLDVALUE: 12.8,
//                     PRO_BARCODE: 123456789,
//                     COM_ID : 2
//                 },
//                 {
//                     SKU: 3,
//                     PRO_NAME: "TECLADO",
//                     PRO_VALUE: 12.6,
//                     PRO_OLDVALUE: 12.8,
//                     PRO_BARCODE: 123456789,
//                     COM_ID : 2
//                 }
//             ], {
//             autoCommit: false,
//             bindDefs: {
//                 SKU: { type: oracledb.NUMBER },
//                 PRO_NAME: { type: oracledb.STRING, maxSize: 50 },
//                 PRO_VALUE: { type: oracledb.NUMBER },
//                 PRO_OLDVALUE: { type: oracledb.NUMBER },
//                 PRO_BARCODE: { type: oracledb.NUMBER },
//                 COM_ID :{ type: oracledb.NUMBER}
//             }
//         })
//         await conn.commit()
//         res.status(200).json({
//             message : "Cadastrado com sucesso!"
//         })
//     } catch (err) {
//         conn.rollback()
//         res.status(500).json(err.message)
//     } finally {
//         conn.close()
//     }
// }