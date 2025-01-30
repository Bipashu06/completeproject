module.exports = (sequelize, DataTypes) => {

    const Invoices = sequelize.define('Invoices', {
        
        invoice_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reg_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },{
        timestamps: false,
    });

    return Invoices
}