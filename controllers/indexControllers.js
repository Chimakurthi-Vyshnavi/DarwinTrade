const Order = require('../models/Order')
const ProductSchema = require('../models/Product')   

module.exports.getLogin= async(req, res) => {
    await res.redirect('/login')
}

module.exports.getHome = async(req, res) => {
    const newArrivals = await ProductSchema.dummyProduct.find().sort({ publishedAt: -1 }).limit(4)
    const agg = [
        { '$unwind': { 'path': '$items' } }, 
        { '$lookup': { 'from': 'Product_Details', 'localField': 'items.productId', 'foreignField': '_id', 'as': 'product' }}, 
        { '$group': { '_id': '$product._id', 'quantity': { '$sum': '$items.quantity' }}}, 
        { '$sort': { 'quantity': -1 }}, 
        { '$limit': 4 },
        { '$lookup': { 'from': 'Product_Details', 'localField': '_id', 'foreignField': '_id', 'as': 'product' }}, 
      ]
    const hotsales = await Order.aggregate(agg)
    res.render("home", {newArrivals, hotsales}) 
}

module.exports.getAbout = async(req, res) => {
    res.render('about')
}

module.exports.getContact = async(req, res) => {
    res.render('contact')
}

module.exports.getVendor = async(req, res) => {
    const categories = await ProductSchema.dummyProductCategories.find()
    res.render('vendor', {categories})
}

module.exports.getPageNotFound = async(req, res) => {
    res.render('pageNotFound')
}