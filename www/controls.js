(function(){
  let enabled = true;

  // Toggle Switch Button (Top Right)
  const toggleBtn = document.createElement('div');
  toggleBtn.textContent = 'Controls: ON';
  toggleBtn.style.cssText = 'position:fixed;top:15px;right:15px;z-index:100000;padding:8px 12px;'
    + 'background:rgba(0,0,0,0.7);color:#fff;font:14px sans-serif;border-radius:6px;'
    + 'touch-action:none;user-select:none;cursor:pointer;border:1px solid rgba(255,255,255,0.3);';
  document.body.appendChild(toggleBtn);

  // Control Overlay Container
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;touch-action:none;';
  document.body.appendChild(overlay);

  // Map controls: Movement, Crouch, Reload, Weapon Swap (Q), Skill (E) with keyCodes
  const map = { 
    '◀': ['a','KeyA', 65], 
    '▶': ['d','KeyD', 68], 
    '▲': ['w','KeyW', 87], 
    '▼': ['s','KeyS', 83], 
    'R': ['r','KeyR', 82],
    'Q': ['q','KeyQ', 81],
    'E': ['e','KeyE', 69]
  };
  
  const pos = { 
    '◀': 'left:20px;bottom:95px', 
    '▶': 'left:130px;bottom:95px', 
    '▲': 'left:75px;bottom:165px', 
    '▼': 'left:75px;bottom:25px',
    'Q': 'right:140px;bottom:20px', 
    'E': 'right:80px;bottom:85px',  
    'R': 'right:20px;bottom:20px'   
  };

  function getTarget() {
    return document.querySelector('ruffle-player') || document.querySelector('canvas') || document.body;
  }

  function sendKey(type, k){
    if (!enabled) return;
    const target = getTarget();
    // composed: true pierces the Shadow DOM to reach Ruffle core
    const evt = new KeyboardEvent(type, {
      key: k[0], code: k[1], keyCode: k[2], which: k[2], 
      bubbles: true, cancelable: true, composed: true
    });
    target.dispatchEvent(evt);
  }

  Object.keys(map).forEach(label => {
    const b = document.createElement('div');
    b.textContent = label;
    b.style.cssText = 'position:absolute;width:55px;height:55px;'
      + 'border-radius:50%;background:rgba(255,255,255,0.25);color:#fff;'
      + 'font:20px sans-serif;font-weight:bold;display:flex;align-items:center;'
      + 'justify-content:center;pointer-events:auto;touch-action:none;user-select:none;'
      + pos[label];
    b.addEventListener('pointerdown', e => {
      if (!enabled) return;
      e.preventDefault(); e.stopPropagation(); sendKey('keydown', map[label]);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev =>
      b.addEventListener(ev, () => { if(enabled) sendKey('keyup', map[label]); }));
    overlay.appendChild(b);
  });

  // Dedicated FIRE Button (dispatches mouse down/up into Ruffle shadow root)
  const fireBtn = document.createElement('div');
  fireBtn.textContent = 'FIRE';
  fireBtn.style.cssText = 'position:absolute;right:20px;bottom:155px;width:70px;height:70px;'
    + 'border-radius:50%;background:rgba(255,50,50,0.6);color:#fff;font:16px sans-serif;font-weight:bold;'
    + 'display:flex;align-items:center;justify-content:center;pointer-events:auto;touch-action:none;user-select:none;border:2px solid rgba(255,255,255,0.4);';
  
  fireBtn.addEventListener('pointerdown', e => {
    if (!enabled) return;
    e.preventDefault(); e.stopPropagation();
    const t = getTarget();
    t.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 1 }));
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev => {
    fireBtn.addEventListener(ev, e => {
      if (!enabled) return;
      e.preventDefault(); e.stopPropagation();
      const t = getTarget();
      t.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 0 }));
    });
  });
  overlay.appendChild(fireBtn);

  // Aim & Fire Trackpad Zone (Right Half of Screen)
  const aimZone = document.createElement('div');
  aimZone.style.cssText = 'position:absolute;right:0;top:0;width:50%;height:100%;pointer-events:auto;touch-action:none;';
  overlay.appendChild(aimZone);

  let activePointerId = null;
  aimZone.addEventListener('pointerdown', e => {
    if (!enabled) return;
    if (e.clientX > window.innerWidth - 130 && e.clientY < 60) return;
    e.preventDefault(); e.stopPropagation();
    activePointerId = e.pointerId;
    const target = getTarget();
    target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, composed: true, clientX: e.clientX, clientY: e.clientY, buttons: 1 }));
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true, clientX: e.clientX, clientY: e.clientY, button: 0, buttons: 1 }));
  });

  aimZone.addEventListener('pointermove', e => {
    if (!enabled || e.pointerId !== activePointerId) return;
    e.preventDefault(); e.stopPropagation();
    const target = getTarget();
    target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, composed: true, clientX: e.clientX, clientY: e.clientY, buttons: 1 }));
  });

  ['pointerup','pointercancel','pointerleave'].forEach(ev => {
    aimZone.addEventListener(ev, e => {
      if (!enabled || e.pointerId !== activePointerId) return;
      e.preventDefault(); e.stopPropagation();
      activePointerId = null;
      const target = getTarget();
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 0 }));
    });
  });

  // Toggle Functionality
  toggleBtn.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    enabled = !enabled;
    toggleBtn.textContent = enabled ? 'Controls: ON' : 'Controls: OFF';
    toggleBtn.style.background = enabled ? 'rgba(0,0,0,0.7)' : 'rgba(255,0,0,0.7)';
    overlay.style.display = enabled ? 'block' : 'none';
  });
})();
