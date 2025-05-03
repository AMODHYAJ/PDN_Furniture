// Utils/taskAI.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY);

// Get the Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function generateTasks({ requirements, deadline }) {
    try {
        let prompt = `You are an expert project manager tasked with breaking down a woodworking order based on the following requirements into a detailed list of actionable tasks in JSON format:\n\nRequirements: ${requirements}\n\n`;
        if (deadline) {
            prompt += `Overall Deadline: ${new Date(deadline).toLocaleDateString()} ${new Date(deadline).toLocaleTimeString()}\n\n`;
        }
        prompt += `Generate a JSON array of 5 tasks. Each task object should have the keys: "taskName" (string), "estimatedTime" (number, in hours), and "dueDate" (ISO 8601 date string). Please ensure the response is valid JSON without any markdown formatting.`;

        const result = await model.generateContent({
            contents: [{
                parts: [{ text: prompt }],
            }],
        });
        const response = await result.response;

        if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts || response.candidates[0].content.parts.length === 0) {
            console.error("Error: No valid AI response received.");
            return null; // Indicate failure
        }

        let aiResponseText = response.candidates[0].content.parts[0].text;
        console.log("Raw AI Response from Gemini:", aiResponseText);

        // Remove markdown code block delimiters if present
        if (aiResponseText.startsWith("```json")) {
            aiResponseText = aiResponseText.substring(7, aiResponseText.length - 3).trim();
        } else if (aiResponseText.startsWith("```")) {
            aiResponseText = aiResponseText.substring(3, aiResponseText.length - 3).trim();
        }

        let tasksData;
        try {
            tasksData = JSON.parse(aiResponseText);
            if (!Array.isArray(tasksData)) {
                console.error("AI response is not a JSON array.");
                return null;
            }
        } catch (error) {
            console.error("Error parsing AI response:", error);
            return null;
        }

        let totalEstimatedTime = 0;
        tasksData.forEach(task => {
            if (typeof task.estimatedTime === 'number') {
                totalEstimatedTime += task.estimatedTime;
            }
            if (task.dueDate) {
                task.dueDate = new Date(task.dueDate);
            }
        });

        return {
            tasks: { tasks: tasksData },
            totalEstimatedTime: totalEstimatedTime,
            riskLevel: "Medium",
            suggestedNewDeadline: null
        };

    } catch (error) {
        console.error("Error generating tasks with Gemini:", error);
        return null; // Indicate failure
    }
}

module.exports = { generateTasks };