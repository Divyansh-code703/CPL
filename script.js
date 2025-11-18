/* ------------------------------------
   Fake Product Database
------------------------------------- */
const products = [
    {
        id: 1,
        name: "Classic White T-Shirt",
        price: 499,
        category: "men",
        img: "https://i.ibb.co/5GzXkwq/white-shirt.jpg"
    },
    {
        id: 2,
        name: "Women Stylish Top",
        price: 699,
        category: "women",
        img: "https://i.ibb.co/PMKxKjK/women-top.jpg"
    },
    {
        id: 3,
        name: "Kids Winter Jacket",
        price: 899,
        category: "kids",
        img: "https://i.ibb.co/jTtGkqY/kid-jacket.jpg"
    },
    {
        id: 4,
        name: "Men Black Hoodie",
        price: 999,
        category: "men",
        img: "https://i.ibb.co/dBfdtHp/black-hoodie.jpg"
    }
];


/* ------------------------------------
   UI Elements
------------------------------------- */
const productList = document.getElementById("productList");
const detailPage = document.getElementById("detailPage");
const homePage = document.getElementById("homePage");
const cartPage = document.getElementById("cartPage");
const cartItems = document.getElementById("cartItems");

let cart = [];


/* ------------------------------------
   Show All Products
------------------------------------- */
function displayProducts(items) {
    productList.innerHTML = "";

    items.forEach(p => {
        productList.innerHTML += `
        <div class="product" onclick="openDetail(${p.id})">
            <img src="${p.img}" />
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button>Add to Cart</button>
        </div>`;
    });
}

displayProducts(products);


/* ------------------------------------
   Search Bar
------------------------------------- */
function searchProducts(value) {
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
    );
    displayProducts(filtered);
}


/* ------------------------------------
   Category Filter
------------------------------------- */
function filterCategory(cat) {
    if (cat === "all") return displayProducts(products);
    const filtered = products.filter(p => p.category === cat);
    displayProducts(filtered);
}


/* ------------------------------------
   Product Detail Page
------------------------------------- */
function openDetail(id) {
    const p = products.find(pro => pro.id === id);

    homePage.classList.add("hidden");
    detailPage.classList.remove("hidden");

    detailPage.innerHTML = `
        <button class="back-btn" onclick="goHome()">← Back</button>
        <img class="detail-img" src="${p.img}">
        <h2>${p.name}</h2>
        <p>Price: ₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
}

function goHome() {
    detailPage.classList.add("hidden");
    cartPage.classList.add("hidden");
    homePage.classList.remove("hidden");
}


/* ------------------------------------
   Add to Cart
------------------------------------- */
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    alert("Added to Cart!");
}


/* ------------------------------------
   Open Cart Page
------------------------------------- */
function openCart() {
    homePage.classList.add("hidden");
    detailPage.classList.add("hidden");
    cartPage.classList.remove("hidden");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<h3>Your cart is empty</h3>";
        return;
    }

    cart.forEach((item, i) => {
        cartItems.innerHTML += `
            <div>
                ${item.name} - ₹${item.price}
                <button class="close-cart" onclick="removeItem(${i})">Remove</button>
            </div>
        `;
    });
}


/* ------------------------------------
   Remove Item from Cart
------------------------------------- */
function removeItem(index) {
    cart.splice(index, 1);
    openCart();
}
