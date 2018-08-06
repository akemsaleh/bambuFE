"use strict";

class Chart{
   constructor(container,data,param={"width":800,"height":600,"margin":20,"items":60}){      
      this.width  = param.width;
      this.height = param.height;
      this.margin = param.margin;
      this.items  = param.items;

      this.areaWidth = this.width  - (this.margin * 2);
      this.areaHeight = this.height - (this.margin * 2);
      this.analyzeData(data);
      this.svg = container;
      this.clearChart();
      this.drawChart(data);
   }

   analyzeData(data){
      let tmp = data["Time Series (Daily)"];
      let key;
      this.highest  = 0;
      this.lowest = 1000;
      this.chartData = [];
      
   // get high value
      for (key in tmp){
         const tmpObj = {
            "date":key,
            "open":parseFloat(tmp[key]["1. open"]),
            "close":parseFloat(tmp[key]["4. close"]),
            "high":parseFloat(tmp[key]["2. high"]),
            "low":parseFloat(tmp[key]["3. low"]),
            "volume":parseFloat(tmp[key]["5. volume"]),
         };
         tmpObj.range = (tmpObj.high - tmpObj.low) * 100;
         tmpObj.bullish = tmpObj.close > tmpObj.open;
         if (tmpObj.high > this.highest){ this.highest = tmpObj.high;  }
         this.chartData.push(tmpObj);
      }
      this.maxY = Math.ceil((this.highest*50) / 50) * 100;
      if(this.maxY === (this.highest*100)){ this.maxY += 250; }

   // Remove data to display from certain range
      this.chartData = this.chartData.slice(0,this.items);

   // Reverse data sorting as respond from server return data from latest date
      this.chartData.reverse();
   }

   clearChart(){
      const emptyChart = this.svg.cloneNode(false);
      emptyChart.setAttribute("viewBox",`0 0 ${this.width} ${this.height}`);
      emptyChart.setAttribute("preserveAspectRatio","xMinYMin meet");
     
      this.svg.parentNode.replaceChild(emptyChart, this.svg);
      this.svg = emptyChart;
   }   

   drawAxis(){
      const xmlns = "http://www.w3.org/2000/svg";   
      const chartBase = document.createElementNS(xmlns,"g");
      const unitLength = this.areaHeight / this.maxY;
      let i,il;

      chartBase.setAttribute("class","chart-base");
      let tmp = document.createElementNS(xmlns,"polyline");
      tmp.setAttribute("points",`0 0, 0 ${this.areaHeight}, ${this.areaWidth} ${this.areaHeight}`);
      tmp.setAttribute("fill", 'transparent');
      tmp.setAttribute("stroke","#EEE");
      tmp.setAttribute("strokeWidth",4);
      chartBase.appendChild(tmp);

   // draw yAxis marker;
      let offset = 100;
      let multiplier = 1;
      if ((this.maxY > 700) && (this.maxY <= 1600)){ 
         offset = 250;
         multiplier = 2.5;
      }
      if (this.maxY > 1600){ 
         offset = 500; 
         multiplier = 5;
      }

      il = Math.floor(this.maxY/offset);
      for (i=1; i<= il; i++){
         tmp = document.createElementNS(xmlns,"line");
         tmp.setAttribute("x1",-5);
         tmp.setAttribute("y1",(this.maxY - (i * offset)) * unitLength);
         tmp.setAttribute("x2",5);
         tmp.setAttribute("y2",(this.maxY - (i * offset)) * unitLength);
         tmp.setAttribute("stroke","#EEE");
         tmp.setAttribute("strokeWidth",4);
         chartBase.appendChild(tmp);

         tmp = document.createElementNS(xmlns,"text");
         tmp.setAttribute("x",-20);
         tmp.setAttribute("y",(this.maxY - (i * offset)) * unitLength);
         tmp.setAttribute("font-size","10px");
         tmp.textContent = i * multiplier;

         chartBase.appendChild(tmp);
      }

      let chartPeriod;

   // gap variable to compute distance between each period
      const gap = this.areaWidth / this.items;
      il = this.items;
      for (i=1; i<=this.items; i++){
         chartPeriod = document.createElementNS(xmlns,"g");
         chartPeriod.setAttribute("class","chart-period");

         tmp = document.createElementNS(xmlns,"line");
         tmp.setAttribute("x1",3);
         tmp.setAttribute("y1",0);
         tmp.setAttribute("x2",3);
         tmp.setAttribute("y1",this.areaHeight);
         tmp.setAttribute("stroke","#EEE");
         tmp.setAttribute("strokeWidth",1);
         tmp.setAttribute("strokeDashArray","20,10");
         chartPeriod.appendChild(tmp);
         chartPeriod.setAttribute("transform",`translate(${gap * i},0)`);
         chartBase.appendChild(chartPeriod);
      }

      chartBase.setAttribute("transform","translate(20,20)");

      return chartBase;
   };

   drawChartData(){
      const xmlns = "http://www.w3.org/2000/svg";  
      let chartItem,tmp,il,coord;
 
      const chartData = document.createElementNS(xmlns,"g");
      chartData.setAttribute("class","chart-data");

      const unitLength = this.areaHeight / this.maxY;
      const gap  = (this.areaWidth / this.items);
      il = this.chartData.length;
      for (let i=0; i<il; i++){
         coord = {
            body: unitLength * this.chartData[i].range,
            itemX: gap * (i+1),
            itemY: (this.maxY - (this.chartData[i].high * 100)) * unitLength,
            openY: (this.chartData[i].high - this.chartData[i].open) * 100 * unitLength,
            closeY: (this.chartData[i].high - this.chartData[i].close) * 100 * unitLength
         };
         chartItem = document.createElementNS(xmlns,"g");
         chartItem.setAttribute("class","chart-item");

         tmp = document.createElementNS(xmlns,"title");
         tmp.textContent = `Date : \t${this.chartData[i].date}\n-----------------------\n\nOpen: \t${this.chartData[i].open}\nClose: \t${this.chartData[i].close}\nHigh: \t${this.chartData[i].high}\nLow: \t${this.chartData[i].low}\nVolume: \t${this.chartData[i].volume}\n\n`;
         chartItem.appendChild(tmp);

      // main body chart
         tmp = document.createElementNS(xmlns,"line");
         tmp.setAttribute("x1",3);
         tmp.setAttribute("y1",0);
         tmp.setAttribute("x2",3);
         tmp.setAttribute("y2",coord.body);
         tmp.setAttribute("stroke",this.chartData[i].bullish?"#008000":"#800000");
         tmp.setAttribute("strokeWidth",1);
         chartItem.appendChild(tmp);


      // opening chart
         tmp = document.createElementNS(xmlns,"line");
         tmp.setAttribute("x1",0);
         tmp.setAttribute("y1",coord.openY);
         tmp.setAttribute("x2",3);
         tmp.setAttribute("y2",coord.openY);
         tmp.setAttribute("stroke",this.chartData[i].bullish?"#008000":"#800000");
         tmp.setAttribute("strokeWidth",1);
         chartItem.appendChild(tmp);

      // closing chart
         tmp = document.createElementNS(xmlns,"line");
         tmp.setAttribute("x1",3);
         tmp.setAttribute("y1",coord.closeY);
         tmp.setAttribute("x2",5);
         tmp.setAttribute("y2",coord.closeY);
         tmp.setAttribute("stroke",this.chartData[i].bullish?"#008000":"#800000");
         tmp.setAttribute("strokeWidth",1);
         chartItem.appendChild(tmp);
         chartItem.setAttribute("transform",`translate(${coord.itemX},${coord.itemY})`);
         chartData.appendChild(chartItem);
      }
      chartData.setAttribute("transform","translate(20,20)");
      return chartData;
   };

   drawChart(data){
      
      this.svg.appendChild(this.drawAxis());
      this.svg.appendChild(this.drawChartData());      
   };
};