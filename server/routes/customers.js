const express = require('express');
const router = express.Router();
const { Customers } = require('../models');

router.get('/', async (req, res) => {
    const listofcustomers = await Customers.findAll();
    res.json({
        message: "Customers fetched",
        customers: listofcustomers
    });
})

router.post('/', async (req, res) => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    const customerData = req.body;
    const customer = {
        c_name: customerData.companyName,
        street_name: customerData.street,
        city: customerData.city,
        state: customerData.state,
        pin: customerData.pin,
        phone: customerData.phone,
        reg_date: formattedDate,
        state_code: customerData.stateCode,
        gstin: customerData.gstin
    }
    await Customers.create(customer);
    res.json({
        message: "Customer added successfully"
    })
})

router.delete('/', async (req, res) => {
    try{
        const { id } = req.body;
        if(!id){
            return res.status(404).json({
                error: "Id is null or empty"
            });
        }
        const result = await Customers.destroy({
            where: { id }
        });
        if (result === 0){
            return res.json({
                message: "Customer didn't exist in database"
            })
        }
        return res.json({
            message: `Customer Deleted Successfully`,
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
    const { id, c_name, street_name, city, state, state_code, phone, pin, gstin } = req.body;
    if( !id || !c_name || !street_name || !city ||
       !state || !state_code || !phone || !pin || !gstin){
        return res.status(404).json({
            error: "Something is missing"
        })
    }
    try{
        const customer = await Customers.findByPk(id);
        if(!customer){
            return res.status(404).json({
                error: "user didn't exist"
            });
        }
        customer.c_name = c_name;
        customer.street_name = street_name;
        customer.city = city;
        customer.state = state;
        customer.state_code = state_code;
        customer.phone = phone;
        customer.pin = pin;
        customer.gstin = gstin;

        await customer.save();

        return res.status(200).json({
            message: "Customer edited successfully"
        })
    }
    catch(e) {
        return res.status(500).json({
            error: "Internal server error occured"
        })
    }
    
})
module.exports = router
