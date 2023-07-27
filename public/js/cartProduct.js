const addCartProduct = async (cid, pid) => {
  const idCart = cid
  const productId = pid

  console.log(idCart, productId)

  await fetch(`/api/carts/${idCart}/product/${productId}`, {
    method: 'post',
    mode: 'cors',
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.text())
    //.then(response => response.json())
    .then(responseText => console.log(responseText))
    .catch(error => console.error(error));
}


const deleteProductCart = async () => {
  console.log(window.location.href)
  await fetch(`${window.location.href}`, {
    method: "delete",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response.text())
    //.then(response => response.json())
    .then(responseText => console.log(responseText))
    .catch(error => console.error(error));
}

