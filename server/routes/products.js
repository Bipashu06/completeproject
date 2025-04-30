const express = require('express');
const router = express.Router();
const { Products, Ordered_Products } = require('../models');
router.get('/', async (req, res) => {
    const listofproducts = await Products.findAll();
    res.json({
        message: "product fetched",
        products: listofproducts
    });
})
router.post('/', async (req, res) => {
    let product = req.body;
    if(!product) return res.json({
        error: "product info cant be empty"
    })
    try {
        const isProductExist = await Products.findOne({
            where: {
                product_name: product.productName.toLowerCase(),
                HSN: product.hsn.toLowerCase()
             }});
        if(isProductExist) {
            return res.json({
                error: "product already exist"
            })
        }
        let addedProduct = {
            product_name: product.productName.toLowerCase(),
            HSN: product.hsn.toLowerCase(),
            price: product.price
        }
        await Products.create(addedProduct);
        res.json({
            message: "product added successfully"
        });
    } catch (e) {
        return res.json({
            error: e.message
        })
    }

})
router.delete('/', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(404).json({
                error: "Id is null or empty"
            });
        }
        const result = await Products.destroy({
            where: {
                product_id: id
            }
        });
        if (result === 0) {
            return res.json({
                message: "Product didn't exist in database"
            })
        }
        return res.json({
            message: `Product Deleted Successfully`,
            result: result
        })
    }
    catch (e) {
        return res.status(500).json({
            error: `Error occured while interacting with database ${e}`
        })
    }
})
router.put('/update', async (req, res) => {
    const { id, product_name, price, HSN } = req.body;
    if (!id || !product_name || !price || !HSN) {
        return res.status(404).json({
            error: "Something is missing"
        })
    }
    try {
        const product = await Products.findByPk(id);
        if (!product) {
            return res.status(404).json({
                error: "Product didn't exist"
            });
        }
        product.product_name = product_name.toLowerCase();
        product.price = price;
        product.HSN = HSN.toLowerCase();
        await product.save();
       
        return res.status(200).json({
            message: "Product edited successfully"
        })
    }
    catch (e) {
        return res.status(500).json({
            error: "Internal server error occured"
        })
    }

})
module.exports = router