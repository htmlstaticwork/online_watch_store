// Theme & RTL Toggle Persistence
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    const rtlBtn = document.getElementById('rtl-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
    const scrollTopBtn = document.getElementById('scroll-to-top');
    const header = document.querySelector('header');
    
    // Cart Elements
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartClose = document.getElementById('cart-close');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartToast = document.getElementById('cart-toast');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCart();

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(savedTheme);
    body.classList.add(savedTheme);
    updateThemeIcon(savedTheme);

    // Initialize RTL
    const savedRTL = localStorage.getItem('rtl') === 'true';
    document.documentElement.setAttribute('dir', savedRTL ? 'rtl' : 'ltr');
    updateRTLText(savedRTL);

    // Theme Toggle Handler
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = body.classList.contains('dark');
            const targetTheme = isDark ? 'light' : 'dark';
            const currentTheme = isDark ? 'dark' : 'light';
            
            body.classList.remove(currentTheme);
            body.classList.add(targetTheme);
            document.documentElement.classList.remove(currentTheme);
            document.documentElement.classList.add(targetTheme);
            
            localStorage.setItem('theme', targetTheme);
            updateThemeIcon(targetTheme);
        });
    }

    // RTL Toggle Handler
    if (rtlBtn) {
        rtlBtn.addEventListener('click', () => {
            const currentDir = document.documentElement.getAttribute('dir');
            const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
            document.documentElement.setAttribute('dir', newDir);
            localStorage.setItem('rtl', newDir === 'rtl');
            updateRTLText(newDir === 'rtl');
        });
    }

    // Mobile Menu
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('open');
        });
    }

    if (mobileMenuCloseBtn && mobileMenu) {
        mobileMenuCloseBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    }

    // Auto-close mobile menu on link click
    const mobileLinks = document.querySelectorAll('#mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });

    // Sticky Header & Scroll to Top
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
            scrollTopBtn.classList.add('show');
        } else {
            header.classList.remove('sticky');
            scrollTopBtn.classList.remove('show');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Cart Event Listeners
    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartDrawer.classList.add('open');
        });
    }
    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
        });
    }

    // Add to Cart Buttons
    document.addEventListener('click', (e) => {
        // Delegate for both the button and its children
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            const id = addBtn.dataset.id;
            const name = addBtn.dataset.name;
            const price = parseFloat(addBtn.dataset.price);
            const image = addBtn.dataset.image;

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, image, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            showToast(`${name} added to collection`);
            
            // Open cart drawer temporarily to show update
            cartDrawer.classList.add('open');
            setTimeout(() => cartDrawer.classList.remove('open'), 2000);
        }

        // Remove from Cart
        if (e.target.classList.contains('remove-item')) {
            const id = e.target.dataset.id;
            cart = cart.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    });

    function updateCart() {
        if (!cartItemsList) return;
        
        cartItemsList.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            
            cartItemsList.innerHTML += `
                <div class="flex items-center justify-between mb-8 group border-b border-white/5 pb-4">
                    <div class="flex items-center">
                        <div class="w-16 h-20 bg-white/5 mr-6 overflow-hidden">
                            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover grayscale">
                        </div>
                        <div>
                            <h5 class="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">${item.name}</h5>
                            <p class="text-xs text-primary font-bold">$${item.price.toLocaleString()}</p>
                            <span class="text-[8px] opacity-40 uppercase tracking-[0.2em] block mt-1">Qty: ${item.quantity}</span>
                        </div>
                    </div>
                    <button class="remove-item text-[8px] uppercase font-bold text-red-500 opacity-40 hover:opacity-100 transition-all px-2 py-1 border border-red-500/20" data-id="${item.id}">Remove</button>
                </div>
            `;
        });

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="text-[10px] opacity-40 uppercase tracking-[0.4em] text-center mt-20">Your collection is empty</p>';
        }

        if (cartCount) cartCount.innerText = count;
        if (cartTotal) cartTotal.innerText = `$${total.toLocaleString()}`;
    }

    function showToast(msg) {
        if (!cartToast) return;
        cartToast.innerText = msg;
        cartToast.classList.add('show');
        setTimeout(() => cartToast.classList.remove('show'), 3000);
    }

    // Initial update
    updateCart();

    // Intersection Observer for Fade-in effects
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Form Validation (Simple)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input, textarea');
            let valid = true;
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    valid = false;
                    input.classList.add('border-red-500');
                } else {
                    input.classList.remove('border-red-500');
                }
            });
            if (valid) {
                alert('Success! Form submitted.');
                form.reset();
            }
        });
    });

    // Private Functions
    function updateThemeIcon(theme) {
        if (!themeBtn) return;
        themeBtn.innerHTML = theme === 'dark' 
            ? '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>' 
            : '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>';
    }

    function updateRTLText(isRTL) {
        if (!rtlBtn) return;
        rtlBtn.innerText = isRTL ? 'LTR' : 'RTL';
    }
});
