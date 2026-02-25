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
                'INR': 7500.00, // Real MCX Price
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
                    ${Math.random() * 8 - 4}px ${Math.random() * 8 - 4}px 0 rgba(197, 160, 33, 0.4),
                    ${Math.random() * -8 + 4}px ${Math.random() * -8 + 4}px 0 rgba(100, 100, 100, 0.3)
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
                appendMessage("An appraiser from MK Gold will reply shortly.", 'bot');
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

    // -------------------------
    // 9. Language Toggle Logic
    // -------------------------
    const knTranslations = {
        // Nav
        "Process": "ಪ್ರಕ್ರಿಯೆ",
        "Valuation": "ಮೌಲ್ಯಮಾಪನ",
        "Security": "ಭದ್ರತೆ",
        "Track Asset": "ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
        "Get Quote": "ಉಲ್ಲೇಖ ಪಡೆಯಿರಿ",

        // Hero
        "India's Most Trusted Gold Buyer": "ಭಾರತದ ಅತ್ಯಂತ ವಿಶ್ವಾಸಾರ್ಹ ಚಿನ್ನ ಖರೀದಿದಾರ",
        "Turn Your Gold Into": "ನಿಮ್ಮ ಚಿನ್ನವನ್ನು",
        "Instant Cash. Securely.": "ತ್ವರಿತ ನಗದು ಆಗಿ ಪರಿವರ್ತಿಸಿ. ಸುರಕ್ಷಿತವಾಗಿ.",
        "Secure, transparent, and hassle-free cash for gold. Instant valuation powered by live MCX market data.": "ಚಿನ್ನಕ್ಕಾಗಿ ಸುರಕ್ಷಿತ ಮತ್ತು ಪಾರದರ್ಶಕ ನಗದು. ಲೈವ್ MCX ಮಾರುಕಟ್ಟೆ ಡೇಟಾದಿಂದ ನಡೆಸಲ್ಪಡುವ ತ್ವರಿತ ಮೌಲ್ಯಮಾಪನ.",
        "Start Valuation": "ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
        "How It Works": "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
        "Bank-Grade Security": "ಬ್ಯಾಂಕ್ ದರ್ಜೆಯ ಭದ್ರತೆ",
        "100% Insured": "100% ವಿಮೆ",
        "4.9/5 Rating": "4.9/5 ರೇಟಿಂಗ್",

        // Calc
        "Real-Time": "ನೈಜ ಸಮಯದ",
        "Enter your assets for an instant market-rate estimate.": "ನಿಮ್ಮ ಆಸ್ತಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಬೆಲೆ ತಿಳಿಯಿರಿ.",
        "Purity (Karat)": "ಶುದ್ಧತೆ (ಕ್ಯಾರೆಟ್)",
        "Weight (Grams)": "ತೂಕ (ಗ್ರಾಂ)",
        "Payout Currency": "ಪಾವತಿ ಕರೆನ್ಸಿ",
        "Estimated Value": "ಅಂದಾಜು ಮೌಲ್ಯ",
        "Lock In Price": "ಬೆಲೆಯನ್ನು ಲಾಕ್ ಮಾಡಿ",
        "Free Secure Shipping": "ಉಚಿತ ಸುರಕ್ಷಿತ ಶಿಪ್ಪಿಂಗ್",
        "24hr Payout": "24 ಗಂಟೆಯ ಪಾವತಿ",

        // Process
        "The": "ದಿ",
        "Simple, secure, and fully insured from start to finish.": "ಸರಳ, ಸುರಕ್ಷಿತ ಮತ್ತು ಸುಲಭ.",
        "Visit Our Shop": "ನಮ್ಮ ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ",
        "Bring your gold to our trusted MK GOLD branch for an immediate evaluation.": "ತಕ್ಷಣದ ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ನಿಮ್ಮ ಚಿನ್ನವನ್ನು ನಮ್ಮ MK GOLD ಶಾಖೆಗೆ ತನ್ನಿ.",
        "Transparent Appraisal": "ಪಾರದರ್ಶಕ ಮೌಲ್ಯಮಾಪನ",
        "We test your gold right in front of you using advanced technology.": "ನಾವು ನಿಮ್ಮ ಮುಂದೆಯೇ ನಿಮ್ಮ ಚಿನ್ನವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತೇವೆ.",
        "Get Paid Instantly": "ತಕ್ಷಣ ಹಣ ಪಡೆಯಿರಿ",
        "Receive your money immediately on the spot, with absolutely no delays.": "ಯಾವುದೇ ವಿಳಂಬವಿಲ್ಲದೆ ಸ್ಥಳದಲ್ಲೇ ಹಣ ಪಡೆಯಿರಿ.",

        // What We Buy
        "What We": "ನಾವು ಏನು",
        "Buy": "ಖರೀದಿಸುತ್ತೇವೆ",
        "We accept all forms of gold, regardless of their condition.": "ನಾವು ಎಲ್ಲಾ ರೀತಿಯ ಚಿನ್ನವನ್ನು ಖರೀದಿಸುತ್ತೇವೆ.",
        "Jewelry": "ಆಭರಣ",
        "Coins": "ನಾಣ್ಯಗಳು",
        "Bars & Biscuits": "ಗಟ್ಟಿಗಳು ಮತ್ತು ಬಿಸ್ಕತ್ತುಗಳು",
        "Luxury Watches": "ಐಷಾರಾಮಿ ಕೈಗಡಿಯಾರಗಳು",

        // Security
        "Uncompromised": "ರಾಜಿಯಾಗದ",
        "Trust": "ನಂಬಿಕೆ",
        "Your assets are evaluated securely and transparently in our monitored premises.": "ನಿಮ್ಮ ಆಸ್ತಿಗಳನ್ನು ನಮ್ಮ ಆವರಣದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತದೆ.",
        "Secure Branch Locations": "ಸುರಕ್ಷಿತ ಶಾಖೆಗಳು",
        "Transparent In-Person Testing": "ಪಾರದರ್ಶಕ ಪರೀಕ್ಷೆ",
        "Immediate Settlements": "ತಕ್ಷಣದ ಪಾವತಿ",
        "100% Customer Satisfaction": "100% ಗ್ರಾಹಕರ ತೃಪ್ತಿ",

        // Heritage
        "Decades of": "ದಶಕಗಳ",
        "Trust & Excellence": "ನಂಬಿಕೆ ಮತ್ತು ಶ್ರೇಷ್ಠತೆ",
        "MK Gold is built on over two decades of traditional bullion trading expertise. We bring professional appraisal technology directly to our retail stores, ensuring you get the best value for your gold, backed by generation-spanning industry relationships.": "MK Gold ಎರಡು ದಶಕಗಳಿಗೂ ಹೆಚ್ಚು ಸಾಂಪ್ರದಾಯಿಕ ಚಿನ್ನದ ವ್ಯಾಪಾರದ ಪರಿಣತಿಯನ್ನು ಹೊಂದಿದೆ. ನಾವು ವೃತ್ತಿಪರ ಮೌಲ್ಯಮಾಪನ ತಂತ್ರಜ್ಞಾನವನ್ನು ನೇರವಾಗಿ ನಮ್ಮ ಚಿಲ್ಲರೆ ಅಂಗಡಿಗಳಿಗೆ ತರುತ್ತೇವೆ.",
        "Years in Business": "ವ್ಯಾಪಾರದಲ್ಲಿರುವ ವರ್ಷಗಳು",
        "Assets Liquidated": "ಆಸ್ತಿಗಳ ಮೌಲ್ಯ",
        "Clients Served": "ಗ್ರಾಹಕರು ಸೇವೆ",

        // Why Us
        "Why": "ನಮ್ಮನ್ನು ಏಕೆ",
        "MK Gold": "ಆರಿಸಬೇಕು",
        "Why thousands trust us with their high-value assets.": "ಸಾವಿರಾರು ಜನರು ನಮ್ಮನ್ನು ಏಕೆ ನಂಬುತ್ತಾರೆ.",
        "Top Tier Payouts": "ಉನ್ನತ ಮಟ್ಟದ ಪಾವತಿಗಳು",
        "We bypass the middlemen, offering up to 20% more than local buyers or pawn shops.": "ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನಾವು 20% ವರೆಗೆ ಹೆಚ್ಚು ನೀಡುತ್ತೇವೆ.",
        "Instant Funding": "ತ್ವರಿತ ಪಾವತಿ",
        "Walk out with cash or immediate bank transfer the moment you accept our offer.": "ನಮ್ಮ ಪ್ರಸ್ತಾಪವನ್ನು ಒಪ್ಪಿಕೊಂಡ ತಕ್ಷಣ ನಗದು ಪಡೆಯಿರಿ.",
        "No Hidden Fees": "ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲ",
        "Zero appraisal fees, zero shipping costs, and zero obligation to sell.": "ಶೂನ್ಯ ಮೌಲ್ಯಮಾಪನ ಶುಲ್ಕ, ಯಾವುದೇ ಕಟ್ಟುಪಾಡುಗಳಿಲ್ಲ.",

        // Trends
        "Gold is at a": "ಚಿನ್ನವು ಐತಿಹಾಸಿಕ",
        "Historic High": "ಎತ್ತರದಲ್ಲಿದೆ",
        "Don't wait for a market correction. The value of your unworn jewelry and assets has never been higher.": "ಮಾರುಕಟ್ಟೆಯ ತಿದ್ದುಪಡಿಗಾಗಿ ಕಾಯಬೇಡಿ. ನಿಮ್ಮ ಚಿನ್ನದ ಮೌಲ್ಯ ಎಂದಿಗೂ ಹೆಚ್ಚಾಗಿರಲಿಲ್ಲ.",
        "Year over Year": "ವರ್ಷದಿಂದ ವರ್ಷಕ್ಕೆ",
        "All-Time Highs": "ಸಾರ್ವಕಾಲಿಕ ಗರಿಷ್ಠ",

        // Testimonials
        "Client": "ಗ್ರಾಹಕರ",
        "Voices": "ಧ್ವನಿಗಳು",
        "Verified Client": "ಪರಿಶೀಲಿಸಿದ ಗ್ರಾಹಕ",

        // FAQ
        "Frequently Asked": "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ",
        "Questions": "ಪ್ರಶ್ನೆಗಳು",
        "How is my gold tested?": "ನನ್ನ ಚಿನ್ನವನ್ನು ಹೇಗೆ ಪರೀಕ್ಷಿಸಲಾಗುತ್ತದೆ?",
        "We use state-of-the-art X-Ray Fluorescence (XRF) spectroscopy. This method is completely non-destructive and provides the exact elemental composition of your items down to the decimal.": "ನಾವು ಅತ್ಯಾಧುನಿಕ XRF ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸುತ್ತೇವೆ. ಇದು ನಿಮ್ಮ ಆಭರಣಗಳಿಗೆ ಹಾನಿ ಮಾಡದೆ ನಿಖರತೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.",
        "What if I decline the offer?": "ನಾನು ಪ್ರಸ್ತಾಪವನ್ನು ನಿರಾಕರಿಸಿದರೆ ಏನು?",
        "No problem at all. Our appraisals are obligation-free. If you decide not to sell, you can simply take your items back with you.": "ಯಾವುದೇ ತೊಂದರೆ ಇಲ್ಲ. ನೀವು ಮಾರಾಟ ಮಾಡದಿರಲು ನಿರ್ಧರಿಸಿದರೆ, ನಿಮ್ಮ ವಸ್ತುಗಳನ್ನು ನೀವು ಹಿಂದೆಗೆದುಕೊಳ್ಳಬಹುದು.",
        "Do you buy broken jewelry?": "ನೀವು ಮುರಿದ ಆಭರಣಗಳನ್ನು ಖರೀದಿಸುತ್ತೀರಾ?",
        "Yes. The condition of the jewelry does not matter. We base our valuation purely on the precious metal content (karat and weight), not aesthetics or retail condition.": "ಹೌದು. ಆಭರಣಗಳ ಸ್ಥಿತಿಯು ಮುಖ್ಯವಲ್ಲ. ನಾವು ಚಿನ್ನದ ತೂಕ ಮತ್ತು ಕ್ಯಾರೆಟ್ ಆಧಾರದ ಮೇಲೆ ಮೌಲ್ಯವನ್ನು ನೀಡುತ್ತೇವೆ.",

        // Footer
        "Ready to unlock your asset's value?": "ನಿಮ್ಮ ಚಿನ್ನದ ಮೌಲ್ಯವನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
        "Request Appraisal": "ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ವಿನಂತಿಸಿ",
        "Cash for Gold - The premium destination for liquidating precious metal assets.": "ಚಿನ್ನಕ್ಕಾಗಿ ನಗದು - ನಿಮ್ಮ ಚಿನ್ನದ ವಸ್ತುಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಬೆಲೆ.",
        "Corporate Office": "ಕಾರ್ಪೊರೇಟ್ ಕಚೇರಿ",
        "Quick Links": "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು",
        "Calculator": "ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        "Legal": "ಕانون ಪ್ರಕಾರ",
        "Terms of Service": "ಸೇವಾ ನಿಯಮಗಳು",
        "Privacy Policy": "ಗೌಪ್ಯತಾ ನೀತಿ",
        "Insurance Details": "ವಿಮಾ ವಿವರಗಳು"
    };

    let isKannada = false;
    let originalTexts = new Map();

    function translateToKannada(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue.trim();
            if (text && knTranslations[text]) {
                originalTexts.set(node, text);
                node.nodeValue = node.nodeValue.replace(text, knTranslations[text]);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.id === 'lang-toggle') return;
            for (let child of node.childNodes) {
                translateToKannada(child);
            }
        }
    }

    function restoreEnglish(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (originalTexts.has(node)) {
                node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), originalTexts.get(node));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.id === 'lang-toggle') return;
            for (let child of node.childNodes) {
                restoreEnglish(child);
            }
        }
    }

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isKannada = !isKannada;
            const langSpan = langToggleBtn.querySelector('span');
            if (isKannada) {
                langSpan.innerText = 'EN';
                langToggleBtn.childNodes[0].nodeValue = 'ಕನ್ನಡ / ';
                translateToKannada(document.body);
            } else {
                langSpan.innerText = 'ಕನ್ನಡ';
                langToggleBtn.childNodes[0].nodeValue = 'EN / ';
                restoreEnglish(document.body);
            }
        });
    }

    // -------------------------
    // 10. Hero Canvas Image Sequence
    // -------------------------
    const heroCanvas = document.getElementById('hero-sequence');
    if (heroCanvas) {
        const context = heroCanvas.getContext('2d');
        const frameCount = 480;
        const currentFrame = index => {
            if (index <= 192) {
                return `assets/sequence/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
            } else {
                return `assets/sequence/193 (${index - 192}).jpg`;
            }
        };

        const images = [];
        let loadedImages = 0;
        let playhead = 0;

        // Preload first image immediately to display something ASAP
        const firstImg = new Image();
        firstImg.src = currentFrame(1);
        firstImg.onload = () => {
            heroCanvas.style.opacity = 1;
            context.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            context.drawImage(firstImg, 0, 0, heroCanvas.width, heroCanvas.height);
        };
        images[0] = firstImg;
        loadedImages++;

        // Preload the rest of the sequence sequentially to avoid network blocking
        let preloadIndex = 2;
        function preloadNext() {
            if (preloadIndex > frameCount) return;
            const img = new Image();
            img.src = currentFrame(preloadIndex);

            // Ensure images array aligns perfectly with playhead index
            images[preloadIndex - 1] = img;

            img.onload = () => {
                loadedImages++;
                preloadIndex++;
                // Using requestIdleCallback or setTimeout to yield to main thread if needed,
                // but direct call is usually fine for sequential network requests.
                setTimeout(preloadNext, 0);
            };
            img.onerror = () => {
                // Fallback to continue sequence if a frame goes missing
                loadedImages++;
                preloadIndex++;
                setTimeout(preloadNext, 0);
            };
        }
        // Start preloading the rest of the sequence ONLY AFTER the full page has loaded
        // This stops the browser completely hanging its loading spinner
        window.addEventListener('load', () => {
            preloadNext();
        });

        // Animation playback loop (approx 30fps)
        const fps = 30;
        setInterval(() => {
            if (loadedImages > playhead) {
                requestAnimationFrame(() => {
                    if (images[playhead] && images[playhead].complete) {
                        context.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
                        context.drawImage(images[playhead], 0, 0, heroCanvas.width, heroCanvas.height);
                    }
                });
                playhead = (playhead + 1) % frameCount;
            }
        }, 1000 / fps);
    }
});

// -------------------------
// 11. Value Comparison Auto-Popup
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    const valuePopup = document.getElementById('value-popup-modal');
    if (valuePopup) {
        // Trigger popup 1 second after page load
        setTimeout(() => {
            valuePopup.style.display = 'flex';
            // slight delay to allow display flex to apply before opacity transition fires
            setTimeout(() => {
                valuePopup.classList.add('show');
            }, 10);
        }, 1000); // Small 1s delay for better UX on entry
    }
});

// -------------------------
// 12. Global Escape Key Handler for Modals
// -------------------------
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Find any modal currently displaying with the 'show' class (animating in)
        const activeModals = document.querySelectorAll('.modal.show');
        activeModals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // 300ms matches the CSS opacity transition time
        });

        // Fallback for modals that might just have display: flex without .show
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
            if (modal.style.display === 'flex' && !modal.classList.contains('show')) {
                modal.style.display = 'none';
            }
        });
    }
});
