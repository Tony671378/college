/* ═══════════════════════════════════════════════════
   CAMPUSFIND APPLICATION LOGIC
   Navigation, interactions, and state management
   ═══════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ── STATE ──
    const state = {
        currentScreen: 'splash-screen',
        previousScreen: null,
        onboardingSlide: 0,
        darkMode: false,
        savedColleges: new Set(),
        filterCount: 0,
        filterSheetOpen: false,
    };

    // ── DOM REFERENCES ──
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const bottomNav = $('#bottom-nav');
    const toast = $('#toast');
    const toastMessage = $('#toast-message');

    // ═══════════════════════════════════
    // NAVIGATION SYSTEM
    // ═══════════════════════════════════

    function navigateTo(screenId, options = {}) {
        const current = $(`.screen.active`);
        const target = $(`#${screenId}`);
        if (!target || screenId === state.currentScreen) return;

        state.previousScreen = state.currentScreen;

        // Hide current
        if (current) {
            current.classList.remove('active');
            current.classList.remove('slide-in', 'fade-in');
        }

        // Show target
        target.classList.add('active');
        if (options.animate !== false) {
            target.classList.add(options.direction === 'back' ? 'fade-in' : 'slide-in');
            setTimeout(() => {
                target.classList.remove('slide-in', 'fade-in');
            }, 300);
        }

        state.currentScreen = screenId;

        // Show/hide bottom nav
        const navScreens = ['home-screen', 'search-screen', 'compare-screen', 'saved-screen', 'profile-screen'];
        if (navScreens.includes(screenId)) {
            bottomNav.classList.add('visible');
            updateNavActive(screenId);
        } else {
            bottomNav.classList.remove('visible');
        }

        // Scroll to top
        target.scrollTop = 0;
    }

    function goBack() {
        if (state.previousScreen) {
            navigateTo(state.previousScreen, { direction: 'back' });
        } else {
            navigateTo('home-screen', { direction: 'back' });
        }
    }

    function updateNavActive(screenId) {
        $$('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenId);
        });
    }

    // ═══════════════════════════════════
    // SPLASH SCREEN
    // ═══════════════════════════════════

    function initSplash() {
        setTimeout(() => {
            navigateTo('onboarding-screen', { animate: true });
        }, 2500);
    }

    // ═══════════════════════════════════
    // ONBOARDING
    // ═══════════════════════════════════

    function initOnboarding() {
        const slides = $$('.onboarding-slide');
        const dots = $$('.onboarding-dots .dot');
        const nextBtn = $('#onboarding-next');
        const skipBtn = $('#onboarding-skip');

        function goToSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'exit');
                if (i < index) slide.classList.add('exit');
                if (i === index) slide.classList.add('active');
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            state.onboardingSlide = index;

            // Update button text on last slide
            if (index === slides.length - 1) {
                nextBtn.innerHTML = '<span>Get Started</span>';
            } else {
                nextBtn.innerHTML = '<span>Next</span><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }
        }

        nextBtn.addEventListener('click', () => {
            if (state.onboardingSlide < slides.length - 1) {
                goToSlide(state.onboardingSlide + 1);
            } else {
                navigateTo('login-screen');
            }
        });

        skipBtn.addEventListener('click', () => {
            navigateTo('login-screen');
        });
    }

    // ═══════════════════════════════════
    // LOGIN
    // ═══════════════════════════════════

    function initLogin() {
        const form = $('#login-form');
        const toggleSignup = $('#toggle-signup');
        const title = $('#login-title');
        const submitBtn = $('#login-submit-btn');
        const passwordToggle = $('#password-toggle');
        const passwordInput = $('#password-input');
        let isSignup = false;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate login
            submitBtn.innerHTML = '<div class="btn-spinner"></div>';
            submitBtn.disabled = true;
            setTimeout(() => {
                navigateTo('home-screen');
                submitBtn.innerHTML = isSignup ? 'Create Account' : 'Sign In';
                submitBtn.disabled = false;
            }, 1000);
        });

        toggleSignup.addEventListener('click', (e) => {
            e.preventDefault();
            isSignup = !isSignup;
            title.textContent = isSignup ? 'Create Account' : 'Welcome Back';
            submitBtn.textContent = isSignup ? 'Create Account' : 'Sign In';
            toggleSignup.textContent = isSignup ? 'Sign in' : 'Sign up';
            toggleSignup.previousSibling.textContent = isSignup ? 'Already have an account? ' : "Don't have an account? ";
        });

        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
        });

        // Social login buttons
        $('#google-login-btn').addEventListener('click', () => {
            setTimeout(() => navigateTo('home-screen'), 500);
        });
        $('#apple-login-btn').addEventListener('click', () => {
            setTimeout(() => navigateTo('home-screen'), 500);
        });
    }

    // ═══════════════════════════════════
    // HOME SCREEN
    // ═══════════════════════════════════

    function initHome() {
        // Search bar trigger
        $('#search-bar-trigger').addEventListener('click', () => {
            navigateTo('search-screen');
            setTimeout(() => {
                const searchInput = $('#search-input');
                if (searchInput) searchInput.focus();
            }, 300);
        });

        // Filter chips
        $$('#home-filter-chips .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                $$('#home-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Notification button
        $('#notification-btn').addEventListener('click', () => {
            navigateTo('notifications-screen');
        });

        // Profile avatar
        $('#profile-avatar-btn').addEventListener('click', () => {
            navigateTo('profile-screen');
            updateNavActive('profile-screen');
        });

        // Scroll to top FAB
        const fab = $('#scroll-top-fab');
        const feed = $('#home-feed');
        if (feed && fab) {
            feed.addEventListener('scroll', () => {
                if (feed.scrollTop > 200) {
                    fab.style.display = 'flex';
                    fab.classList.remove('hidden');
                } else {
                    fab.classList.add('hidden');
                    setTimeout(() => {
                        if (fab.classList.contains('hidden')) fab.style.display = 'none';
                    }, 200);
                }
            });

            fab.addEventListener('click', () => {
                feed.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // College card clicks
        $$('.college-card .card-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateTo('detail-screen');
            });
        });

        $$('.college-card-compact').forEach(card => {
            card.addEventListener('click', () => {
                navigateTo('detail-screen');
            });
        });

        // Stream cards
        $$('.stream-card').forEach(card => {
            card.addEventListener('click', () => {
                navigateTo('search-screen');
            });
        });

        // Ranked items
        $$('.ranked-item').forEach(item => {
            item.addEventListener('click', () => {
                navigateTo('detail-screen');
            });
        });

        // Filter trigger
        $('#filter-trigger-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openFilterSheet();
        });
    }

    // ═══════════════════════════════════
    // SEARCH SCREEN
    // ═══════════════════════════════════

    function initSearch() {
        const searchInput = $('#search-input');
        const clearBtn = $('#search-clear-btn');
        const suggestions = $('#search-suggestions');
        const results = $('#search-results');

        $('#search-back-btn').addEventListener('click', goBack);

        searchInput.addEventListener('input', () => {
            const hasValue = searchInput.value.length > 0;
            clearBtn.style.display = hasValue ? 'flex' : 'none';

            if (hasValue && searchInput.value.length >= 2) {
                suggestions.style.display = 'none';
                results.style.display = 'block';
                populateSearchResults();
            } else {
                suggestions.style.display = 'block';
                results.style.display = 'none';
            }
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            suggestions.style.display = 'block';
            results.style.display = 'none';
            searchInput.focus();
        });

        // Popular search items
        $$('.popular-item').forEach(item => {
            item.addEventListener('click', () => {
                searchInput.value = item.textContent.trim();
                searchInput.dispatchEvent(new Event('input'));
            });
        });
    }

    function populateSearchResults() {
        const grid = $('#search-results-grid');
        const colleges = [
            { name: 'IIT Bombay', location: 'Mumbai, MH', rating: '4.8', fee: '₹2.2L', color: '#1e40af, #3b82f6' },
            { name: 'IIT Delhi', location: 'New Delhi', rating: '4.7', fee: '₹2.3L', color: '#059669, #34d399' },
            { name: 'IIT Madras', location: 'Chennai, TN', rating: '4.9', fee: '₹2.2L', color: '#7c3aed, #a78bfa' },
            { name: 'BITS Pilani', location: 'Pilani, RJ', rating: '4.6', fee: '₹5.1L', color: '#ea580c, #fb923c' },
            { name: 'NIT Trichy', location: 'Trichy, TN', rating: '4.4', fee: '₹1.5L', color: '#0891b2, #22d3ee' },
            { name: 'IIT Kanpur', location: 'Kanpur, UP', rating: '4.7', fee: '₹2.1L', color: '#d946ef, #f0abfc' },
        ];

        grid.innerHTML = colleges.map(c => `
            <div class="college-card college-card-compact stagger-child" onclick="document.querySelector('#detail-screen') && (function(){
                document.querySelector('.screen.active')?.classList.remove('active');
                document.querySelector('#detail-screen').classList.add('active','slide-in');
                document.querySelector('#bottom-nav').classList.remove('visible');
                setTimeout(()=>document.querySelector('#detail-screen').classList.remove('slide-in'),300);
            })()">
                <div class="card-image">
                    <div class="card-image-placeholder" style="background: linear-gradient(135deg, ${c.color});"><svg viewBox="0 0 180 100" fill="none"><rect x="50" y="30" width="80" height="50" rx="4" fill="rgba(255,255,255,0.2)"/><polygon points="90,12 40,35 140,35" fill="rgba(255,255,255,0.15)"/></svg></div>
                    <div class="card-badges"><span class="badge badge-verified">✓ Verified</span></div>
                </div>
                <div class="card-body">
                    <h4 class="card-title">${c.name}</h4>
                    <p class="card-location">${c.location}</p>
                    <div class="card-stats">
                        <span class="stat-pill"><span class="stat-icon">⭐</span><span class="stat-value">${c.rating}</span></span>
                        <span class="stat-pill"><span class="stat-icon">💰</span><span class="stat-value">${c.fee}</span></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════
    // FILTER BOTTOM SHEET
    // ═══════════════════════════════════

    function initFilterSheet() {
        const backdrop = $('#filter-backdrop');
        const sheet = $('#filter-sheet');

        backdrop.addEventListener('click', closeFilterSheet);

        // Filter section headers toggle
        $$('.filter-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                header.setAttribute('aria-expanded', !isExpanded);
                body.style.display = isExpanded ? 'none' : 'block';
                header.querySelector('svg').style.transform = isExpanded ? 'rotate(-90deg)' : '';
            });
        });

        // Filter chips in sheet
        $$('#filter-sheet .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('active');
                updateFilterCount();
            });
        });

        // Clear all
        $('#filter-clear-all').addEventListener('click', clearFilters);
        $('#filter-clear-btn').addEventListener('click', clearFilters);

        // Apply
        $('#filter-apply-btn').addEventListener('click', () => {
            closeFilterSheet();
            showToast(`Filters applied (${state.filterCount})`);
        });
    }

    function openFilterSheet() {
        $('#filter-backdrop').classList.add('visible');
        $('#filter-sheet').classList.add('visible');
        state.filterSheetOpen = true;
    }

    function closeFilterSheet() {
        $('#filter-backdrop').classList.remove('visible');
        $('#filter-sheet').classList.remove('visible');
        state.filterSheetOpen = false;
    }

    function clearFilters() {
        $$('#filter-sheet .filter-chip').forEach(chip => chip.classList.remove('active'));
        updateFilterCount();
    }

    function updateFilterCount() {
        state.filterCount = $$('#filter-sheet .filter-chip.active').length;
        $('.filter-count').textContent = `(${state.filterCount})`;
    }

    // ═══════════════════════════════════
    // COLLEGE DETAIL
    // ═══════════════════════════════════

    function initDetail() {
        // Back buttons
        $('#detail-back-btn').addEventListener('click', goBack);
        $('#detail-sticky-back').addEventListener('click', goBack);

        // Tabs
        $$('#detail-tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                $$('#detail-tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                $$('.tab-panel').forEach(panel => panel.classList.remove('active'));
                const targetPanel = $(`#tab-${tab.dataset.tab}`);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });

        // Sticky header on scroll
        const detailScreen = $('#detail-screen');
        const hero = $('#detail-hero');
        const stickyHeader = $('#detail-sticky-header');

        if (detailScreen && hero && stickyHeader) {
            detailScreen.addEventListener('scroll', () => {
                const heroBottom = hero.offsetHeight;
                stickyHeader.classList.toggle('visible', detailScreen.scrollTop > heroBottom);
            });
        }

        // Save button
        $('#detail-save-btn').addEventListener('click', () => {
            const btn = $('#detail-save-btn');
            btn.classList.toggle('saved');
            const isSaved = btn.classList.contains('saved');
            if (isSaved) {
                btn.querySelector('svg path').setAttribute('fill', '#EF4444');
                showToast('College saved to wishlist ❤️');
                createHeartParticles(btn);
            } else {
                btn.querySelector('svg path').setAttribute('fill', 'none');
                showToast('Removed from wishlist');
            }
        });
    }

    // ═══════════════════════════════════
    // SAVE BUTTON SYSTEM
    // ═══════════════════════════════════

    function initSaveButtons() {
        $$('.card-action-btn.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('saved');
                btn.classList.add('animating');
                setTimeout(() => btn.classList.remove('animating'), 400);

                if (btn.classList.contains('saved')) {
                    btn.querySelector('svg path').setAttribute('fill', '#EF4444');
                    btn.querySelector('svg path').setAttribute('stroke', '#EF4444');
                    createHeartParticles(btn);
                    showToast('Saved to wishlist ❤️');
                } else {
                    btn.querySelector('svg path').setAttribute('fill', 'none');
                    btn.querySelector('svg path').setAttribute('stroke', 'currentColor');
                    showToast('Removed from wishlist');
                }
            });
        });
    }

    function createHeartParticles(btn) {
        const rect = btn.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
            const particle = document.createElement('div');
            particle.className = 'heart-particle';
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            particle.style.position = 'fixed';
            particle.style.zIndex = '9999';
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 500);
        }
    }

    // ═══════════════════════════════════
    // BOTTOM NAVIGATION
    // ═══════════════════════════════════

    function initBottomNav() {
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.dataset.screen;
                if (screenId) {
                    navigateTo(screenId, { direction: 'fade' });
                }
            });
        });
    }

    // ═══════════════════════════════════
    // COMPARE SCREEN
    // ═══════════════════════════════════

    function initCompare() {
        // Placeholder — compare logic
    }

    // ═══════════════════════════════════
    // SAVED SCREEN
    // ═══════════════════════════════════

    function initSaved() {
        // Collection chips
        $$('.collection-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                if (chip.classList.contains('collection-add')) return;
                $$('.collection-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Saved card clicks
        $$('.saved-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.save-btn')) return;
                navigateTo('detail-screen');
            });
        });
    }

    // ═══════════════════════════════════
    // PROFILE SCREEN
    // ═══════════════════════════════════

    function initProfile() {
        // Dark mode toggle
        const toggle = $('#dark-mode-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                state.darkMode = !state.darkMode;
                toggle.classList.toggle('active', state.darkMode);
                document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
                showToast(state.darkMode ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
            });
        }

        // Sign out
        $('#signout-btn').addEventListener('click', () => {
            navigateTo('login-screen');
            bottomNav.classList.remove('visible');
        });
    }

    // ═══════════════════════════════════
    // NOTIFICATIONS
    // ═══════════════════════════════════

    function initNotifications() {
        $('#notif-back-btn').addEventListener('click', goBack);
    }

    // ═══════════════════════════════════
    // EXAMS & SCHOLARSHIPS
    // ═══════════════════════════════════

    function initExams() {
        $('#exams-back-btn').addEventListener('click', goBack);
    }

    function initScholarships() {
        $('#scholarships-back-btn').addEventListener('click', goBack);
    }

    // ═══════════════════════════════════
    // TOAST NOTIFICATION
    // ═══════════════════════════════════

    let toastTimeout;
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ═══════════════════════════════════
    // FILTER CHIPS (global)
    // ═══════════════════════════════════

    function initGlobalFilterChips() {
        // Review filter chips in detail
        $$('#tab-reviews .filter-chip, #tab-gallery .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const row = chip.closest('.filter-chips-row');
                if (row) {
                    row.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                }
            });
        });

        // Scholarship filter chips
        $$('#scholarships-screen .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const row = chip.closest('.filter-chips-row');
                if (row) {
                    row.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                }
            });
        });
    }

    // ═══════════════════════════════════
    // STAGGER ANIMATION OBSERVER
    // ═══════════════════════════════════

    function initStaggerObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('stagger-child');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            $$('.feed-section').forEach(section => {
                observer.observe(section);
            });
        }
    }

    // ═══════════════════════════════════
    // KEYBOARD SHORTCUT SUPPORT
    // ═══════════════════════════════════

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (state.filterSheetOpen) {
                closeFilterSheet();
            }
        }
    });

    // ═══════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════

    function init() {
        initSplash();
        initOnboarding();
        initLogin();
        initHome();
        initSearch();
        initFilterSheet();
        initDetail();
        initSaveButtons();
        initBottomNav();
        initCompare();
        initSaved();
        initProfile();
        initNotifications();
        initExams();
        initScholarships();
        initGlobalFilterChips();
        initStaggerObserver();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
