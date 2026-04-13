/**
 * Vizion Tools - Dynamic Component Loader
 * Handles fetching and injecting shared UI components (Navbar, Footer)
 */

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Dynamic Path Prefix Detection
    // Finds the current depth by looking at the script's own relative path
    const scripts = document.getElementsByTagName('script');
    let pathPrefix = '';
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].getAttribute('src');
        if (src && src.includes('js/components.js')) {
            pathPrefix = src.replace('js/components.js', '');
            break;
        }
    }

    /**
     * Helper to fix relative paths in injected content
     */
    function fixRelativePaths(container, prefix) {
        if (!prefix) return; // Already at root

        // Fix <a> links (only local ones)
        container.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                link.setAttribute('href', prefix + href);
            }
        });

        // Fix <img> sources
        container.querySelectorAll('img[src]').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                img.setAttribute('src', prefix + src);
            }
        });
    }

    // 1. Fetch & Inject NAVBAR
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) {
        const navUrl = pathPrefix + 'components/navbar.html?t=' + Date.now();
        fetch(navUrl, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                navPlaceholder.innerHTML = html;
                fixRelativePaths(navPlaceholder, pathPrefix);
                console.log('Navbar loaded successfully');
                
                // Initialize Navbar Logic
                if (typeof initMobileMenu === 'function') initMobileMenu();
                document.dispatchEvent(new CustomEvent('navbar-loaded'));
            })
            .catch(err => {
                console.error('Navbar load failed:', err);
                navPlaceholder.innerHTML = '<div style="background:#08415C; color:white; padding:10px; text-align:center;">Navbar Error</div>';
            });
    }

    // 2. Fetch & Inject FOOTER
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        const footerUrl = pathPrefix + 'components/footer_v2.html?v=' + Date.now();
        console.log('Fetching footer from:', footerUrl);
        fetch(footerUrl, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                // 1. Sanitize and Parse
                const cleanHtml = html.replace(/[^\x00-\x7F]/g, " ");
                const parser = new DOMParser();
                const doc = parser.parseFromString(cleanHtml, 'text/html');
                
                footerPlaceholder.innerHTML = '';
                
                // 2. Extract and Inject Styles
                const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
                styles.forEach(s => footerPlaceholder.appendChild(s));
                
                // 3. Inject Main Footer
                const mainFooter = doc.querySelector('footer');
                if (mainFooter) {
                    footerPlaceholder.appendChild(mainFooter);
                } else {
                    while (doc.body.firstChild) {
                        footerPlaceholder.appendChild(doc.body.firstChild);
                    }
                }
                
                fixRelativePaths(footerPlaceholder, pathPrefix);
                
                // 4. Force-Render Location Cards (THE ULTIMATE FIX)
                const cardContainer = document.getElementById('vt-global-cards');
                if (cardContainer) {
                    const LOCATIONS = [
                        { name: "United States", code: "US", addr: "600 East St Suite 103, New Britain, CT 06051, United States", tel: "+1 (929) 204-4923", link: "tel:+19292044923" },
                        { name: "Egypt", code: "EG", addr: "1-109 King Faisal St, Abu Qatadah, Boulaq Al Dakrour, Giza", tel: "+20-102-673-9595", link: "tel:+201026739595" },
                        { name: "India", code: "IN", addr: "7th floor, Trend workspace, Dickenson Rd, Bengaluru, KA 560042", tel: "+91 88611 18415", link: "tel:+918861118415" }
                    ];

                    cardContainer.innerHTML = LOCATIONS.map(loc => `
                        <div class="vt-loc-card">
                            <div class="vt-watermark">${loc.code}</div>
                            <div style="position:relative; z-index:2;">
                                <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
                                    <span style="width:40px; height:40px; border-radius:50%; background:rgba(202,151,3,0.12); display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                                        <span class="material-symbols-outlined" style="color:#CA9703; font-size:20px;">location_on</span>
                                    </span>
                                    <h3 style="color:#FFFFFF; font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:20px; margin:0;">${loc.name}</h3>
                                </div>
                                <div style="color:#8A9AAD; font-size:14px; line-height:1.7; margin-bottom:32px; font-weight:300;">
                                    ${loc.addr}
                                </div>
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-symbols-outlined" style="color:#CA9703; font-size:18px;">call</span>
                                    <a href="${loc.link}" style="color:#CA9703; font-weight:700; font-size:15px; text-decoration:none;">${loc.tel}</a>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
                
                // 5. Force-Render Copyright Section (THE FINAL FAILSAFE)
                const footerMain = footerPlaceholder.querySelector('footer');
                if (footerMain) {
                    // Check if copyright exists or just prepend/append it
                    let copyrightSection = document.getElementById('vt-copyright-container');
                    if (!copyrightSection) {
                        copyrightSection = document.createElement('div');
                        copyrightSection.id = 'vt-copyright-container';
                        footerMain.querySelector('div').appendChild(copyrightSection);
                    }
                    
                    copyrightSection.innerHTML = `
                        <div style="margin-top:80px; padding-top:40px; border-top:1px solid rgba(255,255,255,0.15);">
                            <div style="margin-bottom:24px;">
                                <span style="font-family:'Bricolage Grotesque',sans-serif; font-weight:700; color:#CA9703; font-size:11px; text-transform:uppercase; letter-spacing:0.3em; display:block;">COPYRIGHT</span>
                            </div>
                            <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:32px;">
                                <div style="color:rgba(255,255,255,0.6); font-size:14px; font-weight:400; font-family:'Inter',sans-serif;">
                                    &copy; 2026 Vizion Tools. All rights reserved.
                                </div>
                                
                                <div style="display:flex; align-items:center; gap:24px;">
                                    <a href="https://viziontools.com/privacy-policy/" style="color:rgba(255,255,255,0.6); font-size:14px; font-weight:400; text-decoration:none; transition:all 0.3s; font-family:'Inter',sans-serif;">Privacy Policy</a>
                                    <span style="color:rgba(255,255,255,0.2);">•</span>
                                    <a href="https://viziontools.com/term-of-service/" style="color:rgba(255,255,255,0.6); font-size:14px; font-weight:400; text-decoration:none; transition:all 0.3s; font-family:'Inter',sans-serif;">Terms of Service</a>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                console.log('Footer, Cards, and Copyright rendered successfully');
                document.dispatchEvent(new CustomEvent('footer-loaded'));
                
                if (typeof initCalCom === 'function') initCalCom();
            })
            .catch(err => {
                console.error('Footer load failed:', err);
                footerPlaceholder.innerHTML = '<div style="background:#08415C; color:white; padding:10px; text-align:center;">Footer Error</div>';
            });
    }
});

/**
 * Mobile Menu Toggle Logic
 */
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('mobile-navigation');
    const close = document.getElementById('mobile-menu-close');
    const dropdownTriggers = document.querySelectorAll('.mobile-dropdown-trigger');

    if (toggle && nav) {
        // Toggle Logic
        const toggleMenu = () => {
            const isOpen = !nav.classList.contains('translate-x-full');
            nav.classList.toggle('translate-x-full', isOpen);
            nav.classList.toggle('translate-x-0', !isOpen);
            document.body.style.overflow = isOpen ? '' : 'hidden'; // Lock scroll

            // Toggle Icon Visibility
            const menuIcon = toggle.querySelector('.menu-icon');
            const closeIcon = toggle.querySelector('.close-icon');
            
            if (menuIcon && closeIcon) {
                if (isOpen) {
                    // We are about to CLOSE the menu: show hamburger, hide cross
                    menuIcon.style.display = 'block';
                    closeIcon.style.display = 'none';
                } else {
                    // We are about to OPEN the menu: hide hamburger, show cross
                    menuIcon.style.display = 'none';
                    closeIcon.style.display = 'block';
                }
            }
        };

        toggle.addEventListener('click', toggleMenu);
        if (close) close.addEventListener('click', toggleMenu);
    }

    // Accordion Logic
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling;
            const chevron = trigger.querySelector('.material-symbols-outlined');
            
            const isOpen = !content.classList.contains('hidden');
            content.classList.toggle('hidden', isOpen);
            if (chevron) chevron.style.transform = isOpen ? 'rotate(0)' : 'rotate(180deg)';
        });
    });
}

/**
 * Cal.com / Booking Modal Logic
 */
function initCalCom() {
    const scriptId = 'cal-com-script';
    if (document.getElementById(scriptId)) return;

    (function (C, A, L) { 
        let p = function (a, ar) { a.q.push(ar); }; 
        let d = C.document; 
        C.Cal = C.Cal || function () { 
            let cal = C.Cal; 
            let ar = arguments; 
            if (!cal.loaded) { 
                cal.ns = {}; 
                cal.q = cal.q || []; 
                d.head.appendChild(d.createElement("script")).src = A; 
                cal.loaded = true; 
            } 
            if (ar[0] === L) { 
                const api = function () { p(api, arguments); }; 
                const ns = ar[1]; 
                api.q = api.q || []; 
                if(typeof ns === "string"){cal.ns[ns] = cal.ns[ns] || api; return cal.ns[ns];} 
                return p(cal, ar); 
            } 
            p(cal, ar); 
        }; 
    })(window, "https://app.cal.com/embed/embed.js", "init");

    Cal("init", "piyushchandak/30min", { origin: "https://cal.com" });
    Cal("ui", { "styles": { "branding": { "brandColor": "#08415C" } }, "hideEventTypeDetails": false, "layout": "month_view" });
}

