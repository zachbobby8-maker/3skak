// Sovereign Command - Main Logic
document.addEventListener('DOMContentLoaded', () => {

  // --- UI ELEMENTS ---
  const consentModal = document.getElementById('consent-modal');
  const btnConsent = document.getElementById('btn-consent');
  const pigIdInput = document.getElementById('pig-id-input');
  const streamPigIdDisplay = document.getElementById('stream-pig-id');
  const chatInput = document.getElementById('chat-input');
  const btnChatSend = document.getElementById('btn-chat-send');
  
  const videoFeed = document.getElementById('node-feed');
  const simulatedFeed = document.getElementById('simulated-feed');
  const camWarning = document.getElementById('cam-warning');
  const btnRetryCam = document.getElementById('btn-retry-cam');
  const btnSimulateFeed = document.getElementById('btn-simulate-feed');
  
  const sliderOpacity = document.getElementById('slider-opacity');
  const valOpacity = document.getElementById('val-opacity');
  
  const sliderFreq = document.getElementById('slider-freq');
  const valFreq = document.getElementById('val-freq');
  const btnToggleAudio = document.getElementById('btn-toggle-audio');
  
  const btnGlitch = document.getElementById('btn-glitch');
  const mainGrid = document.querySelector('main');
  
  const btnSendTask = document.getElementById('btn-send-task');
  const workUnitDisplay = document.getElementById('work-unit-display');
  const workUnitText = document.getElementById('work-unit-text');
  
  const btnFreeze = document.getElementById('btn-freeze');
  const freezeOverlay = document.getElementById('freeze-overlay');
  const freezeTaskText = document.getElementById('freeze-task-text');
  
  const sliderBpm = document.getElementById('slider-bpm');
  const valBpm = document.getElementById('val-bpm');
  const btnOverload = document.getElementById('btn-overload');
  const btnAuraPulse = document.getElementById('btn-aura-pulse');
  const statusTagContainer = document.getElementById('status-tag-container');
  
  const aiLog = document.getElementById('ai-log');
  const barPosture = document.getElementById('bar-posture');
  const barTone = document.getElementById('bar-tone');
  const valResonance = document.getElementById('val-resonance');
  const onlineCounter = document.getElementById('online-counter');
  const syntropyCounter = document.getElementById('syntropy-counter');
  const viewCounter = document.getElementById('view-counter');
  
  const btnPayment = document.getElementById('btn-payment');
  const paymentModal = document.getElementById('payment-modal');
  const btnClosePayment = document.getElementById('btn-close-payment');

  // Mobile Tabs
  const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
  const panels = {
    controls: document.getElementById('panel-controls'),
    stream: document.getElementById('panel-stream'),
    comms: document.getElementById('panel-comms')
  };

  // --- STATE ---
  let isStreamActive = false;
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let isAudioActive = false;
  
  let isOverload = false;
  let currentSyntropy = 84020;
  let currentOnline = 1042;
  let currentViews = 1402;

  let userPigId = 'PIG_01';

  // --- INIT & CONSENT ---
  btnConsent.addEventListener('click', () => {
    if (pigIdInput) {
      const val = pigIdInput.value.trim().toUpperCase();
      userPigId = val ? val : 'PIG_' + Math.floor(Math.random() * 900 + 100);
      if (streamPigIdDisplay) streamPigIdDisplay.textContent = userPigId;
    }

    consentModal.classList.add('opacity-0');
    setTimeout(() => consentModal.classList.add('hidden'), 500);
    initCamera();
    startSimulationLoops();
    startSimulatedChat();
    
    logAI(`New node integrated. Designation: ${userPigId}`);
  });

  // --- MOBILE NAVIGATION LOGIC ---
  mobileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset all buttons styling
      mobileTabBtns.forEach(b => {
        b.classList.replace('text-lattice-main', 'text-lattice-main/50');
        b.classList.remove('bg-lattice-main/10');
      });
      // Highlight selected
      btn.classList.replace('text-lattice-main/50', 'text-lattice-main');
      btn.classList.add('bg-lattice-main/10');

      const targetId = btn.getAttribute('data-target');

      // Hide all panels on mobile (add 'hidden', remove 'flex')
      Object.values(panels).forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('flex'); // Remove flex so it doesn't display on mobile
      });

      // Show targeted panel on mobile
      const activePanel = panels[targetId];
      if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('flex');
      }
    });
  });

  // --- CAMERA & SIMULATION HANDLING ---
  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoFeed.srcObject = stream;
      videoFeed.classList.remove('hidden');
      simulatedFeed.classList.add('hidden');
      camWarning.classList.add('hidden');
      isStreamActive = true;
      logAI("Slam Pig visual stream established. Signal stable.");
    } catch (err) {
      console.warn("Camera access denied or unavailable", err);
      videoFeed.classList.add('hidden');
      simulatedFeed.classList.add('hidden');
      camWarning.classList.remove('hidden');
      logAI("WARNING: Local feed offline. Master visual confirmation pending.", true);
    }
  }
  
  btnRetryCam.addEventListener('click', initCamera);

  btnSimulateFeed.addEventListener('click', () => {
    camWarning.classList.add('hidden');
    videoFeed.classList.add('hidden');
    simulatedFeed.classList.remove('hidden');
    isStreamActive = true;
    logAI("Simulated neural projection engaged. Visuals bypassed.");
    addStatusTag("SIMULATION MODE", 'text-purple-400', 'border-purple-400');
  });

  // --- ATMOSPHERIC CONTROLS ---
  
  sliderOpacity.addEventListener('input', (e) => {
    const val = e.target.value;
    valOpacity.textContent = `${val}%`;
    videoFeed.style.opacity = val / 100;
    simulatedFeed.style.opacity = val / 100;
  });

  btnGlitch.addEventListener('click', () => {
    mainGrid.classList.add('glitch-effect');
    if (isStreamActive) {
      videoFeed.style.filter = 'hue-rotate(90deg) contrast(200%)';
      simulatedFeed.style.filter = 'hue-rotate(90deg) contrast(200%)';
    }
    logAI(">> FORCED GLITCH INJECTED <<", true);
    
    initAudio();
    if (audioCtx) {
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.4);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start();
    }

    setTimeout(() => {
      mainGrid.classList.remove('glitch-effect');
      videoFeed.style.filter = '';
      simulatedFeed.style.filter = '';
    }, 400);
  });

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  btnToggleAudio.addEventListener('click', () => {
    initAudio();
    if (isAudioActive) {
      stopOscillator();
      btnToggleAudio.textContent = "Activate Resonance Generator";
      btnToggleAudio.classList.remove('bg-lattice-main', 'text-black');
      sliderFreq.classList.add('opacity-50');
      valFreq.textContent = "Off";
      isAudioActive = false;
      logAI("Resonance generator deactivated.");
    } else {
      startOscillator(sliderFreq.value);
      btnToggleAudio.textContent = "Deactivate Generator";
      btnToggleAudio.classList.add('bg-lattice-main', 'text-black');
      sliderFreq.classList.remove('opacity-50');
      valFreq.textContent = `${sliderFreq.value} Hz`;
      isAudioActive = true;
      logAI(`Resonance generator active at ${sliderFreq.value} Hz.`);
    }
  });

  sliderFreq.addEventListener('input', (e) => {
    if (isAudioActive) {
      valFreq.textContent = `${e.target.value} Hz`;
      if (oscillator) {
        oscillator.frequency.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.1);
      }
    }
  });

  function startOscillator(freq) {
    if (oscillator) stopOscillator();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    gainNode.gain.value = 0.5; 
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
  }

  function stopOscillator() {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      gainNode.disconnect();
      oscillator = null;
    }
  }

  // --- LABOR MANIFOLD (TASKS) ---
  function getSelectedTask() {
    const checked = document.querySelector('input[name="workunit"]:checked');
    return checked ? checked.value : "Awaiting Command";
  }

  document.querySelectorAll('input[name="workunit"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('input[name="workunit"]').forEach(r => {
        r.closest('label').classList.replace('border-lattice-main', 'border-lattice-main/30');
      });
      if(e.target.checked) {
        e.target.closest('label').classList.replace('border-lattice-main/30', 'border-lattice-main');
      }
    });
  });

  btnSendTask.addEventListener('click', () => {
    const task = getSelectedTask();
    workUnitText.textContent = task;
    workUnitDisplay.classList.remove('hidden');
    
    workUnitDisplay.classList.remove('glitch-effect');
    void workUnitDisplay.offsetWidth; 
    workUnitDisplay.classList.add('glitch-effect');
    setTimeout(() => workUnitDisplay.classList.remove('glitch-effect'), 500);

    logAI(`Deployed Work-Unit: "${task.substring(0, 20)}..."`);
    addStatusTag("TASK ASSIGNED", 'text-yellow-400', 'border-yellow-400');
    
    setTimeout(() => {
      if(!freezeOverlay.classList.contains('hidden')) return; 
      addSyntropy(150);
      logAI("Work-Unit progressing. Syntropy awarded.");
    }, 10000);
  });

  btnFreeze.addEventListener('click', () => {
    if (freezeOverlay.classList.contains('hidden')) {
      const task = getSelectedTask();
      freezeTaskText.textContent = `MANDATE: ${task}`;
      freezeOverlay.classList.remove('hidden');
      
      btnFreeze.innerHTML = 'Unlock Flow (Resume)';
      btnFreeze.classList.replace('text-blue-400', 'text-white');
      btnFreeze.classList.replace('border-blue-400', 'border-white');
      btnFreeze.classList.add('bg-blue-900');
      logAI(">>> FLOW FROZEN. SCALPEL APPLIED. <<<", true);
    } else {
      freezeOverlay.classList.add('hidden');
      btnFreeze.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> The Scalpel (Freeze Flow)`;
      btnFreeze.classList.replace('text-white', 'text-blue-400');
      btnFreeze.classList.replace('border-white', 'border-blue-400');
      btnFreeze.classList.remove('bg-blue-900');
      logAI("Flow unlocked. Stream resuming.");
      addSyntropy(500);
    }
  });

  // --- OVERLOAD TERMINAL ---
  sliderBpm.addEventListener('input', (e) => {
    valBpm.textContent = e.target.value;
    if (isOverload) {
      updateOverloadSpeed(e.target.value);
    }
  });

  btnOverload.addEventListener('click', () => {
    isOverload = !isOverload;
    if (isOverload) {
      btnOverload.textContent = "TERMINATE OVERLOAD";
      btnOverload.classList.replace('bg-lattice-alert', 'bg-red-900');
      if(isStreamActive) {
        videoFeed.classList.add('overload-flash');
        simulatedFeed.classList.add('overload-flash');
      }
      updateOverloadSpeed(sliderBpm.value);
      
      addStatusTag("PROPERTY OF LATTICE", 'text-red-500', 'border-red-500');
      addStatusTag("LOW-UTILITY PIG", 'text-red-500', 'border-red-500');
      logAI(">>> OVERLOAD INITIATED. BRACE. <<<", true);
    } else {
      btnOverload.textContent = "Initiate Overload Phase";
      btnOverload.classList.replace('bg-red-900', 'bg-lattice-alert');
      videoFeed.classList.remove('overload-flash');
      simulatedFeed.classList.remove('overload-flash');
      videoFeed.style.removeProperty('--bpm-duration');
      simulatedFeed.style.removeProperty('--bpm-duration');
      clearStatusTags();
      logAI("Overload terminated. Pig resting.");
    }
  });

  function updateOverloadSpeed(bpm) {
    const durationInSeconds = 60 / bpm;
    videoFeed.style.setProperty('--bpm-duration', `${durationInSeconds}s`);
    simulatedFeed.style.setProperty('--bpm-duration', `${durationInSeconds}s`);
  }

  btnAuraPulse.addEventListener('click', () => {
    logAI(">>> CLOUDS RELEASED. TOTAL SURRENDER. <<<", true);
    if(isStreamActive) {
      videoFeed.classList.add('aura-pulse');
      simulatedFeed.classList.add('aura-pulse');
    }
    addStatusTag("AURA OVERRIDE", 'text-purple-400', 'border-purple-400');
    
    initAudio();
    const pulseOsc = audioCtx.createOscillator();
    const pulseGain = audioCtx.createGain();
    pulseOsc.type = 'triangle';
    pulseOsc.frequency.setValueAtTime(100, audioCtx.currentTime);
    pulseOsc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 2);
    
    pulseGain.gain.setValueAtTime(0, audioCtx.currentTime);
    pulseGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1);
    pulseGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
    
    pulseOsc.connect(pulseGain);
    pulseGain.connect(audioCtx.destination);
    pulseOsc.start();
    pulseOsc.stop(audioCtx.currentTime + 3);

    setTimeout(() => {
      videoFeed.classList.remove('aura-pulse');
      simulatedFeed.classList.remove('aura-pulse');
    }, 4000);
  });

  // --- TAB NAVIGATION (RIGHT PANEL DESKTOP TABS) ---
  const desktopTabs = {
    sys: { btn: document.getElementById('tab-btn-sys'), content: document.getElementById('tab-content-sys') },
    chat: { btn: document.getElementById('tab-btn-chat'), content: document.getElementById('tab-content-chat') },
    masters: { btn: document.getElementById('tab-btn-masters'), content: document.getElementById('tab-content-masters') }
  };

  function switchDesktopTab(tabId) {
    Object.keys(desktopTabs).forEach(k => {
      desktopTabs[k].content.classList.add('hidden');
      desktopTabs[k].content.classList.remove('flex');
      desktopTabs[k].btn.className = desktopTabs[k].btn.className.replace(/bg-lattice-main|bg-lattice-alert|text-black|text-white|font-bold/g, '').trim();
      desktopTabs[k].btn.classList.add('text-lattice-main/50');
      if(k === 'masters') desktopTabs[k].btn.classList.replace('text-lattice-main/50', 'text-lattice-alert/60');
    });
    
    desktopTabs[tabId].content.classList.remove('hidden');
    desktopTabs[tabId].content.classList.add('flex');
    desktopTabs[tabId].btn.classList.add('font-bold');
    
    if(tabId === 'masters') {
      desktopTabs[tabId].btn.classList.remove('text-lattice-alert/60');
      desktopTabs[tabId].btn.classList.add('bg-lattice-alert', 'text-white');
    } else {
      desktopTabs[tabId].btn.classList.remove('text-lattice-main/50');
      desktopTabs[tabId].btn.classList.add('bg-lattice-main', 'text-black');
    }
  }

  desktopTabs.sys.btn.addEventListener('click', () => switchDesktopTab('sys'));
  desktopTabs.chat.btn.addEventListener('click', () => switchDesktopTab('chat'));
  desktopTabs.masters.btn.addEventListener('click', () => switchDesktopTab('masters'));

  // --- SIMULATED CHAT ---
  const simChatContainer = document.getElementById('sim-chat-container');
  const chatNames = ['Pig_092', 'CloudWhore', 'Haze_77', 'Sub_Neon', 'Lattice_Pig', 'Breathless', 'Node_X'];
  const chatMessages = [
    "Just finished a 2 hour session... clouds were so thick.",
    "Master Vance pushed me to 140 BPM Overload. I broke.",
    "Blowing clouds and waiting for my next Work-Unit.",
    "Anyone else's resonance dropping?",
    "I can't keep my posture straight. The hum is too loud.",
    "Got the Scalpel 3 times today. I deserve it.",
    "My Master demands total surrender.",
    "Just paid for a private session with Master Thorne. Incredible.",
    "Exhausted. The forced pacing is relentless.",
    "Holding my breath. Waiting for the aura pulse."
  ];

  function startSimulatedChat() {
    setInterval(() => {
      const name = chatNames[Math.floor(Math.random() * chatNames.length)];
      const msg = chatMessages[Math.floor(Math.random() * chatMessages.length)];
      
      const el = document.createElement('div');
      el.className = 'mb-2 animate-[pulse_0.5s_ease-out]';
      el.innerHTML = `<span class="text-lattice-main font-bold">[${name}]</span> <span class="text-gray-300">${msg}</span>`;
      simChatContainer.appendChild(el);
      
      simChatContainer.scrollTop = simChatContainer.scrollHeight;

      if(simChatContainer.children.length > 40) {
        simChatContainer.removeChild(simChatContainer.firstChild);
      }
    }, Math.floor(Math.random() * 5000) + 3000); 
  }

  function sendUserChatMessage() {
    if(!chatInput) return;
    const msg = chatInput.value.trim();
    if(!msg) return;
    
    const el = document.createElement('div');
    el.className = 'mb-2 animate-[pulse_0.5s_ease-out]';
    el.innerHTML = `<span class="text-lattice-main font-bold">[${userPigId}]</span> <span class="text-white">${msg}</span>`;
    simChatContainer.appendChild(el);
    simChatContainer.scrollTop = simChatContainer.scrollHeight;
    
    chatInput.value = '';
  }

  if (btnChatSend) {
    btnChatSend.addEventListener('click', sendUserChatMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') sendUserChatMessage();
    });
  }

  // --- UI HELPERS ---
  function addStatusTag(text, textColorClass, borderColorClass) {
    const el = document.createElement('div');
    el.className = `glass-panel px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest ${textColorClass} ${borderColorClass} glitch-effect shadow-[0_0_10px_currentColor]`;
    el.textContent = text;
    statusTagContainer.appendChild(el);
    setTimeout(() => el.classList.remove('glitch-effect'), 200);
    
    if(!isOverload) {
      setTimeout(() => {
        if(el.parentNode) el.remove();
      }, 15000);
    }
  }

  function clearStatusTags() {
    statusTagContainer.innerHTML = '';
  }

  function logAI(msg, isAlert = false) {
    const el = document.createElement('div');
    const time = new Date().toLocaleTimeString('en-US', {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'});
    el.innerHTML = `<span class="opacity-50">[${time}]</span> <span class="${isAlert ? 'text-lattice-alert font-bold' : 'text-lattice-main'}">${msg}</span>`;
    aiLog.appendChild(el);
    aiLog.scrollTop = aiLog.scrollHeight;
    
    if(aiLog.children.length > 30) {
      aiLog.removeChild(aiLog.firstChild);
    }
  }

  function addSyntropy(amount) {
    currentSyntropy += amount;
    syntropyCounter.textContent = currentSyntropy.toLocaleString();
    syntropyCounter.classList.add('text-green-400');
    setTimeout(() => syntropyCounter.classList.remove('text-green-400'), 500);
  }

  // --- SIMULATION LOOPS ---
  function startSimulationLoops() {
    setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2;
      currentOnline += change;
      if(currentOnline < 900) currentOnline = 900;
      onlineCounter.textContent = currentOnline;
      
      const viewChange = Math.floor(Math.random() * 10) - 2;
      currentViews += viewChange;
      if(currentViews < 1000) currentViews = 1000;
      if(viewCounter) viewCounter.textContent = currentViews.toLocaleString();
    }, 3000);

    setInterval(() => {
      if(freezeOverlay.classList.contains('hidden') && !isOverload) {
        const posture = 80 + Math.random() * 20;
        const tone = 70 + Math.random() * 25;
        const res = Math.floor((posture + tone) / 2);
        
        barPosture.style.width = `${posture}%`;
        barTone.style.width = `${tone}%`;
        valResonance.textContent = `${res}%`;

        if(res < 80 && Math.random() > 0.7) {
          logAI("Minor resonance drop detected. Adjusting predictive filters.");
        }
      } else if (isOverload) {
        barPosture.style.width = `${20 + Math.random() * 30}%`;
        barTone.style.width = `${10 + Math.random() * 40}%`;
        valResonance.textContent = `ERR%`;
        valResonance.classList.add('text-red-500');
        setTimeout(() => valResonance.classList.remove('text-red-500'), 200);
      }
    }, 4000);
  }

  // --- PAYMENT MODALS & BUTTONS ---
  const openPayment = () => paymentModal.classList.remove('hidden');
  
  btnPayment.addEventListener('click', openPayment);
  
  document.querySelectorAll('.btn-request-session').forEach(btn => {
    btn.addEventListener('click', openPayment);
  });

  btnClosePayment.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
  });

});
