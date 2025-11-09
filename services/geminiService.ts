// IMPORTANT: This implementation now securely communicates with a backend server.
// For this to work, you must be running the Node.js server as described in the README.md.

import type {
  AnalysisReport,
  PptContent,
  WritingTone,
} from "../types";

// The base URL of your local backend server
const API_BASE_URL = 'http://localhost:8000';

/**
 * A helper function to handle fetch requests to the backend.
 */
const fetchFromBackend = async (endpoint: string, body: object) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching from backend endpoint ${endpoint}:`, error);
        throw error; // Re-throw the error to be caught by the calling function
    }
};


/**
 * Gets a chat response by sending a request to our backend server.
 */
export const getChatResponse = async (
  sessionId: string,
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  tone: WritingTone,
  isAssignmentMode: boolean,
  isStudentWritten: boolean
): Promise<string> => {
    try {
        const data = await fetchFromBackend('/api/chat', {
            message,
            history,
            tone,
            isAssignmentMode,
            isStudentWritten
        });
        return data.text;
    } catch (error) {
        throw new Error("Failed to get a response from the AI. Is your backend server running?");
    }
};

/**
 * Generates presentation content by sending a request to our backend server.
 */
export const generatePptContent = async (
  topic: string,
  slidesCount: number,
  includeSpeakerNotes: boolean,
  tone: WritingTone
): Promise<PptContent> => {
    try {
        // NOTE: The '/api/generate-ppt' endpoint needs to be implemented in `server-example.js`
        // For now, this will throw an error until that backend route is created.
        const data = await fetchFromBackend('/api/generate-ppt', {
            topic,
            slidesCount,
            includeSpeakerNotes,
            tone
        });
        return data as PptContent;
    } catch (error) {
        console.error("Error generating PPT content from backend:", error);
        return {
          slides: [
            {
              title: "Backend Error",
              bullets: ["The backend endpoint for PPT generation is not yet implemented."],
              speakerNotes: "Please see `server-example.js` to add the '/api/generate-ppt' route.",
            },
          ],
        };
    }
};

/**
 * Analyzes text by sending a request to our backend server.
 */
export const analyzeText = async (
  text: string,
  tone: WritingTone
): Promise<AnalysisReport> => {
  try {
    // NOTE: The '/api/analyze' endpoint needs to be implemented in `server-example.js`
    const data = await fetchFromBackend('/api/analyze', { text, tone });
    return data as AnalysisReport;
  } catch (error) {
    throw new Error(
      "Failed to analyze the document. The backend endpoint may not be implemented yet. Is your server running?"
    );
  }
};
