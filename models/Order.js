const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee_Details', 
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product_Details',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            imageUrl: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    placedAt: {
        type: Date,
        default: Date.now
    }
},  {collection: "Orders"});

module.exports = mongoose.model('Orders', OrderSchema);

