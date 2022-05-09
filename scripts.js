//array where we'll store points clicked by user
var points = []
//array where we'll store coefficients (divided differences)
var differences = []
//array where we'll store values of f(x) of interpolating polynomial for x = [-10, 10] with step size 0.01
var functionValues = []
//set all function values to 0
for(let i = -10; i <= 10; i += 0.01) {
    functionValues.push(0)
}

//reset globals and grid
function reset() {
    points = []
    differences = []
    functionValues = []
    for(let i = -10; i <= 10; i += 0.01) {
        functionValues.push(0)
    }
    setUpGrid()
}

//draw initial empty grid
function setUpGrid() {
   var c = document.getElementById("graphArea")
   var dimension = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth
   c.width = 0.95 * dimension
   c.height = 0.95 * dimension
   var ctx = c.getContext("2d")
   ctx.clearRect(0, 0, c.width, c.height);
   //draw vertical grid lines
   var interval = c.width / 20
   var j = -10
   for(var i = 0; i <= c.width; i += interval) {    
       ctx.beginPath()
       ctx.setLineDash([1,3])
       ctx.strokeStyle = 'gray'
       if(j === 0) {
            ctx.setLineDash([5, 1]);
            ctx.strokeStyle = 'black'
       }
       ctx.moveTo(i, 0)
       ctx.lineTo(i, c.height)
       ctx.stroke()
       ++j
       ctx.closePath()
   }
    //draw horizontal grid lines
    interval = c.height / 20
    j = -10
    for(i = 0; i <= c.height; i += interval) {    
        ctx.beginPath()
        ctx.setLineDash([1,3])
        ctx.strokeStyle = 'gray'
        if(j === 0) {
            ctx.setLineDash([5, 1]);
            ctx.strokeStyle = 'black'
        }
        ctx.moveTo(0, i)
        ctx.lineTo(c.width, i)
        ctx.stroke()
         ++j
        ctx.closePath()
    }
}

//add point to interpolating polynomial and update it as needed
function addPoint(event) {
    const c = document.getElementById("graphArea")
    const rect = c.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    var transformedPoints = transformCoordinates(x,y)
    if(distinctX(transformedPoints[0])) {
        points.push(transformedPoints)
        addPointToDividedDifferences(transformedPoints[0],transformedPoints[1])
        updateFunctionValues()
        setUpGrid()
        for(var i = 0; i < points.length; ++i) {
            var canvasPoints = untransformCoordinates(points[i][0], points[i][1])
            drawPoint(canvasPoints[0], canvasPoints[1])
        }
        drawGraph()
        document.getElementById("distinct-x-error").style.display = "none"
    }
    else {
        document.getElementById("distinct-x-error").style.display = "block"
    }
}

//draw point user clicked on canvas
function drawPoint(x,y) {
    var c = document.getElementById("graphArea")
    var ctx = c.getContext("2d")
    ctx.beginPath()
    ctx.setLineDash([1,0])
    ctx.strokeStyle = 'black'
    ctx.arc(x,y,2,0,2* Math.PI)
    ctx.stroke()
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.closePath()
}

//add a point to the divided differences matrix (add row to bottom)
function addPointToDividedDifferences(x,y) {
    differences.push([x,y])
    var j = 1;
    var currRow = differences.length - 1
    var prevRow = differences.length - 2
    for(var i = differences.length - 2; i >= 0; --i) {
        var diff = differences[currRow][differences[currRow].length-1] - differences[prevRow][j]
        diff /= differences[currRow][0] - differences[i][0]
        differences[currRow].push(diff)
        ++j
    }
}

//update function values to include newly added point
function updateFunctionValues() {
    var newDividedDifference = differences[differences.length-1][differences[differences.length-1].length - 1]
    var j = -10
    for(var i = 0; i < functionValues.length; ++i) {
        var newTerm = newDividedDifference
        for(var k = 0; k < points.length-1; ++k) {
            newTerm *= j - points[k][0]
        }
        functionValues[i] += newTerm
        j += 0.01
    }
}

//transform canvas coordinates to correct coordinates
function transformCoordinates(x,y) {
    var c = document.getElementById("graphArea")
    var width = c.width
    var height = c.height
    var interval = width / 20
    var newX = (x - width/2) / interval
    var newY = -1 * ((y - height/2) / interval)
    return [newX, newY]
}

//transform x,y coordinates back to canvas coordinates
function untransformCoordinates(x,y) {
    var c = document.getElementById("graphArea")
    var width = c.width
    var height = c.height
    return [width/2 + x*(width/20), height/2 + -1*y*(height/20)]
}

//draw graph
function drawGraph() {
    var c = document.getElementById("graphArea")
    var ctx = c.getContext("2d")
    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.setLineDash([])
    var i = -10
    for(var j = 0; j < functionValues.length; ++j) {
        var nextCoords = untransformCoordinates(i, functionValues[j])
        if(i === -10) {
            ctx.moveTo(nextCoords[0],nextCoords[1])
        }
        else {
            ctx.lineTo(nextCoords[0],nextCoords[1])
        }
        i += 0.01
    }
    ctx.stroke()
    ctx.closePath()
}

//check points to make sure new point has distinct x value
function distinctX(x) {
    for(var i = 0; i < points.length; ++i) {
        if(points[i][0] === x) {
            return false
        }
    }
    return true
}

//resize graph
function resizeGraph() {
    setUpGrid()
    for(var i = 0; i < points.length; ++i) {
        var canvasPoints = untransformCoordinates(points[i][0], points[i][1])
        drawPoint(canvasPoints[0], canvasPoints[1])
    }
    if(points.length > 0) {
        drawGraph()
    }
    document.getElementById("distinct-x-error").style.display = "none"
}

setUpGrid()
var c = document.getElementById("graphArea")
c.addEventListener("mousedown", (ev) => {addPoint(ev)})
var btn = document.getElementById("reset-button")
btn.addEventListener("click", reset)
window.onresize = resizeGraph