function initTouchControls(player) {
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

        const stickX = Math.cos(angle) * distance;
        const stickY = Math.sin(angle) * distance;
        stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

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

    function bindButton(id, keycode) {
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

    bindButton('btn-reload', 'KeyR');
    bindButton('btn-switch', 'KeyQ');
    bindButton('btn-killstreak', 'KeyE');
}
