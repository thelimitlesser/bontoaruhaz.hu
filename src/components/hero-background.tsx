"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function HeroBackground() {
    return (
        <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
            <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.05, y: 0 }}
                animate={{
                    y: [-10, 10, -10],
                    scale: 1.05 // Keep scale constant to avoid jitter, just move up/down
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Image
                    src="/hero-bg.png"
                    alt="Bontóáruház Autóalkatrészek"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                    quality={90}
                />
            </motion.div>
            {/* Overlays */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 transition-colors duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 transition-colors duration-300"></div>
        </div>
    );
}
