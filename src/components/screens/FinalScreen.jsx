import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect } from "react"

export default function FinalScreen() {
    useEffect(() => {
        const canvas = document.getElementById('fireworks-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W = window.innerWidth;
        let H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function Particle(x, y, angle, speed, color) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.speed = speed;
            this.color = color;
            this.radius = 2;
            this.alpha = 1;
            this.gravity = 0.02;
            this.friction = 0.98;
            this.update = function() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed + this.gravity;
                this.speed *= this.friction;
                this.alpha -= 0.01;
            };
            this.draw = function(ctx) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            };
        }

        function Firework(x, y, targetY, color) {
            this.x = x;
            this.y = y;
            this.targetY = targetY;
            this.color = color;
            this.speed = 4;
            this.exploded = false;
            this.particles = [];
            this.update = function() {
                if (!this.exploded) {
                    this.y -= this.speed;
                    if (this.y <= this.targetY) {
                        this.exploded = true;
                        for (let i = 0; i < 50; i++) {
                            const angle = (Math.PI * 2 * i) / 50;
                            const speed = random(2, 5);
                            this.particles.push(new Particle(this.x, this.y, angle, speed, this.color));
                        }
                    }
                } else {
                    this.particles.forEach(p => p.update());
                    this.particles = this.particles.filter(p => p.alpha > 0);
                }
            };
            this.draw = function(ctx) {
                if (!this.exploded) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.restore();
                } else {
                    this.particles.forEach(p => p.draw(ctx));
                }
            };
        }

        let fireworks = [];

        function launchFirework() {
            const x = random(W * 0.2, W * 0.8);
            const y = H;
            const targetY = random(H * 0.2, H * 0.5);
            const color = `hsl(${random(0, 360)}, 100%, 60%)`;
            fireworks.push(new Firework(x, y, targetY, color));
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            fireworks.forEach(fw => {
                fw.update();
                fw.draw(ctx);
            });
            fireworks = fireworks.filter(fw => !fw.exploded || fw.particles.length > 0);
            requestAnimationFrame(animate);
        }

        let interval = setInterval(launchFirework, 700);
        animate();

        window.addEventListener('resize', () => {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
        });

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <motion.div
            className="flex flex-col items-center justify-center h-full w-full text-center px-2"
        >
            {/* GIF */}
            <motion.div
                className="w-40 h-40 p-4 rounded-full bg-pink-900/10 border-2 border-pink-400/25 backdrop-blur-sm flex items-center justify-center overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <Image
                    loading="lazy"
                    src='/gifs/cute.gif'
                    width={130}
                    height={130}
                    alt='cute gif'
                    className='object-contain'
                    unoptimized
                />
            </motion.div>
            {/* Final Text */}
            <motion.h2
                className="mt-8 text-3xl md:text-4xl font-dancing-script text-zinc-50 font-medium leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                You’ll always be special to me
                Happy New Year Babe! ❤️
            </motion.h2>
            {/* Fireworks Canvas */}
            <canvas
                id="fireworks-canvas"
                style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 0 }}
            />
        </motion.div>
    )
}