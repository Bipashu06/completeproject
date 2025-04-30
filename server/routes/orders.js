const express = require('express');
const router = express.Router();
const { Ordered_Products, Products } = require('../models');

router.get('/', async (req, res) => {
    let listOfOrders = await Ordered_Products.findAll();
    res.json({
        message: "Oreder fetched",
        orders: listOfOrders
    })
})
router.get('/total-amount', async (req, res) => {
    try{
        let sum = await Ordered_Products.sum('total_price');
        res.json({
            total_price: sum
        })
    }catch(e){
        res.status(500).json({
            error: e.message
        })
    }   
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
    
        // Get all existing orders for the invoice
        const existingOrders = await Ordered_Products.findAll({
            where: { invoice_id: invoiceId }
        });
    
        const existingMap = new Map();
        existingOrders.forEach(order => {
            existingMap.set(order.product, order);
        });
    
        const incomingMap = new Map();
        orderData.forEach(order => {
            incomingMap.set(order.product, order);
        });
    
        const updatedOrders = [];
    
        // Delete orders from DB that are not in incoming orderData
        for (const existing of existingOrders) {
            if (!incomingMap.has(existing.product)) {
                await Ordered_Products.destroy({
                    where: { invoice_id: invoiceId, product: existing.product }
                });
            }
        }
    
        // Add or update orders
        for (const order of orderData) {
            const existing = existingMap.get(order.product);
    
            if (existing) {
                // If quantity or price changed, update
                if (
                    existing.quantity !== order.quantity ||
                    existing.total_price !== order.total_price
                ) {
                    await Ordered_Products.update(
                        {
                            quantity: order.quantity,
                            total_price: order.total_price
                        },
                        {
                            where: {
                                invoice_id: invoiceId,
                                product: order.product
                            }
                        }
                    );
                }
                updatedOrders.push({
                    invoice_id: invoiceId,
                    product: order.product,
                    quantity: order.quantity,
                    total_price: order.total_price
                });
            } else {
                // If new order, create it
                const created = await Ordered_Products.create({
                    invoice_id: invoiceId,
                    product: order.product,
                    quantity: order.quantity,
                    total_price: order.total_price
                });
                updatedOrders.push(created);
            }
        }
        return res.json({
            message: "Orders processed successfully",
            orders: updatedOrders
        });
    } catch (err) {
        console.error(err);
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
    const { product_name, editedValue} = req.body;

    if(!product_name || !editedValue){
        return res.status(404).json({
            error: "sent data is undefined or empty"
        });
    }
    try{
        const updatedCount = await Ordered_Products.update({ product: editedValue.toLowerCase().trim() }, {
            where: { product: product_name.toLowerCase().trim() }
        });
        if(updatedCount.length === 0){
            return res.json({
                error: "product didn't exists in any order"
            })
        }
         const productsInOrder = await Ordered_Products.findAll({
            where: { product: editedValue.toLowerCase() }
        })
        await Promise.all(productsInOrder.map(async (order) => {
            const item = await Products.findOne({
                where: { product_name: editedValue.toLowerCase()}
            });
            return await Ordered_Products.update({
                total_price: order.quantity*item.price
            }, {
                where: { id: order.id}
            })
        }));
        return res.json({
            message: "Product updated successfully"
        });
    }
    catch(e){
        return res.json({
            error: "Internal server error: " + e.message
        })
    }
})
module.exports = router