'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function BottomNav({ activeTab, setActiveTab }) {
    const [isVisible, setIsVisible] = useState(true);

    const navItems = [
        { id: 'home', icon: '/bottomnav/home.svg', label: 'Agent' },
        { id: 'dataCenter', icon: '/bottomnav/ai-tasks.svg', label: 'Data center' },
        { 
            id: 'SPAI', 
            icon: '/agent/agentlogo.png', 
            label: 'SPAI',
            isSpecial: true
        },
        { id: 'invite', icon: '/bottomnav/invite.svg', label: 'Invite' },
        { id: 'task', icon: '/bottomnav/tasks.svg', label: 'Task' },
    ];

    return (
        <div className="glass-blue w-full bottomnav backdrop-blur-sm rounded-t-xl py-1 shadow-xl">
            <nav className={cn(
                "flex justify-around items-center w-full transition-all duration-300 transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            )}>
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={`/?tab=${item.id}`}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "flex flex-col items-center px-2.5 py-2 relative transition-all duration-300 rounded-lg",
                            activeTab === item.id
                                ? "text-white"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        <div className={cn(
                            "transition-all duration-300 flex items-center justify-center",
                            activeTab === item.id && !item.isSpecial
                                ? "text-white"
                                : "",
                            item.isSpecial ? "" : "mb-1"
                        )}>
                            <Image 
                                src={item.icon} 
                                width={50} 
                                height={50} 
                                quality={80} 
                                alt={item.label} 
                                className={cn(
                                    activeTab === item.id 
                                        ? "scale-[72%]" 
                                        : "scale-[70%]",
                                    item.isSpecial ? "scale-[105%] mt-1" : ""
                                )}
                            />
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium transition-all duration-300 hidden",
                            activeTab === item.id
                                ? "opacity-100 text-white"
                                : "opacity-70 text-gray-400",
                            item.isSpecial ? "mt-1" : ""
                        )}>
                            {item.label}
                        </span>
                        {activeTab === item.id && (
                            <div className="absolute hidden -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );
}