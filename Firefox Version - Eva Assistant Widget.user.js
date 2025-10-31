// ==UserScript==
// @name         Eva Assistant Widget
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Eva Widget - Fixed Events & Top Center Position
// @author       You
// @match        *://*/*
// @updateURL    https://github.com/charliefowle03/EvaAIassistant/raw/refs/heads/main/Firefox%20Version%20-%20Eva%20Assistant%20Widget.user.js
// @downloadURL  https://github.com/charliefowle03/EvaAIassistant/raw/refs/heads/main/Firefox%20Version%20-%20Eva%20Assistant%20Widget.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Add debugging for storage availability
    console.log('🎯 DEBUG: GM_setValue available:', typeof GM_setValue !== 'undefined');
    console.log('🎯 DEBUG: GM_getValue available:', typeof GM_getValue !== 'undefined');

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

    // GLOBAL THEME MANAGEMENT
    const saveGlobalTheme = (themeName) => {
        try {
            GM_setValue('evaWidgetGlobalTheme', themeName);
            GM_setValue('evaWidgetGlobalThemeBackup', themeName);
            GM_setValue('evaWidgetThemeTimestamp', Date.now());
            console.log('🎯 Global theme saved:', themeName);
            broadcastThemeChange(themeName);
        } catch (e) {
            console.log('🎯 Global theme save failed:', e);
        }
    };

    const loadGlobalTheme = () => {
        try {
            const savedTheme = GM_getValue('evaWidgetGlobalTheme', 'default') ||
                              GM_getValue('evaWidgetGlobalThemeBackup', 'default');
            console.log('🎯 Global theme loaded:', savedTheme);
            return savedTheme;
        } catch (e) {
            console.log('🎯 Global theme load failed:', e);
            return 'default';
        }
    };

    const broadcastThemeChange = (themeName) => {
        try {
            GM_setValue('evaWidgetThemeBroadcast', JSON.stringify({
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
                const broadcastData = GM_getValue('evaWidgetThemeBroadcast', '');
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

        const storedPrompt = GM_getValue('pendingEvaPrompt', '');
        const isFileMode = GM_getValue('fileAttachMode', false);
        const cameFromWidget = GM_getValue('cameFromWidget', false);

        console.log('🎯 DEBUG: storedPrompt:', storedPrompt);
        console.log('🎯 DEBUG: isFileMode:', isFileMode);
        console.log('🎯 DEBUG: cameFromWidget:', cameFromWidget);

        GM_setValue('pendingEvaPrompt', '');
        GM_setValue('fileAttachMode', false);
        GM_setValue('cameFromWidget', false);
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

            GM_addStyle(`
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

            GM_setValue(posKey, JSON.stringify(data));
            GM_setValue(backupKey, JSON.stringify(data));
            GM_setValue(backup2Key, JSON.stringify(data));

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

            const saved = GM_getValue(posKey, '') ||
                         GM_getValue(backupKey, '') ||
                         GM_getValue(backup2Key, '');

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

            GM_setValue(minKey, min);
            GM_setValue(minBackupKey, min);
            console.log('🎯 Minimized state saved for domain:', window.location.hostname, ':', min);
        } catch (e) {
            console.log('🎯 Domain-specific min save failed:', e);
        }
    };

    const domainSpecificLoadMin = () => {
        try {
            const minKey = getDomainKey('evaWidgetMinimized');
            const minBackupKey = getDomainKey('evaWidgetMinimizedBackup');

            const min = GM_getValue(minKey, false) || GM_getValue(minBackupKey, false);
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

    // GLOBAL SEARCH FUNCTION - COMPLETELY REWRITTEN FOR RELIABILITY
    const performSearch = (query, fileMode = false) => {
        console.log('🎯 🚀 SEARCH FUNCTION CALLED!');
        console.log('🎯 Query:', query);
        console.log('🎯 File Mode:', fileMode);

        // Don't proceed if no query and not in file mode
        if (!query && !fileMode) {
            console.log('🎯 ❌ No query provided and not file mode, aborting');
            alert('Please enter a query or use attach mode');
            return false;
        }

        try {
            console.log('🎯 💾 Setting GM values...');
            GM_setValue('cameFromWidget', true);
            GM_setValue('pendingEvaPrompt', query);
            GM_setValue('fileAttachMode', fileMode);
            
            // Verify the values were set
            const verification = {
                cameFromWidget: GM_getValue('cameFromWidget'),
                pendingEvaPrompt: GM_getValue('pendingEvaPrompt'),
                fileAttachMode: GM_getValue('fileAttachMode')
            };
            console.log('🎯 ✅ Values verification:', verification);

            console.log('🎯 🌐 Opening Eva page...');

            // Try multiple Eva URLs
            const evaUrls = [
                'https://datacenteracademy.dco.aws.dev/assistant',
                'https://eva.aws.dev/assistant',
                'https://eva.aws.dev'
            ];

            let opened = false;
            for (const url of evaUrls) {
                try {
                    console.log('🎯 🔗 Trying to open:', url);
                    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                    if (newWindow && !newWindow.closed) {
                        opened = true;
                        console.log('🎯 ✅ Successfully opened:', url);
                        break;
                    } else {
                        console.log('🎯 ❌ Failed to open or was blocked:', url);
                    }
                } catch (e) {
                    console.log('🎯 ❌ Exception opening:', url, e);
                }
            }

            if (!opened) {
                console.log('🎯 ❌ Failed to open any Eva URL - popup blocked?');
                alert('Failed to open Eva. Please check if popups are blocked.');
                return false;
            }

            console.log('🎯 ✅ Search function completed successfully');
            return true;

        } catch (error) {
            console.log('🎯 ❌ ERROR in performSearch:', error);
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

        const fastEscape = () => {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                    // Reset to top center
                    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                    const resetX = (vw - currentDim.width) / 2;
                    const resetY = 20;
                    container.style.left = resetX + 'px';
                    container.style.top = resetY + 'px';
                    domainSpecificSavePos(resetX, resetY);
                    console.log('🎯 Position manually reset to TOP CENTER via Ctrl+Shift+E');
                }
            });
        };

        const fastToggleMin = () => {
            const currentMin = input.style.display === 'none';
            const newMin = !currentMin;
            const newDimensions = getZoomResistantDimensions();
            const newDim = newMin ? newDimensions.minimized : newDimensions.expanded;
            const newZoom = newDimensions.zoom;

            if (newMin) {
                input.style.display = 'none';
                container.style.width = newDim.width + 'px';
                container.style.padding = (4/newZoom) + 'px ' + (3/newZoom) + 'px';
                inputContainer.style.justifyContent = 'center';
                leftBtn.innerHTML = '◀';
                rightBtn.innerHTML = '▶';
                container.classList.add('eva-minimized-pulse');
            } else {
                input.style.display = 'block';
                input.style.width = (newDim.width - 50/newZoom) + 'px';
                container.style.width = newDim.width + 'px';
                container.style.padding = (4/newZoom) + 'px ' + (5/newZoom) + 'px';
                inputContainer.style.justifyContent = 'space-between';
                leftBtn.innerHTML = '▶';
                rightBtn.innerHTML = '◀';
                container.classList.remove('eva-minimized-pulse');

                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                const rect = container.getBoundingClientRect();
                if (rect.right > vw) container.style.left = (vw - newDim.width - 10) + 'px';
                if (rect.left < 0) container.style.left = '10px';
                if (rect.bottom > vh) container.style.top = (vh - newDim.height - 10) + 'px';
                if (rect.top < 0) container.style.top = '10px';

                domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
            }
            domainSpecificSaveMin(newMin);
        };

        leftBtn.onclick = rightBtn.onclick = (e) => { e.stopPropagation(); fastToggleMin(); };

        // COMPLETELY REWRITTEN EVENT HANDLERS WITH MULTIPLE APPROACHES
        console.log('🎯 Setting up event handlers...');

        // Method 1: Direct event listeners with capture
        attachBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🎯 🖱️ ATTACH BUTTON CLICKED! (Method 1)');
            const query = input.value.trim();
            const success = performSearch(query, true);
            if (success) {
                input.value = '';
            }
        }, true); // Use capture phase

        // Method 2: Mouse events for attach button
        attachBtn.addEventListener('mousedown', (e) => {
            console.log('🎯 🖱️ ATTACH BUTTON MOUSEDOWN!');
        });

        attachBtn.addEventListener('mouseup', (e) => {
            console.log('🎯 🖱️ ATTACH BUTTON MOUSEUP!');
        });

        // Method 3: Multiple event types for input
        input.addEventListener('keydown', (e) => {
            console.log('🎯 ⌨️ KEY PRESSED:', e.key, e.code);
            if (e.key === 'Enter' || e.code === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🎯 ⌨️ ENTER KEY DETECTED! (Method 1)');
                const query = input.value.trim();
                const success = performSearch(query, false);
                if (success) {
                    input.value = '';
                }
            }
        }, true); // Use capture phase

        // Method 4: Alternative keypress handler
        input.addEventListener('keypress', (e) => {
            console.log('🎯 ⌨️ KEYPRESS:', e.key, e.code);
            if (e.key === 'Enter' || e.code === 'Enter') {
                e.preventDefault();
                console.log('🎯 ⌨️ ENTER KEY DETECTED! (Method 2)');
                const query = input.value.trim();
                performSearch(query, false);
            }
        });

        // Method 5: Form submission handler (create a form wrapper)
        const form = document.createElement('form');
        form.style.cssText = 'margin: 0; padding: 0; display: contents;';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('🎯 📝 FORM SUBMITTED!');
            const query = input.value.trim();
            const success = performSearch(query, false);
            if (success) {
                input.value = '';
            }
        });

        // Method 6: Global document event listeners
        document.addEventListener('keydown', (e) => {
            if (document.activeElement === input && (e.key === 'Enter' || e.code === 'Enter')) {
                e.preventDefault();
                console.log('🎯 ⌨️ GLOBAL ENTER DETECTED!');
                const query = input.value.trim();
                performSearch(query, false);
            }
        });

        // Method 7: Focus and blur handlers for debugging
        input.addEventListener('focus', () => {
            console.log('🎯 🎯 INPUT FOCUSED');
        });

        input.addEventListener('blur', () => {
            console.log('🎯 🎯 INPUT BLURRED');
        });

        // Method 8: Input change handlers
        input.addEventListener('input', () => {
            console.log('🎯 📝 INPUT CHANGED:', input.value);
        });

        console.log('🎯 ✅ All event handlers set up');

        const updateThemeStyles = (theme, zoom) => {
            const existingStyle = document.querySelector('style[data-eva-theme-styles]');
            if (existingStyle) existingStyle.remove();

            const style = document.createElement('style');
            style.setAttribute('data-eva-theme-styles', 'true');
            style.textContent = `
                #eva-search-input::placeholder{color:${theme.inputPlaceholder}!important;opacity:1!important}
                #eva-search-input:focus{outline:none!important;box-shadow:0 0 0 ${1/zoom}px ${theme.focusColor}!important}

                #eva-search-box * {
                    transform: scale(1) !important;
                    transform-origin: top left !important;
                }

                @keyframes minimizedPulse {
                    0%, 100% {
                        border-color: ${theme.border} !important;
                        box-shadow: 0 ${2/zoom}px ${6/zoom}px rgba(0,0,0,0.2), 0 0 0 0 ${theme.pulseColor.replace('0.6', '0.4')} !important;
                    }
                    50% {
                        border-color: ${theme.borderHover} !important;
                        box-shadow: 0 ${2/zoom}px ${6/zoom}px rgba(0,0,0,0.2), 0 0 0 ${4/zoom}px ${theme.pulseColor} !important;
                    }
                }

                .eva-minimized-pulse {
                    animation: minimizedPulse 2s ease-in-out infinite !important;
                }
            `;
            document.head.appendChild(style);
        };

        updateThemeStyles(currentTheme, zoom);

        // Wrap input in form for better form handling
        form.appendChild(input);
        inputContainer.append(form, attachBtn);
        container.append(inputContainer, leftBtn, rightBtn);

        if (isMin) {
            container.classList.add('eva-minimized-pulse');
        }

        document.body.appendChild(container);
        evaWidget = container;

        fastDraggable(container, ['input', 'svg', '.eva-minimize-button', 'form']);
        fastEscape();

        // Focus the input for immediate use
        setTimeout(() => {
            if (!isMin) {
                input.focus();
                console.log('🎯 🎯 Input focused for immediate use');
            }
        }, 100);

        // Handle window resize and zoom changes (keeping existing resize handler)
        const handleResize = () => {
            setTimeout(() => {
                const newDimensions = getZoomResistantDimensions();
                const currentMin = input.style.display === 'none';
                const newDim = currentMin ? newDimensions.minimized : newDimensions.expanded;
                const newZoom = newDimensions.zoom;
                const theme = themes[loadGlobalTheme()] || themes.default;

                container.style.width = newDim.width + 'px';
                container.style.height = newDim.height + 'px';
                container.style.border = (2/newZoom) + 'px solid ' + theme.border;
                container.style.borderRadius = (4/newZoom) + 'px';
                container.style.fontSize = (14/newZoom) + 'px';
                container.style.padding = currentMin ?
                    (4/newZoom) + 'px ' + (3/newZoom) + 'px' :
                    (4/newZoom) + 'px ' + (5/newZoom) + 'px';

                inputContainer.style.gap = (2/newZoom) + 'px';
                inputContainer.style.height = (newDim.height - 8/newZoom) + 'px';

                if (!currentMin) {
                    input.style.width = (newDim.width - 50/newZoom) + 'px';
                    input.style.height = Math.max(22/newZoom, newDim.height * 0.6) + 'px';
                    input.style.padding = '0 ' + (6/newZoom) + 'px';
                    input.style.borderRadius = (3/newZoom) + 'px';
                    input.style.fontSize = Math.max(11/newZoom, newDim.height * 0.3) + 'px';
                    input.style.lineHeight = Math.max(20/newZoom, newDim.height * 0.55) + 'px';
                }

                const newSvgSize = Math.max(16/newZoom, newDim.height * 0.44);
                const svg = attachBtn.querySelector('svg');
                if (svg) {
                    svg.setAttribute('width', newSvgSize + 'px');
                    svg.setAttribute('height', newSvgSize + 'px');
                    svg.querySelector('path').setAttribute('stroke-width', (2/newZoom).toString());
                }
                attachBtn.style.width = Math.max(20/newZoom, newDim.height * 0.55) + 'px';
                attachBtn.style.height = Math.max(20/newZoom, newDim.height * 0.55) + 'px';
                attachBtn.style.padding = (2/newZoom) + 'px';
                attachBtn.style.borderRadius = (3/newZoom) + 'px';

                [leftBtn, rightBtn].forEach((btn, index) => {
                    const side = index === 0 ? 'left' : 'right';
                    btn.style[side] = (-10/newZoom) + 'px';
                    btn.style.width = (10/newZoom) + 'px';
                    btn.style.height = Math.max(20/newZoom, newDim.height * 0.55) + 'px';
                    btn.style.fontSize = Math.max(7/newZoom, newDim.height * 0.19) + 'px';
                    btn.style.border = (1/newZoom) + 'px solid ' + theme.borderHover;
                    btn.style.borderRadius = side === 'left' ?
                        (3/newZoom) + 'px 0 0 ' + (3/newZoom) + 'px' :
                        '0 ' + (3/newZoom) + 'px ' + (3/newZoom) + 'px 0';
                });

                updateThemeStyles(theme, newZoom);

                domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
                console.log('🎯 Widget resized for domain:', window.location.hostname, 'zoom:', newZoom);
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        let currentZoom = getZoomLevel();
        setInterval(() => {
            const newZoom = getZoomLevel();
            if (Math.abs(newZoom - currentZoom) > 0.1) {
                currentZoom = newZoom;
                console.log('🎯 Zoom change detected:', newZoom);
                handleResize();
            }
        }, 500);

        window.addEventListener('beforeunload', () => {
            domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
            console.log('🎯 Position saved on page unload for domain:', window.location.hostname);
        });

        window.addEventListener('pagehide', () => {
            domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
            console.log('🎯 Position saved on page hide for domain:', window.location.hostname);
        });

        setInterval(() => {
            domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
        }, 2000);

        return container;
    };

    const fastWatchdog = () => setInterval(() => {
        const widget = document.getElementById('eva-search-box');
        const input = document.getElementById('eva-search-input');

        if (input && document.activeElement === input) {
            return;
        }

        if (!widget || !document.contains(widget)) {
            console.log('🎯 Widget missing, recreating...');
            
            const savedValue = input ? input.value : '';

            if (widget) widget.remove();
            const newWidget = createFastWidget();

            if (savedValue && newWidget) {
                setTimeout(() => {
                    const newInput = newWidget.querySelector('#eva-search-input');
                    if (newInput) {
                        newInput.value = savedValue;
                    }
                }, 100);
            }
        }
    }, 10000);

    const fastInit = () => {
        createFastWidget();
        setTimeout(fastWatchdog, 1000);
    };

    if (document.readyState !== 'loading') fastInit();
    else document.addEventListener('DOMContentLoaded', fastInit);

    [50, 200, 500, 1000].forEach(delay => setTimeout(createFastWidget, delay));
})();
