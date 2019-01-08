'use strict';

const mongoose = require('mongoose');
const Custumer = mongoose.model('Custumer');

exports.create = async(data) =>{
    var custumer = new Custumer(data);
    await custumer.save();
}

exports.authenticate = async(data) =>{
    var res = await Custumer.findOne({
       email: data.email,
       password:data.password
    });
       return res; 
}

exports.getById = async(id) =>{
    var res = await Custumer.findById(id);
       return res; 
}
