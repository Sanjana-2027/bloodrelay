function switchTab(t){
  document.getElementById("loginForm").style.display=t==="login"?"flex":"none";
  document.getElementById("signupForm").style.display=t==="signup"?"flex":"none";
  document.getElementById("tabLogin").classList.toggle("active",t==="login");
  document.getElementById("tabSignup").classList.toggle("active",t==="signup");
}
function showMain(n,r){
  document.getElementById("loginPage").style.display="none";
  document.getElementById("mainSite").style.display="block";
  document.getElementById("userName").innerText=n+" ("+r+")";
}
function logout(){
  document.getElementById("mainSite").style.display="none";
  document.getElementById("loginPage").style.display="flex";
}
document.getElementById("loginForm").onsubmit=e=>{
  e.preventDefault();
  let n=loginEmail.value.split("@")[0];
  alert("Welcome "+n+"!");
  showMain(n,loginRole.value);
};
document.getElementById("signupForm").onsubmit=e=>{
  e.preventDefault();
  alert("Account Created! Please Login.");
  switchTab('login');
};
  "O-":["O-"], "O+":["O-","O+"],
  "A-":["O-","A-"], "A+":["O-","O+","A-","A+"],
  "B-":["O-","B-"], "B+":["O-","O+","B-","B+"],
  "AB-":["O-","A-","B-","AB-"],
  "AB+":["O-","O+","A-","A+","B-","B+","AB-","AB+"]
};


let donors = JSON.parse(localStorage.getItem("donors")) || [
  {name:"Rahul", blood:"O+", city:"Hyderabad", locality:"Maisammaguda", phone:"9876543210", available:"Available", last:0},
  {name:"Priya", blood:"B+", city:"Hyderabad", locality:"Medchal", phone:"9876543211", available:"Available", last:0},
  {name:"Anil", blood:"A+", city:"Hyderabad", locality:"Kompally", phone:"9876543212", available:"Available", last:0},
  {name:"Sneha", blood:"O-", city:"Hyderabad", locality:"Secunderabad", phone:"9876543213", available:"Available", last:0},
  {name:"Arjun", blood:"AB+", city:"Hyderabad", locality:"Maisammaguda", phone:"9876543214", available:"Available", last:0},
  {name:"Sanjana", blood:"B+", city:"Hyderabad", locality:"Maisammaguda", phone:"9876543215", available:"Available", last:0},
];
let requests = JSON.parse(localStorage.getItem("requests")) || [
  {patient:"Rahul", blood:"B+", hospital:"Apollo Hospital", city:"Hyderabad", locality:"Jubilee Hills", units:2, filled:0, stage:0},
  {patient:"Priya", blood:"O+", hospital:"Yashoda Hospital", city:"Hyderabad", locality:"Secunderabad", units:3, filled:1, stage:1},
  {patient:"Anil", blood:"A+", hospital:"KIMS Hospital", city:"Hyderabad", locality:"Kompally", units:2, filled:0, stage:0},
];

function save(){ localStorage.setItem("donors",JSON.stringify(donors)); localStorage.setItem("requests",JSON.stringify(requests)); }
function mask(p){ return "XXXXX X"+p.slice(6); }
function locked(d){ return d.last && Date.now()-d.last < 90*24*60*60*1000; }

// SOS
document.getElementById("sosForm").onsubmit = e => {
  e.preventDefault();
  if(new Date(deadline.value) <= new Date()){ alert("Deadline must be in future!"); return; }
  requests.unshift({patient:pName.value, blood:blood.value, hospital:hospital.value, city:city.value, locality:"", units:+units.value, filled:0, stage:0});
  save(); renderReq(); updateCounts();
  let m = donors.filter(d=>compatibility[blood.value].includes(d.blood) && d.city.toLowerCase()===city.value.toLowerCase());
  alert(`SOS Broadcasted! SMS Alert sent to ${m.length} compatible donors. Groups: ${compatibility[blood.value].join(", ")}`);
  e.target.reset();
};

// REGISTER
document.getElementById("donorForm").onsubmit = e => {
  e.preventDefault();
  donors.push({name:dName.value, blood:dBlood.value, city:dCity.value, locality:dLocality.value, phone:dPhone.value, available:dAvail.value, last:0});
  save(); renderDonors(); updateCounts();
  document.getElementById("cert").innerHTML = `<div class="card" style="text-align:center">🏅 <b>Thank You ${dName.value}!</b><br>You are a Life Saver.<br><button class="red" onclick="alert('Certificate Downloaded!')">Download Certificate</button></div>`;
  e.target.reset(); alert("Donor Registered! Phone Masked for Privacy.");
};

// RENDER REQUESTS
function renderReq(){
  document.getElementById("reqList").innerHTML = requests.map((r,i)=>`
    <div class="card">
      <span class="pulse"></span> <b>${r.patient} - ${r.blood}</b> <span style="color:red;font-size:12px">● URGENT</span>
      <p>🏥 ${r.hospital} | ${r.city}</p>
      <p>🩸 ${r.filled}/${r.units} Units Fulfilled</p>
      <div class="stepper">${["Open / Broadcasted","Donors Responded","Fulfilled / In Transit","Closed"].map((s,j)=>`<span class="step ${j<=r.stage?'done':''}">${s}</span>`).join("")}</div>
      <button class="red" onclick="advance(${i})">I Can Donate</button>
      <button onclick="simulate(${i})">Simulate SMS Alert</button>
    </div>`).join("");
}
function advance(i){
  if(requests[i].filled < requests[i].units) requests[i].filled++;
  if(requests[i].filled>0 && requests[i].stage<1) requests[i].stage=1;
  else if(requests[i].stage<2) requests[i].stage++;
  save(); renderReq();
}
function simulate(i){ alert(`SMS Alert Sent to compatible donors for ${requests[i].patient} (${requests[i].blood})!`); }

// RENDER DONORS
function renderDonors(){
  let fb = document.getElementById("fBlood").value;
  let fc = document.getElementById("fCity").value.toLowerCase();
  if(!fb){ document.getElementById("donorList").innerHTML = "<p>Please select recipient blood group.</p>"; return; }
  let list = donors.filter(d=>compatibility[fb].includes(d.blood) && (!fc || d.city.toLowerCase().includes(fc)));
  document.getElementById("donorList").innerHTML = list.map(d=>`
    <div class="card"><h3>${d.name} - ${d.blood}</h3>
    <p>📍 ${d.city}, ${d.locality}</p><p>📞 ${mask(d.phone)} (Masked)</p>
    <p>${locked(d)?"🔒 Locked - 90 Days Recovery":d.available}</p>
    <button class="red" onclick="alert('Relay Request Sent! Donor will contact via App.')">I Can Donate</button></div>`).join("") || "<p>No donors found.</p>";
}
function updateCounts(){
  document.getElementById("countDonors").innerText = donors.length;
  document.getElementById("countReq").innerText = requests.filter(r=>r.stage<3).length;
}
renderReq(); renderDonors(); updateCounts();

