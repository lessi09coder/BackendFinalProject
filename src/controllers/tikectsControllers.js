const { productInCartService } = require('../services/cartsService.js')
const { getProductByIdService, updateProductIdService } = require('../services/productsService.js')
const { pucharseStripe } = require('../config/stripe.js')
const { v4: uuidv4 } = require("uuid");

const purchaseProductsTicket = async (req, res) => {

    try {
        const idCart = req.params.cid
        //console.log(idCart)
        const productsInsideCart = await productInCartService(idCart)
        //console.log("el ARRAY que devuelve es:",productsInsideCart)
        let ticket
        let productToTicket = [];
        let totalPurchase = 0
        let noExistStockTicket
        //recorre los productos en el carrito y para cada uno:
        for (let productsCart of productsInsideCart) {
            let databaseProduct = await getProductByIdService(productsCart.product._id)
            if (productsCart.qt <= databaseProduct.stock) {
                productToTicket.push(productsCart)
                let updateStock = databaseProduct.stock - productsCart.qt
                //console.log(productsCart.product._id, updateStock)
                await updateProductIdService(productsCart.product._id, updateStock)
                totalPurchase += productsCart.qt * productsCart.product.price

            } else {
                noExistStockTicket = productsCart.product.title
            }
        }
        console.log(productToTicket)
        console.log(totalPurchase)

        if (productToTicket.length) {
            //mandar por email luego
            ticket = {
                code: uuidv4(),
                purchase_datetime: new Date(),
                amount: totalPurchase,
                purchaser: req.session?.user
            }
        }


        //ponemos un return ticket?
        res.send({ ticket: ticket, notPurchase: noExistStockTicket })

    } catch (error) {
        console.log(error)
    }

}

const createSessionStripe = async (req, res) => {
    //en el body ponemos idcart
    const productsInsideCart = await productInCartService(idCart)

    const buyStripe = await pucharseStripe(amount, price)
}


module.exports = { purchaseProductsTicket, createSessionStripe }