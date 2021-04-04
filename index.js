var canvas;
var ctx;

var grid_points = []
var new_grid_points = []
var vectors = []
var new_vectors = []
var show_origin = false;
var show_grid = true;

var mouse_down = false;
window.onmousedown = () => mouse_down = true;
window.onmouseup = () => mouse_down = false;

var relToCenter = vec => new vec2(vec.x - window.innerWidth / 2, window.innerHeight / 2 - vec.y);
var relToWindow = vec => new vec2(vec.x + window.innerWidth / 2, window.innerHeight / 2 - vec.y);

class Matrix2x2 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}

class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    multiply(matrix2x2) {
        if (matrix2x2 instanceof Matrix2x2) {
            var res = new vec2;
            res.x = matrix2x2.a * this.x + matrix2x2.b * this.y;
            res.y = matrix2x2.c * this.x + matrix2x2.d * this.y;
            return res;
        }
    }

    rotate(rad) {
        return multiply(new Matrix2x2(Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)));
    }

    normalize() {
        let l = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return new vec2(this.x / l, this.y / l);
    }
}

function multiply(vertices, matrix) {
    var res = []
    vertices.forEach(vert => res.push(vert.multiply(matrix)));
    return res;
}


/* Rendering */
function drawVector(vec, color) {
    const arrow = [new vec2(-7, 5), new vec2(-7, -5)]

    let centered = relToCenter(vec);
    line(relToWindow(new vec2(0, 0)), vec, color);
    if (color !== undefined) {
        ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(vec.x, vec.y);

    let n = centered.normalize();
    let rotArrow = multiply(arrow, new Matrix2x2(n.x, -n.y, n.y, n.x));
    rotArrow[0] = relToWindow(rotArrow[0]);
    rotArrow[0].x += centered.x;
    rotArrow[0].y -= centered.y;    
    rotArrow[1] = relToWindow(rotArrow[1]);
    rotArrow[1].x += centered.x;
    rotArrow[1].y -= centered.y;


    ctx.lineTo(rotArrow[0].x, rotArrow[0].y);
    ctx.lineTo(rotArrow[1].x, rotArrow[1].y);

    ctx.fill();
    ctx.closePath();
}

function line(start, end, color) {
    if (color !== undefined) {
        ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}

function dot(position, size) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, 2 * Math.PI)
    ctx.fill();
}
/* Rendering */


window.onload = function () {
    loadContext();
    createGrid();
    draw();
}

window.onresize = function () {
    loadContext();
}

function changeGridlines(event) {
    if (mouse_down) {
        loadContext();

        createGrid();

        draw();
    }
}

function applyMatrix(event) {
    loadContext();
    let inputs = event.target.parentNode.querySelectorAll("input");
    let matrix = new Matrix2x2(Number(inputs[0].value), Number(inputs[1].value), Number(inputs[2].value), Number(inputs[3].value));
    for (let i = 0; i < grid_points.length; i++) {
        new_grid_points[i] = relToWindow(relToCenter(grid_points[i]).multiply(matrix));
    }
    for (let i = 0; i < vectors.length; i++) {
        new_vectors[i] = vectors[i].vec.multiply(matrix);
    }
    let i = 0;

    function interpolate() {
        for (let i1 = 0; i1 < grid_points.length; i1++) {
            grid_points[i1].x += (new_grid_points[i1].x - grid_points[i1].x) / (100 - i);
            grid_points[i1].y += (new_grid_points[i1].y - grid_points[i1].y) / (100 - i);
        }
        for (let i1 = 0; i1 < vectors.length; i1++) {
            vectors[i1].vec.x += (new_vectors[i1].x - vectors[i1].vec.x) / (100 - i);
            vectors[i1].vec.y += (new_vectors[i1].y - vectors[i1].vec.y) / (100 - i);
        }

        loadContext();
        draw();
        i++;
        if (i < 100)
            setTimeout(interpolate, 10);
    }
    interpolate();
}

function removeMatrix(event)
{
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
}

function addMatrix()
{
    document.getElementById("matrices").appendChild(document.querySelector(".matrix:first-child").cloneNode(true));
}

function addVector(event) {
    let inputs = event.target.parentNode.querySelectorAll("input");
    vectors.push({ vec: new vec2(Number(inputs[0].value), Number(inputs[1].value)), color: event.target.parentNode.querySelector("input[type=color]").value });
    loadContext();
    draw();
}

function showOrHideOrigin(event) {
    show_origin = !show_origin;
    loadContext();
    draw();
}

function showOrHideGrid(event) {
    show_grid = !show_grid;
    loadContext();
    draw();
}

function createGrid() {
    grid_points = [];

    let gridLines = document.getElementById("gridLines").value * 2;
    for (let i = 0; i < gridLines; i++) {
        grid_points.push(new vec2(i * window.innerWidth / gridLines, 0), new vec2(i * window.innerWidth / gridLines, window.innerHeight));
    }

    for (let i = 0; i * window.innerWidth / gridLines < window.innerHeight; i++) {
        grid_points.push(new vec2(0, i * window.innerWidth / gridLines), new vec2(window.innerWidth, i * window.innerWidth / gridLines));
    }
}

function loadContext() {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
}


function draw() {
    if (show_origin)
        dot(new vec2(window.innerWidth / 2, window.innerHeight / 2), 3);

    if (show_grid) {
        for (let i = 0; i < grid_points.length; i += 2) {
            line(grid_points[i], grid_points[i + 1]);
        }
    }

    for (vector of vectors) {
        // line(new vec2(window.innerWidth / 2, window.innerHeight / 2), relToWindow(vector.vec), vector.color);
        drawVector(relToWindow(vector.vec), vector.color);
    }
}