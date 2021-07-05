const cartbtn = document.querySelector('.cart-btn');
const closeCartbtn = document.querySelector('.close-cart');
const clearCartbtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');

let cart = [];
let buttonDOM = [];
// getting products
class Products{
    async getProducts() {
        try{
            let result = await fetch("./products.json");
            let data = await result.json();
            let products = data.items

            products = products.map(item => {
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        }catch(error){
            console.log(error)
        }
    }
}
//display product
class UI{
    displayProducts(products) {
       let result = '';
       products.forEach(product=>{
           result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart">
                            add To cart
                        </i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>`
       })
       productsDom.innerHTML = result;
    }
    getBackButton() {
        const bagBtn = [...document.querySelectorAll('.bag-btn')];
        buttonDOM = bagBtn;
        bagBtn.forEach(btn=>{
            let id = btn.dataset.id
            let inCart = cart.find(item=>item.id===id);
            if(inCart){
                btn.innerText = "In cart";
                btn.disabled = true;
            }
            btn.addEventListener('click',(event)=>{
                event.target.innerText = "In cart";
                btn.disabled = true;
                //get product from product
                let cartItem = {...Storage.getProduct(id),amount:1};
                //add product to cart
                cart = [...cart,cartItem];
                // save cart in localStorage
                Storage.saveCart(cart);
                //set cart value
                this.setCartValue(cart);
                //dispaly cart Item
                this.addCartItem(cartItem);
                //show cart
                this.showCart();
            })
        })
    }
    setCartValue(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item=>{
            tempTotal +=item.price*item.amount;
            itemsTotal +=item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up"  data-id=${item.id}></i>
            <p class="item-amount"> ${item.amount}</p>
            <i class="fas fa-chevron-down"  data-id=${item.id}></i>
        </div>`;
         cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg') 
        cartDom.classList.add('showCart') 
    }
    setupAPP() {
        cart = Storage.getCart()
        this.setCartValue(cart);
        this.populateCart(cart);
        cartbtn.addEventListener('click',this.showCart)
        closeCartbtn.addEventListener('click',this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(item=>this.addCartItem(item))
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg') 
        cartDom.classList.remove('showCart') 
    }
    cartLogic(){
        clearCartbtn.addEventListener('click',()=>{
            this.clearCart();
        }); 
    }
    clearCart(){
        let cartItem = cart.map(item=>item.id);
        cartItem.forEach(id=>this.removeItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item=>item.id!==id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart">
            add To cart
        </i>`;
    }
    getSingleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage {
    static saveProduct(products) {
        localStorage.setItem('products',JSON.stringify(products));
    }
    static getProduct(id) {
        let products =  JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [] ;
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    ui.setupAPP();
    const products = new Products();
    /*getProduct*/
    products.getProducts().then(products=>{
        ui.displayProducts(products)
        Storage.saveProduct(products)
    }).then(()=>{
        ui.getBackButton();
        ui.cartLogic();
    })
})