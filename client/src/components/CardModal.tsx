import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import type { CreditCard } from "../utils/creditCardMatcher";

interface CardModalProps {
    card: CreditCard | null;
    isOpen: boolean;
    onClose: () => void;
    similarity?: number;
}

export default function CardModal({
    card,
    isOpen,
    onClose,
    similarity,
}: CardModalProps) {
    if (!card) return null;

    const getAnnualFee = () => {
        if (card.annualFee !== undefined) return `$${card.annualFee}`;
        if (card.annual_fee) return card.annual_fee;
        return "$0";
    };

    const getBenefitsList = () => {
        if (!card.benefits) return [];
        return Array.isArray(card.benefits) ? card.benefits : [card.benefits];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 text-white p-8 rounded-t-3xl">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <span className="text-2xl">×</span>
                                </button>

                                {card.image_url && (
                                    <div className="mb-4">
                                        <img
                                            src={card.image_url}
                                            alt={card.name}
                                            className="w-64 h-40 object-contain mx-auto drop-shadow-2xl"
                                        />
                                    </div>
                                )}

                                <h2 className="text-2xl font-bold mb-4">
                                    {card.name}
                                </h2>

                                {similarity !== undefined && (
                                    <div className="inline-block bg-white/20 rounded-full px-4 py-2">
                                        <span className="text-sm font-semibold">
                                            {(similarity * 100).toFixed(0)}%
                                            Match
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                {/* Quick Info */}
                                <div className="flex justify-center">
                                    <span className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-full font-semibold">
                                        {getAnnualFee()} annual fee
                                    </span>
                                </div>

                                {/* Benefits */}
                                {getBenefitsList().length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                                            Benefits
                                        </h3>
                                        <ul className="space-y-2">
                                            {getBenefitsList().map(
                                                (benefit, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start"
                                                    >
                                                        <span className="text-green-500 mr-2 mt-0.5">
                                                            ✓
                                                        </span>
                                                        <span className="text-gray-700">
                                                            {benefit}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Eligibility */}
                                {card.eligibility_requirements && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                                            Eligibility
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                                            {card.eligibility_requirements
                                                .credit_score && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Credit Score:
                                                    </span>{" "}
                                                    {
                                                        card
                                                            .eligibility_requirements
                                                            .credit_score
                                                    }
                                                </div>
                                            )}
                                            {card.eligibility_requirements
                                                .employment_status && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Employment:
                                                    </span>{" "}
                                                    {
                                                        card
                                                            .eligibility_requirements
                                                            .employment_status
                                                    }
                                                </div>
                                            )}
                                            {card.eligibility_requirements
                                                .citizenship && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Citizenship:
                                                    </span>{" "}
                                                    {
                                                        card
                                                            .eligibility_requirements
                                                            .citizenship
                                                    }
                                                </div>
                                            )}
                                            {card.eligibility_requirements
                                                .income && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Income:
                                                    </span>{" "}
                                                    {
                                                        card
                                                            .eligibility_requirements
                                                            .income
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* View Roadmap Button */}
                                    <Link
                                        to="/roadmap"
                                        onClick={onClose}
                                        className="block w-full bg-purple-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        View Roadmap
                                    </Link>

                                    {/* Apply Now Button */}
                                    {card.application_url ? (
                                        <a
                                            href={card.application_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-black text-white text-center py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                                        >
                                            Apply Now →
                                        </a>
                                    ) : (
                                        <div className="block w-full bg-gray-300 text-gray-500 text-center py-3 rounded-xl font-semibold cursor-not-allowed">
                                            Apply Now →
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
