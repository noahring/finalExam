 
var drawPlot = function(players,target,xScale,yScale)
{
     var margins = {left:55,right:5,top:10,bottom:32}
    d3.select("#graph")
    .selectAll("circle")
    .data(players)
    .enter()
    .append("circle")
    .attr("cx",function(players)
    {
       return margins.left+xScale(Number(players.bestsalary)); 
    })
    .attr("cy",function(players)
    {
        return yScale(Number(players.rating))
    })
    .attr("r",3)
    
    .on("mouseenter" ,function(players)
      {
        
      var xPos = d3.event.pageX;
      var yPos = d3.event.pageY;
      
        d3.select("#tooltip")
        .classed("hidden",false)
        .style("top",yPos+"px")
        .style("left",xPos+"px")
        
        d3.select("#name")
        .text(players.full_name);
        
        
      })
    .on("mouseleave",function()
    {
        d3.select("#tooltip")    
        .classed("hidden",true);
    })
}
        
   
    



var initGraph = function(players)
{
   var screen = {width:800,height:610}
   
   
   var margins = {left:55,right:10,top:20,bottom:32}
   
   var graph = 
        {
            width:screen.width-margins.left-margins.right,
            height:screen.height - margins.top-margins.bottom
        }
    console.log(graph);
   
   d3.select("graph")
    .attr("width", screen.width)
    .attr("height", screen.height)
    
    
    var xScale = d3.scaleLinear()
    .domain([0,38])
    .range([0,screen.width])
    
    var yScale = d3.scaleLinear()
    .domain([65,100])
    .range([screen.height,0])
    
     d3.select("svg")
    .attr("width",screen.width)
    .attr("height",screen.height)
    
    var target = d3.select("svg")
    .append("g")
    .attr("id","#graph")
    .attr("transform",
          "translate("+margins.left+","+
                        margins.top+")");
    
    drawPlot(players,target,xScale,yScale)
    drawAxes(graph,margins,xScale,yScale)
    drawLabels(graph,margins)
    
}

var drawAxes = function(graphDim,margins,
                         xScale,yScale)
{
     var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    var axes = d3.select("svg")
        .append("g")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top+graphDim.height)+")")
        .call(xAxis)
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top+20)+")")
        .call(yAxis)
 
}

var drawLabels = function(graphDim,margins)
{
   var labels = d3.select("svg")
        .append("g")
        .classed("labels",true)
        
    labels.append("text")
        .text("2K Ratings With Salary")
        .classed("title",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graphDim.width/2))
        .attr("y",margins.top+10)
    
    labels.append("text")
        .text("Salary (in millions)")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graphDim.width/2))
        .attr("y",graphDim.height+50)
    
    labels.append("g")
        .attr("transform","translate(20,"+ 
              (margins.top+(graphDim.height/2))+")")
        .append("text")
        .text("Rating")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("transform","rotate(90)")
     
}  



var margin = {top: 35, right: 30, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 610 - margin.top - margin.bottom;



var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var violin = function(players) {

  
  var y = d3.scaleLinear()
    .domain([ 0,40 ])          
    .range([height, 0])
  svg.append("g").call( d3.axisLeft(y) )
    
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(["Rating"])
         
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    
    var histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(20))    
        .value(d => d)
    
    var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
    .key(function(players) { return players.rating;})
    .rollup(function(d) {   // For each key..
      input = d.map(function(players) { return players.bestsalary;})    
      bins = histogram(input)   
      return(bins)
    })
    .entries(players)
    
    var maxNum = 0
  for ( i in sumstat ){
    allBins = sumstat[i].value
    lengths = allBins.map(function(a){return a.length;})
    longuest = d3.max(lengths)
    if (longuest > maxNum) { maxNum = longuest }
  }

    var xNum = d3.scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum,maxNum])


  svg
    .selectAll("myViolin")
    .data(sumstat)
    .enter()        
    .append("g")
      .attr("transform", function(d){ return("translate(" + x(d.key) +" ,0)") } ) 
    .append("path")
        .datum(function(d){ return(d.value)})     
        .style("stroke", "none")
        .style("fill","black")
        .attr("d", d3.area()
            .x0(function(d){ return(xNum(-d.length)) } )
            .x1(function(d){ return(xNum(d.length)) } )
            .y(function(d){ return(y(d.x0)) } )
            .curve(d3.curveCatmullRom)    
        )
}




var successFCN = function(players)
{
    console.log("ratings",players);
    initGraph(players);
    violin(players);
   

    
}

var failFCN = function(error)
{
    console.log("error",error);
}

var ratingPromise = d3.csv("nba2k20-fulldata.csv")
ratingPromise.then(successFCN,failFCN);