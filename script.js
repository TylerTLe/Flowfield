const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Canvas settings
ctx.fillStyle = 'white';
ctx.strokeStyle = 'white'
ctx.lineWidth = 1;

class Particle {
    constructor(effect){
        this.effect = effect;
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.speedX = Math.random() * 5 - 2.5;
        this.speedY = Math.random() * 5 - 2.5;
        this.history = [{x: this.x, y: this.y}]
        this.maxLength = Math.floor(Math.random() * 200 + 10);
        this.angle = 0
    }
    draw(context){
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 0; i < this.history.length; i++){
            context.lineTo(this.history[i].x, this.history[i].y);
        }
        context.stroke();
    }
    update(){
        let x = Math.floor(this.x / this.effect.cellSize);
        let y = Math.floor(this.y / this.effect.cellSize);
        let index = y * this.effect.cols + x;
        this.angle = this.effect.flowField[index];

        this.speedX = Math.cos(this.angle);
        this.speedy = Math.sin(this.angle);
        this.x += this.speedX;
        this.y += this.speedY;

        this.history.push({x: this.x, y: this.y})
        if ( this.history.length > this.maxLength){
            this.history.shift();
        }
    }
}

class Effect {
     constructor(width,height){
        this.width = width;
        this.height = height;
        this.particles = [];
        this.numberOfParticles = 500;
        this.cellSize = 20;
        this.rows;
        this.cols;
        this.flowField = [];
        this.curve = 0.5
        this.zoom = 0.2
        this.init()
     }
     init(){
        // creates flow field
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);
        this.flowField = [];
        for (let y = 0; y < this.rows; y++){
            for (let x = 0; x < this.cols; x++){
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom) * this.curve);
                this.flowField.push(angle);
            }
        }

        // create particles
        for (let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this))
        }
        this.particles.push(new Particle(this));
     }
     render(context){
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
     }
}

const effect = new Effect(canvas.width, canvas.height);
effect.render(ctx);
console.log(effect);

function animate(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    effect.render(ctx);
    requestAnimationFrame(animate);
}
animate();