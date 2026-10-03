const RUFLO_BACKEND_URL = 'https://ruflo-backend.onrender.com';

async function start(){
  const e=document.getElementById('goal');
  if(e) S.goal=(e?e.value:S.goal||'').trim();
  if(!S.goal){toast('Enter a goal first');return;}
  if(S.running)return;

  resetAgents();
  S.selectedAgents=chooseAgents(S.goal);
  S.running=true;
  S.progress=8;
  S.currentStep=0;
  S.result='';
  S.resultReady=false;
  S.elapsed=0;
  S.estimated=20;
  S.phase='Connecting to Ruflo backend';
  S.activity.unshift('Connecting to live Ruflo OpenAI backend');
  runAgent('Orchestrator','connecting');
  render();

  const started=Date.now();
  const tick=setInterval(()=>{
    if(!S.running){clearInterval(tick);return;}
    S.elapsed=Math.min(60,Math.floor((Date.now()-started)/1000));
    S.progress=Math.min(92,8+Math.floor(S.elapsed/20*70));
    if(S.elapsed>2) S.phase='Generating with OpenAI';
    if(S.elapsed>5) runAgent('Builder','generating with OpenAI');
    render();
  },1000);

  try{
    const prompt =
      'You are the AI builder inside Ruflo. The user asked: '+S.goal+'\\n\\n'+
      'Analyze the request and produce a concise build specification with: app type, core features, UI screens, data/state needs, API requirements, security considerations, testing checklist, and implementation plan. If code is appropriate, include the most important code structure or snippets. Do not claim files were created or deployed unless the system actually did so.';

    const res=await fetch(RUFLO_BACKEND_URL+'/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({input:prompt,model:'gpt-5.6-mini'})
    });

    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||('Backend request failed ('+res.status+')'));
    if(!data.output) throw new Error('Backend returned no AI output.');

    clearInterval(tick);
    Object.keys(S.agentState).forEach(k=>{if(S.agentState[k]==='working'||S.agentState[k]==='connecting'||S.agentState[k]==='generating with OpenAI')S.agentState[k]='completed';});
    S.running=false;
    S.progress=100;
    S.elapsed=Math.max(1,Math.floor((Date.now()-started)/1000));
    S.phase='Complete';
    S.resultReady=true;
    S.aiOutput=String(data.output);
    S.aiResponseId=data.id||'';
    S.result='OpenAI backend connected and returned an AI build analysis.';
    S.activity.unshift('OpenAI response received from live Ruflo backend');
    S.activity.unshift('Live backend test passed');
    buildHistory=[S.goal,...buildHistory.filter(x=>x!==S.goal)].slice(0,8);
    saveWorkspace();
    render();
    setTimeout(()=>{S.view='result';render();},200);
    toast('Ruflo AI backend connected successfully');
  }catch(err){
    clearInterval(tick);
    S.running=false;
    S.phase='Connection error';
    S.progress=0;
    S.resultReady=false;
    S.result='';
    S.activity.unshift('Backend connection failed: '+err.message);
    render();
    toast('Backend error: '+err.message);
  }
}

const originalResultPage = window.resultPage;
function resultPage(){
  if(S.resultReady && S.aiOutput){
    return '<section class="card resultPage"><div class="section"><div><div class="eyebrow">Live AI build result</div><h2>'+escapeHtml(detectBuilder(S.goal))+'</h2></div><span class="badge done">OpenAI connected</span></div>'+
      '<div class="runTiming done"><span>✓ Backend response received</span><span>Live Ruflo backend</span></div>'+
      '<div class="blueprint"><b>AI build analysis</b><div class="aiOutput">'+escapeHtml(S.aiOutput).replace(/\\n/g,'<br>')+'</div></div>'+
      '<button class="secondary" onclick="setView(\'dashboard\')">← Back to builder</button></section>';
  }
  return originalResultPage ? originalResultPage() : '<div class="card"><h2>No build result yet</h2></div>';
}

const originalConnections = window.connections;
function connections(){
  const base=originalConnections ? originalConnections() : '';
  return base+'<section class="card"><div class="section"><div><div class="eyebrow">Live backend</div><h2>Ruflo OpenAI Backend</h2><p class="muted">Frontend requests are routed through the secure Render backend. The OpenAI secret is not placed in this browser code.</p></div><span class="badge done">Configured</span></div><p class="muted">Endpoint: '+RUFLO_BACKEND_URL+'</p><button class="secondary" onclick="testRufloBackend()">Test backend</button><p id="backendTest" class="muted"></p></section>';
}
async function testRufloBackend(){
  const out=document.getElementById('backendTest');
  if(out)out.textContent='Testing backend…';
  try{
    const r=await fetch(RUFLO_BACKEND_URL+'/health');
    const d=await r.json();
    if(out)out.textContent=d.ok?'Backend is live. OpenAI key configured: '+(d.openaiConfigured?'yes':'no'): 'Backend responded but is not healthy.';
  }catch(e){
    if(out)out.textContent='Backend test failed: '+e.message;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  if(typeof S!=='undefined'){
    S.aiOutput=S.aiOutput||'';
    S.aiResponseId=S.aiResponseId||'';
  }
});