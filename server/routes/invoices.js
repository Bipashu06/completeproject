const express = require('express');
const router = express.Router();
const { Invoices, Ordered_Products, Customers } = require('../models');

router.get('/', async (req, res) => {
    const listofinvoices = await Invoices.findAll();
    res.json({
        message: "Invoices fetched",
        invoices: listofinvoices
    });
})

router.post('/', async (req, res) => {
    const invoiceData = req.body;
    if(!invoiceData) return res.json({ error: "invoice data is empty"});
    try{
        const invoice = {
            customer_id: invoiceData.customerId
        }
        let createdInvoice = await Invoices.create(invoice);
        return res.json({
            message: "Invoice added successfully",
            invoice: createdInvoice
        });
    }catch(e){
        return res.json({
            error: "something went wrong:" + e.message
        })
    }
    
})
router.post('/fullorder', async (req, res) => {
    const invoiceData = req.body;
    if(!invoiceData.customerId || !invoiceData.invoiceId) return res.json({
        error: "invoice and cutomer id can't be null"
    })
    try{
        const cutomer = await Customers.findByPk(invoiceData.customerId);
        const orderProducts = await Ordered_Products.findAll({
            where: {
                invoice_id: invoiceData.invoiceId
            }
        });
        return res.json({
            customerDetails: cutomer,
            orderedProducts: orderProducts
        });
    }catch(e){
        return res.json({
            error: e.message
        })
    }
})

router.delete('/', async (req, res) => {
    const { invoice_id } = req.body;
    if(!invoice_id){
        return res.status(404).json({
            error: "Id is null or empty"
        });
    }
    try{
        const result = await Invoices.destroy({
            where: { invoice_id: invoice_id }
        });
        const result1 = await Ordered_Products.destroy({
            where: { invoice_id: invoice_id }
        });
        if (result === 0){
            return res.json({
                message: "Invoice didn't exist in database"
            })
        }
        return res.json({
            message: `Invoice Deleted Successfully`,
            result: result
        })
    }
    catch(e){
        return res.status(500).json({
            error: `Error occured while interacting with database ${e.message}`
        })
    }
})
module.exports = router