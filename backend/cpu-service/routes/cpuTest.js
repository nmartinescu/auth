import express from "express";
import {
    generateCPUSchedulingQuestion,
    generateMultipleCPUQuestions
} from "../services/cpuTestService.js";

const router = express.Router();

// POST /api/cpu/test/generate - Generate a single test question
router.post("/generate", async (req, res) => {
    console.log("POST /api/cpu/test/generate called");
    console.log("Request body:", req.body);

    try {
        const { difficulty = 'medium', algorithm = null } = req.body;

        // validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
            });
        }

        console.log(`Generating CPU scheduling test question with difficulty: ${difficulty}${algorithm ? `, algorithm: ${algorithm}` : ''}`);

        const testQuestion = generateCPUSchedulingQuestion(difficulty, algorithm);

        console.log("Test question generated successfully");

        res.status(200).json({
            success: true,
            message: "Test question generated successfully",
            data: {
                question: testQuestion.question,
                questionId: Date.now()
            },
            _correctAnswer: testQuestion.correctAnswer
        });

    } catch (error) {
        console.error("Error generating test question:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Error generating test question",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// POST /api/cpu/test/generate-multiple - Generate multiple test questions
router.post("/generate-multiple", async (req, res) => {
    console.log("POST /api/cpu/test/generate-multiple called");
    console.log("Request body:", req.body);

    try {
        const { count = 5, difficulty = 'medium' } = req.body;

        // validate inputs
        if (count < 1 || count > 20) {
            return res.status(400).json({
                success: false,
                message: "Count must be between 1 and 20"
            });
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
            });
        }

        console.log(`Generating ${count} CPU scheduling test questions with difficulty: ${difficulty}`);

        const testQuestions = generateMultipleCPUQuestions(count, difficulty);

        console.log("Multiple test questions generated successfully");

        res.status(200).json({
            success: true,
            message: `${count} test questions generated successfully`,
            data: {
                questions: testQuestions.map((q, index) => ({
                    questionId: Date.now() + index,
                    question: q.question
                })),
                count: testQuestions.length
            },
            _correctAnswers: testQuestions.map(q => q.correctAnswer)
        });

    } catch (error) {
        console.error("Error generating multiple test questions:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Error generating test questions",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// POST /api/cpu/test/check - Check user's answer
router.post("/check", async (req, res) => {
    console.log("POST /api/cpu/test/check called");
    console.log("Request body:", req.body);

    try {
        const { userAnswer, correctAnswer } = req.body;

        // validate inputs
        if (!userAnswer) {
            return res.status(400).json({
                success: false,
                message: "User answer is required"
            });
        }

        if (!correctAnswer) {
            return res.status(400).json({
                success: false,
                message: "Correct answer is required"
            });
        }

        // Simple comparison for now - can be enhanced later
        const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);

        res.status(200).json({
            success: true,
            data: {
                isCorrect,
                userAnswer,
                correctAnswer: isCorrect ? undefined : correctAnswer
            }
        });

    } catch (error) {
        console.error("Error checking answer:", error);
        
        res.status(500).json({
            success: false,
            message: error.message || "Error checking answer",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
