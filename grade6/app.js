const $=s=>document.querySelector(s),app=$("#app");
const S=JSON.parse(localStorage.getItem("mz6")||'{"stars":0,"wrong":[]}');
function save(){localStorage.setItem("mz6",JSON.stringify(S));$("#stars").textContent=S.stars}
function star(n=1){S.stars+=n;save()}
// 单元：1 = 原来的暑假内容 + 第 1 单元。旧错题（mz6）不带单元，照常显示。
let U=1;const PRE=()=>U==1?"":"["+(U==="all"?"全部":"Unit "+U)+"] ";
function wrong(type,q,a){q=PRE()+q;if(!S.wrong.some(w=>w.q===q))S.wrong.push({type,q,a});save()}
function right(q){q=PRE()+q;S.wrong=S.wrong.filter(w=>w.q!==q);save()}
const U1={QA,LISTEN,PASSAGES,SENTS},UK=[1,2,3,4,5,6];let WL=[];
const ALLQA=[...QA,...UK.flatMap(k=>UNITS6[k].qa.filter(x=>!QA.some(y=>y[0]===x[0])))];
function setUnit(u){U=u;S.u=u;const us=u==="all"?UK:[u];WL=us.flatMap(k=>UNITS6[k].words.map(x=>[...x,k]));
const one=WL.filter(x=>/^[a-z]+$/.test(x[0])).map(x=>x[0]);
if(u==1){({QA,LISTEN,PASSAGES,SENTS}=U1);QA=[...U1.QA,...UNITS6[1].qa.filter(x=>!U1.QA.some(y=>y[0]===x[0]))];LISTEN=[...U1.LISTEN,...one.filter(w=>!U1.LISTEN.includes(w))];SENTS=[...U1.SENTS,...UNITS6[1].sents.filter(s=>!U1.SENTS.includes(s))]}
else if(u==="all"){QA=ALLQA;LISTEN=[...new Set([...U1.LISTEN,...one])];PASSAGES=U1.PASSAGES;SENTS=[...new Set([...U1.SENTS,...UK.flatMap(k=>UNITS6[k].sents)])]}
else{QA=UNITS6[u].qa;LISTEN=[...new Set(one)];PASSAGES=[];SENTS=UNITS6[u].sents}save()}
function unitBar(){return `<div class="row units">${[...UK,"all"].map(k=>`<button class="ub${k==U?" main":""}" onclick="setUnit(${k==="all"?"'all'":k});home()">${k==="all"?"🔀 全部":"U"+k}</button>`).join("")}</div>
<div class="card muted">📘 现在练：<b>${U==="all"?"全部单元（混合）":"Unit "+U+" "+UNITS6[U].t+" · "+UNITS6[U].cn}</b></div>`}
/* 单词卡 + 单词拼写 */
function words(){app.innerHTML=`${back}<div class="card"><p>点单词听发音：</p>${WL.map(x=>`<button class="wd" onclick="say(this.dataset.w)" data-w="${x[0].replace(/"/g,"")}"><b>${x[0]}</b><br><small>${x[1]}</small></button>`).join("")}</div>`}
let sp=[],si=0;
function spell(){sp=shuf(WL.filter(x=>/^[a-z ]+$/.test(x[0])));si=0;scard()}
function scard(){const v=sp[si%sp.length];window.cur=v;app.innerHTML=`${back}<div class="card"><div class="muted">第 ${si+1} 个 · 看中文写英文（词组中间用空格键）</div>
<div class="big" style="font-size:24px">${v[1]} <button onclick="say(window.cur[0])">🔊</button></div><input id="in" type="text" readonly inputmode="none" autocomplete="off" autocapitalize="none" spellcheck="false">
<div class="fb" id="fb"></div><div id="kb">${["qwertyuiop","asdfghjkl","zxcvbnm"].map(r=>`<div class="kr">${[...r].map(c=>`<button class="k" data-k="${c}">${c}</button>`).join("")}</div>`).join("")}
<div class="kr"><button class="k w" data-k=" ">空格</button><button class="k w" data-k="del">⌫ 删除</button><button class="k w" data-k="clr">清空</button><button class="k w main" data-k="ok">提交</button></div></div>
<button onclick="si++;scard()">下一个</button></div>`;const I=$("#in");
$("#kb").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k;if(k==="del")I.value=I.value.slice(0,-1);else if(k==="clr")I.value="";else if(k==="ok")schk();else I.value+=k})}
function schk(){const v=window.cur,a=$("#in").value.replace(/\s+/g," ").trim().toLowerCase(),q="拼写："+v[1];
if(a===v[0]){if(v.miss)$("#fb").innerHTML="✅ 改对了！"+v[0]+" 等一下还会再考一次";else{$("#fb").innerHTML="✅ 对了！"+v[0];star();right(q)}}else{$("#fb").innerHTML="❌ 正确是 <b>"+v[0]+"</b>，用 ⌫ 删除 或 清空 改一改再提交";if(!v.miss){v.miss=1;wrong("拼写",q,v[0]);sp.splice(si+3,0,v.slice(0,3))}}say(v[0])}
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="en-US";u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const pick=(a,n)=>shuf(a).slice(0,n);
const back='<button onclick="home()">← 返回</button>';
function home(){app.innerHTML=`${unitBar()}<div class="grid">
<div class="card mod" onclick="words()">🗂️ 单元单词卡<small>点一点听发音</small></div>
<div class="card mod" onclick="spell()">✏️ 单词拼写<small>看中文写英文</small></div>
<div class="card mod" onclick="flash()">📇 过去式闯关<small>记单词+拼写</small></div>
${QA.length?`<div class="card mod" onclick="qa()">💬 问答配对<small>How/What/Did/Where</small></div>`:""}
<div class="card mod" onclick="listen()">🎧 听音选词<small>听单词，选出来</small></div>
${PASSAGES.length?`<div class="card mod" onclick="cloze()">📝 短文填空<small>选词填空</small></div>`:""}
<div class="card mod" onclick="order()">🧩 造句练习<small>连词成句</small></div>
<div class="card mod" onclick="book()">📕 错题本<small>${S.wrong.length} 题待复习</small></div></div>
<div class="card muted">每答对一题得 1 颗星⭐。错题会自动进错题本，再做对就自动移出。<br>写作小贴士：写景点时用 because（因为）、and（和）、but（但是）把句子连起来，每句开头大写、结尾加句号。</div>`}
let fi=0,fl;
function flash(){fl=shuf(VERBS);fi=0;card()}
let useNative=false;
function card(){const v=fl[fi%fl.length];app.innerHTML=`${back}<div class="card"><div class="muted">第 ${fi+1} 个 · 点 🔊 听发音</div>
<div class="big">${v[0]} <button onclick="say('${v[0]}')">🔊</button></div><div style="text-align:center">${v[2]}</div>
<p>写出过去式：</p><input id="in" type="text" lang="en" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ${useNative?'inputmode="latin"':'readonly inputmode="none"'}>
<div class="fb" id="fb"></div>
<div id="kb">${["qwertyuiop","asdfghjkl","zxcvbnm"].map(r=>`<div class="kr">${[...r].map(c=>`<button class="k" data-k="${c}">${c}</button>`).join("")}</div>`).join("")}
<div class="kr"><button class="k w" data-k="del">⌫ 删除</button><button class="k w" data-k="clr">清空</button><button class="k w main" data-k="ok">提交</button></div></div>
<button onclick="fi++;card()">下一个</button><button onclick="useNative=!useNative;card()">${useNative?"用屏幕键盘":"用手机键盘"}</button></div>`;
const I=$("#in");$("#kb").style.display=useNative?"none":"";
$("#kb").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k;
if(k==="del")I.value=I.value.slice(0,-1);else if(k==="clr")I.value="";else if(k==="ok")chk();else I.value+=k});
if(useNative){I.focus();I.addEventListener("keyup",e=>{if(e.key==="Enter"&&!e.isComposing)chk()})}}
const half=t=>t.replace(/[\uFF01-\uFF5E]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/\u3000/g," ");
function chk(){const v=fl[fi%fl.length];if(v.miss===undefined)v.miss=0;const a=half($("#in").value).replace(/\s+/g," ").trim().toLowerCase(),q=`${v[0]} 的过去式`;
if(a===v[1]||(v[1]==="learned"&&a==="learnt")){if(v.miss)$("#fb").innerHTML="✅ 改对了！"+v[0]+" → "+v[1]+" 等一下还会再考一次";else{$("#fb").innerHTML="✅ 对了！"+v[0]+" → "+v[1];star();right(q)}}else{$("#fb").innerHTML="❌ 正确是 <b>"+v[1]+"</b>，用 ⌫ 删除 或 清空 改一改再提交";if(!v.miss){v.miss=1;wrong("过去式",q,v[1]);fl.splice(fi%fl.length+3,0,v.slice(0,3))}}say(v[1])}
// 问答：看/听回答，选出对应的问题（优先用本单元当干扰项；同一回答的问题不当干扰）
function qa(){const q=pick(QA,1)[0],ok=x=>x[1]!==q[1]&&x[0]!==q[0],loc=[...new Set(QA.filter(ok).map(x=>x[0]))],glb=[...new Set(ALLQA.filter(ok).map(x=>x[0]).filter(x=>!loc.includes(x)))],opts=shuf([q[0],...pick([...loc,...glb],3)]);window.cur=q;window.qdone=0;
app.innerHTML=`${back}<div class="card"><p>这是回答，选出正确的<b>问题</b>：</p><div class="big" style="font-size:22px">${q[1]} <button onclick="say(window.cur[1])">🔊</button></div>
${opts.map(o=>`<button class="qo" style="display:block;width:100%;text-align:left" onclick="ans(this,${o===q[0]})">${o}</button>`).join("")}<div class="fb" id="fb"></div><button class="main" onclick="qa()">下一题</button></div>`;setTimeout(()=>say(q[1]),300)}
function ans(b,ok){const q=window.cur;if(window.qdone)return;window.qdone=1;b.className=ok?"ok":"bad";$("#fb").textContent=ok?"✅ 对了！":"❌ 正确的问题："+q[0];const id="选问题："+q[1];ok?(star(),right(id)):wrong("问答",id,q[0]);say(q[0])}
function listen(){const w=pick(LISTEN,1)[0],opts=shuf([w,...pick(LISTEN.filter(x=>x!==w),3)]);window.cur=w;
app.innerHTML=`${back}<div class="card"><p>听一听，选出你听到的单词：</p><div class="big"><button class="main" onclick="say(window.cur)">🔊 再听一遍</button></div>
<div class="row">${opts.map(o=>`<button onclick="lans(this,'${o}')">${o}</button>`).join("")}</div><div class="fb" id="fb"></div><button class="main" onclick="listen()">下一题</button></div>`;setTimeout(()=>say(w),300)}
function lans(b,o){const w=window.cur,ok=o===w;b.className=ok?"ok":"bad";$("#fb").textContent=ok?"✅ 对了！":"❌ 听到的是 "+w;ok?(star(),right("听音："+w)):wrong("听音","听音："+w,w)}
let pi=0,CQ=[],cb=null;// CQ：做错的短文，过一篇再考一次
function cloze(){const p=PASSAGES[pi%PASSAGES.length];
app.innerHTML=`${back}<div class="card"><p>读短文，<b>自己写</b>出空里的单词（先点一个空，再用下面的键盘写）：<br><span class="muted">写错了会给提示</span></p><div class="passage">${p.text.replace(/\{(\w+)\}/g,(m,w)=>`<span class="blk" data-a="${w}" onclick="cpick(this)"></span>`)}</div>
<div class="fb" id="fb"></div><div id="kb">${["qwertyuiop","asdfghjkl","zxcvbnm"].map(r=>`<div class="kr">${[...r].map(c=>`<button class="k" data-k="${c}">${c}</button>`).join("")}</div>`).join("")}
<div class="kr"><button class="k w" data-k="del">⌫ 删除</button><button class="k w" data-k="clr">清空</button><button class="k w main" data-k="ok">检查</button></div></div>
<button onclick="say(PASSAGES[pi%PASSAGES.length].text.replace(/[{}]/g,''))">🔊 朗读</button><button onclick="cnext()">换一篇</button></div>`;
cpick(document.querySelector(".blk"));$("#kb").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b||!cb)return;const k=b.dataset.k;
if(k==="ok")return cchk();if(k==="del")cb.textContent=cb.textContent.slice(0,-1);else if(k==="clr")cb.textContent="";else cb.textContent+=k;cb.classList.remove("good","bad")})}
function cpick(s){document.querySelectorAll(".blk").forEach(x=>x.classList.remove("cur"));cb=s;s.classList.add("cur")}
function cnext(){CQ.forEach(x=>x.w--);const d=CQ.findIndex(x=>x.w<=0);if(d>=0)pi=CQ.splice(d,1)[0].i;else pi++;cloze()}
function cchk(){let c=0,t=0,first=null;const n=pi%PASSAGES.length;document.querySelectorAll(".passage .blk").forEach(s=>{t++;const v=s.textContent.trim().toLowerCase(),ok=v===s.dataset.a;
s.classList.toggle("good",ok);s.classList.toggle("bad",!ok);if(ok)c++;else{if(!first)first=s;if(v){s.dataset.n=(+s.dataset.n||0)+1;if(s.dataset.n>=1&&!(s.nextElementSibling&&s.nextElementSibling.classList.contains("hint")))s.insertAdjacentHTML("afterend",`<small class="hint">（提示：${s.dataset.a}）</small>`)}if(v&&!s.dataset.miss){s.dataset.miss=1;wrong("短文填空","短文填空："+s.dataset.a+"（"+PASSAGES[n].text.replace(/[{}]/g,"").slice(0,30)+"…）",s.dataset.a)}}});
if(c===t){$("#fb").textContent="🎉 全对了！";if(!document.querySelector(".blk[data-miss]"))star(2);else $("#fb").textContent="✅ 改对了！这篇等一下还会再考一次";return}
$("#fb").textContent=`对了 ${c}/${t}，红色的用 ⌫ 删除 或 清空 改一改，再按检查`;if(first)cpick(first);if(document.querySelector(".blk[data-miss]")&&!CQ.some(x=>x.i===n))CQ.push({i:n,w:2})}
function order(){const s=pick(SENTS,1)[0];window.cur=s;window.built=[];const ws=s.split(" ");
app.innerHTML=`${back}<div class="card"><p>点单词，连成正确的句子：</p><div class="slot row" id="slot"></div><div class="row" id="pool">${shuf(ws.map((w,i)=>[w,i])).map(([w,i])=>`<button data-i="${i}" onclick="put(this)">${w}</button>`).join("")}</div>
<div class="fb" id="fb"></div><button class="main" onclick="ochk()">检查</button><button onclick="order()">下一题</button><button onclick="order2()">重来</button></div>`}
function order2(){const s=window.cur;order();window.cur=s}
function put(b){$("#slot").appendChild(b);b.onclick=()=>{$("#pool").appendChild(b);b.onclick=()=>put(b)}}
function ochk(){const a=[...$("#slot").children].map(b=>b.textContent).join(" "),s=window.cur,ok=a===s;
$("#fb").textContent=ok?"✅ 对了！":"❌ 正确："+s;ok?(star(),right(s)):wrong("造句",s,s);say(s)}
function book(){app.innerHTML=`${back}<div class="card"><h3>📕 错题本（${S.wrong.length}）</h3>${S.wrong.length?S.wrong.map((w,i)=>`<p>【${w.type}】${w.q}<br>👉 <b>${w.a}</b> <button onclick="say(\`${w.a.replace(/`/g,"")}\`)">🔊</button> <button onclick="S.wrong.splice(${i},1);save();book()">已掌握</button></p>`).join(""):"<p>没有错题，真棒！</p>"}</div>`}
setUnit(S.u||1);home();
