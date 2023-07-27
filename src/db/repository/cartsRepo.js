const CartDAO = require('../DAO/carts.dao.js');
const cartDAO = new CartDAO();

class CartRepository {

    createCartRepo = async () => {
        const cart = await cartDAO.createCart();
        return cart;
    };

    getCartRepo = async (e) => {
        const cart = await cartDAO.getCarts(e);
        return cart;
    };

    addProductToCartRepo = async (cid, pid) => {
        const cart = await cartDAO.addProductToCart(cid, pid)
        return cart
    }
    getProductsInCartRepo = async (cid) => {
        const cart = await cartDAO.getProductsInCart(cid);
        return cart;
    }
    delteAllProductsInCartRepo = async (cid) => {
        const cart = await cartDAO.delteAllProductsInCart(cid)
        return cart
    }


}

module.exports = CartRepository