'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { FiHome } from "react-icons/fi";
import { CiWallet } from "react-icons/ci";
import { GoTasklist } from "react-icons/go";
import { IoPersonAddOutline } from "react-icons/io5";

export default function PortiqBottomNav({ activeTab, setActiveTab }) {
    const [isVisible, setIsVisible] = useState(true);

    const navItems = [
        { 
            id: 'home', 
            icon: <FiHome size={24} />, 
            label: 'Home',
            color: 'from-[#FF007F] to-[#FF2FB3]',
            bgColor: 'rgba(255, 0, 127, 0.1)'
        },
        { 
            id: 'dataCenter', 
            icon: <CiWallet size={24} />, 
            label: 'Analytics',
            color: 'from-[#FFB82A] to-[#FF5A2A]',
            bgColor: 'rgba(255, 184, 42, 0.1)'
        },
        { 
            id: 'SPAI', 
            icon: <Image src="/agent/agentlogo.png" alt="AI Agent" width={28} height={28} className='scale-150'/>, 
            label: 'AI Agent',
            isSpecial: true,
            color: 'from-[#FF2FB3] to-[#6C00B8]',
            bgColor: 'rgba(255, 47, 179, 0.15)'
        },
        { 
            id: 'invite', 
            icon: <IoPersonAddOutline size={24} />, 
            label: 'Invite',
            color: 'from-[#6C00B8] to-[#FF007F]',
            bgColor: 'rgba(108, 0, 184, 0.1)'
        },
        { 
            id: 'task', 
            icon: <GoTasklist size={24} />, 
            label: 'Tasks',
            color: 'from-[#FF5A2A] to-[#FFB82A]',
            bgColor: 'rgba(255, 90, 42, 0.1)'
        },
    ];

    return (
        <motion.div 
            className="glass glass-p w-full max-w-md mx-3 bottomnav backdrop-blur-xl rounded-t-3xl py-2 shadow-2xl border-t border-[#FF007F]/20"
            style={{
                background: `linear-gradient(135deg, 
                    rgba(11, 12, 16, 0.95) 0%, 
                    rgba(26, 26, 29, 0.95) 100%)`
            }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <nav className={cn(
                "flex justify-around items-center w-full transition-all duration-300 px-2",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            )}>
                {navItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            href={`/?tab=${item.id}`}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex flex-col items-center relative transition-all duration-300 rounded-2xl",
                                activeTab === item.id
                                    ? "text-white"
                                    : "text-gray-400 hover:text-white"
                            )}
                        >
                            {/* Icon Container */}
                            <motion.div 
                                className={cn(
                                    "relative flex items-center justify-center rounded-2xl transition-all duration-300",
                                    activeTab === item.id 
                                        ? "w-12 h-12 mb-1" 
                                        : "w-10 h-10 mb-1",
                                    item.isSpecial ? "w-14 h-14" : ""
                                )}
                                style={{
                                    background: activeTab === item.id ? item.bgColor : 'transparent'
                                }}
                                animate={{
                                    scale: activeTab === item.id ? 1.1 : 1,
                                }}
                            >
                                {/* Active state glow effect */}
                                {activeTab === item.id && (
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl z-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${item.color.split(' ')[1]} 0%, ${item.color.split(' ')[3]} 100%)`,
                                            opacity: 0.1
                                        }}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 0.1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                {/* Icon */}
                                <div className={cn(
                                    "transition-all duration-300 flex items-center justify-center relative z-10",
                                )}>
                                    {item.icon}
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </nav>
        </motion.div>
    );
}
