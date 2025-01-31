const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./models');

const Port = process.env.PORT || 3001;
app.use(cors({
    origin: "https://billingsystem-ljxt.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

const productRouter = require('./routes/products');
app.use('/products', productRouter);

const customerRouter = require('./routes/customers');
app.use('/customers', customerRouter);

const invoicesRouter = require('./routes/invoices');
app.use('/invoices', invoicesRouter);

const orderRouter = require('./routes/orders');
app.use('/orders', orderRouter);

db.sequelize.sync().then(() => {
    app.listen(Port, () => {
        console.log("server is running");
    });
})