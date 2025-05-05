// --- fileUtils.js ---

// Contains helper functions for reading different file types.
// Assumes PDF.js (pdfjsLib) and Mammoth.js (mammoth) are loaded globally or via imports elsewhere.

// ***** ADD export HERE *****
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error(`Error reading text file: ${e.target.error}`));
        reader.readAsText(file);
    });
}

// ***** ADD export HERE *****
export function readDocxFile(file) {
    return new Promise((resolve, reject) => {
        // Check if mammoth is loaded
        if (typeof mammoth === 'undefined') {
             console.error("Mammoth.js library is not loaded.");
             return reject(new Error("Mammoth.js library is not loaded. Cannot process .docx files."));
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then(result => resolve(result.value))
                .catch(error => {
                    console.error("Mammoth.js DOCX processing error:", error);
                    reject(new Error(`Error processing DOCX: ${error.message}`))
                });
        };
        reader.onerror = (e) => reject(new Error(`Error reading DOCX file reader: ${e.target.error}`));
        reader.readAsArrayBuffer(file);
    });
}

// ***** ADD export HERE *****
export function readPdfFile(file, progressCallback = null) {
    return new Promise((resolve, reject) => {
        // Check if pdfjsLib is available
        if (typeof pdfjsLib === 'undefined') {
            console.error("PDF.js library (pdfjsLib) is not loaded.");
            return reject(new Error("PDF.js library is not loaded. Cannot process .pdf files."));
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            // Configure worker source (redundant if already done in main.js, but safe)
             if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                 console.warn("PDF.js worker source not set. Setting default CDN path.");
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
             }

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

            loadingTask.promise.then(pdf => {
                const totalPages = pdf.numPages;
                let pagePromises = [];
                let pagesProcessed = 0;

                 if (progressCallback) {
                    progressCallback(pagesProcessed, totalPages); // Initial progress (0 pages)
                 }

                for (let i = 1; i <= totalPages; i++) {
                    pagePromises.push(
                        pdf.getPage(i).then(page => {
                            return page.getTextContent().then(content => {
                                // Join text items for the page
                                return content.items.map(item => item.str).join(' ');
                            });
                        }).then(pageText => {
                            // Update progress *after* page text is successfully extracted
                            pagesProcessed++;
                            if (progressCallback) {
                                progressCallback(pagesProcessed, totalPages);
                            }
                            return pageText; // Return the extracted text for this page
                        })
                    );
                }

                // Wait for all page promises to resolve
                Promise.all(pagePromises)
                    .then(pageTexts => {
                         // Join the text from all pages with double newlines
                         const fullText = pageTexts.join('\n\n');
                         resolve(fullText);
                    })
                    .catch(error => {
                        console.error("Error processing PDF pages:", error);
                        reject(new Error(`Error extracting text from PDF page: ${error.message}`))
                     });

            }).catch(error => {
                console.error("Error loading PDF document:", error);
                reject(new Error(`Error loading PDF: ${error.message}`))
            });
        };
        reader.onerror = (e) => reject(new Error(`Error reading PDF file reader: ${e.target.error}`));
        reader.readAsArrayBuffer(file);
    });
}