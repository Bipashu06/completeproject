module.exports = (sequelize, DataTypes) => {

    const Ordered_Products = sequelize.define('Ordered_Products', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        invoice_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },{
        timestamps: false, // Disable createdAt and updatedAt
    })
    return Ordered_Products
}