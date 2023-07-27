const CartModel = require("../model/carts.model.js");
const CartsDTO = require("../DTO/cartsDto.js")

const mongoose = require("mongoose");


const MONGODB = process.env.MONGODB
//const productDAO = new ProductsMongoDb('products', productSchema)

mongoose.connect(MONGODB, error => {
    if (error) {
        console.log('Cannot connect to db')
        process.exit()
    }
});


class CartDAO {

    async getCarts() {
        try {
            let carts = await CartModel.find().lean()            
            return carts
        } catch (error) {
            console.log(error)
        }
    }

    async createCart() {
        try {
            let result = await CartModel.create({})
            //let newCart = result.save()
            return result
        } catch (error) {
            console.log(error)
        }
    }

    async addProductToCart(cid, pid) {
        try {
            const cartById = await CartModel.findOne({ _id: cid })
            if (!cartById) {
                return `no existe un carrito con el id: ${cid}`
            }

            /* const productById = await productDAO.getProductById({ _id: pid })
            if (!productById) {
                return `no existe un producto con el id: ${pid}`
            } */

            const indexPro = cartById.products.findIndex(e => String(e.product) === pid)
            if (indexPro >= 0) {
                cartById.products[indexPro].qt += 1
            } else {
                const newProd = { product: pid }
                cartById.products.push(newProd)
            }

            const saveCart = await cartById.save()
            return saveCart.products
        }
        catch (error) {
            console.log(error)
        }
    }

    async getProductsInCart(idCart) {
        try {
            const cartById = await CartModel.findOne({ _id: idCart }).lean()
                .populate("products.product")
            if (!cartById) {
                return `no existe un carrito con el id: ${idCart}`
            }
            const prod = cartById.products
            return prod

        } catch (error) {
            console.log(error)
        }
    }

    async delteAllProductsInCart(cid) {
        try {
            const cart = await CartModel.findOne({ _id: cid })
            if (!cart) {
                return { error: `No existe un cart con id: ${id}` }
            }
            await CartModel.updateOne({ _id: cid }, { $set: { products: [] } })
            return { eliminado: `Los productos del carrito con id: ${cid} han sido eliminados correctamente` }
        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = CartDAO