var canvas;
var ctx;


/*Vertices*/
var grid_points = []
var new_grid_points = []
var vectors = []
var new_vectors = []
/*Vertices*/


/* Some other flags */
var mouse_down = false;
window.onmousedown = () => mouse_down = true;
window.onmouseup = () => mouse_down = false;
/* Some other flags */


/* Settings and current state*/
var show_origin = false;
var show_grid = true;
var animating = false;
var animation_duration = 1;
/* Settings */



var relToCenter = vec => (vec instanceof vec2) ? new vec2(vec.x - window.innerWidth / 2, window.innerHeight / 2 - vec.y) : new vec3(vec.x - window.innerWidth / 2, window.innerHeight / 2 - vec.y, vec.z);
var relToWindow = vec => (vec instanceof vec2) ? new vec2(vec.x + window.innerWidth / 2, window.innerHeight / 2 - vec.y) : new vec3(vec.x + window.innerWidth / 2, window.innerHeight / 2 - vec.y, vec.z);

class Matrix2x2 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}

class Matrix3x3 {
    constructor(a, b, c, d, e, f, g, h, i) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        this.g = g;
        this.h = h;
        this.i = i;
    }
}

class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    multiply(matrix) {
        if (matrix instanceof Matrix2x2) {
            var res = new vec2;
            res.x = matrix.a * this.x + matrix.b * this.y;
            res.y = matrix.c * this.x + matrix.d * this.y;
            return res;
        }

        if (matrix instanceof Matrix3x3)//temporary
        {
            var res = new vec3(this.x, this.y, 0);
            res = res.multiply(matrix);
            return (new vec2(res.x, res.y));
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

class vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    multiply(matrix) {
        if (matrix instanceof Matrix3x3) {
            var res = new vec3;
            res.x = matrix.a * this.x + matrix.b * this.y + matrix.c * this.z;
            res.y = matrix.d * this.x + matrix.e * this.y + matrix.f * this.z;
            res.z = matrix.g * this.x + matrix.h * this.y + matrix.i * this.z;
            return res;
        }

        if (matrix instanceof Matrix2x2) {
            let res = new vec2(this.x, this.y).multiply(matrix);
            return new vec3(res.x, res.y, this.z);
        }
    }

    vec2() { return new vec2(this.x, this.y) }

    // rotate(rad) {
    //     return multiply(new Matrix2x2(Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)));
    // }

    normalize() {
        let l = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
        return new vec2(this.x / l, this.y / l, this.z / l);
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
    //Set animation flag to true so that new animation can't start
    if (animating)
        return;
    animating = true;
    //Clear canvas
    loadContext();

    //Create matrix from inputs
    let inputs = event.target.parentNode.querySelectorAll("input");
    let matrix;
    const _3d = inputs.length === 9;
    if (_3d)
        matrix = new Matrix3x3(Number(inputs[0].value),
            Number(inputs[1].value),
            Number(inputs[2].value),
            Number(inputs[3].value),
            Number(inputs[4].value),
            Number(inputs[5].value),
            Number(inputs[6].value),
            Number(inputs[7].value),
            Number(inputs[8].value));
    else
        matrix = new Matrix2x2(Number(inputs[0].value),
            Number(inputs[1].value),
            Number(inputs[2].value),
            Number(inputs[3].value));

    //Set transformed vertices
    for (let i = 0; i < grid_points.length; i++) {
        new_grid_points[i] = relToWindow(relToCenter(grid_points[i]).multiply(matrix));
    }
    for (let i = 0; i < vectors.length; i++) {
        new_vectors[i] = vectors[i].vec.multiply(matrix);
    }

    //Interpalate (smoothly change) between current vertices and transformed vertices
    const steps = animation_duration * 100;
    let i = 0;
    function interpolate() {
        for (let i1 = 0; i1 < grid_points.length; i1++) {
            grid_points[i1].x += (new_grid_points[i1].x - grid_points[i1].x) / (steps - i);
            grid_points[i1].y += (new_grid_points[i1].y - grid_points[i1].y) / (steps - i);
            grid_points[i1].z += (new_grid_points[i1].z - grid_points[i1].z) / (steps - i);
        }
        for (let i1 = 0; i1 < vectors.length; i1++) {
            vectors[i1].vec.x += (new_vectors[i1].x - vectors[i1].vec.x) / (steps - i);
            vectors[i1].vec.y += (new_vectors[i1].y - vectors[i1].vec.y) / (steps - i);
            vectors[i1].vec.z += (new_vectors[i1].z - vectors[i1].vec.z) / (steps - i);
        }


        loadContext();
        draw();
        i++;
        if (i < steps)
            setTimeout(interpolate, 10);
        else
            animating = false;
    }
    interpolate();
}

function addMatrix(rows, columns) {
    if (rows === 2 && columns === 2) {
        document.getElementById("matrices").appendChild(document.querySelector(".matrix-2x2").cloneNode(true));
    }
    else if (rows === 3 && columns === 3) {
        document.getElementById("matrices").appendChild(document.querySelector(".matrix-3x3").cloneNode(true));
    }
}

function addVector(event) {
    let inputs = event.target.parentNode.querySelectorAll("input");
    vectors.push({ vec: new vec3(Number(inputs[0].value), Number(inputs[1].value), Number(inputs[2].value)), color: event.target.parentNode.querySelector("input[type=color]").value });
    redraw();
}

function showOrHideOrigin() {
    show_origin = !show_origin;
    redraw();
}

function showOrHideGrid() {
    show_grid = !show_grid;
    redraw();
}

function createGrid() {
    grid_points = [];

    let gridLines = document.getElementById("gridLines").value * 2;
    for (let i = 0; i < gridLines; i++) {
        grid_points.push(new vec3(i * window.innerWidth / gridLines, 0, 0), new vec3(i * window.innerWidth / gridLines, window.innerHeight, 0));
    }

    let offset = (window.innerHeight % (window.innerWidth / gridLines * 2)) / 2;
    for (let i = 0; i * window.innerWidth / gridLines < window.innerHeight; i++) {
        grid_points.push(new vec3(0, offset + i * window.innerWidth / gridLines, 0), new vec3(window.innerWidth, offset + i * window.innerWidth / gridLines, 0));
    }
}

function loadContext() {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
}

var redraw = () => {
    loadContext();
    draw();
}

function draw() {
    if (show_origin)
        dot(new vec2(window.innerWidth / 2, window.innerHeight / 2), 3);

    if (show_grid) {
        for (let i = 0; i < grid_points.length; i += 2) {
            line(grid_points[i].vec2(), grid_points[i + 1].vec2());
        }
    }

    for (vector of vectors) {
        drawVector(relToWindow(vector.vec.vec2()), vector.color);
    }
}