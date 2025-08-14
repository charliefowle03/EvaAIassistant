// ==UserScript==
// @name         Eva Assistant Widget 
// @namespace    http://tampermonkey.net/
// @version      9.8.4
// @description  Eva Widget
// @author       You
// @match        *://*/*
// @updateURL    https://github.com/charliefowle03/EvaAIassistant/blob/main/Eva%20Assistant%20Widget%20DC%20Style%20v9.8%20-%20DEBUG-9.9.73.user.js
// @downloadURL  https://github.com/charliefowle03/EvaAIassistant/blob/main/Eva%20Assistant%20Widget%20DC%20Style%20v9.8%20-%20DEBUG-9.9.73.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

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

    const isEvaPage = window.location.hostname.includes('datacenteracademy.dco.aws.dev') || window.location.hostname.includes('eva.aws.dev');

    // DEBUG: Log page detection
    console.log('🎯 DEBUG: Current hostname:', window.location.hostname);
    console.log('🎯 DEBUG: Is Eva page:', isEvaPage);

    if (isEvaPage) {
        console.log('🎯 DEBUG: Eva page detected');

        // MEGA PROTECTION - MULTIPLE LAYERS
        if (window.EVA_PAGE_PROCESSED ||
            window.EVA_PASTE_STARTED ||
            window.EVA_HANDLER_RUNNING ||
            document.querySelector('[data-eva-processed="true"]')) {
            console.log('🎯 MEGA PROTECTION: Eva page already processed - BLOCKING ALL');
            return;
        }

        // Set ALL protection flags immediately
        window.EVA_PAGE_PROCESSED = true;
        window.EVA_PASTE_STARTED = true;
        window.EVA_HANDLER_RUNNING = true;

        // Add DOM marker
        const marker = document.createElement('div');
        marker.setAttribute('data-eva-processed', 'true');
        marker.style.display = 'none';
        document.body.appendChild(marker);

        console.log('🎯 DEBUG: ALL PROTECTION FLAGS SET');

        // Get stored values ONCE
        const storedPrompt = GM_getValue('pendingEvaPrompt', '');
        const isFileMode = GM_getValue('fileAttachMode', false);
        const cameFromWidget = GM_getValue('cameFromWidget', false);

        console.log('🎯 DEBUG: storedPrompt:', storedPrompt);
        console.log('🎯 DEBUG: isFileMode:', isFileMode);
        console.log('🎯 DEBUG: cameFromWidget:', cameFromWidget);

        // CLEAR VALUES IMMEDIATELY to prevent any other instance from using them
        GM_setValue('pendingEvaPrompt', '');
        GM_setValue('fileAttachMode', false);
        GM_setValue('cameFromWidget', false);
        console.log('🎯 DEBUG: Values cleared immediately to prevent duplicates');

        // Only proceed if we actually have something to do
        if (!cameFromWidget && !storedPrompt && !isFileMode) {
            console.log('🎯 DEBUG: No conditions met for processing - exiting');
            return;
        }

        // BALANCED TYPING SIMULATION
        const balancedTyping = async (input, text) => {
            if (window.EVA_PASTE_EXECUTED) {
                console.log('🎯 TYPING ALREADY EXECUTED - BLOCKING');
                return false;
            }
            window.EVA_PASTE_EXECUTED = true;

            console.log('🎯 BALANCED TYPING SIMULATION:', text);

            try {
                // Focus and clear
                input.focus();
                input.click();
                input.value = '';

                // Balanced delay - 50ms
                await new Promise(resolve => setTimeout(resolve, 50));

                // Set the value directly first
                input.value = text;

                // Fire React events with small delays between them
                const events = [
                    new CompositionEvent('compositionstart', { bubbles: true }),
                    new Event('input', { bubbles: true, cancelable: true, composed: true }),
                    new CompositionEvent('compositionend', { bubbles: true, data: text }),
                    new Event('change', { bubbles: true, cancelable: true }),
                    new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' }),
                    new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter' })
                ];

                // Fire events with tiny delays
                for (let i = 0; i < events.length; i++) {
                    input.dispatchEvent(events[i]);
                    if (i < events.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms between events
                    }
                }

                // Force React to notice the change with native setters
                try {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

                    if (input.tagName === 'INPUT') {
                        nativeInputValueSetter.call(input, text);
                    } else if (input.tagName === 'TEXTAREA') {
                        nativeTextAreaValueSetter.call(input, text);
                    }

                    // Final input event after native setter
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } catch (e) {
                    console.log('🎯 Native setter failed, continuing anyway');
                }

                console.log('🎯 BALANCED TYPING COMPLETED');

                // Quick debug check
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

        // BALANCED SUBMIT BUTTON DETECTION
        const waitForSubmitButton = () => {
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 60; // 4.5 seconds max (60 * 75ms)

                const checkButton = () => {
                    const submitBtn = document.querySelector('button[data-testid="submit-follow-up-prompt"]') ||
                                     document.querySelector('button[type="submit"]') ||
                                     document.querySelector('button[aria-label*="Send"]') ||
                                     document.querySelector('button[aria-label*="Submit"]') ||
                                     document.querySelector('form button:not([disabled])');

                    if (attempts % 8 === 0) { // Log every 8th attempt
                        console.log('🎯 DEBUG: Button check attempt', attempts + 1, '- Found:', !!submitBtn, 'Disabled:', submitBtn?.disabled);
                    }

                    if (submitBtn && !submitBtn.disabled) {
                        console.log('🎯 DEBUG: Submit button is enabled after', attempts + 1, 'attempts!');
                        resolve(submitBtn);
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(checkButton, 75); // Check every 75ms
                    } else {
                        console.log('🎯 DEBUG: Submit button never became enabled after', maxAttempts, 'attempts');
                        resolve(null);
                    }
                };

                checkButton();
            });
        };

        // BALANCED SUBMIT FUNCTION - ONLY FOR NON-FILE MODE
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

        // ATTACHMENT BUTTON GLOW FUNCTION
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
                // Try multiple ways to find the attachment button
                const allButtons = document.querySelectorAll('button');
                console.log('🎯 DEBUG: Found', allButtons.length, 'buttons total');

                // Try the 6th button (index 5) as before
                if (allButtons.length > 5) {
                    const button5 = allButtons[5];
                    console.log('🎯 DEBUG: Button 6 text:', button5.textContent?.trim());
                    console.log('🎯 DEBUG: Button 6 aria-label:', button5.getAttribute('aria-label'));
                    button5.classList.add('fast-pulse');

                    // Remove glow after 15 seconds or when clicked
                    setTimeout(() => button5.classList.remove('fast-pulse'), 15000);
                    button5.addEventListener('click', () => {
                        setTimeout(() => button5.classList.remove('fast-pulse'), 1000);
                    }, { once: true });
                }

                // Also try to find attachment button by other methods
                const attachButtons = document.querySelectorAll('button[aria-label*="attach"], button[title*="attach"], button[aria-label*="file"], button[title*="file"]');
                attachButtons.forEach(btn => {
                    console.log('🎯 DEBUG: Found potential attach button:', btn.textContent?.trim(), btn.getAttribute('aria-label'));
                    btn.classList.add('fast-pulse');
                    setTimeout(() => btn.classList.remove('fast-pulse'), 15000);
                });
            };

            // Try to find the button multiple times
            setTimeout(findAttachButton, 100);
            setTimeout(findAttachButton, 500);
            setTimeout(findAttachButton, 1000);
        };

        // FASTER EXECUTION HANDLER
        const executeFaster = async () => {
            console.log('🎯 FASTER EXECUTION STARTING');

            // Wait for page to be ready
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });

            // FASTER delay - 600ms
            console.log('🎯 DEBUG: Waiting 600ms for page to settle...');
            await new Promise(resolve => setTimeout(resolve, 600));

            // ALWAYS PASTE THE PROMPT IF WE HAVE ONE (both file mode and regular mode)
            if (storedPrompt && (cameFromWidget || isFileMode)) {
                console.log('🎯 Processing prompt for', isFileMode ? 'FILE MODE' : 'REGULAR MODE');

                // Look for input field
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

                        // Only auto-submit for regular mode, not file mode
                        if (!isFileMode) {
                            console.log('🎯 Regular mode - auto-submitting...');
                            await new Promise(resolve => setTimeout(resolve, 400));
                            await doBalancedSubmit();
                        } else {
                            console.log('🎯 File mode - skipping auto-submit, adding attachment glow...');
                            // Add glow to attachment button for file mode
                            setTimeout(addAttachmentGlow, 500);
                        }
                    }
                } else {
                    console.log('🎯 INPUT NOT FOUND - giving up');
                }
            }

            // Handle file mode without prompt (just glow the attachment button)
            if (isFileMode && !storedPrompt) {
                console.log('🎯 File mode without prompt - just adding glow');
                setTimeout(addAttachmentGlow, 500);
            }

            console.log('🎯 FASTER EXECUTION COMPLETED');
        };

        // EXECUTE FASTER
        console.log('🎯 STARTING FASTER EXECUTION');
        executeFaster();

        return;
    }

    // ZOOM-RESISTANT DIMENSIONS AND POSITIONING
    let evaWidget = null;

    // Get current browser zoom level
    const getZoomLevel = () => {
        return window.devicePixelRatio || 1;
    };

    // Get zoom-resistant dimensions (7% bigger than the previous 19% increase)
    const getZoomResistantDimensions = () => {
        const zoom = getZoomLevel();

        // Base dimensions: Previous size (169.575×32.13) increased by 7% = 181.45×34.38
        const baseWidth = 181.45; // 169.575 * 1.07
        const baseHeight = 34.38; // 32.13 * 1.07
        const minWidth = 33.43; // 31.24 * 1.07

        // Apply zoom compensation
        const widgetWidth = baseWidth / zoom;
        const widgetHeight = baseHeight / zoom;
        const minWidgetWidth = minWidth / zoom;

        return {
            expanded: { width: widgetWidth, height: widgetHeight },
            minimized: { width: minWidgetWidth, height: widgetHeight },
            zoom: zoom
        };
    };

    // Create domain-specific storage keys
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

            // Save to domain-specific keys
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

    const domainSpecificLoadPos = () => {
        try {
            // Try domain-specific keys first
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

                    // Use percentage-based positioning for better cross-page consistency
                    let x = (pos.percentX * vw) / 100;
                    let y = (pos.percentY * vh) / 100;

                    // Ensure widget stays on screen with zoom-resistant margins
                    const margin = Math.min(vw * 0.01, 20); // 1% of viewport or 20px, whichever is smaller
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

        // Default position using viewport units
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const defaultPos = { x: vw * 0.01, y: vh * 0.02 };
        console.log('🎯 Using default position for domain:', window.location.hostname, ':', defaultPos);
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
            domainSpecificSavePos(parseInt(el.style.left) || 0, parseInt(el.style.top) || 0);
        });
    };

    const createFastWidget = () => {
        const existing = document.getElementById('eva-search-box');
        if (existing && existing.parentNode && existing.offsetParent !== null) return existing;
        if (existing) existing.remove();
        if (!document.body) { setTimeout(createFastWidget, 50); return; }

        const pos = domainSpecificLoadPos();
        const isMin = domainSpecificLoadMin();
        const dimensions = getZoomResistantDimensions();

        console.log('🎯 Creating widget for domain:', window.location.hostname, 'at position:', pos, 'minimized:', isMin);
        console.log('🎯 Widget dimensions:', dimensions);

        const currentDim = isMin ? dimensions.minimized : dimensions.expanded;
        const zoom = dimensions.zoom;

        const container = document.createElement('div');
        container.id = 'eva-search-box';
        container.style.cssText = `
            position: fixed !important;
            left: ${pos.x}px !important;
            top: ${pos.y}px !important;
            background: #d8d5d4 !important;
            border: ${2/zoom}px solid #ff9900 !important;
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
            color: #FFFFFF !important;
            vertical-align: middle !important;
            background-color: #232F3E !important;
            flex-grow: 1 !important;
            flex-shrink: 1 !important;
            display: ${isMin ? 'none' : 'block'} !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: scale(1) !important;
        `;

        const attachBtn = document.createElement('div');
        const svgSize = Math.max(16/zoom, currentDim.height * 0.44);
        attachBtn.innerHTML = `<svg width="${svgSize}px" height="${svgSize}px" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19c-1.28 1.28-2.98 1.98-4.78 1.98s-3.5-.7-4.78-1.98c-2.64-2.64-2.64-6.92 0-9.56l9.19-9.19c.94-.94 2.2-1.46 3.54-1.46s2.6.52 3.54 1.46c1.95 1.95 1.95 5.12 0 7.07l-9.19 9.19c-.64.64-1.49 1-2.39 1s-1.75-.36-2.39-1c-1.32-1.32-1.32-3.46 0-4.78l8.48-8.48" fill="none" stroke="#565959" stroke-width="${2/zoom}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
                background-color: #ff9900 !important;
                color: #232F3E !important;
                font-size: ${Math.max(7/zoom, currentDim.height * 0.19)}px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border-radius: ${side === 'left' ? (3/zoom) + 'px 0 0 ' + (3/zoom) + 'px' : '0 ' + (3/zoom) + 'px ' + (3/zoom) + 'px 0'} !important;
                border: ${1/zoom}px solid #e6890a !important;
                user-select: none !important;
                font-family: "Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif !important;
                transition: background-color 0.1s !important;
                z-index: 1000001 !important;
            `;
            btn.onmouseenter = () => btn.style.backgroundColor = '#e6890a';
            btn.onmouseleave = () => btn.style.backgroundColor = '#ff9900';
            return btn;
        };

        const leftBtn = createFastMinBtn('left', isMin ? '◀' : '▶');
        const rightBtn = createFastMinBtn('right', isMin ? '▶' : '◀');

        const fastEscape = () => {
            let clickCount = 0;
            const resetPosition = () => {
                clickCount++;
                if (clickCount === 1) {
                    setTimeout(() => clickCount = 0, 300);
                } else if (clickCount === 2) {
                    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                    const resetX = Math.max(20, vw * 0.01);
                    const resetY = Math.max(20, vh * 0.02);
                    container.style.left = resetX + 'px';
                    container.style.top = resetY + 'px';
                    domainSpecificSavePos(resetX, resetY);
                    clickCount = 0;
                }
            };
            container.addEventListener('click', resetPosition);
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

                // Add pulsing glow when minimized
                container.classList.add('eva-minimized-pulse');
            } else {
                input.style.display = 'block';
                input.style.width = (newDim.width - 50/newZoom) + 'px';
                container.style.width = newDim.width + 'px';
                container.style.padding = (4/newZoom) + 'px ' + (5/newZoom) + 'px';
                inputContainer.style.justifyContent = 'space-between';
                leftBtn.innerHTML = '▶';
                rightBtn.innerHTML = '◀';

                // Remove pulsing glow when expanded
                container.classList.remove('eva-minimized-pulse');

                // Ensure widget stays on screen after expansion
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

        const fastSearch = (fileMode = false) => {
            const query = input.value.trim();

            console.log('🎯 DEBUG: fastSearch called with query:', query);
            console.log('🎯 DEBUG: fileMode:', fileMode);

            GM_setValue('cameFromWidget', true);
            GM_setValue('pendingEvaPrompt', query);
            GM_setValue('fileAttachMode', fileMode);

            console.log('🎯 DEBUG: Values set, opening Eva...');

            window.open('https://datacenteracademy.dco.aws.dev/assistant', '_blank');
        };

        attachBtn.onclick = (e) => { e.stopPropagation(); fastSearch(true); };
        input.onkeydown = (e) => { if (e.key === 'Enter') fastSearch(); };

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                const resetX = Math.max(20, vw * 0.01);
                const resetY = Math.max(20, vh * 0.02);
                container.style.left = resetX + 'px';
                container.style.top = resetY + 'px';
                domainSpecificSavePos(resetX, resetY);
            }
        });

        // Add CSS styles including the pulsing glow animation with zoom resistance
        GM_addStyle(`
            #eva-search-input::placeholder{color:#AAB7B8!important;opacity:1!important}
            #eva-search-input:focus{outline:none!important;box-shadow:0 0 0 ${1/zoom}px rgba(255,153,0,0.2)!important}

            /* Zoom-resistant widget styles */
            #eva-search-box * {
                transform: scale(1) !important;
                transform-origin: top left !important;
            }

            /* Minimized widget pulsing glow animation with zoom compensation */
            @keyframes minimizedPulse {
                0%, 100% {
                    border-color: #ff9900 !important;
                    box-shadow: 0 ${2/zoom}px ${6/zoom}px rgba(0,0,0,0.2), 0 0 0 0 rgba(255, 153, 0, 0.4) !important;
                }
                50% {
                    border-color: #ffb84d !important;
                    box-shadow: 0 ${2/zoom}px ${6/zoom}px rgba(0,0,0,0.2), 0 0 0 ${4/zoom}px rgba(255, 153, 0, 0.6) !important;
                }
            }

            .eva-minimized-pulse {
                animation: minimizedPulse 2s ease-in-out infinite !important;
            }
        `);

        inputContainer.append(input, attachBtn);
        container.append(inputContainer, leftBtn, rightBtn);

        // Apply pulsing effect if starting minimized
        if (isMin) {
            container.classList.add('eva-minimized-pulse');
        }

        document.body.appendChild(container);
        evaWidget = container;

        fastDraggable(container, ['input', 'svg', '.eva-minimize-button']);
        fastEscape();

        // Handle window resize and zoom changes to maintain consistent dimensions
        const handleResize = () => {
            setTimeout(() => {
                const newDimensions = getZoomResistantDimensions();
                const currentMin = input.style.display === 'none';
                const newDim = currentMin ? newDimensions.minimized : newDimensions.expanded;
                const newZoom = newDimensions.zoom;

                // Update container dimensions and styles
                container.style.width = newDim.width + 'px';
                container.style.height = newDim.height + 'px';
                container.style.border = (2/newZoom) + 'px solid #ff9900';
                container.style.borderRadius = (4/newZoom) + 'px';
                container.style.fontSize = (14/newZoom) + 'px';
                container.style.padding = currentMin ?
                    (4/newZoom) + 'px ' + (3/newZoom) + 'px' :
                    (4/newZoom) + 'px ' + (5/newZoom) + 'px';

                // Update input container
                inputContainer.style.gap = (2/newZoom) + 'px';
                inputContainer.style.height = (newDim.height - 8/newZoom) + 'px';

                if (!currentMin) {
                    // Update input field
                    input.style.width = (newDim.width - 50/newZoom) + 'px';
                    input.style.height = Math.max(22/newZoom, newDim.height * 0.6) + 'px';
                    input.style.padding = '0 ' + (6/newZoom) + 'px';
                    input.style.borderRadius = (3/newZoom) + 'px';
                    input.style.fontSize = Math.max(11/newZoom, newDim.height * 0.3) + 'px';
                    input.style.lineHeight = Math.max(20/newZoom, newDim.height * 0.55) + 'px';
                }

                // Update attachment button
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

                // Update minimize buttons
                [leftBtn, rightBtn].forEach((btn, index) => {
                    const side = index === 0 ? 'left' : 'right';
                    btn.style[side] = (-10/newZoom) + 'px';
                    btn.style.width = (10/newZoom) + 'px';
                    btn.style.height = Math.max(20/newZoom, newDim.height * 0.55) + 'px';
                    btn.style.fontSize = Math.max(7/newZoom, newDim.height * 0.19) + 'px';
                    btn.style.border = (1/newZoom) + 'px solid #e6890a';
                    btn.style.borderRadius = side === 'left' ?
                        (3/newZoom) + 'px 0 0 ' + (3/newZoom) + 'px' :
                        '0 ' + (3/newZoom) + 'px ' + (3/newZoom) + 'px 0';
                });

                // Update CSS animations
                const style = document.querySelector('style[data-eva-zoom-styles]');
                if (style) style.remove();

                const newStyle = document.createElement('style');
                newStyle.setAttribute('data-eva-zoom-styles', 'true');
                newStyle.textContent = `
                    #eva-search-input:focus{outline:none!important;box-shadow:0 0 0 ${1/newZoom}px rgba(255,153,0,0.2)!important}
                    @keyframes minimizedPulse {
                        0%, 100% {
                            border-color: #ff9900 !important;
                            box-shadow: 0 ${2/newZoom}px ${6/newZoom}px rgba(0,0,0,0.2), 0 0 0 0 rgba(255, 153, 0, 0.4) !important;
                        }
                        50% {
                            border-color: #ffb84d !important;
                            box-shadow: 0 ${2/newZoom}px ${6/newZoom}px rgba(0,0,0,0.2), 0 0 0 ${4/newZoom}px rgba(255, 153, 0, 0.6) !important;
                        }
                    }
                `;
                document.head.appendChild(newStyle);

                domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
                console.log('🎯 Widget resized for domain:', window.location.hostname, 'zoom:', newZoom);
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        // Also listen for zoom changes (devicePixelRatio changes)
        let currentZoom = getZoomLevel();
        setInterval(() => {
            const newZoom = getZoomLevel();
            if (Math.abs(newZoom - currentZoom) > 0.1) {
                currentZoom = newZoom;
                console.log('🎯 Zoom change detected:', newZoom);
                handleResize();
            }
        }, 500);

        // DOMAIN-SPECIFIC POSITION SAVING - Multiple triggers
        window.addEventListener('beforeunload', () => {
            domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
            console.log('🎯 Position saved on page unload for domain:', window.location.hostname);
        });

        window.addEventListener('pagehide', () => {
            domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
            console.log('🎯 Position saved on page hide for domain:', window.location.hostname);
        });

        // Save position more frequently
        setInterval(() => {
            domainSpecificSavePos(parseInt(container.style.left) || 0, parseInt(container.style.top) || 0);
        }, 2000); // Every 2 seconds

        return container;
    };

    const fastWatchdog = () => setInterval(() => {
        const widget = document.getElementById('eva-search-box');
        if (!widget || !document.contains(widget) || widget.offsetParent === null) {
            if (widget) widget.remove();
            createFastWidget();
        }
    }, 2000);

    const fastInit = () => {
        createFastWidget();
        setTimeout(fastWatchdog, 1000);
    };

    if (document.readyState !== 'loading') fastInit();
    else document.addEventListener('DOMContentLoaded', fastInit);

    [50, 200, 500, 1000].forEach(delay => setTimeout(createFastWidget, delay));
})();
