function initTouchControls(player) {
    // --- 1. Movement Joystick (Left) ---
    const moveJoystick = document.getElementById('move-joystick');
    const moveStick = document.getElementById('move-stick');
    let activeKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

    function dispatchKey(code, type) {
        const event = new KeyboardEvent(type, { code: code, key: code.replace('Key', '').toLowerCase(), bubbles: true });
        document.dispatchEvent(event);
    }

    moveJoystick.addEventListener('touchstart', handleMove);
    moveJoystick.addEventListener('touchmove', handleMove);
    moveJoystick.addEventListener('touchend', () => {
        moveStick.style.transform = `translate(0px, 0px)`;
        for (let key in activeKeys) {
            if (activeKeys[key]) {
                dispatchKey(key, 'keyup');
                activeKeys[key] = false;
            }
        }
    });

    function handleMove(e) {
        e.preventDefault();
        const rect = moveJoystick.getBoundingClientRect();
        const touch = e.touches[0];
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
    let isFiring = false;

    aimJoystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isFiring = true;
        handleAim(e);
        // Start weapon fire
        const mDown = new MouseEvent('mousedown', { bubbles: true, button: 0 });
        player.dispatchEvent(mDown);
    });

    aimJoystick.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isFiring) {
            handleAim(e);
        }
    });

    aimJoystick.addEventListener('touchend', (e) => {
        e.preventDefault();
        isFiring = false;
        aimStick.style.transform = `translate(0px, 0px)`;
        // Cease fire
        const mUp = new MouseEvent('mouseup', { bubbles: true, button: 0 });
        player.dispatchEvent(mUp);
    });

    function handleAim(e) {
        const rect = aimJoystick.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - (rect.left + rect.width / 2);
        const y = touch.clientY - (rect.top + rect.height / 2);

        const distance = Math.min(Math.hypot(x, y), 50);
        const angle = Math.atan2(y, x);

        aimStick.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

        // Calculate aim offset relative to screen center (player location)
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        
        const aimDistanceMultiplier = 3.5;
        const targetX = screenCenterX + (Math.cos(angle) * distance * aimDistanceMultiplier);
        const targetY = screenCenterY + (Math.sin(angle) * distance * aimDistanceMultiplier);

        const mMove = new MouseEvent('mousemove', {
            bubbles: true,
            clientX: targetX,
            clientY: targetY
        });
        player.dispatchEvent(mMove);
    }

    // --- 3. Direct Menu Taps Passthrough ---
    const menuTapZone = document.getElementById('menu-tap-zone');
    menuTapZone.style.display = 'block';

    menuTapZone.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const mDown = new MouseEvent('mousedown', { bubbles: true, clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        player.dispatchEvent(mDown);
    });

    menuTapZone.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const mUp = new MouseEvent('mouseup', { bubbles: true, clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        const mClick = new MouseEvent('click', { bubbles: true, clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        player.dispatchEvent(mUp);
        player.dispatchEvent(mClick);
    });

    // --- 4. Action Buttons ---
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
