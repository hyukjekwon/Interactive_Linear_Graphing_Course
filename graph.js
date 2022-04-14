// Written by Hyuk-Je Kwon
var canvas = document.getElementById("interactive-graph")
var ctx = canvas.getContext("2d")
var W = canvas.width
var H = canvas.height
var x_samples = 16
var y_samples = 16
var slope = null
var y_int = null
var textbox = null
var answer = ''
var m = 1
var b = 0
var p1 = {x: 0, y: H}
var p2 = {x: W, y: 0}
var t = 0 // varies during scenes 3 and 7 on a timer
let timer = null

/**
 * Scene 1: Introduction
 * Scene 2: Go into detail on the structure of a linear equation
 * Scene 3: Show line, automatically move y-intercept slider to show how it affects the line
 * Scene 4: Let user play around with y-intercept slider
 * Scene 5: Ask user to get y-intercept to match a line
 * Scene 6: Show what slope is (rise over run)
 * Scene 7: Automatically move slope slider up to show how it affects the line
 * Scene 8: Ask user to match the slope of a line being displayed
 * Scene 9: Ask user to write the slope of a line being displayed
 * Scene 10: Ask user to match a line with slope + y-intercept
 * Scene 11: *
 * Scene 12: Ask user to write the equation of a line being displayed
 * Scene 13: *
 * Scene 14: Ask user to draw a line using a given equation
 * Scene 15: *
 * Scene 16: Done!
 * Scene 17: User can play around with it some more in a sandbox
***/
var scene = 1

canvas.addEventListener('click', function(e) {
    var mousePos = {x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top}
    updateScene(mousePos)
})

// takes in mouse click position and updates scene accordingly
function updateScene(p) {
    if (p.x < 95 && p.y > 756) { 
        scene -= scene == 1 ? 0:
            scene == 16 ? 15: 1 // dont let scene # go under 1
    } else if(p.x > 756 && p.y > 756) { 
        scene += scene == 17 ? 0: 1 // dont let scene # go over 17
    }
    if((scene == 3 || scene == 7)) { // start timer for automatic demonstrations
        timer = window.setInterval(function() {
            t++
            updateLine()
            draw()
        }, 25)
    } else {
        if(timer != null) { // clear timer when not in either scene
            clearInterval(timer)
            t = 0
        }
    }
    console.log("Going to scene " + scene + "...")
    manualLine(1, 0)
}

// draws a line manually with the slope and y-int inputs
function manualLine(sl, yi) {
    m = sl
    b = yi
    slope.value = m
    y_int.value = b
    document.getElementById("m").innerHTML = m
    document.getElementById("b").innerHTML = b
    updateEquation()
    updateLine()
    draw()
}

function drawArrow(ctx, x0, y0, x1, y1, r){
    var x_center = x1
    var y_center = y1
    var angle
    var x
    var y
    ctx.beginPath()
    angle = Math.atan2(y1-y0,x1-x0)
    x = r*Math.cos(angle) + x_center
    y = r*Math.sin(angle) + y_center
    ctx.moveTo(x, y)
    angle += 2 * Math.PI / 3
    x = r*Math.cos(angle) + x_center
    y = r*Math.sin(angle) + y_center
    ctx.lineTo(x, y)
    angle += 2 * Math.PI / 3
    x = r*Math.cos(angle) + x_center
    y = r*Math.sin(angle) + y_center
    ctx.lineTo(x, y)
    ctx.fill()
    ctx.closePath()
    ctx.beginPath()
    ctx.strokeStyle = "black"
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.closePath()
}


// updates equation for current line being displayed
function updateEquation() {
    var str = "y = "
    if(m != 0) {
        str += ((m / 0.0001) % 1 == 0) ? m: m.toFixed(3)
        str += "x"
    }
    if(b != 0 || m == 0) {
        str += b < 0 ? "-" + -b: "+" + b
    }
    document.getElementById("eq").innerHTML = str
}

// helper function for updateLine
// takes in point coords and outputs real canvas coords
function translateCoords(p) {
    var px = (W / x_samples) * p.x + W/2
    var py = (H / y_samples) * p.y + H/2
    return {x: px, y: py}
}

// helper function for updateLine
// tells updateLine when a given point is out of visible range
function outOfBounds(p) {
    return Math.abs(p.x) > 16 || Math.abs(p.y) > 16
}

// updates line coords being drawn
function updateLine() {
    if(scene == 3) {
        b = (8 * Math.sin(t / 15.0)).toFixed(3)
        y_int.value = b
        document.getElementById("m").innerHTML = m
        document.getElementById("b").innerHTML = b
        updateEquation()
        draw()
    } else if(scene == 7) {
        m = (8 * Math.sin(t / 25.0))
        draw()
        // m = m.toFixed()
        slope.value = m.toFixed(3)
        document.getElementById("m").innerHTML = m.toFixed(3)
        document.getElementById("b").innerHTML = b
        updateEquation()
    }

    p1 = {x: 0, y: -b} // goes left
    p2 = {x: 0, y: -b} // goes right
    while(!outOfBounds(p1)) {
        p1.x--
        p1.y += m
    }
    while(!outOfBounds(p2)) {
        p2.x++
        p2.y -= m
    }
    p1 = translateCoords(p1)
    p2 = translateCoords(p2)
}

function draw() {
    // draw background
    ctx.rect(0, 0, W, H)
    ctx.fillStyle = "white"
    ctx.fill()
    // draw vertical markings
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = "rgb(100, 200, 255)"
    for(var i = 0; i < y_samples; i++) {
        ctx.moveTo(0, i * (H / y_samples))
        ctx.lineTo(W, i * (H / y_samples))
        ctx.stroke()
    }
    // draw horizontal markings
    for(var i = 0; i < x_samples; i++) {
        ctx.moveTo(i * (W / x_samples), 0)
        ctx.lineTo(i * (W / x_samples), H)
        ctx.stroke()
    }
    ctx.closePath()
     // draw axes
    ctx.beginPath()
    ctx.strokeStyle = "rgb(75, 150, 192)"
    ctx.moveTo(W/2, 0)
    ctx.lineTo(W/2, H)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.moveTo(0, H/2)
    ctx.lineTo(W, H/2)
    ctx.stroke()
    ctx.closePath()
    // draw axis labels
    ctx.fillStyle = "rgb(75, 150, 192)"
    ctx.font = "40px Helvetica Italic"
    ctx.fillText("y", W/2 + 16, 35)
    ctx.fillText("x", W - 35, H/2 - 16)
    // init sliders
    if(slope == null || y_int == null) {
        slope = document.getElementById("slope")
        y_int = document.getElementById("y_int")
        slope.oninput = function() {
            m = parseFloat(this.value)
            document.getElementById("m").innerHTML = m
            updateEquation()
            updateLine()
            draw()
        }
        y_int.oninput = function() {
            b = parseFloat(this.value)
            document.getElementById("b").innerHTML = b
            updateEquation()
            updateLine()
            draw()
        }
    }
    switch(scene) {
        case 1:
        case 2:
        case 6:
        case 16: // all cases when to include gradient overlay
            ctx.beginPath()
            var grad = ctx.createLinearGradient(0, W, 0, 0)
            grad.addColorStop(1, "rgba(255, 255, 255, 0.5)")
            grad.addColorStop(0, "rgba(75, 75, 255, 0.5)")
            ctx.fillStyle = grad
            ctx.rect(0, 0, W, H)
            ctx.fill()
            ctx.closePath()
            break;
        case 9:
        case 12:
        case 13:
            break;
        default: // line drawing only enabled on scenes 3-5, 7-8, 10-11, 17
            // draw line
            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.closePath()
    }
    // init text box
    if(textbox == null) {
        textbox = document.getElementById("textbox")
        textbox.oninput = function() {
            answer = this.value
            draw()
        }
    }
    // draw educational text
    ctx.beginPath()
    ctx.fillStyle = "black"
    ctx.font = "40px Arial"
    switch(scene) {
        case 1: // intro
            ctx.fillText("Welcome to Linear Equations: De-mystified!", 30, 90)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("In this interactive course, we'll be learning all", 120, 200)
            ctx.fillText("about linear equations.", 70, 250)
            ctx.fillText("We'll examine their components and play around", 120, 350)
            ctx.fillText("with them a little bit.", 70, 400)
            ctx.fillText("By the end of it, you'll have a good grasp on how", 120, 510)
            ctx.fillText("to both identify components of lines and how to graph", 70, 560)
            ctx.fillText("your own!", 70, 610)
            ctx.fillText("Previous slide", 30, 730)
            ctx.fillText("Next slide", W - 150, 730)
            break;
        case 2: // equation components
            ctx.font = "100px Arial"
            ctx.fillText("y = mx + b", W/2 - 230, H/2 - 30)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "50px Arial"
            ctx.fillText("Here's what the structure looks like!", 30, 85)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("output variable", 120, 200)
            ctx.fillText("input variable", W-320, 200)
            ctx.fillText("slope", 250, H-250)
            ctx.fillText("y-intercept", W-320, H-250)
            drawArrow(ctx, 220, 220, W/2 - 200, H/2 - 120, 20)
            drawArrow(ctx, W-220, 220, W/2+80, H/2 - 100, 20)
            drawArrow(ctx, W-250, H-280, W/2+200, H/2, 20)
            drawArrow(ctx, W/2-130, H-280, W/2 - 50, H/2, 20)
            ctx.fillText("We'll get to all of these in a moment, but for now let's", 70, H-150)
            ctx.fillText("focus on what happens to a line when we change", 70, H-110)
            ctx.fillText("its y-intercept.", 150, H-70)
            break;
        case 3: // auto demonstration of y-intercept
            ctx.font = "25px Arial"
            ctx.fillText("This is what happens when b's value varies between -8 and +8!", 80, 85)
            ctx.fillText("It's worth mentioning that", 30, 280)
            ctx.fillText("it's called the y-intercept", 30, 320)
            ctx.fillText("because it's the point where", 30, 360)
            ctx.fillText("the line intercepts the y-axis.", 30, 400)
            ctx.fillText("Note that this slider represents the y-intercept.", 200, H - 75)
            drawArrow(ctx, W/2, H-60, W/2+100, H-20, 20)
            break;
        case 4: // user tries y-intercept slider
            ctx.fillText("Now try it for yourself!", 220, 90)
            ctx.fillText("Move this!", 400, H - 75)
            drawArrow(ctx, W/2+100, H-60, W/2+200, H-20, 20)
            break;
        case 5: // matching exercise
            ctx.beginPath()
            ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"
            ctx.moveTo(0, 13*H/16)
            ctx.lineTo(W, 13*H/16 - H)
            ctx.stroke()
            ctx.closePath()
            ctx.fillStyle = "black"
            ctx.fillText("Try to match the red line.", 220, 90)
            if(m == 1 && b == 3) {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2+200)
                ctx.fillText("The y-intercept is (0, 3)", W/2-250, H/2+300)
            }
            break;
        case 6: // explaining slope
            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.moveTo(W/2-20, H/2-50)
            ctx.lineTo(W/2+180, H/2-50)
            ctx.stroke()
            ctx.closePath()
            ctx.font = "100px Arial"
            ctx.fillText("m = ", W/2 - 230, H/2 - 30)
            ctx.fillText("rise", W/2, H/2 - 80)
            ctx.fillText("run", W/2, H/2 + 40)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "48px Arial"
            ctx.fillText("How do we determine m (the slope)?", 30, 85)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("slope", 190, 200)
            ctx.fillText("vertical distance between steps", W/2-60, 180)
            ctx.fillText("horizontal distance between steps", W/2-100, H-250)
            drawArrow(ctx, 220, 220, W/2 - 200, H/2 - 120, 20)
            drawArrow(ctx, W-250, 200, W/2+120, H/2 - 170, 20)
            drawArrow(ctx, W-250, H-280, W/2+75, H/2+70, 20)
            ctx.fillText("You can think of it as a measure", 200, H-80)
            ctx.fillText("of how steep a given graphed line is.", 180, H-40)
            break;
        case 7: // automated demonstration of slope
            ctx.font = "25px Arial"
            ctx.fillText("This is what happens when m's value varies between -8 and +8!", 80, 85)
            ctx.fillText("Note that this slider represents the slope.", 160, H - 75)
            drawArrow(ctx, W/2-100, H-60, W/2-140, H-20, 20)
            break;
        case 8: // matching exercise
            ctx.beginPath()
            ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"
            ctx.moveTo(6*W/16, 0)
            ctx.lineTo(10*W/16, H)
            ctx.stroke()
            ctx.closePath()
            ctx.fillStyle = "black"
            ctx.fillText("Try to match the red line.", 220, 90)
            if(m == -4 && b == 0) {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2+200)
                ctx.fillText("The slope is -4", W/2-150, H/2+300)
            }
            break;
        case 9: // write slope
            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.moveTo(12*W/16, 0)
            ctx.lineTo(4*W/16, H)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.fillStyle = "black"
            ctx.fillText("What's the slope of this line?", 180, 90)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("Enter a number in the white text box below", 150, H-60)
            ctx.beginPath()
            if(textbox.value == '2') {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2+200)
                ctx.fillText("The slope is 2", W/2-150, H/2+300)
            }
            break;
        case 10: // matching exercise with both slope and y-intercept
            ctx.beginPath()
            ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"
            ctx.moveTo(0, 27*W/32)
            ctx.lineTo(W, 19*W/32)
            ctx.stroke()
            ctx.closePath()
            ctx.fillStyle = "black"
            ctx.fillText("Try to match the red line.", 220, 90)
            if(m == 0.25 && b == -3.5) {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2-200)
                ctx.beginPath()
                ctx.font = "30px Arial"
                ctx.fillText("The slope is 1/4 and the y-intercept is -3.5", W/2-270, H/2-100)
                ctx.closePath()
            }
            break;
        case 11: // matching exercise with both slope and y-intercept
            ctx.beginPath()
            ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"
            ctx.moveTo(W/2 - 0.375 * (W/16), 0)
            ctx.lineTo(W/2 + 1.625 * (W/16), H)
            ctx.stroke()
            ctx.closePath()
            ctx.fillStyle = "black"
            ctx.fillText("Try to match the red line.", 220, 90)
            if(m == -8 && b == 5) {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2+200)
                ctx.beginPath()
                ctx.font = "30px Arial"
                ctx.fillText("The slope is -8 and the y-intercept is 5", W/2-270, H/2+300)
                ctx.closePath()
            }
            break;
        case 12: // write full equation!
            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.moveTo(W/2 - (14/3) * (W/16), 0)
            ctx.lineTo(W/2 + (2/3)*(W/16), H)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.fillStyle = "black"
            ctx.fillText("What's the equation of this line?", 160, 90)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("Write your answer in y = mx + b form", 180, H-120)
            ctx.fillText("in the white text box below", 240, H-60)
            ctx.beginPath()
            if(textbox.value.toLowerCase().replace(/\s/g, "") == 'y=-3x-6') {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2-200)
            }
            break;
        case 13: // write full equation!
            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.moveTo(0, H/4 - H/32)
            ctx.lineTo(W, H/4 - H/32)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.fillStyle = "black"
            ctx.fillText("What's the equation of this line?", 160, 90)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("Write your answer in y = mx + b form", 180, H-120)
            ctx.fillText("in the white text box below", 240, H-60)
            ctx.beginPath()
            if(textbox.value.toLowerCase().replace(/\s/g, "") == 'y=4.5') {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2-160)
                ctx.beginPath()
                ctx.font = "30px Arial"
                ctx.fillText("The interesting thing to note here is that the", W/2-300, H/2-100)
                ctx.fillText("line is flat. This is because the slope is zero.", W/2-300, H/2-60)
                ctx.fillText("There is no rising, so 0 ÷ run is 0.", W/2-300, H/2-20)
                ctx.closePath()
            }
            break;
        case 14: // line from given equation
            ctx.fillStyle = "black"
            ctx.fillText("Draw this equation:", 250, 90)
            ctx.fillText("y = 3x - 7", 330, 140)
            if(m == 3 && b == -7) {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2 - 100)
            }
            break;
        case 15: // line from given equation
            ctx.fillStyle = "black"
            ctx.fillText("Draw this equation:", 250, 90)
            ctx.fillText("One more left...", 290, H-40)
            ctx.fillText("y = -0.25x - 8", 330, 140)
            if(m == -0.25 && b == -8) {
                ctx.font = "50px Arial"
                ctx.fillText("Good job!", W/2-100, H/2 - 100)
            }
            break;
        case 16: // conclusion
            ctx.fillText("Congratulations!", 280, 90)
            ctx.closePath()
            ctx.beginPath()
            ctx.font = "30px Arial"
            ctx.fillText("You've completed this course on linear graphing!", 110, 240)
            ctx.fillText("We learned about slopes and y-intercepts, and", 120, 350)
            ctx.fillText("how they can affect the way lines are plotted on a graph", 50, 400)
            ctx.fillText("I hope that this course was helpful for visualizing", 120, 510)
            ctx.fillText("linear graphs, and that you take this information far", 70, 560)
            ctx.fillText("into the future.", 70, 610)
            ctx.fillText("Redo course", 30, 730)
            ctx.fillText("Sandbox", W - 140, 730)
            break;
        default:
    }
    ctx.closePath()
    // draw scene transition buttons
    ctx.beginPath()
    ctx.fillStyle = "rgb(75, 75, 100)"
    ctx.arc(50, H - 50, 40, 0, 360)
    ctx.arc(W - 50, H - 50, 40, 0, 360)
    ctx.fill()
    ctx.closePath()
    // draw arrows on buttons
    ctx.beginPath()
    ctx.fillStyle = "rgb(150, 150, 200)"
    ctx.moveTo(30, H - 50)
    ctx.lineTo(60, H - 30)
    ctx.lineTo(60, H - 70)
    ctx.fill()
    ctx.fillStyle = "rgb(150, 170, 200)"
    ctx.moveTo(W - 30, H - 50)
    ctx.lineTo(W - 60, H - 30)
    ctx.lineTo(W - 60, H - 70)
    ctx.fill()
    ctx.closePath()
}