const express = require('express');
const router = express.Router();
const { Ordered_Products } = require('../models');

router.get('/', async (req, res) => {
    let listOfOrders = await Ordered_Products.findAll();
    res.json({
        message: "Oreder fetched",
        orders: listOfOrders
    })
})

router.post('/', async (req, res) => {
    try{
        const orderData = req.body;
        if(!Array.isArray(orderData) || orderData.length === 0){
            return res.status(400).json({
                error: "Order are empty"
            })
        }
        const createdOrder = await Promise.all(
            orderData.map( async (order) => {
                return await Ordered_Products.create(order);
            })
        )
        return res.json({
            message: "All order added successfully",
            orders: createdOrder
        })
    }
    catch(error){
        console.error("Error occured", error);
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})
router.post('/edited', async (req, res) => {
    try {
        const orderData = req.body;

        if (!Array.isArray(orderData) || orderData.length === 0) {
            return res.status(400).json({ error: "Orders are empty" });
        }

        const invoiceId = orderData[0].invoice_id;
        const listOfOrders = await Ordered_Products.findAll({
            where: { invoice_id: invoiceId }
        });

        if (listOfOrders.length !== 0) {
            await Ordered_Products.destroy({ where: { invoice_id: invoiceId } });
        }
        const createdOrders = await Promise.all(
            orderData.map(async (order) => {
                return await Ordered_Products.create({
                    invoice_id: order.invoice_id,
                    product: order.product,
                    quantity: order.quantity,
                    total_price: order.total_price,
                });
            })
        );

        return res.json({
            message: "All orders added successfully",
            orders: createdOrders
        });

    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/', async (req, res) => {
    try{
        const { invoice_id } = req.body;
        if(!invoice_id){
            return res.status(404).json({
                error: "Id is null or empty"
            });
        }
        const result = await Ordered_Products.destroy({
            where: {
                invoice_id: invoice_id
            }
        });
        if (result === 0){
            return res.json({
                message: "Product didn't exist in database"
            })
        }
        return res.json({
            message: `Product Deleted Successfully`,
            result: result
        })
    }
    catch(e){
        return res.status(500).json({
            error: `Error occured while interacting with database ${e}`
        })
    }
})
router.put('/update', async (req, res) => {
    const { product_name, editedValue } = req.body;
    if(!product_name || !editedValue){
        return res.status(404).json({
            error: "sent data is undefined or empty"
        });
    }
    try{
        const updatedCount = await Ordered_Products.update({ product: editedValue.toLowerCase() }, {
            where: { product: product_name.toLowerCase() }
        });
        if(updatedCount[0] === 0){
            return res.status(404).json({
                error: "product didn't exists in any order"
            })
        }

        return res.json({
            message: updatedCount[0] + " product updated in order"
        })
    }
    catch(e){
        return res.status(505).json({
            error: "Internal server error: " + e
        })
    }
})
module.exports = router