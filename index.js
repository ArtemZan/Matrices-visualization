var canvas;
var ctx;

var grid_points = []
var new_grid_points = []
var showOrigin = false;

var mouse_down = false;
window.onmousedown = ()=>mouse_down = true;
window.onmouseup = ()=>mouse_down = false;

class Matrix2x2
{
    constructor(a, b, c, d)
    {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}

class vec2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    multiply(matrix2x2)
    {
        if(matrix2x2 instanceof Matrix2x2)
        {
            var res = new Object;
            Object.assign(res, this);
            res.x -= window.innerWidth / 2;
            res.y = window.innerHeight / 2 - res.y;
            res.x = matrix2x2.a * res.x + matrix2x2.b * res.y;
            res.y = matrix2x2.c * res.x + matrix2x2.d * res.y;
            res.x += window.innerWidth / 2;
            res.y = window.innerHeight / 2 - res.y;
            return res;
        }
    }
}


function line(start, end)
{
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function dot(position, size)
{
    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, 2 * Math.PI)
    ctx.fill();
}

window.onload = function()
{   
    loadContext();
    createObjects();
    draw();
}

window.onresize = function()
{
    loadContext();
}

function changeGridlines(event)
{
    if(mouse_down)
    {
        loadContext();

        createObjects();

        draw();
    }
}

function applyMatrix(event)
{
    loadContext();
    let inputs = event.target.parentNode.querySelectorAll("input");
    for(let i = 0; i < grid_points.length; i++)
    {
        new_grid_points[i] = grid_points[i].multiply(new Matrix2x2(Number(inputs[0].value), Number(inputs[1].value), Number(inputs[2].value), Number(inputs[3].value)));
    }
    // createObjects();
    let i = 0;

    function int()
    {
        for(let i1 = 0; i1 < grid_points.length; i1++)
        {
            grid_points[i1].x += (new_grid_points[i1].x - grid_points[i1].x) / (100 - i);
            grid_points[i1].y += (new_grid_points[i1].y - grid_points[i1].y) / (100 - i);
        }
        loadContext();
        draw();
        i++;
        if(i < 100)
            setTimeout(int, 10);
    }
    int();
}

function showOrHideOrigin(event)
{
    showOrigin = !showOrigin;
    loadContext();
    draw();
}

function createObjects()
{
    grid_points = [];

    let gridLines = document.getElementById("gridLines").value * 2;
    for(let i = 0; i < gridLines; i++)
    {
        grid_points.push(new vec2(i * window.innerWidth / gridLines, 0), new vec2(i * window.innerWidth / gridLines, window.innerHeight));
    }

    for(let i = 0; i * window.innerWidth / gridLines < window.innerHeight; i++)
    {
        grid_points.push(new vec2(0, i * window.innerWidth / gridLines), new vec2(window.innerWidth, i * window.innerWidth / gridLines));
    }
}

function loadContext()
{
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
}

function draw()
{
    if(showOrigin)
        dot(new vec2(window.innerWidth / 2, window.innerHeight / 2), 3);
    for(let i = 0; i < grid_points.length; i+=2)
    {
        line(grid_points[i], grid_points[i + 1]);
        // console.log(grid_points[i], grid_points[i + 1]);
    }
}