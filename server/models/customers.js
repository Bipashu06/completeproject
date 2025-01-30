module.exports = (sequelize, DataTypes) => {

    const Customers = sequelize.define('Customers', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        c_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        street_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING, 
            allowNull: false
        },
        state: {
            type: DataTypes.STRING, 
            allowNull: false
        },
        pin: {
            type: DataTypes.INTEGER, 
            allowNull: false
        },
        phone: {
            type: DataTypes.DOUBLE, 
            allowNull: false
        },
        state_code: {
            type: DataTypes.INTEGER, 
            allowNull: false
        },
        gstin: {
            type: DataTypes.STRING, 
            allowNull: false
        },
        reg_date: {
            type: DataTypes.DATE, 
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },{
        timestamps: false // Disable createdAt and updatedAt
    });

    return Customers
} 