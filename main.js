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
    { msg: '[알림] 업비트 BTC 분할매수 후보 확인 요청', type: 'buy' },
    { msg: '[승인] 매수 주문 대기 — 0.012 BTC', type: 'buy' },
    { msg: '[감시] ETH 볼린저 하단 터치 감지', type: 'info' },
    { msg: '[알림] 익절 목표 +8.5% 도달 — 매도 확인 요청', type: 'sell' },
    { msg: '[기록] 빗썸 BTC 매도 후보 저장 완료', type: 'sell' },
    { msg: '[감시] MACD 골든크로스 신호 발생', type: 'info' },
    { msg: '[알림] 한투 삼성전자 조건 충족 — 승인 대기', type: 'buy' },
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
    '매매 알림 시스템부터 시작할 수 있습니다.',
    '조건 감시 시스템부터 시작할 수 있습니다.',
    '리스크 관리 도구부터 시작할 수 있습니다.',
    '주문 보조 화면부터 시작할 수 있습니다.',
  ];

  const typingTarget = document.getElementById('typing-target');
  if (typingTarget) {
    typingTarget.textContent = phrases[0];
    let phraseIdx = 0, charIdx = phrases[0].length, deleting = false;

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
          setTimeout(() => { deleting = true; type(); }, 1800);
          return;
        }
      }
      setTimeout(type, deleting ? 38 : 62);
    }
    setTimeout(() => { deleting = true; type(); }, 1700);
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
        const categories = (card.dataset.category || '').split(/\s+/);
        const show = filter === 'all' || categories.includes(filter);
        if (show) {
          card.classList.remove('hidden');
          setTimeout(() => card.classList.add('visible'), idx * 65);
          idx++;
        } else {
          card.classList.add('hidden');
          card.classList.remove('visible');
        }
      });

      const labels = {
        all: '전체',
        coin: '코인',
        stock: '국내주식',
        alert: '알림',
        monitoring: '모니터링',
        analysis: '분석·복기',
        module: '모듈 조합',
        automation: '자동화'
      };
      showToast((labels[filter] || filter) + ' 기능을 표시합니다', '검색');
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
  const estMarket        = document.getElementById('est-market');
  const estCount         = document.getElementById('est-count');
  const estPrice         = document.getElementById('est-price');
  const moduleNodes      = document.querySelectorAll('.module-node[data-node]');
  const moduleChipRow    = document.getElementById('module-chip-row');

  function updateEstimator() {
    const active   = [...estimatorOptions].filter(o => o.classList.contains('active'));
    const count    = active.length;
    const weight   = active.reduce((s, o) => s + parseInt(o.dataset.weight || '2', 10), 0);
    const features = new Set(active.map(o => o.dataset.feature));
    const groups   = new Set(active.map(o => o.dataset.group).filter(Boolean));
    const markets  = new Set(active.map(o => o.dataset.market).filter(m => m && m !== 'shared'));
    const visualNodes = new Set(['map']);

    active.forEach(option => {
      (option.dataset.node || '').split(',').map(v => v.trim()).filter(Boolean).forEach(node => visualNodes.add(node));
      (option.dataset.implies || '').split(',').map(v => v.trim()).filter(Boolean).forEach(node => visualNodes.add(node));
    });

    if (groups.has('watch')) visualNodes.add('watch');
    if (groups.has('notify')) {
      visualNodes.add('watch');
      visualNodes.add('notify');
    }
    if (groups.has('guard')) {
      visualNodes.add('watch');
      visualNodes.add('guard');
    }
    if (groups.has('report')) visualNodes.add('report');
    if (groups.has('trade')) {
      visualNodes.add('watch');
      visualNodes.add('notify');
      visualNodes.add('approve');
      visualNodes.add('trader');
    }

    if (features.has('coin-order')) markets.add('coin');
    if (features.has('stock-order')) markets.add('stock');
    if (markets.has('coin')) visualNodes.add('coin');
    if (markets.has('stock')) visualNodes.add('stock');

    const marketLabel = markets.size === 0
      ? '시장 미선택'
      : [
          markets.has('coin') ? '코인' : '',
          markets.has('stock') ? '국내주식' : ''
        ].filter(Boolean).join(' + ');
    const scopeLabel = markets.size === 0 ? '공통' : marketLabel;

    const hasOrder = groups.has('trade');
    const hasRisk = groups.has('guard');
    const hasVerify = groups.has('report');
    const hasNotify = groups.has('notify');
    const hasWatch = groups.has('watch') || hasNotify || hasRisk || hasOrder;
    const hasConnect = groups.has('connect') || markets.size > 0;

    let complexity, product, duration;
    if (count === 0) {
      complexity = '먼저 코인인지 국내주식인지, 어떤 조건을 놓치고 싶은지 정합니다';
      product    = '전략 조건표만 선택된 상태';
      duration   = 'Map 단계부터 시작';
    } else if (hasOrder) {
      complexity = '주문 기능은 감시, 알림, 승인, 리스크 기준을 확인한 뒤 적용 여부를 정합니다';
      product    = `${scopeLabel} 주문 보조 확장 조합`;
      duration   = '실제 주문 전 모의운영 권장';
    } else if (hasRisk && hasVerify) {
      complexity = '위험 기준과 검증 리포트를 함께 설계하면 운영 후 복기가 쉬워집니다';
      product    = `${scopeLabel} Guard + Report 조합`;
      duration   = '리스크 기준 확정 후 테스트';
    } else if (hasRisk) {
      complexity = '보유 종목, 손절선, 일일 손실한도 같은 제한 기준을 먼저 정합니다';
      product    = `${scopeLabel} 리스크 관리 조합`;
      duration   = 'MyQuant Guard 검토';
    } else if (hasVerify) {
      complexity = '과거 데이터와 모의운영으로 전략 특성을 먼저 확인합니다';
      product    = `${scopeLabel} 검증·기록 조합`;
      duration   = 'MyQuant Test 검토';
    } else if (hasNotify) {
      complexity = '조건 감시와 알림 채널, 주문 전 승인 방식을 먼저 설계합니다';
      product    = `${scopeLabel} 알림·승인 조합`;
      duration   = '알림형 테스트부터 시작';
    } else if (hasWatch) {
      complexity = '가격, 거래량, 지표, 시간 조건을 시스템이 확인할 수 있게 정리합니다';
      product    = `${scopeLabel} 조건 감시 조합`;
      duration   = '주문 없이 감시부터 시작';
    } else if (hasConnect) {
      complexity = '연결 가능한 거래소나 증권사, 데이터 범위와 권한을 먼저 확인합니다';
      product    = `${scopeLabel} 연결 진단 조합`;
      duration   = '연결 가능성 진단';
    } else {
      complexity = '선택한 항목을 기준으로 진단 후 범위를 정합니다';
      product    = '상담 후 적합한 시작 방식 추천';
      duration   = '진단 후 확정';
    }

    const pct = Math.min(96, 10 + count * 4 + weight * 3);

    /* 실시간 모듈 조립 견적 가격 계산 */
    const basePrice = 90000; // 전략 조건표 기본 설계 비용 9만 원
    let totalPrice = 0;
    const activeWithPrice = active.filter(o => o.dataset.price && parseInt(o.dataset.price, 10) > 0);
    
    if (activeWithPrice.length > 0) {
      totalPrice = basePrice + active.reduce((s, o) => s + parseInt(o.dataset.price || '0', 10), 0);
    } else if (active.length > 0) {
      totalPrice = basePrice;
    } else {
      totalPrice = 0;
    }

    if (estComplexity)   { estComplexity.textContent  = complexity; }
    if (estDuration)     { estDuration.textContent    = duration; }
    if (estProduct)      { estProduct.textContent     = product; }
    if (estMarket)       { estMarket.textContent      = marketLabel; }
    if (estCount)        { estCount.textContent       = count + '개'; }
    if (estProgressFill) { estProgressFill.style.width = pct + '%'; }
    if (estPrice) {
      if (totalPrice === 0) {
        estPrice.textContent = "0원";
      } else {
        estPrice.textContent = (totalPrice / 10000) + "만 원";
      }
    }

    moduleNodes.forEach(node => {
      const key = node.dataset.node;
      const directlySelected = active.some(option => (option.dataset.node || '').split(',').map(v => v.trim()).includes(key));
      node.classList.toggle('active', visualNodes.has(key));
      node.classList.toggle('implied', !directlySelected && key !== 'map' && visualNodes.has(key));
    });

    if (moduleChipRow) {
      const chips = ['전략 정리', ...active.map(o => o.dataset.module).filter(Boolean)];
      moduleChipRow.innerHTML = chips.map(label => `<span>${label}</span>`).join('');
    }
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
    showToast('상담 섹션으로 이동합니다', '상담');
    const target = document.getElementById('consultation-brief') || document.getElementById('contact');
    target?.scrollIntoView({ behavior: 'smooth' });
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

  /* Consultation brief form */
  const consultationForm = document.getElementById('consultation-form');
  const consultCopyBtn = document.getElementById('consult-copy-btn');

  function getConsultationMessage() {
    if (!consultationForm) return '';
    const formData = new FormData(consultationForm);

    return [
      '[마이퀀트 상담 요청]',
      '',
      `거래 시장: ${formData.get('market') || '미선택'}`,
      `거래 환경: ${formData.get('platform') || '미선택'}`,
      `가장 먼저 필요한 것: ${formData.get('primaryGoal') || '미선택'}`,
      `보고 싶은 종목: ${formData.get('watchlist') || '상담 시 설명 예정'}`,
      '',
      `사고 싶은 기준: ${formData.get('buyRule') || '상담 시 설명 예정'}`,
      `팔고 싶은 기준: ${formData.get('sellRule') || '상담 시 설명 예정'}`,
      `손절 기준: ${formData.get('stopLoss') || '미입력'}`,
      `처음 희망 방식: ${formData.get('startMode') || '미입력'}`,
      `예상 예산: ${formData.get('budget') || '미입력'}`,
      '',
      `추가 설명: ${formData.get('memo') || '없음'}`,
      `연락 방법: ${formData.get('contactMethod') || '미입력'}`
    ].join('\n');
  }

  consultationForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!consultationForm.reportValidity()) return;

    const formData = new FormData(consultationForm);
    const subject = `[마이퀀트 상담 요청] ${formData.get('market')} / ${formData.get('primaryGoal')}`;
    const body = getConsultationMessage();
    window.location.href = `mailto:betterpsh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('상담 내용이 이메일 본문으로 정리됩니다', '메일');
  });

  consultCopyBtn?.addEventListener('click', async () => {
    const body = getConsultationMessage();
    if (!body) return;

    try {
      await navigator.clipboard.writeText(body);
      showToast('상담 내용이 복사되었습니다', '✓');
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = body;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      showToast('상담 내용이 복사되었습니다', '✓');
    }
  });

  /* CTA button toasts */
  document.getElementById('hero-cta-primary')?.addEventListener('click', () => {
    showToast('상담 작성으로 이동합니다', '상담');
  });
  document.getElementById('nav-cta-btn')?.addEventListener('click', () => {
    showToast('상담 섹션으로 이동합니다', '상담');
  });
  document.getElementById('cta-email-btn')?.addEventListener('click', () => {
    showToast('betterpsh@gmail.com으로 이메일 앱을 엽니다', '메일');
  });
  document.getElementById('cta-phone-btn')?.addEventListener('click', () => {
    showToast('010-4752-8421로 전화 앱을 엽니다', '전화');
  });
  document.getElementById('cta-kakao-btn')?.addEventListener('click', () => {
    showToast('카카오톡 오픈채팅으로 연결합니다', '톡');
  });
  document.getElementById('quick-phone-btn')?.addEventListener('click', () => {
    showToast('010-4752-8421로 전화 앱을 엽니다', '전화');
  });
  document.getElementById('quick-kakao-btn')?.addEventListener('click', () => {
    showToast('카카오톡 오픈채팅으로 연결합니다', '톡');
  });
  document.getElementById('quick-form-btn')?.addEventListener('click', () => {
    showToast('상담 작성으로 이동합니다', '✎');
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
