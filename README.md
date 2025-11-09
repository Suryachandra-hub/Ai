# AiRus - AI Education Toolkit

AiRus is an all-in-one educational toolkit powered by AI. It features an education-focused chat, a PPT maker, document converters, and a writing analyzer to help students learn and improve their work.

This project is a full-stack application built with React (Vite) for the frontend and Node.js (Express) for the backend.

## Features

*   **AI Chat:** An education-focused chat assistant that can answer questions and even discuss uploaded documents.
*   **PPT Maker:** Generates presentation content (titles, bullets, speaker notes) based on a topic.
*   **Writing Analyzer:** Upload a document to get an AI-signature score, grammar/spelling checks, and readability analysis.
*   **Converter Suite:** A powerful suite of tools for converting and manipulating documents.
*   **Persistent Profiles:** Remembers your name and preferred writing tone across sessions using browser localStorage.

---

## How to Run the Application

This is a full-stack project, which means you need to run both the frontend (the user interface) and the backend (the API server) at the same time in two separate terminals.

### Step 1: Initial Setup

1.  **Open a terminal** in the root directory of the project (`edu`).
2.  **Install all dependencies** for both the frontend and backend with a single command:
    ```bash
    npm install
    ```
3.  **Set up your API Key:**
    *   Navigate into the `backend` directory.
    *   Create a new file named `.env`.
    *   Inside the `.env` file, add your Gemini API key like this:
        ```
        API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```

### Step 2: Run the Backend Server

1.  **In your first terminal**, run the following command from the root project directory:
    ```bash
    npm run server
    ```
2.  You should see a message confirming that the server is running on `http://localhost:8000`. Leave this terminal running.

### Step 3: Run the Frontend Development Server

1.  **Open a second, new terminal** in the same root project directory.
2.  Run the following command:
    ```bash
    npm run dev
    ```
3.  This command will start the Vite development server and should automatically open your web browser to `http://localhost:3000`.

You can now use the AiRus application in your browser! The frontend at `localhost:3000` will communicate with the backend at `localhost:8000`.# Gemini
# fiiiiinal
# fiiiiinal
