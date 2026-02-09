const Product = require('../models/productModel');

exports.increaseStock = async (productId, quantity, session) => {
  await Product.updateOne(
    { _id: productId },
    { $inc: { stock: quantity } },
    { session }
  );
};

exports.decreaseStock = async (productId, quantity, session) => {
  await Product.updateOne(
    { _id: productId },
    { $inc: { stock: -quantity } },
    { session }
  );
};
