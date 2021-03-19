exports.updateCart = (req, res, next) => {
  // for the first time creating cart and adding basic object structure
  if (!req.session.cart) {
    req.session.cart = {
      items: {},
      totalQty: 0,
      totalPrice: 0
    };
  }

  const { cart } = req.session;

  // Check if item does not exist in cart
  if (!cart.items[req.body._id]) {
    cart.items[req.body._id] = {
      item: req.body,
      qty: 1
    };
    cart.totalQty += 1;
    cart.totalPrice += parseInt(req.body.price, 10);
  } else {
    cart.items[req.body._id].qty += 1;
    cart.totalQty += 1;
    cart.totalPrice += parseInt(req.body.price, 10);
  }
  return res.json({ totalQty: req.session.cart.totalQty });
};
