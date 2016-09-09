var dragSrcEl = null;
var svg = null;
var x = null;
var y = null;

function handleDragStart(e) {
    this.style.opacity = '0.4';  // this / e.target is the source node.
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}


function handleDragOver(e) {
    if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    // this / e.target is previous target element.
    this.classList.remove('over');  
}

function handleDrop(e) {
  // this / e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    svg_origin = document.querySelector('#canvas svg').getBoundingClientRect();
    console.log(svg_origin)
    origin_x = svg_origin.x;
    origin_y = svg_origin.y;

    x = e.clientX - origin_x;
    y = e.clientY - origin_y;
       
    var g = dragSrcEl.querySelector("g");

    console.log("Dropping "+g+" on "+x+" , "+y+".");
    
    svg.append('g')
      .html(g.innerHTML)
      .attr('class', 'node')
      .attr("transform", function(d) { 
          return "translate(" + x + "," + y + ")"; 
        }); 


  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.

   this.style.opacity = '1'; 

  var types = document.querySelectorAll('#palette .draggablebox');
  [].forEach.call(types, function (typ) {
    typ.classList.remove('over');
  });
}


function activateShapes(){
    var types = document.querySelectorAll('#palette .draggablebox');
    [].forEach.call(types, function(typ) {
      typ.addEventListener('dragstart', handleDragStart, false);
      typ.addEventListener('dragenter', handleDragEnter, false);
      typ.addEventListener('dragleave', handleDragLeave, false);
      typ.addEventListener('dragend', handleDragEnd, false);
    });
}

function activateCanvas(){
    document.querySelector('#canvas').addEventListener('dragover', handleDragOver, false);
    document.querySelector('#canvas').addEventListener('drop', handleDrop, false);

}

function loadShapesIntoPalette(){

    d3.json("types.json", function(error, treeData) {
        
        if (error != null){
            alert(error);
        }

        var shapes = treeData.shapes;

        // Normalize for fixed-depth.
        shapes.forEach(function(d) { d.x = 10; d.y = 10 });

        var palette = d3.select("#palette")

        svg = d3.select('#canvas')
            .append('svg')
            .on('mouseup', function(d){
                coordinates = d3.mouse(this);
                x = coordinates[0];
                y = coordinates[1];
                console.log(x + ", " + y)
            })

        // Declare the shapes
        var node = palette.selectAll("div.shapecontainer")
          .data(shapes, function(d) { return d });

        // Enter the shapes.
        var nodeEnter = node.enter().append("div")
          .attr("class", "shapecontainer")
          .append('span')
          .attr('class', 'draggablebox')
          .attr('draggable', 'true')
          .append("svg")
          .attr("class", "palettesvg")
          .append('g')
          .attr('class', 'type')
          .attr('shape', function(d){return d.shape})
          .attr("transform", function(d) { 
              return "translate(" + d.x + "," + d.y + ")"; })
          .append("path")
          .style("stroke", function(d) { return 'black'; })
          .style("fill", function(d) { return d.colour; })
          .attr("d", d3.symbol()
             .size(function(d) { return d.height * d.width; } )
             .type(function(d) { if
               (d.shape == "circle") { return d3.symbolCircle; } else if
               (d.shape == "diamond") { return d3.symbolDiamond;} else if
               (d.shape == "cross") { return d3.symbolCross;} else if
               (d.shape == "triangle") { return d3.symbolTriangle;} else if
               (d.shape == "square") { return d3.symbolSquare;} else if
               (d.shape == "star") { return d3.symbolStar;} else if
               (d.shape == "wye") { return d3.symbolWye;}
             })); 

        //Make the shapes in the palette draggable.
        activateShapes();
        activateCanvas();
    
    });

}

