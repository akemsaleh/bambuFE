"use strict";

let currentStock = {};

// Stock list
const stock = [
   {"code":"3816.KL","descr":"MISC BHD","abbrev":"MISC"},
   {"code":"5225.KL","descr":"IHH Healthcare Berhad","abbrev":"IHH"},
   {"code":"1295.KL","descr":"Public Bank Berhad","abbrev":"PBBANK"},
   {"code":"1155.KL","descr":"Malayan Banking Berhad","abbrev":"MAYBANK"},
   {"code":"3182.KL","descr":"Genting Berhad","abbrev":"GENTING"},
   {"code":"5235SS.KL","descr":"KLCC Real Estate Investment Trust","abbrev":"KLCC"},
   {"code":"5168.KL","descr":"HARTALEGA HOLDINGS BHD","abbrev":"HARTA"},
   {"code":"6012.KL","descr":"Maxis Berhad","abbrev":"MAXIS"},
   {"code":"1066.KL","descr":"RHB Capital Berhad","abbrev":"RHBBANK"},
   {"code":"5183.KL","descr":"PETRONAS CHEMICALS GROUP BHD","abbrev":"PCHEM"},
   {"code":"2445.KL","descr":"Kuala Lumpur Kepong Berhad","abbrev":"KLK"},
   {"code":"4707.KL","descr":"Nestl&eacute; (Malaysia) Berhad","abbrev":"NESTLE"},
   {"code":"5681.KL","descr":"Petronas Dagangan Bhd","abbrev":"PETDAG"},
   {"code":"5819.KL","descr":"Hong Leong Bank Berhad","abbrev":"HLBANK"},
   {"code":"6033.KL","descr":"Petronas Gas Bhd","abbrev":"PETGAS"},
   {"code":"4065.KL","descr":"PPB Group Berhad","abbrev":"PPB"},
   {"code":"3034.KL","descr":"Hap Seng Consolidated Berhad","abbrev":"HAPSENG"},
   {"code":"4715.KL","descr":"Genting Malaysia Berhad","abbrev":"GENM"},
   {"code":"8869.KL","descr":"Press Metal Bhd","abbrev":"PMETAL"},
   {"code":"5347.KL","descr":"Tenaga Nasional Berhad","abbrev":"TENAGA"},
   {"code":"1023.KL","descr":"CIMB Group Holdings Berhad","abbrev":"CIMB"},
   {"code":"1961.KL","descr":"IOI Corp.Bhd","abbrev":"IOICORP"},
   {"code":"4197.KL","descr":"Sime Darby Berhad","abbrev":"SIME"},
   {"code":"6947.KL","descr":"DiGi.Com Berhad","abbrev":"DIGI"},
   {"code":"5285.KL","descr":"SIME DARBY PLANTATION BERHAD","abbrev":"SIMEPLT"},
   {"code":"6888.KL","descr":"Axiata Group Berhad","abbrev":"AXIATA"},
   {"code":"1082.KL","descr":"Hong Leong Financial Group Berhad","abbrev":"HLFG"},
   {"code":"5014.KL","descr":"Malaysia Airports Holdings Bhd","abbrev":"AIRPORT"},
   {"code":"7277.KL","descr":"Dialog Group Berhad","abbrev":"DIALOG"},
   {"code":"4863.KL","descr":"Telekom Malaysia Berhad","abbrev":"TM"}

];


const getData = (param)=>{
   return new Promise((resolve,reject)=>{
      let xhr = new XMLHttpRequest();
      xhr.open("get",`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${param.code}&apikey=65OJZI7NOUWEK7ZE`);
      xhr.onreadystatechange = ()=>{
         if (xhr.readyState === 4){
            if (xhr.status === 200){
               resolve(JSON.parse(xhr.response));
            }
            else{
               reject({
                  status: xhr.status,
                  statusText: xhr.statusText,   
               });    
            }
         }
      };
      xhr.onerror = ()=>{
         reject({
            status: xhr.status,
            statusText: xhr.statusText,
         });    
      };
      xhr.send();

   });
};

const drawChart = ()=>{
   const container = document.getElementById("chart");
   new Chart(container,currentStock,{"width": (container.parentNode.offsetWidth - 20),"height":(container.parentNode.offsetHeight - 60),"margin":20,"items":document.getElementById("data-range-selector").value});
};

const changeChartPage = (e)=>{
   let elem,data;

   const selection = window.location.hash.substr(2);
   data = stock.find(obj=>obj.abbrev===selection);

   document.getElementById("stock-name").innerHTML = data.descr;
   document.getElementById("stock-short").innerHTML = `${data.abbrev} (${data.code})`;

   if (e) { document.querySelector(".active").classList.remove("active"); }
   document.getElementById(`mnu_${selection}`).classList.add("active");

   document.querySelectorAll('title')[0].innerHTML += ` : ${data.abbrev}`;
   getData({"code":data.code})
   .then((response)=>{
      currentStock = response;
      drawChart();
   })
   .catch((err)=>{ console.log(err); })
	
};

// Page initialization function
const initPage = ()=>{
   let elem = document.querySelector("nav ul");

// Create menu item for each stock
   stock.forEach(obj=>{
      let li = document.createElement("li");
      let a  = document.createElement("a");
      a.setAttribute("id",`mnu_${obj.abbrev}`);
      a.setAttribute("href",`#/${obj.abbrev}`);
      a.innerHTML = obj.abbrev;
      li.appendChild(a);
      elem.appendChild(li);
   });

   document.getElementById("data-range-selector").addEventListener("change",drawChart);

// Check if stock already selected
   if(window.location.hash){
      changeChartPage();
   }

};


// Handling for document onload
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
   initPage();
}
else{
   document.addEventListener("DOMContentLoaded",initPage);
}


window.addEventListener("hashchange", changeChartPage, false);