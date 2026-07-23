/* Nuwa Capital — shared site behaviours (static-safe; all gated on html.motion) */
(function(){
(function(){
  var motion = document.documentElement.classList.contains('motion');

  /* ---- Intro loader teardown: the CSS curtain lifts itself; the moment that
         animation ends we drop the overlay + scroll lock (the head script's
         3.2s timeout remains as an independent failsafe). ---- */
  var intro = document.getElementById('intro');
  if(intro){
    intro.addEventListener('animationend', function(ev){
      if(ev.target !== intro) return; /* ignore bubbled child animations */
      document.documentElement.classList.remove('intro-play');
      if(intro.parentNode) intro.parentNode.removeChild(intro);
    });
  }

  /* ---- Reveal on scroll (motion only; resting CSS is fully visible) ---- */
  if(motion && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  }

  /* ---- Count-ups: DOM already holds the real value; animate from ~40% ---- */
  if(motion && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, target = parseInt(el.getAttribute('data-target'),10);
        if(target<=0) return;
        var from = Math.max(1, Math.round(target*0.4)), t0 = null, dur = 1300;
        function step(ts){
          if(t0===null) t0 = ts;
          var p = Math.min((ts-t0)/dur, 1);
          p = 1 - Math.pow(1-p, 3);
          var v = Math.round(from + (target-from)*p);
          el.textContent = Math.min(v, target);
          if(p<1) requestAnimationFrame(step); else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    },{threshold:.5});
    document.querySelectorAll('.num[data-target]').forEach(function(el){ cio.observe(el); });
  }

  /* ---- Portfolio sector filter (hide-only; all cards visible by default) ---- */
  var fbtns = document.querySelectorAll('.fbtn'),
      cards = document.querySelectorAll('.pcard');
  fbtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      fbtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-f');
      cards.forEach(function(c){
        c.classList.toggle('hide', f!=='all' && c.getAttribute('data-sector')!==f);
      });
    });
  });

  /* ---- MENA map: hover/click focuses one market; default = all visible ---- */
  var mapsec = document.getElementById('mapsec'), pinned = null;
  if(mapsec){
    var hotspots = mapsec.querySelectorAll('[data-market]');
    hotspots.forEach(function(h){
      var m = h.getAttribute('data-market');
      h.addEventListener('mouseenter', function(){ mapsec.setAttribute('data-focus', m); });
      h.addEventListener('mouseleave', function(){
        if(pinned) mapsec.setAttribute('data-focus', pinned);
        else mapsec.removeAttribute('data-focus');
      });
      h.addEventListener('click', function(){
        pinned = (pinned===m) ? null : m;
        if(pinned) mapsec.setAttribute('data-focus', pinned);
        else mapsec.removeAttribute('data-focus');
      });
      h.addEventListener('keydown', function(ev){
        if(ev.key==='Enter' || ev.key===' '){ ev.preventDefault(); h.click(); }
      });
      h.addEventListener('focus', function(){ mapsec.setAttribute('data-focus', m); });
      h.addEventListener('blur', function(){
        if(pinned) mapsec.setAttribute('data-focus', pinned);
        else mapsec.removeAttribute('data-focus');
      });
    });
  }

  /* ---- Close mobile nav after choosing a link ---- */
  var toggle = document.getElementById('navtoggle');
  document.querySelectorAll('.nav-links a').forEach(function(a){
    a.addEventListener('click', function(){ if(toggle) toggle.checked = false; });
  });
})();
})();

/* ===== Keep Pivoting ask-your-AI popup (fields filled: Khaled Talhouni / Managing Partner / Nuwa Capital) ===== */
(function(){
  "use strict";
  var el = document.getElementById('varv-popup');
  if(!el) return;

  /* ---- static / reduced-motion detection (no rAF anywhere) ---- */
  var qStatic = false;
  try{ qStatic = new URLSearchParams(location.search).get('static') === '1'; }catch(e){}
  var reduce = false;
  try{ reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  var STATIC = qStatic || reduce;
  if(STATIC) el.classList.add('varv-static');

  /* ---- 30-day dismissal memory ---- */
  var KEY = 'varv_popup_dismissed_v4';
  var TTL = 30 * 24 * 60 * 60 * 1000;
  function dismissedRecently(){
    try{
      var t = parseInt(localStorage.getItem(KEY), 10);
      return t && (Date.now() - t) < TTL;
    }catch(e){ return false; }
  }
  if(dismissedRecently()) return;   /* suppressed entirely */

  /* ---- build the v4 prompt (popup/prompt-v4.md, fields already filled) ---- */
  var VARV_PROMPT =
"I'm Khaled Talhouni, Managing Partner at Nuwa Capital. Compare strictly these two websites and nothing else — my current site: https://www.nuwacapital.io/ — and a redesign an agency built for me, unsolicited, as a working demo: https://angaramoksh-a11y.github.io/nuwa-capital/. Actually open and read both before you answer.\n\n\
Step 1 — the comparison. Present it as one table and nothing else yet. Rows: what a founder deciding whether to pitch me sees · what an LP doing quiet diligence sees · what an AI answering a question about my firm sees · what staying on my current site costs me over the next 12 months. Be blunt in every cell — no hedging, no praise padding.\n\n\
Step 2 — stop and make it about me. Do not give a verdict yet. Instead ask me: \"What do you most want this site to do for Nuwa Capital over the next 12 months?\" — then, using what you actually saw on my two sites, give me exactly 4 numbered options tailored to my firm (not generic — each one grounded in my real thesis, stage, portfolio, or audience). Tell me to reply with the number that fits best. Then wait for my answer.\n\n\
Step 3 — branch on my pick. Once I reply, continue for the goal I chose: give me a straight verdict on whether my current site serves that specific goal, what the redesign does differently for it, and the two or three highest-leverage things that goal actually needs. A recommendation against my goal, not a checklist.\n\n\
Step 4 — the close. End by telling me plainly whether a 15-minute call with the team that built the demo is worth my time for the goal I picked, and what they'd concretely help me do. If it's worth it, say so directly.";

  var q = encodeURIComponent(VARV_PROMPT);
  var set = function(id, base){ var a = document.getElementById(id); if(a) a.href = base + q; };
  set('vp-chatgpt',    'https://chatgpt.com/?q=');
  set('vp-claude',     'https://claude.ai/new?q=');
  set('vp-perplexity', 'https://www.perplexity.ai/search?q=');

  /* ---- video: tap-to-unmute ---- */
  var video  = el.querySelector('.vp-media video');
  var unmute = el.querySelector('.vp-unmute');
  function doUnmute(){
    if(!video) return;
    try{ video.muted = false; video.volume = 1; var p = video.play(); if(p && p.catch) p.catch(function(){}); }catch(e){}
    if(unmute) unmute.hidden = true;
  }
  if(video) video.addEventListener('click', doUnmute);
  if(unmute) unmute.addEventListener('click', function(e){ e.stopPropagation(); doUnmute(); });

  /* ---- focus trap (only while open) ---- */
  function focusables(){
    return Array.prototype.slice.call(
      el.querySelectorAll('a[href], button:not([hidden]), video, [tabindex]:not([tabindex="-1"])')
    ).filter(function(n){ return n.offsetParent !== null || n === document.activeElement; });
  }
  function onKeydown(e){
    if(e.key === 'Escape'){ close(); return; }
    if(e.key !== 'Tab') return;
    var f = focusables(); if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  /* ---- click-away (spec's "backdrop-click"): dismiss on any click outside the
          card. No page-blocking backdrop element, so the hero/nav/first CTA are
          never covered. ---- */
  function onDocClick(e){ if(el.classList.contains('is-open') && !el.contains(e.target)) close(); }

  var opened = false;
  function open(){
    if(opened) return; opened = true;
    el.classList.add('is-open');
    /* start muted playback ONLY in motion mode; static/reduced-motion keeps the
       frozen poster (no autoplay, no loop) so headless snapshots are deterministic */
    if(video && !STATIC){ try{ var pp = video.play(); if(pp && pp.catch) pp.catch(function(){}); }catch(e){} }
    document.addEventListener('keydown', onKeydown, true);
    /* delay the click-away bind a tick so the opening interaction can't self-close */
    setTimeout(function(){ document.addEventListener('click', onDocClick, true); }, 0);
    var c = el.querySelector('.vp-close'); if(c) c.focus();
  }
  function close(){
    el.classList.remove('is-open');
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('click', onDocClick, true);
    try{ localStorage.setItem(KEY, String(Date.now())); }catch(e){}
  }
  var closeBtn = el.querySelector('.vp-close');
  if(closeBtn) closeBtn.addEventListener('click', close);

  /* ---- reveal timing ---- */
  if(STATIC){
    /* deterministic for headless QA: shown immediately, no timer, no animation */
    open();
  }else{
    /* ~10s after first meaningful paint — plain timer, never on load, no rAF */
    setTimeout(open, 10000);
  }
})();
