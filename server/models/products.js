module.exports = (sequelize, DataTypes) => {

    const Products = sequelize.define('Products', {
        product_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        HSN: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
    },{
        timestamps: false // Disable createdAt and updatedAt
    });

    return Products
} 