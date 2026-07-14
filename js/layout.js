// js/layout.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. DYNAMICALLY GENERATE AND INJECT THE UNIVERSAL STYLE RULES INTO <HEAD>
    if (!document.getElementById("universal-layout-styles")) {
        const styleBlock = document.createElement("style");
        styleBlock.id = "universal-layout-styles";
        styleBlock.innerHTML = `
            .accelerated-orb {
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            @keyframes powerSurge {
                0%, 100% { transform: scale(1) translate3d(0, 0, 0); opacity: 0.12; }
                50% { transform: scale(1.35) translate3d(15px, -15px, 0); opacity: 0.22; }
            }
            @keyframes flowingCurrentLeft {
                0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.25; }
                50% { transform: translate3d(110px, 25px, 0); opacity: 0.35; }
            }
            .animate-surge { animation: powerSurge 8s ease-in-out infinite; }
            .animate-drift-left { animation: flowingCurrentLeft 14s ease-in-out infinite; }
        `;
        document.head.appendChild(styleBlock);
    }

    // 2. PARSE CURRENT ROUTE PATH FOR UNIVERSAL NAV LINK TRACKING
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    
    // Desktop active states
    const activeClass = (page) => currentPath === page 
        ? "text-primary dark:text-secondary font-extrabold border-b-2 border-primary dark:border-secondary pb-1" 
        : "text-darkNavy dark:text-slate-300 hover:text-primary dark:hover:text-white font-bold transition pb-1";

    // Mobile active states (uses clean vertical left accents instead of horizontal underlines)
    const mobileActiveClass = (page) => currentPath === page
        ? "block px-3 py-2 text-sm font-extrabold text-primary dark:text-secondary bg-primary/5 dark:bg-secondary/5 rounded-xl border-l-4 border-primary dark:border-secondary"
        : "block px-3 py-2 text-sm font-bold text-darkNavy dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition";

    const isAboutActive = ["who-we-are.html", "management-team.html", "our-offices.html"].includes(currentPath);
    const isCustomerExperienceActive = ["our-offices.html", "standards.html", "collection-policies.html", "log-a-complaint.html", "contact-us.html"].includes(currentPath);
    const isPaymentGatewaysActive = ["wema-bank-accounts.html", "aggregators.html"].includes(currentPath);

    // 3. DEFINE COMPONENT TEMPLATES
    const ambientCanvasHTML = `
        <div class="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500">
            <div class="absolute inset-0 bg-[radial-gradient(#0A1931_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08] dark:opacity-0 transition-opacity"></div>
            <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] accelerated-orb animate-surge dark:opacity-0 transition-opacity"></div>
            
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:32px_32px] opacity-0 dark:opacity-25 transition-opacity"></div>
            <div class="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-primary/35 blur-[100px] accelerated-orb animate-drift-left opacity-0 dark:opacity-100 transition-opacity"></div>
        </div>
    `;

    const globalHeaderHTML = `
        <div class="bg-darkNavy dark:bg-black text-white text-[11px] font-bold py-2.5 px-4 text-center tracking-wider uppercase border-b border-white/10 dark:border-slate-800 relative z-10">
            <div class="max-w-6xl mx-auto flex items-center justify-center gap-2">
                <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                Gombe Franchise Grid Status: <span class="text-secondary">Normal / Operational</span>
            </div>
        </div>

        <nav class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors relative">
            <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <a href="index.html" class="flex items-center gap-2.5 font-bold tracking-widest relative z-50">
                    <img src="assets/logo.png" alt="Logo" class="h-9 w-auto" onerror="this.style.display='none'">
                    <div class="flex flex-col leading-none">
                        <span class="text-xl text-primary dark:text-white">SAVANNAH EDC</span>
                        <span class="text-[10px] tracking-wide font-bold opacity-80 mt-0.5">A Subsidiary of <span class="text-orange-400 opacity-100">Jos Electricity Distribution Plc</span></span>
                    </div>
                </a>

                <div class="hidden md:flex items-center gap-6 text-sm">
                    <a href="index.html" class="${activeClass('index.html')}">Home</a>
                    
                    <div class="relative group py-2">
                        <button class="flex items-center gap-1 ${isAboutActive ? 'text-primary dark:text-secondary font-extrabold' : 'text-darkNavy dark:text-slate-300 hover:text-primary dark:hover:text-white'} font-bold transition">
                            About Us
                            <svg class="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                            </svg>
                        </button>
                        
                        <div class="absolute top-full left-0 mt-1 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 delay-150 group-hover:delay-0 transform translate-y-2 group-hover:translate-y-0 z-50 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-['']">
                            <div class="p-1.5 space-y-0.5 bg-white dark:bg-slate-900 rounded-2xl relative z-10 overflow-hidden">
                                <a href="who-we-are.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'who-we-are.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Who We Are</a>
                                <a href="management-team.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'management-team.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Management Team</a>
                            </div>
                        </div>
                    </div>

                    <div class="relative group py-2">
                        <button class="flex items-center gap-1 ${isCustomerExperienceActive ? 'text-primary dark:text-secondary font-extrabold' : 'text-darkNavy dark:text-slate-300 hover:text-primary dark:hover:text-white'} font-bold transition">
                            Customer Experience
                            <svg class="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                            </svg>
                        </button>

                        <div class="absolute top-full left-0 mt-1 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 delay-150 group-hover:delay-0 transform translate-y-2 group-hover:translate-y-0 z-50 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-['']">
                            <div class="p-1.5 space-y-0.5 bg-white dark:bg-slate-900 rounded-2xl relative z-10 overflow-hidden">
                                <a href="our-offices.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'our-offices.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Our Offices</a>
                                <a href="get-a-meter.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'get-a-meter.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Get a Meter</a>
                                <a href="https://nerc.gov.ng/resource-category/guidelines-standards/" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'standards.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Material Standards NESIS</a>
                                <a href="collection-policies.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'collection-policies.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Collection Policies</a>
                                <a href="log-a-complaint.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'log-a-complaint.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Log a Complaint</a>
                                <a href="contact-us.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'contact-us.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Contact Us</a>
                            </div>
                        </div>
                    </div>

                    <div class="relative group py-2">
                        <button class="flex items-center gap-1 ${isPaymentGatewaysActive ? 'text-primary dark:text-secondary font-extrabold' : 'text-darkNavy dark:text-slate-300 hover:text-primary dark:hover:text-white'} font-bold transition">
                            Payment Channels
                            <svg class="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                            </svg>
                        </button>
                        
                        <div class="absolute top-full left-0 mt-1 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 delay-150 group-hover:delay-0 transform translate-y-2 group-hover:translate-y-0 z-50 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-['']">
                            <div class="p-1.5 space-y-0.5 bg-white dark:bg-slate-900 rounded-2xl relative z-10 overflow-hidden">
                                <a href="wema-bank-accounts.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'wema-bank-accounts.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Wema Bank Accounts</a>
                                <a href="e-payment-channels.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'e-payment-channels.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">E-Payment Channels</a>
                                <a href="aggregators.html" class="block px-4 py-2.5 text-xs font-bold rounded-xl ${currentPath === 'aggregators.html' ? 'bg-primary/5 text-primary dark:text-secondary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'} transition">Aggregators</a>
                            </div>
                        </div>
                    </div>

                    <a href="staff.html" class="${activeClass('staff.html')}">Staff</a>
                </div>
                
                <div class="flex items-center gap-1.5 relative z-50">
                    <button onclick="toggleTheme()" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    </button>

                    <button id="mobile-menu-toggle" class="block md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none" aria-label="Toggle Navigation Menu">
                        <svg class="w-6 h-6 menu-icon-closed" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                        <svg class="w-6 h-6 menu-icon-open hidden" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" class="hidden md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-xl absolute top-full left-0 w-full z-40 overflow-y-auto max-h-[calc(100vh-80px)] transition-all">
                <div class="space-y-1">
                    <a href="index.html" class="${mobileActiveClass('index.html')}">Home</a>
                </div>
                
                <div class="space-y-1">
                    <div class="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">About Us</div>
                    <a href="who-we-are.html" class="${mobileActiveClass('who-we-are.html')}">Who We Are</a>
                    <a href="management-team.html" class="${mobileActiveClass('management-team.html')}">Management Team</a>
                </div>

                <div class="space-y-1">
                    <div class="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Customer Experience</div>
                    <a href="our-offices.html" class="${mobileActiveClass('our-offices.html')}">Our Offices</a>
                    <a href="standards.html" class="${mobileActiveClass('standards.html')}">Material Standards</a>
                    <a href="collection-policies.html" class="${mobileActiveClass('collection-policies.html')}">Collection Policies</a>
                    <a href="log-a-complaint.html" class="${mobileActiveClass('log-a-complaint.html')}">Log a Complaint</a>
                    <a href="contact-us.html" class="${mobileActiveClass('contact-us.html')}">Contact Us</a>
                </div>

                <div class="space-y-1">
                    <div class="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Payment Gateways</div>
                    <a href="wema-bank-accounts.html" class="${mobileActiveClass('wema-bank-accounts.html')}">Wema Bank Accounts</a>
                    <a href="aggregators.html" class="${mobileActiveClass('aggregators.html')}">Aggregators</a>
                </div>

                <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <a href="staff.html" class="${mobileActiveClass('staff.html')}">Staff Access</a>
                </div>
            </div>
        </nav>
    `;

    const globalFooterHTML = `
        <footer class="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-200 dark:border-slate-900 transition-colors mt-auto relative z-10">
            <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p>Savannah EDC HQ, Bauchi Street Adjacent Ministry of Works, Gombe, Gombe State, Nigeria.</p>
                <p>&copy; 2026 Savannah Electricity Distribution Company Ltd.</p>
            </div>
        </footer>
    `;

    // 4. CLEAN AND COMPILE COMPONENT LAYOUT SHELL INSIDE PAGE BODY
    const body = document.body;
    
    // Inject background canvas and headers at the start of the body
    const headerWrapper = document.createElement("div");
    headerWrapper.id = "universal-header-container";
    headerWrapper.innerHTML = ambientCanvasHTML + globalHeaderHTML;
    body.insertBefore(headerWrapper, body.firstChild);

    // Inject footer at the absolute bottom of the body
    const footerWrapper = document.createElement("div");
    footerWrapper.id = "universal-footer-container";
    footerWrapper.innerHTML = globalFooterHTML;
    body.appendChild(footerWrapper);

    // 5. INTERACTIVE MOBILE DROPDOWN ARCHITECTURE REGISTER EVENT BINDING
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (mobileMenuToggle && mobileMenu) {
        const closedIcon = mobileMenuToggle.querySelector(".menu-icon-closed");
        const openIcon = mobileMenuToggle.querySelector(".menu-icon-open");
        
        mobileMenuToggle.addEventListener("click", () => {
            const isMenuCollapsed = mobileMenu.classList.contains("hidden");
            
            if (isMenuCollapsed) {
                mobileMenu.classList.remove("hidden");
                closedIcon.classList.add("hidden");
                openIcon.classList.remove("hidden");
            } else {
                mobileMenu.classList.add("hidden");
                closedIcon.classList.remove("hidden");
                openIcon.classList.add("hidden");
            }
        });
    }
});