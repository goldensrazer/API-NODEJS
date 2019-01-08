'use strict';

const mongoose = require('mongoose');
const Order = mongoose.model('Order');

exports.get = async(data) =>{
    var res = await Order
    .find({},'number status custumer items')
    .populate('custumer', 'name')
    .populate('items.product', 'title');
    return res; 
}
exports.create = async(data) =>{
    var order = new Order(data);
    await order.save();
}