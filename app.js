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
  const result=S.result?buildFromGoal(goalText):'';
  return '<section class="quick card"><div><h2>Universal App Builder</h2><p class="muted">Write what you want in plain English. Ruflo selects a working app builder or creates a build blueprint.</p></div><button class="primary" onclick="launchDemo()">🚀 Try Snake Demo</button></section><section class="grid"><div class="card metric"><b>'+S.agents.length+'</b><span>Agents available</span></div>'+
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
    '<p class="muted">This frontend accepts plain-English build requests. Common mini-apps are rendered as working browser demos; arbitrary app generation needs a connected Ruflo backend/API.</p>'+
    '<button class="secondary" onclick="toast(\'Preferences saved locally\')">Save preferences</button></div>';
}

function setView(v){S.view=v;render();}

function launchDemo(){
  S.goal='Build a playable Snake game with score and touch controls.';
  S.progress=100;
  S.running=false;
  S.currentStep=5;
  S.result='Snake game generated and ready to play.';
  S.activity.unshift('Demo app launched: working Snake game');
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
function buildFromGoal(goalText){
  const g=goalText||'';
  if(g.includes('snake'))return snakeGame();
  if(g.includes('calculator')||g.includes('calc'))return calculator();
  if(g.includes('todo')||g.includes('to-do')||g.includes('task list'))return todoGame();
  if(g.includes('timer')||g.includes('stopwatch')||g.includes('countdown'))return timerGame();
  if(g.includes('quiz')||g.includes('question'))return quizGame();
  if(g.includes('counter')||g.includes('count'))return counterGame();
  if(g.includes('notes')||g.includes('note app'))return notesGame();
  if(g.includes('landing page')||g.includes('portfolio')||g.includes('website'))return landingGame();
  return genericApp(g);
}

function todoGame(){
  return '<div class="card result"><div class="section"><h2>Built To-do App</h2><span class="badge done">working</span></div><div class="todo"><div class="todoAdd"><input id="todoInput" placeholder="Add a task…"><button class="primary" onclick="addTodo()">Add</button></div><div id="todoList" class="todoList"></div></div><p class="muted">Working local task list with add and complete actions.</p></div>';
}
let todos=[];
function addTodo(){
  const i=document.getElementById('todoInput'); if(!i||!i.value.trim())return;
  todos.push({text:i.value.trim(),done:false}); i.value=''; drawTodos();
}
function toggleTodo(i){todos[i].done=!todos[i].done;drawTodos();}
function drawTodos(){
  const l=document.getElementById('todoList'); if(!l)return;
  l.innerHTML=todos.length?todos.map((t,i)=>'<button class="todoItem '+(t.done?'done':'')+'" onclick="toggleTodo('+i+')"><span>'+(t.done?'✓':'○')+'</span>'+escapeHtml(t.text)+'</button>').join(''):'<span class="muted">No tasks yet.</span>';
}

function timerGame(){
  return '<div class="card result"><div class="section"><h2>Built Timer</h2><span class="badge done">working</span></div><div class="timer"><div id="timerDisplay">00:30</div><div class="actions"><button class="primary" onclick="startTimer()">▶ Start</button><button class="secondary" onclick="resetTimer()">Reset</button></div></div><p class="muted">A working 30-second countdown timer.</p></div>';
}
let timerId=null,timerSeconds=30;
function drawTimer(){const d=document.getElementById('timerDisplay');if(d)d.textContent=String(Math.floor(timerSeconds/60)).padStart(2,'0')+':'+String(timerSeconds%60).padStart(2,'0');}
function startTimer(){clearInterval(timerId);timerId=setInterval(()=>{if(timerSeconds<=0){clearInterval(timerId);toast('Timer finished');return}timerSeconds--;drawTimer()},1000);}
function resetTimer(){clearInterval(timerId);timerSeconds=30;drawTimer();}

function counterGame(){
  return '<div class="card result"><div class="section"><h2>Built Counter</h2><span class="badge done">working</span></div><div class="counter"><b id="counterValue">0</b><div class="actions"><button class="secondary" onclick="changeCounter(-1)">−</button><button class="primary" onclick="changeCounter(1)">+</button><button class="secondary" onclick="changeCounter(0)">Reset</button></div></div><p class="muted">Interactive counter with reset.</p></div>';
}
let counterValue=0;
function changeCounter(n){counterValue=n===0?0:counterValue+n;const d=document.getElementById('counterValue');if(d)d.textContent=counterValue;}

function notesGame(){
  return '<div class="card result"><div class="section"><h2>Built Notes App</h2><span class="badge done">working</span></div><textarea id="notesBox" class="notesBox" placeholder="Write your notes here…"></textarea><div class="actions"><button class="primary" onclick="saveNotes()">Save note</button><button class="secondary" onclick="clearNotes()">Clear</button></div><p id="notesStatus" class="muted">Saved locally in this browser.</p></div>';
}
function saveNotes(){const n=document.getElementById('notesBox');if(n){localStorage.setItem('ruflo_note',n.value);const s=document.getElementById('notesStatus');if(s)s.textContent='Note saved locally.';}}
function clearNotes(){const n=document.getElementById('notesBox');if(n)n.value='';localStorage.removeItem('ruflo_note');}

function quizGame(){
  return '<div class="card result"><div class="section"><h2>Built Quiz App</h2><span class="badge done">working</span></div><div class="quiz"><p><b>Which language runs directly in the browser?</b></p><button class="secondary quizOption" onclick="quizAnswer(this,false)">Python</button><button class="secondary quizOption" onclick="quizAnswer(this,true)">JavaScript</button><button class="secondary quizOption" onclick="quizAnswer(this,false)">C++</button><p id="quizResult" class="muted"></p></div><p class="muted">Interactive quiz with instant feedback.</p></div>';
}
function quizAnswer(btn,ok){document.querySelectorAll('.quizOption').forEach(b=>b.disabled=true);const r=document.getElementById('quizResult');if(r)r.textContent=ok?'Correct ✓':'Not quite — try the next question.';}

function landingGame(){
  return '<div class="card result"><div class="section"><h2>Built Website Starter</h2><span class="badge done">working</span></div><div class="landingPreview"><div class="landingHero"><span class="eyebrow">Generated from your goal</span><h2>'+escapeHtml(S.goal)+'</h2><p class="muted">A responsive starter layout with hero, feature cards and call-to-action.</p><button class="primary" onclick="toast(\'CTA clicked\')">Get started</button></div><div class="landingCards"><div>Fast</div><div>Responsive</div><div>Modern</div></div></div></div>';
}

function genericApp(goal){
  return '<div class="card result"><div class="section"><h2>App blueprint created</h2><span class="badge done">ready</span></div><div class="blueprint"><div><b>Goal</b><p>'+escapeHtml(S.goal)+'</p></div><div><b>Generated structure</b><p>Responsive interface • user actions • data state • validation • mobile controls</p></div><div><b>Next build layer</b><p>Connect a Ruflo backend/API to turn this browser preview into real AI-generated code for any app request.</p></div></div></div>';
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