// --- ui.js ---

// Contains functions for updating the user interface.

// Function to display results
// ***** ADD export HERE *****
export function displayResults(results) {
    // Get references to HTML elements
    const resultsEl = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');

    // Ensure elements exist
    if (!resultsEl || !resultsContent) {
        console.error("UI Error: Results container elements ('results', 'resultsContent') not found in the DOM.");
        return; // Stop if essential elements are missing
    }

    resultsEl.classList.remove('hidden'); // Make results section visible
    resultsContent.innerHTML = ''; // Clear any previous results

    // --- Overall Result Banner ---
    const overallResultDiv = document.createElement('div');
    let overallClass = 'check-item'; // Base class
    let resultText = `Overall Result: ${results.finalResult}`;

    // Apply specific class based on the final result
    switch (results.finalResult) {
        case 'Pass':
            overallClass += ' pass';
            break;
        case 'Fail':
            overallClass += ' fail';
            // Optionally add step failure detail if available (requires failStep in results object)
            if (results.failStep > 0) {
               resultText += ` (Failed at Step ${results.failStep})`;
            }
            break;
        case 'Not NHANES':
            overallClass += ' not-nhanes';
            break;
        case 'Error': // Handle explicit processing errors
             overallClass += ' fail'; // Style errors as failures
             resultText = 'Processing Error';
             break;
        default:
            // Use a default style if result type is unknown
            overallClass += ' not-nhanes';
            resultText = `Result: ${results.finalResult || 'Unknown'}`;
    }
    overallResultDiv.className = overallClass;
    overallResultDiv.innerHTML = `<div class="summary">${resultText}</div>`; // Use the 'summary' class from your CSS
    resultsContent.appendChild(overallResultDiv);


    // --- Summary Details Section ---
    if (results.details && Array.isArray(results.details) && results.details.length > 0) {
        const summaryDetailsDiv = document.createElement('div');
        summaryDetailsDiv.className = 'summary-details'; // Assign class for potential styling
        summaryDetailsDiv.innerHTML = '<h3>Processing Details:</h3>'; // More generic title
        const summaryList = document.createElement('ul');
        results.details.forEach(detail => {
            const item = document.createElement('li');
            // Use innerHTML to render checkmarks/crosses as actual characters if desired
            // Or just set textContent if the prefixes are purely informational
            item.textContent = detail;
            // Apply inline styles based on prefixes (as before)
            if (detail.startsWith('✗')) {
                item.style.color = '#dc3545'; // Fail color (consistent with CSS)
                item.style.fontWeight = 'bold';
            } else if (detail.startsWith('✓')) {
                item.style.color = '#28a745'; // Pass color (consistent with CSS)
            } else if (detail.startsWith('⚠️')) {
                item.style.color = '#ffc107'; // Warning color
                item.style.fontWeight = 'bold';
            }
            summaryList.appendChild(item);
        });
        summaryDetailsDiv.appendChild(summaryList);
        resultsContent.appendChild(summaryDetailsDiv);
    }


    // --- Individual Check Results Section (Collapsible) ---
    if (results.checkResults && Array.isArray(results.checkResults) && results.checkResults.length > 0) {
        const checksSection = document.createElement('details'); // Use <details> for built-in collapse
        checksSection.className = 'individual-checks'; // Assign class for potential styling

        const summaryToggle = document.createElement('summary'); // Clickable toggle part
        summaryToggle.innerHTML = '<h3>Individual Check Details ▼</h3>';
        checksSection.appendChild(summaryToggle);

        // Add details for each check result
        results.checkResults.forEach(check => {
            const checkItem = document.createElement('div');
            // Use the 'pass' or 'fail' CSS classes for the check item container
            checkItem.className = check.passed ? 'check-item pass' : 'check-item fail';

            // Create status text with color spans for clarity
            const statusText = check.passed
                ? '<span style="color:#28a745; font-weight:bold;">✓ Pass</span>'
                : '<span style="color:#dc3545; font-weight:bold;">✗ Fail</span>';

            // Populate the check item's content
            checkItem.innerHTML = `
              <h4>${check.checkName}: ${statusText}</h4>
              <p>${check.details || 'No details provided.'}</p> <!-- Add fallback for details -->
            `;
            checksSection.appendChild(checkItem); // Append the formatted item to the <details> element
        });

        resultsContent.appendChild(checksSection); // Add the whole collapsible section
    }

    // Scrolling to results is handled in main.js after this function is called
    // resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}