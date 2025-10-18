// ==UserScript==
// @name         Eva Assistant Widget - Chrome Optimized
// @namespace    http://tampermonkey.net/
// @version      10.5.2
// @description  Eva Widget - Chrome Optimized with Adjusted Length and Black Theme Text
// @author       Enhanced Version
// @match        *://*/*
// @updateURL    https://github.com/charliefowle03/EvaAIassistant/raw/refs/heads/main/Chrome%20Version%20-%20Eva%20Assistant%20Widget%20.user.js
// @downloadURL  https://github.com/charliefowle03/EvaAIassistant/raw/refs/heads/main/Chrome%20Version%20-%20Eva%20Assistant%20Widget%20.user.js
// @supportURL   https://github.com/charliefowle03/EvaAIassistant
// @homepageURL  https://github.com/charliefowle03/EvaAIassistant
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    if (window.evaWidgetRan || window.EVA_SCRIPT_LOADED) {
        console.log('🎯 ULTIMATE PROTECTION: Script already ran - BLOCKING');
        return;
    }
    window.evaWidgetRan = true;
    window.EVA_SCRIPT_LOADED = true;

    if (window !== window.top) {
        console.log('🎯 Eva widget: Skipping iframe/ad window');
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.scrollTo(0, 0), 50);
        });
    } else {
        setTimeout(() => window.scrollTo(0, 0), 50);
    }

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

    const saveGlobalTheme = (themeName) => {
        try {
            GM_setValue('evaWidgetGlobalTheme', themeName);
            console.log('🎯 Global theme saved:', themeName);
            broadcastThemeChange(themeName);
        } catch (e) {
            console.log('🎯 Global theme save failed:', e);
        }
    };

    const loadGlobalTheme = () => {
        try {
            const savedTheme = GM_getValue('evaWidgetGlobalTheme', 'default');
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

        setInterval(checkForThemeUpdates, 1000);
    };

    const isEvaPage = window.location.hostname.includes('datacenteracademy.dco.aws.dev') || window.location.hostname.includes('eva.aws.dev');

    if (isEvaPage) {
        console.log('🎯 DEBUG: Eva page detected');

        if (window.EVA_PAGE_PROCESSED || window.EVA_PASTE_STARTED || window.EVA_HANDLER_RUNNING || document.querySelector('[data-eva-processed="true"]')) {
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

    let evaWidget = null;

    const getZoomLevel = () => window.devicePixelRatio || 1;

    const getZoomResistantDimensions = () => {
        const zoom = getZoomLevel();
        const baseWidth = 175;
        const baseHeight = 30;
        const minWidth = 30;

        return {
            expanded: { width: baseWidth / zoom, height: baseHeight / zoom },
            minimized: { width: minWidth / zoom, height: baseHeight / zoom },
            zoom: zoom
        };
    };

    const getDomainKey = (baseKey) => {
        const domain = window.location.hostname.replace(/[^a-zA-Z0-9]/g, '_');
        return `${baseKey}_${domain}`;
    };

    const savePosition = (x, y) => {
        try {
            const posKey = getDomainKey('evaWidgetPosition');
            GM_setValue(posKey, JSON.stringify({ x, y }));
        } catch (e) {
            console.log('🎯 Position save failed:', e);
        }
    };

    const loadPosition = () => {
        try {
            const posKey = getDomainKey('evaWidgetPosition');
            const saved = GM_getValue(posKey, '');
            if (saved) {
                const pos = JSON.parse(saved);
                return { x: pos.x || 20, y: pos.y || 20 };
            }
        } catch (e) {
            console.log('🎯 Position load failed:', e);
        }
        return { x: 20, y: 20 };
    };

    const saveMinimized = (min) => {
        try {
            const minKey = getDomainKey('evaWidgetMinimized');
            GM_setValue(minKey, min);
        } catch (e) {
            console.log('🎯 Minimized save failed:', e);
        }
    };

    const loadMinimized = () => {
        try {
            const minKey = getDomainKey('evaWidgetMinimized');
            return GM_getValue(minKey, false);
        } catch (e) {
            return false;
        }
    };

    const makeDraggable = (el, input) => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const startDrag = (e) => {
            if (e.target === input) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseInt(el.style.left) || 0;
            initialY = parseInt(el.style.top) || 0;

            document.body.style.cursor = 'move';
            e.preventDefault();
            e.stopPropagation();
        };

        const doDrag = (e) => {
            if (!isDragging) return;

            const newX = initialX + (e.clientX - startX);
            const newY = initialY + (e.clientY - startY);

            const maxX = window.innerWidth - el.offsetWidth;
            const maxY = window.innerHeight - el.offsetHeight;

            el.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            el.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';

            e.preventDefault();
            e.stopPropagation();
        };

        const endDrag = (e) => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
                savePosition(parseInt(el.style.left), parseInt(el.style.top));
                e.stopPropagation();
            }
        };

        el.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', endDrag);

        input.addEventListener('mouseenter', () => {
            if (!isDragging) {
                input.style.cursor = 'text';
            }
        });

        input.addEventListener('mouseleave', () => {
            if (!isDragging) {
                input.style.cursor = 'text';
            }
        });
    };

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
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            min-width: 180px !important;
        `;

        const currentTheme = loadGlobalTheme();

        Object.keys(themes).forEach((themeKey) => {
            const theme = themes[themeKey];
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 10px 15px !important;
                cursor: pointer !important;
                border-bottom: 1px solid #eee !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                color: #000000 !important;
            `;

            const colorPreview = document.createElement('div');
            colorPreview.style.cssText = `
                width: 16px !important;
                height: 16px !important;
                background: ${theme.border} !important;
                border-radius: 3px !important;
                margin-right: 8px !important;
            `;

            const name = document.createElement('span');
            name.textContent = theme.name;
            name.style.fontWeight = currentTheme === themeKey ? 'bold' : 'normal';
            name.style.color = '#000000 !important';

            const leftDiv = document.createElement('div');
            leftDiv.style.display = 'flex';
            leftDiv.style.alignItems = 'center';
            leftDiv.appendChild(colorPreview);
            leftDiv.appendChild(name);

            item.appendChild(leftDiv);

            if (currentTheme === themeKey) {
                const check = document.createElement('span');
                check.textContent = '✓';
                check.style.color = '#ff9900';
                item.appendChild(check);
            }

            item.onmouseenter = () => item.style.backgroundColor = '#f5f5f5';
            item.onmouseleave = () => item.style.backgroundColor = 'transparent';

            item.onclick = () => {
                saveGlobalTheme(themeKey);
                applyThemeCallback(themeKey);
                menu.remove();
            };

            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    };

    const createWidget = () => {
        const existing = document.getElementById('eva-search-box');
        if (existing) return existing;

        const pos = loadPosition();
        const isMin = loadMinimized();
        const currentThemeName = loadGlobalTheme();
        const currentTheme = themes[currentThemeName] || themes.default;
        const dimensions = getZoomResistantDimensions();
        const currentDim = isMin ? dimensions.minimized : dimensions.expanded;

        const container = document.createElement('div');
        container.id = 'eva-search-box';
        container.style.cssText = `
            position: fixed !important;
            left: ${pos.x}px !important;
            top: ${pos.y}px !important;
            background: ${currentTheme.background} !important;
            border: 2px solid ${currentTheme.border} !important;
            border-radius: 4px !important;
            padding: 3px 5px !important;
            z-index: 2147483647 !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
            font-family: Arial, sans-serif !important;
            cursor: move !important;
            font-size: 12px !important;
            width: ${currentDim.width}px !important;
            height: ${currentDim.height}px !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            overflow: visible !important;
        `;

        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            height: 100% !important;
            gap: 4px !important;
            justify-content: ${isMin ? 'center' : 'space-between'} !important;
            position: relative !important;
            z-index: 1 !important;
            overflow: visible !important;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ask Eva...';
        input.id = 'eva-search-input';
        input.autocomplete = 'off';
        input.autocapitalize = 'off';
        input.autocorrect = 'off';
        input.spellcheck = false;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('data-lpignore', 'true');
        input.setAttribute('data-form-type', 'other');

        input.style.cssText = `
            height: 20px !important;
            padding: 0 6px !important;
            border: none !important;
            border-radius: 3px !important;
            font-size: 11px !important;
            font-family: Arial, sans-serif !important;
            color: ${currentTheme.inputText} !important;
            background-color: ${currentTheme.inputBg} !important;
            display: ${isMin ? 'none' : 'block'} !important;
            outline: none !important;
            cursor: text !important;
            position: relative !important;
            z-index: 2 !important;
            flex: 1 !important;
            min-width: 0 !important;
            width: calc(100% - 24px) !important;
        `;

        const attachBtn = document.createElement('div');
        attachBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19c-1.28 1.28-2.98 1.98-4.78 1.98s-3.5-.7-4.78-1.98c-2.64-2.64-2.64-6.92 0-9.56l9.19-9.19c.94-.94 2.2-1.46 3.54-1.46s2.6.52 3.54 1.46c1.95 1.95 1.95 5.12 0 7.07l-9.19 9.19c-.64.64-1.49 1-2.39 1s-1.75-.36-2.39-1c-1.32-1.32-1.32-3.46 0-4.78l8.48-8.48" fill="none" stroke="${currentTheme.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        attachBtn.style.cssText = `
            cursor: pointer !important;
            padding: 2px !important;
            border-radius: 3px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 20px !important;
            height: 20px !important;
            flex-shrink: 0 !important;
            position: relative !important;
            z-index: 3 !important;
            background: transparent !important;
            overflow: visible !important;
        `;
        attachBtn.title = 'Attach file to Eva';

        const createMinBtn = (side, arrow) => {
            const btn = document.createElement('div');
            btn.innerHTML = arrow;
            btn.style.cssText = `
                position: absolute !important;
                ${side}: -7px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 7px !important;
                height: 18px !important;
                background: ${currentTheme.buttonBg} !important;
                color: ${currentTheme.buttonText} !important;
                font-size: 7px !important;
                cursor: pointer !important;
                border-radius: ${side === 'left' ? '3px 0 0 3px' : '0 3px 3px 0'} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                user-select: none !important;
                z-index: 4 !important;
            `;
            return btn;
        };

        const leftBtn = createMinBtn('left', isMin ? '◀' : '▶');
        const rightBtn = createMinBtn('right', isMin ? '▶' : '◀');

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
            });
        };

        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            createThemeMenu(e.clientX, e.clientY, applyTheme);
        });

        const toggleMinimize = () => {
            const currentMin = input.style.display === 'none';
            const newMin = !currentMin;
            const newDimensions = getZoomResistantDimensions();
            const newDim = newMin ? newDimensions.minimized : newDimensions.expanded;

            if (newMin) {
                input.style.display = 'none';
                container.style.width = newDim.width + 'px';
                inputContainer.style.justifyContent = 'center';
                inputContainer.style.gap = '0px';
                leftBtn.innerHTML = '◀';
                rightBtn.innerHTML = '▶';
            } else {
                input.style.display = 'block';
                container.style.width = newDim.width + 'px';
                inputContainer.style.justifyContent = 'space-between';
                inputContainer.style.gap = '4px';
                leftBtn.innerHTML = '▶';
                rightBtn.innerHTML = '◀';
            }
            saveMinimized(newMin);
        };

        leftBtn.onclick = rightBtn.onclick = (e) => {
            e.stopPropagation();
            toggleMinimize();
        };

        const search = (fileMode = false) => {
            const query = input.value.trim();
            GM_setValue('cameFromWidget', true);
            GM_setValue('pendingEvaPrompt', query);
            GM_setValue('fileAttachMode', fileMode);
            input.value = '';
            window.open('https://datacenteracademy.dco.aws.dev/assistant', '_blank');
        };

        attachBtn.onclick = (e) => {
            e.stopPropagation();
            search(true);
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                search();
            }
        };

        inputContainer.append(input, attachBtn);
        container.append(inputContainer, leftBtn, rightBtn);
        document.body.appendChild(container);

        makeDraggable(container, input);
        listenForThemeChanges(applyTheme);

        window.addEventListener('beforeunload', () => {
            savePosition(parseInt(container.style.left), parseInt(container.style.top));
        });

        return container;
    };

    const init = () => {
        if (document.body) {
            createWidget();
        } else {
            setTimeout(init, 100);
        }
    };

    setInterval(() => {
        if (!document.getElementById('eva-search-box')) {
            createWidget();
        }
    }, 3000);

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
