const GEN=['Fantasy','Sci-Fi','Mystery','Romance','Literary','Historical','Horror','Non-fiction'];
const STG=['Editing','Cover design','Proofreading'];
const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hue=t=>{let h=0;for(const c of t)h=(h*31+c.charCodeAt(0))%360;return h};
const seed=()=>({role:'writer',tab:{writer:'ms',publisher:'inbox'},pub:'p1',view:null,gf:'All',q:'',nid:10,
 writer:{name:'Ada Okafor',bio:'Lagos-based novelist. Writes speculative fiction about water, maps and memory.'},
 mss:[{id:'m1',title:'The Salt Cartographer',genre:'Fantasy',synopsis:'When the tides begin redrawing the coastline overnight, a disgraced mapmaker must chart a city that refuses to stay put.',sample:'Chapter 1: The harbour had moved again. Tomas pressed his palm to the wet quay and counted the paces to where the lighthouse used to stand...',words:92000}],
 pubs:[{id:'p1',name:'Lantern Press',genres:['Fantasy','Sci-Fi'],rules:'Query with synopsis and first three chapters. Adult and YA speculative fiction, 70k–120k words. Replies within 6 weeks.',bio:'Independent house for imaginative fiction.'},
 {id:'p2',name:'Harmattan Books',genres:['Literary','Historical','Non-fiction'],rules:'Complete manuscripts only. Include a one-page author bio. No simultaneous exclusivity required.',bio:'Stories rooted in West African and diaspora voices.'},
 {id:'p3',name:'Nightshade House',genres:['Mystery','Horror','Romance'],rules:'Synopsis plus 10,000-word sample. Series proposals welcome.',bio:'Page-turners after dark.'}],
 subs:[],
 books:[{id:'b1',pubId:'p2',title:'Rain on the Ledger',author:'Chidi Eze',genre:'Historical',desc:'A bookkeeper in 1950s Calabar discovers the accounts of a trading house were written in two hands, and only one of them was honest.',price:12.99,stages:[2,2,2],published:true},
 {id:'b2',pubId:'p3',title:'The Last Ferry to Ikorodu',author:'Funmi Adeyemi',genre:'Mystery',desc:'Eleven passengers, one missing lifejacket, and a captain who swears the ferry never left the jetty.',price:9.5,stages:[2,2,2],published:true}]});
let S;try{S=JSON.parse(localStorage.getItem('folio-v1'))}catch(x){}
if(!S||!S.pubs)S=seed();
const save=()=>{try{localStorage.setItem('folio-v1',JSON.stringify(S))}catch(x){}};
const $=id=>document.getElementById(id), v=id=>($(id)||{}).value||'';
const pn=id=>(S.pubs.find(p=>p.id===id)||{}).name, ms=id=>S.mss.find(m=>m.id===id), sub=id=>S.subs.find(s=>s.id===id);
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2200)};
const ST={submitted:['In review',''],changes:['Changes requested','wn'],rejected:['Declined','er'],accepted:['Accepted, awaiting offer','ok'],offered:['Offer sent','wn'],signed:['Contract agreed','ok'],withdrawn:['Offer declined','er']};
const pill=s=>`<span class="pill ${ST[s][1]}">${ST[s][0]}</span>`;
const cover=b=>{const h=hue(b.title);return `<div class="cover" style="background:linear-gradient(160deg,hsl(${h} 45% 32%),hsl(${(h+40)%360} 50% 20%))"><div class="t">${e(b.title)}</div><div class="a">${e(b.author)}</div></div>`};
const go=(k,val)=>{if(k==='role'){S.role=val;S.view=null}else if(k==='tab')S.tab[S.role]=val;else S[k]=val;save();render()};
const stateOf=(i,t)=>[`Not started`,`In progress`,`Done`][i];

function render(){
 $('nav').innerHTML=[['writer','Writer'],['publisher','Publisher'],['reader','Bookstore']].map(([r,l])=>`<button class="tab ${S.role===r?'on':''}" onclick="go('role','${r}')">${l}</button>`).join('');
 $('app').innerHTML=({writer:wView,publisher:pView,reader:rView})[S.role]();
 window.scrollTo(0,0);
}
const subnav=(items)=>`<div class="sub">${items.map(([k,l])=>`<button class="tab ${S.tab[S.role]===k?'on':''}" onclick="go('tab','${k}')">${l}</button>`).join('')}</div>`;

/* ---------- WRITER ---------- */
function wView(){
 const t=S.tab.writer, open=S.subs.filter(s=>['accepted','offered','changes'].includes(s.status)).length;
 const nav=subnav([['ms','Profile & manuscripts'],['pubs','Find publishers'],['subs','Submissions'+(open?` (${open})`:'')],['prod','My books']]);
 return `<h2>Writer desk</h2>`+nav+({ms:wMs,pubs:wPubs,subs:wSubs,prod:wProd})[t]();
}
function wMs(){return `<div class="card"><h3>Your profile</h3><label>Name</label><input id="wn" value="${e(S.writer.name)}"><label>Bio</label><textarea id="wb">${e(S.writer.bio)}</textarea><p><button class="btn p" onclick="saveW()">Save profile</button></p></div>
<h3>Manuscripts</h3>${S.mss.map(m=>`<div class="card"><b>${e(m.title)}</b> <span class="pill">${e(m.genre)}</span> <span class="mu">${m.words.toLocaleString()} words</span><p>${e(m.synopsis)}</p><details><summary class="mu">Sample chapter</summary><p>${e(m.sample)}</p></details></div>`).join('')}
<div class="card"><h3>Upload a manuscript</h3><div class="row"><div><label>Title</label><input id="mt"></div><div><label>Genre</label><select id="mg">${GEN.map(g=>`<option>${g}</option>`).join('')}</select></div><div><label>Word count</label><input id="mw" type="number" min="1"></div></div>
<label>Synopsis</label><textarea id="ms"></textarea><label>Sample chapters (paste text)</label><textarea id="mc"></textarea><label>Or attach a manuscript file (name is stored for this demo)</label><input id="mf" type="file"><p><button class="btn p" onclick="addMs()">Add manuscript</button></p></div>`}
function saveW(){S.writer={name:v('wn')||S.writer.name,bio:v('wb')};save();toast('Profile saved')}
function addMs(){const t=v('mt').trim(),sy=v('ms').trim();if(!t||!sy)return toast('Add a title and synopsis first');
 S.mss.push({id:'m'+S.nid++,title:t,genre:v('mg'),synopsis:sy,sample:v('mc'),words:+v('mw')||0});save();toast('Manuscript added');render()}
function wPubs(){if(!S.mss.length)return `<div class="card">Add a manuscript before you submit.</div>`;
 return `<div class="grid">${S.pubs.map(p=>`<div class="card"><h3>${e(p.name)}</h3><div class="chips">${p.genres.map(g=>`<span class="pill">${g}</span>`).join('')}</div><p class="mu">${e(p.bio)}</p><p><b>Submission rules:</b> ${e(p.rules)}</p>
<label>Manuscript</label><select id="ps-${p.id}">${S.mss.map(m=>`<option value="${m.id}">${e(m.title)} (${m.genre})</option>`).join('')}</select><p><button class="btn p" onclick="submitTo('${p.id}')">Submit manuscript</button></p></div>`).join('')}</div>`}
function submitTo(pid){const m=ms(v('ps-'+pid)),p=S.pubs.find(x=>x.id===pid);
 if(!p.genres.includes(m.genre))return toast(`${p.name} doesn’t accept ${m.genre}`);
 if(S.subs.some(s=>s.msId===m.id&&s.pubId===pid))return toast('Already submitted there');
 S.subs.push({id:'s'+S.nid++,msId:m.id,pubId:pid,status:'submitted',log:[]});save();toast('Submitted to '+p.name);go('tab','subs')}
function wSubs(){if(!S.subs.length)return `<div class="card">No submissions yet. Pick a publisher whose genres match your book.</div>`;
 return S.subs.map(s=>{const m=ms(s.msId);return `<div class="card"><div class="row"><div><b>${e(m.title)}</b> to ${e(pn(s.pubId))}</div><div style="text-align:right">${pill(s.status)}</div></div>
${s.log.map(l=>`<div class="fb"><span class="mu">${e(l.who)}:</span> ${e(l.t)}</div>`).join('')}
${s.status==='changes'?`<label>Your reply or revised pages</label><textarea id="rr-${s.id}"></textarea><p><button class="btn p" onclick="resub('${s.id}')">Resubmit</button></p>`:''}
${s.status==='offered'?`<p><b>Offer:</b> $${s.offer.advance.toLocaleString()} advance, ${s.offer.royalty}% royalty. ${e(s.offer.note||'')}</p><button class="btn p" onclick="answer('${s.id}',true)">Accept offer</button> <button class="btn g" onclick="answer('${s.id}',false)">Decline offer</button>`:''}</div>`}).join('')}
function resub(id){const s=sub(id),t=v('rr-'+id).trim();s.log.push({who:'You',t:t||'Revisions made as requested.'});s.status='submitted';save();toast('Resubmitted');render()}
function answer(id,ok){const s=sub(id),m=ms(s.msId);
 if(!ok){s.status='withdrawn';save();toast('Offer declined');return render()}
 s.status='signed';S.books.push({id:'b'+S.nid++,subId:id,pubId:s.pubId,title:m.title,author:S.writer.name,genre:m.genre,desc:m.synopsis,price:0,stages:[0,0,0],published:false});
 save();toast('Contract agreed. Production begins');go('tab','prod')}
function wProd(){const bs=S.books.filter(b=>b.subId);if(!bs.length)return `<div class="card">Books appear here once you accept an offer.</div>`;
 return bs.map(b=>`<div class="card"><b>${e(b.title)}</b> with ${e(pn(b.pubId))} ${b.published?'<span class="pill ok">Published</span>':'<span class="pill wn">In production</span>'}${stagesHtml(b,false)}${b.published?`<button class="btn" onclick="S.view='${b.id}';go('role','reader')">View store page</button>`:''}</div>`).join('')}
function stagesHtml(b,edit){return `<div class="stages">${STG.map((n,i)=>`<div class="st"><b>${n}</b><span class="mu">${stateOf(b.stages[i])}</span>${edit&&!b.published?`<div><button class="btn" style="margin-top:6px" onclick="adv('${b.id}',${i})" ${b.stages[i]===2?'disabled':''}>${b.stages[i]===0?'Start':'Mark done'}</button></div>`:''}</div>`).join('')}</div>`}

/* ---------- PUBLISHER ---------- */
function pView(){const p=S.pubs.find(x=>x.id===S.pub);
 const inbox=S.subs.filter(s=>s.pubId===p.id&&s.status==='submitted').length;
 return `<h2>Publisher desk</h2><div class="row" style="margin-bottom:14px"><div style="flex:0 1 280px"><label>Acting as</label><select onchange="S.pub=this.value;save();render()">${S.pubs.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${e(x.name)}</option>`).join('')}</select></div><div class="mu" style="flex:2 1 260px">Switch publisher to try each side of the flow.</div></div>`+
 subnav([['inbox','Submissions'+(inbox?` (${inbox})`:'')],['prod','Production'],['prof','Profile & rules']])+({inbox:pInbox,prod:pProd,prof:pProf})[S.tab.publisher](p)}
function pProf(p){return `<div class="card"><h3>Publisher profile</h3><label>House name</label><input id="pnm" value="${e(p.name)}"><label>About</label><textarea id="pbio">${e(p.bio)}</textarea><label>Genres you accept</label><div class="chips">${GEN.map(g=>`<button class="chip ${p.genres.includes(g)?'on':''}" onclick="togG('${g}')">${g}</button>`).join('')}</div><label>Submission rules</label><textarea id="prl">${e(p.rules)}</textarea><p><button class="btn p" onclick="savePub()">Save profile</button> <button class="btn" onclick="newPub()">Add another publisher</button></p></div>`}
function togG(g){const p=S.pubs.find(x=>x.id===S.pub);p.name=v('pnm')||p.name;p.bio=v('pbio');p.rules=v('prl');p.genres=p.genres.includes(g)?p.genres.filter(x=>x!==g):[...p.genres,g];save();render()}
function savePub(){const p=S.pubs.find(x=>x.id===S.pub);p.name=v('pnm')||p.name;p.bio=v('pbio');p.rules=v('prl');save();toast('Profile saved');render()}
function newPub(){const id='p'+S.nid++;S.pubs.push({id,name:'New Press',genres:['Literary'],rules:'Describe how writers should submit.',bio:'Tell writers who you are.'});S.pub=id;save();render()}
function pInbox(p){const l=S.subs.filter(s=>s.pubId===p.id);if(!l.length)return `<div class="card">No submissions yet. Switch to Writer, then submit to ${e(p.name)}.</div>`;
 return l.map(s=>{const m=ms(s.msId);return `<div class="card"><div class="row"><div><b>${e(m.title)}</b> <span class="pill">${m.genre}</span><div class="mu">by ${e(S.writer.name)}, ${m.words.toLocaleString()} words</div></div><div style="text-align:right">${pill(s.status)}</div></div><p>${e(m.synopsis)}</p><details><summary class="mu">Sample chapter</summary><p>${e(m.sample||'No sample provided.')}</p></details>
${s.log.map(x=>`<div class="fb"><span class="mu">${e(x.who)}:</span> ${e(x.t)}</div>`).join('')}
${s.status==='submitted'?`<label>Feedback to the writer</label><textarea id="fb-${s.id}"></textarea><p><button class="btn p" onclick="decide('${s.id}','accepted')">Accept</button> <button class="btn" onclick="decide('${s.id}','changes')">Request changes</button> <button class="btn g" onclick="decide('${s.id}','rejected')">Reject</button></p>`:''}
${s.status==='accepted'?`<h3>Make an offer</h3><div class="row"><div><label>Advance ($)</label><input id="ad-${s.id}" type="number" value="3000"></div><div><label>Royalty (%)</label><input id="ry-${s.id}" type="number" value="12"></div></div><label>Note</label><input id="on-${s.id}" placeholder="Rights, timeline, anything else"><p><button class="btn p" onclick="offer('${s.id}')">Send offer</button></p>`:''}</div>`}).join('')}
function decide(id,st){const s=sub(id),f=v('fb-'+id).trim();if(st!=='accepted'&&!f)return toast('Add feedback so the writer knows why');
 if(f)s.log.push({who:pn(s.pubId),t:f});s.status=st;save();toast('Marked: '+ST[st][0]);render()}
function offer(id){const s=sub(id);s.offer={advance:+v('ad-'+id)||0,royalty:+v('ry-'+id)||0,note:v('on-'+id)};s.status='offered';save();toast('Offer sent');render()}
function pProd(p){const bs=S.books.filter(b=>b.pubId===p.id&&b.subId);if(!bs.length)return `<div class="card">Books move here once a writer accepts your offer.</div>`;
 return bs.map(b=>{const ready=b.stages.every(x=>x===2);return `<div class="card"><b>${e(b.title)}</b> by ${e(b.author)} ${b.published?'<span class="pill ok">Published</span>':''}${stagesHtml(b,true)}
${b.published?'':`<div class="row"><div><label>Retail price ($)</label><input id="pr-${b.id}" type="number" step="0.01" value="${b.price||''}"></div></div><label>Store description</label><textarea id="ds-${b.id}">${e(b.desc)}</textarea><p><button class="btn p" onclick="publish('${b.id}')" ${ready?'':'disabled'}>Publish to store</button> ${ready?'':'<span class="mu">Finish all three stages first.</span>'}</p>`}</div>`}).join('')}
function adv(id,i){const b=S.books.find(x=>x.id===id);b.stages[i]++;save();render()}
function publish(id){const b=S.books.find(x=>x.id===id),pr=+v('pr-'+id);if(!(pr>0))return toast('Set a price above zero');
 b.price=pr;b.desc=v('ds-'+id)||b.desc;b.published=true;save();toast('Published');render()}

/* ---------- READER ---------- */
function rView(){if(S.view)return rDetail(S.books.find(b=>b.id===S.view));
 const live=S.books.filter(b=>b.published),gs=['All',...new Set(live.map(b=>b.genre))],q=S.q.toLowerCase();
 const list=live.filter(b=>(S.gf==='All'||b.genre===S.gf)&&(b.title+b.author).toLowerCase().includes(q));
 return `<div class="hero"><h1>Books from independent houses</h1><p class="mu">Every title here went from manuscript to shelf through Folio.</p></div>
<div class="row" style="margin-bottom:12px"><input style="flex:2 1 220px" placeholder="Search title or author" value="${e(S.q)}" oninput="S.q=this.value;save();rList(this)"><div class="chips" style="flex:3 1 300px">${gs.map(g=>`<button class="chip ${S.gf===g?'on':''}" onclick="go('gf','${g}')">${g}</button>`).join('')}</div></div><div id="lst">${rGrid(list)}</div>`}
const rGrid=l=>l.length?`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">${l.map(b=>`<div class="book" tabindex="0" onclick="go('view','${b.id}')" onkeydown="if(event.key==='Enter')go('view','${b.id}')">${cover(b)}<b>${e(b.title)}</b><div class="mu">${e(b.author)} · $${b.price.toFixed(2)}</div></div>`).join('')}</div>`:`<div class="card">No books match. Clear the search or pick another genre.</div>`;
function rList(){const q=S.q.toLowerCase();$('lst').innerHTML=rGrid(S.books.filter(b=>b.published&&(S.gf==='All'||b.genre===S.gf)&&(b.title+b.author).toLowerCase().includes(q)))}
function rDetail(b){return `<button class="btn" onclick="go('view',null)">Back to bookstore</button><div class="det" style="margin-top:16px">${cover(b)}<div><h1>${e(b.title)}</h1><p class="mu">by ${e(b.author)} · ${e(b.genre)} · Published by ${e(pn(b.pubId))}</p><p style="font-family:Newsreader,Georgia,serif;font-size:1.15rem;line-height:1.6;max-width:60ch">${e(b.desc)}</p><h2>$${b.price.toFixed(2)}</h2><button class="btn p" onclick="toast('Demo only: checkout arrives in v2')">Buy now</button></div></div>`}
render();
