const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 700;

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
        this.speedModifier = Math.floor(Math.random() * 3 + 1); // controls speed
        this.history = [{x: this.x, y: this.y}]
        this.maxLength = Math.floor(Math.random() * 60 + 10); // controls length of pixel strands
        this.angle = 0;
        this.newAngle = 0;
        this.angleCorrector = Math.random() * 0.5 + 0.01; // controls tightness of correction
        this.timer = this.maxLength * 2;
        this.colors = ['#DAD7CD', '#A3B18A', '#588157', '#3A5A40', '#344E41'] 
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

            if (this.effect.flowField[index]){
                this.newAngle = this.effect.flowField[index].colorAngle;
                if (this.angle > this.newAngle){
                    this.angle -= this.angleCorrector;  
                } else if (this.angle < this.newAngle){
                    this.angle += this.angleCorrector;  
                } else {
                    this.angle = this.newAngle;
                }
            }
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
        let attempts = 0;
        let resetSuccess = false;

        while (attempts < 10 && !resetSuccess){
            attempts++;
            let textIndex = Math.floor(Math.random() * this.effect.flowField.length);
            if (this.effect.flowField[textIndex].alpha > 0){
                this.x = this.effect.flowField[textIndex].x;
                this.y = this.effect.flowField[textIndex].y;
                this.history = [{x: this.x, y: this.y}]
                this.timer = this.maxLength * 2;
                resetSuccess = true;
            }
        }
        if (!resetSuccess){
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            this.history = [{x: this.x, y: this.y}]
            this.timer = this.maxLength * 2;
        }


    }
}

class Effect {
     constructor(canvas, ctx){
        this.canvas = canvas;
        this.context = ctx;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 2000;
        this.cellSize = 1;
        this.rows;
        this.cols;
        this.flowField = [];
        this.image = document.getElementById('star');
        // this.curve = 5;
        // this.zoom = 0.07;
        this.debug = false;
        this.init()

        window.addEventListener('keydown', e => {
            console.log(e)
            if (e.key === 'd') this.debug = !this.debug;
        });
        window.addEventListener('resize', e => {
            // this.resize(e.target.innerWidth, e.target.innerHeight)
        })
     }
     drawText(){
        this.context.font = '450px Impact';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';


        const gradient1 = this.context.createLinearGradient(0,0,this.width,this.height)
        gradient1.addColorStop(0.2,'rgb(255,0,0)');
        gradient1.addColorStop(0.4,'rgb(0,255,0)');
        gradient1.addColorStop(0.6,'rgb(150,100,100)');
        gradient1.addColorStop(0.8,'rgb(0,255,255)');

        const gradient2 = this.context.createLinearGradient(0,0,this.width,this.height)
        gradient2.addColorStop(0.2,'rgb(255,255,0)');
        gradient2.addColorStop(0.4,'rgb(200,5,50)');
        gradient2.addColorStop(0.6,'rgb(150,255,255)');
        gradient2.addColorStop(0.8,'rgb(255,255,255)');
        
        const gradient3 = this.context.createRadialGradient(this.width * 0.5,this.height * 0.5, 10, this.width * 0.5,this.height * 0.5, this.width)
        gradient3.addColorStop(0.2,'rgb(0,0,255)');
        gradient3.addColorStop(0.4,'rgb(200,255,0)');
        gradient3.addColorStop(0.6,'rgb(0,0,255)');
        gradient3.addColorStop(0.8,'rgb(0,0,0)');

        this.context.fillStyle = gradient1;
        this.context.fillText('JS', this.width * 0.5, this.height * 0.5, this.width);
     }
     drawFlowFieldImage(){
        let imageSize = this.width * 0.7;

        this.context.drawImage(this.image,this.width * 0.5 - imageSize * 0.5 ,this.height * 0.5 - imageSize * 0.5, imageSize,imageSize);
     }
     init(){
        // creates flow field
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);
        this.flowField = [];

        //  draw image
        this.drawFlowFieldImage();

        // scan pixel data
        const pixels = this.context.getImageData(0, 0, this.width, this.height).data;
        for (let y = 0; y < this.height; y += this.cellSize){
            for (let x = 0; x<this.width; x += this.cellSize){
                const index = (y * this.width + x) * 4;
                const red = pixels[index];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];
                const alpha = pixels[index + 3];
                const grayscale = (red + green + blue) / 3;
                const colorAngle = ((grayscale/255) * 6.28).toFixed(2);
                this.flowField.push({
                    x: x,
                    y: y,
                    alpha: alpha,
                    colorAngle: colorAngle
                });
            }
        }

        // create particles
        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this))
        }
        this.particles.forEach(particle => particle.reset())
     }
     drawGrid(){
        this.context.save();
        this.context.strokeStyle = 'White'
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
            this.drawFlowFieldImage()
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