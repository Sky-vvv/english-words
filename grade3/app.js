const $=s=>document.querySelector(s),app=$("#app");
const KEY="jf3";// 景菲自己的存档，和明泽的 mz6 分开
const S=Object.assign({stars:0,wrong:[]},JSON.parse(localStorage.getItem(KEY)||"{}"));
function save(){localStorage.setItem(KEY,JSON.stringify(S));$("#stars").textContent=S.stars}
function star(n=1){S.stars+=n;save()}
// 单元：2 = 原来的家人单元（旧错题没有 u，就是第 2 单元，id 不加前缀，旧数据照常能用）
let U=2;const PRE=()=>U==2?"":"u"+U+"|";
function wrong(m,id,q,a){id=PRE()+id;if(!S.wrong.some(w=>w.id===id))S.wrong.push(Object.assign({m,id,q:(U==2?"":"["+uname(U)+"] ")+q,a},U==2?{}:{u:U}));save()}
function right(id){id=PRE()+id;S.wrong=S.wrong.filter(w=>w.id!==id);save()}
let VOICE=null;
function pickVoice(){try{const v=speechSynthesis.getVoices();VOICE=v.find(x=>x.lang==="en-US")||v.find(x=>/^en/i.test(x.lang))||null}catch(e){}}
if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="en-US";if(VOICE)u.voice=VOICE;u.rate=.8;speechSynthesis.speak(u)}catch(e){}}
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const pick=(a,n)=>shuf(a).slice(0,n);
const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const sayBtn=(t,label="🔊")=>`<button class="snd" data-say="${esc(t)}">${label}</button>`;
document.addEventListener("click",e=>{const b=e.target.closest("[data-say]");if(b){say(b.dataset.say);const c=b.dataset.cn;if($("#tip")&&c!==undefined)$("#tip").textContent=b.dataset.say+(c?" = "+c:"")}});
const back='<button class="backb" onclick="home()">← 返回</button>';
let ALL=[...WORDS,...ACTS];const byW=w=>ALL.find(x=>x.w===w);
const DICT={};ALL.forEach(x=>DICT[x.w]=x.c);Object.assign(DICT,{brothers:"兄弟们",sisters:"姐妹们",grandpa:"爷爷",grandma:"奶奶",big:"大的",small:"小的",happy:"快乐的",love:"爱",home:"家",photo:"照片",shares:"分享",helps:"帮助",smiles:"微笑",plays:"玩",listens:"听",together:"一起",look:"看",name:"名字"});

const U2={WORDS,ACTS,LSENT,PHON,FILL,READ,TABLE,DIA};UNITS3[2]={t:"Different families",cn:"家人",words:[...WORDS,...ACTS],dia:DIA,sents:LSENT.map(s=>s[0])};
const UKEYS=[1,2,3,4,5,6],uname=u=>u==="all"?"全部单元":"Unit "+u;
const isW=w=>/^[a-z]+$/.test(w);
function genFill(ws){const out=[];ws.filter(x=>isW(x.w)&&x.w.length>=3).forEach(x=>{const i=x.w.search(/[aeiou]/);const k=i<0?1:i;out.push({w:x.w,e:x.e,c:x.c,p:x.w.slice(0,k)+"_"+x.w.slice(k+1)});if(x.w.length<=5)out.push({w:x.w,e:x.e,c:x.c,p:"_".repeat(x.w.length)})});return out}
function unitData(u){if(u==2)return U2;const us=u==="all"?UKEYS:[u],ws=[],seen={},dia=[],sents=[];
us.forEach(k=>{const D=UNITS3[k];D.words.forEach(x=>{if(!seen[x.w]){seen[x.w]=1;ws.push(Object.assign({g:x.w},x))}});dia.push(...D.dia);sents.push(...D.sents)});
const pw=ws.filter(x=>!x.np&&isW(x.w));
return {WORDS:ws,ACTS:[],LSENT:[],PHON:pw.map(x=>({w:x.w,e:x.e})),FILL:u==="all"?[...U2.FILL,...genFill(ws.filter(x=>!U2.FILL.some(f=>f.w===x.w)))]:genFill(ws),READ:u==="all"?U2.READ:[],TABLE:u==="all"?U2.TABLE:[],DIA:dia,SENTS:sents}}
let SENTS=UNITS3[2].sents;
function setUnit(u){U=u;S.u=u;const D=unitData(u);({WORDS,ACTS,LSENT,PHON,FILL,READ,TABLE,DIA}=D);SENTS=D.SENTS||UNITS3[2].sents;
if(u==="all"){ACTS=U2.ACTS;WORDS=WORDS.filter(x=>!ACTS.some(a=>a.w===x.w))}
ALL=[...WORDS,...ACTS];ALL.forEach(x=>{if(!DICT[x.w])DICT[x.w]=x.c});ri=0;ti=0;save()}
function unitBar(){return `<div class="units">${[...UKEYS,"all"].map(k=>`<button class="ub${k==U?" on":""}" data-u="${k}" onclick="setUnit(${k==="all"?"'all'":k});home()">${k==="all"?"🔀 全部":"U"+k}<small>${k==="all"?"混合练":UNITS3[k].cn}</small></button>`).join("")}</div>
<div class="card utitle">📘 现在练：<b>${uname(U)}</b> ${U==="all"?"（六个单元混在一起）":UNITS3[U].t+" · "+UNITS3[U].cn}</div>`}
let cur=null;// 当前题目的检查函数用

function home(){cur=null;app.innerHTML=`${unitBar()}<div class="grid">
<div class="card mod" onclick="cards()">📇 单词卡<small>点一点，听发音</small></div>
<div class="card mod" onclick="listen()">🎧 听音选图<small>听单词、听句子</small></div>
<div class="card mod" onclick="phon()">🔤 首字母<small>听单词，选第一个字母</small></div>
<div class="card mod" onclick="fill()">✏️ 补全字母<small>用小写字母写</small></div>
${READ.length?`<div class="card mod" onclick="read()">📖 读短文<small>读一读，选一选</small></div>`:""}
${TABLE.length?`<div class="card mod" onclick="table()">✅ 听一听打勾<small>share / help / smile…</small></div>`:""}
<div class="card mod" onclick="dia()">💬 对话选择<small>该说哪句话？</small></div>
<div class="card mod" onclick="order()">🧩 连词成句<small>点单词排句子</small></div>
<div class="card mod" onclick="book()">📕 错题本<small>${S.wrong.length} 题待复习</small></div></div>
<div class="card muted">每答对一题得 1 颗星⭐。做错的题会自动进错题本，再做对就自动移出。<br>写英语单词时，要用<b>小写字母</b>哦（比如 nest，不是 NEST）。</div>`}

/* 1 单词卡 */
function cards(){cur=null;const tile=x=>`<button class="tile" data-say="${esc(x.s===x.w?x.w:x.w+". "+x.s)}" data-cn="${esc(x.c)}"><span class="emo">${x.e}</span><b>${x.w}</b><small>${x.c}</small></button>`;
app.innerHTML=`${back}<div class="card"><p>👆 点一张卡片，听单词和句子。</p><div class="fb" id="tip"></div>
<h3>${U==2?"👨‍👩‍👧‍👦 家人 family":"📘 "+uname(U)+(U==="all"?"":" "+UNITS3[U].t)}</h3><div class="tiles">${WORDS.map(tile).join("")}</div>
${ACTS.length?`<h3>❤️ 爱的表达</h3><div class="tiles">${ACTS.map(tile).join("")}</div>`:""}</div>`}

/* 2 听音选图 */
function listenItems(){return [...ALL.filter(x=>!x.np).map(x=>({id:"L:w:"+x.w,t:x.w,ans:x})),...LSENT.map((s,i)=>({id:"L:s:"+i,t:s[0],ans:byW(s[1])}))]}
function listen(id){const items=listenItems(),it=id?items.find(x=>x.id===id):pick(items,1)[0];
const pool=(WORDS.includes(it.ans)?WORDS:ACTS).filter(x=>!x.np);let ds=shuf(pool.filter(x=>x.g!==it.ans.g));const opts=[it.ans];
for(const d of ds){if(opts.length>=4)break;if(!opts.some(o=>o.g===d.g||o.e===d.e))opts.push(d)}
cur={it,done:false};
app.innerHTML=`${back}<div class="card"><p>🎧 听一听，点出对的图片：</p><div class="big"><button class="main" onclick="say(cur.it.t)">🔊 再听一遍</button></div>
<div class="pics">${shuf(opts).map(o=>`<button class="pic" data-w="${o.w}" onclick="lans(this)"><span class="emo">${o.e}</span><small class="lab"></small></button>`).join("")}</div>
<div class="fb" id="fb"></div><button class="main" onclick="listen()">下一题 ➜</button></div>`;say(it.t)}
function lans(b){if(cur.done)return;cur.done=true;const it=cur.it,ok=b.dataset.w===it.ans.w;b.classList.add(ok?"ok":"bad");
document.querySelectorAll(".pic").forEach(p=>{const x=byW(p.dataset.w);p.querySelector(".lab").textContent=x.w+" "+x.c;if(x===it.ans)p.classList.add("ok")});
$("#fb").innerHTML=(ok?"✅ 对了！":"❌ 再听听，")+` 听到的是：<b>${esc(it.t)}</b> ${it.ans.e} ${sayBtn(it.t)}`;
ok?(star(),right(it.id)):wrong("listen",it.id,"听音："+it.t,it.ans.e+" "+it.ans.w+"（"+it.ans.c+"）");}

/* 3 首字母 */
function phon(id){const it=id?PHON.find(x=>"P:"+x.w===id):pick(PHON,1)[0],f=it.w[0];
let o=[f];for(const c of shuf([...(CONF[f]||"")]))if(o.length<2&&!o.includes(c))o.push(c);
for(const c of shuf([..."abcdefghlmnpstw"]))if(o.length<3&&!o.includes(c))o.push(c);
cur={it,done:false};
app.innerHTML=`${back}<div class="card"><p>🔤 听单词，选出它的<b>第一个字母</b>：</p><div class="big"><span class="emo">${it.e}</span><br><button class="main" onclick="say(cur.it.w)">🔊 再听一遍</button></div>
<div class="row">${shuf(o).map(c=>`<button class="letter" onclick="pans(this,'${c}')">${c}</button>`).join("")}</div>
<div class="fb" id="fb"></div><button class="main" onclick="phon()">下一题 ➜</button></div>`;say(it.w)}
function pans(b,c){if(cur.done)return;cur.done=true;const it=cur.it,ok=c===it.w[0];b.classList.add(ok?"ok":"bad");
$("#fb").innerHTML=(ok?"✅ 对了！":"❌ 第一个字母是 <b>"+it.w[0]+"</b>。")+` <span class="word"><b class="hl">${it.w[0]}</b>${it.w.slice(1)}</span> ${sayBtn(it.w)}`;
ok?(star(),right("P:"+it.w)):wrong("phon","P:"+it.w,"首字母："+it.e+" "+it.w,it.w[0]+"（"+it.w+"）");say(it.w)}

/* 4 补全字母（屏幕键盘，和明泽那边一样的键盘） */
const KB=`<div id="kb">${["qwertyuiop","asdfghjkl","zxcvbnm"].map(r=>`<div class="kr">${[...r].map(c=>`<button class="k" data-k="${c}">${c}</button>`).join("")}</div>`).join("")}
<div class="kr"><button class="k w" data-k="del">⌫ 删除</button><button class="k w" data-k="clr">清空</button><button class="k w main" data-k="ok">提交</button></div></div>`;
let RQ=[];// 做错的题：过两题再考一次
function fill(id){let it=id?FILL.find(x=>"F:"+x.p+":"+x.w===id):null;
if(!it){RQ.forEach(r=>r.wait--);const due=RQ.findIndex(r=>r.wait<=0);if(due>=0&&FILL.includes(RQ[due].it))it=RQ.splice(due,1)[0].it;else{RQ=RQ.filter(r=>r.wait>0||!FILL.includes(r.it));it=pick(FILL,1)[0]}}
cur={it,typed:[],done:false,key:fkey};
const all=!/[a-z]/.test(it.p);
app.innerHTML=`${back}<div class="card"><p>✏️ 听一听，${all?"写出整个单词":"补全缺少的字母"}（用<b>小写字母</b>）：</p>
<div class="big"><span class="emo">${it.e}</span> <span class="muted">${it.c}</span><br><button class="main" onclick="say(cur.it.w)">🔊 听单词</button></div>
<div class="slots" id="slots"></div><div class="fb" id="fb"></div>${KB}
<button class="main" onclick="fill()">下一题 ➜</button></div>`;
$("#kb").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b)fkey(b.dataset.k)});draw();say(it.w)}
function blanks(){return [...cur.it.p].filter(c=>c==="_").length}
function draw(){let i=0;$("#slots").innerHTML=[...cur.it.p].map(c=>c==="_"?`<span class="sl blank">${cur.typed[i++]||""}</span>`:`<span class="sl">${c}</span>`).join("")}
function fkey(k){if(!cur||cur.done&&k!=="ok")return;
if(k==="del")cur.typed.pop();else if(k==="clr")cur.typed=[];else if(k==="ok"){if(cur.done)return fill();return fchk()}
else if(/^[A-Z]$/.test(k)){$("#fb").innerHTML="⚠️ 要写<b>小写</b>字母哦："+k+" → "+k.toLowerCase();return}
else if(/^[a-z]$/.test(k)){if(cur.typed.length<blanks())cur.typed.push(k)}
$("#fb").textContent="";draw()}
function fchk(){const it=cur.it;if(cur.typed.length<blanks()){$("#fb").textContent="还有空没写完哦";return}
let i=0;const got=[...it.p].map(c=>c==="_"?cur.typed[i++]:c).join(""),ok=got===it.w,id="F:"+it.p+":"+it.w;
document.querySelectorAll(".sl.blank").forEach(s=>s.classList.add(ok?"good":"wrongl"));say(it.w);
if(ok){cur.done=true;if(cur.missed){$("#fb").innerHTML="✅ 改对了！<b>"+it.w+"</b> 等一下还会再考你一次哦";return}
$("#fb").innerHTML="✅ 对了！<b>"+it.w+"</b>";star();right(id);return}
// 做错：不锁住，可以用 ⌫ 删除 / 清空 改了再提交；进错题本，并且过两题再考一次
$("#fb").innerHTML="❌ 正确是 <b>"+it.w+"</b>，你写的是 "+esc(got)+"<br>用 ⌫ 删除 或 清空 改一改，再按提交";
if(!cur.missed){cur.missed=true;wrong("fill",id,"补全字母："+it.e+" "+it.p.replace(/_/g," _ "),it.w);if(!RQ.some(r=>r.it===it))RQ.push({it,wait:2})}}
// 电脑上的实体键盘也能用（没有输入框，不会触发手机输入法）
document.addEventListener("keydown",e=>{if(!cur||cur.key!==fkey||e.ctrlKey||e.metaKey||e.altKey)return;
if(e.key==="Backspace"){e.preventDefault();fkey("del")}else if(e.key==="Enter"){e.preventDefault();fkey("ok")}else if(/^[a-zA-Z]$/.test(e.key))fkey(e.key)});

/* 5 读短文 */
const tapText=t=>t.split(/(\s+)/).map(w=>{const k=w.toLowerCase().replace(/[^a-z']/g,"");return /\S/.test(w)?`<span class="tw" data-say="${esc(k||w)}" data-cn="${esc(DICT[k]||"")}">${esc(w)}</span>`:w}).join("");
let ri=0;
function read(id){if(id)ri=+id.split(":")[1];const p=READ[ri%READ.length],n=ri%READ.length;cur={done:{}};
app.innerHTML=`${back}<div class="card"><p>📖 读一读（不认识的词<b>点一下</b>，会读出来并告诉你中文），再回答问题：</p>
<div class="passage">${tapText(p.t)}</div><div class="fb" id="tip"></div>${sayBtn(p.t,"🔊 听全文")}
${p.q.map((q,qi)=>`<div class="q"><p><b>${qi+1}. ${q.q}</b></p>${q.o.map((o,oi)=>`<button class="opt" onclick="rans(this,${n},${qi},${oi})">${o}</button>`).join("")}<div class="fb" id="rf${qi}"></div></div>`).join("")}
<button class="main" onclick="ri++;read()">换一篇 ➜</button></div>`}
function rans(b,n,qi,oi){if(cur.done[qi])return;cur.done[qi]=1;const q=READ[n].q[qi],ok=oi===q.a,id="R:"+n+":"+qi;b.classList.add(ok?"ok":"bad");
$("#rf"+qi).innerHTML=ok?"✅ 对了！":"❌ 正确答案："+q.o[q.a];ok?(star(),right(id)):wrong("read",id,"读短文："+READ[n].t.slice(0,40)+"… 问："+q.q,q.o[q.a])}

/* 6 听一听打勾（试卷第五题） */
let ti=0,showT=false;
function table(id){if(id)ti=+id.split(":")[1];const T=TABLE[ti%TABLE.length];cur={T};
app.innerHTML=`${back}<div class="card"><p>✅ 听短文，在表格里打勾：谁用哪种方式表达爱？（点格子打勾，再点一次取消）</p>
<div class="big"><button class="main" onclick="say(cur.T.t)">🔊 听短文</button> <button onclick="showT=!showT;table()">${showT?"🙈 盖住短文":"👀 看短文"}</button></div>
${showT?`<div class="passage">${tapText(T.t)}</div><div class="fb" id="tip"></div>`:""}
<table class="tick"><tr><th></th>${ACTS.map(a=>`<th>${a.e}<br>${a.w}</th>`).join("")}</tr>
${T.rows.map(r=>`<tr><th>${byW(r).e}<br>${r}</th>${ACTS.map(a=>`<td data-r="${r}" data-a="${a.w}" onclick="this.classList.toggle('on')"></td>`).join("")}</tr>`).join("")}</table>
<div class="fb" id="fb"></div><button class="main" onclick="tchk()">检查</button><button onclick="ti++;table()">换一篇 ➜</button></div>`}
function tchk(){const T=cur.T,id="T:"+(ti%TABLE.length);let bad=0;
document.querySelectorAll(".tick td").forEach(td=>{const want=T.ans[td.dataset.r].includes(td.dataset.a),on=td.classList.contains("on");td.classList.remove("good","wrongl","miss");
if(want&&on)td.classList.add("good");else if(want&&!on){td.classList.add("miss");bad++}else if(on){td.classList.add("wrongl");bad++}});
$("#fb").innerHTML=bad?`❌ 有 ${bad} 个格子不对（红色是多勾了，虚线框是漏了）。再听一遍试试！`:"🎉 全对！";
bad?wrong("table",id,"打勾表："+T.t.slice(0,40)+"…",T.rows.map(r=>r+"："+T.ans[r].join("、")).join("；")):(star(2),right(id))}

/* 7 对话选择 */
function dia(id){const it=id?DIA[+id.split(":")[1]]:pick(DIA,1)[0],n=DIA.indexOf(it);cur={it,n,done:false};
app.innerHTML=`${back}<div class="card"><p>💬 选出合适的一句话：</p><div class="ctx">${it.ctx}</div>
${it.hear?`<div class="big hear">“${esc(it.hear)}” ${sayBtn(it.hear)}</div>`:""}
${shuf([it.a,...it.x]).map(o=>`<button class="opt" onclick="dans(this)">${esc(o)}</button>`).join("")}
<div class="fb" id="fb"></div><button class="main" onclick="dia()">下一题 ➜</button></div>`;if(it.hear)say(it.hear)}
function dans(b){if(cur.done)return;cur.done=true;const it=cur.it,ok=b.textContent===it.a,id="D:"+cur.n;b.classList.add(ok?"ok":"bad");
$("#fb").innerHTML=(ok?"✅ 对了！":"❌ 应该说：")+` <b>${esc(it.a)}</b> ${sayBtn(it.a)}`;say(it.a);
ok?(star(),right(id)):wrong("dia",id,"对话："+it.ctx+(it.hear?" “"+it.hear+"”":""),it.a)}


/* 8 连词成句 */
function order(id){const s=id!==undefined?SENTS[+id.split(":")[1]]:pick(SENTS,1)[0],n=SENTS.indexOf(s);cur={s,n,done:false};
const ws=s.split(" ");app.innerHTML=`${back}<div class="card"><p>🧩 点单词，排成正确的句子（点上面的词可以放回去）：</p>${sayBtn(s,"🔊 听句子")}<div class="slot row" id="slot"></div><div class="row" id="pool">${shuf(ws.map((w,i)=>[w,i])).map(([w,i])=>`<button class="wbtn" onclick="put(this)">${esc(w)}</button>`).join("")}</div>
<div class="fb" id="fb"></div><button class="main" onclick="ochk()">检查</button><button onclick="order('O:'+cur.n)">重来</button><button class="main" onclick="order()">下一题 ➜</button></div>`}
function put(b){const inSlot=b.parentNode.id==="slot";(inSlot?$("#pool"):$("#slot")).appendChild(b)}
function ochk(){if(cur.done)return;const a=[...$("#slot").children].map(b=>b.textContent).join(" "),s=cur.s;if(a.split(" ").length<s.split(" ").length&&a!==s){$("#fb").textContent="还有单词没放上去哦";return}
cur.done=true;const ok=a===s,id="O:"+cur.n;$("#fb").innerHTML=(ok?"✅ 对了！":"❌ 正确是：")+` <b>${esc(s)}</b> ${sayBtn(s)}`;say(s);ok?(star(),right(id)):wrong("order",id,"连词成句："+s.split(" ").sort().join(" / "),s)}
/* 错题本 */
const RETRY={listen,phon,fill,read,table,dia,order};
function retry(i){const w=S.wrong[i],u=w.u||2;if(u!==U)setUnit(u);RETRY[w.m](w.id.replace(/^u\w+\|/,""))}
function book(){cur=null;app.innerHTML=`${back}<div class="card"><h3>📕 景菲的错题本（${S.wrong.length}）</h3>${S.wrong.length?S.wrong.map((w,i)=>`<div class="wb"><p>${esc(w.q)}<br>👉 <b>${esc(w.a)}</b></p>
<button class="main" onclick="retry(${i})">再做一次</button><button onclick="S.wrong.splice(${i},1);save();book()">已掌握</button></div>`).join(""):"<p>没有错题，真棒！🎉</p>"}</div>`}
setUnit(S.u||2);home();
if(!window.speechSynthesis)document.body.insertAdjacentHTML("afterbegin",'<div class="warn">这个浏览器不能朗读英语，建议用手机自带的 Safari 或 Chrome 打开。</div>');
