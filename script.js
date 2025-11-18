// Navigation Menu Toggle (mobile view)
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Form Validation Example (contact form or login form)
function validateForm() {
    let name = document.getElementById("name");
    let email = document.getElementById("email");

    if (name.value.trim() === "") {
        alert("Please enter your name");
        name.focus();
        return false;
    }

    if (email.value.trim() === "") {
        alert("Please enter your email");
        email.focus();
        return false;
    }

    return true;
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Button Animation
const btns = document.querySelectorAll(".btn");
btns.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        btn.classList.add("hovered");
    });
    btn.addEventListener("mouseleave", () => {
        btn.classList.remove("hovered");
    });
});
