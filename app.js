const S={
  view:'dashboard',
  running:false,
  progress:0,
  goal:'',
  currentStep:-1,
  result:'',
  agents:[
    ['Planner','Goal decomposition'],
    ['Research','Evidence gathering'],
    ['Builder','Implementation'],
    ['Tester','Quality checks'],
    ['Reviewer','Final review'],
    ['DevOps','Deployment']
  ],
  activity:['Workspace initialized','Agent registry loaded','Ready for a new goal']
};

const steps=[
  ['Understand the goal','Goal parsing and constraints'],
  ['Create an execution plan','Break work into executable tasks'],
  ['Coordinate specialist agents','Assign work to specialists'],
  ['Run checks and review','Validate output and quality'],
  ['Prepare the result','Package the result']
];

function nav(id,label){
  return '<button class="'+(S.view===id?'active':'')+'" onclick="setView(\''+id+'\')">'+label+'</button>';
}

function render(){
  const v=S.view;
  const title={dashboard:'Build with an AI team',agents:'Agent control center',activity:'Execution activity',settings:'Workspace settings'}[v];
  const body=v==='agents'?agents():v==='activity'?activity():v==='settings'?settings():dashboard();
  document.getElementById('app').innerHTML=
    '<div class="shell"><aside class="side"><div class="brand"><span class="logo">R</span> Ruflo</div><nav class="nav">'+
    nav('dashboard','⌂ Dashboard')+nav('agents','◈ Agents')+nav('activity','◌ Activity')+nav('settings','⚙ Settings')+
    '</nav></aside><main class="main"><header class="top"><div><div class="eyebrow">AI orchestration workspace</div><h1 class="title">'+title+'</h1></div>'+
    '<div class="status"><i class="dot"></i>'+(S.running?'Workflow running':'System ready')+'</div></header>'+body+
    '</main><nav class="mobile">'+nav('dashboard','Home')+nav('agents','Agents')+nav('activity','Activity')+nav('settings','Settings')+'</nav></div>';
}

function dashboard(){
  const plan=steps.map((x,i)=>{
    const state=S.currentStep===i?'working':(S.currentStep>i?'done':'');
    return '<div class="step '+state+'"><span class="num">'+(state==='done'?'✓':(i+1))+'</span><div><b>'+x[0]+'</b><br><small class="muted">'+x[1]+'</small></div><span class="stepstate">'+(state==='working'?'Running':state==='done'?'Done':'Pending')+'</span></div>';
  }).join('');
  const goalText=S.goal.toLowerCase();
  const result=S.result?(goalText.includes('snake')?snakeGame():(goalText.includes('calculator')?calculator():'<div class="card result"><div class="section"><h2>Workflow result</h2><span class="badge done">completed</span></div><p>'+S.result+'</p><small class="muted">Browser demo result. Real AI execution requires a connected Ruflo backend/API.</small></div>')):'';
  return '<section class="quick card"><div><h2>Try a ready-made app</h2><p class="muted">No goal needed. Launch a working calculator now.</p></div><button class="primary" onclick="launchDemo()">🚀 Launch calculator</button></section><section class="grid"><div class="card metric"><b>'+S.agents.length+'</b><span>Agents available</span></div>'+
    '<div class="card metric"><b>'+(S.running?1:0)+'</b><span>Active runs</span></div>'+
    '<div class="card metric"><b>'+S.progress+'%</b><span>Progress</span></div>'+
    '<div class="card metric"><b>'+(S.result?'Done':S.running?'Running':'Ready')+'</b><span>Workspace</span></div></section>'+
    '<section class="layout"><div class="card"><div class="section"><h2>What do you want to build?</h2><span class="muted">Plain English</span></div>'+
    '<textarea id="goal" placeholder="Example: Build a healthcare app with login, appointments and a secure API.">'+escapeHtml(S.goal)+'</textarea>'+
    '<div class="actions"><button class="primary" onclick="start()">'+(S.running?'⏳ Workflow running…':'▶ Start AI workflow')+'</button>'+
    '<button class="secondary" onclick="clearGoal()">Clear</button></div><div class="bar"><i style="width:'+S.progress+'%"></i></div></div>'+
    '<div class="card"><div class="section"><h2>Execution plan</h2><span class="muted">'+(S.running?'Running':'Ready')+'</span></div><div class="plan">'+plan+'</div></div></section>'+result;
}

function agents(){
  return '<div class="card"><div class="section"><h2>Agent team</h2><button class="secondary" onclick="start()">▶ Run workflow</button></div>'+
    S.agents.map((a,i)=>'<div class="agent"><div class="avatar">◈</div><div><b>'+a[0]+'</b><br><small class="muted">'+a[1]+'</small></div><span class="badge '+(S.running&&S.currentStep===Math.min(i,4)?'working':'idle')+'">'+(S.running&&S.currentStep===Math.min(i,4)?'working':'idle')+'</span></div>').join('')+
    '</div>';
}

function activity(){
  return '<div class="card"><div class="section"><h2>Live activity</h2><span class="muted">Latest first</span></div><div class="activity">'+
    S.activity.map((x,i)=>'<div><b>'+escapeHtml(x)+'</b><br><small class="muted">'+(i?'Earlier':'Now')+'</small></div>').join('')+
    '</div></div>';
}

function settings(){
  return '<div class="card"><div class="section"><h2>Workspace settings</h2></div>'+
    '<p class="muted">The current GitHub Pages version is a browser control surface. It can animate and manage the workflow UI, but it cannot run Ruflo server-side AI agents by itself.</p>'+
    '<button class="secondary" onclick="toast(\'Preferences saved locally\')">Save preferences</button></div>';
}

function setView(v){S.view=v;render();}

function launchDemo(){
  S.goal='Build a simple calculator with +, −, × and ÷ buttons.';
  S.progress=100;
  S.running=false;
  S.currentStep=5;
  S.result='Calculator generated and ready to use.';
  S.activity.unshift('Demo app launched: working calculator');
  render();
}
function clearGoal(){
  S.goal='';S.progress=0;S.running=false;S.currentStep=-1;S.result='';
  render();
}

function start(){
  const e=document.getElementById('goal');
  if(e)S.goal=e.value.trim();
  if(!S.goal){toast('Enter a goal first');return;}
  if(S.running){return;}
  S.running=true;S.progress=2;S.currentStep=0;S.result='';
  S.activity.unshift('Workflow started: '+S.goal.slice(0,80));
  render();

  let step=0;
  const timer=setInterval(()=>{
    step++;
    S.currentStep=step;
    S.progress=Math.min(20+step*20,100);
    S.activity.unshift('Step '+Math.min(step+1,5)+': '+(steps[Math.min(step,4)][0]));
    render();
    if(step>=5){
      clearInterval(timer);
      S.running=false;
      S.currentStep=5;
      S.progress=100;
      S.result='Goal received successfully: “'+S.goal+'”. The workflow plan has been prepared and the six specialist roles are ready for backend execution.';
      S.activity.unshift('Workflow completed: result prepared');
      render();
      toast('Workflow completed');
    }
  },1100);
}

let snakeTimer=null;
let snakeState={body:[[5,5],[4,5],[3,5]],dir:[1,0],food:[9,9],score:0,running:false};
function snakeGame(){
  return '<div class="card result"><div class="section"><h2>Built Snake Game</h2><span class="badge done">working</span></div>'+
  '<div class="snakeWrap"><div class="snakeScore">Score: <b id="snakeScore">0</b></div><div id="snakeBoard" class="snakeBoard"></div>'+
  '<button class="primary" onclick="startSnake()">▶ Start Snake</button>'+
  '<div class="snakeControls"><button onclick="snakeDir(0,-1)">↑</button><div><button onclick="snakeDir(-1,0)">←</button><button onclick="snakeDir(0,1)">↓</button><button onclick="snakeDir(1,0)">→</button></div></div></div>'+
  '<p class="muted">A playable Snake game generated from the goal.</p></div>';
}
function drawSnake(){
  const b=document.getElementById('snakeBoard'); if(!b)return;
  b.innerHTML='';
  for(let y=0;y<15;y++)for(let x=0;x<15;x++){
    const cell=document.createElement('span'); cell.className='snakeCell';
    if(snakeState.body.some(p=>p[0]===x&&p[1]===y))cell.classList.add('snakeBody');
    if(snakeState.food[0]===x&&snakeState.food[1]===y)cell.classList.add('snakeFood');
    b.appendChild(cell);
  }
  const sc=document.getElementById('snakeScore'); if(sc)sc.textContent=snakeState.score;
}
function startSnake(){
  clearInterval(snakeTimer);
  snakeState={body:[[5,5],[4,5],[3,5]],dir:[1,0],food:[9,9],score:0,running:true};
  drawSnake();
  snakeTimer=setInterval(stepSnake,180);
}
function snakeDir(x,y){
  if(x===-snakeState.dir[0]&&y===-snakeState.dir[1])return;
  snakeState.dir=[x,y];
}
function stepSnake(){
  if(!snakeState.running)return;
  const h=snakeState.body[0], n=[h[0]+snakeState.dir[0],h[1]+snakeState.dir[1]];
  if(n[0]<0||n[0]>=15||n[1]<0||n[1]>=15||snakeState.body.some(p=>p[0]===n[0]&&p[1]===n[1])){
    snakeState.running=false;clearInterval(snakeTimer);toast('Game over — press Start Snake');return;
  }
  snakeState.body.unshift(n);
  if(n[0]===snakeState.food[0]&&n[1]===snakeState.food[1]){
    snakeState.score++;
    do{snakeState.food=[Math.floor(Math.random()*15),Math.floor(Math.random()*15)]}
    while(snakeState.body.some(p=>p[0]===snakeState.food[0]&&p[1]===snakeState.food[1]));
  }else snakeState.body.pop();
  drawSnake();
}
function calculator(){
  return '<div class="card result"><div class="section"><h2>Built calculator</h2><span class="badge done">working</span></div>'+
  '<div class="calc"><input id="calcDisplay" value="0" readonly>'+
  '<div class="calcgrid">'+
  ['7','8','9','÷','4','5','6','×','1','2','3','−','C','0','.','+','='].map(k=>'<button class="calcbtn" onclick="calcKey(\''+k+'\')">'+k+'</button>').join('')+
  '</div></div><p class="muted">This is an actual working calculator created inside the workflow result.</p></div>';
}
let calcValue='';
let calcOp=null;
let calcFirst=null;
function calcKey(k){
  const d=document.getElementById('calcDisplay');
  if(!d)return;
  if(k==='C'){calcValue='';calcOp=null;calcFirst=null;d.value='0';return;}
  if('0123456789.'.includes(k)){if(k==='.'&&calcValue.includes('.'))return;calcValue+=k;d.value=calcValue||'0';return;}
  if(['+','−','×','÷'].includes(k)){calcFirst=Number(calcValue||d.value||0);calcOp=k;calcValue='';return;}
  if(k==='='&&calcOp){const b=Number(calcValue||0);let r=calcOp==='+'?calcFirst+b:calcOp==='−'?calcFirst-b:calcOp==='×'?calcFirst*b:calcFirst/b;d.value=String(r);calcValue=String(r);calcOp=null;calcFirst=null;}
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function toast(m){
  const d=document.createElement('div');
  d.className='toast';d.textContent=m;document.body.appendChild(d);
  setTimeout(()=>d.remove(),2200);
}

render();