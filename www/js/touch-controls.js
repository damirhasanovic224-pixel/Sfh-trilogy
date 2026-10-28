function initTouchControls(player) {
    // 1. Movement Joystick (WASD)
    const joystick = document.getElementById('move-joystick');
    const stick = document.getElementById('move-stick');
    let activeKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

    function dispatchKey(code, type) {
        const event = new KeyboardEvent(type, { code: code, key: code.replace('Key', '').toLowerCase(), bubbles: true });
        document.dispatchEvent(event);
    }

    joystick.addEventListener('touchstart', handleJoystick);
    joystick.addEventListener('touchmove', handleJoystick);
    joystick.addEventListener('touchend', () => {
        stick.style.transform = `translate(0px, 0px)`;
        for (let key in activeKeys) {
            if (activeKeys[key]) {
                dispatchKey(key, 'keyup');
                activeKeys[key] = false;
            }
        }
    });

    function handleJoystick(e) {
        e.preventDefault();
        const rect = joystick.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - (rect.left + rect.width / 2);
        const y = touch.clientY - (rect.top + rect.height / 2);

        const distance = Math.min(Math.hypot(x, y), 50);
        const angle = Math.atan2(y, x);

        stick.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;

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

    // 2. Aiming Trackpad (Right side drag for mouse movement)
    const aimPad = document.getElementById('aim-pad');
    let lastX = 0, lastY = 0;

    aimPad.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
    });

    aimPad.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;
        lastX = touch.clientX;
        lastY = touch.clientY;

        // Dispatch simulated mouse movement to player container
        const mouseEvent = new MouseEvent('mousemove', {
            bubbles: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            movementX: deltaX,
            movementY: deltaY
        });
        player.dispatchEvent(mouseEvent);
    });

    // 3. Action Buttons (Fire, Reload, Switch, Killstreak)
    function bindMouseAction(id) {
        const btn = document.getElementById(id);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const mEvent = new MouseEvent('mousedown', { bubbles: true, button: 0 });
            player.dispatchEvent(mEvent);
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mEvent = new MouseEvent('mouseup', { bubbles: true, button: 0 });
            player.dispatchEvent(mEvent);
        });
    }

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

    bindMouseAction('btn-fire');
    bindKeyAction('btn-reload', 'KeyR');
    bindKeyAction('btn-switch', 'KeyQ');
    bindKeyAction('btn-killstreak', 'KeyE');
}
