import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCardRecommendations } from "../utils/useCardRecommendations";
import { motion } from "framer-motion";
import CardModal from "./CardModal";
import type { CreditCard } from "../utils/creditCardMatcher";

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
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
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

                {/* Card Journey - Single Pole Layout */}
                <div className="relative max-w-5xl mx-auto py-12">
                    {cards.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No recommendations available. Please complete your
                            profile.
                        </p>
                    ) : (
                        <>
                            {/* Continuous Purple Pole */}
                            <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 w-1 bg-gradient-to-b from-purple-300 via-purple-400 to-purple-500"></div>

                            {/* Top Decoration */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center"
                            >
                                <span className="text-2xl">⭐</span>
                            </motion.div>

                            {/* Cards alternating left and right */}
                            <div className="space-y-16">
                                {cards.map((recommendation, index) => {
                                    const isLeft = index % 2 === 0;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{
                                                opacity: 0,
                                                x: isLeft ? -100 : 100,
                                            }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.2,
                                                type: "spring",
                                                stiffness: 100,
                                            }}
                                            className={`relative flex items-center ${
                                                isLeft
                                                    ? "justify-end pr-8 md:pr-12"
                                                    : "justify-start pl-8 md:pl-12"
                                            }`}
                                        >
                                            {/* Connector Line */}
                                            <svg
                                                className={`absolute top-1/2 ${
                                                    isLeft
                                                        ? "right-0"
                                                        : "left-0"
                                                } transform -translate-y-1/2 z-0`}
                                                width={isLeft ? "100" : "100"}
                                                height="4"
                                                style={{
                                                    [isLeft ? "right" : "left"]:
                                                        "50%",
                                                }}
                                            >
                                                <motion.line
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{
                                                        delay:
                                                            index * 0.2 + 0.3,
                                                        duration: 0.5,
                                                    }}
                                                    x1={isLeft ? "100" : "0"}
                                                    y1="2"
                                                    x2={isLeft ? "0" : "100"}
                                                    y2="2"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                />
                                                <defs>
                                                    <linearGradient
                                                        id="gradient"
                                                        x1="0%"
                                                        y1="0%"
                                                        x2="100%"
                                                        y2="0%"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#c084fc"
                                                        />
                                                        <stop
                                                            offset="100%"
                                                            stopColor="#a855f7"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                            </svg>

                                            {/* Node on pole */}
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: index * 0.2 + 0.2,
                                                    type: "spring",
                                                }}
                                                className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-purple-400 rounded-full shadow-md z-10 flex items-center justify-center"
                                            >
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            </motion.div>

                                            {/* Card Container */}
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.03,
                                                    rotate: isLeft ? -1 : 1,
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() =>
                                                    setSelectedCard(
                                                        recommendation
                                                    )
                                                }
                                                className="relative cursor-pointer group max-w-md w-full"
                                            >
                                                <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 group-hover:border-purple-300 group-hover:shadow-2xl transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        {/* Card Image */}
                                                        <div className="flex-shrink-0">
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
                                                                    className="w-32 h-20 object-contain"
                                                                />
                                                            ) : (
                                                                <div className="w-32 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center">
                                                                    <span className="text-3xl">
                                                                        💳
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Card Info */}
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                                                                {
                                                                    recommendation
                                                                        .card
                                                                        .name
                                                                }
                                                            </h3>
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedCard(
                                                                        recommendation
                                                                    )
                                                                }
                                                                className="text-sm bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all"
                                                            >
                                                                Learn More
                                                            </button>
                                                        </div>

                                                        {/* Match Score Badge */}
                                                        <div className="flex-shrink-0">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-3 border-white group-hover:scale-110 transition-transform">
                                                                <div className="text-center">
                                                                    <div className="text-white font-bold text-lg leading-none">
                                                                        {(
                                                                            recommendation.similarity *
                                                                            100
                                                                        ).toFixed(
                                                                            0
                                                                        )}
                                                                        %
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rank indicator */}
                                                <div
                                                    className={`absolute ${
                                                        isLeft
                                                            ? "-left-2"
                                                            : "-right-2"
                                                    } -top-2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md`}
                                                >
                                                    #{index + 1}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Bottom Decoration */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: cards.length * 0.2 + 0.3,
                                    type: "spring",
                                }}
                                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center"
                            >
                                <span className="text-2xl">🎯</span>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>

            {/* Card Details Modal */}
            <CardModal
                card={selectedCard?.card || null}
                similarity={selectedCard?.similarity}
                isOpen={selectedCard !== null}
                onClose={() => setSelectedCard(null)}
            />
        </>
    );
}
