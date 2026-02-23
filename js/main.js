document.addEventListener('DOMContentLoaded', () => {
    // -------------------------
    // 1. Calculator Logic (Live MCX API Simulation)
    // -------------------------
    const karatSelect = document.getElementById('karat');
    const weightInput = document.getElementById('weight');
    const currencySelect = document.getElementById('currency');
    const valueDisplay = document.getElementById('estimated-value');
    const liveRateDisplay = document.querySelector('.live-rate');

    // Asynchronous function to mock fetching real-time MCX or global gold prices
    async function fetchLiveGoldPrice(currency) {
        try {
            // Attempt to fetch from a public endpoint
            // If the endpoint fails (CORS, limit tracking etc) we fallback to realistic values
            // Currently using realistic Indian MCX default
            const fallbackRates = {
                'INR': 16246.00, // Thangakaasu requested live price
                'USD': 87.50,
                'EUR': 80.20,
                'GBP': 68.40
            };

            // This represents where a real commercial API call goes:
            // const res = await fetch(`https://api.metals.earth/v1/latest?base=${currency}&currencies=XAU`);

            // Simulating API latency and slight market fluctuation
            return new Promise((resolve) => {
                setTimeout(() => {
                    const basePrice = fallbackRates[currency] || fallbackRates['INR'];
                    const fluctuation = (Math.random() * 2 - 1); // +/- 1 unit
                    resolve(basePrice + fluctuation);
                }, 300);
            });
        } catch (e) {
            console.error(e);
            return 7250.00;
        }
    }

    async function calculateValue() {
        const karat = parseFloat(karatSelect.value);
        const weight = parseFloat(weightInput.value) || 0;
        const currency = currencySelect.value;

        // Purity multipliers
        const purityMultiplier = karat / 24;

        // Fetch Live Price (Per Gram in selected currency)
        valueDisplay.style.opacity = '0.5'; // Loading state
        const livePricePerGram = await fetchLiveGoldPrice(currency);
        valueDisplay.style.opacity = '1';

        // Update live rate display
        liveRateDisplay.innerText = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(livePricePerGram) + '/g';

        // Calculate total value
        const totalValue = livePricePerGram * purityMultiplier * weight;

        // Update display with formatting and animation
        const currentText = valueDisplay.innerText;
        const currentVal = parseFloat(currentText.replace(/[^0-9.-]+/g, "")) || 0;

        animateValue(valueDisplay, currentVal, totalValue, 500, currency);
    }

    function animateValue(obj, start, end, duration, currency) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing function for smooth transition
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentVal = start + easeOutQuart * (end - start);

            // Format to currency based on local (en-IN specifically helps INR)
            const locale = currency === 'INR' ? 'en-IN' : 'en-US';
            const formattedTotal = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(currentVal);

            obj.innerHTML = formattedTotal;

            // Dynamically scale text down for massive numbers
            if (formattedTotal.length > 16) {
                obj.style.fontSize = '1.8rem';
            } else if (formattedTotal.length > 12) {
                obj.style.fontSize = '2.5rem';
            } else {
                obj.style.fontSize = '';
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Event listeners for calculator
    karatSelect.addEventListener('change', calculateValue);
    weightInput.addEventListener('input', () => { clearTimeout(window.calcTimeout); window.calcTimeout = setTimeout(calculateValue, 400); });
    currencySelect.addEventListener('change', calculateValue);

    // Initial calculation
    calculateValue();

    // -------------------------
    // 2. Input Focus Effects
    // -------------------------
    const cyberInputs = document.querySelectorAll('.cyber-input, .cyber-select');
    cyberInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // -------------------------
    // 3. Glitch Effect on Title
    // -------------------------
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        setInterval(() => {
            if (Math.random() > 0.9) {
                glitchText.style.textShadow = `
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 rgba(255,0,0,0.8),
                    ${Math.random() * -10 + 5}px ${Math.random() * -10 + 5}px 0 rgba(0,255,255,0.8)
                `;
                setTimeout(() => {
                    glitchText.style.textShadow = 'none';
                }, 50);
            }
        }, 200);
    }

    // -------------------------
    // 4. Smooth Scrolling
    // -------------------------
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                window.scrollTo({
                    top: targetEl.offsetTop - 80, // Offset for navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // -------------------------
    // 5. Modal & Toast Logic (Interactive Cta's)
    // -------------------------
    const modal = document.getElementById('lead-modal');
    const closeBtn = document.querySelector('.close-btn');
    const leadForm = document.getElementById('lead-form');
    const modalTriggers = document.querySelectorAll('[data-modal-target]');

    if (modal) {
        // Open modal
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('show');
            });
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        // Handle Form Submission
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Mock submission
            setTimeout(() => {
                modal.classList.remove('show');
                showToast('Success! An appraisal specialist will contact you shortly.');
                leadForm.reset();
            }, 800);
        });
    }

    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 5000);
    }

    // -------------------------
    // 6. FAQ Accordion Logic
    // -------------------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close others
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current
            item.classList.toggle('active');
        });
    });

    // -------------------------
    // 7. Mobile Menu Toggle
    // -------------------------
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // -------------------------
    // 8. Chatbot Logic
    // -------------------------
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-text');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle) {
        chatToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            chatWindow.classList.toggle('active');
        });

        chatClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            chatWindow.classList.remove('active');
        });

        chatSend.addEventListener('click', handleChatSubmit);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSubmit();
        });

        function handleChatSubmit() {
            const text = chatInput.value.trim();
            if (!text) return;

            // User message
            appendMessage(text, 'user');
            chatInput.value = '';

            // Bot response mock
            setTimeout(() => {
                appendMessage("An appraiser from Thangakaasu will reply shortly.", 'bot');
            }, 1000);
        }

        function appendMessage(text, type) {
            const msgObj = document.createElement('div');
            msgObj.className = `message ${type}`;
            msgObj.innerHTML = `<p>${text}</p>`;
            chatMessages.appendChild(msgObj);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});
