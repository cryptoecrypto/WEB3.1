/* Calendário mensal com memórias locais, edição e remoção seguras. */
(function(){
  "use strict";
  const months=["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
  const key="crypy-calendar-infinit-events-v1";
  const title=document.getElementById("month-title"),days=document.getElementById("calendar-days"),selectedDate=document.getElementById("selected-date"),input=document.getElementById("event-title"),list=document.getElementById("event-list"),feedback=document.getElementById("memory-feedback"),counter=document.getElementById("char-count");
  const today=new Date();let view=new Date(today.getFullYear(),today.getMonth(),1);let selected=iso(today);
  function iso(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
  function save(rows){localStorage.setItem(key,JSON.stringify(rows));}
  function load(){
    try{
      const raw=localStorage.getItem(key);
      if(raw===null){
        const initial=[
          {id:"seed-baby-20261116",date:"2026-11-16",title:"Nascimento da BABY I.A."},
          {id:"seed-news-20261127",date:"2026-11-27",title:"Edição CRYPY-NEWS MARKET"},
          {id:"seed-hive-20261128",date:"2026-11-28",title:"Revisão da Colmeia"}
        ];
        save(initial);return initial;
      }
      const value=JSON.parse(raw);return Array.isArray(value)?value.filter(event=>event&&typeof event.date==="string"&&typeof event.title==="string"):[];
    }catch(_){return [];}
  }
  function fullDate(value){const [y,m,d]=value.split("-").map(Number);return new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(y,m-1,d));}
  function render(){
    title.textContent=months[view.getMonth()]+" "+view.getFullYear();days.replaceChildren();
    const offset=new Date(view.getFullYear(),view.getMonth(),1).getDay(),total=new Date(view.getFullYear(),view.getMonth()+1,0).getDate(),events=load();
    for(let i=0;i<offset;i++){const blank=document.createElement("span");blank.className="day-cell";blank.style.visibility="hidden";blank.setAttribute("aria-hidden","true");days.appendChild(blank);}
    for(let d=1;d<=total;d++){
      const date=new Date(view.getFullYear(),view.getMonth(),d),value=iso(date),button=document.createElement("button");
      button.type="button";button.className="day-cell";button.textContent=String(d);button.setAttribute("role","gridcell");button.setAttribute("aria-pressed",String(value===selected));
      if(value===iso(today))button.classList.add("today");if(value===selected)button.classList.add("selected");if(events.some(event=>event.date===value))button.classList.add("has-event");
      button.addEventListener("click",()=>{selected=value;render();renderEvents();});days.appendChild(button);
    }
  }
  function renderEvents(){
    selectedDate.textContent=fullDate(selected);list.replaceChildren();
    const events=load().filter(event=>event.date===selected);
    if(!events.length){const empty=document.createElement("li");empty.className="empty";empty.textContent="Nenhuma memória registrada nesta data.";list.appendChild(empty);return;}
    events.forEach(event=>{
      const li=document.createElement("li"),label=document.createElement("span"),remove=document.createElement("button");
      label.textContent=event.title;remove.type="button";remove.className="remove-event";remove.textContent="APAGAR";
      remove.setAttribute("aria-label","Apagar memória: "+event.title);
      remove.addEventListener("click",()=>removeEvent(event.id));
      li.append(label,remove);list.appendChild(li);
    });
  }
  function removeEvent(id){
    try{save(load().filter(event=>event.id!==id));feedback.textContent="Memória removida deste navegador.";render();renderEvents();}
    catch(error){feedback.textContent="Não foi possível remover: "+error.message;}
  }
  document.getElementById("prev-month").addEventListener("click",()=>{view.setMonth(view.getMonth()-1);render();});
  document.getElementById("next-month").addEventListener("click",()=>{view.setMonth(view.getMonth()+1);render();});
  document.getElementById("today-month").addEventListener("click",()=>{view=new Date(today.getFullYear(),today.getMonth(),1);selected=iso(today);render();renderEvents();});
  input.addEventListener("input",()=>counter.textContent=input.value.length+"/180");
  document.getElementById("save-event").addEventListener("click",()=>{
    const text=input.value.trim();if(!text){feedback.textContent="Escreva uma memória antes de salvar.";return;}
    try{const events=load();events.push({id:"event-"+Date.now()+"-"+Math.random().toString(36).slice(2),date:selected,title:text});save(events);input.value="";counter.textContent="0/180";feedback.textContent="Memória salva neste navegador.";render();renderEvents();}
    catch(error){feedback.textContent="Não foi possível salvar localmente: "+error.message;}
  });
  render();renderEvents();
})();