/* ════════════════════════════════════════════════════
   MyQuant — main.js
   v3.0 | Premium Interactions
   ════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ════════════════════════════════════
     1. SCROLL PROGRESS + HEADER + BACK-TO-TOP
     ════════════════════════════════════ */
  const progressBar = document.getElementById('progress-bar');
  const header      = document.getElementById('header');
  const backToTop   = document.getElementById('back-to-top');

  function handleScroll() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', Math.round(pct));
    }
    if (header)      header.classList.toggle('scrolled', scrollTop > 40);
    if (backToTop)   backToTop.classList.toggle('visible', scrollTop > 380);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ════════════════════════════════════
     2. MOBILE HAMBURGER DRAWER
     ════════════════════════════════════ */
  const hamburger    = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay= document.getElementById('drawer-overlay');

  function toggleDrawer(open) {
    if (!hamburger || !mobileDrawer) return;
    hamburger.classList.toggle('open', open);
    mobileDrawer.classList.toggle('open', open);
    mobileDrawer.setAttribute('aria-hidden', String(!open));
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      toggleDrawer(!mobileDrawer.classList.contains('open'));
    });
  }

  if (drawerOverlay) drawerOverlay.addEventListener('click', () => toggleDrawer(false));

  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  /* ════════════════════════════════════
     3. SCROLL REVEAL (Intersection Observer)
     ════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ════════════════════════════════════
     4. COUNT-UP ANIMATION
     ════════════════════════════════════ */
  function animateCount(el, target, duration = 1600) {
    const start  = performance.now();
    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  }

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        animateCount(entry.target, target);
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.count-up').forEach(el => countObs.observe(el));

  /* ════════════════════════════════════
     5. ACTIVE NAV HIGHLIGHT
     ════════════════════════════════════ */
  const navLinks = document.querySelectorAll('.nav-menu a');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

  /* ════════════════════════════════════
     6. FLOATING PARTICLES ENGINE
     ════════════════════════════════════ */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles;
    const COLORS = ['rgba(37,99,235,', 'rgba(0,167,255,', 'rgba(20,184,166,', 'rgba(139,92,246,'];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function makeParticles(n = 40) {
      return Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.2 + 0.5,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.42 + 0.1,
      }));
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      });
      requestAnimationFrame(drawParticles);
    }

    resize();
    particles = makeParticles();
    drawParticles();
    window.addEventListener('resize', () => { resize(); particles = makeParticles(); });
  }

  /* ════════════════════════════════════
     7. HERO LIVE MONITOR
        — real-time price ticker + canvas mini-chart + trade log
     ════════════════════════════════════ */
  const livePriceEl   = document.getElementById('live-price');
  const miniChart     = document.getElementById('hero-mini-chart');
  const dashLogsEl    = document.getElementById('dash-logs');

  let btcPrice   = 97_850_000;
  const history  = Array.from({ length: 30 }, () => btcPrice + (Math.random() - 0.5) * 800_000);
  let lastPrice  = btcPrice;

  function drawMiniChart() {
    if (!miniChart) return;
    const ctx = miniChart.getContext('2d');
    const w   = miniChart.width  = miniChart.parentElement.clientWidth;
    const h   = miniChart.height = miniChart.parentElement.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const min   = Math.min(...history);
    const max   = Math.max(...history);
    const range = max - min || 1;
    const getX  = i   => (w / (history.length - 1)) * i;
    const getY  = val => h - 10 - ((val - min) / range) * (h - 20);

    /* Grid lines */
    ctx.strokeStyle = 'rgba(37,99,235,0.07)';
    ctx.lineWidth   = 1;
    [0.25, 0.5, 0.75].forEach(t => {
      ctx.beginPath();
      ctx.moveTo(0, h * t);
      ctx.lineTo(w, h * t);
      ctx.stroke();
    });

    /* Line */
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(history[0]));
    history.forEach((v, i) => { if (i > 0) ctx.lineTo(getX(i), getY(v)); });
    const isUp = history[history.length - 1] >= history[0];
    ctx.strokeStyle = isUp ? '#16a34a' : '#ef4444';
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    /* Fill gradient */
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, isUp ? 'rgba(22,163,74,0.18)' : 'rgba(239,68,68,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  const tradeMessages = [
    { msg: '[감시] BTC RSI(14) 28.3 진입 (과매도 구간)', type: 'info' },
    { msg: '[주문] 업비트 BTC 분할매수 1차 실행', type: 'buy' },
    { msg: '[체결] 매수 체결 완료 — 0.012 BTC', type: 'buy' },
    { msg: '[감시] ETH 볼린저 하단 터치 감지', type: 'info' },
    { msg: '[주문] 익절 목표 +8.5% 도달 — 매도 실행', type: 'sell' },
    { msg: '[체결] 빗썸 BTC 매도 체결 완료', type: 'sell' },
    { msg: '[감시] MACD 골든크로스 신호 발생', type: 'info' },
    { msg: '[주문] 한투 삼성전자 조건 충족 — 매수 실행', type: 'buy' },
  ];

  let logIdx = 0;
  function appendLog() {
    if (!dashLogsEl) return;
    const entry   = tradeMessages[logIdx % tradeMessages.length];
    logIdx++;
    const now     = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const row = document.createElement('div');
    row.className = 'log-row';
    row.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-msg ${entry.type}">${entry.msg}</span>
      <span class="log-tag ${entry.type}">${entry.type === 'buy' ? '매수' : entry.type === 'sell' ? '매도' : '감시'}</span>
    `;
    dashLogsEl.appendChild(row);
    if (dashLogsEl.children.length > 3) dashLogsEl.removeChild(dashLogsEl.firstChild);
  }

  function tickPrice() {
    const diff = (Math.random() - 0.48) * 260_000;
    btcPrice  += diff;
    history.shift();
    history.push(btcPrice);

    if (livePriceEl) {
      const formatted = Math.floor(btcPrice).toLocaleString('ko-KR');
      livePriceEl.textContent = formatted + ' KRW';
      livePriceEl.classList.toggle('up',   diff >= 0);
      livePriceEl.classList.toggle('down', diff < 0);
    }

    /* Update mini footer stats */
    const changeEl  = document.getElementById('monitor-change');
    const volumeEl  = document.getElementById('monitor-volume');
    const countEl   = document.getElementById('monitor-orders');
    const pct       = (((btcPrice - lastPrice) / lastPrice) * 100).toFixed(2);
    if (changeEl) { changeEl.textContent = (diff >= 0 ? '+' : '') + pct + '%'; changeEl.className = 'mf-value ' + (diff >= 0 ? 'green' : 'red'); }
    if (volumeEl) volumeEl.textContent = (2841 + Math.floor(Math.random() * 200)).toLocaleString() + ' BTC';
    if (countEl)  countEl.textContent  = (127 + Math.floor(Math.random() * 20)) + '건';

    drawMiniChart();
    if (Math.random() < 0.3) appendLog();
  }

  /* Kick off monitor */
  setTimeout(() => {
    drawMiniChart();
    appendLog();
    setInterval(tickPrice, 2200);
    setInterval(appendLog, 4000);
  }, 400);

  /* ════════════════════════════════════
     8. TYPING ANIMATION (Hero H1)
     ════════════════════════════════════ */
  const phrases = [
    '자동으로 실행되는 프로그램',
    '24시간 감시하는 알림 시스템',
    '수익률을 기록하는 분석 도구',
    '내 매매기법을 따르는 봇',
  ];

  const typingTarget = document.getElementById('typing-target');
  if (typingTarget) {
    let phraseIdx = 0, charIdx = 0, deleting = false;

    /* Blinking cursor */
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    typingTarget.after(cursor);

    function type() {
      const current = phrases[phraseIdx];
      if (deleting) {
        charIdx--;
        typingTarget.textContent = current.slice(0, charIdx);
        if (charIdx <= 0) {
          deleting  = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(type, 420);
          return;
        }
      } else {
        charIdx++;
        typingTarget.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          setTimeout(() => { deleting = true; type(); }, 2200);
          return;
        }
      }
      setTimeout(type, deleting ? 40 : 68);
    }
    setTimeout(type, 1100);
  }

  /* ════════════════════════════════════
     9. PARALLAX (Hero background)
     ════════════════════════════════════ */
  const heroEl = document.querySelector('.hero');
  function onParallax() {
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    heroEl.style.backgroundPositionY = `calc(50% + ${window.scrollY * 0.1}px)`;
  }
  window.addEventListener('scroll', onParallax, { passive: true });

  /* ════════════════════════════════════
     10. PRODUCT FILTER TABS
     ════════════════════════════════════ */
  const filterTabs  = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;
      let idx = 0;
      productCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.classList.remove('hidden');
          setTimeout(() => card.classList.add('visible'), idx * 65);
          idx++;
        } else {
          card.classList.add('hidden');
          card.classList.remove('visible');
        }
      });

      const labels = { all: '전체', coin: '코인 거래소', stock: '국내 주식', alert: '알림형', analysis: '분석·기록' };
      showToast((labels[filter] || filter) + ' 제품을 표시합니다', '🔍');
    });
  });

  /* Initial product card visibility */
  const productObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.06 });
  productCards.forEach(c => productObserver.observe(c));

  /* Keyboard navigation for filter tabs */
  const tabList = document.getElementById('filter-tabs');
  if (tabList) {
    tabList.addEventListener('keydown', e => {
      const tabs = [...tabList.querySelectorAll('.filter-tab')];
      const idx  = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === 'ArrowRight') { tabs[(idx + 1) % tabs.length].focus(); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { tabs[(idx - 1 + tabs.length) % tabs.length].focus(); e.preventDefault(); }
      if (e.key === 'Enter' || e.key === ' ') { tabs[idx].click(); e.preventDefault(); }
    });
  }

  /* ════════════════════════════════════
     11. FAQ ACCORDION
     ════════════════════════════════════ */
  document.querySelectorAll('.faq-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item     = trigger.parentElement;
      const isActive = item.classList.contains('active');

      /* Close all */
      document.querySelectorAll('.faq-item').forEach(f => {
        f.classList.remove('active');
        f.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });

      /* Toggle this one */
      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ════════════════════════════════════
     12. SCOPE ESTIMATOR (Automation Calculator)
     ════════════════════════════════════ */
  const estimatorOptions = document.querySelectorAll('.est-option');
  const estComplexity    = document.getElementById('est-complexity');
  const estDuration      = document.getElementById('est-duration');
  const estProduct       = document.getElementById('est-product');
  const estProgressFill  = document.getElementById('est-progress-fill');

  function updateEstimator() {
    const active   = [...estimatorOptions].filter(o => o.classList.contains('active'));
    const count    = active.length;
    const weight   = active.reduce((s, o) => s + parseInt(o.dataset.weight || '2', 10), 0);
    const features = new Set(active.map(o => o.dataset.feature));
    const baseDays = 4 + weight;

    let complexity, product, pct;
    if (count === 0) {
      complexity = '미선택 (상담 후 결정)';
      product    = '상담을 통해 최적 제품 추천';
      pct        = 10;
    } else if (features.has('multi') || count >= 4 || weight >= 10) {
      complexity = '최고 사양 (Custom Engine)';
      product    = '종합 자동매매 대시보드 패키지';
      pct        = 100;
    } else if (features.has('order') && features.has('monitor')) {
      complexity = '고급형 (Advanced)';
      product    = '자동 주문 + 보유 종목 감시봇';
      pct        = 70;
    } else if (features.has('order')) {
      complexity = '고급형 (Advanced)';
      product    = '자동 주문형 매매 프로그램';
      pct        = 62;
    } else if (features.has('report')) {
      complexity = '기본형 (Standard)';
      product    = '매매 기록 분석 리포트';
      pct        = 44;
    } else {
      complexity = '기본형 (Standard)';
      product    = '알림형 보조 프로그램';
      pct        = 35 + Math.min(weight * 6, 22);
    }

    if (estComplexity)   { estComplexity.textContent  = complexity; }
    if (estDuration)     { estDuration.textContent    = count ? `약 ${baseDays}일` : '—'; }
    if (estProduct)      { estProduct.textContent     = product; }
    if (estProgressFill) { estProgressFill.style.width = pct + '%'; }
  }

  estimatorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      opt.classList.toggle('active');
      opt.setAttribute('aria-pressed', String(opt.classList.contains('active')));
      updateEstimator();
    });
  });

  updateEstimator();

  /* Estimator CTA button */
  document.getElementById('est-cta-btn')?.addEventListener('click', () => {
    showToast('상담 섹션으로 이동합니다 🤝', '📋');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* ════════════════════════════════════
     13. TOAST NOTIFICATION SYSTEM
     ════════════════════════════════════ */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, icon = '✦', duration = 3200) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  }

  /* CTA button toasts */
  document.getElementById('hero-cta-primary')?.addEventListener('click', () => {
    showToast('제품 소개 섹션으로 이동합니다', '📦');
  });
  document.getElementById('nav-cta-btn')?.addEventListener('click', () => {
    showToast('상담 섹션으로 이동합니다', '🤝');
  });
  document.getElementById('cta-email-btn')?.addEventListener('click', () => {
    showToast('ideal84@naver.com으로 이메일 앱을 엽니다', '📧');
  });
  document.getElementById('cta-phone-btn')?.addEventListener('click', () => {
    showToast('010-4752-8421로 전화 앱을 엽니다', '☎');
  });
  document.getElementById('cta-kakao-btn')?.addEventListener('click', e => {
    showToast('카카오톡 오픈채팅으로 연결합니다', '💬');
  });

  /* ════════════════════════════════════
     14. CARD 3D TILT MICRO-INTERACTION
     ════════════════════════════════════ */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform    = `translateY(-7px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      card.style.transition   = 'box-shadow 0.15s ease, border-color 0.15s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s var(--ease-out), box-shadow 0.26s ease, border-color 0.26s ease';
    });
  });

})();
