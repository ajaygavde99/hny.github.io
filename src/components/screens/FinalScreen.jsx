import { motion } from "framer-motion"
import Image from "next/image"
import { Fireworks } from 'fireworks-js'
import { useEffect, useRef } from "react"

export default function FinalScreen() {
    const fireworksRef = useRef(null)

    useEffect(() => {
        if (fireworksRef.current) {
            const fireworks = new Fireworks(fireworksRef.current, { /* options */ 
                autoresize: true,
                opacity: 0.5,
                acceleration: 0.6,
                friction: 0.97,
                gravity: 1.5,
                particles: 50,
                traceLength: 3,
                traceSpeed: 10,
                explosion: 5,
                intensity: 30,
                flickering: 50,
                lineStyle: 'round',
                hue: {
                    min: 0,
                    max: 360
                },
                delay: {
                    min: 30,
                    max: 60
                },
                rocketsPoint: {
                    min: 50,
                    max: 50
                },
                lineWidth: {
                    explosion: {
                    min: 1,
                    max: 3
                    },
                    trace: {
                    min: 1,
                    max: 2
                    }
                },
                brightness: {
                    min: 50,
                    max: 80
                },
                decay: {
                    min: 0.015,
                    max: 0.03
                },
                mouse: {
                    click: false,
                    move: false,
                    max: 1
                }
            })
            fireworks.start()
            return () => fireworks.stop()
        }
    }, [])

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
            {/* Fireworks Container */}
            <div ref={fireworksRef} style={{ width: '100vw', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 0 }} />
        </motion.div>
    )
}