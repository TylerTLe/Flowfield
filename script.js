const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Canvas settings
ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';
ctx.lineWidth = 1;

class Particle {
    constructor(effect){
        this.effect = effect;
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.speedX;
        this.speedY;
        this.speedModifier = Math.floor(Math.random() * 5 + 1);
        this.history = [{x: this.x, y: this.y}]
        this.maxLength = Math.floor(Math.random() * 200 + 10);
        this.angle = 0;
        this.timer = this.maxLength * 2;
        this.colors = ['#7400B8', '#6930C3', '#5E60CE', '#5390D9', '#4EA8DE', '#48BFE3', '#56CFE1', '#64DFDF', '#72EFDD', '#80FFDB'] 
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    draw(context){
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 0; i < this.history.length; i++){
            context.lineTo(this.history[i].x, this.history[i].y);
        }
        context.strokeStyle = this.color;
        context.stroke();
    }
    update(){
        this.timer--;
        if (this.timer >= 1){
            let x = Math.floor(this.x / this.effect.cellSize);
            let y = Math.floor(this.y / this.effect.cellSize);
            let index = y * this.effect.cols + x;
            this.angle = this.effect.flowField[index];
            this.speedX = Math.cos(this.angle);
            this.speedY = Math.sin(this.angle);
            this.x += this.speedX * this.speedModifier;
            this.y += this.speedY * this.speedModifier;
    
            this.history.push({x: this.x, y: this.y})
            if ( this.history.length > this.maxLength){
                this.history.shift();
            }
        } else if (this.history.length > 1){
            this.history.shift();
        } else {
            this.reset();
        }
    }
    reset(){
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.history = [{x: this.x, y: this.y}]
        this.timer = this.maxLength * 2;
        }
}

class Effect {
     constructor(canvas, ctx){
        this.canvas = canvas;
        this.context = ctx;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 1000;
        this.cellSize = 20;
        this.rows;
        this.cols;
        this.flowField = [];
        this.curve = 6;
        this.zoom = 0.07;
        this.debug = true;
        this.init()

        window.addEventListener('keydown', e => {
            console.log(e)
            if (e.key === 'd') this.debug = !this.debug;
        });
        window.addEventListener('resize', e => {
            this.resize(e.target.innerWidth, e.target.innerHeight)
        })
     }
     drawText(){
        this.context.font = '500px Impact';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('JS', this.width * 0.5, this.height * 0.5);
     }
     init(){
        // creates flow field
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);
        this.flowField = [];

        //  draw text
        this.drawText();

        // scan pixel data
        const pixels = this.context.getImageData(0, 0, this.width, this.height);


        for (let y = 0; y < this.rows; y++){
            for (let x = 0; x < this.cols; x++){
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom) * this.curve);
                this.flowField.push(angle);
            }
        }
        // create particles
        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this))
        }
        this.particles.push(new Particle(this));
     }
     drawGrid(){
        this.context.save();
        this.context.strokeStyle = 'Teal'
        this.context.lineWidth = 0.3;
        for(let c = 0; c < this.cols; c++) {
            this.context.beginPath()
            this.context.moveTo(this.cellSize * c, 0);
            this.context.lineTo(this.cellSize * c, this.height)
            this.context.stroke()
        }
        for (let r = 0; r < this.rows; r++){
            this.context.beginPath();
            this.context.moveTo(0,this.cellSize * r);
            this.context.lineTo(this.width, this.cellSize * r);
            this.context.stroke();
        }
        this.context.restore();
     }
     resize(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.init();
     }
     render(){
        if (this.debug) {
            this.drawGrid();
            this.drawText();
        }
        this.particles.forEach(particle => {
            particle.draw(this.context);
            particle.update();
        });
     }
}

const effect = new Effect(canvas, ctx);

function animate(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
}
animate();