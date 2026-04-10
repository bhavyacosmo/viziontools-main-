/**
 * Vizion Tools - Component Loader & Shared Logic
 * Centralizes Navbar and Footer to reduce redundancy across 14+ pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine the path prefix based on directory depth
    // (e.g., if in /industries/, prefix is "../")
    // Determine the path prefix based on how many levels deep we are.
    // This allows the shared components to work regardless of folder structure.
    const path = window.location.pathname;
    const isSubdir = path.includes('/industries/') || path.split('/').length > 2 && !path.endsWith('.html'); 
    // Simple heuristic: if the path has more than one slash (excluding leading), 
    // or specifically in /industries/, we need to go up.
    // For this project, we primarily care about the /industries/ folder.
    const pathPrefix = (path.includes('/industries/')) ? '../' : '';

    // Load Navbar
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) {
        fetch(pathPrefix + 'components/navbar.html')
            .then(response => response.text())
            .then(html => {
                navPlaceholder.innerHTML = html;
                fixRelativePaths(navPlaceholder, pathPrefix);
                initMobileMenu();
                // Custom event to notify other scripts that nav is ready
                document.dispatchEvent(new CustomEvent('navbar-loaded'));
            });
    }

    // Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch(pathPrefix + 'components/footer.html')
            .then(response => response.text())
            .then(html => {
                footerPlaceholder.innerHTML = html;
                fixRelativePaths(footerPlaceholder, pathPrefix);
                initCalCom();
            });
    }

    /**
     * Fixes all relative href and src attributes in the injected content.
     */
    function fixRelativePaths(container, prefix) {
        if (!prefix) return; // No correction needed for root pages

        // Elements with href (links)
        container.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            // Don't modify absolute URLs, anchors, or already corrected paths
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                link.setAttribute('href', prefix + href);
            }
        });

        // Elements with src (images, scripts)
        container.querySelectorAll('[src]').forEach(el => {
            const src = el.getAttribute('src');
            if (src && !src.startsWith('http')) {
                el.setAttribute('src', prefix + src);
            }
        });
    }

    /**
     * Mobile Menu Toggle Logic
     */
    function initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileNavigation = document.getElementById('mobile-navigation');

        if (mobileMenuToggle && mobileNavigation) {
            const menuIcon = mobileMenuToggle.querySelector('.menu-icon');
            const closeIcon = mobileMenuToggle.querySelector('.close-icon');

            mobileMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = mobileNavigation.classList.contains('translate-x-0');
                
                if (isOpen) {
                    mobileNavigation.classList.remove('translate-x-0');
                    mobileNavigation.classList.add('translate-x-full');
                    if (menuIcon) menuIcon.classList.remove('hidden');
                    if (closeIcon) closeIcon.classList.add('hidden');
                    document.body.style.overflow = '';
                } else {
                    mobileNavigation.classList.add('translate-x-0');
                    mobileNavigation.classList.remove('translate-x-full');
                    if (menuIcon) menuIcon.classList.add('hidden');
                    if (closeIcon) closeIcon.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                }
            });

            // Mobile Dropdown Accordion Logic
            const dropdownTriggers = mobileNavigation.querySelectorAll('.mobile-dropdown-trigger');
            dropdownTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const content = trigger.nextElementSibling;
                    const icon = trigger.querySelector('.material-symbols-outlined');
                    
                    if (content && icon) {
                        content.classList.toggle('hidden');
                        icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                });
            });
        }
    }

    /**
     * Cal.com Universal Embed Initialization
     */
    function initCalCom() {
        const scriptId = 'cal-com-script';
        if (document.getElementById(scriptId)) return;

        (function (C, A, L) {
            let p = function (a, ar) { a.q.push(ar); };
            let d = C.document; C.Cal = C.Cal || function () {
                let cal = C.Cal; let ar = arguments;
                if (!cal.loaded) {
                    cal.ns = {}; cal.q = cal.q || [];
                    const s = d.createElement("script");
                    s.src = A; s.async = true;
                    s.id = scriptId;
                    s.onload = () => {
                        console.info("[Cal.com Debug] Script loaded.");
                        Cal("preload", { calLink: "piyushchandak/30min" });
                    };
                    d.head.appendChild(s);
                    cal.loaded = true;
                }
                if (ar[0] === L) {
                    const sn = ar[1];
                    const obj = [sn, { q: [] }];
                    cal.q.push(obj);
                    return;
                }
                p(cal, ar);
            };
        })(window, "https://app.cal.com/embed/embed.js", "init");

        Cal("init", "piyushchandak/30min", { origin: "https://cal.com" });
        Cal("ui", {
            theme: "dark",
            styles: { branding: { brandColor: "#CA9703" } },
            hideEventTypeDetails: false,
            layout: "month_view"
        });
        console.info("[Cal.com Debug] Cal.com initialized.");
    }
});
