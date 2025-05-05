// --- REVISED main.js (Focus on the 'change' event listener) ---

// ================== main.js ==================
// Acts as the entry point and orchestrator

// --- Imports ---
import { checkNHANESManuscript } from './nhanesLogic.js';
import { displayResults } from './ui.js';
// *** Make sure these imports point to the correct fileUtils.js ***
import { readFileAsText, readDocxFile, readPdfFile } from './fileUtils.js';

// --- PDF.js Configuration ---
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
} else {
  console.warn("pdfjsLib not found. PDF processing will not work.");
}

// --- DOM Element References ---
const checkButton = document.getElementById('checkButton');
const clearButton = document.getElementById('clearButton');
const manuscriptTextArea = document.getElementById('manuscriptText');
const manuscriptFileInput = document.getElementById('manuscriptFile');
const resultsContainer = document.getElementById('results');
const resultsContent = document.getElementById('resultsContent');

// --- Helper Functions for UI State ---
function showLoading(message = "Processing...") {
    manuscriptTextArea.value = message;
    manuscriptTextArea.disabled = true;
    checkButton.disabled = true;
    clearButton.disabled = true;
    manuscriptFileInput.disabled = true;
}

function hideLoading(enableCheckButton = true) { // Changed parameter name for clarity
    manuscriptTextArea.disabled = false;
    // Only enable check button if loading was successful AND textarea isn't showing an error/unsupported message
    checkButton.disabled = !enableCheckButton || manuscriptTextArea.value.startsWith("Error processing") || manuscriptTextArea.value.startsWith("Unsupported file type");
    clearButton.disabled = false;
    manuscriptFileInput.disabled = false;
}


// --- Event Listener Setup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing NHANES Checker UI.");

    // 1. Check Button Click Handler (Keep this as it was)
    if (checkButton) {
        checkButton.addEventListener('click', () => {
            const manuscriptText = manuscriptTextArea.value;
            if (!manuscriptText.trim() || manuscriptText.startsWith("Loading") || manuscriptText.startsWith("Error") || manuscriptText.startsWith("Unsupported")) {
                alert('Please wait for loading to complete or upload a valid file content.');
                return;
            }
            resultsContainer.classList.add('hidden');
            showLoading("Running NHANES checks...");
            setTimeout(() => {
                try {
                    const results = checkNHANESManuscript(manuscriptText, "Manuscript");
                    displayResults(results);
                } catch (error) {
                    console.error("Error during manuscript check:", error);
                    displayResults({
                        finalResult: "Error",
                        details: [`An unexpected error occurred during analysis: ${error.message}`],
                        checkResults: []
                    });
                } finally {
                    hideLoading(true); // Re-enable buttons after check
                    if (resultsContent.innerHTML.trim() !== '') {
                         resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 10);
        });
    } else { console.error("Check button not found!"); }

    // 2. File Upload Handler (REVISED)
    if (manuscriptFileInput) {
        manuscriptFileInput.addEventListener('change', async (e) => { // Marked as async
            const file = e.target.files[0];
            if (!file) return;

            resultsContainer.classList.add('hidden');
            resultsContent.innerHTML = '';
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            showLoading(`Loading file: ${fileName}...`); // Show loading message

            let fileContent = ''; // Use a specific variable for the content
            let loadSuccessful = false; // Track success

            try {
                console.log(`Attempting to read .${fileExtension} file...`); // Debug log
                if (fileExtension === 'txt') {
                    fileContent = await readFileAsText(file);
                } else if (fileExtension === 'docx') {
                    // Check if mammoth is loaded before calling
                     if (typeof mammoth === 'undefined') {
                         throw new Error("Mammoth.js library not loaded.");
                     }
                    fileContent = await readDocxFile(file);
                } else if (fileExtension === 'pdf') {
                     // Check if pdfjsLib is loaded before calling
                     if (typeof pdfjsLib === 'undefined') {
                          throw new Error("PDF.js library not loaded.");
                     }
                    const pdfProgressCallback = (pagesProcessed, totalPages) => {
                        // Update loading message with progress
                        showLoading(`Loading PDF: ${fileName} (${pagesProcessed}/${totalPages} pages)...`);
                    };
                    fileContent = await readPdfFile(file, pdfProgressCallback);
                } else {
                    // Handle unsupported type directly
                    fileContent = `Unsupported file type: .${fileExtension}. Please upload a .txt, .docx, or .pdf file.`;
                    alert(fileContent); // Alert user
                    loadSuccessful = false; // Mark as unsuccessful
                }

                // If we reached here without throwing an error for supported types
                if (['txt', 'docx', 'pdf'].includes(fileExtension)) {
                     console.log("File read successful."); // Debug log
                     loadSuccessful = true;
                }

            } catch (error) {
                // Catch errors from readFileAsText, readDocxFile, readPdfFile
                console.error(`Error processing file ${fileName}:`, error);
                fileContent = `Error processing file "${fileName}":\n${error.message}`; // Set error message
                alert(`Error processing file:\n${error.message}`); // Alert user
                loadSuccessful = false; // Mark as unsuccessful
            } finally {
                // This block ALWAYS runs, regardless of success or error in try/catch

                console.log("Finally block executing. Updating textarea."); // Debug log
                // *** CRITICAL: Update the textarea value HERE ***
                manuscriptTextArea.value = fileContent;

                // Hide loading and manage button state based on success
                hideLoading(loadSuccessful);
                console.log(`Loading hidden. Check button enabled: ${!checkButton.disabled}`); // Debug log
            }
        });
    } else { console.error("File input not found!"); }


    // 3. Clear Button Handler (Keep as it was)
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            manuscriptTextArea.value = '';
            manuscriptFileInput.value = '';
            resultsContainer.classList.add('hidden');
            resultsContent.innerHTML = '';
            checkButton.disabled = true;
            console.log("Cleared text area, file input, and results.");
        });
    } else { console.error("Clear button not found!"); }

    // Initial state check
    hideLoading(!manuscriptTextArea.value.trim());

}); // End of DOMContentLoaded listener