/* 小学英语背单词 —— 纯静态网页，无需联网、无后台。进度保存在本机浏览器 localStorage。 */
(function () {
  'use strict';
  var STORE_KEY = 'pep-words-v1';
  var MASTER_NEED = 3;                 // 不同天或不同模式答对 3 次 = 已掌握
  var INTERVALS = [0, 1, 2, 4, 7, 15]; // 复习间隔（天），按答对次数递增
  var CHUNK_COLORS = ['#2d3436', '#27a35a', '#e07a2f', '#3b82c4'];
  var MODES = { study: '学习', spell: '拼写', listen: '听选', review: '复习' };

  // 音素 → 朗读提示（用 "发音, as in 例词" 读给孩子听）
  var PH = {
    'p': ['puh', 'pig'], 'b': ['buh', 'bag'], 't': ['tuh', 'ten'], 'd': ['duh', 'dog'], 'k': ['kuh', 'cat'], 'ɡ': ['guh', 'go'],
    'f': ['fff', 'fish'], 'v': ['vvv', 'van'], 's': ['sss', 'sun'], 'z': ['zzz', 'zoo'], 'θ': ['th', 'three'], 'ð': ['th', 'mother'],
    'ʃ': ['shh', 'ship'], 'ʒ': ['zh', 'television'], 'tʃ': ['ch', 'chair'], 'dʒ': ['juh', 'juice'], 'h': ['huh', 'hat'],
    'm': ['mmm', 'map'], 'n': ['nnn', 'nose'], 'ŋ': ['ng', 'sing'], 'l': ['lll', 'leg'], 'r': ['ruh', 'red'], 'w': ['wuh', 'wet'], 'j': ['yuh', 'yes'],
    'ks': ['ks', 'box'], 'kw': ['kw', 'queen'], 'wʌ': ['wuh', 'one'],
    'æ': ['a', 'cat'], 'e': ['e', 'bed'], 'ɪ': ['i', 'pig'], 'ɒ': ['o', 'dog'], 'ʌ': ['u', 'bus'], 'ʊ': ['oo', 'book'], 'ə': ['uh', 'about'],
    'iː': ['ee', 'tree'], 'i': ['ee', 'happy'], 'ɑː': ['ah', 'car'], 'ɔː': ['aw', 'ball'], 'uː': ['oo', 'zoo'], 'ɜː': ['er', 'bird'],
    'eɪ': ['ay', 'cake'], 'aɪ': ['eye', 'bike'], 'ɔɪ': ['oy', 'boy'], 'əʊ': ['oh', 'nose'], 'aʊ': ['ow', 'cow'],
    'ɪə': ['ear', 'ear'], 'eə': ['air', 'chair'], 'juː': ['you', 'student'], 'ju': ['you', 'music']
  };

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var app = $('#app');
  var S = { books: [], bookCache: {}, view: 'home', bookId: null, unitIdx: 0, mode: 'study', wordIdx: 0, history: [] };
  var db = loadDB();

  // ---------------- 存储 ----------------
  function loadDB() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    if (!d || !d.profiles) {
      d = { slow: false, current: 'p1', profiles: [
        { id: 'p1', name: '景菲', book: 'grade3-up' },
        { id: 'p2', name: '明毅', book: 'grade4-up' },
        { id: 'p3', name: '明泽', book: 'grade6-up' }], progress: {} };
    }
    return d;
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) { toast('无法保存进度（浏览器可能处于无痕模式）'); } }
  function profile() { return db.profiles.filter(function (p) { return p.id === db.current; })[0] || db.profiles[0]; }
  function prog() { var p = profile(); return db.progress[p.id] || (db.progress[p.id] = {}); }
  function wkey(bookId, w) { return bookId + ':' + w.word; }
  function st(bookId, w) {
    var P = prog(), k = wkey(bookId, w);
    return P[k] || (P[k] = { hits: [], box: 0, due: 0, fav: false, manual: false, wrong: 0 });
  }
  function peek(bookId, w) { return prog()[wkey(bookId, w)]; }
  function isMastered(s) {
    if (!s) return false;
    if (s.manual) return true;
    var seen = {};
    s.hits.forEach(function (h) { seen[h] = 1; });
    return Object.keys(seen).length >= MASTER_NEED;
  }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dayNum() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); }
  function record(bookId, w, mode, ok) {
    var s = st(bookId, w);
    if (ok) {
      var h = today() + '|' + mode;
      if (s.hits.indexOf(h) < 0) s.hits.push(h);
      s.box = Math.min(s.box + 1, INTERVALS.length - 1);
    } else {
      s.wrong++; s.box = 0;
    }
    s.due = dayNum() + (ok ? INTERVALS[s.box] : 0);
    save();
  }

  // ---------------- 朗读 ----------------
  var synth = window.speechSynthesis, voice = null;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    voice = vs.filter(function (v) { return /en[-_]US/i.test(v.lang) && /Samantha|Google US|Aria|Jenny|Ava|Allison/i.test(v.name); })[0]
      || vs.filter(function (v) { return /en[-_]US/i.test(v.lang); })[0] || vs[0] || null;
  }
  if (synth) { pickVoice(); if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', pickVoice); else synth.onvoiceschanged = pickVoice; }
  function speechOK() { return !!(synth && window.SpeechSynthesisUtterance); }
  function speak(text, rate) {
    if (!speechOK()) { toast('这个浏览器不能朗读'); return; }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; if (voice) u.voice = voice;
      u.rate = rate || (db.slow ? 0.55 : 0.9);
      synth.speak(u);
    } catch (e) { toast('朗读失败'); }
  }
  function checkVoices() {
    var warn = $('#speechWarn');
    if (!speechOK()) { warn.classList.remove('hidden'); return; }
    setTimeout(function () { pickVoice(); if (!voice && synth.getVoices().length === 0) warn.classList.remove('hidden'); }, 1500);
  }

  // ---------------- 工具 ----------------
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.add('hidden'); }, 1800); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function h(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function bookMeta(id) { return S.books.filter(function (b) { return b.id === id; })[0]; }
  function loadBook(id) {
    if (S.bookCache[id]) return Promise.resolve(S.bookCache[id]);
    var m = bookMeta(id);
    if (!m) return Promise.reject(new Error('找不到教材 ' + id));
    return fetch(m.file, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(m.file + ' 读取失败'); return r.json(); })
      .then(function (b) { normalizeBook(b); S.bookCache[id] = b; return b; });
  }
  function normalizeBook(b) { // 让手工添加的、字段不全的单词也能用
    (b.units || []).forEach(function (u) {
      u.words = (u.words || []).filter(function (w) { return w && w.word; });
      u.words.forEach(function (w) {
        if (!w.syllables || !w.syllables.length) w.syllables = [w.word];
        if (!w.letters || !w.letters.length) w.letters = w.word.replace(/[^A-Za-z]/g, '').split('').map(function (c) { return [c, '']; });
        w.cn = w.cn || ''; w.pos = w.pos || ''; w.ipa = w.ipa || '';
        if (w.phonics && w.phonics.map(function (c) { return c.t; }).join('').toLowerCase() !== w.word.toLowerCase()) w.phonics = null; // 拼不回原词就不用
      });
    });
  }
  function allWords(b) { var a = []; b.units.forEach(function (u) { a = a.concat(u.words); }); return a; }
  function cleanWord(w) { return w.word.toLowerCase().replace(/[^a-z]/g, ''); }

  // ---------------- 导航 ----------------
  function go(view, opts) {
    S.history.push({ view: S.view, unitIdx: S.unitIdx, mode: S.mode, wordIdx: S.wordIdx });
    S.view = view; Object.assign(S, opts || {}); render();
  }
  function back() { var p = S.history.pop(); if (p) { Object.assign(S, p); } else S.view = 'home'; render(); }
  $('#backBtn').onclick = back;
  $('#slowBtn').onclick = function () { db.slow = !db.slow; save(); updateTop(); speak('slow', db.slow ? 0.55 : 0.9); toast(db.slow ? '已切换为慢速朗读' : '已切换为正常速度'); };
  $('#profileBtn').onclick = openProfiles;
  function updateTop() {
    $('#profileName').textContent = profile().name;
    $('#slowBtn').classList.toggle('on', !!db.slow);
    $('#backBtn').classList.toggle('hidden', S.view === 'home');
  }

  function render() {
    updateTop();
    if (speechOK()) synth.cancel();
    $('#title').textContent = '小学英语背单词';
    var bb = $('.bottombar'); if (bb) bb.remove();
    if (S.view === 'home') return renderHome();
    loadBook(S.bookId).then(function (b) {
      if (S.view === 'unit') renderUnit(b);
      else if (S.view === 'review') renderReviewAll(b);
      else if (S.view === 'favs') renderFavs(b);
    }).catch(showErr);
  }
  function showErr(e) {
    h('<div class="card empty"><p>😢 单词数据读取失败：' + esc(e.message) + '</p><p>如果你是直接双击 index.html 打开的，浏览器不允许读取数据文件。请按 README 里的步骤用 <b>python3 -m http.server</b> 打开，或部署到 GitHub Pages。</p></div>');
  }

  // ---------------- 首页 ----------------
  function renderHome() {
    var p = profile();
    if (!bookMeta(p.book)) p.book = S.books[0].id;
    var cur = bookMeta(p.book);
    S.bookId = cur.id;
    var grades = []; S.books.forEach(function (b) { if (grades.indexOf(b.grade) < 0) grades.push(b.grade); });
    var terms = S.books.filter(function (b) { return b.grade === cur.grade; });
    var html = '<div class="card"><div class="section-title">' + esc(p.name) + ' 的教材（自动记住）</div>' +
      '<div class="seg" id="gradeSeg">' + grades.map(function (g) { return '<button data-g="' + esc(g) + '" class="' + (g === cur.grade ? 'on' : '') + '">' + esc(g) + '</button>'; }).join('') + '</div>' +
      '<div class="seg" id="termSeg">' + terms.map(function (b) { return '<button data-b="' + esc(b.id) + '" class="' + (b.id === cur.id ? 'on' : '') + '">' + esc(b.term) + '</button>'; }).join('') + '</div>' +
      '<div class="edition">' + esc(cur.edition) + '</div></div><div id="homeBody" class="loading">加载中…</div>';
    h(html);
    app.querySelectorAll('#gradeSeg button').forEach(function (btn) {
      btn.onclick = function () {
        var g = btn.getAttribute('data-g');
        var same = S.books.filter(function (b) { return b.grade === g && b.term === cur.term; })[0] || S.books.filter(function (b) { return b.grade === g; })[0];
        p.book = same.id; save(); renderHome();
      };
    });
    app.querySelectorAll('#termSeg button').forEach(function (btn) { btn.onclick = function () { p.book = btn.getAttribute('data-b'); save(); renderHome(); }; });
    loadBook(cur.id).then(function (b) {
      var words = allWords(b), m = 0, fav = 0, due = 0, dn = dayNum();
      words.forEach(function (w) { var s = peek(b.id, w); if (isMastered(s)) m++; if (s && s.fav) fav++; if (!isMastered(s) && s && s.hits.length && s.due <= dn) due++; });
      var unl = words.length - m;
      var body = '<div class="card"><div class="stats">' +
        '<div class="stat"><b>' + m + '/' + words.length + '</b><span>已掌握</span></div>' +
        '<button class="stat clickable" id="goReview"><b>' + unl + '</b><span>未掌握 · 去复习 ›</span></button>' +
        '<button class="stat clickable" id="goFavs"><b>' + fav + '</b><span>收藏 ›</span></button></div></div>' +
        '<div class="section-title">选择单元</div><div class="units">' +
        b.units.map(function (u, i) {
          var um = u.words.filter(function (w) { return isMastered(peek(b.id, w)); }).length;
          var pct = u.words.length ? Math.round(um * 100 / u.words.length) : 0;
          return '<button class="unit" data-u="' + i + '"><div class="u-num">' + esc(u.unit) + '</div><div class="u-title">' + esc(u.title) + '</div>' +
            '<div class="u-words">' + u.words.map(function (w) { return esc(w.word); }).join(' · ') + '</div>' +
            '<div class="bar"><i style="width:' + pct + '%"></i></div><div class="u-prog">已掌握 ' + um + ' / ' + u.words.length + '</div></button>';
        }).join('') + '</div>';
      var hb = $('#homeBody'); hb.className = ''; hb.innerHTML = body;
      app.querySelectorAll('.unit').forEach(function (el) { el.onclick = function () { go('unit', { unitIdx: +el.getAttribute('data-u'), mode: 'study', wordIdx: 0 }); }; });
      $('#goReview').onclick = function () { go('review'); };
      $('#goFavs').onclick = function () { go('favs'); };
    }).catch(showErr);
  }

  // ---------------- 单元页 ----------------
  function renderUnit(b) {
    var u = b.units[S.unitIdx];
    $('#title').textContent = b.units[S.unitIdx].unit + ' ' + u.title;
    var tabs = '<div class="tabs">' + Object.keys(MODES).map(function (k) { return '<button data-m="' + k + '" class="' + (S.mode === k ? 'on' : '') + '">' + MODES[k] + '</button>'; }).join('') + '</div>';
    h(tabs + '<div id="modeBody"></div>');
    app.querySelectorAll('.tabs button').forEach(function (t) { t.onclick = function () { S.mode = t.getAttribute('data-m'); S.wordIdx = 0; render(); }; });
    var body = $('#modeBody');
    if (!u.words.length) { body.innerHTML = '<div class="card empty">这个单元还没有单词，可以在数据文件里添加。</div>'; return; }
    if (S.mode === 'study') renderStudy(b, u, body);
    else if (S.mode === 'spell') runQuiz(b, shuffle(u.words), body, ['spell']);
    else if (S.mode === 'listen') runQuiz(b, shuffle(u.words), body, ['listen'], u);
    else {
      var q = dueList(b, u.words);
      if (!q.length) { body.innerHTML = '<div class="card done-box"><div class="big">🎉</div><p>这个单元的单词都掌握啦！</p><button class="btn" id="again">再练一遍全部</button></div>'; $('#again').onclick = function () { runQuiz(b, shuffle(u.words), body, ['spell', 'listen'], u); }; return; }
      runQuiz(b, q, body, ['listen', 'spell'], u);
    }
  }
  function dueList(b, words) { // 未掌握的词：到期的优先，其次没练过的，再其次没到期的
    var dn = dayNum();
    var um = words.filter(function (w) { return !isMastered(peek(b.id, w)); });
    var due = um.filter(function (w) { var s = peek(b.id, w); return s && s.hits.length && s.due <= dn; });
    var fresh = um.filter(function (w) { var s = peek(b.id, w); return !s || !s.hits.length; });
    var later = um.filter(function (w) { return due.indexOf(w) < 0 && fresh.indexOf(w) < 0; });
    return shuffle(due).concat(shuffle(fresh), shuffle(later)).slice(0, 15);
  }

  // ----- 学习卡片（自然拼读） -----
  var TYPE_NAME = { cons: '辅音', blend: '辅音组合', digraph: '字母组合', vowel: '元音', team: '元音组合', r: 'r 控制元音', magic: 'magic e', silent: '不发音', suffix: '词尾' };
  function phonicsOf(w) {
    if (w.phonics && w.phonics.length) return w.phonics;
    return w.letters.map(function (l) { return { t: l[0], ipa: l[1], type: l[1] ? 'cons' : 'silent', note: l[1] ? (l[0] + ' 读 ' + l[1]) : (l[0] + ' 不发音'), tag: '' }; });
  }
  function chunkSay(c) {
    if (c.say !== undefined) return c.say;
    var p = PH[(c.ipa || '').replace(/\//g, '')];
    return p ? p[0] + ', as in ' + p[1] : '';
  }
  function renderStudy(b, u, body) {
    if (S.wordIdx >= u.words.length) S.wordIdx = 0;
    var w = u.words[S.wordIdx], s = peek(b.id, w), mastered = isMastered(s), ph = phonicsOf(w);
    var strip = '<div class="unit-head"><span class="badge">' + esc(u.unit) + '</span><span class="t">' + esc(u.title) + '</span></div><div class="wordstrip" id="strip">' +
      u.words.map(function (x, i) { return '<button data-i="' + i + '" class="' + (i === S.wordIdx ? 'on ' : '') + (isMastered(peek(b.id, x)) ? 'done' : '') + '">' + esc(x.word) + '</button>'; }).join('') + '</div>';
    var k = Math.min(1, 8.5 / (w.word.length + ph.length * 0.35)); // 长单词自动缩小，保证一行放得下
    var fs = 'font-size:calc(clamp(44px,14vw,84px) * ' + k.toFixed(2) + ');';
    var big = ph.map(function (c, i) {
      return '<button class="pc t-' + esc(c.type) + (c.link ? ' link' : '') + (c.ex ? ' ex' : '') + '" data-c="' + i + '" style="' + fs + '">' + esc(c.t) + '</button>';
    }).join('');
    var tiles = ph.map(function (c, i) {
      return '<button class="ptile t-' + esc(c.type) + (c.link ? ' link' : '') + (c.ex ? ' ex' : '') + '" data-c="' + i + '"><span class="l">' + esc(c.t) + '</span>' +
        '<span class="p">' + (c.ipa ? esc(c.ipa) : '不发音') + '</span><span class="g">' + esc(c.tag || TYPE_NAME[c.type] || '') + '</span></button>';
    }).join('');
    var syl = w.syllables.length > 1 ? '<div class="syl">音节：' + w.syllables.map(function (x, i) { return '<button data-s="' + i + '">' + esc(x) + '</button>'; }).join('<i>·</i>') + '</div>' : '';
    var hasMagic = ph.some(function (c) { return c.type === 'magic'; });
    var legend = '<div class="legend"><span class="lg t-cons">辅音</span><span class="lg t-vowel">元音</span><span class="lg t-team">元音组合 / r 控制</span>' +
      (hasMagic ? '<span class="lg t-magic">magic e</span>' : '') + '<span class="lg t-silent">不发音</span><span class="lg ex">⚠ 例外</span></div>';
    body.innerHTML = strip + '<div class="card wordcard">' +
      '<div class="pchunks" id="pchunks">' + big + '</div>' +
      '<div class="ipa-row"><span>' + esc(w.ipa) + '</span><button class="spk" id="spkWord" aria-label="朗读">🔊</button><button class="blendbtn" id="blendBtn">🔤 拼读</button></div>' + syl +
      '<div class="meaning"><span class="pos">' + esc(w.pos) + '</span>' + esc(w.cn) + '</div>' +
      '<div class="rule" id="rule"><div class="rule-hint">👆 点上面的彩色字母块，听发音、看拼读规则</div></div>' +
      '<div class="ptiles" id="ptiles">' + tiles + '</div>' + legend +
      (w.example ? '<div class="example"><div><div class="en">' + esc(w.example) + '</div><div class="zh">' + esc(w.exampleCn || '') + '</div></div><button class="spk" id="spkEx" aria-label="朗读例句">🔊</button></div>' : '') +
      '</div><div class="qprog" style="text-align:center">' + (S.wordIdx + 1) + ' / ' + u.words.length + (s && s.hits.length && !mastered ? ' · 已答对 ' + Math.min(uniq(s.hits), MASTER_NEED) + '/' + MASTER_NEED + ' 次' : '') + '</div>';
    var bar = document.createElement('div'); bar.className = 'bottombar';
    bar.innerHTML = '<div class="in"><button id="prev">‹ 上一个</button><button id="fav" class="' + (s && s.fav ? 'on' : '') + '">' + (s && s.fav ? '★ 已收藏' : '☆ 收藏') + '</button>' +
      '<button id="mst" class="' + (mastered ? 'mastered' : '') + '">' + (mastered ? '✓ 已掌握' : '○ 已掌握') + '</button><button id="next" class="primary">下一个 ›</button></div>';
    document.body.appendChild(bar);
    var sb = $('#strip .on'); if (sb) sb.scrollIntoView({ inline: 'center', block: 'nearest' });
    app.querySelectorAll('#strip button').forEach(function (x) { x.onclick = function () { S.wordIdx = +x.getAttribute('data-i'); render(); }; });

    function highlight(i) {
      app.querySelectorAll('.pc, .ptile').forEach(function (el) { el.classList.toggle('hl', i === 'all' || +el.getAttribute('data-c') === i); });
    }
    function showRule(i) {
      var c = ph[i];
      $('#rule').innerHTML = '<div class="rule-head"><span class="rule-l t-' + esc(c.type) + '">' + esc(c.t) + '</span><span class="rule-ipa">' + (c.ipa ? esc(c.ipa) : '不发音') + '</span>' +
        '<span class="rule-tag' + (c.ex ? ' ex' : '') + '">' + (c.ex ? '⚠ 例外' : esc(c.tag || TYPE_NAME[c.type] || '')) + '</span></div><div class="rule-note">' + esc(c.note || '') + '</div>';
      $('#rule').classList.toggle('ex', !!c.ex);
    }
    function tapChunk(i) {
      highlight(i); showRule(i);
      var c = ph[i], say = chunkSay(c);
      if (!c.ipa || !say) { if (speechOK()) synth.cancel(); return; }
      speak(say, db.slow ? 0.5 : 0.7);
    }
    app.querySelectorAll('.pc, .ptile').forEach(function (el) { el.onclick = function () { tapChunk(+el.getAttribute('data-c')); }; });
    function blend() { // 一块一块读，最后读整个单词
      if (!speechOK()) { toast('这个浏览器不能朗读'); return; }
      synth.cancel();
      var parts = [];
      ph.forEach(function (c, i) { var say = chunkSay(c); if (c.ipa && say) parts.push({ i: i, text: say.split(',')[0] }); });
      parts.push({ i: 'all', text: w.word });
      parts.forEach(function (p, n) {
        var ut = new SpeechSynthesisUtterance(p.text);
        ut.lang = 'en-US'; if (voice) ut.voice = voice;
        ut.rate = p.i === 'all' ? (db.slow ? 0.55 : 0.85) : (db.slow ? 0.45 : 0.6);
        ut.onstart = function () { highlight(p.i); if (p.i !== 'all') showRule(p.i); };
        synth.speak(ut);
      });
    }
    $('#blendBtn').onclick = blend;
    $('#spkWord').onclick = function () { highlight('all'); speak(w.word); };
    app.querySelectorAll('.syl button').forEach(function (x) { x.onclick = function () { var i = +x.getAttribute('data-s'); speak((w.say && w.say[i]) || w.syllables[i], db.slow ? 0.5 : 0.7); }; });
    if ($('#spkEx')) $('#spkEx').onclick = function () { speak(w.example); };
    $('#prev').onclick = function () { S.wordIdx = (S.wordIdx - 1 + u.words.length) % u.words.length; render(); };
    $('#next').onclick = function () { S.wordIdx = (S.wordIdx + 1) % u.words.length; render(); };
    $('#fav').onclick = function () { var x = st(b.id, w); x.fav = !x.fav; save(); toast(x.fav ? '已收藏' : '已取消收藏'); render(); };
    $('#mst').onclick = function () { var x = st(b.id, w); if (isMastered(x)) { x.manual = false; x.hits = []; x.box = 0; toast('已改回“未掌握”'); } else { x.manual = true; toast('已标为掌握 ✓'); } save(); render(); };
    setTimeout(function () { speak(w.word); }, 250);
  }
  function uniq(a) { var o = {}; a.forEach(function (x) { o[x] = 1; }); return Object.keys(o).length; }

  // ----- 练习（拼写 / 听选 / 复习混合） -----
  function runQuiz(b, words, body, kinds, unit) {
    var i = 0, right = 0, wrongList = [];
    var pool = unit && unit.words.length >= 4 ? unit.words : allWords(b);
    function next() {
      if (i >= words.length) return finish();
      var w = words[i], kind = kinds[i % kinds.length];
      if (kind === 'listen' && pool.length < 4) kind = 'spell';
      (kind === 'spell' ? askSpell : askListen)(w, function (ok) {
        record(b.id, w, kind, ok);
        if (ok) right++; else wrongList.push(w);
        i++;
      }, next);
    }
    function header(w) { return '<div class="qprog">第 ' + (i + 1) + ' / ' + words.length + ' 题</div>'; }
    function askSpell(w, mark, cont) {
      var target = cleanWord(w);
      var letters = shuffle(target.split(''));
      for (var tries = 0; tries < 10 && target.length > 1 && letters.join('') === target; tries++) letters = shuffle(target.split(''));
      var typed = [], done = false;
      body.innerHTML = '<div class="card quiz">' + header(w) + '<button class="big-spk" id="play">🔊</button>' +
        '<div class="hint">听一听，拼出这个单词：<b>' + esc(w.cn) + '</b></div>' +
        '<div class="slots" id="slots"></div><div class="keys" id="keys"></div>' +
        '<div class="keys"><button class="key wide" id="undo">⌫ 退格</button><button class="key wide" id="clr">清空</button><button class="key wide" id="tip">💡 提示</button></div>' +
        '<input class="typebox" id="typebox" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="也可以用键盘打字">' +
        '<div class="feedback" id="fb"></div><div id="after"></div></div>';
      var keys = $('#keys');
      keys.innerHTML = letters.map(function (c, k) { return '<button class="key" data-k="' + k + '">' + c + '</button>'; }).join('');
      function draw() {
        $('#slots').innerHTML = target.split('').map(function (c, k) { return '<div class="slot' + (typed[k] ? ' filled' : '') + '">' + (typed[k] ? typed[k].c : '') + '</div>'; }).join('');
        keys.querySelectorAll('.key').forEach(function (kb) { var k = +kb.getAttribute('data-k'); kb.classList.toggle('used', typed.some(function (t) { return t.k === k; })); });
        if (typed.length === target.length) check();
      }
      function add(c, k) { if (done || typed.length >= target.length) return; typed.push({ c: c, k: k }); $('#typebox').value = typed.map(function (t) { return t.c; }).join(''); draw(); }
      function check() {
        done = true;
        var ans = typed.map(function (t) { return t.c; }).join(''), ok = ans === target;
        $('#slots').querySelectorAll('.slot').forEach(function (sl, k) { sl.classList.add(ans[k] === target[k] ? 'ok' : 'bad'); });
        var fb = $('#fb'); fb.className = 'feedback ' + (ok ? 'ok' : 'bad'); fb.textContent = ok ? '太棒了！拼对了 👍' : '不对哦，正确答案是：';
        $('#after').innerHTML = (ok ? '' : '<div class="answer">' + esc(w.word) + '</div>') + '<button class="btn" id="nx">下一题 ›</button>';
        speak(w.word); mark(ok); $('#nx').onclick = cont;
      }
      keys.querySelectorAll('.key').forEach(function (kb) { kb.onclick = function () { add(kb.textContent, +kb.getAttribute('data-k')); }; });
      $('#undo').onclick = function () { if (!done) { typed.pop(); $('#typebox').value = typed.map(function (t) { return t.c; }).join(''); draw(); } };
      $('#clr').onclick = function () { if (!done) { typed = []; $('#typebox').value = ''; draw(); } };
      $('#tip').onclick = function () { if (done) return; var n = typed.length; var c = target[n]; var k = -1; letters.forEach(function (x, idx) { if (k < 0 && x === c && !typed.some(function (t) { return t.k === idx; })) k = idx; }); if (k >= 0 && typed.every(function (t, j) { return t.c === target[j]; })) add(c, k); else toast('先退格到正确的位置再用提示'); };
      $('#typebox').oninput = function (e) {
        if (done) return;
        var v = e.target.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, target.length); typed = [];
        var used = {};
        v.split('').forEach(function (c) { var k = -1; letters.forEach(function (x, idx) { if (k < 0 && x === c && !used[idx]) k = idx; }); if (k >= 0) used[k] = 1; typed.push({ c: c, k: k }); });
        e.target.value = v; draw();
      };
      $('#play').onclick = function () { speak(w.word); };
      draw(); setTimeout(function () { speak(w.word); }, 300);
    }
    function askListen(w, mark, cont) {
      var others = shuffle(pool.filter(function (x) { return x.cn !== w.cn && x.word !== w.word; })).slice(0, 3);
      var opts = shuffle(others.concat([w]));
      body.innerHTML = '<div class="card quiz">' + header(w) + '<button class="big-spk" id="play">🔊</button><div class="hint">听一听，选出正确的意思</div>' +
        '<div class="options">' + opts.map(function (o, k) { return '<button class="opt" data-k="' + k + '">' + esc(o.cn) + '</button>'; }).join('') + '</div>' +
        '<div class="feedback" id="fb"></div><div id="after"></div></div>';
      var done = false;
      app.querySelectorAll('.opt').forEach(function (el) {
        el.onclick = function () {
          if (done) return; done = true;
          var o = opts[+el.getAttribute('data-k')], ok = o === w;
          el.classList.add(ok ? 'ok' : 'bad');
          if (!ok) app.querySelectorAll('.opt')[opts.indexOf(w)].classList.add('ok');
          var fb = $('#fb'); fb.className = 'feedback ' + (ok ? 'ok' : 'bad'); fb.textContent = ok ? '答对了！🎉' : '再记一记哦';
          $('#after').innerHTML = '<div class="answer">' + esc(w.word) + ' <span style="font-size:18px;color:#7a8a88">' + esc(w.ipa) + '</span></div><button class="btn" id="nx">下一题 ›</button>';
          speak(w.word); mark(ok); $('#nx').onclick = cont;
        };
      });
      $('#play').onclick = function () { speak(w.word); };
      setTimeout(function () { speak(w.word); }, 300);
    }
    function finish() {
      body.innerHTML = '<div class="card done-box"><div class="big">' + (right === words.length ? '🏆' : '⭐') + '</div><h2>完成啦！答对 ' + right + ' / ' + words.length + '</h2>' +
        (wrongList.length ? '<p>要再练一练：' + wrongList.map(function (w) { return '<b>' + esc(w.word) + '</b>'; }).join('、') + '</p>' : '<p>全部答对，真厉害！</p>') +
        '<p style="color:#7a8a88;font-size:14px">一个单词在不同的天或不同的练习里答对 3 次，就算“已掌握”。</p>' +
        (wrongList.length ? '<button class="btn" id="redo">再练错的</button>' : '') + '<button class="btn ghost" id="home">回首页</button></div>';
      if ($('#redo')) $('#redo').onclick = function () { runQuiz(b, shuffle(wrongList), body, kinds, unit); };
      $('#home').onclick = function () { S.history = []; S.view = 'home'; render(); };
    }
    next();
  }

  // ---------------- 整册复习 / 收藏 ----------------
  function renderReviewAll(b) {
    $('#title').textContent = '复习 · ' + bookMeta(b.id).grade + bookMeta(b.id).term;
    h('<div id="modeBody"></div>');
    var q = dueList(b, allWords(b));
    if (!q.length) { $('#modeBody').innerHTML = '<div class="card done-box"><div class="big">🎉</div><p>这一册的单词全部掌握了！</p></div>'; return; }
    runQuiz(b, q, $('#modeBody'), ['listen', 'spell']);
  }
  function renderFavs(b) {
    $('#title').textContent = '我的收藏';
    var list = [];
    b.units.forEach(function (u, ui) { u.words.forEach(function (w, wi) { var s = peek(b.id, w); if (s && s.fav) list.push({ w: w, ui: ui, wi: wi, u: u }); }); });
    if (!list.length) { h('<div class="card empty">还没有收藏的单词。在学习卡片下面点“☆ 收藏”就能加进来。</div>'); return; }
    h('<div class="card"><div class="units">' + list.map(function (x, k) {
      return '<button class="unit" data-k="' + k + '"><div class="u-num">' + esc(x.u.unit) + '</div><div class="u-title">' + esc(x.w.word) + '</div><div class="u-words">' + esc(x.w.pos + ' ' + x.w.cn) + '</div></button>';
    }).join('') + '</div></div>');
    app.querySelectorAll('.unit').forEach(function (el) { el.onclick = function () { var x = list[+el.getAttribute('data-k')]; go('unit', { unitIdx: x.ui, wordIdx: x.wi, mode: 'study' }); }; });
  }

  // ---------------- 孩子切换 / 改名 ----------------
  function openProfiles() {
    var m = $('#modal'), box = $('#modalBox');
    function draw(editId) {
      box.innerHTML = '<h2>谁在学习？</h2>' + db.profiles.map(function (p) {
        var bm = bookMeta(p.book);
        if (editId === p.id) return '<div class="prow on"><input id="nameIn" value="' + esc(p.name) + '" maxlength="8"><button class="small-btn" id="saveName">保存</button></div>';
        return '<div class="prow ' + (p.id === db.current ? 'on' : '') + '"><button class="nm" data-pick="' + p.id + '">' + (p.id === db.current ? '✓ ' : '') + esc(p.name) +
          '<div class="sub">' + (bm ? esc(bm.grade + bm.term) : '') + '</div></button><button class="small-btn" data-edit="' + p.id + '">改名</button></div>';
      }).join('') + '<p style="font-size:13px;color:#7a8a88">每个孩子的进度、收藏和默认教材分开保存，只存在这台设备的浏览器里。</p><button class="btn ghost" id="closeM" style="width:100%">关闭</button>';
      box.querySelectorAll('[data-pick]').forEach(function (b) { b.onclick = function () { db.current = b.getAttribute('data-pick'); save(); m.classList.add('hidden'); S.history = []; S.view = 'home'; render(); toast('现在是 ' + profile().name + ' 在学习'); }; });
      box.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { draw(b.getAttribute('data-edit')); var i = $('#nameIn'); i.focus(); i.select(); }; });
      if ($('#saveName')) $('#saveName').onclick = function () { var v = $('#nameIn').value.trim(); if (v) { db.profiles.filter(function (p) { return p.id === editId; })[0].name = v; save(); updateTop(); } draw(); };
      $('#closeM').onclick = function () { m.classList.add('hidden'); if (S.view === 'home') render(); };
    }
    draw(); m.classList.remove('hidden');
    m.onclick = function (e) { if (e.target === m) m.classList.add('hidden'); };
  }

  // ---------------- 启动 ----------------
  fetch('data/books.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('data/books.json 读取失败'); return r.json(); })
    .then(function (d) { S.books = d.books || []; if (!S.books.length) throw new Error('books.json 里没有教材'); render(); })
    .catch(function (e) { updateTop(); showErr(e); });
  checkVoices();
  window.__app = { S: S, db: function () { return db; } }; // 方便调试
})();
