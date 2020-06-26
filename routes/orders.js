const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

/* GET all Orders */
router.get('/', function(req, res) {
  database.table(`orders_details as od`)
    .join([
      {
        table: 'orders as o',
        on: `o.id = od.order_id`
      },
      {
        table: 'products as p',
        on: `p.id = od.product_id`
      },
      {
        table: 'users as u',
        on: `u.id = o.user_id`
      }
    ])
    .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
    .sort({id: 1})
    .getAll()
    .then(orders => {
      if(orders.length > 0){
        res.status(200).json(orders);
      }else{
        res.json({message: `No orders found`});
      }
    })
    .catch(err => console.log(err));
});

/*Get a Single Order*/
router.get('/:id', function(req, res) {
  const orderId = req.params.id;
  database.table(`orders_details as od`)
    .join([
      {
        table: 'orders as o',
        on: `o.id = od.order_id`
      },
      {
        table: 'products as p',
        on: `p.id = od.product_id`
      },
      {
        table: 'users as u',
        on: `u.id = o.user_id`
      }
    ])
    .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
    .filter({'o.id': orderId})
    .getAll()
    .then(orders => {
      if(orders.length > 0){
        res.status(200).json(orders);
      }else{
        res.json({message: `No orders found with orderid ${orderId}`});
      }
    })
    .catch(err => console.log(err));
});

/*Place a new Order*/
router.post('/new', function(req, res){
  let {userId, products} = req.body;
  //console.log(userId, products);
  if(userId != null && userId > 0 && !isNaN(userId)){
    database.table('orders')
      .insert({
        user_id: userId
      }).then(newOrderId => {
        if(newOrderId > 0){
          products.forEach(async (p) =>{

            let data =  await database.table('products').filter({id: p.id}).withFields(['quantity']).get();

            let incart = p.incart;

            //Deduct the no. of pieces ordered from the quantity column in database

            if(data.quantity > 0){
               data.quantity = data.quantity - incart;
               if(data.quantity < 0){
                 data.quantity = 0;
                 //return;
               }
            }else{
              data.quantity = 0;
            }

            //INSERT ORDER DETAILS W.R.T THE NEWLY GENERATED ORDER ID
            database.table('orders_details')
              .insert({
                order_id: newOrderId,
                product_id: p.id,
                quantity: incart
              }).then(newId =>{
                database.table('products')
                  .filter({id: p.id})
                  .update({
                    quantity: data.quantity
                  }).then(successNum => {}).catch(err => console.log(err));
              }).catch(err => console.log(err));
          });
        }else{
          res.json({message: `new order failed while adding orders details`, success: false});  
        }
        res.json({
          message: `Order successfully placed with order id ${newOrderId}`,
          success: true,
          order_id: newOrderId,
          products: products
        });
      }).catch(err => console.log(err));
  }else{
    res.json({message: `New order failed`, success: false});
  }
});

/* FAKE PAYMENT GATEWAY CALL */
router.post('/payment', (req, res) => {
  setTimeout(() => {
    res.status(200).json({success: true});
  }, 3000)
});

module.exports = router;
