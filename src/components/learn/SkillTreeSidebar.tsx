import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Folder, FileCode, Hash, Cpu, Globe, Database, Layers, BarChart, Shield, Sparkles } from 'lucide-react';

export interface SkillNode {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: SkillNode[];
}

export const skillTreeData: SkillNode[] = [
    {
        id: 'ai-foundations',
        label: 'أساسيات الذكاء الاصطناعي',
        icon: <BrainIcon />,
        children: [
            { id: 'machine-learning', label: 'تعلم الآلة', icon: <Hash className="w-3.5 h-3.5" /> },
            { id: 'deep-learning', label: 'التعلم العميق', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'nlp', label: 'معالجة اللغة الطبيعية', icon: <FileCode className="w-3.5 h-3.5" /> },
        ]
    },
    {
        id: 'ai-skills',
        label: 'مهارات الذكاء الاصطناعي',
        icon: <SparklesIcon />,
        children: [
            { id: 'prompt-engineering', label: 'هندسة الأوامر', icon: <Hash className="w-3.5 h-3.5" /> },
            { id: 'ai-tools-mastery', label: 'إتقان أدوات AI', icon: <Layers className="w-3.5 h-3.5" /> },
        ]
    },
    {
        id: 'web-dev',
        label: 'تطوير الويب',
        icon: <GlobeIcon />,
        children: [
            { id: 'frontend', label: 'الواجهة الأمامية (React)', icon: <FileCode className="w-3.5 h-3.5" /> },
            { id: 'backend', label: 'الواجهة الخلفية (Node.js)', icon: <Database className="w-3.5 h-3.5" /> },
        ]
    },
    {
        id: 'computer-science',
        label: 'علوم الحاسب',
        icon: <CpuIcon />,
        children: [
            { id: 'algorithms', label: 'الخوارزميات', icon: <Hash className="w-3.5 h-3.5" /> },
            { id: 'system-design', label: 'تصميم الأنظمة', icon: <Layers className="w-3.5 h-3.5" /> },
        ]
    },
    {
        id: 'data-analysis',
        label: 'تحليل البيانات',
        icon: <DataIcon />,
        children: [
            { id: 'python-data', label: 'Python للبيانات', icon: <FileCode className="w-3.5 h-3.5" /> },
            { id: 'sql', label: 'SQL', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'visualization', label: 'تصوير البيانات', icon: <BarChart className="w-3.5 h-3.5" /> },
        ]
    },
    {
        id: 'design',
        label: 'التصميم',
        icon: <DesignIcon />,
        children: [
            { id: 'ui-ux', label: 'واجهة وتجربة المستخدم', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'graphic', label: 'تصميم الجرافيك', icon: <Layers className="w-3.5 h-3.5" /> },
        ]
    },
    {
        id: 'cybersecurity',
        label: 'الأمن السيبراني',
        icon: <SecurityIcon />,
        children: [
            { id: 'ethical-hacking', label: 'الاختراق الأخلاقي', icon: <Hash className="w-3.5 h-3.5" /> },
            { id: 'network-security', label: 'أمن الشبكات', icon: <Globe className="w-3.5 h-3.5" /> },
        ]
    }
];

function BrainIcon() { return <Cpu className="w-4 h-4 text-purple-500" />; }
function GlobeIcon() { return <Globe className="w-4 h-4 text-blue-500" />; }
function CpuIcon() { return <Cpu className="w-4 h-4 text-green-500" />; }
function DataIcon() { return <BarChart className="w-4 h-4 text-orange-500" />; }
function DesignIcon() { return <Layers className="w-4 h-4 text-pink-500" />; }
function SecurityIcon() { return <Shield className="w-4 h-4 text-red-500" />; }
function SparklesIcon() { return <Sparkles className="w-4 h-4 text-yellow-500" />; }

interface SkillTreeSidebarProps {
    onSelectCategory: (category: string) => void;
    selectedCategory: string;
}

const SkillTreeSidebar: React.FC<SkillTreeSidebarProps> = ({ onSelectCategory, selectedCategory }) => {
    return (
        <div className="w-72 bg-[#0f1322]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-2xl h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 px-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                مستكشف المسارات
            </h2>

            <div className="space-y-1">
                <SkillTreeNode
                    node={{ id: 'all', label: 'كل المسارات', icon: <Folder className="w-4 h-4 text-yellow-500" /> }}
                    level={0}
                    onSelect={onSelectCategory}
                    selectedId={selectedCategory}
                    startOpen={true}
                />

                <div className="my-4 border-t border-white/5" />

                {skillTreeData.map(node => (
                    <SkillTreeNode
                        key={node.id}
                        node={node}
                        level={0}
                        onSelect={onSelectCategory}
                        selectedId={selectedCategory}
                    />
                ))}
            </div>
        </div>
    );
};

const SkillTreeNode: React.FC<{
    node: SkillNode;
    level: number;
    onSelect: (id: string) => void;
    selectedId: string;
    startOpen?: boolean;
}> = ({ node, level, onSelect, selectedId, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;
    const isChildSelected = node.children?.some(child => child.id === selectedId);

    // Check if any child is selected to auto-expand
    React.useEffect(() => {
        if (node.children?.some(child => child.id === selectedId)) {
            setIsOpen(true);
        }
    }, [selectedId, node.children]);

    return (
        <div className="select-none">
            <motion.div
                whileHover={{ x: -4 }}
                onClick={() => {
                    onSelect(node.id);
                    if (hasChildren) {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                    }
                `}
                style={{ marginRight: level * 16 }}
            >
                {/* Active Indicator Line */}
                {isSelected && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-l-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    />
                )}

                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-[#0f1322] border border-white/5'}
                `}>
                    {node.icon}
                </div>

                <span className="text-sm font-medium flex-1">
                    {node.label}
                </span>

                {hasChildren && (
                    <div className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 space-y-1 relative pr-4">
                            {/* Connector Line */}
                            <div className="absolute right-[22px] top-0 bottom-4 w-px bg-white/5" />
                            {isChildSelected && (
                                <motion.div
                                    initial={{ opacity: 0.5 }}
                                    animate={{
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute right-[22px] top-0 bottom-4 w-px bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"
                                />
                            )}

                            {node.children!.map(child => (
                                <SkillTreeNode
                                    key={child.id}
                                    node={child}
                                    level={level + 1}
                                    onSelect={onSelect}
                                    selectedId={selectedId}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillTreeSidebar;
