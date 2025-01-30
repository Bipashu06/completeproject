const express = require('express');
const router = express.Router();
const { Invoices } = require('../models');

router.get('/', async (req, res) => {
    const listofinvoices = await Invoices.findAll();
    res.json({
        message: "Invoices fetched",
        invoices: listofinvoices
    });
})

router.post('/', async (req, res) => {
    const invoiceData = req.body;
    const invoice = {
        customer_id: invoiceData.customerId
    }
    let createdInvoice = await Invoices.create(invoice);
    return res.json({
        message: "Invoice added successfully",
        invoice: createdInvoice
    });
})

router.delete('/', async (req, res) => {
    try{
        const { invoice_id } = req.body;
        if(!invoice_id){
            return res.status(404).json({
                error: "Id is null or empty"
            });
        }
        const result = await Invoices.destroy({
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
            error: `Error occured while interacting with database ${e}`
        })
    }
})
module.exports = router