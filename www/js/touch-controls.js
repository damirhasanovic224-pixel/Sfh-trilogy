function initTouchControls(player) {
    let moveTouchId = null;
    let aimTouchId = null;

    // --- 1. Movement Joystick (Left) ---
    const moveJoystick = document.getElementById('move-joystick');
    const moveStick = document.getElementById('move-stick');
    let activeKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

    function dispatchKey(code, type) {
        const event = new KeyboardEvent(type, { code: code, key: code.replace('Key', '').toLowerCase(), bubbles: true });
        document.dispatchEvent(event);
    }

    moveJoystick.addEventListener('touchstart', (e) => {
        if (moveTouchId === null) {
            const touch = e.changedTouches[0];
            moveTouchId = touch.identifier;
            processMove(touch);
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (moveTouchId !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === moveTouchId) {
                    processMove(e.changedTouches[i]);
                    break;
                }
            }
        }
        if (aimTouchId !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === aimTouchId) {
                    processAim(e.changedTouches[i]);
                    break;
                }
            }
        }
    });

    window.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === moveTouchId) {
                moveTouchId = null;
                moveStick.style.transform = `translate(0px, 0px)`;
                for (let key in activeKeys) {
                    if (activeKeys[key]) {
                        dispatchKey(key, 'keyup');
                        activeKeys[key] = false;
                    }
                }
            }
            if (e.changedTouches[i].identifier === aimTouchId) {
                aimTouchId = null;
                aimStick.style.transform = `translate(0px, 0px)`;
                const mUp = new MouseEvent('mouseup', { bubbles: true, button: 0 });
                player.dispatchEvent(mUp);
            }
        }
    });

    function processMove(touch) {
        const rect = moveJoystick.getBoundingClientRect();
        const x = touch.clientX - (rect.left + rect.width / 2);
        const y = touch.clientY - (rect.top + rect.height / 2);

        const distance = Math.min(Math.hypot(x, y), 50);
        const angle = Math.atan2(y, x);

        moveStick.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

        const newKeys = {
            KeyA: x < -15,
            KeyD: x > 15,
            KeyW: y < -15,
            KeyS: y > 15
        };

        for (let key in newKeys) {
            if (newKeys[key] && !activeKeys[key]) {
                dispatchKey(key, 'keydown');
                activeKeys[key] = true;
            } else if (!newKeys[key] && activeKeys[key]) {
                dispatchKey(key, 'keyup');
                activeKeys[key] = false;
            }
        }
    }

    // --- 2. Aim + Fire Joystick (Right) ---
    const aimJoystick = document.getElementById('aim-joystick');
    const aimStick = document.getElementById('aim-stick');

    aimJoystick.addEventListener('touchstart', (e) => {
        if (aimTouchId === null) {
            const touch = e.changedTouches[0];
            aimTouchId = touch.identifier;
            processAim(touch);
            const mDown = new MouseEvent('mousedown', { bubbles: true, button: 0 });
            player.dispatchEvent(mDown);
        }
    });

    function processAim(touch) {
        const rect = aimJoystick.getBoundingClientRect();
        const x = touch.clientX - (rect.left + rect.width / 2);
        const y = touch.clientY - (rect.top + rect.height / 2);

        const distance = Math.min(Math.hypot(x, y), 50);
        const angle = Math.atan2(y, x);

        aimStick.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const targetX = screenCenterX + (Math.cos(angle) * distance * 3.5);
        const targetY = screenCenterY + (Math.sin(angle) * distance * 3.5);

        const mMove = new MouseEvent('mousemove', {
            bubbles: true,
            clientX: targetX,
            clientY: targetY
        });
        player.dispatchEvent(mMove);
    }

    // --- 3. Action Buttons ---
    function bindKeyAction(id, keycode) {
        const btn = document.getElementById(id);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            dispatchKey(keycode, 'keydown');
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            dispatchKey(keycode, 'keyup');
        });
    }

    bindKeyAction('btn-reload', 'KeyR');
    bindKeyAction('btn-switch', 'KeyQ');
    bindKeyAction('btn-killstreak', 'KeyE');
}
