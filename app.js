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
  activity:['Workspace initialized','Agent registry loaded','Ready for a new goal'],
  elapsed:0,
  estimated:6,
  phase:'Ready',
  resultReady:false
};

const steps=[
  ['Understand the goal','Goal parsing and constraints'],
  ['Create an execution plan','Break work into executable tasks'],
  ['Coordinate specialist agents','Assign work to specialists'],
  ['Run checks and review','Validate output and quality'],
  ['Prepare the result','Package the result']
];

let buildHistory=[];
function saveWorkspace(){
  try{localStorage.setItem('ruflo_workspace',JSON.stringify({goal:S.goal,activity:S.activity.slice(0,30),history:buildHistory.slice(0,8)}));}catch(e){}
}
function loadWorkspace(){
  try{
    const x=JSON.parse(localStorage.getItem('ruflo_workspace')||'{}');
    if(x.goal)S.goal=x.goal;
    if(Array.isArray(x.activity)&&x.activity.length)S.activity=x.activity;
    if(Array.isArray(x.history))buildHistory=x.history;
  }catch(e){}
}
function focusBuilder(){const e=document.getElementById('goal');if(e){e.focus();e.scrollIntoView({behavior:'smooth',block:'center'});}}
function goalChanged(value){const next=String(value||'').trim();if(next!==S.goal){S.goal=next;if(S.result){S.result='';S.progress=0;S.currentStep=-1;}S.resultReady=false;S.phase='Ready';S.running=false;}}
function usePreset(goal){
  S.goal=goal;S.result='';S.progress=0;S.currentStep=-1;
  saveWorkspace();render();
  setTimeout(()=>{const e=document.getElementById('goal');if(e){e.focus();e.scrollIntoView({behavior:'smooth',block:'center'});}},50);
}
function detectBuilder(goal){
  const g=(goal||'').toLowerCase();
  if(g.includes('snake'))return 'Snake Game';
  if(g.includes('temple')||g.includes('tample')||g.includes('runner'))return 'Temple Run / Runner';
  if(g.includes('racing')||g.includes('car race'))return 'Racing Game';
  if(g.includes('calculator')||g.includes('calc'))return 'Calculator';
  if(g.includes('todo')||g.includes('to-do')||g.includes('task list'))return 'To-do App';
  if(g.includes('timer')||g.includes('stopwatch')||g.includes('countdown'))return 'Timer';
  if(g.includes('quiz')||g.includes('question'))return 'Quiz';
  if(g.includes('notes')||g.includes('note app'))return 'Notes App';
  if(g.includes('website')||g.includes('portfolio')||g.includes('landing page'))return 'Website Starter';
  if(g.includes('game'))return 'Game Prototype';
  return 'App Blueprint';
}

function nav(id,label){
  return '<button class="'+(S.view===id?'active':'')+'" onclick="setView(\''+id+'\')">'+label+'</button>';
}

function render(){
  const v=S.view;
  const title={dashboard:'Build with an AI team',agents:'Agent control center',activity:'Execution activity',settings:'Workspace settings',result:'Build result'}[v]||'Build with an AI team';
  const body=v==='agents'?agents():v==='activity'?activity():v==='settings'?settings():v==='result'?resultPage():dashboard();
  document.getElementById('app').innerHTML=
    '<div class="shell"><aside class="side"><div class="brand"><span class="logo">R</span> Ruflo</div><nav class="nav">'+
    nav('dashboard','⌂ Dashboard')+nav('agents','◈ Agents')+nav('activity','◌ Activity')+nav('settings','⚙ Settings')+(S.resultReady?nav('result','✓ Result'):'')+
    '</nav></aside><main class="main"><header class="top"><div><div class="eyebrow">AI orchestration workspace</div><h1 class="title">'+title+'</h1></div>'+
    '<div class="status"><i class="dot"></i>'+(S.running?'Workflow running':'System ready')+'</div></header>'+body+
    '</main><nav class="mobile">'+nav('dashboard','Home')+nav('agents','Agents')+nav('activity','Activity')+nav('settings','Settings')+(S.resultReady?nav('result','Result'):'')+'</nav></div>';
  // Paint the Snake board after its container is inserted into the DOM.
  if(S.result){ const g=S.goal.toLowerCase(); if(g.includes('snake')) drawSnake(); if(g.includes('temple')||g.includes('tample')||g.includes('runner')) drawTempleRun(); if(g.includes('racing')||g.includes('car race')||g.includes('racing game')) drawRacing(); if(g.includes(' game')) drawGenericGame(); }
}

function dashboard(){
  const plan=steps.map((x,i)=>{
    const state=S.currentStep===i?'working':(S.currentStep>i?'done':'');
    return '<div class="step '+state+'"><span class="num">'+(state==='done'?'✓':(i+1))+'</span><div><b>'+x[0]+'</b><br><small class="muted">'+x[1]+'</small></div><span class="stepstate">'+(state==='working'?'Running':state==='done'?'Done':'Pending')+'</span></div>';
  }).join('');
  const goalText=S.goal.toLowerCase();
  const result=S.result?buildFromGoal(goalText):'';
  const remaining=Math.max(0,S.estimated-S.elapsed);
  const timing=S.running?'<div class="runTiming"><span>⏱ '+S.elapsed+'s elapsed</span><span>~'+remaining+'s remaining</span></div>':(S.result?'<div class="runTiming done"><span>✓ Completed in '+S.elapsed+'s</span><span>Build result is ready</span></div>':'<div class="runTiming"><span>⏱ Estimated ~'+S.estimated+'s</span><span>5 build steps</span></div>');
  return '<section class="quick card"><div><h2>Universal App Builder</h2><p class="muted">Describe the app or game in plain English. The builder detects the request and opens the matching working prototype.</p></div><button class="primary" onclick="focusBuilder()">✨ New Build</button></section>'+
    '<section class="card presets"><div class="section"><h2>Quick start</h2><span class="muted">Tap a template or write your own</span></div><div class="presetGrid">'+
    '<button onclick="usePreset(\'Build a playable Snake game with score and touch controls.\')">🐍 Snake</button>'+
    '<button onclick="usePreset(\'Build a Temple Run game with obstacles and touch controls.\')">🏃 Temple Run</button>'+
    '<button onclick="usePreset(\'Build a mobile racing game with speed and nitro.\')">🏎️ Racing</button>'+
    '<button onclick="usePreset(\'Build a calculator app.\')">🧮 Calculator</button>'+
    '<button onclick="usePreset(\'Build a to-do task list app.\')">✅ To-do</button>'+
    '<button onclick="usePreset(\'Build a countdown timer.\')">⏱️ Timer</button>'+
    '<button onclick="usePreset(\'Build a quiz app.\')">❓ Quiz</button>'+
    '<button onclick="usePreset(\'Build a notes app.\')">📝 Notes</button>'+
    '</div></section><section class="grid"><div class="card metric"><b>'+S.agents.length+'</b><span>Agents available</span></div>'+
    '<div class="card metric"><b>'+(S.running?1:0)+'</b><span>Active runs</span></div>'+
    '<div class="card metric"><b>'+S.progress+'%</b><span>Progress</span></div>'+
    '<div class="card metric"><b>'+(S.result?'Done':S.running?'Running':'Ready')+'</b><span>Workspace</span></div></section>'+
    '<section class="layout"><div class="card"><div class="section"><h2>What do you want to build?</h2><span class="muted">Plain English</span></div>'+
    '<textarea id="goal" oninput="goalChanged(this.value)" placeholder="Example: Build a healthcare app with login, appointments and a secure API.">'+escapeHtml(S.goal)+'</textarea>'+
    '<div class="actions"><button class="primary" onclick="start()">'+(S.running?'⏳ Workflow running…':'▶ Start AI workflow')+'</button>'+
    '<button class="secondary" onclick="clearGoal()">Clear</button></div><div class="bar"><i style="width:'+S.progress+'%"></i></div>'+timing+'</div>'+
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
  buildHistory.unshift(S.goal);saveWorkspace();render();
}
function clearGoal(){
  S.goal='';S.progress=0;S.running=false;S.currentStep=-1;S.result='';S.resultReady=false;S.phase='Ready';
  saveWorkspace();render();
}

function start(){
  const e=document.getElementById('goal');
  if(e)S.goal=e.value.trim();
  if(!S.goal){toast('Enter a goal first');return;}
  buildHistory=[S.goal,...buildHistory.filter(x=>x!==S.goal)].slice(0,8);
  saveWorkspace();
  if(S.running){return;}
  S.running=true;S.progress=2;S.currentStep=0;S.result='';S.resultReady=false;S.elapsed=0;S.estimated=6;S.phase='Analyzing request';
  S.activity.unshift('Building: '+detectBuilder(S.goal)+' — '+S.goal.slice(0,70));
  render();

  let step=0;
  const timer=setInterval(()=>{
    step++;S.elapsed=Math.min(step,6);
    S.currentStep=step;
    S.progress=Math.min(20+step*20,100);
    S.phase=['Analyzing request','Planning build','Generating app','Testing output','Preparing result','Complete'][Math.min(step,5)];
    S.activity.unshift('Step '+Math.min(step+1,5)+': '+(steps[Math.min(step,4)][0]));
    render();
    if(step>=5){
      clearInterval(timer);
      S.running=false;
      S.currentStep=5;
      S.progress=100;
      S.elapsed=6;
      S.result='Goal received successfully: “'+S.goal+'”. The requested '+detectBuilder(S.goal)+' preview has been generated and is ready to run.';
      S.resultReady=true;
      S.phase='Complete';
      S.activity.unshift('Build completed: '+detectBuilder(S.goal));
      saveWorkspace();
      render();
      setTimeout(()=>{const r=document.querySelector('.result');if(r)r.scrollIntoView({behavior:'smooth',block:'start'});},80);
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
let runnerTimer=null;
let runnerState={lane:1,score:0,running:false,obstacles:[]};
function templeRunGame(){
  return '<div class="card result"><div class="section"><h2>Built Temple Run Game</h2><span class="badge done">working</span></div><div class="runnerWrap"><div class="runnerHud">Distance: <b id="runnerScore">0</b></div><div id="runnerTrack" class="runnerTrack"><div class="runnerPlayer" id="runnerPlayer">🏃</div></div><button class="primary" onclick="startTempleRun()">▶ Start Temple Run</button><div class="gameControls"><button onclick="runnerMove(-1)">←</button><button onclick="runnerJump()">⬆</button><button onclick="runnerMove(1)">→</button></div></div><p class="muted">Playable endless-runner preview based on your Temple Run request.</p></div>';
}
function drawTempleRun(){
  const t=document.getElementById('runnerTrack'); if(!t)return;
  t.innerHTML='<div class="runnerRoad"></div><div class="runnerPlayer" id="runnerPlayer">🏃</div>'+runnerState.obstacles.map((o,i)=>'<div class="runnerObstacle" style="left:'+((o.lane*33.333)+4)+'%;top:'+o.y+'px" data-i="'+i+'">🪨</div>').join('');
  const p=document.getElementById('runnerPlayer'); if(p)p.style.left=(runnerState.lane*33.333+4)+'%';
  const s=document.getElementById('runnerScore'); if(s)s.textContent=runnerState.score;
}
function startTempleRun(){
  clearInterval(runnerTimer); runnerState={lane:1,score:0,running:true,obstacles:[]}; drawTempleRun();
  runnerTimer=setInterval(()=>{
    runnerState.score++;
    runnerState.obstacles=runnerState.obstacles.map(o=>({...o,y:o.y+9})).filter(o=>o.y<330);
    if(Math.random()<.18)runnerState.obstacles.push({lane:Math.floor(Math.random()*3),y:-30});
    if(runnerState.obstacles.some(o=>o.lane===runnerState.lane&&o.y>260)){clearInterval(runnerTimer);runnerState.running=false;toast('Obstacle hit — press Start Temple Run');}
    drawTempleRun();
  },120);
}
function runnerMove(n){if(!runnerState.running)return;runnerState.lane=Math.max(0,Math.min(2,runnerState.lane+n));drawTempleRun();}
function runnerJump(){if(!runnerState.running)return;toast('Jump!');}
function racingGame(){
  return '<div class="card result"><div class="section"><h2>Built Racing Game</h2><span class="badge done">working</span></div><div class="racingWrap"><div class="racingHud">Speed: <b id="raceSpeed">0</b> km/h</div><div id="raceTrack" class="raceTrack"><div class="raceCar" id="raceCar">🏎️</div></div><button class="primary" onclick="startRacing()">▶ Start Race</button><div class="gameControls"><button onclick="raceMove(-1)">←</button><button onclick="raceBoost()">⚡</button><button onclick="raceMove(1)">→</button></div></div><p class="muted">Playable mobile racing preview based on your request.</p></div>';
}
let raceTimer=null,raceState={lane:1,speed:0};
function drawRacing(){const t=document.getElementById('raceTrack');if(!t)return;t.innerHTML='<div class="raceRoad"></div><div class="raceCar" id="raceCar">🏎️</div>';const c=document.getElementById('raceCar');if(c)c.style.left=(raceState.lane*33.333+4)+'%';const s=document.getElementById('raceSpeed');if(s)s.textContent=raceState.speed;}
function startRacing(){clearInterval(raceTimer);raceState={lane:1,speed:40};drawRacing();raceTimer=setInterval(()=>{raceState.speed=Math.min(220,raceState.speed+2);drawRacing()},250);}
function raceMove(n){raceState.lane=Math.max(0,Math.min(2,raceState.lane+n));drawRacing();}
function raceBoost(){raceState.speed=Math.min(300,raceState.speed+25);drawRacing();toast('Nitro boost!');}
function genericGame(goal){
  return '<div class="card result"><div class="section"><h2>Built Game Preview</h2><span class="badge done">working</span></div><div class="genericGame"><div class="genericGameTitle">'+escapeHtml(goal)+'</div><div id="genericGameBoard" class="genericGameBoard"><div id="genericPlayer" class="genericPlayer">🎮</div><div id="genericObstacle" class="genericObstacle">🧱</div></div><button class="primary" onclick="startGenericGame()">▶ Start Game</button><div class="gameControls"><button onclick="genericMove(-1)">←</button><button onclick="genericJump()">⬆</button><button onclick="genericMove(1)">→</button></div></div><p class="muted">A playable browser prototype generated from the game request. A real backend is required for full AI-generated game code.</p></div>';
}
let genericTimer=null,genericPos=50,genericScore=0;
function drawGenericGame(){const p=document.getElementById('genericPlayer');if(p)p.style.left=genericPos+'%';const o=document.getElementById('genericObstacle');if(o)o.style.left=((genericScore*7)%80+10)+'%';}
function startGenericGame(){clearInterval(genericTimer);genericScore=0;genericPos=50;drawGenericGame();genericTimer=setInterval(()=>{genericScore++;if(Math.abs(genericPos-(((genericScore*7)%80)+10))<7){clearInterval(genericTimer);toast('Collision — press Start Game');}drawGenericGame()},220);}
function genericMove(n){genericPos=Math.max(8,Math.min(92,genericPos+n*8));drawGenericGame();}
function genericJump(){toast('Jump!');}

function resultPage(){
  if(!S.resultReady) return '<div class="card"><h2>No build result yet</h2><p class="muted">Run a build first.</p><button class="primary" onclick="setView(\'dashboard\')">Back to builder</button></div>';
  return '<section class="card resultPage"><div class="section"><div><div class="eyebrow">Build completed</div><h2>'+escapeHtml(detectBuilder(S.goal))+'</h2></div><span class="badge done">Ready to run</span></div><div class="runTiming done"><span>✓ Completed in '+S.elapsed+'s</span><span>Request matched</span></div><div class="resultBody">'+buildFromGoal(S.goal.toLowerCase())+'</div><button class="secondary" onclick="setView(\'dashboard\')">← Back to builder</button></section>';
}

function buildFromGoal(goalText){
  const g=goalText||'';
  if(g.includes('snake'))return snakeGame();
  if(g.includes('temple')||g.includes('tample')||g.includes('runner'))return templeRunGame();
  if(g.includes('racing')||g.includes('car race')||g.includes('racing game'))return racingGame();
  if(g.includes('calculator')||g.includes('calc'))return calculator();
  if(g.includes('todo')||g.includes('to-do')||g.includes('task list'))return todoGame();
  if(g.includes('timer')||g.includes('stopwatch')||g.includes('countdown'))return timerGame();
  if(g.includes('quiz')||g.includes('question'))return quizGame();
  if(g.includes('counter')||g.includes('count'))return counterGame();
  if(g.includes('notes')||g.includes('note app'))return notesGame();
  if(g.includes('landing page')||g.includes('portfolio')||g.includes('website'))return landingGame();
  if(g.includes(' game')||g.endsWith('game'))return genericGame(g);
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

document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='escape'&&S.running){toast('Workflow is running');return;}
  if(['arrowup','arrowdown','arrowleft','arrowright'].includes(k)){
    const dx=k==='arrowleft'?-1:k==='arrowright'?1:0,dy=k==='arrowup'?-1:k==='arrowdown'?1:0;
    if(S.goal.toLowerCase().includes('snake'))snakeDir(dx,dy);
    else if(S.goal.toLowerCase().includes('temple')||S.goal.toLowerCase().includes('tample')||S.goal.toLowerCase().includes('runner')){if(dx)runnerMove(dx);}
    else if(S.goal.toLowerCase().includes('racing')){if(dx)raceMove(dx);}
  }
});
loadWorkspace();

function toast(m){
  const d=document.createElement('div');
  d.className='toast';d.textContent=m;document.body.appendChild(d);
  setTimeout(()=>d.remove(),2200);
}

render();