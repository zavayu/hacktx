import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
    generatePersonalizedRoadmap,
    type Milestone,
    type UserData,
} from "../utils/roadmapGenerator";
import milestonesData from "../data/milestone.json";
import {
    XMarkIcon,
    TrophyIcon,
    CheckCircleIcon
} from "@heroicons/react/24/solid";

const Roadmap = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [roadmap, setRoadmap] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
    const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserDataAndGenerateRoadmap() {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserData;
                    setUserData(data);

                    // Generate personalized roadmap
                    const milestones = await generatePersonalizedRoadmap(
                        data,
                        milestonesData as Milestone[]
                    );
                    setRoadmap(milestones);
                } else {
                    setError("User profile not found. Please complete the survey first.");
                }
            } catch (err) {
                console.error("Error fetching user data or generating roadmap:", err);
                setError("Failed to load your personalized roadmap. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchUserDataAndGenerateRoadmap();
    }, [currentUser]);

    // Get milestone icon based on tags and difficulty
    const getMilestoneIcon = (milestone: Milestone) => {
        const tags = milestone.tags.join(" ").toLowerCase();

        if (tags.includes("credit_start") || tags.includes("beginner")) return "🎯";
        if (tags.includes("credit_score")) return "📊";
        if (tags.includes("credit_mix")) return "💳";
        if (tags.includes("rewards") || tags.includes("cashback")) return "💰";
        if (tags.includes("travel")) return "✈️";
        if (tags.includes("premium") || tags.includes("advanced")) return "👑";
        if (tags.includes("awareness") || tags.includes("security")) return "🔒";
        if (tags.includes("credit_health") || tags.includes("payments")) return "💚";
        if (tags.includes("discipline")) return "🎖️";

        return "⭐";
    };

    // (removed legacy color helper in favor of fixed palette)

    const toggleMilestoneCompletion = (milestoneId: string) => {
        setCompletedMilestones(prev => {
            const newSet = new Set(prev);
            const wasCompleted = newSet.has(milestoneId);
            
            if (wasCompleted) {
                newSet.delete(milestoneId);
            } else {
                newSet.add(milestoneId);
                // Trigger celebration effect
                setCelebratingMilestone(milestoneId);
                setTimeout(() => setCelebratingMilestone(null), 2000);
            }
            
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#80B3ED]/10 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#80B3ED] mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating your personalized roadmap...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#80B3ED]/10 flex items-center justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center"
                >
                    <div className="w-16 h-16 bg-[#D2A0F0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-[#D2A0F0]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a
                        href="/survey"
                        className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Complete Survey
                    </a>
                </motion.div>
            </div>
        );
    }

    if (!userData?.bankLinked) {
        return (
            <div className="min-h-screen bg-[#80B3ED]/10 flex items-center justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center"
                >
                    <div className="w-16 h-16 bg-[#D2A0F0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-[#D2A0F0]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Complete Your Profile
                    </h2>
                    <p className="text-gray-600 mb-6">
                        To see your personalized roadmap, please complete the onboarding survey
                        and link your bank account.
                    </p>
                    <a
                        href="/survey"
                        className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Complete Survey
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#80B3ED]/10 relative overflow-hidden">
            {/* Header */}
            <div className="relative z-10 py-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Your Credit Journey
                    </h1>
                    <p className="text-lg text-gray-600">
                        Tap each milestone to learn more
                    </p>
                    <div className="mt-4 flex justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#7FC656] flex items-center justify-center">
                                <CheckCircleIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm text-gray-600">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#80B3ED] flex items-center justify-center">
                                <span className="text-white text-sm">⭐</span>
                            </div>
                            <span className="text-sm text-gray-600">To Do</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Roadmap Path */}
            <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
                <div className="relative">
                    {/* Vertical Path Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-[#D2A0F0]" />

                    {/* Milestone Nodes */}
                    {roadmap.map((milestone, index) => {
                        const isCompleted = completedMilestones.has(milestone.id);
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.15 }}
                                className={`relative mb-24 flex items-center ${isEven ? "justify-start" : "justify-end"
                                    }`}
                            >
                                {/* Milestone Node */}
                                <div
                                    className={`relative ${isEven ? "mr-auto pr-16" : "ml-auto pl-16"} w-1/2`}
                                >
                                    {/* Connecting Line to Center */}
                                    <div
                                        className={`absolute top-1/2 ${isEven ? "right-0" : "left-0"} w-16 h-0.5 bg-[#D2A0F0]`}
                                    />

                                    {/* Node Card */}
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedMilestone(milestone)}
                                        className="relative cursor-pointer transition-all"
                                        animate={
                                            celebratingMilestone === milestone.id && !completedMilestones.has(milestone.id)
                                                ? {
                                                    scale: [1, 1.15, 1],
                                                    rotate: [0, -10, 10, -10, 0],
                                                }
                                                : {}
                                        }
                                        transition={{ duration: 0.5 }}
                                    >
                                        {/* Main Node Circle */}
                                        <div className="flex flex-col items-center">
                                            <motion.div
                                                className={`w-20 h-20 rounded-full border-4 ${isCompleted ? "bg-[#7FC656] border-[#7FC656]" : (milestone.difficulty.toLowerCase() === "easy" ? "bg-[#80B3ED] border-[#80B3ED]" : "bg-[#D2A0F0] border-[#D2A0F0]")} shadow-xl flex items-center justify-center text-3xl transition-all hover:shadow-2xl relative overflow-hidden`}
                                                animate={
                                                    celebratingMilestone === milestone.id && !completedMilestones.has(milestone.id)
                                                        ? {
                                                            boxShadow: [
                                                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                                "0 10px 40px 0px rgba(147, 51, 234, 0.6)",
                                                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                            ]
                                                        }
                                                        : {}
                                                }
                                                transition={{ duration: 0.8 }}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircleIcon className="w-10 h-10 text-white" />
                                                ) : (
                                                    <span className="filter drop-shadow-md">
                                                        {getMilestoneIcon(milestone)}
                                                    </span>
                                                )}

                                                {/* Removed shine scan effect for flat look */}
                                                
                                                {/* Celebration effect */}
                                                {celebratingMilestone === milestone.id && (
                                                    <>
                                                        {/* Pulse ring */}
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-4 border-[#7FC656]"
                                                            initial={{ scale: 1, opacity: 1 }}
                                                            animate={{ scale: 2.5, opacity: 0 }}
                                                            transition={{ duration: 0.8 }}
                                                        />
                                                        {/* Confetti particles */}
                                                        {[...Array(8)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="absolute w-2 h-2 rounded-full"
                                                                style={{
                                                                    backgroundColor: ['#80B3ED', '#D2A0F0'][i % 2],
                                                                    top: '50%',
                                                                    left: '50%',
                                                                }}
                                                                initial={{ scale: 0, x: 0, y: 0 }}
                                                                animate={{
                                                                    scale: [0, 1, 0],
                                                                    x: Math.cos((i * Math.PI * 2) / 8) * 60,
                                                                    y: Math.sin((i * Math.PI * 2) / 8) * 60,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    ease: "easeOut"
                                                                }}
                                                            />
                                                        ))}
                                                    </>
                                                )}
                                            </motion.div>

                                            {/* Title Card */}
                                            <div className="mt-4 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                                                <h3 className="text-sm font-bold text-gray-900 text-center mb-2">
                                                    {milestone.title}
                                                </h3>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
                                                        <TrophyIcon className="w-3 h-3 text-yellow-600" />
                                                        <span className="text-xs font-semibold text-yellow-700">
                                                            {milestone.reward_xp} XP
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${milestone.difficulty === "easy" ? "bg-green-100 text-green-700" : milestone.difficulty === "medium" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
                                                    >
                                                        {milestone.difficulty}
                                                    </div>
                                                </div>

                                                {/* Step Number Badge */}
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#D2A0F0] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200"
                >
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold text-[#D2A0F0]">
                                {completedMilestones.size}/{roadmap.length}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Completed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-600">
                                {Array.from(completedMilestones).reduce((sum, id) => {
                                    const milestone = roadmap.find(m => m.id === id);
                                    return sum + (milestone?.reward_xp || 0);
                                }, 0)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">XP Earned</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[#80B3ED]">
                                {roadmap.reduce((sum, m) => sum + m.reward_xp, 0)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Total XP</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Sidebar Modal */}
            <AnimatePresence>
                {selectedMilestone && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ backdropFilter: "blur(0px)" }}
                            animate={{ backdropFilter: "blur(8px)" }}
                            exit={{ backdropFilter: "blur(0px)" }}
                            onClick={() => setSelectedMilestone(null)}
                            className="fixed inset-0 z-40"
                            style={{ backdropFilter: "blur(8px)" }}
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#D2A0F0] text-white p-6 z-10">
                                <button
                                    onClick={() => setSelectedMilestone(null)}
                                    className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
                                        {getMilestoneIcon(selectedMilestone)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-2">
                                            {selectedMilestone.title}
                                        </h2>
                                        <div className="flex gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMilestone.difficulty === "easy"
                                                        ? "bg-green-100 text-green-700"
                                                        : selectedMilestone.difficulty === "medium"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {selectedMilestone.difficulty.toUpperCase()}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20">
                                                {selectedMilestone.reward_xp} XP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        Description
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {selectedMilestone.description}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        Categories
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMilestone.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                                            >
                                                {tag.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Requirements */}
                                {selectedMilestone.requirements.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                                            Requirements
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <ul className="space-y-2">
                                                {selectedMilestone.requirements.map((req) => (
                                                    <li key={req} className="flex items-center gap-2 text-sm text-gray-700">
                                                        <span className="text-gray-400">📌</span>
                                                        <span>{req.replace(/_/g, " ")}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Reward */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        Reward
                                    </h3>
                                    <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <TrophyIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {selectedMilestone.reward_xp} XP
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Experience Points
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            toggleMilestoneCompletion(selectedMilestone.id);
                                            // Close sidebar after completion
                                            setTimeout(() => setSelectedMilestone(null), 1500);
                                        }}
                                        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${completedMilestones.has(selectedMilestone.id)
                                                ? "bg-[#7FC656] hover:opacity-90"
                                                : "bg-[#D2A0F0] hover:opacity-90 shadow-lg hover:shadow-xl"
                                            }`}
                                    >
                                        {completedMilestones.has(selectedMilestone.id)
                                            ? "✓ Mark as Incomplete"
                                            : "🎉 Mark as Complete"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Side decor with animations */}
            <motion.img 
                src="/earth.svg" 
                alt="Earth" 
                aria-hidden 
                className="absolute left-10 bottom-16 w-36 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [0, 360],
                    y: [0, -5, 0]
                }}
                transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/jupiter.svg" 
                alt="Jupiter" 
                aria-hidden 
                className="absolute right-4 top-28 w-40 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [0, -360],
                    y: [0, 3, 0]
                }}
                transition={{ 
                    rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/bluestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-20 top-20 w-6 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [12, 372],
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/purplestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-24 bottom-24 w-8 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-6, 354],
                    scale: [1, 1.15, 1]
                }}
                transition={{ 
                    rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/bluestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-40 top-1/3 w-5 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [0, 360],
                    y: [0, -3, 0]
                }}
                transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/purplestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-32 bottom-1/3 w-5 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [0, -360],
                    y: [0, 4, 0]
                }}
                transition={{ 
                    rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/saturn.svg" 
                alt="Saturn" 
                aria-hidden 
                className="absolute left-4 top-36 w-32 opacity-40 pointer-events-none select-none hidden lg:block" 
                animate={{ 
                    rotate: [0, 360],
                    x: [0, 2, 0]
                }}
                transition={{ 
                    rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                    x: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/cloudsleft.svg" 
                alt="Clouds" 
                aria-hidden 
                className="absolute left-6 top-4 w-40 opacity-30 pointer-events-none select-none hidden lg:block" 
                animate={{ 
                    x: [0, 5, 0],
                    opacity: [0.3, 0.4, 0.3]
                }}
                transition={{ 
                    x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/cloudsright.svg" 
                alt="Clouds" 
                aria-hidden 
                className="absolute right-6 top-12 w-40 opacity-30 pointer-events-none select-none hidden lg:block" 
                animate={{ 
                    x: [0, -5, 0],
                    opacity: [0.3, 0.4, 0.3]
                }}
                transition={{ 
                    x: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/fireball.svg" 
                alt="Fireball" 
                aria-hidden 
                className="absolute left-1/4 -translate-x-1/3 -top-[-10] w-16 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [12, 372],
                    scale: [1, 1.2, 1],
                    y: [0, -2, 0]
                }}
                transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/redstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-16 top-1/2 w-4 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/greenstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-16 top-2/3 w-5 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [0, -360],
                    y: [0, 3, 0]
                }}
                transition={{ 
                    rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            
            {/* Additional scattered stars with animations */}
            <motion.img 
                src="/bluestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-12 top-1/4 w-3 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [45, 405],
                    scale: [1, 1.2, 1]
                }}
                transition={{ 
                    rotate: { duration: 9, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/purplestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-20 top-1/4 w-4 opacity-45 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-30, 330],
                    y: [0, -2, 0]
                }}
                transition={{ 
                    rotate: { duration: 11, repeat: Infinity, ease: "linear" },
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/redstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-28 top-3/4 w-3 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [60, 420],
                    scale: [1, 1.15, 1]
                }}
                transition={{ 
                    rotate: { duration: 7, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/greenstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-28 top-1/5 w-4 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-45, 315],
                    y: [0, 2, 0]
                }}
                transition={{ 
                    rotate: { duration: 13, repeat: Infinity, ease: "linear" },
                    y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/bluestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-36 top-1/6 w-3 opacity-45 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [15, 375],
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    rotate: { duration: 14, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/purplestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-36 top-4/5 w-4 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-15, 345],
                    y: [0, -3, 0]
                }}
                transition={{ 
                    rotate: { duration: 16, repeat: Infinity, ease: "linear" },
                    y: { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/redstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-8 top-1/8 w-3 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [75, 435],
                    scale: [1, 1.2, 1]
                }}
                transition={{ 
                    rotate: { duration: 8.5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2.7, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/greenstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-8 top-7/8 w-4 opacity-45 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-60, 300],
                    y: [0, 2, 0]
                }}
                transition={{ 
                    rotate: { duration: 12.5, repeat: Infinity, ease: "linear" },
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/bluestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute left-44 top-2/5 w-3 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [30, 390],
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    rotate: { duration: 17, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3.3, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/purplestar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-44 top-3/5 w-4 opacity-40 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-30, 330],
                    y: [0, -2, 0]
                }}
                transition={{ 
                    rotate: { duration: 19, repeat: Infinity, ease: "linear" },
                    y: { duration: 3.7, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            <motion.img 
                src="/greenstar.svg" 
                alt="star" 
                aria-hidden 
                className="absolute right-20 top-11/12 w-4 opacity-50 pointer-events-none select-none hidden md:block" 
                animate={{ 
                    rotate: [-90, 270],
                    scale: [1, 1.15, 1]
                }}
                transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2.9, repeat: Infinity, ease: "easeInOut" }
                }}
            />
        </div>
    );
};

export default Roadmap;
