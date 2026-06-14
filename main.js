/* ════════════════════════════════════════════════════
   퀀트공방 — main.js
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
    if (header) {
      const isScrolled = scrollTop > 8;
      header.classList.toggle('scrolled', isScrolled);
      header.classList.toggle('is-scrolled', isScrolled);
    }
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
        const id = entry.target.dataset.navSection || entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  document.querySelectorAll('section[id], section[data-nav-section]').forEach(s => navObserver.observe(s));

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
        const icon = f.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
      });

      /* Toggle this one */
      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        const icon = trigger.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
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
	      complexity = '먼저 어떤 투자 기준을 조건표로 만들지 정합니다';
	      product    = '기준 정리부터 시작';
	      duration   = '기준 정리부터 시작';
	    } else if (hasOrder) {
	      complexity = '조건 확인 후 매수는 감시, 알림, 고객 확인, 위험 기준을 점검한 뒤 적용 범위를 정합니다';
	      product    = `${scopeLabel} 조건 확인 후 매수`;
	      duration   = '매수 후 모니터링 권장';
	    } else if (hasRisk && hasVerify) {
	      complexity = '위험 기준과 점검 보고서를 함께 설계하면 운영 후 복기가 쉬워집니다';
	      product    = `${scopeLabel} 위험관리 + 사전 점검`;
	      duration   = '위험 기준 확정 후 점검';
	    } else if (hasRisk) {
	      complexity = '보유 종목, 손절선, 일일 손실한도 같은 제한 기준을 먼저 정합니다';
	      product    = `${scopeLabel} 위험관리 구성`;
	      duration   = '위험관리 범위 검토';
	    } else if (hasVerify) {
	      complexity = '과거 데이터와 모의운영으로 기준 특성을 먼저 확인합니다';
	      product    = `${scopeLabel} 사전 점검 + 기록`;
	      duration   = '점검 범위 검토';
	    } else if (hasNotify) {
	      complexity = '조건 감시와 알림 방식, 주문 전 확인 방식을 먼저 설계합니다';
	      product    = `${scopeLabel} 감시 + 알림`;
	      duration   = '알림형 점검부터 시작';
	    } else if (hasWatch) {
	      complexity = '가격, 거래량, 지표, 시간 조건을 프로그램이 확인할 수 있게 정리합니다';
	      product    = `${scopeLabel} 조건 감시`;
	      duration   = '주문 없이 감시부터 시작';
    } else if (hasConnect) {
      complexity = '연결 가능한 거래소나 증권사, 데이터 범위와 권한을 먼저 확인합니다';
	      product    = `${scopeLabel} 연결 가능성 확인`;
      duration   = '연결 가능성 진단';
    } else {
      complexity = '선택한 항목을 기준으로 진단 후 범위를 정합니다';
      product    = '상담 후 적합한 시작 방식 추천';
      duration   = '진단 후 확정';
    }

    const pct = Math.min(96, 10 + count * 4 + weight * 3);

	    /* 선택 기능 기준 예상 금액 계산 */
    const basePrice = 90000; // 기준 조건표 기본 설계 비용 9만 원
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
      const chips = ['기준 정리', ...active.map(o => o.dataset.module).filter(Boolean)];
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
  const marketSelect = consultationForm?.querySelector('select[name="market"]');
  const platformSelect = consultationForm?.querySelector('select[name="platform"]');

  function syncPlatformOptions() {
    if (!marketSelect || !platformSelect) return;

    const market = marketSelect.value;
    const hiddenByMarket = {
      '국내주식': new Set(['업비트', '빗썸']),
      '코인': new Set(['키움증권', '한국투자증권'])
    };
    const blocked = hiddenByMarket[market] || new Set();

    Array.from(platformSelect.options).forEach(option => {
      const shouldHide = option.value !== '' && blocked.has(option.value);
      option.hidden = shouldHide;
      option.disabled = shouldHide;
    });

    if (blocked.has(platformSelect.value)) {
      platformSelect.value = '';
    }
  }

  syncPlatformOptions();
  marketSelect?.addEventListener('change', syncPlatformOptions);

  const watchlistPicker = consultationForm?.querySelector('[data-watchlist-picker]');
  const watchlistValueInput = document.getElementById('watchlist-value');
  const watchlistSelectedEl = document.getElementById('watchlist-selected');
  const watchlistCustomRow = document.getElementById('watchlist-custom-row');
  const watchlistCustomInput = document.getElementById('watchlist-custom-input');
  const watchlistCustomAdd = document.getElementById('watchlist-custom-add');
  const watchlistSelections = new Set();
  const conditionSummaryValueInput = document.getElementById('condition-summary-value');
  const conditionSummaryText = document.getElementById('condition-summary-text');
  let conditionSummaryReady = false;

  function getComboLabel(values) {
    if (values.length === 0) return '선택';
    if (values.length <= 2) return values.join(', ');
    return `${values.slice(0, 2).join(', ')} 외 ${values.length - 2}개`;
  }

  function closeMultiCombo(combo) {
    const trigger = combo.querySelector('[data-combo-toggle]');
    const panel = combo.querySelector('[data-combo-panel]');
    combo.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
  }

  function openMultiCombo(combo) {
    document.querySelectorAll('[data-multi-combo].is-open').forEach(openCombo => {
      if (openCombo !== combo) closeMultiCombo(openCombo);
    });

    const trigger = combo.querySelector('[data-combo-toggle]');
    const panel = combo.querySelector('[data-combo-panel]');
    combo.classList.add('is-open');
    trigger?.setAttribute('aria-expanded', 'true');
    if (panel) panel.hidden = false;
  }

  function updateMultiComboLabel(picker, values) {
    const label = picker?.querySelector('[data-combo-label]');
    const trigger = picker?.querySelector('[data-combo-toggle]');
    const text = getComboLabel(values);
    if (label) label.textContent = text;
    trigger?.setAttribute('title', values.join(', ') || '선택');
  }

  consultationForm?.querySelectorAll('[data-multi-combo]').forEach(combo => {
    const trigger = combo.querySelector('[data-combo-toggle]');
    const panel = combo.querySelector('[data-combo-panel]');

    trigger?.addEventListener('click', event => {
      event.stopPropagation();
      if (combo.classList.contains('is-open')) closeMultiCombo(combo);
      else openMultiCombo(combo);
    });

    panel?.addEventListener('click', event => {
      event.stopPropagation();
    });
  });

  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('[data-multi-combo]')) return;
    document.querySelectorAll('[data-multi-combo].is-open').forEach(closeMultiCombo);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('[data-multi-combo].is-open').forEach(closeMultiCombo);
  });

  function renderWatchlistSelections() {
    if (!watchlistPicker || !watchlistValueInput || !watchlistSelectedEl) return;

    const values = Array.from(watchlistSelections);
    watchlistValueInput.value = values.join(', ');
    updateMultiComboLabel(watchlistPicker, values);

    watchlistPicker.querySelectorAll('[data-watchlist-option]').forEach(button => {
      const active = watchlistSelections.has(button.dataset.watchlistOption);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (values.length === 0) {
      watchlistSelectedEl.textContent = '선택된 항목이 없습니다.';
      if (conditionSummaryReady) updateConditionSummary();
      return;
    }

    watchlistSelectedEl.replaceChildren(...values.map(value => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.dataset.watchlistRemove = value;
      chip.textContent = `${value} ×`;
      chip.setAttribute('aria-label', `${value} 선택 해제`);
      return chip;
    }));
    if (conditionSummaryReady) updateConditionSummary();
  }

  function addWatchlistValue(value) {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    watchlistSelections.add(cleanValue);
    renderWatchlistSelections();
  }

  function addCustomWatchlistValue() {
    if (!(watchlistCustomInput instanceof HTMLInputElement)) return;
    addWatchlistValue(watchlistCustomInput.value);
    watchlistCustomInput.value = '';
    watchlistCustomInput.focus();
  }

  if (watchlistPicker) {
    watchlistPicker.querySelectorAll('[data-watchlist-option]').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const value = button.dataset.watchlistOption;
        if (!value) return;
        if (watchlistSelections.has(value)) watchlistSelections.delete(value);
        else watchlistSelections.add(value);
        renderWatchlistSelections();
      });
    });

    watchlistPicker.querySelector('[data-watchlist-custom]')?.addEventListener('click', () => {
      if (!watchlistCustomRow) return;
      watchlistCustomRow.hidden = !watchlistCustomRow.hidden;
      if (!watchlistCustomRow.hidden) watchlistCustomInput?.focus();
    });

    watchlistSelectedEl?.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const removeButton = target.closest('[data-watchlist-remove]');
      if (!removeButton) return;
      watchlistSelections.delete(removeButton.dataset.watchlistRemove);
      renderWatchlistSelections();
    });

    watchlistCustomAdd?.addEventListener('click', addCustomWatchlistValue);
    watchlistCustomInput?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addCustomWatchlistValue();
      }
    });

    renderWatchlistSelections();
  }

  const buyRulePicker = consultationForm?.querySelector('[data-buy-rule-picker]');
  const buyRuleValueInput = document.getElementById('buy-rule-value');
  const buyRuleSelectedEl = document.getElementById('buy-rule-selected');
  const buyRuleSelections = new Set();

  function renderBuyRuleSelections() {
    if (!buyRulePicker || !buyRuleValueInput || !buyRuleSelectedEl) return;

    const values = Array.from(buyRuleSelections);
    buyRuleValueInput.value = values.join(', ');
    updateMultiComboLabel(buyRulePicker, values);

    buyRulePicker.querySelectorAll('[data-buy-rule-option]').forEach(button => {
      const active = buyRuleSelections.has(button.dataset.buyRuleOption);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (values.length === 0) {
      buyRuleSelectedEl.textContent = '선택된 항목이 없습니다.';
      if (conditionSummaryReady) updateConditionSummary();
      return;
    }

    buyRuleSelectedEl.replaceChildren(...values.map(value => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.dataset.buyRuleRemove = value;
      chip.textContent = `${value} ×`;
      chip.setAttribute('aria-label', `${value} 선택 해제`);
      return chip;
    }));
    if (conditionSummaryReady) updateConditionSummary();
  }

  if (buyRulePicker) {
    buyRulePicker.querySelectorAll('[data-buy-rule-option]').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const value = button.dataset.buyRuleOption;
        if (!value) return;
        if (buyRuleSelections.has(value)) buyRuleSelections.delete(value);
        else buyRuleSelections.add(value);
        renderBuyRuleSelections();
      });
    });

    buyRuleSelectedEl?.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const removeButton = target.closest('[data-buy-rule-remove]');
      if (!removeButton) return;
      buyRuleSelections.delete(removeButton.dataset.buyRuleRemove);
      renderBuyRuleSelections();
    });

    renderBuyRuleSelections();
  }

  const sellRulePicker = consultationForm?.querySelector('[data-sell-rule-picker]');
  const sellRuleValueInput = document.getElementById('sell-rule-value');
  const sellRuleSelectedEl = document.getElementById('sell-rule-selected');
  const sellRuleSelections = new Set();

  function renderSellRuleSelections() {
    if (!sellRulePicker || !sellRuleValueInput || !sellRuleSelectedEl) return;

    const values = Array.from(sellRuleSelections);
    sellRuleValueInput.value = values.join(', ');
    updateMultiComboLabel(sellRulePicker, values);

    sellRulePicker.querySelectorAll('[data-sell-rule-option]').forEach(button => {
      const active = sellRuleSelections.has(button.dataset.sellRuleOption);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (values.length === 0) {
      sellRuleSelectedEl.textContent = '선택된 항목이 없습니다.';
      if (conditionSummaryReady) updateConditionSummary();
      return;
    }

    sellRuleSelectedEl.replaceChildren(...values.map(value => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.dataset.sellRuleRemove = value;
      chip.textContent = `${value} ×`;
      chip.setAttribute('aria-label', `${value} 선택 해제`);
      return chip;
    }));
    if (conditionSummaryReady) updateConditionSummary();
  }

  if (sellRulePicker) {
    sellRulePicker.querySelectorAll('[data-sell-rule-option]').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const value = button.dataset.sellRuleOption;
        if (!value) return;
        if (sellRuleSelections.has(value)) sellRuleSelections.delete(value);
        else sellRuleSelections.add(value);
        renderSellRuleSelections();
      });
    });

    sellRuleSelectedEl?.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const removeButton = target.closest('[data-sell-rule-remove]');
      if (!removeButton) return;
      sellRuleSelections.delete(removeButton.dataset.sellRuleRemove);
      renderSellRuleSelections();
    });

    renderSellRuleSelections();
  }

  const watchlistTargetPhrases = new Map([
    ['관심 종목', '관심 종목'],
    ['보유 종목', '보유 종목'],
    ['최근 본 종목', '최근 본 종목'],
    ['코스피', '코스피 종목'],
    ['코스닥', '코스닥 종목'],
    ['ETF', 'ETF'],
    ['테마주', '테마주']
  ]);

  const watchlistFilterPhrases = new Map([
    ['골든 크로스', '골든 크로스가 나타난'],
    ['정배열', '정배열 흐름을 보이는'],
    ['상한가 따라잡기', '상한가에 근접하거나 강하게 움직이는'],
    ['실시간 뉴스', '실시간 뉴스가 나온'],
    ['급등주', '단기 급등 흐름을 보이는'],
    ['거래대금 상위', '거래대금이 증가한'],
    ['상승률 상위', '상승률이 높은'],
    ['신고가 근접', '신고가에 가까운'],
    ['낙폭 과대', '최근 많이 하락한'],
    ['외국인 순매수', '외국인이 순매수하는'],
    ['기관 순매수', '기관이 순매수하는']
  ]);

  const buyConditionStems = new Map([
    ['전고점 돌파', '전고점을 돌파하'],
    ['거래량 증가', '거래량이 늘어나'],
    ['거래대금 증가', '거래대금이 늘어나'],
    ['눌림목 반등', '눌림목에서 반등하'],
    ['특정 가격 도달', '정해 둔 가격에 도달하'],
    ['신고가 돌파', '신고가를 돌파하'],
    ['20일선 돌파', '20일선을 돌파하'],
    ['골든크로스', '골든크로스가 나오'],
    ['RSI 반등', 'RSI가 반등하'],
    ['볼린저밴드 하단 반등', '볼린저밴드 하단에서 반등하'],
    ['외국인/기관 매수 동반', '외국인과 기관의 매수가 함께 들어오'],
    ['절반 매수', '정해 둔 조건에서 절반만 먼저 매수하']
  ]);

  const sellConditionStems = new Map([
    ['+3% 익절', '3% 상승하'],
    ['+5% 익절', '5% 상승하'],
    ['+10% 익절', '10% 상승하'],
    ['목표가 도달', '목표가에 도달하'],
    ['-2% 손절', '2% 하락하'],
    ['-3% 손절', '3% 하락하'],
    ['-5% 손절', '5% 하락하'],
    ['지지선 이탈', '지지선을 이탈하'],
    ['20일선 이탈', '20일선을 이탈하'],
    ['분할 익절', '수익 구간에 들어오'],
    ['트레일링 스탑', '고점 대비 되돌림이 나오'],
    ['장 마감 전 정리', '장 마감 시간이 가까워지'],
    ['손절가 도달', '손절가에 도달하'],
    ['전저점 이탈', '전저점을 이탈하'],
    ['데드크로스', '데드크로스가 나오'],
    ['보유 기간 만료', '정해 둔 보유 기간이 지나'],
    ['절반 익절', '수익 구간에서 절반을 정리하'],
    ['조건 미충족 시 정리', '정해 둔 조건을 충족하지 못하']
  ]);

  function hasFinalConsonant(text) {
    const lastChar = Array.from(text.trim()).pop();
    if (!lastChar) return false;
    const code = lastChar.charCodeAt(0) - 0xac00;
    return code >= 0 && code <= 11171 && code % 28 !== 0;
  }

  function particle(text, withFinal, withoutFinal) {
    return hasFinalConsonant(text) ? withFinal : withoutFinal;
  }

  function joinNounList(values) {
    if (values.length <= 1) return values[0] || '';
    if (values.length === 2) {
      return `${values[0]}${particle(values[0], '과', '와')} ${values[1]}`;
    }
    const last = values[values.length - 1];
    const head = values.slice(0, -1).join(', ');
    const beforeLast = values[values.length - 2];
    return `${head}${particle(beforeLast, '과', '와')} ${last}`;
  }

  function joinPhraseList(values) {
    return values.join(', ');
  }

  function joinConditionStems(stems) {
    if (stems.length <= 1) return stems[0] ? `${stems[0]}면` : '';
    const firstParts = stems.slice(0, -1).map(stem => `${stem}거나`);
    return `${firstParts.join(' ')} ${stems[stems.length - 1]}면`;
  }

  function createWatchlistSentence() {
    const targets = [];
    const filters = [];

    Array.from(watchlistSelections).forEach(value => {
      if (watchlistFilterPhrases.has(value)) {
        filters.push(watchlistFilterPhrases.get(value));
        return;
      }
      targets.push(watchlistTargetPhrases.get(value) || value);
    });

    const targetText = joinNounList(targets);
    const filterText = joinPhraseList(filters);

    if (targetText && filterText) {
      return `${targetText} 중 ${filterText} 종목을 보고 싶어요.`;
    }

    if (targetText) {
      return `${targetText}${particle(targetText, '을', '를')} 보고 싶어요.`;
    }

    if (filterText) {
      return `${filterText} 종목을 보고 싶어요.`;
    }

    return '';
  }

  function createTradeRuleSentence() {
    const buyCondition = joinConditionStems(
      Array.from(buyRuleSelections).map(value => buyConditionStems.get(value) || value)
    );
    const sellCondition = joinConditionStems(
      Array.from(sellRuleSelections).map(value => sellConditionStems.get(value) || value)
    );

    if (buyCondition && sellCondition) {
      return `${buyCondition} 사고, ${sellCondition} 알림을 받고 싶어요.`;
    }

    if (buyCondition) {
      return `${buyCondition} 사고 싶어요.`;
    }

    if (sellCondition) {
      return `${sellCondition} 알림을 받고 싶어요.`;
    }

    return '';
  }

  function updateConditionSummary() {
    if (!conditionSummaryText || !conditionSummaryValueInput) return;

    const summary = [createWatchlistSentence(), createTradeRuleSentence()].filter(Boolean).join(' ');
    conditionSummaryText.textContent = summary || '칩을 선택하면 상담 문장이 자동으로 정리됩니다.';
    conditionSummaryValueInput.value = summary;
  }

  conditionSummaryReady = true;
  updateConditionSummary();

  function getConsultationMessage() {
    if (!consultationForm) return '';
    const formData = new FormData(consultationForm);

    return [
      '[퀀트공방 무료진단 신청]',
      '',
      `거래 시장: ${formData.get('market') || '미선택'}`,
      `거래 환경: ${formData.get('platform') || '미선택'}`,
      `가장 먼저 필요한 것: ${formData.get('primaryGoal') || '미선택'}`,
      `보고 싶은 종목: ${formData.get('watchlist') || '무료진단 시 설명 예정'}`,
      `자동 정리 문장: ${formData.get('conditionSummary') || '무료진단 시 설명 예정'}`,
      '',
      `사고 싶은 기준: ${formData.get('buyRule') || '무료진단 시 설명 예정'}`,
      `팔고 싶은 기준: ${formData.get('sellRule') || '무료진단 시 설명 예정'}`,
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
    const subject = `[퀀트공방 무료진단 신청] ${formData.get('market')} / ${formData.get('primaryGoal')}`;
    const body = getConsultationMessage();
    window.location.href = `mailto:betterpsh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('무료진단 신청 내용이 이메일 본문으로 정리됩니다', '메일');
  });

  consultCopyBtn?.addEventListener('click', async () => {
    const body = getConsultationMessage();
    if (!body) return;

    try {
      await navigator.clipboard.writeText(body);
      showToast('무료진단 신청 내용이 복사되었습니다', '✓');
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
      showToast('무료진단 신청 내용이 복사되었습니다', '✓');
    }
  });

  /* Sample program preview modal */
  const sampleProgramBtn = document.getElementById('sample-program-btn');
  const sampleProgramModal = document.getElementById('sample-program-modal');
  const sampleProgramPreviewTarget = document.getElementById('sample-program-preview-target');
  const sampleProgramCloseEls = document.querySelectorAll('[data-sample-modal-close]');
  let sampleProgramLastFocus = null;

  function mountSampleProgramPreview() {
    if (!sampleProgramPreviewTarget || sampleProgramPreviewTarget.childElementCount) return;
    const sourceWindow = document.querySelector('#program-preview .mq-desktop-window');
    if (!sourceWindow) return;
    const previewClone = sourceWindow.cloneNode(true);
    previewClone.classList.add('mq-sample-window');
    sampleProgramPreviewTarget.appendChild(previewClone);
  }

  function closeSampleProgramModal() {
    if (!sampleProgramModal) return;
    sampleProgramModal.classList.remove('is-open');
    sampleProgramModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mq-sample-modal-open');
    sampleProgramLastFocus?.focus?.();
  }

  function openSampleProgramModal() {
    if (!sampleProgramModal) return;
    sampleProgramLastFocus = document.activeElement;
    mountSampleProgramPreview();
    sampleProgramModal.classList.add('is-open');
    sampleProgramModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mq-sample-modal-open');
    sampleProgramModal.querySelector('.mq-sample-modal-close')?.focus();
    showToast('샘플 프로그램 화면을 엽니다', '보기');
  }

  sampleProgramBtn?.addEventListener('click', openSampleProgramModal);
  sampleProgramCloseEls.forEach(button => {
    button.addEventListener('click', closeSampleProgramModal);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sampleProgramModal?.classList.contains('is-open')) {
      closeSampleProgramModal();
    }
  });

  /* CTA button toasts */
  document.getElementById('hero-cta-secondary')?.addEventListener('click', () => {
    showToast('제작 가능 여부 확인 섹션으로 이동합니다', '의뢰');
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
  document.getElementById('quick-email-btn')?.addEventListener('click', () => {
    showToast('betterpsh@gmail.com으로 이메일 앱을 엽니다', '메일');
  });
  document.getElementById('quick-kakao-btn')?.addEventListener('click', () => {
    showToast('카카오톡 오픈채팅으로 연결합니다', '톡');
  });
  document.getElementById('quick-form-btn')?.addEventListener('click', () => {
    showToast('무료진단 작성으로 이동합니다', '진단');
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
