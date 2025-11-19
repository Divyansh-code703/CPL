
/* ===============================
   PRODUCT DATABASE (30+ ITEMS)
================================ */

const products = [
    // MEN
    { id: 1, name: "Men Classic White Shirt", price: 599, category: "men",
      img: "https://i.ibb.co/ygKcJ4D/white-shirt.jpg",
      desc: "Premium cotton white shirt perfect for office & casual wear." },

    { id: 2, name: "Men Black Hoodie", price: 999, category: "men",
      img: "https://i.ibb.co/5G1W8tW/black-hoodie.jpg",
      desc: "Soft fleece hoodie for winter with premium build quality." },

    { id: 3, name: "Men Blue Denim Jacket", price: 1299, category: "men",
      img: "https://i.ibb.co/pz3GZ6Y/denim-jacket.jpg",
      desc: "Stylish denim jacket with perfect fitting." },

    // WOMEN
    { id: 4, name: "Women Stylish Top", price: 499, category: "women",
      img: "https://i.ibb.co/CtMMVqP/women-top.jpg",
      desc: "Trendy soft-fabric top for daily use." },

    { id: 5, name: "Women Floral Dress", price: 899, category: "women",
      img: "https://i.ibb.co/3Bk6Wdh/floral-dress.jpg",
      desc: "Elegant floral dress perfect for outings & parties." },

    { id: 6, name: "Women Jacket", price: 1199, category: "women",
      img: "https://i.ibb.co/JqgxLx4/women-jacket.jpg",
      desc: "Warm winter jacket with premium material." },

    // KIDS
    { id: 7, name: "Kids Winter Jacket", price: 799, category: "kids",
      img: "https://i.ibb.co/9VKr3vT/kid-jacket.jpg",
      desc: "Soft and warm jacket for kids." },

    { id: 8, name: "Kids T-Shirt Pack", price: 499, category: "kids",
      img: "https://i.ibb.co/L0T11xT/kid-shirt.jpg",
      desc: "Pack of 2 stylish cotton kids t-shirts." },

    { id: 9, name: "Kids Sports Shoes", price: 699, category: "kids",
      img: "https://i.ibb.co/fQ3yCV6/kid-shoes.jpg",
      desc: "Comfortable sports shoes for daily use." },

    // SHOES
    { id: 10, name: "Men Running Shoes", price: 1299, category: "shoes",
      img: "https://i.ibb.co/zFbvw1N/running-shoes.jpg",
      desc: "Lightweight breathable running shoes." },

    { id: 11, name: "Women Sneakers", price: 1199, category: "shoes",
      img: "https://i.ibb.co/7W1t6DQ/women-sneakers.jpg",
      desc: "Trendy sneakers for women." },

    { id: 12, name: "Sneakers Unisex", price: 999, category: "shoes",
      img: "https://i.ibb.co/nzJp1LC/sneakers.jpg",
      desc: "High-quality unisex sneakers for casual wear." },

    // WATCHES
    { id: 13, name: "Men Analog Watch", price: 699, category: "watches",
      img: "https://i.ibb.co/7V1kF7L/watch1.jpg",
      desc: "Elegant analog men’s watch with classic design." },

    { id: 14, name: "Women Stylish Watch", price: 799, category: "watches",
      img: "https://i.ibb.co/ZJ3FcG8/watch2.jpg",
      desc: "Stylish and premium look watch for women." },

    // ELECTRONICS
    { id: 15, name: "Wireless Earbuds", price: 1499, category: "electronics",
      img: "https://i.ibb.co/8xybK2v/earbuds.jpg",
      desc: "High-quality sound with long battery life." },

    { id: 16, name: "Bluetooth Speaker", price: 999, category: "electronics",
      img: "https://i.ibb.co/TmM9xk9/speaker.jpg",
      desc: "Portable speaker with deep bass." },

    { id: 17, name: "Smartwatch", price: 1999, category: "electronics",
      img: "https://i.ibb.co/6Y5tZ84/smartwatch.jpg",
      desc: "Fitness tracking + smart notifications." },

    // EXTRA PRODUCTS
    { id: 18, name: "Men Formal Shirt", price: 699, category: "men",
      img: "https://i.ibb.co/9vHkXdg/formal-shirt.jpg",
      desc: "Premium formal slim-fit shirt." },

    { id: 19, name: "Women Jeans", price: 799, category: "women",
      img: "https://i.ibb.co/5WMtFRh/women-jeans.jpg",
      desc: "Stretchable slim-fit jeans." },

    { id: 20, name: "Kids School Bag", price: 499, category: "kids",
      img: "https://i.ibb.co/LchyLxW/bag.jpg",
      desc: "Durable bag for school kids." }
];


/* ===============================
   UI ELEMENTS
================================ */

const homePage = document.getElementById("homePage");
const detailPage = document.getElementById("detailPage");
const cartPage = document.getElementById("cartPage");
const paymentPage = document.getElementById("paymentPage");

const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");

let cart = [];


/* ===============================
   DISPLAY PRODUCTS
================================ */

function displayProducts(items) {
    productList.innerHTML = "";
    items.forEach(p => {
        productList.innerHTML += `
        <div class="product" onclick="openDetail(${p.id})">
            <img src="${p.img}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
        </div>`;
    });
}

displayProducts(products);


/* ===============================
   SEARCH PRODUCTS
================================ */

function searchProducts(text) {
    const result = products.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase())
    );
    displayProducts(result);
}


/* ===============================
   FILTER CATEGORY
================================ */

function filterCategory(cat) {
    if (cat === "all") return displayProducts(products);
    displayProducts(products.filter(p => p.category === cat));
}


/* ===============================
   PRODUCT DETAIL PAGE
================================ */

function openDetail(id) {
    const p = products.find(x => x.id === id);

    homePage.classList.add("hidden");
    cartPage.classList.add("hidden");
    paymentPage.classList.add("hidden");
    detailPage.classList.remove("hidden");

    detailPage.innerHTML = `
        <button class="back-btn" onclick="goHome()">← Back</button>
        <img class="detail-img" src="${p.img}">
        <h2>${p.name}</h2>
        <p>₹${p.price}</p>
        <p class="desc">${p.desc}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="buy-btn" onclick="goToPayment()">Buy Now</button>
    `;
}


/* ===============================
   ADD TO CART
================================ */

function addToCart(id) {
    cart.push(products.find(p => p.id === id));
    alert("Added to cart!");
}


/* ===============================
   OPEN CART
================================ */

function openCart() {
    homePage.classList.add("hidden");
    detailPage.classList.add("hidden");
    paymentPage.classList.add("hidden");
    cartPage.classList.remove("hidden");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach((item, index) => {
        cartItems.innerHTML += `
            <div class="cart-box">
                ${item.name} – ₹${item.price}
                <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
            </div>`;
    });

    cartItems.innerHTML += `<button class="buy-btn" onclick="goToPayment()">Proceed to Pay</button>`;
}


/* ===============================
   REMOVE ITEM
================================ */

function removeItem(i) {
    cart.splice(i, 1);
    openCart();
}


/* ===============================
   PAYMENT PAGE
================================ */

function goToPayment() {
    homePage.classList.add("hidden");
    detailPage.classList.add("hidden");
    cartPage.classList.add("hidden");
    paymentPage.classList.remove("hidden");
}

function confirmOrder() {
    document.getElementById("paySuccess").classList.remove("hidden");
}


/* ===============================
   BACK TO HOME
================================ */

function goHome() {
    detailPage.classList.add("hidden");
    cartPage.classList.add("hidden");
    paymentPage.classList.add("hidden");
    homePage.classList.remove("hidden");
    }
