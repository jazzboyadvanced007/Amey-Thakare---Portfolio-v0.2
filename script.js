/* Portfolio renderer. All content comes from data.json; you should not need to edit this file. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  let data = null;
  let lens = 'all';

  // ----- text helpers -----
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Supports **bold** and *italic* inside data.json strings.
  const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const rolesAttr = (r) => (Array.isArray(r) && r.length ? ` data-roles="${esc(r.join(' '))}"` : '');
  const norm = (b) => (typeof b === 'string' ? { text: b } : b);
  const list = (v) => (Array.isArray(v) ? v : []);

  // ----- intro loader -----
  const loaderDone = new Promise((resolve) => {
    $('#skipIntro').addEventListener('click', resolve);
    if (reduceMotion) return resolve();
    const bar = $('#loaderBar'), count = $('#loaderCount');
    const start = performance.now(), dur = 1500;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      bar.style.width = e * 100 + '%';
      count.textContent = Math.round(e * 100);
      t < 1 ? requestAnimationFrame(tick) : setTimeout(resolve, 200);
    };
    requestAnimationFrame(tick);
    setTimeout(resolve, 2500); // safety net if the tab is in the background
  });

  function setLoaderName(name) {
    $('#loaderName').innerHTML = [...name].map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`).join('');
  }

  // ----- rendering -----
  function head(id, key) {
    const s = (data.sections || {})[key] || {};
    $(id).innerHTML = `
      <p class="eyebrow">${esc(s.kicker || key)}</p>
      <h2 class="section__title">${fmt(s.title || '')}</h2>
      ${s.intro ? `<p class="section__intro">${fmt(s.intro)}</p>` : ''}`;
  }

  function hideIfEmpty(sectionId, arr) {
    const empty = !list(arr).length;
    $(sectionId).hidden = empty;
    const link = $(`.nav__links a[href="${sectionId}"]`);
    if (link) link.hidden = empty;
    return empty;
  }

  function render() {
    const p = data.profile || {};
    document.title = data.meta?.title || p.name || 'Portfolio';
    $('meta[name="description"]').setAttribute('content', data.meta?.description || '');

    // nav + hero
    $('#navBrand').textContent = p.name || '';
    const resume = $('#navResume');
    if (p.resumeFile) resume.href = p.resumeFile; else resume.hidden = true;
    $('#heroEyebrow').textContent = [p.name, p.location].filter(Boolean).join(' · ');
    $('#heroTitle').innerHTML = fmt(p.headline);
    $('#heroSummary').innerHTML = fmt(p.summary);
    const photo = $('#heroPhoto');
    if (p.headshot) { photo.src = p.headshot; photo.alt = `Portrait of ${p.name || ''}`; } else $('.hero__visual').hidden = true;
    $('#heroChips').innerHTML = list(p.heroChips).slice(0, 2).map((c) => `<div class="chip"><b>${esc(c.value)}</b><span>${esc(c.label)}</span></div>`).join('');
    $('#heroCredits').innerHTML = [p.now && `<b>Now:</b> ${esc(p.now)}`, p.before && `<b>Before:</b> ${esc(p.before)}`].filter(Boolean).join('<br>');
    $('#playOverview').hidden = !list(data.overview).length;
    const badge = $('#heroBadge');
    if (p.availability) badge.textContent = p.availability; else badge.hidden = true;

    // lens switcher
    const roles = list(data.roles);
    $('#lensOptions').innerHTML = [{ id: 'all', label: 'Everything' }, ...roles]
      .map((r) => `<button class="lens__btn" data-lens-set="${esc(r.id)}" aria-pressed="false">${esc(r.label)}</button>`).join('');
    if (!roles.length) $('.lens').hidden = true;

    // stats
    $('#statsGrid').innerHTML = list(data.stats).map((s, i) => `
      <div class="stat reveal" style="--d:${i}">
        <div class="stat__num" data-count="${esc(s.value)}" data-decimals="${esc(s.decimals ?? (String(s.value).split('.')[1] || '').length)}" data-prefix="${esc(s.prefix || '')}" data-suffix="${esc(s.suffix || '')}">${esc(s.prefix || '')}0${esc(s.suffix || '')}</div>
        <div class="stat__label">${esc(s.label)}</div>
      </div>`).join('');
    $('#stats').hidden = !list(data.stats).length;

    // roles
    if (!hideIfEmpty('#roles', roles)) {
      head('#rolesHead', 'roles');
      $('#rolesGrid').innerHTML = roles.map((r, i) => `
        <button class="role reveal" style="--d:${i}" data-lens-set="${esc(r.id)}" aria-pressed="false">
          <span class="role__num">0${i + 1}</span>
          <span class="role__label">${esc(r.label)}</span>
          <span class="role__pitch">${fmt(r.pitch)}</span>
          <ul class="role__proof">${list(r.proof).map((x) => `<li>${fmt(x)}</li>`).join('')}</ul>
          <span class="role__cta"></span>
        </button>`).join('');
    }

    // experience
    if (!hideIfEmpty('#experience', data.experience)) {
      head('#experienceHead', 'experience');
      $('#timeline').innerHTML = '<i class="timeline__fill" id="timelineFill"></i>' + data.experience.map((job) => `
        <article class="job">
          <div class="job__head reveal">
            <h3 class="job__company">${esc(job.company)}</h3>
            <span class="job__meta">${esc([job.location, job.period].filter(Boolean).join(' · '))}</span>
          </div>
          ${list(job.positions).map((pos) => `
            <div class="position reveal">
              <div class="position__head">
                <h4 class="position__title">${esc(pos.title)}</h4>
                <span class="job__meta">${esc(pos.period)}</span>
              </div>
              <ul class="bullets">${list(pos.bullets).map(norm).map((b) => `<li${rolesAttr(b.roles)}>${fmt(b.text)}</li>`).join('')}</ul>
            </div>`).join('')}
        </article>`).join('');
    }

    // projects (case study cards; the full story opens in a modal)
    if (!hideIfEmpty('#projects', data.projects)) {
      head('#projectsHead', 'projects');
      $('#projectsList').innerHTML = data.projects.map((pr, i) => {
        const m = metricsOf(pr)[0];
        return `
        <article class="project reveal"${rolesAttr(pr.roles)}>
          <div class="project__meta">
            ${pr.context ? `<span>${esc(pr.context)}</span>` : ''}
            ${pr.period ? `<span>${esc(pr.period)}</span>` : ''}
            ${pr.status ? `<span class="project__status">${esc(pr.status)}</span>` : ''}
          </div>
          <h3 class="project__title">${esc(pr.title)}</h3>
          <p class="project__summary">${fmt(pr.summary || norm(list(pr.bullets)[0] || '').text)}</p>
          <div class="tags">${list(pr.tags).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="project__foot">
            <div class="project__metric">${m ? `<b>${esc(m.value)}</b><span>${esc(m.label)}</span>` : ''}</div>
            <button class="project__open" data-project="${i}" aria-label="Open case study: ${esc(pr.title)}">Case study <i aria-hidden="true">→</i></button>
          </div>
        </article>`;
      }).join('');
    }

    // skills
    if (!hideIfEmpty('#skills', data.skills)) {
      head('#skillsHead', 'skills');
      $('#skillsGrid').innerHTML = data.skills.map((g, i) => `
        <div class="skillgroup reveal" style="--d:${i % 2}"${rolesAttr(g.roles)}>
          <h3>${esc(g.group)}</h3>
          <div class="pills">${list(g.items).map((s) => `<span class="pill">${esc(s)}</span>`).join('')}</div>
        </div>`).join('');
    }

    // leadership
    if (!hideIfEmpty('#leadership', data.leadership)) {
      head('#leadershipHead', 'leadership');
      $('#leadershipGrid').innerHTML = data.leadership.map((l, i) => `
        <article class="card reveal" style="--d:${i}"${rolesAttr(l.roles)}>
          <div class="card__meta">${esc(l.period)}</div>
          <h3>${esc(l.title)}</h3>
          <div class="card__org">${esc(l.org)}</div>
          <p class="card__text">${fmt(l.text)}</p>
        </article>`).join('');
    }

    // education + extras
    if (!hideIfEmpty('#education', data.education)) {
      head('#educationHead', 'education');
      $('#educationList').innerHTML = data.education.map((e) => `
        <div class="edu__row reveal">
          <div class="edu__period">${esc(e.period)}</div>
          <div>
            <h3 class="edu__school">${esc(e.school)}</h3>
            <div class="edu__degree">${esc(e.degree)}</div>
            ${e.detail ? `<div class="edu__detail">${esc(e.detail)}</div>` : ''}
            ${list(e.honors).length ? `<div class="tags">${e.honors.map((h) => `<span class="tag">${esc(h)}</span>`).join('')}</div>` : ''}
          </div>
        </div>`).join('');
      const honors = list(data.honors);
      $('#honorsHead').hidden = !honors.length;
      if (honors.length) head('#honorsHead', 'honors');
      $('#honorsGrid').innerHTML = honors.map(norm).map((h, i) => `<div class="honor reveal" style="--d:${i % 3}"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16" cy="12" r="7.5"/><path d="M16 8.2l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z"/><path d="M11.5 18.5L9 28l7-3.5 7 3.5-2.5-9.5"/></svg><strong>${esc(h.title ?? h.text)}</strong>${h.detail ? `<span>${esc(h.detail)}</span>` : ''}</div>`).join('');
      const certs = list(data.certifications), langs = list(data.languages);
      $('#extras').innerHTML =
        (certs.length ? `<div class="reveal"><h3>Certifications</h3><div class="pills">${certs.map((c) => `<span class="pill">${esc(c)}</span>`).join('')}</div></div>` : '') +
        (langs.length ? `<div class="reveal" style="--d:1"><h3>Languages</h3><div class="pills">${langs.map(norm).map((l) => `<span class="pill">${esc(l.name ?? l.text)}${l.level ? `<small>${esc(l.level)}</small>` : ''}</span>`).join('')}</div></div>` : '');
    }

    // contact
    $('#contactTitle').innerHTML = fmt(p.contactHeadline || "Let's talk.");
    $('#contactText').innerHTML = fmt(p.contactText || '');
    $('#contactLinks').innerHTML = [
      p.email && `<a class="btn btn--primary magnetic" href="mailto:${esc(p.email)}">${esc(p.email)}</a>`,
      p.email && `<button class="btn btn--light magnetic" data-copy="${esc(p.email)}">Copy email</button>`,
      p.linkedin && `<a class="btn btn--light magnetic" href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>`,
      p.github && `<a class="btn btn--light magnetic" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>`,
      p.phone && `<a class="btn btn--light magnetic" href="tel:${esc(p.phone.replace(/[^\d+]/g, ''))}">${esc(p.phone)}</a>`,
      p.resumeFile && `<a class="btn btn--light magnetic" href="${esc(p.resumeFile)}" download>Download resume ↓</a>`,
    ].filter(Boolean).join('');
    $('#footer').innerHTML = `<span>© ${new Date().getFullYear()} ${esc(p.name || '')}</span><a href="#top">Back to top ↑</a>`;
  }

  // ----- modals: case study + 30-second overview -----
  const metricsOf = (pr) => (list(pr.metrics).length ? pr.metrics : pr.metric ? [pr.metric] : []);
  const CLOSE_BTN = '<button class="sheet__close" data-close aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  let openEl = null, lastFocus = null;

  function openModal(el) {
    lastFocus = document.activeElement;
    openEl = el;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.sheet__close', el)?.focus({ preventScroll: true });
  }
  function closeModal() {
    if (!openEl) return;
    if (openEl.id === 'storyModal') story.stop();
    openEl.classList.remove('open');
    openEl = null;
    document.body.style.overflow = '';
    lastFocus?.focus?.({ preventScroll: true });
  }

  function openProject(i) {
    const pr = data.projects[i];
    if (!pr) return;
    const metrics = metricsOf(pr), flow = list(pr.flow);
    $('#projectSheet').innerHTML = `
      ${CLOSE_BTN}
      <div class="project__meta">
        ${pr.context ? `<span>${esc(pr.context)}</span>` : ''}
        ${pr.period ? `<span>${esc(pr.period)}</span>` : ''}
        ${pr.status ? `<span class="project__status">${esc(pr.status)}</span>` : ''}
      </div>
      <h3 class="sheet__title" id="pmTitle">${esc(pr.title)}</h3>
      ${pr.summary ? `<p class="sheet__summary">${fmt(pr.summary)}</p>` : ''}
      <div class="sheet__body">
        <div>
          <div class="sheet__label">What I did</div>
          <ul class="sheet__points">${list(pr.bullets).map(norm).map((b) => `<li>${fmt(b.text)}</li>`).join('')}</ul>
          <div class="tags">${list(pr.tags).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          ${pr.link ? `<a class="btn btn--small sheet__link" href="${esc(pr.link)}" target="_blank" rel="noopener">View project ↗</a>` : ''}
        </div>
        <div>
          ${metrics.length ? `<div class="sheet__label">Results</div><div class="metrics">${metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join('')}</div>` : ''}
          ${flow.length ? `<div class="sheet__label">How it works</div><ol class="flow">${flow.map((s, k) => `<li class="flow__step" style="--s:${k}"><i class="flow__dot"></i>${esc(s)}</li>`).join('')}</ol>` : ''}
        </div>
      </div>`;
    $('#projectModal').scrollTop = 0;
    requestAnimationFrame(() => openModal($('#projectModal')));
  }

  const story = {
    i: 0, timer: null, started: 0, left: 0, paused: false, DUR: 6000,
    slides: () => list(data.overview),
    open() { this.i = 0; openModal($('#storyModal')); this.show(); },
    show() {
      const slides = this.slides(), s = slides[this.i], p = data.profile || {}, last = this.i === slides.length - 1;
      $('#storyBars').innerHTML = slides.map((_, k) => `<i class="${k < this.i ? 'done' : k === this.i ? 'on' : ''}" style="--dur:${this.DUR}ms"><b></b></i>`).join('');
      const el = $('#storySlide');
      el.className = 'story__slide' + (s.photo && p.headshot ? ' has-photo' : '');
      el.innerHTML = `
        ${s.kicker ? `<div class="story__k">${esc(s.kicker)}</div>` : ''}
        <div class="story__big">${esc(s.big)}</div>
        <div class="story__txt">${fmt(s.text)}</div>
        ${last ? `<div class="story__cta">
          ${p.email ? `<a class="btn btn--primary btn--small" href="mailto:${esc(p.email)}">Email me</a>` : ''}
          ${p.resumeFile ? `<a class="btn btn--light btn--small" href="${esc(p.resumeFile)}" download>Download resume</a>` : ''}
          <button class="btn btn--light btn--small" data-close>See the full portfolio</button></div>` : ''}
        ${s.photo && p.headshot ? `<div class="story__photo"><img src="${esc(p.headshot)}" alt=""></div>` : ''}`;
      this.paused = false; $('.story').classList.remove('is-paused');
      this.left = this.DUR; this.run();
    },
    run() { clearTimeout(this.timer); this.started = performance.now(); this.timer = setTimeout(() => this.go(1, true), this.left); },
    go(dir, auto) {
      const n = this.i + dir, max = this.slides().length - 1;
      if (n > max) { if (!auto) closeModal(); return; } // stay on the last slide when autoplay ends
      this.i = Math.max(0, n); this.show();
    },
    toggle() {
      this.paused = !this.paused; $('.story').classList.toggle('is-paused', this.paused);
      if (this.paused) { clearTimeout(this.timer); this.left -= performance.now() - this.started; } else this.run();
    },
    stop() { clearTimeout(this.timer); },
  };

    // ----- role lens -----
  function setLens(id, { animate = true, updateUrl = true } = {}) {
    const roles = list(data.roles);
    const role = roles.find((r) => r.id === id);
    lens = role ? id : 'all';
    document.body.dataset.lens = lens;

    $$('[data-roles]').forEach((el) => {
      const match = lens === 'all' || el.dataset.roles.split(' ').includes(lens);
      el.classList.toggle('dim', !match);
      el.classList.toggle('lit', match && lens !== 'all');
    });
    $$('[data-lens-set]').forEach((b) => {
      const on = b.dataset.lensSet === lens;
      b.classList.toggle('is-active', on && !(b.classList.contains('role') && lens === 'all'));
      b.setAttribute('aria-pressed', on);
    });
    $$('.role').forEach((b) => { $('.role__cta', b).textContent = b.dataset.lensSet === lens ? 'Viewing this role ✓' : 'View portfolio as this role →'; });

    const chip = $('#lensChip');
    chip.hidden = lens === 'all';
    if (role) chip.textContent = role.label;

    const p = data.profile || {};
    const swap = (el, html) => {
      if (!animate || reduceMotion) { el.innerHTML = html; return; }
      el.classList.add('swap', 'is-out');
      setTimeout(() => { el.innerHTML = html; el.classList.remove('is-out'); }, 220);
    };
    swap($('#heroTitle'), fmt(role?.headline || p.headline));
    swap($('#heroSummary'), fmt(role?.pitch ? `${role.pitch}` : p.summary));

    if (updateUrl) {
      const url = new URL(location.href);
      lens === 'all' ? url.searchParams.delete('role') : url.searchParams.set('role', lens);
      history.replaceState(null, '', url);
    }
  }

  // ----- interactions -----
  function countUp(el) {
    const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals, 10) || 0;
    const { prefix, suffix } = el.dataset;
    const put = (v) => { el.textContent = prefix + v.toFixed(dec) + suffix; };
    if (reduceMotion || Number.isNaN(target)) return put(Number.isNaN(target) ? 0 : target);
    const start = performance.now(), dur = 1600;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      put(target * (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setupScroll() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        const num = $('[data-count]', en.target);
        if (num) countUp(num);
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));

    // active nav link
    const links = $$('.nav__links a');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });

    const nav = $('#nav'), bar = $('#scrollProgress'), timeline = $('#timeline'), photo = $('#heroPhoto');
    let lastY = 0, ticking = false;
    const onScroll = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      nav.classList.toggle('is-scrolled', y > 30);
      const menuOpen = $('#navLinks').classList.contains('is-open');
      nav.classList.toggle('is-hidden', !menuOpen && y > 500 && y > lastY);
      lastY = y;
      const fill = $('#timelineFill');
      if (fill && timeline.offsetParent) {
        const r = timeline.getBoundingClientRect();
        const prog = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
        fill.style.height = `calc(${prog} * (100% - 16px))`;
      }
      if (!reduceMotion && y < innerHeight) photo.style.translate = `0 ${y * 0.06}px`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  function setupHover() {
    if (!finePointer || reduceMotion) return;
    // cursor spotlight on project cards
    $$('.project').forEach((el) => el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    }));
    // 3D tilt
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    // magnetic buttons
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function setupClicks() {
    document.addEventListener('keydown', (e) => {
      if (!openEl) return;
      if (e.key === 'Escape') return closeModal();
      if (openEl.id !== 'storyModal') return;
      if (e.key === 'ArrowRight') story.go(1);
      else if (e.key === 'ArrowLeft') story.go(-1);
      else if (e.key === ' ' && !e.target.closest('a, button')) { e.preventDefault(); story.toggle(); }
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]') || e.target.classList.contains('modal')) return closeModal();
      const proj = e.target.closest('[data-project]');
      if (proj) return openProject(+proj.dataset.project);
      if (e.target.closest('#playOverview')) return story.open();
      const tap = e.target.closest('[data-story]');
      if (tap) return story.go(+tap.dataset.story);
      const lensBtn = e.target.closest('[data-lens-set]');
      if (lensBtn) {
        const id = lensBtn.dataset.lensSet;
        setLens(lensBtn.classList.contains('role') && id === lens ? 'all' : id);
        if (lensBtn.classList.contains('role') && lens !== 'all') toast(`Highlighting what matters for ${lensBtn.querySelector('.role__label').textContent}`);
        return;
      }
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        (navigator.clipboard?.writeText(copy.dataset.copy) ?? Promise.reject()).then(() => toast('Email copied'), () => toast(copy.dataset.copy));
        return;
      }
      if (e.target.closest('#lensChip')) return setLens('all');
      const toggle = e.target.closest('#navToggle');
      const links = $('#navLinks');
      if (toggle || (links.classList.contains('is-open') && e.target.closest('.nav__links a'))) {
        const open = !links.classList.contains('is-open') && !!toggle;
        links.classList.toggle('is-open', open);
        $('#navToggle').setAttribute('aria-expanded', open);
      }
    });
  }

  function showError(err) {
    const isFile = location.protocol === 'file:';
    $('#loader').remove();
    $('#nav').remove();
    document.documentElement.classList.remove('is-loading');
    $('#app').innerHTML = `<div class="error">
      <h1>${isFile ? 'Open this site through the launcher' : "Couldn't load data.json"}</h1>
      ${isFile
        ? '<p>Browsers block pages opened straight from the file system from reading <code>data.json</code>.</p><p>Double-click <code>start.command</code> in this folder instead. It starts a small local server and opens the site for you.</p>'
        : `<p>Check <code>data.json</code> for a typo, such as a missing comma or quote, then refresh.</p><p><code>${esc(err.message)}</code></p>`}
    </div>`;
  }

  // ----- boot -----
  async function init() {
    try {
      const res = await fetch('data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`data.json returned HTTP ${res.status}`);
      data = JSON.parse(await res.text());
    } catch (err) {
      console.error(err);
      return showError(err);
    }
    setLoaderName(data.profile?.name || '');
    render();
    setupClicks();
    setLens(new URLSearchParams(location.search).get('role') || 'all', { animate: false, updateUrl: false });
    await loaderDone;
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('is-ready');
    setupScroll();
    setupHover();
    setTimeout(() => $('#loader')?.remove(), 1200);
  }
  init();
})();
