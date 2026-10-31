(function(){
  // 1. Movement D-Pad Buttons (Left Side)
  const map = {
    '◀': ['a','KeyA'], '▶': ['d','KeyD'],
    '▲': ['w','KeyW'], 'R': ['r','KeyR']
  };
  const pos = {
    '◀': 'left:20px;bottom:90px', '▶': 'left:110px;bottom:90px',
    '▲': 'left:65px;bottom:170px', 'R': 'right:20px;bottom:20px'
  };

  function getTarget() {
    return document.querySelector('canvas') || document.getElementById('player') || document.body;
  }

  function sendKey(type, k){
    getTarget().dispatchEvent(new KeyboardEvent(type, {
      key: k[0], code: k[1], keyCode: k[0].charCodeAt(0), bubbles: true, cancelable: true
    }));
  }

  Object.keys(map).forEach(label => {
    const b = document.createElement('div');
    b.textContent = label;
    b.style.cssText = 'position:fixed;z-index:99999;width:75px;height:75px;'
      + 'border-radius:50%;background:rgba(255,255,255,0.25);color:#fff;'
      + 'font:28px sans-serif;display:flex;align-items:center;'
      + 'justify-content:center;touch-action:none;user-select:none;'
      + pos[label];
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); sendKey('keydown', map[label]);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev =>
      b.addEventListener(ev, () => sendKey('keyup', map[label])));
    document.body.appendChild(b);
  });

  // 2. Right-Side Aim & Fire Trackpad Zone
  const aimZone = document.createElement('div');
  aimZone.style.cssText = 'position:fixed;right:0;top:0;width:50%;height:100%;z-index:9998;touch-action:none;';
  document.body.appendChild(aimZone);

  let activePointerId = null;

  aimZone.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    activePointerId = e.pointerId;
    const target = getTarget();
    target.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, buttons: 1
    }));
    target.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, button: 0, buttons: 1
    }));
  });

  aimZone.addEventListener('pointermove', e => {
    if (e.pointerId !== activePointerId) return;
    e.preventDefault(); e.stopPropagation();
    const target = getTarget();
    target.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, buttons: 1
    }));
  });

  ['pointerup','pointercancel','pointerleave'].forEach(ev => {
    aimZone.addEventListener(ev, e => {
      if (e.pointerId !== activePointerId) return;
      e.preventDefault(); e.stopPropagation();
      activePointerId = null;
      const target = getTarget();
      target.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true, cancelable: true, button: 0, buttons: 0
      }));
    });
  });
})();
