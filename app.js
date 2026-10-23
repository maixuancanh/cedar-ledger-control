'use strict';
const storageKey = 'cedar-ledger-demo-v1';
const seed = () => ({balance:100000,bills:[{id:'BILL-001',vendor:'Northstar Design',cents:25000,due:'2026-10-27',status:'draft'},{id:'BILL-002',vendor:'Maple Office',cents:12000,due:'2026-10-29',status:'reserved'}],activity:[{title:'Workspace opened',detail:'Sample records are ready to explore.',date:new Date().toISOString()}]});
let state = seed(), view = 'Overview';
try { const saved=JSON.parse(localStorage.getItem(storageKey)); if(saved && Number.isSafeInteger(saved.balance) && saved.balance>=0 && Array.isArray(saved.bills) && saved.bills.every(b=>typeof b.id==='string' && typeof b.vendor==='string' && Number.isSafeInteger(b.cents) && b.cents>0 && typeof b.due==='string' && ['draft','verified','reserved','paid','canceled'].includes(b.status)) && Array.isArray(saved.activity) && saved.bills.filter(b=>b.status==='reserved').reduce((n,b)=>n+b.cents,0)<=saved.balance) state=saved; } catch {}
const $ = selector => document.querySelector(selector);
const money = cents => (cents/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function reserved(){return state.bills.filter(b=>b.status==='reserved').reduce((sum,b)=>sum+b.cents,0);}
function notice(text){$('#notice').textContent=text;$('#notice').hidden=false;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{notice('Browser storage unavailable. Changes remain for this tab only.');}}
function log(title,detail){state.activity.unshift({title,detail,date:new Date().toISOString()});state.activity=state.activity.slice(0,50);}
function activity(){return `<section class="panel"><div class="section-heading"><h2>Recent activity</h2><span class="subtle-badge">Demo records</span></div><div class="activity-list">${state.activity.slice(0,view==='Activity'?50:5).map(a=>`<div class="activity-item"><span class="activity-icon">✓</span><div><strong>${escape(a.title)}</strong><p>${escape(a.detail)}</p><small>${escape(new Date(a.date).toLocaleString())}</small></div></div>`).join('')}</div></section>`;}
function table(){return `<section class="panel"><div class="section-heading"><div><h2>Your bills <span class="count">${state.bills.length}</span></h2><p>Review the details before committing funds.</p></div><span class="subtle-badge">USD · simulated</span></div><div class="table-scroll"><table><thead><tr><th>Vendor / bill</th><th>Due date</th><th>Status</th><th class="align-right">Amount</th><th class="align-right">Action</th></tr></thead><tbody>${state.bills.map(b=>`<tr><td><div class="vendor-cell"><span class="vendor-avatar">${escape(b.vendor.slice(0,2).toUpperCase())}</span><div><strong>${escape(b.vendor)}</strong><small>${escape(b.id)}</small></div></div></td><td class="muted">${escape(b.due)}</td><td><span class="status status-${b.status}"><span></span>${escape(b.status)}</span></td><td class="align-right amount">${money(b.cents)} <small>USD</small></td><td><div class="demo-actions">${['draft','verified','reserved'].includes(b.status)?`<button data-id="${escape(b.id)}" data-action="advance">${b.status==='draft'?'Verify terms':b.status==='verified'?'Reserve funds':'Mark paid'}</button><button data-id="${escape(b.id)}" data-action="cancel">Cancel</button>`:'—'}</div></td></tr>`).join('')}</tbody></table></div></section>`;}
function render(){
 const r=reserved(),free=state.balance-r;
 for(const [key,cents] of Object.entries({balance:state.balance,reserved:r,available:free,surplus:Math.max(0,free-30000)}))$('#'+key).innerHTML=money(cents)+' <small>USD</small>';
 $('#crumb').textContent=view;$('#heading').textContent=({Overview:'A clearer view of your cash.',Bills:'Every bill, accounted for.',Cash:'Make room for what comes next.',Activity:'The story behind your balance.'})[view];
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 $('#content').innerHTML=view==='Activity'?activity():view==='Cash'?`<section class="panel cash-panel"><h2>Your operating buffer</h2><p>Keep $300.00 available for everyday expenses. You currently have $${money(free)} free, with $${money(Math.max(0,free-30000))} above that buffer.</p><p>Amounts are sample bookkeeping figures. No financial institution is connected.</p></section>`:table()+(view==='Overview'?`<div class="overview-bottom">${activity()}<section class="panel cash-panel"><span class="eyebrow">A LITTLE CLARITY GOES A LONG WAY</span><h2>Keep your next chapter funded.</h2><p>Reserve cash for committed bills and keep a buffer for everyday expenses.</p><p>Available after buffer: <strong>$${money(Math.max(0,free-30000))}</strong></p></section></div>`:'');
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;render();}));
$('#content').addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button)return;
 const bill=state.bills.find(b=>b.id===button.dataset.id);if(!bill)return;
 if(button.dataset.action==='cancel'){if(!['draft','verified','reserved'].includes(bill.status))return;bill.status='canceled';log('Bill canceled',bill.vendor);}
 else if(bill.status==='draft'){bill.status='verified';log('Bill terms verified',bill.vendor);}
 else if(bill.status==='verified'){if(bill.cents>state.balance-reserved()){notice('Insufficient available demo funds.');return;}bill.status='reserved';log('Budget reserved',bill.vendor+' · $'+money(bill.cents));}
 else if(bill.status==='reserved'){state.balance-=bill.cents;bill.status='paid';log('Bill marked paid',bill.vendor+' · simulated bookkeeping only');}
 else return;
 save();render();notice('Demo record updated. No real payment was sent.');
});
$('#new-bill').addEventListener('click',()=>{$('#form-error').textContent='';$('#create-dialog').showModal();});
$('#close-dialog').addEventListener('click',()=>$('#create-dialog').close());
$('#bill-form').addEventListener('submit',event=>{
 event.preventDefault();const form=new FormData(event.target),value=String(form.get('amount')),vendor=String(form.get('vendor')).trim(),due=String(form.get('due'));
 const parts=value.split('.'),cents=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
 if(!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(value)||!Number.isSafeInteger(cents)||cents<=0||cents>100000000||!vendor||!/^\d{4}-\d{2}-\d{2}$/.test(due)){$('#form-error').textContent='Enter a vendor, valid date and amount between $0.01 and $1,000,000.';return;}
 state.bills.unshift({id:'BILL-'+crypto.randomUUID().slice(0,8),vendor,cents,due,status:'draft'});log('Bill created',vendor+' · $'+money(cents));save();render();event.target.reset();$('#create-dialog').close();notice('Draft bill created in this browser.');
});
$('#reset').addEventListener('click',()=>{state=seed();save();render();notice('Sample workspace restored.');});
render();
