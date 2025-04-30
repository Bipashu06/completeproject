const express = require('express');
const router = express.Router();
const { Customers } = require('../models');
const { Op } = require('sequelize');
router.get('/', async (req, res) => {
    const listofcustomers = await Customers.findAll();
    res.json({
        message: "Customers fetched",
        customers: listofcustomers
    });
})

router.post('/', async (req, res) => {
    if(req.body.companyName === "" || req.body.street === "" || req.body.city === "" ||
       req.body.state === "" || req.body.pin ===0  || req.body.phone === 0 || req.body.stateCode === 0 || req.body.gstin === ""){
        return res.json({
            error: "Something is missing"
        })
       }
    try{
        const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    const customerData = req.body;
    const existingCustomer = await Customers.findOne({
        where: {
            [Op.or]: [
                {gstin: customerData.gstin.trim().toLowerCase()},
                {phone: customerData.phone}]    
        }
    });
    if(existingCustomer){
        return res.json({
            error: "Customer with same phone or gstin already exists"
        })
    }
    const customer = {
        c_name: customerData.companyName.trim().toLowerCase(),
        street_name: customerData.street.trim().toLowerCase(),
        city: customerData.city.trim().toLowerCase(),
        state: customerData.state.trim().toLowerCase(),
        pin: customerData.pin,
        phone: customerData.phone,
        reg_date: formattedDate,
        state_code: customerData.stateCode,
        gstin: customerData.gstin.trim().toLowerCase()
    }
    await Customers.create(customer);
    res.json({
        message: "Customer added successfully"
    })
    }catch(e){
        return res.json({
            error: e.message
        })
    }
    
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
        return res.json({
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
        customer.c_name = c_name.trim().toLowerCase();
        customer.street_name = street_name.trim().toLowerCase();
        customer.city = city.trim().toLowerCase();
        customer.state = state.trim().toLowerCase();
        customer.state_code = state_code;
        customer.phone = phone;
        customer.pin = pin;
        customer.gstin = gstin.trim().toLowerCase();

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
