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
        <div className="w-72 bg-white/50 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-4 shadow-xl shadow-indigo-500/5 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
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

                <div className="my-4 border-t border-gray-100 dark:border-white/5" />

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

    // Check if any child is selected to auto-expand
    React.useEffect(() => {
        if (node.children?.some(child => child.id === selectedId)) {
            setIsOpen(true);
        }
    }, [selectedId, node.children]);

    return (
        <div className="select-none">
            <motion.div
                whileHover={{ x: 4 }}
                onClick={() => {
                    onSelect(node.id);
                    if (hasChildren) {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                `}
                style={{ marginRight: level * 16 }}
            >
                {/* Active Indicator Line */}
                {isSelected && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-l-full"
                    />
                )}

                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-gray-100 dark:bg-white/5'}
                `}>
                    {node.icon}
                </div>

                <span className={`text-sm font-medium flex-1 ${isSelected ? 'font-bold' : ''}`}>
                    {node.label}
                </span>

                {hasChildren && (
                    <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
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
                            <div className="absolute right-[22px] top-0 bottom-4 w-px bg-gray-200 dark:bg-white/10" />

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
