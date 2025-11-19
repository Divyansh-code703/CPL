/* Product Database */
const products = [
    { id: 1, name: "Classic White T-Shirt", price: 499, category: "men",
      img: "https://i.ibb.co/5GzXkwq/white-shirt.jpg" },

    { id: 2, name: "Women Stylish Top", price: 699, category: "women",
      img: "https://i.ibb.co/PMKxKjK/women-top.jpg" },

    { id: 3, name: "Kids Winter Jacket", price: 899, category: "kids",
      img: "https://i.ibb.co/jTtGkqY/kid-jacket.jpg" },

    { id: 4, name: "Men Black Hoodie", price: 999, category: "men",
      img: "https://i.ibb.co/dBfdtHp/black-hoodie.jpg" }
];

const homePage = document.getElementById("homePage");
const detailPage = document.getElementById("detailPage");
const cartPage = document.getElementById("cartPage");
const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");

let cart = [];

/* Show Products */
function displayProducts(items) {
    productList.innerHTML = "";
    items.forEach(p => {
        productList.innerHTML += `
        <div class="product" onclick="openDetail(${p.id})">
            <img src="${p.img}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button>Add to Cart</button>
        </div>`;
    });
}
displayProducts(products);

/* Search */
function searchProducts(text) {
    const data = products.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase())
    );
    displayProducts(data);
}

/* Filter */
function filterCategory(cat) {
    if (cat === "all") return displayProducts(products);
    const data = products.filter(p => p.category === cat);
    displayProducts(data);
}

/* Product Detail Page */
function openDetail(id) {
    const p = products.find(x => x.id === id);

    homePage.classList.add("hidden");
    cartPage.classList.add("hidden");
    detailPage.classList.remove("hidden");

    detailPage.innerHTML = `
        <button class="back-btn" onclick="goHome()">← Back</button>
        <img class="detail-img" src="${p.img}">
        <h2>${p.name}</h2>
        <p>₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
}

/* Add to Cart */
function addToCart(id) {
    cart.push(products.find(p => p.id === id));
    alert("Added to cart!");
}

/* Open Cart */
function openCart() {
    homePage.classList.add("hidden");
    detailPage.classList.add("hidden");
    cartPage.classList.remove("hidden");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach((item, index) => {
        cartItems.innerHTML += `
            <div>
                ${item.name} – ₹${item.price}
                <button class="close-cart" onclick="removeItem(${index})">Remove</button>
            </div>`;
    });
}

/* Remove item */
function removeItem(i) {
    cart.splice(i, 1);
    openCart();
}

/* Back to Home */
function goHome() {
    detailPage.classList.add("hidden");
    cartPage.classList.add("hidden");
    homePage.classList.remove("hidden");
                                         }
