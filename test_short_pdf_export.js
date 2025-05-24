// --- Start of Mocks ---
// Mock DOM elements and browser APIs not available in Node.js
global.document = {
    createElement: function(tag) {
        const element = {
            tag: tag,
            style: {},
            appendChild: function(child) {
                if (!this.children) this.children = [];
                this.children.push(child);
            },
            querySelectorAll: function() {
                // Simplified querySelectorAll for this test, returning empty array
                return [];
            },
            // Mock properties that might be accessed
            innerHTML: '',
            textContent: '',
            value: ''
        };
        // If it's an h1, give it a default style object
        if (tag === 'h1') {
            element.style = { marginBottom: '', fontSize: '', display: '', textAlign: '', width: '' };
        }
        // If it's a div, give it a default style object and innerHTML
        if (tag === 'div') {
            element.style = { color: '', backgroundColor: '', fontSize: '', overflowWrap: '', wordWrap: '', pageBreakInside: ''};
            element.innerHTML = '';
        }
        return element;
    },
    // Mock other document properties/methods if needed by the function
};

global.window = {
    alert: function(message) {
        console.log("ALERT (mocked):", message);
    }
};

// Mock necessary DOM element inputs for the function
global.noteTitleInput = {
    value: "Test Short Note"
};

global.noteContentEditor = {
    innerHTML: `
        <p>This is a short note. It should easily fit on a single page.</p>
        <p>A second paragraph, but still very brief.</p>
    `
};

global.exportPdfBtn = {
    disabled: false,
    textContent: 'Export PDF'
};

// Mock html2pdf
let html2pdfMockCalled = false;
let html2pdfOptions = null;
global.html2pdf = function() {
    console.log("html2pdf() mock called");
    return {
        from: function(element) {
            console.log("html2pdf().from() mock called with element:", element.tag, "Children count:", element.children ? element.children.length : 0);
            return {
                set: function(opt) {
                    html2pdfMockCalled = true;
                    html2pdfOptions = opt;
                    console.log("html2pdf().set() mock called with options:", opt);
                    return {
                        save: function() {
                            console.log("html2pdf().save() mock called. Filename:", opt.filename);
                            // Simulate successful save
                            return Promise.resolve();
                        }
                    };
                }
            };
        }
    };
};
// --- End of Mocks ---

// --- Start of exportNoteToPDF function (copied from script.js) ---
function exportNoteToPDF() {
    if (typeof html2pdf === 'undefined') {
        // This block is technically not needed if html2pdf is globally defined like above for the mock
        // but keeping it for consistency with the original script.js structure
        alert("PDF export functionality is currently unavailable. Please check your internet connection or try again later.");
        return;
    }

    const noteTitle = noteTitleInput.value.trim();
    const noteContentHTML = noteContentEditor.innerHTML.trim();

    // Simplified check for empty note
    if (!noteTitle && !noteContentHTML) {
        alert("No note selected or the current note is empty.");
        return;
    }

    const elementToPrint = document.createElement('div');
    elementToPrint.style.color = '#000'; // Ensure text is black
    elementToPrint.style.backgroundColor = '#fff'; // Ensure background is white

    const titleElement = document.createElement('h1');
    titleElement.textContent = noteTitle || "Untitled Note"; // Provide a default if title is empty
    titleElement.style.color = '#000';
    titleElement.style.marginBottom = '20px';
    titleElement.style.fontSize = '24px';
    // --- Start of changes for heading placement ---
    titleElement.style.display = 'block';
    titleElement.style.textAlign = 'center';
    titleElement.style.width = '100%';
    // --- End of changes for heading placement ---

    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = noteContentHTML;
    contentWrapper.style.color = '#000';
    contentWrapper.style.fontSize = '12px';
    // --- Start of changes for content pagination ---
    contentWrapper.style.overflowWrap = 'break-word';
    contentWrapper.style.wordWrap = 'break-word';
    // Ensure content can break (though html2pdf's pagebreak mode is primary)
    contentWrapper.style.pageBreakInside = 'auto'; 
    // --- End of changes for content pagination ---

    // Ensure all child elements within contentWrapper also have black text color
    contentWrapper.querySelectorAll('*').forEach(el => {
        el.style.color = '#000';
    });

    elementToPrint.appendChild(titleElement);
    elementToPrint.appendChild(contentWrapper);

    const filename = (noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "note") + ".pdf";
    const opt = {
        margin: 10, // mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        // --- Start of changes for jsPDF options and pagebreak ---
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', autoPaging: 'text' },
        pagebreak: { mode: ['css', 'legacy'] }
        // --- End of changes for jsPDF options and pagebreak ---
    };

    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = 'Generating...';

    html2pdf().from(elementToPrint).set(opt).save().then(() => {
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Export PDF';
        console.log("PDF export process successful (mocked).");
    }).catch(err => {
        console.error("Error generating PDF (mocked):", err);
        alert("Error generating PDF. Check console for details.");
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Export PDF';
    });
}
// --- End of exportNoteToPDF function ---

// --- Test Execution ---
try {
    console.log("Attempting to call exportNoteToPDF with short content...");
    exportNoteToPDF();

    // Check if the mock was called and options were set
    if (html2pdfMockCalled) {
        console.log("html2pdf mock was called successfully for short content.");
        console.log("Options passed to html2pdf:", JSON.stringify(html2pdfOptions, null, 2));
        if (html2pdfOptions.pagebreak && html2pdfOptions.pagebreak.mode.includes('css') && html2pdfOptions.pagebreak.mode.includes('legacy')) {
            console.log("Pagebreak mode is correctly set (should not negatively impact short content).");
        } else {
            console.error("Pagebreak mode might not be correctly set.");
        }
        if (html2pdfOptions.jsPDF && html2pdfOptions.jsPDF.autoPaging === 'text') {
            console.log("jsPDF.autoPaging is correctly set.");
        } else {
            console.error("jsPDF.autoPaging might not be correctly set.");
        }
    } else {
        console.error("html2pdf mock was NOT called for short content. Check the function logic or mocks.");
    }

} catch (e) {
    console.error("Error during short content test execution:", e);
}
