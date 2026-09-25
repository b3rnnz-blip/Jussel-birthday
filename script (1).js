const scenes=['scene0','scene1','scene2','scene3','scene4','scene5'];
const dotsEl=document.getElementById('dots');
scenes.slice(1).forEach((_,i)=>{const d=document.createElement('div');d.className='dot';dotsEl.appendChild(d);});
let current=0;
function goTo(i){
  document.getElementById(scenes[current]).classList.remove('active');
  current=i;
  document.getElementById(scenes[current]).classList.add('active');
  if(current>0){
    dotsEl.classList.remove('hide');
    [...dotsEl.children].forEach((d,idx)=>d.classList.toggle('on',idx===current-1));
  } else dotsEl.classList.add('hide');
  window.scrollTo({top:0,behavior:'instant'});
}

/* confetti + floating hearts helpers */
function spawnConfetti(n=32){
  const colors=['#e2a0bd','#f4d58d','#ece3f7','#b7d7b0','#dcedf8','#c97fa3'];
  for(let i=0;i<n;i++){
    const c=document.createElement('div');c.className='confetti';
    c.style.left=Math.random()*100+'vw';
    c.style.background=colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDuration=(2.2+Math.random()*1.6)+'s';
    c.style.animationDelay=(Math.random()*0.4)+'s';
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4200);
  }
}
function spawnFloats(glyphs,n=10,soft=false){
  for(let i=0;i<n;i++){
    const h=document.createElement('span');h.className='float-el';
    h.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
    h.style.left=Math.random()*90+'vw';
    h.style.top=(60+Math.random()*20)+'vh';
    h.style.fontSize=(0.8+Math.random()*(soft?0.6:0.9))+'rem';
    h.style.opacity=soft?'.6':'.9';
    h.style.animationDuration=(2.6+Math.random()*1.4)+'s';
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),4200);
  }
}
function sparkleBurst(x,y,n=16){
  for(let i=0;i<n;i++){
    const s=document.createElement('span');s.className='sparkle-burst';s.textContent=['✨','💫','⭐'][i%3];
    const ang=Math.random()*Math.PI*2,dist=40+Math.random()*70;
    s.style.setProperty('--dx',Math.cos(ang)*dist+'px');
    s.style.setProperty('--dy',Math.sin(ang)*dist+'px');
    s.style.left=x+'px';s.style.top=y+'px';
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),950);
  }
}

/* photo upload + zoom (kept as direct listeners since they're input-specific) */
const memPhoto=document.getElementById('memPhoto');
const phPlaceholder=document.getElementById('phPlaceholder');
phPlaceholder.style.display='none';
memPhoto.addEventListener('click',(e)=>{ e.preventDefault(); memPhoto.classList.toggle('zoom'); });

/* question branching messages */
const YES_MSG=`<p>I'm really happy to hear that! \u{1F97A}\u{1F49D} I hope life continues to be kind to you, and I hope you find more reasons to smile every day. You deserve all the happiness in the world, amiga! Keep going and take care of yourself, always.</p>`;
const NO_MSG=`<p>It's okay, Jussel. You don't have to have everything figured out right now. I know life can be difficult sometimes, and even though we may not talk as often as we used to, I hope you know that you don't have to pretend to be okay all the time.</p>
<p>Bisan og naa na ta sa atong tagsa-tagsa ka kinabuhi, I still wish you nothing but happiness and peace. Take your time, rest when you need to, and be gentle with yourself. You don't have to face everything all at once. And if you ever need someone to talk to, I'm just a message away. \u{1F49D}</p>`;

/* background music: gentle generated music-box loop via WebAudio, starts only on click */
let audioCtx=null, playing=false, timer=null;
const melody=[523.25,587.33,659.25,523.25,659.25,783.99,659.25,587.33,523.25,659.25,783.99,880,783.99,659.25,587.33,523.25];
let step=0;
function playNote(freq){
  if(!audioCtx) return;
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type='sine'; o.frequency.value=freq;
  g.gain.value=0.0001;
  o.connect(g); g.connect(audioCtx.destination);
  const t=audioCtx.currentTime;
  g.gain.exponentialRampToValueAtTime(0.06,t+0.05);
  g.gain.exponentialRampToValueAtTime(0.0001,t+0.55);
  o.start(t); o.stop(t+0.6);
}
function scheduleLoop(){
  if(!playing) return;
  playNote(melody[step%melody.length]); step++;
  timer=setTimeout(scheduleLoop,420);
}
function toggleMusic(btn){
  try{
    if(!audioCtx){
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx) return;
      audioCtx=new Ctx();
    }
    playing=!playing;
    btn.textContent=playing?'\u{1F50A}':'\u{1F507}';
    if(playing){ if(audioCtx.state==='suspended') audioCtx.resume(); scheduleLoop(); }
    else clearTimeout(timer);
  }catch(err){ /* music is optional; never let it break the page */ }
}

/* one delegated click handler drives every scripted button on the page,
   so a single missing element or layout quirk can never silently disable the rest */
document.addEventListener('click', function(e){
  const candle=e.target.closest('.candle');
  if(candle){
    const flame=candle.querySelector('.flame');
    if(flame && !flame.classList.contains('out')){
      flame.classList.add('out');
      const smoke=document.createElement('div');smoke.className='smoke';
      candle.appendChild(smoke);
      setTimeout(()=>smoke.remove(),1000);
    }
    return;
  }

  const btn=e.target.closest('button, .photo-box');
  if(!btn) return;

  if(btn.id==='musicBtn'){ toggleMusic(btn); return; }
  if(btn.classList.contains('photo-box')) return; /* handled by memPhoto listener */

  switch(btn.id){
    case 'openBtn':
      spawnConfetti();
      document.getElementById('card').classList.add('open');
      setTimeout(()=>goTo(1),900);
      break;
    case 'wishBtn': {
      const r=btn.getBoundingClientRect();
      sparkleBurst(r.left+r.width/2,r.top);
      document.getElementById('letterText').classList.add('show');
      document.getElementById('toMemories').style.display='inline-block';
      spawnFloats(['✨','💫'],8);
      break;
    }
    case 'toMemories':
      goTo(2);
      break;
    case 'toQuestion':
      goTo(3);
      break;
    case 'yesBtn':
      document.getElementById('resultMsg').innerHTML=YES_MSG;
      spawnFloats(['💗','✨','💫','🌸'],14);
      goTo(4);
      break;
    case 'noBtn':
      document.getElementById('resultMsg').innerHTML=NO_MSG;
      spawnFloats(['💗','⭐'],7,true);
      goTo(4);
      break;
    case 'finalBtn':
      spawnConfetti(40);
      spawnFloats(['💗','✨','💫','🌸','⭐'],16);
      goTo(5);
      break;
    case 'replayBtn':
      document.getElementById('card').classList.remove('open');
      document.getElementById('letterText').classList.remove('show');
      document.getElementById('toMemories').style.display='none';
      memPhoto.classList.remove('zoom');
      document.querySelectorAll('.flame').forEach(f=>f.classList.remove('out'));
      goTo(0);
      break;
  }
});
