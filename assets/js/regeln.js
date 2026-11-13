/* Führerschein & Regeln · Flight Club Saar e. V.
   Natan 13.11.2026: „eine ganze Seite richtig ausgearbeitet, mit einfacher Erklärung, mit Links … ultra einfach, ultra geil erklärt“
   Leit-Idee: Betaflight-Arming-Flags. Fünf Stationen (Versicherung, e-ID, Nachweis, Spotter, Zone) löschen je ein Flag;
   der Pre-Arm-Check unten und die Leiste oben zeigen denselben Stand. Gespeichert nur im eigenen Browser. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const FLAGS = ['versicherung', 'eid', 'schein', 'spotter', 'dipul'];
  const KEY = 'fcs-regeln-check';
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  /* ---------- Arming-Stand ---------- */
  function render(changed) {
    FLAGS.forEach(f => {
      $$(`[data-flag="${f}"]`).forEach(a => a.classList.toggle('ok', !!st[f]));
      $$(`[data-done="${f}"]`).forEach(b => { b.classList.toggle('on', !!st[f]); b.setAttribute('aria-pressed', st[f] ? 'true' : 'false'); });
    });
    $$('#rg-cl input').forEach(i => { i.checked = !!st[i.dataset.c]; });
    const n = FLAGS.filter(f => st[f]).length;
    const all = $$('#rg-cl input').every(i => i.checked);
    $$('[data-armcount]').forEach(e => { e.textContent = n; });
    $$('[data-armstate]').forEach(e => { e.textContent = all ? 'ARMED · Viel Spaß!' : (n === 5 ? 'FAST BEREIT' : 'ARMING DISABLED'); });
    document.body.classList.toggle('rg-armed', all);
    if (changed) { const bar = $('#rg-arm'); if (bar) { bar.classList.remove('pulse'); void bar.offsetWidth; bar.classList.add('pulse'); } }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-done]'); if (!b) return;
    const f = b.dataset.done; st[f] = !st[f]; save(); render(true);
  });
  $$('#rg-cl input').forEach(i => i.addEventListener('change', () => { st[i.dataset.c] = i.checked; save(); render(true); }));
  const reset = $('#rg-reset'); if (reset) reset.addEventListener('click', () => { st = {}; save(); render(true); });

  /* ---------- Assistent „Was brauche ich?“ ---------- */
  const form = $('.rg-wiz');
  const PRE = {
    whoop: { g: 'u250', k: 'ja', b: 'ja' },
    fuenf: { g: 'u2k', k: 'ja', b: 'ja' },
    cine: { g: 'u2k', k: 'ja', b: 'ja' },
    lr: { g: 'u2k', k: 'ja', b: 'ja' },
  };
  const val = n => { const i = $(`input[name="${n}"]:checked`, form); return i ? i.value : ''; };
  const set = (n, v) => { const i = $(`input[name="${n}"][value="${v}"]`, form); if (i) i.checked = true; };
  const item = (need, t, s) => `<li class="${need ? 'need' : 'no'}"><span class="rg-i">${need ? '!' : '✓'}</span><div><b>${t}</b><span>${s}</span></div></li>`;

  function wizard() {
    if (!form) return;
    const g = val('g'), k = val('k') === 'ja', b = val('b') === 'ja', v = val('v') === 'ja', jung = val('a') === 'u16';
    const out = [];
    let kosten = 0;
    out.push(item(true, 'Haftpflichtversicherung', v ? 'Hast du über DMFV oder DMO. Nachweis beim Fliegen dabei haben.' : 'Pflicht für jede Drohne. Am günstigsten über die <a href="#versicherung">DMO oder den DMFV</a>.'));
    if (!v) kosten += 40;
    const eid = k || g !== 'u250';
    out.push(item(eid, eid ? 'Registrierung mit e-ID' : 'Keine Registrierung nötig', eid ? (k ? 'Weil eine Kamera drin ist. 20 € einmalig, Nummer auf jeden Kopter. <a href="#registrierung">So geht’s</a>' : 'Ab 250 g Pflicht. 20 € einmalig. <a href="#registrierung">So geht’s</a>') : 'Unter 250 g ohne Kamera brauchst du keine e-ID.'));
    if (eid) kosten += 20;
    if (v) {
      const kn = g === 'o2k';
      out.push(item(kn, kn ? 'DMFV-Kenntnisnachweis' : 'Kein Kompetenznachweis nötig', kn ? 'Über 2 kg verlangt das DMFV-Regelwerk den Kenntnisnachweis des Verbands. <a href="#fuehrerschein">Mehr</a>' : 'Nach DMFV-Regelwerk bis 2 kg nicht nötig. Den A1/A3 zu machen schadet trotzdem nicht.'));
    } else {
      const a1 = g !== 'u250';
      out.push(item(a1, a1 ? 'Kompetenznachweis A1/A3' : 'Kein Führerschein Pflicht', a1 ? 'Ab 250 g Pflicht. Online beim LBA, 25 €, gilt 5 Jahre. <a href="https://exam.lba-openuav.de/" target="_blank" rel="noopener">Jetzt machen</a>' : 'Unter 250 g nicht Pflicht, aber empfohlen.'));
      if (a1) kosten += 25;
    }
    if (b) out.push(item(true, v ? 'Spotter ab 30 m Höhe' : 'Luftraumbeobachter (Spotter)', v ? 'Nach DMFV-Regelwerk bis 30 m auch ohne. Darüber steht jemand neben dir, der den Kopter sieht.' : 'Mit Brille immer jemand neben dir, der den Kopter direkt sieht. <a href="#fpv">Warum</a>'));
    else out.push(item(false, 'Kein Spotter nötig', 'Auf Sicht geflogen behältst du den Kopter selbst im Blick.'));
    out.push(item(true, g === 'u250' ? 'Regeln wie Unterkategorie A1' : 'Regeln wie Unterkategorie A3', g === 'u250' ? 'Nicht über Menschenansammlungen, unter 120 m, dipul-Karte prüfen.' : 'Weit weg von Menschen: 150 m Abstand zu Wohn-, Gewerbe- und Erholungsgebieten, unter 120 m, dipul-Karte prüfen. <a href="#wo">Mehr</a>'));
    if (jung) out.push(item(true, 'Unter 16 Jahren', g === 'u250' ? 'Mit Koptern unter 250 g geht es. Bei allem anderen nur unter direkter Aufsicht eines Erwachsenen mit Nachweis.' : 'Ab 250 g fliegst du nur unter direkter Aufsicht eines Erwachsenen mit passendem Nachweis.'));
    $('#rg-res').innerHTML = out.join('');
    $('#rg-sum').textContent = kosten ? `Im ersten Jahr grob ${kosten} € für alles zusammen.` : 'Kosten: nur deine Verbandsmitgliedschaft.';
    $$('.rg-chip').forEach(c => c.classList.remove('on'));
  }
  if (form) {
    form.addEventListener('change', () => { touched = true; hint(); wizard(); });
    $$('.rg-chip').forEach(c => c.addEventListener('click', () => {
      touched = true; hint();
      const p = PRE[c.dataset.preset]; Object.entries(p).forEach(([n, v]) => set(n, v)); wizard(); c.classList.add('on');
    }));
    wizard();
  }
  /* Selbst-Impuls: Wer den Assistenten sieht, aber nichts antippt, bekommt nach kurzer Zeit eine Vorführung. */
  let touched = false;
  const hint = () => { const h = $('#rg-hint'); if (h && touched) h.classList.add('weg'); };
  if (form && 'IntersectionObserver' in window && !(window.FCS && FCS.rm)) {
    let timer = null, ran = false;
    const demo = () => {
      if (touched || ran) return; ran = true;
      const seq = ['whoop', 'fuenf'];
      seq.forEach((p, i) => setTimeout(() => { if (touched) return; const c = $(`.rg-chip[data-preset="${p}"]`); const o = PRE[p]; Object.entries(o).forEach(([n, v]) => set(n, v)); wizard(); c && c.classList.add('on'); }, i * 1800));
    };
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { timer = setTimeout(demo, 2600); } else clearTimeout(timer);
    }), { threshold: .45 }).observe(form);
  }

  /* ---------- Tabs Führerscheine ---------- */
  const tabs = $$('.rg-tabs [role=tab]');
  const show = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; show(n); n.focus();
    });
  });

  /* ---------- Verbotszonen ---------- */
  const out = $('#rg-zone-out');
  const zones = $$('.rg-zone');
  const pick = z => {
    zones.forEach(x => x.setAttribute('aria-pressed', x === z ? 'true' : 'false'));
    $('.rg-zo-d', out).textContent = z.dataset.d; $('.rg-zo-t', out).textContent = z.dataset.z; $('.rg-zo-x', out).textContent = z.dataset.t;
  };
  zones.forEach(z => { z.setAttribute('aria-pressed', 'false'); z.addEventListener('click', () => { zonesTouched = true; pick(z); }); });
  let zonesTouched = false;
  if (zones.length && 'IntersectionObserver' in window) {
    let i = 0, iv = null;
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !zonesTouched && !(window.FCS && FCS.rm)) { if (!iv) { pick(zones[0]); iv = setInterval(() => { if (zonesTouched) { clearInterval(iv); return; } i = (i + 1) % zones.length; pick(zones[i]); }, 2600); } }
      else if (iv) { clearInterval(iv); iv = null; }
    }), { threshold: .3 }).observe($('#rg-zones'));
  }

  /* ---------- e-ID klebt sich drauf, Höhe im Brillenbild ---------- */
  const eid = $('.rg-eid');
  if (eid && 'IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { eid.classList.add('vis'); o.disconnect(); } }), { threshold: .4 }).observe(eid);
  const alt = $('[data-alt]');
  if (alt && !(window.FCS && FCS.rm)) { let h = 12, d = 1; setInterval(() => { h += d; if (h > 34 || h < 6) d = -d; alt.textContent = h; alt.style.color = h > 30 ? 'var(--amber)' : ''; }, 420); }

  render(false);
})();
