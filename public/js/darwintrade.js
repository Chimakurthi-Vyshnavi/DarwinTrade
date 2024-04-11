// import { initFirebase } from '../../web/js/push-notifications.ts'
const form = document.querySelector('form')
const emailError = document.querySelector('.emailError')
const passwordError = document.querySelector('.passwordError')
const otpError = document.querySelector('.otpError')
let product_selected = ''
let menu_selected = 'home'
let category_selected = '*'
let brand_selected = ''
let thisPage = 1;
let limit = 12;
var list;

// header
document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const url_ = currentPath.split('/')
    menu_selected = url_[url_.length - 1]
    const menu_bar = [...document.getElementsByClassName('menu_toggler')]
    menu_bar.forEach(bar => {
        if (bar.dataset.filter == menu_selected) bar.classList.add('active')
        else bar.classList.remove('active')
        bar.addEventListener('click', async () => {
            try {
                const res = await fetch(`/${bar.dataset.filter}`)
                if (!res.ok) {
                    display(`Cannot get ${bar.dataset.filter} page.<br> Please try again later`, 'error')
                    return
                }
                this.location.assign(`/${bar.dataset.filter}`)
            } catch (error) {
                display(`Cannot get ${bar.data.filter} page.<br> Please try again later`, 'error')
            }
        })
    })
});

if (window.location.href.endsWith(`${window.location.port}/shop`)) {
    async function displayAllProducts() {
        try {
            var res = await fetch(`/products/sort/1`)
            const products = await res.json()
            displayProducts(products);
            list = [...document.getElementsByClassName('category_products')]
            loadItem()
        } catch (error) {
            console.log(error)
            display(`Server is busy.<br> Please try again later`, 'error')
        }
    }
    displayAllProducts()
}

// login page
const loginForm = [...document.getElementsByClassName('loginForm')]
if (loginForm.length) {
    loginForm[0].addEventListener('submit', async (e) => {
        e.preventDefault()
        emailError.textContent = ""
        passwordError.textContent = ""
        const email = form.email.value
        const password = form.password.value
        try {
            const res = await fetch('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            if (data.error) {
                emailError.textContent = data.error.email
                passwordError.textContent = data.error.password
            }
            else if (data.vendor) location.assign("/vendor")
            else if (data.employee) location.assign('/home')
        } catch (err) {
            console.log(err)
        }
    })
}

// forgot password page
const forgotForm = [...document.getElementsByClassName('forgotPasswordForm')]
if (forgotForm.length) {
    forgotForm[0].addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = form.email.value
        try {
            const res = await fetch('/forgotpassword', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            if (data.error) emailError.textContent = data.error
            else {
                // const res = await fetch('/sendNotification', {
                //     method: 'POST',
                //     body: JSON.stringify({ data: {message: ""}, token: "" }),
                //     headers: { 'Content-type': 'application/json' }
                // })
                location.assign('/verify')
            }
        } catch (err) {
            console.log(err)
        }
    })
}

// verify OTP page
const verifyForm = [...document.getElementsByClassName('verifyForm')]
if (verifyForm.length) {
    verifyForm[0].addEventListener('submit', async (e) => {
        e.preventDefault()
        const otp = form.otp.value
        const password = form.password.value
        const password_ = form.password_.value
        otpError.textContent = ''
        passwordError.textContent = ''
        if (!password.trim()) {
            passwordError.textContent = "Password cannot be empty"
            return
        }
        try {
            const res = await fetch('/verify', {
                method: 'POST',
                body: JSON.stringify({ otp, password, password_ }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            console.log(data)
            if (data.error == 'incorrect otp') otpError.textContent = 'Please enter the correct OTP'
            else if (data.error == 'incorrect passwords') passwordError.textContent = "Passwords didn't match. Try again."
            else if (data.success) location.assign('/login')
        } catch (error) {
            console.log(error)
        }
    })
}

// home page
function displayAlert(title, callback) {
    Swal.fire({
        title: title,
        showClass: {
            popup: 'animate__animated animate__bounceIn'
        },
        allowOutsideClick: true,
        backdrop: true,
        confirmButtonClass: 'btn btn-primary',
        buttonsStyling: false
    })
    .then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

function display(title, icon, callback) {
    Swal.fire({
        title: title,
        icon: icon,
        allowOutsideClick: true,
        backdrop: true,
        confirmButtonClass: 'btn btn-primary',
        buttonsStyling: false,
        customClass: {
            container: 'custom-container',
            backdrop: 'custom-backdrop'
        }
    })
    .then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

$('.product__item__pic').on('click', function () {
    product_selected = $(this).attr('id')
    $.ajax({
        url: `/products/${product_selected}`,
        method: 'GET',
        success: function (response) {
            location.assign(`/products/${product_selected}`)
        },
        error: function (xhr, status, error) {display(`Cannot get product details page.<br> Please try again later`, 'error') }
    });
})

const opts = Array.from(document.getElementsByClassName('product_toggler'));
opts.forEach(opt => {
    opt.addEventListener('click', () => {
        const datafilter = opt.getAttribute('data-filter');
        if (datafilter == '*') {
            $('._product_').show();
        }
        else {
            $('._product_').hide();
            $(`._product_[data-filter*="${datafilter}"]`).show();
        }
    });
})

// shop page
const Form = [...document.getElementsByClassName('searchForm')]
if (Form.length) {
    Form[0].addEventListener('submit', async (e) => {
        const value = Form[0].search.value;
        e.preventDefault()
        const res = await fetch('/search', {
            method: 'POST',
            body: JSON.stringify({ search: value }),
            headers: { 'Content-type': 'application/json' }
        })
        const products = await res.json()
        if (products.error) display(`Server is Busy.<br> Please try again later.`, 'warning')
        else if (products.length) displayProducts(products)
        else {
            let product_container = document.getElementsByClassName('product_container')[0]
            while (product_container.firstChild) {
                product_container.removeChild(product_container.lastChild)
            }
            const p = document.createElement('h5')
            p.textContent = 'No Products Found'
            product_container.appendChild(p)
            document.querySelector('.product__pagination').innerHTML = '';
        }
    })
}

async function checkProductInWishlist(productId) {
    try {
        const response = await fetch(`/wishlist/check/${productId}`);
        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error(error);
        return false;
    }
}

function displayProducts(products) {
    document.addEventListener('DOMContentLoaded', function () { })
    let product_container = document.getElementsByClassName('product_container')[0]
    while (product_container.firstChild) {
        product_container.removeChild(product_container.lastChild)
    }
    for (let i = 0; i < products.length; i++) {

        const product_card = document.createElement('div');
        product_card.classList.add('product__card')
        product_card.classList.add('col-lg-3', 'col-md-6', 'col-sm-6', 'category_products')
        product_card.dataset.filter = `${products[i].brand} ${products[i].category}`;
        product_card.dataset.value = products[i].price
        product_card.setAttribute('value', products[i].price)
        product_card.setAttribute('id', products[i].id)
        const product_item = document.createElement('div');
        product_item.classList.add('product__item')

        const product_hover = document.createElement('ul')
        product_hover.classList.add('product__hover')

        const heart = document.createElement('li')
        heart.classList.add('wish')
        const heart_ = document.createElement('a')
        const heart_img = document.createElement('i')
        heart_img.classList.add('fa', 'fa-heart')

        heart_.appendChild(heart_img)
        heart.appendChild(heart_)
        product_hover.appendChild(heart)

        function updateHeartColor(isInWishlist) {
            if (isInWishlist) {
                heart_img.classList.add('text-danger');
            } else {
                heart_img.classList.remove('text-danger');
            }
        }
        const productId = products[i]._id;
        const productName = products[i].title;
        const productPrice = products[i].price;
        const productImageUrl = products[i].thumbnail;

        const data = {
            productId: productId,
            name: productName,
            price: productPrice,
            imageUrl: productImageUrl
        };

        checkProductInWishlist(productId).then(isInWishlist => {
            updateHeartColor(isInWishlist);
            heart_.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                heart_img.classList.toggle('text-danger');
                const isInWishlist = heart_img.classList.contains('text-danger');
                const endpoint = isInWishlist ? '/wishlistadd' : '/wishlistremove';
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to update wishlist');
                        }
                        return response.json();
                    })
                    .then(data => {
                        displayAlert(data.message);
                    })
                    .catch(error => {
                        console.error(error.message);
                        displayAlert('Failed to Update Wishlist!');
                    });
            });
        });

        const add = document.createElement('a')
        add.href = "javascript:void(0);"
        add.dataset.id = products[i]._id
        add.dataset.name = products[i].title
        add.dataset.price = products[i].price
        add.dataset.image = products[i].thumbnail
        add.classList.add('add-cart')
        add.innerHTML = '+Add To Cart'

        const product_item_pic = document.createElement('div');
        product_item_pic.classList.add('product__item__pic', 'set-bg')
        product_item_pic.style.backgroundImage = `url(${products[i].thumbnail})`
        product_item_pic.setAttribute('id', products[i].id)

        const product_item_text = document.createElement('div');
        product_item_text.classList.add('product__item__text')

        const title = document.createElement('h6')
        title.innerHTML = products[i].title

        const rating = document.createElement('div');
        rating.classList.add('rating')
        const rate = document.createElement('strong')
        rate.innerHTML = products[i].rating
        rating.appendChild(rate)
        for (let j = 1; j <= 5; j++) {
            const newElement = document.createElement('i');
            const space = document.createTextNode(' ');
            if (j <= Math.floor(products[i].rating)) newElement.className = 'fa fa-star text-warning';
            else if ((j - products[i].rating) <= 0.5) newElement.className = 'fa fa-star-half-alt text-warning';
            else newElement.className = 'fa fa-star-o';
            rating.appendChild(newElement)
            rating.appendChild(space)
        }

        const price = document.createElement('h5')
        price.innerHTML = `${products[i].price} points`

        product_item_pic.appendChild(product_hover)
        product_item_text.appendChild(title)
        product_item_text.appendChild(rating)
        product_item_text.appendChild(add)
        product_item_text.appendChild(price)
        product_item.appendChild(product_item_pic)
        product_item.appendChild(product_item_text)
        product_card.appendChild(product_item)
        product_container.appendChild(product_card)

        product_item_pic.addEventListener('click', async () => {
            product_selected = products[i].id
            try {
                const res = await fetch(`/products/${product_selected}`)
                if (!res.ok) {
                    display(`Cannot get product details page.<br> Please try again later`, 'error')
                    return
                }
                location.assign(`/products/${product_selected}`)
            } catch (error) {
                console.log(error)
                display(`Cannot get product details page.<br> Please try again later`, 'error')
            }
        })
    }
    list = [...document.getElementsByClassName('product__card')]
    loadItem()
}

const categories = Array.from(document.getElementsByClassName('category_toggler'));
categories.forEach(category => {
    category.addEventListener('click', async () => {
        try {
            const option = document.getElementById("sort").value
            const category_name = category.getAttribute('data-filter')
            brand_selected = ''
            category_selected = category_name
            if (category_name == '*') {
                var res = await fetch(`/products/sort/${option}`)
                $('.brand_toggler').show()
            }
            else {
                var res = await fetch(`/products/category/${category_name}/sort/${option}`)
                $('.brand_toggler').hide()
                $(`.brand_toggler[data-filter*="${category_name}"]`).show()
            }
            const products_ = await res.json()
            if (products_.error) {
                display(`Connection Refused.<br> Please try again later.`, 'error')
                return
            }
            thisPage = 1
            displayProducts(products_)
            list = [...document.getElementsByClassName('category_products')]
            loadItem()
        }
        catch (error) {
            display(`Server is Busy.<br> Please try again later.`, 'warning')
        }
    })
})

const brands = Array.from(document.getElementsByClassName('brand_toggler'));
brands.forEach(brand => {
    brand.addEventListener('click', async () => {
        try {
            const option = document.getElementById("sort").value
            const brand_name = brand.textContent.trim()
            brand_selected = brand_name
            if (category_selected == '*') { var res = await fetch(`/products/brand/${brand_name}/sort/${option}`) }
            else { var res = await fetch(`/products/category/${category_selected}/brand/${brand_name}/sort/${option}`) }
            const products = await res.json()
            if (products.error) {
                display(`Connection Refused.<br> Please try again later.`, 'error')
                return
            }
            thisPage = 1
            displayProducts(products)
            list = [...document.getElementsByClassName('category_products')]
            loadItem()
        }
        catch (error) {
            display(`Server is Busy.<br> Please try again later.`, 'warning')
        }
    })
})

const tags = Array.from(document.getElementsByClassName('tags_toggler'))
tags.forEach(tag => {
    tag.addEventListener('click', async () => {
        try {
            const option = document.getElementById("sort").value
            const tag_name = tag.innerHTML.trim()
            var res = await fetch(`/products/tag/${tag_name}/sort/${option}`)
            const products = await res.json()
            if (products.error) {
                display(`Connection Refused.<br> Please try again later.`, 'error')
                return
            }
            thisPage = 1
            displayProducts(products)
        } catch (error) {
            display(`Server is Busy.<br> Please try again later.`, 'warning')
        }
    })
})

$("#sort").change(async()=>{
    try {
        const option = document.getElementById("sort").value
        if (category_selected == '*') {
            if (brand_selected !== '') { var res = await fetch(`/products/brand/${brand_selected}/sort/${option}`) }
            else { var res = await fetch(`/products/sort/${option}`) }
        } else {
            if (brand_selected !== '') { var res = await fetch(`/products/category/${category_selected}/brand/${brand_selected}/sort/${option}`) }
            else { var res = await fetch(`/products/category/${category_selected}/sort/${option}`) }
        }
        const products = await res.json()
        if (products.error) {
            display(`Connection Refused.<br> Please try again later.`, 'warning')
            return
        }
        displayProducts(products)
    } catch (error) {
        display(`Server is Busy.<br> Please try again later.`, 'warning')
    }

})

function loadItem() {
    let beginGet = limit * (thisPage - 1);
    let endGet = limit * thisPage - 1;
    const results = document.getElementsByClassName('shop__product__option__left')[0]
    while (results.firstChild) { results.removeChild(results.lastChild) }
    const display = document.createElement('p')
    display.innerHTML = `Showing ${beginGet + 1}–${endGet > list.length ? list.length : endGet} of ${list.length} results`
    results.appendChild(display)
    list.forEach((item, key) => {
        if (key >= beginGet && key <= endGet) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    })
    listPage();
}

function listPage() {
    let count = Math.ceil(list.length / limit);
    document.querySelector('.product__pagination').innerHTML = '';

    if (thisPage != 1) {
        let prev = document.createElement('a');
        prev.innerHTML = '<-'
        prev.setAttribute('onclick', "changePage(" + (thisPage - 1) + ")");
        document.querySelector('.product__pagination').appendChild(prev);
    }

    for (let i = 1; i <= count; i++) {
        let newPage = document.createElement('a');
        newPage.innerText = i;
        if (i == thisPage) {
            newPage.classList.add('active');
        }
        newPage.setAttribute('onclick', "changePage(" + i + ")");
        document.querySelector('.product__pagination').appendChild(newPage);
    }

    if (thisPage != count) {
        let next = document.createElement('a');
        next.innerHTML = '->'
        next.setAttribute('onclick', "changePage(" + (thisPage + 1) + ")");
        document.querySelector('.product__pagination').appendChild(next);
    }
}

function changePage(i) {
    thisPage = i;
    loadItem();
}

// product page
const pics = [...document.getElementsByClassName('tabs_toggler')]
pics.forEach(pic => {
    pic.addEventListener('click', () => {
        const tab_content = document.getElementsByClassName('tab-content')[0]
        while (tab_content.firstChild) { tab_content.removeChild(tab_content.lastChild) }
        const tab = pic.id
        const tab_pane = document.createElement('div')
        tab_pane.className = 'tab-pane'
        tab_pane.id = `tabs-${tab}`
        tab_pane.role = "tabpanel"
        const product_details = document.createElement('div')
        product_details.className = "product__details__pic__item"
        const img = document.createElement('img')
        img.src = `${pic.dataset.filter}`
        product_details.appendChild(img)
        tab_pane.appendChild(product_details)
        tab_content.appendChild(tab_pane)
    })
})

document.addEventListener('DOMContentLoaded', function () {
    const tabTogglers = document.querySelectorAll('.tabs_toggler');
    tabTogglers.forEach(function (toggler) {
        toggler.addEventListener('click', function () {
            const targetId = this.getAttribute('id');
            const targetTab = document.querySelector(`#tabs-${targetId}`);
            if (targetTab) {
                document.querySelectorAll('.tab-pane').forEach(function (tabContent) {
                    tabContent.classList.remove('active');
                });
                targetTab.classList.add('active');
            } else {
                console.error('Tab content not found for target:', targetId);
            }
        });
    });
});

// wishlist page
$(document).on('click', '.far.fa-times-circle', function (event) {
    event.preventDefault();
    const productId = $(this).closest('.product__card').data('product-id');
    $.ajax({
        url: '/wishlistremove',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productId: productId }),
        success: function (response) {
            display(response.message, 'error');
            $(this).closest('.product__card').remove();
            document.querySelectorAll(`[data-product-id="${productId}"]`)[0].remove();
        },
        error: function (xhr, status, error) {
            console.error(error);
            display('Failed to Remove Product from Wishlist!', 'error');
        }
    });
});

// cart page
$(document).ready(function () {
    const currentPath = window.location.pathname;
    if (currentPath.includes('cart') || currentPath.includes('orders')) $('.pro-qty-2').off('click');
});

$(document).on('click', '.add-cart', function (event) {
    event.stopPropagation();
    event.preventDefault();
    const productId = $(this).data('id');
    const productName = $(this).data('name');
    const productPrice = $(this).data('price');
    const productImageUrl = $(this).data('image');
    var proQty = $('.pro-qty');
    var productQuantity = parseFloat(proQty.parent().find('input').val())
    if (isNaN(productQuantity)) {
        productQuantity = 1;
    }
    $.ajax({
        url: '/checkQuantity',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productId: productId }),
        success: function (response) {
            if (response.quantity === response.cartQuantity) {
                display('Product is Out of Stock!', 'error');
            }
            else if (productQuantity <= response.quantity) {
                $.ajax({
                    url: '/cart',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        productId: productId,
                        name: productName,
                        price: productPrice,
                        imageUrl: productImageUrl,
                        quantity: productQuantity
                    }),
                    success: function (response) { display('Item Added to Cart!', 'success'); },
                    error: function (xhr, status, error) { display('Failed to Add Item to Cart!', 'error'); }
                });
            } else display('Product is Out of Stock!', 'error');
        },
        error: function (xhr, status, error) { display('Failed to Check Product Quantity!', 'error') }
    });
});

$('.cart__close').click(function (event) {
    event.preventDefault();
    const productId = $(this).find('i').data('product-id');
    const price = parseInt($(this).data('price'))
    $.ajax({
        url: '/removeCartProduct',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productId: productId }),
        success: function (response) {
            display('Product Removed from Cart!', 'success')
            $(this).closest('tr').remove();
            let points = parseInt(document.getElementById('productPrice').innerHTML)
            points = points - price
            document.getElementById('productPrice').innerHTML = `${points} points`
            document.getElementsByClassName(productId)[0].remove()
        },
        error: function (xhr, status, error) { display('Failed to Remove Product from Cart!', 'error') }
    });
});

$('#proceed-to-checkout-btn').click(async function (event) {
    event.preventDefault();
    try {
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const data = await response.json();
        if (response.status === 200) window.location.href = '/checkout';
        else display(data.error, 'warning');
    } catch (error) {
        console.error('Error:', error);
    }
});

// checkout page
function retrieveCartItems() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/cartProducts',
            success: function (response) { resolve(response.cartItems); },
            error: function (error) { reject(error); }
        });
    });
}

$('.place_order').on('click', async function (event) {
    event.preventDefault();
    try {
        const cartItems = await retrieveCartItems();
        const formData = {
            firstName: $('input[name=firstName]').val().trim(),
            lastName: $('input[name=lastName]').val().trim(),
            streetAddress: $('input[name=streetAddress]').val().trim(),
            city: $('input[name=city]').val().trim(),
            state: $('input[name=state]').val().trim(),
            country: $('input[name=country]').val().trim(),
            postcode: $('input[name=postcode]').val().trim(),
            phone: $('input[name=phone]').val().trim(),
            email: $('input[name=email]').val().trim(),
            cartItems: JSON.stringify(cartItems)
        };
        for (const prop in formData) {
            if (!formData[prop]) {
                display('Please fill in all required fields!', 'warning');
                return;
            }
        }
        if (!formData.cartItems || formData.cartItems.trim() === '') {
            display(`Cart is empty. <br> Please add items to your cart before placing an order.`, 'warning');
            return
        }
        $.ajax({
            url: '/check',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                response.stockStatus.forEach(item => {
                    if (item.status === 'insufficient') {
                        if (item.stock === 0) {
                            display(`${item.productName} is Out of Stock. <br> Please try again later`, 'warning');
                        } else {
                            display(`Stock for ${item.productName} is ${item.stock}. <br>You have ${item.cartQuantity} in your cart.`, 'warning');
                        }
                    }
                });
                const allProductsSufficient = response.stockStatus.every(item => item.status === 'sufficient');
                if (allProductsSufficient) {
                    $.ajax({
                        type: 'POST',
                        url: '/mail',
                        contentType: 'application/json',
                        data: JSON.stringify(formData),
                        success: function (response) {
                            if (response.success) {
                                display('Order Placed Successfully!', 'success', ()=>{ location.assign('/home') })
                            } else {
                                display(`Failed to Place Order!<br> Please try again later.`, 'error');
                            }
                        },
                        error: function (xhr, status, error) {
                            if (xhr.status === 400) {
                                var response = JSON.parse(xhr.responseText);
                                display(`Failed to Place Order!<br>Please try again later.`, 'error');
                            }
                        }
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('Error checking product quantity:', error);
                display(`Failed to Check Product Quantity!<br>Please try again later.`, 'warning');
            }
        });
    } catch (error) { display(`Failed to Retrieve Cart Items!<br>.Please try again later.`, 'warning'); }
});

// contact page
let formSubmitted = false;

const contactForm = [...document.getElementsByClassName('contactForm')]
if (contactForm.length) {
    contactForm[0].addEventListener('submit', function (event) {
        event.preventDefault();
        var nameInput = document.getElementById('nameInput');
        var emailInput = document.getElementById('emailInput');
        var messageInput = document.getElementById('messageInput');
        const contactNameError = document.querySelector('.contactNameError')
        const contactEmailError = document.querySelector('.contactEmailError')
        const contactMessageError = document.querySelector('.contactMessageError')
        var isValid = true;
        contactEmailError.textContent = ''
        contactMessageError.textContent = ''
        contactNameError.textContent = ''

        if (!nameInput.value.trim()) {
            isValid = false;
            contactNameError.textContent = 'Please enter your name.'
        }

        if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
            isValid = false;
            contactEmailError.textContent = 'Please enter a valid email address.'
        }

        if (!messageInput.value.trim()) {
            isValid = false;
            contactMessageError.textContent = 'Please enter your message.'
        }

        if (isValid && !formSubmitted) {
            (function () {
                emailjs.init("L1CnO7lzHJSjnsLNq");
            })();
            emailSend();
            formSubmitted = true;
        }
    });

    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function emailSend() {
        let parms = {
            from: document.getElementById('nameInput').value,
            fromail: document.getElementById("emailInput").value,
            message: document.getElementById("messageInput").value
        };

        emailjs.send("service_pdf1eel", "template_dwgd35r", parms)
            .then(res => {
                displayAlert('Message Sent Successfully!', ()=>{ location.reload() })
            })
            .catch(error => {
                console.error("Error sending email:", error);
                displayAlert('An error occurred while sending the message.Please try again later.', ()=>{ location.reload() });
            });
    }
}