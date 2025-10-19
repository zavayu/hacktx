import { useState } from "react";
import { testCardMatcher, quickTest } from "../utils/testCardMatcher";

export default function TestCards() {
    const [output, setOutput] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const runFullTest = async () => {
        setLoading(true);
        setOutput("Running full test suite...\n");

        // Capture console.log
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            const message = args
                .map((arg) =>
                    typeof arg === "object"
                        ? JSON.stringify(arg, null, 2)
                        : String(arg)
                )
                .join(" ");
            logs.push(message);
            originalLog(...args);
        };

        try {
            await testCardMatcher();
            setOutput(logs.join("\n"));
        } catch (error) {
            setOutput(
                logs.join("\n") + "\n\nError: " + (error as Error).message
            );
        } finally {
            console.log = originalLog;
            setLoading(false);
        }
    };

    const runQuickTest = async () => {
        setLoading(true);
        setOutput("Running quick test...\n");

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            const message = args
                .map((arg) =>
                    typeof arg === "object"
                        ? JSON.stringify(arg, null, 2)
                        : String(arg)
                )
                .join(" ");
            logs.push(message);
            originalLog(...args);
        };

        try {
            await quickTest();
            setOutput(logs.join("\n"));
        } catch (error) {
            setOutput(
                logs.join("\n") + "\n\nError: " + (error as Error).message
            );
        } finally {
            console.log = originalLog;
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        🧪 Credit Card Matcher Test Suite
                    </h1>

                    <div className="space-y-4 mb-8">
                        <button
                            onClick={runQuickTest}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Running..."
                                : "🚀 Quick Test (Journeyman Profile)"}
                        </button>

                        <button
                            onClick={runFullTest}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Running..."
                                : "🔬 Full Test Suite (All Ranks)"}
                        </button>
                    </div>

                    {output && (
                        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto max-h-96 font-mono text-sm">
                            <pre>{output}</pre>
                        </div>
                    )}

                    {!output && !loading && (
                        <div className="text-center text-gray-500 py-12">
                            <p>Click a button above to run tests</p>
                            <p className="text-sm mt-2">
                                Make sure your VITE_GEMINI_API_KEY is set in
                                .env
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

