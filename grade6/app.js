const $=s=>document.querySelector(s),app=$("#app");
const S=JSON.parse(localStorage.getItem("mz6")||'{"stars":0,"wrong":[]}');
function save(){localStorage.setItem("mz6",JSON.stringify(S));$("#stars").textContent=S.stars}
function star(n=1){S.stars+=n;save()}
function wrong(type,q,a){if(!S.wrong.some(w=>w.q===q))S.wrong.push({type,q,a});save()}
function right(q){S.wrong=S.wrong.filter(w=>w.q!==q);save()}
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="en-US";u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const pick=(a,n)=>shuf(a).slice(0,n);
const back='<button onclick="home()">← 返回</button>';
function home(){app.innerHTML=`<div class="grid">
<div class="card mod" onclick="flash()">📇 过去式闯关<small>记单词+拼写</small></div>
<div class="card mod" onclick="qa()">💬 问答配对<small>How/What/Did/Where</small></div>
<div class="card mod" onclick="listen()">🎧 听音选词<small>听过去式</small></div>
<div class="card mod" onclick="cloze()">📝 短文填空<small>选词填空</small></div>
<div class="card mod" onclick="order()">🧩 造句练习<small>连词成句</small></div>
<div class="card mod" onclick="book()">📕 错题本<small>${S.wrong.length} 题待复习</small></div></div>
<div class="card muted">每答对一题得 1 颗星⭐。错题会自动进错题本，再做对就自动移出。<br>写作小贴士：写景点时用 because（因为）、and（和）、but（但是）把句子连起来，每句开头大写、结尾加句号。</div>`}
let fi=0,fl;
function flash(){fl=shuf(VERBS);fi=0;card()}
function card(){const v=fl[fi%fl.length];app.innerHTML=`${back}<div class="card"><div class="muted">第 ${fi+1} 个 · 点 🔊 听发音</div>
<div class="big">${v[0]} <button onclick="say('${v[0]}')">🔊</button></div><div style="text-align:center">${v[2]}</div>
<p>写出过去式：</p><input id="in" type="text" inputmode="latin" lang="en" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"><div class="fb" id="fb"></div>
<button class="main" onclick="chk()">检查</button><button onclick="fi++;card()">下一个</button></div>`;const I=$("#in");I.focus();let comp=false;I.addEventListener("compositionstart",()=>comp=true);I.addEventListener("compositionend",()=>setTimeout(()=>comp=false,0));I.onkeydown=e=>{if(e.key=="Enter"&&!comp&&!e.isComposing&&e.keyCode!==229)chk()}}
const half=t=>t.replace(/[\uFF01-\uFF5E]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/\u3000/g," ");
function chk(){const v=fl[fi%fl.length],a=half($("#in").value).replace(/\s+/g," ").trim().toLowerCase(),q=`${v[0]} 的过去式`;
if(a===v[1]||(v[1]==="learned"&&a==="learnt")){$("#fb").innerHTML="✅ 对了！"+v[0]+" → "+v[1];star();right(q)}else{$("#fb").innerHTML="❌ 正确是 <b>"+v[1]+"</b>";wrong("过去式",q,v[1])}say(v[1])}
function qa(){const q=pick(QA,1)[0],opts=shuf([q[1],...pick(QA.filter(x=>x!==q),3).map(x=>x[1])]);
app.innerHTML=`${back}<div class="card"><p>选出正确的回答：</p><div class="big" style="font-size:22px">${q[0]} <button onclick="say(\`${q[0]}\`)">🔊</button></div>
${opts.map(o=>`<button style="display:block;width:100%;text-align:left" onclick="ans(this,${o===q[1]})">${o}</button>`).join("")}<div class="fb" id="fb"></div><button class="main" onclick="qa()">下一题</button></div>`;window.cur=q}
function ans(b,ok){const q=window.cur;b.className=ok?"ok":"bad";$("#fb").textContent=ok?"✅ 对了！":"❌ 正确答案："+q[1];ok?(star(),right(q[0])):wrong("问答",q[0],q[1]);say(q[1])}
function listen(){const w=pick(LISTEN,1)[0],opts=shuf([w,...pick(LISTEN.filter(x=>x!==w),3)]);window.cur=w;
app.innerHTML=`${back}<div class="card"><p>听一听，选出你听到的单词：</p><div class="big"><button class="main" onclick="say('${w}')">🔊 再听一遍</button></div>
<div class="row">${opts.map(o=>`<button onclick="lans(this,'${o}')">${o}</button>`).join("")}</div><div class="fb" id="fb"></div><button class="main" onclick="listen()">下一题</button></div>`;setTimeout(()=>say(w),300)}
function lans(b,o){const w=window.cur,ok=o===w;b.className=ok?"ok":"bad";$("#fb").textContent=ok?"✅ 对了！":"❌ 听到的是 "+w;ok?(star(),right("听音："+w)):wrong("听音","听音："+w,w)}
let pi=0;
function cloze(){const p=PASSAGES[pi%PASSAGES.length];let n=0;
const html=p.text.replace(/\{(\w+)\}/g,(m,w)=>`<select data-a="${w}"><option value="">___</option>${p.words.map(x=>`<option>${x}</option>`).join("")}</select>`);
app.innerHTML=`${back}<div class="card"><p>从方框中选词填空（每词用一次）：<br><b>${p.words.join(" / ")}</b></p><div class="passage">${html}</div>
<div class="fb" id="fb"></div><button class="main" onclick="cchk()">检查</button><button onclick="say(PASSAGES[pi%PASSAGES.length].text.replace(/[{}]/g,''))">🔊 朗读</button><button onclick="pi++;cloze()">换一篇</button></div>`}
function cchk(){let c=0,t=0;document.querySelectorAll(".passage select").forEach(s=>{t++;const ok=s.value===s.dataset.a;s.style.background=ok?"#c8f5da":"#ffd0d0";if(ok)c++;else wrong("短文填空","短文填空："+s.dataset.a+"（"+(s.parentNode.textContent.slice(0,30))+"…）",s.dataset.a)});
$("#fb").textContent=`对了 ${c}/${t}`+(c===t?" 🎉 太棒了！":"，红色的再想想");if(c===t)star(2)}
function order(){const s=pick(SENTS,1)[0];window.cur=s;window.built=[];const ws=s.split(" ");
app.innerHTML=`${back}<div class="card"><p>点单词，连成正确的句子：</p><div class="slot row" id="slot"></div><div class="row" id="pool">${shuf(ws.map((w,i)=>[w,i])).map(([w,i])=>`<button data-i="${i}" onclick="put(this)">${w}</button>`).join("")}</div>
<div class="fb" id="fb"></div><button class="main" onclick="ochk()">检查</button><button onclick="order()">下一题</button><button onclick="order2()">重来</button></div>`}
function order2(){const s=window.cur;order();window.cur=s}
function put(b){$("#slot").appendChild(b);b.onclick=()=>{$("#pool").appendChild(b);b.onclick=()=>put(b)}}
function ochk(){const a=[...$("#slot").children].map(b=>b.textContent).join(" "),s=window.cur,ok=a===s;
$("#fb").textContent=ok?"✅ 对了！":"❌ 正确："+s;ok?(star(),right(s)):wrong("造句",s,s);say(s)}
function book(){app.innerHTML=`${back}<div class="card"><h3>📕 错题本（${S.wrong.length}）</h3>${S.wrong.length?S.wrong.map((w,i)=>`<p>【${w.type}】${w.q}<br>👉 <b>${w.a}</b> <button onclick="say(\`${w.a.replace(/`/g,"")}\`)">🔊</button> <button onclick="S.wrong.splice(${i},1);save();book()">已掌握</button></p>`).join(""):"<p>没有错题，真棒！</p>"}</div>`}
save();home();
