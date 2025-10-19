import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCardRecommendations } from "../utils/useCardRecommendations";
import { motion } from "framer-motion";
import CardModal from "./CardModal";
import type { CreditCard, UserProfile } from "../utils/creditCardMatcher";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Component to display credit card recommendations
 */
export default function CardRecommendations() {
    const { currentUser } = useAuth();
    const { rank, cards, loading, error } = useCardRecommendations(
        currentUser?.uid
    );
    const [selectedCard, setSelectedCard] = useState<{
        card: CreditCard;
        similarity: number;
    } | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    // Fetch user profile for personalized insights
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!currentUser?.uid) return;
            
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserProfile({
                        creditScore: data.creditScore || "",
                        annualIncome: data.annualIncome || "",
                        employmentStatus: data.employmentStatus || "",
                        hasCreditCards: data.hasCreditCards || "no",
                        creditCards: data.creditCards || [],
                        creditLength: data.creditLength || "",
                        latePayments: data.latePayments || "none",
                        creditGoal: data.creditGoal || "",
                        citizenshipStatus: data.citizenshipStatus || "",
                        purchases: data.purchases || [],
                    });
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        fetchUserProfile();
    }, [currentUser]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex items-center justify-center">
                    <svg
                        className="animate-spin h-8 w-8 text-purple-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="ml-3 text-gray-600">
                        Finding your perfect cards...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="text-center">
                    <p className="text-red-600 mb-2">⚠️ {error}</p>
                    {error.includes("survey") && (
                        <a
                            href="/survey"
                            className="text-purple-600 hover:text-purple-700 underline"
                        >
                            Complete Survey
                        </a>
                    )}
                </div>
            </div>
        );
    }

    const getRankBadge = (rank: string) => {
        const badges = {
            tenderfoot: {
                color: "bg-green-100 text-green-800",
                icon: "🌱",
                title: "Tenderfoot",
                description: "Building your credit foundation",
            },
            journeyman: {
                color: "bg-blue-100 text-blue-800",
                icon: "⚡",
                title: "Journeyman",
                description: "Growing your credit portfolio",
            },
            mobster: {
                color: "bg-purple-100 text-purple-800",
                icon: "👑",
                title: "Mobster",
                description: "Premium cards for premium rewards",
            },
        };

        return badges[rank as keyof typeof badges] || badges.journeyman;
    };

    const badge = getRankBadge(rank);

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 overflow-visible shadow-sm">
                {/* Rank Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                            Your Recommended Cards
                        </h2>
                        <div
                            className={`px-4 py-2 rounded-full ${badge.color} font-semibold flex items-center gap-2`}
                        >
                            <span>{badge.icon}</span>
                            <span>{badge.title}</span>
                        </div>
                    </div>
                    <p className="text-gray-600">{badge.description}</p>
                </motion.div>

                {/* Card Journey - Horizontal Wavy Path */}
                <div className="relative w-full">
                    {/* Left Arrow */}
                    {showLeftArrow && cards.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => scroll('left')}
                            style={{ backgroundColor: '#D2A0F0' }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 text-white p-3 rounded-full shadow-xl transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                    )}

                    {/* Right Arrow */}
                    {showRightArrow && cards.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => scroll('right')}
                            style={{ backgroundColor: '#D2A0F0' }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 text-white p-3 rounded-full shadow-xl transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </motion.button>
                    )}

                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="relative w-full overflow-x-auto overflow-y-visible py-32 px-4 scrollbar-hide" 
                        style={{ minHeight: '600px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                    {cards.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No recommendations available. Please complete your
                            profile.
                        </p>
                    ) : (
                        <>
                            {/* Wavy Path SVG */}
                            <svg
                                className="absolute top-1/2 left-0 w-full h-64 transform -translate-y-1/2 pointer-events-none z-0"
                                viewBox="0 0 2400 200"
                                preserveAspectRatio="none"
                            >
                                <motion.path
                                    d="M 150 100 Q 375 30, 600 100 T 1050 100 T 1500 100 T 1950 100 T 2400 100"
                                    stroke="#D2A0F0"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                            </svg>

                            {/* Cards along the wavy path */}
                            <div className="relative flex items-center justify-start gap-8 min-w-max pl-8 pr-24 z-10">
                                {cards.map((recommendation, index) => {
                                    // Create wave effect: alternate up and down (even cards higher, odd cards lower)
                                    const waveOffset = index % 2 === 0 ? -70 : 70;
                                    const delay = index * 0.15;
                                    
                                    // Get star color based on rank
                                    const getStarIcon = (position: number) => {
                                        switch(position) {
                                            case 0: return '/greenstar.svg';  // 1st place
                                            case 1: return '/bluestar.svg';   // 2nd place
                                            case 2: return '/purplestar.svg'; // 3rd place
                                            case 3: return '/redstar.svg';    // 4th place
                                            default: return '/purplestar.svg'; // 5th place
                                        }
                                    };
                                    
                                    const getRankNumber = (position: number) => position + 1;
                                    
                                    const getRankSuffix = (position: number) => {
                                        switch(position) {
                                            case 0: return 'st';
                                            case 1: return 'nd';
                                            case 2: return 'rd';
                                            case 3: return 'th';
                                            default: return 'th';
                                        }
                                    };
                                    
                                    const randomRotation = (Math.random() - 0.5) * 4; // Random rotation between -2 and 2 degrees
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="relative flex-shrink-0 mx-6"
                                            style={{
                                                transform: `translateY(${waveOffset}px)`,
                                            }}
                                        >
                                            {/* Card Container */}
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    rotate: 0,
                                                    transition: {
                                                        duration: 0.1,
                                                        ease: "easeOut",
                                                    }
                                                }}
                                                whileHover={{
                                                    scale: 1.05,
                                                    y: -8,
                                                    rotate: randomRotation,
                                                    transition: {
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 15,
                                                    }
                                                }}
                                                transition={{
                                                    delay: delay + 0.5,
                                                    duration: 0.6,
                                                    ease: [0.25, 0.46, 0.45, 0.94],
                                                }}
                                                onClick={() =>
                                                    setSelectedCard(
                                                        recommendation
                                                    )
                                                }
                                                className="relative cursor-pointer w-56"
                                            >
                                                <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200 transition-all duration-300 relative">
                                                    {/* Match Score - Top Right */}
                                                    <div className="absolute -top-2 -right-2 z-20">
                                                        <div className="text-white px-3 py-1 rounded-full shadow-lg text-[10px] font-semibold" style={{ backgroundColor: '#D2A0F0' }}>
                                                            {(
                                                                recommendation.similarity *
                                                                100
                                                            ).toFixed(
                                                                0
                                                            )}
                                                            % match
                                                        </div>
                                                    </div>

                                                        {/* Card Image */}
                                                    <div className="mb-3 bg-white rounded-xl p-2 shadow-sm">
                                                            {recommendation.card
                                                                .image_url ? (
                                                                <img
                                                                    src={
                                                                        recommendation
                                                                            .card
                                                                            .image_url
                                                                    }
                                                                    alt={
                                                                        recommendation
                                                                            .card
                                                                            .name
                                                                    }
                                                                className="w-full h-28 object-contain"
                                                                />
                                                            ) : (
                                                            <div className="w-full h-28 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D2A0F0' }}>
                                                                <span className="text-5xl">
                                                                        💳
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Card Info */}
                                                    <div className="space-y-2">
                                                        <h3 className="font-bold text-gray-900 text-base line-clamp-2 min-h-[2.5rem] font-manrope">
                                                                {
                                                                    recommendation
                                                                        .card
                                                                        .name
                                                                }
                                                            </h3>

                                                            <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                    setSelectedCard(
                                                                        recommendation
                                                                );
                                                            }}
                                                            className="w-full text-xs bg-black text-white py-2 px-3 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
                                                        >
                                                            View Details
                                                            <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                    </div>
                                                        </div>

                                                {/* Rank indicator - Star Sticker */}
                                                <div className="absolute -top-4 -left-4 w-16 h-16 z-10">
                                                    <div className="relative w-full h-full">
                                                        <img 
                                                            src={getStarIcon(index)}
                                                            alt={`Rank ${index + 1}`}
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center pt-1">
                                                            <span className="text-black font-bold font-manrope">
                                                                <span className="text-base">{getRankNumber(index)}</span>
                                                                <span className="text-[10px]">{getRankSuffix(index)}</span>
                                                            </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                            </motion.div>
                                                </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    </div>
                </div>
            </div>

            {/* Card Details Modal */}
            <CardModal
                card={selectedCard?.card || null}
                similarity={selectedCard?.similarity}
                isOpen={selectedCard !== null}
                onClose={() => setSelectedCard(null)}
                userProfile={userProfile}
            />
        </>
    );
}
