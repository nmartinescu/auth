import express from "express";
import {
    generateDiskSchedulingQuestion,
    generateMultipleQuestions,
    checkAnswer,
    generateCustomTest
} from "../services/test/diskTestService.js";

const router = express.Router();

// POST /api/disk/test/generate - Generate a single test question
router.post("/generate", async (req, res) => {
    console.log("POST /api/disk/test/generate called");
    console.log("Request body:", req.body);

    try {
        const { difficulty = 'medium' } = req.body;

        // validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
            });
        }

        console.log(`Generating disk scheduling test question with difficulty: ${difficulty}`);

        const testQuestion = generateDiskSchedulingQuestion(difficulty);

        console.log("Test question generated successfully");

        res.status(200).json({
            success: true,
            message: "Test question generated successfully",
            data: {
                question: testQuestion.question,
                // Don't send the correct answer to the client
                questionId: Date.now() // Simple ID for tracking
            },
            // Store correct answer in session or cache for later verification
            _correctAnswer: testQuestion.correctAnswer // This should be stored server-side
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

// POST /api/disk/test/generate-multiple - Generate multiple test questions
router.post("/generate-multiple", async (req, res) => {
    console.log("POST /api/disk/test/generate-multiple called");
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

        console.log(`Generating ${count} disk scheduling test questions with difficulty: ${difficulty}`);

        const testQuestions = generateMultipleQuestions(count, difficulty);

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
            // store correct answers server-side
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

// POST /api/disk/test/custom - Generate a custom test question
router.post("/custom", async (req, res) => {
    console.log("POST /api/disk/test/custom called");
    console.log("Request body:", req.body);

    try {
        const {
            algorithm,
            maxDiskSize,
            initialHeadPosition,
            headDirection,
            requests
        } = req.body;

        // validate required fields
        if (!algorithm) {
            return res.status(400).json({
                success: false,
                message: "Algorithm is required"
            });
        }

        if (!Array.isArray(requests) || requests.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Requests must be a non-empty array"
            });
        }

        if (initialHeadPosition === undefined || initialHeadPosition === null) {
            return res.status(400).json({
                success: false,
                message: "Initial head position is required"
            });
        }

        console.log(`Generating custom disk scheduling test question`);
        console.log(`Algorithm: ${algorithm}`);
        console.log(`Initial Head Position: ${initialHeadPosition}`);
        console.log(`Max Disk Size: ${maxDiskSize || 200}`);
        console.log(`Head Direction: ${headDirection || 'right'}`);
        console.log(`Requests: [${requests.join(", ")}]`);

        const testQuestion = generateCustomTest({
            algorithm,
            maxDiskSize,
            initialHeadPosition,
            headDirection,
            requests
        });

        console.log("Custom test question generated successfully");

        res.status(200).json({
            success: true,
            message: "Custom test question generated successfully",
            data: {
                question: testQuestion.question,
                questionId: Date.now()
            },
            _correctAnswer: testQuestion.correctAnswer
        });

    } catch (error) {
        console.error("Error generating custom test question:", error);
        
        res.status(400).json({
            success: false,
            message: error.message || "Error generating custom test question",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// POST /api/disk/test/check - Check user's answer
router.post("/check", async (req, res) => {
    console.log("POST /api/disk/test/check called");
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
                message: "Correct answer is required for verification"
            });
        }

        console.log("Checking user's answer against correct solution");

        const feedback = checkAnswer(userAnswer, correctAnswer);

        console.log(`Answer checked. Score: ${feedback.score}/100`);

        res.status(200).json({
            success: true,
            message: "Answer checked successfully",
            data: feedback
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