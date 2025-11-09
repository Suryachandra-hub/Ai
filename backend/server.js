import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// NEW: Import libraries for advanced conversions
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import JSZip from 'jszip';
import pdf from 'pdf-parse';


// --- FIX: Explicitly configure dotenv to find the .env file ---
// This resolves the "API_KEY not found" error by telling dotenv the exact location of the file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });


const app = express();
const port = process.env.PORT || 8000;

// --- Middleware ---
app.use(cors()); // Enable CORS to allow your frontend to make requests
app.use(express.json({ limit: '50mb' })); // Increase limit for larger file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- File Upload Setup (Multer) ---
// We'll store uploaded files temporarily in the OS's temp directory
// Use upload.array() to handle both single and multiple file uploads
const upload = multer({ dest: os.tmpdir() });

// --- Gemini API Initialization ---
if (!process.env.API_KEY) {
    throw new Error("API_KEY not found in .env file. Please create a .env file in the backend directory.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- API Routes ---

app.get('/', (req, res) => {
    res.json({
        status: "ok",
        message: "AiRus backend is running successfully. This server is the API 'brain' for the app. To see the UI, you need to run the frontend separately."
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, tone, isAssignmentMode, isStudentWritten } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required." });
        
        let systemInstruction = `You are AiRus, a friendly and helpful AI assistant for students.`;
        if (isAssignmentMode) {
            if (isStudentWritten) {
                systemInstruction += ` You are in 'Assignment Helper Mode' and must adopt the persona of a student. Your response must sound like it was written by a high-school or early college student.
                - Use contractions (e.g., "it's", "don't", "I'm").
                - Use simpler, more common vocabulary. Avoid jargon and overly formal words (like "thus", "moreover", "leverage").
                - Write in a slightly more conversational, less structured way. It's okay to start sentences with "So," or "Well,".
                - Keep sentences relatively short and direct.
                The goal is to be helpful but sound completely natural and human, not like a polished AI.`;
            } else {
                systemInstruction += ` You are in 'Assignment Helper Mode'. Your goal is to help students with their assignments by providing clear explanations, examples, and guidance. Adhere to academic integrity; do not write entire essays, but help them understand and structure their work. Your tone should be encouraging and clear.`;
            }
        } else if (tone === 'student') {
             systemInstruction += ` Your writing style must be simple, clear, and natural, like a knowledgeable peer. Use contractions and conversational phrasing. Avoid complex vocabulary.`;
        } else {
            systemInstruction += ` Your writing style must be formal, concise, and polished. Use precise language and a structured format.`;
        }
        const contents = [...(history || []), { role: "user", parts: [{ text: message }] }];
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction } });
        res.json({ text: response.text });
    } catch (error) {
        console.error("Error in /api/chat:", error);
        res.status(500).json({ error: "An error occurred while communicating with the AI service." });
    }
});

app.post('/api/generate-ppt', async (req, res) => {
    try {
        const { topic, slidesCount, includeSpeakerNotes, tone } = req.body;
        const toneInstruction = tone === 'student' ? 'The content should be written in a simple, clear, and engaging way, as if a student were presenting.' : 'The content should be professional, concise, and formal.';
        const prompt = `Generate content for a presentation about "${topic}". Create exactly ${slidesCount} slides. For each slide, provide a short title and 3-5 bullet points. ${includeSpeakerNotes ? 'Also, for each slide, write a short paragraph for speaker notes.' : 'Do not include speaker notes.'} ${toneInstruction} The topic is: ${topic}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: { slides: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, speakerNotes: { type: Type.STRING } }, required: ['title', 'bullets'] } } }, required: ['slides']
                }
            }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("Error in /api/generate-ppt:", error);
        res.status(500).json({ error: "An error occurred while generating presentation content." });
    }
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length < 50) return res.status(400).json({ error: "Please provide at least 50 characters of text to analyze." });
        const prompt = `Analyze the following text. You must provide a response in a valid JSON format.
        1.  **aiScore**: Give an "AI Signature Score" from 0 to 100, where 100 is definitively AI-written and 0 is definitively human-written. Base this on factors like sentence complexity, unnatural phrasing, and excessive use of formal words.
        2.  **aiHighlights**: Identify up to 3 specific sentences that most strongly suggest AI generation. For each, provide the sentence and a brief 'reason' (e.g., "Overly formal vocabulary", "Unnatural sentence structure").
        3.  **spellingErrors**: Identify any misspelled words. For each, provide the 'word' and an array of 'suggestions'.
        4.  **grammarSuggestions**: Identify up to 3 grammatical errors or awkward phrasings. For each, provide the original 'sentence' and a 'suggestion' for how to improve it.
        5.  **readability**: Provide a Flesch reading ease score as a number.
        Here is the text to analyze: --- ${text} ---`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: { aiScore: { type: Type.NUMBER }, aiHighlights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sentence: { type: Type.STRING }, reason: { type: Type.STRING } } } }, spellingErrors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, suggestions: { type: Type.ARRAY, items: { type: 'STRING' } } } } }, grammarSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sentence: { type: Type.STRING }, suggestion: { type: Type.STRING } } } }, readability: { type: Type.OBJECT, properties: { flesch: { type: Type.NUMBER } } } }, required: ['aiScore', 'aiHighlights', 'spellingErrors', 'grammarSuggestions', 'readability']
                }
            }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("Error in /api/analyze:", error);
        res.status(500).json({ error: "An error occurred while analyzing the text." });
    }
});

/**
 * FULLY IMPLEMENTED: Route to handle all file conversion requests.
 */
app.post('/api/convert', upload.array('files', 10), async (req, res) => {
    const { tool } = req.body;
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const tempFilePaths = req.files.map(f => f.path);
    const firstFile = req.files[0];
    const baseName = path.parse(firstFile.originalname).name;

    try {
        let buffer;
        let resultName;
        let resultMimeType;

        switch (tool) {
            case 'pdf-to-docx': {
                const dataBuffer = fs.readFileSync(firstFile.path);
                const data = await pdf(dataBuffer);
                const doc = new Document({
                    sections: [{
                        children: data.text.split(/\r?\n/).map(p => new Paragraph({ children: [new TextRun(p)] })),
                    }],
                });
                buffer = await Packer.toBuffer(doc);
                resultName = `${baseName}_converted.docx`;
                resultMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            }
            case 'docx-to-pdf': {
                // --- FINAL ROBUST FIX FOR DOCX TO PDF ---
                // This new implementation uses a universal font and a smart, line-by-line
                // text rendering engine to prevent character encoding errors.

                // 1. Fetch a universal font (Google Noto Sans) that supports a vast range of characters.
                const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosans/NotoSans-Regular.ttf';
                const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer()).catch(err => {
                    throw new Error("Could not download the required font. Please check network connection.");
                });

                // 2. Extract raw text content from the DOCX file.
                const { value } = await mammoth.extractRawText({ path: firstFile.path });
                const paragraphs = value.split('\n');

                // 3. Create a new PDF and embed the universal font.
                const pdfDoc = await PDFDocument.create();
                const customFont = await pdfDoc.embedFont(fontBytes);

                // 4. Intelligently render the text, line by line, onto PDF pages.
                let page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const fontSize = 11;
                const lineHeight = fontSize * 1.25;
                const margin = 50;
                let y = height - margin;

                // Function to add a new page and reset the y-coordinate.
                const addNewPage = () => {
                    page = pdfDoc.addPage();
                    y = height - margin;
                };

                for (const para of paragraphs) {
                    const words = para.split(' ');
                    let currentLine = '';
                    
                    for (const word of words) {
                        const potentialLine = currentLine === '' ? word : `${currentLine} ${word}`;
                        const textWidth = customFont.widthOfTextAtSize(potentialLine, fontSize);

                        // If the line is too wide, draw the current line and start a new one.
                        if (textWidth > width - 2 * margin) {
                            page.drawText(currentLine, { x: margin, y, font: customFont, size: fontSize });
                            y -= lineHeight;
                            currentLine = word;
                            // Check if a new page is needed after drawing the line.
                            if (y < margin) addNewPage();
                        } else {
                            currentLine = potentialLine;
                        }
                    }

                    // Draw the last remaining line of the paragraph.
                    page.drawText(currentLine, { x: margin, y, font: customFont, size: fontSize });
                    y -= lineHeight * 1.5; // Add extra space for a paragraph break.
                    
                    // Check if a new page is needed after the paragraph.
                    if (y < margin) addNewPage();
                }
                
                // 5. Save the final PDF to a buffer.
                buffer = await pdfDoc.save();
                resultName = `${baseName}_converted.pdf`;
                resultMimeType = 'application/pdf';
                break;
            }
            case 'xlsx-to-csv': {
                const workbook = xlsx.readFile(firstFile.path);
                const sheetName = workbook.SheetNames[0];
                const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                buffer = Buffer.from(csvData, 'utf8');
                resultName = `${baseName}_converted.csv`;
                resultMimeType = 'text/csv';
                break;
            }
            case 'csv-to-xlsx': {
                const csvData = fs.readFileSync(firstFile.path, 'utf8');
                const workbook = xlsx.utils.book_new();
                const worksheetData = csvData.split('\n').map(row => row.split(','));
                const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
                xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
                resultName = `${baseName}_converted.xlsx`;
                resultMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            }
            case 'pdf-merge': {
                if (req.files.length < 2) throw new Error("Please upload at least two PDFs to merge.");
                const mergedPdf = await PDFDocument.create();
                for (const file of req.files) {
                    const pdfBytes = fs.readFileSync(file.path);
                    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(page => mergedPdf.addPage(page));
                }
                buffer = await mergedPdf.save();
                resultName = `${baseName}_merged.pdf`;
                resultMimeType = 'application/pdf';
                break;
            }
            case 'pdf-split': {
                const pdfBytes = fs.readFileSync(firstFile.path);
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                if (pdfDoc.getPageCount() < 2) throw new Error("PDF must have at least 2 pages to split.");
                const zip = new JSZip();
                for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                    const newDoc = await PDFDocument.create();
                    const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
                    newDoc.addPage(copiedPage);
                    const pageBytes = await newDoc.save();
                    zip.file(`page_${i + 1}.pdf`, pageBytes);
                }
                buffer = await zip.generateAsync({ type: "nodebuffer" });
                resultName = `${baseName}_split.zip`;
                resultMimeType = 'application/zip';
                break;
            }
            case 'pdf-unlock': {
                const pdfBytes = fs.readFileSync(firstFile.path);
                const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false, ignoreEncryption: true });
                buffer = await pdfDoc.save();
                resultName = `${baseName}_unlocked.pdf`;
                resultMimeType = 'application/pdf';
                break;
            }
            case 'txt-to-json': {
                const txtContent = fs.readFileSync(firstFile.path, 'utf8');
                const jsonContent = JSON.stringify({ name: firstFile.originalname, content: txtContent }, null, 2);
                buffer = Buffer.from(jsonContent, 'utf8');
                resultName = `${baseName}_converted.json`;
                resultMimeType = 'application/json';
                break;
            }
            default:
                return res.status(501).json({ error: `Tool '${tool}' is not implemented yet.` });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${resultName}"`);
        res.setHeader('Content-Type', resultMimeType);
        res.send(buffer);

    } catch (error) {
        console.error(`Error in /api/convert with tool ${tool}:`, error);
        res.status(500).json({ error: `An error occurred during conversion: ${error.message}` });
    } finally {
        // Clean up all temporary files
        tempFilePaths.forEach(p => {
            try {
                if (fs.existsSync(p)) {
                    fs.unlinkSync(p);
                }
            } catch (err) {
                console.error(`Failed to delete temp file ${p}:`, err);
            }
        });
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("Make sure your .env file is created in the 'backend' directory and contains your API_KEY.");
});
