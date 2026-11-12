'use strict';
const STORAGE_KEY = 'campusnotes-v1';
const starterNotes = [
  {id:'n1',title:'Binary Search',subject:'Data Structures',tag:'Exam prep',content:'Binary search works on a sorted collection. Compare the target with the middle element and discard half of the remaining search space each step. Time complexity: O(log n).',pinned:true,updated:'2026-11-10T10:00:00.000Z'},
  {id:'n2',title:'OOP Principles',subject:'Java Programming',tag:'Concepts',content:'Encapsulation bundles data and methods together. Inheritance reuses behaviour. Polymorphism allows one interface to have multiple implementations. Abstraction hides implementation details.',pinned:false,updated:'2026-11-08T12:30:00.000Z'},
  {id:'n3',title:'Git Essentials',subject:'Version Control',tag:'Practical',content:'Use git status to inspect the working tree, git add to stage changes, git commit to save a snapshot, and git push to publish local commits to a remote repository.',pinned:false,updated:'2026-11-06T08:15:00.000Z'}
];
let notes = loadNotes();
const $ = (id) => document.getElementById(id);
function loadNotes(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):starterNotes.slice();}catch(error){console.error('Could not load notes:',error);return starterNotes.slice();}}
function saveNotes(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(notes));}catch(error){alert('Your browser could not save this note. Check available storage.');console.error(error);}}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function render(){
  const query=$('search-input').value.trim().toLowerCase();const subject=$('subject-filter').value;const sort=$('sort-select').value;
  let visible=notes.filter(n=>(subject==='all'||n.subject===subject)&&[n.title,n.subject,n.tag,n.content].join(' ').toLowerCase().includes(query));
  visible.sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):sort==='subject'?a.subject.localeCompare(b.subject):new Date(b.updated)-new Date(a.updated));
  $('total-count').textContent=notes.length;$('pinned-count').textContent=notes.filter(n=>n.pinned).length;
  const subjects=[...new Set(notes.map(n=>n.subject).filter(Boolean))].sort();const current=$('subject-filter').value;
  $('subject-filter').innerHTML='<option value="all">All subjects</option>'+subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  $('subject-filter').value=subjects.includes(current)?current:'all';
  $('notes-grid').innerHTML=visible.map(n=>`<article class="note-card"><div class="note-card-top"><span class="subject-pill">${escapeHtml(n.subject)}</span><span class="pin">${n.pinned?'◆ Pinned':''}</span></div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.content)}</p><div class="note-card-bottom"><span>${escapeHtml(n.tag||'No tag')} · ${new Date(n.updated).toLocaleDateString()}</span><div class="card-actions"><button data-action="pin" data-id="${n.id}">${n.pinned?'Unpin':'Pin'}</button><button data-action="edit" data-id="${n.id}">Edit</button><button class="delete" data-action="delete" data-id="${n.id}">Delete</button></div></div></article>`).join('');
  $('empty-state').hidden=visible.length!==0;
}
function openEditor(note=null){$('note-form').reset();$('note-id').value=note?.id||'';$('dialog-title').textContent=note?'Edit note':'Create a note';$('note-title').value=note?.title||'';$('note-subject').value=note?.subject||'';$('note-tag').value=note?.tag||'';$('note-content').value=note?.content||'';$('note-pinned').checked=Boolean(note?.pinned);$('note-dialog').showModal();$('note-title').focus();}
function closeEditor(){$('note-dialog').close();}
$('new-note-btn').addEventListener('click',()=>openEditor());$('close-dialog').addEventListener('click',closeEditor);$('cancel-dialog').addEventListener('click',closeEditor);
$('note-form').addEventListener('submit',event=>{event.preventDefault();const id=$('note-id').value;const note={id:id||`n${Date.now()}`,title:$('note-title').value.trim(),subject:$('note-subject').value.trim(),tag:$('note-tag').value.trim(),content:$('note-content').value.trim(),pinned:$('note-pinned').checked,updated:new Date().toISOString()};if(!note.title||!note.subject||!note.content)return;if(id){notes=notes.map(item=>item.id===id?note:item);}else{notes.unshift(note);}saveNotes();closeEditor();render();});
$('notes-grid').addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;const note=notes.find(n=>n.id===button.dataset.id);if(!note)return;switch(button.dataset.action){case'edit':openEditor(note);break;case'pin':note.pinned=!note.pinned;note.updated=new Date().toISOString();saveNotes();render();break;case'delete':if(confirm(`Delete “${note.title}”?`)){notes=notes.filter(n=>n.id!==note.id);saveNotes();render();}break;}});
$('search-input').addEventListener('input',render);$('subject-filter').addEventListener('change',render);$('sort-select').addEventListener('change',render);
render();
