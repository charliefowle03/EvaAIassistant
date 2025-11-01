// ==UserScript==
// @name         Eva Assistant Widget
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Eva Widget - Fixed Multiple Tabs Issue
// @author       You
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @updateURL    https://github.com/charliefowle03/EvaAIassistant/raw/refs/heads/main/Firefox%20Version%20-%20Eva%20Assistant%20Widget.user.js
// @downloadURL  https://github.com/charliefowle03/EvaAIassistant/raw/refs/heads/main/Firefox%20Version%20-%20Eva%20Assistant%20Widget.user.js
// ==/UserScript==

(function() {
    'use strict';

    // STORAGE FALLBACK WRAPPER - Only change GM calls to safe calls
    const safeGM_setValue = (key, value) => {
        try {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(key, value);
            } else {
                localStorage.setItem('eva_gm_' + key, JSON.stringify(value));
            }
        } catch (e) {
            try {
                sessionStorage.setItem('eva_gm_' + key, JSON.stringify(value));
            } catch (e2) {
                console.log('🎯 ❌ Storage failed:', e2);
            }
        }
    };

    const safeGM_getValue = (key, defaultValue) => {
        try {
            if (typeof GM_getValue !== 'undefined') {
                return GM_getValue(key, defaultValue);
            } else {
                const stored = localStorage.getItem('eva_gm_' + key);
                return stored !== null ? JSON.parse(stored) : defaultValue;
            }
        } catch (e) {
            try {
                const stored = sessionStorage.getItem('eva_gm_' + key);
                return stored !== null ? JSON.parse(stored) : defaultValue;
            } catch (e2) {
                return defaultValue;
            }
        }
    };

    const safeGM_addStyle = (css) => {
        try {
            if (typeof GM_addStyle !== 'undefined') {
                GM_addStyle(css);
            } else {
                const style = document.createElement('style');
                style.textContent = css;
                document.head.appendChild(style);
            }
        } catch (e) {
            console.log('🎯 ❌ Style injection failed:', e);
        }
    };

    // Add debugging for storage availability
    console.log('🎯 DEBUG: GM_setValue available:', typeof GM_setValue !== 'undefined');
    console.log('🎯 DEBUG: GM_getValue available:', typeof GM_getValue !== 'undefined');
    console.log('🎯 DEBUG: localStorage available:', typeof localStorage !== 'undefined');
    console.log('🎯 DEBUG: sessionStorage available:', typeof sessionStorage !== 'undefined');

    // ULTIMATE PROTECTION - CHECK IMMEDIATELY
    if (window.evaWidgetRan || window.EVA_SCRIPT_LOADED) {
        console.log('🎯 ULTIMATE PROTECTION: Script already ran - BLOCKING');
        return;
    }
    window.evaWidgetRan = true;
    window.EVA_SCRIPT_LOADED = true;

    // Prevent widget from running in iframes/ads
    if (window !== window.top) {
        console.log('🎯 Eva widget: Skipping iframe/ad window');
        return;
    }

    // Fix page loading at bottom - scroll to top on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.scrollTo(0, 0), 50);
        });
    } else {
        setTimeout(() => window.scrollTo(0, 0), 50);
    }

    // THEME DEFINITIONS
    const themes = {
        default: {
            name: 'Amazon Orange',
            background: '#d8d5d4',
            border: '#ff9900',
            borderHover: '#e6890a',
            inputBg: '#232F3E',
            inputText: '#FFFFFF',
            inputPlaceholder: '#AAB7B8',
            buttonBg: '#ff9900',
            buttonHover: '#e6890a',
            buttonText: '#232F3E',
            iconColor: '#565959',
            pulseColor: 'rgba(255, 153, 0, 0.6)',
            focusColor: 'rgba(255,153,0,0.2)'
        },
        blackwhite: {
            name: 'Black & White',
            background: '#ffffff',
            border: '#000000',
            borderHover: '#333333',
            inputBg: '#000000',
            inputText: '#ffffff',
            inputPlaceholder: '#cccccc',
            buttonBg: '#000000',
            buttonHover: '#333333',
            buttonText: '#ffffff',
            iconColor: '#666666',
            pulseColor: 'rgba(0, 0, 0, 0.6)',
            focusColor: 'rgba(0,0,0,0.2)'
        },
        blue: {
            name: 'Amazon Blue',
            background: '#e8f4f8',
            border: '#0073bb',
            borderHover: '#005a91',
            inputBg: '#232F3E',
            inputText: '#ffffff',
            inputPlaceholder: '#AAB7B8',
            buttonBg: '#0073bb',
            buttonHover: '#005a91',
            buttonText: '#ffffff',
            iconColor: '#0073bb',
            pulseColor: 'rgba(0, 115, 187, 0.6)',
            focusColor: 'rgba(0,115,187,0.2)'
        },
        dark: {
            name: 'Amazon Dark',
            background: '#37475a',
            border: '#ff9900',
            borderHover: '#ffb84d',
            inputBg: '#232F3E',
            inputText: '#ffffff',
            inputPlaceholder: '#AAB7B8',
            buttonBg: '#ff9900',
            buttonHover: '#ffb84d',
            buttonText: '#232F3E',
            iconColor: '#ffffff',
            pulseColor: 'rgba(255, 153, 0, 0.6)',
            focusColor: 'rgba(255,153,0,0.2)'
        }
    };

    // GLOBAL THEME MANAGEMENT - USING SAFE FUNCTIONS
    const saveGlobalTheme = (themeName) => {
        try {
            safeGM_setValue('evaWidgetGlobalTheme', themeName);
            safeGM_setValue('evaWidgetGlobalThemeBackup', themeName);
            safeGM_setValue('evaWidgetThemeTimestamp', Date.now());
            console.log('🎯 Global theme saved:', themeName);
            broadcastThemeChange(themeName);
        } catch (e) {
            console.log('🎯 Global theme save failed:', e);
        }
    };

    const loadGlobalTheme = () => {
        try {
            const savedTheme = safeGM_getValue('evaWidgetGlobalTheme', 'default') ||
                              safeGM_getValue('evaWidgetGlobalThemeBackup', 'default');
            console.log('🎯 Global theme loaded:', savedTheme);
            return savedTheme;
        } catch (e) {
            console.log('🎯 Global theme load failed:', e);
            return 'default';
        }
    };

    const broadcastThemeChange = (themeName) => {
        try {
            safeGM_setValue('evaWidgetThemeBroadcast', JSON.stringify({
                theme: themeName,
                timestamp: Date.now(),
                source: window.location.href
            }));
            console.log('🎯 Theme change broadcasted:', themeName);
        } catch (e) {
            console.log('🎯 Theme broadcast failed:', e);
        }
    };

    const listenForThemeChanges = (applyThemeCallback) => {
        let lastBroadcastTimestamp = 0;

        const checkForThemeUpdates = () => {
            try {
                const broadcastData = safeGM_getValue('evaWidgetThemeBroadcast', '');
                if (broadcastData) {
                    const data = JSON.parse(broadcastData);
                    if (data.timestamp > lastBroadcastTimestamp && data.source !== window.location.href) {
                        lastBroadcastTimestamp = data.timestamp;
                        console.log('🎯 Received theme change from another tab:', data.theme);
                        applyThemeCallback(data.theme);
                    }
                }
            } catch (e) {
                console.log('🎯 Theme update check failed:', e);
            }
        };

        setInterval(checkForThemeUpdates, 500);
    };

    const isEvaPage = window.location.hostname.includes('datacenteracademy.dco.aws.dev') || window.location.hostname.includes('eva.aws.dev');

    console.log('🎯 DEBUG: Current hostname:', window.location.hostname);
    console.log('🎯 DEBUG: Is Eva page:', isEvaPage);

    if (isEvaPage) {
        console.log('🎯 DEBUG: Eva page detected');

        if (window.EVA_PAGE_PROCESSED ||
            window.EVA_PASTE_STARTED ||
            window.EVA_HANDLER_RUNNING ||
            document.querySelector('[data-eva-processed="true"]')) {
            console.log('🎯 MEGA PROTECTION: Eva page already processed - BLOCKING ALL');
            return;
        }

        window.EVA_PAGE_PROCESSED = true;
        window.EVA_PASTE_STARTED = true;
        window.EVA_HANDLER_RUNNING = true;

        const marker = document.createElement('div');
        marker.setAttribute('data-eva-processed', 'true');
        marker.style.display = 'none';
        document.body.appendChild(marker);

        console.log('🎯 DEBUG: ALL PROTECTION FLAGS SET');

        const storedPrompt = safeGM_getValue('pendingEvaPrompt', '');
        const isFileMode = safeGM_getValue('fileAttachMode', false);
        const cameFromWidget = safeGM_getValue('cameFromWidget', false);

        console.log('🎯 DEBUG: storedPrompt:', storedPrompt);
        console.log('🎯 DEBUG: isFileMode:', isFileMode);
        console.log('🎯 DEBUG: cameFromWidget:', cameFromWidget);

        safeGM_setValue('pendingEvaPrompt', '');
        safeGM_setValue('fileAttachMode', false);
        safeGM_setValue('cameFromWidget', false);
        console.log('🎯 DEBUG: Values cleared immediately to prevent duplicates');

        if (!cameFromWidget && !storedPrompt && !isFileMode) {
            console.log('🎯 DEBUG: No conditions met for processing - exiting');
            return;
        }

        const balancedTyping = async (input, text) => {
            if (window.EVA_PASTE_EXECUTED) {
                console.log('🎯 TYPING ALREADY EXECUTED - BLOCKING');
                return false;
            }
            window.EVA_PASTE_EXECUTED = true;

            console.log('🎯 BALANCED TYPING SIMULATION:', text);

            try {
                input.focus();
                input.click();
                input.value = '';

                await new Promise(resolve => setTimeout(resolve, 50));

                input.value = text;

                const events = [
                    new CompositionEvent('compositionstart', { bubbles: true }),
                    new Event('input', { bubbles: true, cancelable: true, composed: true }),
                    new CompositionEvent('compositionend', { bubbles: true, data: text }),
                    new Event('change', { bubbles: true, cancelable: true }),
                    new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' }),
                    new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter' })
                ];

                for (let i = 0; i < events.length; i++) {
                    input.dispatchEvent(events[i]);
                    if (i < events.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                }

                try {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

                    if (input.tagName === 'INPUT') {
                        nativeInputValueSetter.call(input, text);
                    } else if (input.tagName === 'TEXTAREA') {
                        nativeTextAreaValueSetter.call(input, text);
                    }

                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } catch (e) {
                    console.log('🎯 Native setter failed, continuing anyway');
                }

                console.log('🎯 BALANCED TYPING COMPLETED');

                setTimeout(() => {
                    const submitBtn = document.querySelector('button[data-testid="submit-follow-up-prompt"]') ||
                                     document.querySelector('button[type="submit"]');
                    console.log('🎯 DEBUG: Submit button after typing - exists:', !!submitBtn, 'disabled:', submitBtn?.disabled);
                }, 200);

                return true;

            } catch (error) {
                console.log('🎯 Balanced typing failed:', error);
                window.EVA_PASTE_EXECUTED = false;
                return false;
            }
        };

        const waitForSubmitButton = () => {
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 60;

                const checkButton = () => {
                    const submitBtn = document.querySelector('button[data-testid="submit-follow-up-prompt"]') ||
                                     document.querySelector('button[type="submit"]') ||
                                     document.querySelector('button[aria-label*="Send"]') ||
                                     document.querySelector('button[aria-label*="Submit"]') ||
                                     document.querySelector('form button:not([disabled])');

                    if (attempts % 8 === 0) {
                        console.log('🎯 DEBUG: Button check attempt', attempts + 1, '- Found:', !!submitBtn, 'Disabled:', submitBtn?.disabled);
                    }

                    if (submitBtn && !submitBtn.disabled) {
                        console.log('🎯 DEBUG: Submit button is enabled after', attempts + 1, 'attempts!');
                        resolve(submitBtn);
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(checkButton, 75);
                    } else {
                        console.log('🎯 DEBUG: Submit button never became enabled after', maxAttempts, 'attempts');
                        resolve(null);
                    }
                };

                checkButton();
            });
        };

        const doBalancedSubmit = async () => {
            if (window.EVA_SUBMIT_EXECUTED) {
                console.log('🎯 SUBMIT ALREADY EXECUTED - BLOCKING');
                return;
            }
            window.EVA_SUBMIT_EXECUTED = true;

            console.log('🎯 BALANCED SUBMIT - WAITING FOR BUTTON...');

            const submitBtn = await waitForSubmitButton();

            if (submitBtn) {
                console.log('🎯 BALANCED SUBMIT - CLICKING NOW');
                submitBtn.click();
                console.log('🎯 SUBMIT CLICKED SUCCESSFULLY');
            } else {
                console.log('🎯 SUBMIT BUTTON NOT READY - MANUAL SUBMISSION REQUIRED');
                window.EVA_SUBMIT_EXECUTED = false;
            }
        };

        const addAttachmentGlow = () => {
            console.log('🎯 File mode - adding attachment button glow');

            safeGM_addStyle(`
                @keyframes fastPulse {
                    0%, 100% { border: 3px solid rgba(255, 153, 0, 0.3); box-shadow: 0 0 5px rgba(255, 153, 0, 0.4); }
                    50% { border: 3px solid rgba(255, 153, 0, 1); box-shadow: 0 0 15px rgba(255, 153, 0, 0.9); }
                }
                .fast-pulse { animation: fastPulse 1s ease-in-out infinite !important; }
            `);

            const findAttachButton = () => {
                const allButtons = document.querySelectorAll('button');
                console.log('🎯 DEBUG: Found', allButtons.length, 'buttons total');

                if (allButtons.length > 5) {
                    const button5 = allButtons[5];
                    console.log('🎯 DEBUG: Button 6 text:', button5.textContent?.trim());
                    console.log('🎯 DEBUG: Button 6 aria-label:', button5.getAttribute('aria-label'));
                    button5.classList.add('fast-pulse');

                    setTimeout(() => button5.classList.remove('fast-pulse'), 15000);
                    button5.addEventListener('click', () => {
                        setTimeout(() => button5.classList.remove('fast-pulse'), 1000);
                    }, { once: true });
                }

                const attachButtons = document.querySelectorAll('button[aria-label*="attach"], button[title*="attach"], button[aria-label*="file"], button[title*="file"]');
                attachButtons.forEach(btn => {
                    console.log('🎯 DEBUG: Found potential attach button:', btn.textContent?.trim(), btn.getAttribute('aria-label'));
                    btn.classList.add('fast-pulse');
                    setTimeout(() => btn.classList.remove('fast-pulse'), 15000);
                });
            };

            setTimeout(findAttachButton, 100);
            setTimeout(findAttachButton, 500);
            setTimeout(findAttachButton, 1000);
        };

        const executeFaster = async () => {
            console.log('🎯 FASTER EXECUTION STARTING');

            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });

            console.log('🎯 DEBUG: Waiting 600ms for page to settle...');
            await new Promise(resolve => setTimeout(resolve, 600));

            if (storedPrompt && (cameFromWidget || isFileMode)) {
                console.log('🎯 Processing prompt for', isFileMode ? 'FILE MODE' : 'REGULAR MODE');

                let input = null;
                for (let i = 0; i < 35; i++) {
                    input = document.querySelector('[data-testid="prompt-input"]') ||
                           document.querySelector('textarea[placeholder*="Ask"]') ||
                           document.querySelector('textarea[placeholder*="ask"]') ||
                           document.querySelector('textarea') ||
                           document.querySelector('input[type="text"]') ||
                           document.querySelector('[contenteditable="true"]');

                    if (input) {
                        console.log('🎯 INPUT FOUND after', i + 1, 'attempts');
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                if (input) {
                    const success = await balancedTyping(input, storedPrompt);
                    if (success) {
                        console.log('🎯 TYPING SUCCESS for', isFileMode ? 'FILE MODE' : 'REGULAR MODE');

                        if (!isFileMode) {
                            console.log('🎯 Regular mode - auto-submitting...');
                            await new Promise(resolve => setTimeout(resolve, 400));
                            await doBalancedSubmit();
                        } else {
                            console.log('🎯 File mode - skipping auto-submit, adding attachment glow...');
                            setTimeout(addAttachmentGlow, 500);
                        }
                    }
                } else {
                    console.log('🎯 INPUT NOT FOUND - giving up');
                }
            }

            if (isFileMode && !storedPrompt) {
                console.log('🎯 File mode without prompt - just adding glow');
                setTimeout(addAttachmentGlow, 500);
            }

            console.log('🎯 FASTER EXECUTION COMPLETED');
        };

        console.log('🎯 STARTING FASTER EXECUTION');
        executeFaster();

        return;
    }

    // ZOOM-RESISTANT DIMENSIONS AND POSITIONING
    let evaWidget = null;

    const getZoomLevel = () => {
        return window.devicePixelRatio || 1;
    };

    const getZoomResistantDimensions = () => {
        const zoom = getZoomLevel();
        const baseWidth = 181.45;
        const baseHeight = 34.38;
        const minWidth = 33.43;

        const widgetWidth = baseWidth / zoom;
        const widgetHeight = baseHeight / zoom;
        const minWidgetWidth = minWidth / zoom;

        return {
            expanded: { width: widgetWidth, height: widgetHeight },
            minimized: { width: minWidgetWidth, height: widgetHeight },
            zoom: zoom
        };
    };

    const getDomainKey = (baseKey) => {
        const domain = window.location.hostname.replace(/[^a-zA-Z0-9]/g, '_');
        return `${baseKey}_${domain}`;
    };

    const domainSpecificSavePos = (x, y) => {
        try {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

            const data = {
                percentX: (x / vw) * 100,
                percentY: (y / vh) * 100,
                absoluteX: x,
                absoluteY: y,
                windowWidth: vw,
                windowHeight: vh,
                timestamp: Date.now(),
                url: window.location.hostname
            };

            const posKey = getDomainKey('evaWidgetPosition');
            const backupKey = getDomainKey('evaWidgetPositionBackup');
            const backup2Key = getDomainKey('evaWidgetPositionBackup2');

            safeGM_setValue(posKey, JSON.stringify(data));
            safeGM_setValue(backupKey, JSON.stringify(data));
            safeGM_setValue(backup2Key, JSON.stringify(data));

            console.log('🎯 Position saved for domain:', window.location.hostname, 'at:', data);
        } catch (e) {
            console.log('🎯 Domain-specific save failed:', e);
        }
    };

    // FIXED POSITION LOADING - TOP CENTER DEFAULT
    const domainSpecificLoadPos = () => {
        try {
            const posKey = getDomainKey('evaWidgetPosition');
            const backupKey = getDomainKey('evaWidgetPositionBackup');
            const backup2Key = getDomainKey('evaWidgetPositionBackup2');

            const saved = safeGM_getValue(posKey, '') ||
                         safeGM_getValue(backupKey, '') ||
                         safeGM_getValue(backup2Key, '');

            if (saved) {
                const pos = JSON.parse(saved);
                console.log('🎯 Position loaded for domain:', window.location.hostname, 'from:', pos);

                if (pos.percentX !== undefined && pos.percentY !== undefined) {
                    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

                    let x = (pos.percentX * vw) / 100;
                    let y = (pos.percentY * vh) / 100;

                    const margin = Math.min(vw * 0.01, 20);
                    x = Math.max(margin, Math.min(x, vw - 200));
                    y = Math.max(margin, Math.min(y, vh - 50));

                    console.log('🎯 Calculated position for domain:', window.location.hostname, ':', { x, y });
                    return { x, y };
                }
            } else {
                console.log('🎯 No saved position found for domain:', window.location.hostname);
            }
        } catch (e) {
            console.log('🎯 Domain-specific load failed:', e);
        }

        // DEFAULT POSITION: TOP CENTER
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const dimensions = getZoomResistantDimensions();
        const widgetWidth = dimensions.expanded.width;

        const defaultPos = {
            x: (vw - widgetWidth) / 2, // Center horizontally
            y: 20 // 20px from top
        };
        console.log('🎯 Using TOP CENTER default position for domain:', window.location.hostname, ':', defaultPos);
        return defaultPos;
    };

    const domainSpecificSaveMin = (min) => {
        try {
            const minKey = getDomainKey('evaWidgetMinimized');
            const minBackupKey = getDomainKey('evaWidgetMinimizedBackup');

            safeGM_setValue(minKey, min);
            safeGM_setValue(minBackupKey, min);
            console.log('🎯 Minimized state saved for domain:', window.location.hostname, ':', min);
        } catch (e) {
            console.log('🎯 Domain-specific min save failed:', e);
        }
    };

    const domainSpecificLoadMin = () => {
        try {
            const minKey = getDomainKey('evaWidgetMinimized');
            const minBackupKey = getDomainKey('evaWidgetMinimizedBackup');

            const min = safeGM_getValue(minKey, false) || safeGM_getValue(minBackupKey, false);
            console.log('🎯 Minimized state loaded for domain:', window.location.hostname, ':', min);
            return min;
        } catch (e) {
            console.log('🎯 Domain-specific min load failed:', e);
            return false;
        }
    };

    const fastDraggable = (el, excludes) => {
        let dragging = false, startX, startY, initX, initY;
        const isExcluded = (target) => excludes.some(sel => target.matches && (target.matches(sel) || target.closest(sel)));

        el.addEventListener('mousedown', (e) => {
            if (isExcluded(e.target)) return;
            dragging = true;
            [startX, startY, initX, initY] = [e.clientX, e.clientY, parseInt(el.style.left) || 0, parseInt(el.style.top) || 0];
            document.body.style.cursor = 'move';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            e.preventDefault();
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            const newX = Math.max(0, Math.min(initX + e.clientX - startX, vw - el.offsetWidth));
            const newY = Math.max(0, Math.min(initY + e.clientY - startY, vh - el.offsetHeight));
            el.style.left = newX + 'px';
            el.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            document.body.style.cursor = '';
            const finalX = parseInt(el.style.left) || 0;
            const finalY = parseInt(el.style.top) || 0;
            domainSpecificSavePos(finalX, finalY);
            console.log('🎯 Position saved after drag:', finalX, finalY);
        });
    };

               // GLOBAL SEARCH FUNCTION - SIMPLE NEW TAB (COMPATIBILITY FIXED)
    let searchExecuting = false;

    const performSearch = (query, fileMode = false) => {
        if (searchExecuting) {
            console.log('🎯 🚫 DUPLICATE SEARCH BLOCKED - already executing');
            return false;
        }

        searchExecuting = true;
        console.log('🎯 🚀 SEARCH FUNCTION CALLED!');
        console.log('🎯 Query:', query);
        console.log('🎯 File Mode:', fileMode);

        // Don't proceed if no query and not in file mode
        if (!query && !fileMode) {
            console.log('🎯 ❌ No query provided and not file mode, aborting');
            searchExecuting = false;
            alert('Please enter a query or use attach mode');
            return false;
        }

        try {
            console.log('🎯 💾 Setting GM values...');
            safeGM_setValue('cameFromWidget', true);
            safeGM_setValue('pendingEvaPrompt', query);
            safeGM_setValue('fileAttachMode', fileMode);

            console.log('🎯 🌐 Opening Eva in NEW TAB...');

            const evaUrl = 'https://eva.aws.dev';

            // Method 1: Simple window.open
            console.log('🎯 Trying simple window.open...');
            const newWindow = window.open(evaUrl, '_blank');

            if (newWindow) {
                console.log('🎯 ✅ Tab opened successfully');
                setTimeout(() => { searchExecuting = false; }, 2000);
                return true;
            }

            // Method 2: If blocked, create and click link (simple version)
            console.log('🎯 Window.open blocked, trying link method...');
            const link = document.createElement('a');
            link.href = evaUrl;
            link.target = '_blank';
            link.style.display = 'none';
            document.body.appendChild(link);

            // Simple click - no complex MouseEvent
            link.click();

            // Clean up
            setTimeout(() => {
                if (link.parentNode) {
                    document.body.removeChild(link);
                }
            }, 100);

            console.log('🎯 ✅ Link clicked - tab should open');
            setTimeout(() => { searchExecuting = false; }, 2000);
            return true;

        } catch (error) {
            console.log('🎯 ❌ ERROR in performSearch:', error);
            searchExecuting = false;
            alert('Error occurred: ' + error.message);
            return false;
        }
    };

    // Theme context menu (keeping existing code)
    const createThemeMenu = (x, y, applyThemeCallback) => {
        const existingMenu = document.getElementById('eva-theme-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'eva-theme-menu';
        menu.style.cssText = `
            position: fixed !important;
            left: ${x}px !important;
            top: ${y}px !important;
            background: #ffffff !important;
            border: 2px solid #ff9900 !important;
            border-radius: 6px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            z-index: 2147483648 !important;
            font-family: "Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif !important;
            font-size: 14px !important;
            min-width: 180px !important;
            overflow: hidden !important;
        `;

        const currentTheme = loadGlobalTheme();

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 15px !important;
            background: #f8f9fa !important;
            border-bottom: 1px solid #eee !important;
            font-weight: bold !important;
            color: #232F3E !important;
            font-size: 12px !important;
            text-align: center !important;
        `;
        header.textContent = '🎨 Global Theme Settings';
        menu.appendChild(header);

        Object.keys(themes).forEach((themeKey, index) => {
            const theme = themes[themeKey];
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px 15px !important;
                cursor: pointer !important;
                border-bottom: ${index < Object.keys(themes).length - 1 ? '1px solid #eee' : 'none'} !important;
                transition: background-color 0.2s !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                color: #232F3E !important;
                position: relative !important;
            `;

            const leftSection = document.createElement('div');
            leftSection.style.cssText = `
                display: flex !important;
                align-items: center !important;
                flex-grow: 1 !important;
            `;

            const themeName = document.createElement('span');
            themeName.textContent = theme.name;
            themeName.style.cssText = `
                font-weight: ${currentTheme === themeKey ? 'bold' : 'normal'} !important;
                margin-right: 8px !important;
            `;

            const colorPreview = document.createElement('div');
            colorPreview.style.cssText = `
                width: 18px !important;
                height: 18px !important;
                border-radius: 3px !important;
                background: ${theme.border} !important;
                border: 1px solid #ccc !important;
                margin-right: 8px !important;
                flex-shrink: 0 !important;
            `;

            leftSection.appendChild(colorPreview);
            leftSection.appendChild(themeName);

            if (currentTheme === themeKey) {
                const checkmark = document.createElement('span');
                checkmark.textContent = '✓';
                checkmark.style.cssText = `
                    color: #ff9900 !important;
                    font-weight: bold !important;
                    font-size: 16px !important;
                `;
                item.appendChild(checkmark);
            }

            item.appendChild(leftSection);

            item.onmouseenter = () => item.style.backgroundColor = '#f5f5f5';
            item.onmouseleave = () => item.style.backgroundColor = 'transparent';

            item.onclick = (e) => {
                e.stopPropagation();
                saveGlobalTheme(themeKey);
                applyThemeCallback(themeKey);
                menu.remove();
                console.log('🎯 Global theme changed to:', theme.name);
                showThemeChangeNotification(theme.name);
            };

            menu.appendChild(item);
        });

        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 6px 15px !important;
            background: #f8f9fa !important;
            border-top: 1px solid #eee !important;
            font-size: 10px !important;
            color: #666 !important;
            text-align: center !important;
        `;
        footer.textContent = 'Theme applies to all pages globally';
        menu.appendChild(footer);

        document.body.appendChild(menu);

        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);

        const rect = menu.getBoundingClientRect();
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        if (rect.right > vw) {
            menu.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > vh) {
            menu.style.top = (y - rect.height) + 'px';
        }

        return menu;
    };

    const showThemeChangeNotification = (themeName) => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: #232F3E !important;
            color: #ffffff !important;
            padding: 12px 20px !important;
            border-radius: 6px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            z-index: 2147483649 !important;
            font-family: "Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif !important;
            font-size: 14px !important;
            border-left: 4px solid #ff9900 !important;
            opacity: 0 !important;
            transform: translateX(100%) !important;
            transition: all 0.3s ease !important;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px;">🎨</span>
                <span>Theme changed to <strong>${themeName}</strong></span>
            </div>
            <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
                Applied globally across all pages
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    const createFastWidget = () => {
        const existing = document.getElementById('eva-search-box');
        if (existing && existing.parentNode && existing.offsetParent !== null) return existing;
        if (existing) existing.remove();
        if (!document.body) { setTimeout(createFastWidget, 50); return; }

        const pos = domainSpecificLoadPos();
        const isMin = domainSpecificLoadMin();
        const currentThemeName = loadGlobalTheme();
        const currentTheme = themes[currentThemeName] || themes.default;
        const dimensions = getZoomResistantDimensions();

        console.log('🎯 Creating widget for domain:', window.location.hostname, 'at TOP CENTER position:', pos, 'minimized:', isMin, 'global theme:', currentThemeName);

        const currentDim = isMin ? dimensions.minimized : dimensions.expanded;
        const zoom = dimensions.zoom;

        const container = document.createElement('div');
        container.id = 'eva-search-box';
        container.style.cssText = `
            position: fixed !important;
            left: ${pos.x}px !important;
            top: ${pos.y}px !important;
            background: ${currentTheme.background} !important;
            border: ${2/zoom}px solid ${currentTheme.border} !important;
            border-radius: ${4/zoom}px !important;
            padding: ${isMin ? (4/zoom) + 'px ' + (3/zoom) + 'px' : (4/zoom) + 'px ' + (5/zoom) + 'px'} !important;
            z-index: 2147483647 !important;
            box-shadow: 0 ${2/zoom}px ${6/zoom}px rgba(0,0,0,0.2) !important;
            font-family: "Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif !important;
            cursor: move !important;
            font-size: ${14/zoom}px !important;
            box-sizing: border-box !important;
            width: ${currentDim.width}px !important;
            height: ${currentDim.height}px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: visible !important;
            pointer-events: auto !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: scale(1) !important;
            transform-origin: top left !important;
        `;

        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex !important;
            align-items: center !important;
            justify-content: ${isMin ? 'center' : 'space-between'} !important;
            gap: ${2/zoom}px !important;
            height: ${(currentDim.height - 8/zoom)}px !important;
            padding: 0 !important;
            width: 100% !important;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ask Eva...';
        input.id = 'eva-search-input';
        input.style.cssText = `
            width: ${(currentDim.width - 50/zoom)}px !important;
            height: ${Math.max(22/zoom, currentDim.height * 0.6)}px !important;
            padding: 0 ${6/zoom}px !important;
            border: none !important;
            border-radius: ${3/zoom}px !important;
            box-sizing: border-box !important;
            cursor: text !important;
            font-size: ${Math.max(11/zoom, currentDim.height * 0.3)}px !important;
            font-family: "Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif !important;
            font-weight: 400 !important;
            line-height: ${Math.max(20/zoom, currentDim.height * 0.55)}px !important;
            margin: 0 !important;
            color: ${currentTheme.inputText} !important;
            vertical-align: middle !important;
            background-color: ${currentTheme.inputBg} !important;
            flex-grow: 1 !important;
            flex-shrink: 1 !important;
            display: ${isMin ? 'none' : 'block'} !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: scale(1) !important;
        `;

        const attachBtn = document.createElement('div');
        const svgSize = Math.max(16/zoom, currentDim.height * 0.44);
        attachBtn.innerHTML = `<svg width="${svgSize}px" height="${svgSize}px" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19c-1.28 1.28-2.98 1.98-4.78 1.98s-3.5-.7-4.78-1.98c-2.64-2.64-2.64-6.92 0-9.56l9.19-9.19c.94-.94 2.2-1.46 3.54-1.46s2.6.52 3.54 1.46c1.95 1.95 1.95 5.12 0 7.07l-9.19 9.19c-.64.64-1.49 1-2.39 1s-1.75-.36-2.39-1c-1.32-1.32-1.32-3.46 0-4.78l8.48-8.48" fill="none" stroke="${currentTheme.iconColor}" stroke-width="${2/zoom}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        attachBtn.style.cssText = `
            flex-shrink: 0 !important;
            cursor: pointer !important;
            padding: ${2/zoom}px !important;
            border-radius: ${3/zoom}px !important;
            transition: background-color 0.1s !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: ${Math.max(20/zoom, currentDim.height * 0.55)}px !important;
            height: ${Math.max(20/zoom, currentDim.height * 0.55)}px !important;
            transform: scale(1) !important;
        `;
        attachBtn.title = 'Attach file to Eva';
        attachBtn.onmouseenter = () => attachBtn.style.backgroundColor = '#f0f0f0';
        attachBtn.onmouseleave = () => attachBtn.style.backgroundColor = 'transparent';

        const createFastMinBtn = (side, arrow) => {
            const btn = document.createElement('div');
            btn.innerHTML = arrow;
            btn.className = 'eva-minimize-button';
            btn.title = 'Click to minimize/maximize';
            btn.style.cssText = `
                position: absolute !important;
                ${side}: ${-10/zoom}px !important;
                top: 50% !important;
                transform: translateY(-50%) scale(1) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: ${10/zoom}px !important;
                height: ${Math.max(20/zoom, currentDim.height * 0.55)}px !important;
                background-color: ${currentTheme.buttonBg} !important;
                color: ${currentTheme.buttonText} !important;
                font-size: ${Math.max(7/zoom, currentDim.height * 0.19)}px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border-radius: ${side === 'left' ? (3/zoom) + 'px 0 0 ' + (3/zoom) + 'px' : '0 ' + (3/zoom) + 'px ' + (3/zoom) + 'px 0'} !important;
                border: ${1/zoom}px solid ${currentTheme.borderHover} !important;
                user-select: none !important;
                font-family: "Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif !important;
                transition: background-color 0.1s !important;
                z-index: 1000001 !important;
            `;
            btn.onmouseenter = () => btn.style.backgroundColor = currentTheme.buttonHover;
            btn.onmouseleave = () => btn.style.backgroundColor = currentTheme.buttonBg;
            return btn;
        };

        const leftBtn = createFastMinBtn('left', isMin ? '◀' : '▶');
        const rightBtn = createFastMinBtn('right', isMin ? '▶' : '◀');

        const applyTheme = (themeName) => {
            const theme = themes[themeName] || themes.default;

            container.style.background = theme.background;
            container.style.borderColor = theme.border;

            input.style.backgroundColor = theme.inputBg;
            input.style.color = theme.inputText;

            const svg = attachBtn.querySelector('svg path');
            if (svg) svg.setAttribute('stroke', theme.iconColor);

            [leftBtn, rightBtn].forEach(btn => {
                btn.style.backgroundColor = theme.buttonBg;
                btn.style.color = theme.buttonText;
                btn.style.borderColor = theme.borderHover;
                btn.onmouseenter = () => btn.style.backgroundColor = theme.buttonHover;
                btn.onmouseleave = () => btn.style.backgroundColor = theme.buttonBg;
            });

            updateThemeStyles(theme, zoom);

            console.log('🎯 Global theme applied:', theme.name);
        };

        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            createThemeMenu(e.clientX, e.clientY, applyTheme);
        });

        listenForThemeChanges(applyTheme);

        // SINGLE CONSOLIDATED EVENT HANDLER - NO DUPLICATES
        console.log('🎯 Setting up SINGLE event handler...');

        let searchInProgress = false; // Prevent multiple simultaneous searches

        const handleSearch = (query, fileMode = false) => {
            if (searchInProgress) {
                console.log('🎯 🚫 Search already in progress, ignoring duplicate');
                return false;
            }

            searchInProgress = true;
            console.log('🎯 🚀 SINGLE SEARCH HANDLER:', fileMode ? 'FILE MODE' : 'REGULAR MODE', 'Query:', query);

            const success = performSearch(query, fileMode);
            if (success) {
                input.value = '';
            }

            // Reset flag after a delay
            setTimeout(() => {
                searchInProgress = false;
            }, 1000);

            return success;
        };

        // Method 1: Attach button click
        attachBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 🖱️ ATTACH BUTTON CLICKED!');
            const query = input.value.trim();
            handleSearch(query, true);
        }, { once: false, passive: false });

        // Method 2: ONLY ONE Enter key handler
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 ⌨️ ENTER KEY - SINGLE HANDLER');
                const query = input.value.trim();
                handleSearch(query, false);
            }
        }, { once: false, passive: false });

        // Method 3: Form wrapper (but prevent default submission)
        const form = document.createElement('form');
        form.style.cssText = 'margin: 0; padding: 0; display: contents;';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 📝 FORM SUBMIT PREVENTED - using keydown handler instead');
            // Don't call handleSearch here - let the keydown handler do it
        }, { once: false, passive: false });

        const toggleMinimize = () => {
            const currentMin = input.style.display === 'none';
            const newMin = !currentMin;
            const newDim = newMin ? dimensions.minimized : dimensions.expanded;

            console.log('🎯 Toggling minimize from', currentMin, 'to', newMin);

            if (newMin) {
                input.style.display = 'none';
                leftBtn.innerHTML = '◀';
                rightBtn.innerHTML = '▶';
                container.style.width = newDim.width + 'px';
                inputContainer.style.justifyContent = 'center';
            } else {
                input.style.display = 'block';
                leftBtn.innerHTML = '▶';
                rightBtn.innerHTML = '◀';
                container.style.width = newDim.width + 'px';
                inputContainer.style.justifyContent = 'space-between';
                setTimeout(() => input.focus(), 100);
            }

            domainSpecificSaveMin(newMin);
            console.log('🎯 Minimized state saved:', newMin);
        };

        leftBtn.onclick = rightBtn.onclick = (e) => {
            e.stopPropagation();
            toggleMinimize();
        };

        // Assembly
        form.appendChild(input);
        inputContainer.appendChild(form);
        inputContainer.appendChild(attachBtn);
        container.appendChild(inputContainer);
        container.appendChild(leftBtn);
        container.appendChild(rightBtn);

        // Make draggable
        fastDraggable(container, ['input', 'div[class*="minimize"]', 'svg', 'path', 'form']);

        document.body.appendChild(container);

        // Auto-focus if not minimized
        if (!isMin) {
            setTimeout(() => {
                try {
                    input.focus();
                    console.log('🎯 Input focused successfully');
                } catch (e) {
                    console.log('🎯 Input focus failed:', e);
                }
            }, 100);
        }

        console.log('🎯 Widget created successfully for domain:', window.location.hostname);
        return container;
    };

    const updateThemeStyles = (theme, zoom) => {
        safeGM_addStyle(`
            #eva-search-input::placeholder {
                color: ${theme.inputPlaceholder} !important;
                opacity: 0.7 !important;
            }
            #eva-search-input:focus {
                outline: ${2/zoom}px solid ${theme.focusColor} !important;
                box-shadow: 0 0 ${4/zoom}px ${theme.focusColor} !important;
            }
            #eva-search-box:hover {
                border-color: ${theme.borderHover} !important;
            }
            .eva-minimize-button:hover {
                background-color: ${theme.buttonHover} !important;
            }
        `);
    };

    // INITIALIZATION
    const fastInit = () => {
        console.log('🎯 Fast initialization starting...');

        // Wait for body to be available
        if (!document.body) {
            console.log('🎯 Body not ready, waiting...');
            setTimeout(fastInit, 50);
            return;
        }

        // Create the widget
        const widget = createFastWidget();

        if (widget) {
            console.log('🎯 Widget created successfully');

            // Apply initial theme
            const currentTheme = themes[loadGlobalTheme()] || themes.default;
            updateThemeStyles(currentTheme, getZoomLevel());

            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    console.log('🎯 Window resized, updating widget position');
                    const pos = domainSpecificLoadPos();
                    widget.style.left = pos.x + 'px';
                    widget.style.top = pos.y + 'px';
                }, 250);
            });

            console.log('🎯 Initialization complete');
        } else {
            console.log('🎯 Widget creation failed');
        }
    };

    // START THE WIDGET
    console.log('🎯 Starting Eva Widget initialization...');

    if (document.readyState !== 'loading') {
        console.log('🎯 Document ready, initializing immediately');
        fastInit();
    } else {
        console.log('🎯 Document loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', fastInit);
    }

    // Backup initialization
    setTimeout(() => {
        console.log('🎯 Backup initialization check...');
        if (!document.getElementById('eva-search-box')) {
            console.log('🎯 Widget not found, creating via backup method');
            createFastWidget();
        }
    }, 100);

    console.log('🎯 Eva Widget script loaded successfully');

})();
