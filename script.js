// DOM Element References
const newNoteBtn = document.getElementById('new-note-btn');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentEditor = document.getElementById('note-content-editor');
const notesListDiv = document.getElementById('notes-list'); // Corrected: notes-list is the div
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const underlineBtn = document.getElementById('underline-btn');
const linkBtn = document.getElementById('link-btn'); // Added linkBtn
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportXlsxBtn = document.getElementById('export-xlsx-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');

// Notes Array
let notes = [];
let currentNoteId = null;

// --- Core Functions ---

/**
 * Loads notes from local storage and displays them.
 */
function loadNotes() {
    const storedNotes = localStorage.getItem('glassnotes-notes');
    if (storedNotes) {
        try {
            notes = JSON.parse(storedNotes);
        } catch (error) {
            console.error("Error parsing notes from local storage:", error);
            notes = []; // Reset to empty array on error
        }
    }
    displayNotes();
}

/**
 * Saves the current notes array to local storage.
 */
function saveNotes() {
    try {
        localStorage.setItem('glassnotes-notes', JSON.stringify(notes));
    } catch (error) {
        console.error("Error saving notes to local storage:", error);
    }
}

/**
 * Displays notes in the sidebar.
 */
function displayNotes() {
    notesListDiv.innerHTML = ''; // Clear current list

    if (!Array.isArray(notes)) {
        console.error("Cannot display notes, 'notes' is not an array.", notes);
        return;
    }

    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note-item');
        noteDiv.dataset.id = note.id; // Keep this for loading the note

        // Create a span for the title
        const titleSpan = document.createElement('span');
        titleSpan.classList.add('note-item-title');
        titleSpan.textContent = note.title || 'Untitled Note';
        noteDiv.appendChild(titleSpan);

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-note-btn');
        deleteBtn.textContent = 'X'; // Or 'Delete'
        deleteBtn.dataset.noteId = note.id;

        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering loadNoteIntoEditor
            const noteIdToDelete = event.target.dataset.noteId;
            deleteNote(noteIdToDelete);
        });

        noteDiv.appendChild(deleteBtn);

        // Event listener for loading the note (on the noteDiv, not the titleSpan)
        noteDiv.addEventListener('click', () => {
            loadNoteIntoEditor(note.id);
        });

        notesListDiv.appendChild(noteDiv);
    });
}

/**
 * Deletes a note by its ID.
 * @param {string} noteId - The ID of the note to delete.
 */
function deleteNote(noteId) {
    notes = notes.filter(note => note.id !== noteId);
    saveNotes();
    displayNotes();

    // If the deleted note was the one currently in the editor, clear the editor
    if (currentNoteId === noteId) {
        noteTitleInput.value = '';
        noteContentEditor.innerHTML = '';
        currentNoteId = null;
    }
}

/**
 * Loads a specific note into the editor.
 * @param {string} noteId - The ID of the note to load.
 */
function loadNoteIntoEditor(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        noteTitleInput.value = note.title;
        noteContentEditor.innerHTML = note.content; // Use innerHTML for contenteditable
        currentNoteId = note.id;
    } else {
        console.warn(`Note with ID ${noteId} not found.`);
        // Optionally clear editor if note not found or handle as preferred
        noteTitleInput.value = '';
        noteContentEditor.innerHTML = '';
        currentNoteId = null;
    }
}

/**
 * Handles saving or updating a note based on editor input.
 */
function handleEditorInput() {
    const title = noteTitleInput.value.trim();
    const content = noteContentEditor.innerHTML; // Use innerHTML for contenteditable

    if (currentNoteId) {
        // Update existing note
        const noteToUpdate = notes.find(note => note.id === currentNoteId);
        if (noteToUpdate) {
            noteToUpdate.title = title;
            noteToUpdate.content = content;
        } else {
            // This case should ideally not happen if currentNoteId is managed correctly
            console.warn("currentNoteId is set, but note not found for update. Creating new note instead.");
            createNewNote(title, content);
        }
    } else {
        // Create new note (only if there's content or title)
        if (title || content) {
            createNewNote(title, content);
        }
    }

    saveNotes();
    displayNotes(); // Refresh list, especially for title changes or new notes
}

/**
 * Creates a new note and sets it as the current note.
 * @param {string} title
 * @param {string} content
 */
function createNewNote(title, content) {
    const newNote = {
        id: Date.now().toString(),
        title: title || 'Untitled Note', // Default title if empty
        content: content
    };
    notes.push(newNote);
    currentNoteId = newNote.id; // Set currentNoteId to the new note
}

// --- Event Listeners ---

// New Note Button
newNoteBtn.addEventListener('click', () => {
    noteTitleInput.value = '';
    noteContentEditor.innerHTML = '';
    currentNoteId = null;
    noteTitleInput.focus(); // Focus on title input for new note
});

// Save/Update on editor input
noteTitleInput.addEventListener('input', handleEditorInput);
noteContentEditor.addEventListener('input', handleEditorInput);


// --- Initial Load ---
// Ensure DOM is fully loaded before trying to access elements, especially for `loadNotes`.
document.addEventListener('DOMContentLoaded', async () => {
    loadNotes();

    if (typeof tsParticles !== 'undefined') {
        try {
            await tsParticles.load({
                id: "particles-bg", // Matches the div ID in index.html
                options: {
                    autoPlay: true,
                    background: {
                        color: {
                            value: 'transparent' // Make canvas transparent to show CSS gradient
                        },
                    },
                    fullScreen: {
                        enable: true, // Enable fullScreen mode
                        zIndex: -1     // Make sure canvas is behind other content
                    },
                    particles: {
                        number: {
                            value: 30, // Low density
                            density: {
                                enable: true,
                                value_area: 800 // Standard area for density calculation
                            }
                        },
                        color: {
                            value: "#ffffff" // White particles
                        },
                        shape: {
                            type: "circle"
                        },
                        opacity: {
                            value: 0.2 // Particle opacity
                        },
                        size: {
                            value: { min: 1, max: 3 } // Small particles
                        },
                        links: {
                            enable: false // No links between particles
                        },
                        move: {
                            enable: true,
                            speed: 1, // Slow speed
                            direction: "none",
                            random: true,
                            straight: false,
                            out_mode: "out",
                        }
                    },
                    interactivity: {
                        detect_on: "canvas",
                        events: {
                            onHover: {
                                enable: false // Disable hover interactivity
                            },
                            onClick: {
                                enable: false // Disable click interactivity
                            },
                        }
                    },
                    detectRetina: true // Adjusts for retina displays
                }
            });
        } catch (error) {
            console.error("Error loading tsParticles:", error);
        }
    } else {
        console.warn("tsParticles library not found. Background particle animation will not load.");
    }
});

// --- Rich Text Editing ---

/**
 * Applies a formatting command to the selected text in the note content editor.
 * @param {string} command - The command to execute (e.g., 'bold', 'italic').
 * @param {string|null} value - Optional value for the command (e.g., a URL for 'createLink').
 */
function formatDoc(command, value = null) {
    // Ensure the editor has focus to apply formatting correctly.
    // However, clicking a button outside the contenteditable might shift focus.
    // execCommand typically works on the document's active editable element or selection.
    // If issues arise, explicitly focusing might be needed: noteContentEditor.focus();
    // but that can also be disruptive if not handled carefully.
    try {
        document.execCommand(command, false, value);
    } catch (e) {
        console.error("Error executing format command:", e);
        // Optionally, provide user feedback here
    }
    // Re-focus the editor after command to allow continuous typing.
    // This is important because button clicks can take focus away.
    noteContentEditor.focus();
}

// Event Listeners for Toolbar Buttons
boldBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default button action if any
    formatDoc('bold');
});

italicBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formatDoc('italic');
});

underlineBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formatDoc('underline');
});

// Function to add a link
function addLink() {
    // Ensure the editor has focus before attempting to create a link
    // This is important as clicking the button might remove focus from the editor
    noteContentEditor.focus(); 
    const url = prompt('Enter the URL (e.g., https://www.example.com):');
    if (url) { // Check if the user provided a URL
        try {
            // Use 'createLink' command to make the selected text a hyperlink
            // The third argument `url` is the URL for the link.
            document.execCommand('createLink', false, url);
        } catch (e) {
            console.error("Error executing createLink command:", e);
            alert("Sorry, an error occurred while trying to add the link.");
        }
    }
    // No need to call noteContentEditor.focus() again here unless specific issues arise,
    // as execCommand should ideally preserve focus or manage it appropriately.
    // However, if focus is lost, it can be added back.
}

// Event Listener for Add Link Button
linkBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default button action
    addLink();
});

// --- Export to CSV ---

/**
 * Exports the current note (title and content) to a CSV file.
 */
function exportNoteToCSV() {
    if (!currentNoteId && (!noteTitleInput.value.trim() && !noteContentEditor.innerText.trim())) {
        alert("No note selected or the current note is empty.");
        return;
    }

    const title = noteTitleInput.value.trim();
    // Use innerText to get a plain text representation of the content,
    // which is generally better for CSV.
    const content = noteContentEditor.innerText; // Or .innerHTML if HTML is desired

    // Basic CSV escaping: wrap fields in double quotes and double internal double quotes.
    const csvTitle = `"${title.replace(/"/g, '""')}"`;
    const csvContent = `"${content.replace(/"/g, '""')}"`;

    const csvRows = [
        "Title,Content", // Header row
        `${csvTitle},${csvContent}` // Data row
    ];
    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf--8;' });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Create a sanitized filename from the note title or use a default.
    let filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (!filename) {
        filename = 'note';
    }
    filename += '.csv';

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
}

// Event Listener for Export CSV Button
exportCsvBtn.addEventListener('click', exportNoteToCSV);

// --- Export to XLSX ---

/**
 * Exports the current note (title and content) to an XLSX file.
 */
function exportNoteToXLSX() {
    if (typeof XLSX === 'undefined') {
        alert("XLSX export functionality is currently unavailable. Please check your internet connection or try again later.");
        return;
    }

    if (!currentNoteId && (!noteTitleInput.value.trim() && !noteContentEditor.innerText.trim())) {
        alert("No note selected or the current note is empty.");
        return;
    }

    const title = noteTitleInput.value.trim();
    const content = noteContentEditor.innerText; // Using innerText for plain text content

    // Prepare data for SheetJS - Array of objects
    const data = [{ Title: title, Content: content }];
    // Alternatively, using array of arrays:
    // const dataForSheet = [
    //     ["Title", "Content"], // Header row
    //     [title, content]      // Data row
    // ];

    try {
        // Create Worksheet and Workbook
        const worksheet = XLSX.utils.json_to_sheet(data);
        // const worksheet = XLSX.utils.aoa_to_sheet(dataForSheet); // If using array of arrays

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Note"); // Naming the sheet "Note"

        // Trigger Download
        let filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        if (!filename) {
            filename = 'note';
        }
        filename += '.xlsx';

        XLSX.writeFile(workbook, filename);
    } catch (error) {
        console.error("Error exporting to XLSX:", error);
        alert("An error occurred while exporting to XLSX. Please try again.");
    }
}

// Event Listener for Export XLSX Button
exportXlsxBtn.addEventListener('click', exportNoteToXLSX);

// --- Export to PDF ---

/**
 * Exports the current note (title and content) to a PDF file using html2pdf.js.
 */
function exportNoteToPDF() {
    if (typeof html2pdf === 'undefined') {
        alert("PDF export functionality is currently unavailable. Please check your internet connection or try again later.");
        return;
    }

    const noteTitle = noteTitleInput.value.trim();
    const noteContentHTML = noteContentEditor.innerHTML.trim();

    if ((!currentNoteId && (!noteTitle && !noteContentHTML)) || (currentNoteId && !noteTitle && !noteContentHTML)) {
        alert("No note selected or the current note is empty.");
        return;
    }

    const elementToPrint = document.createElement('div');
    const titleElement = document.createElement('h1');
    titleElement.textContent = noteTitle || "Untitled Note"; // Provide a default if title is empty
    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = noteContentHTML;

    elementToPrint.appendChild(titleElement);
    elementToPrint.appendChild(contentWrapper);

    // Ensure text is visible in PDF by setting explicit colors
    titleElement.style.color = '#000000'; // Black for title
    contentWrapper.style.color = '#333333'; // Dark gray for content

    // Optional: Add some basic styling for the PDF output
    // titleElement.style.marginBottom = '20px';
    // titleElement.style.fontSize = '24px'; // Example style
    // contentWrapper.style.fontSize = '12px'; // Example style

    const filename = (noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "note") + ".pdf";
    const opt = {
        margin: 10, // mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = 'Generating...';

    html2pdf().from(elementToPrint).set(opt).save().then(() => {
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Export PDF';
    }).catch(err => {
        console.error("Error generating PDF:", err);
        alert("Error generating PDF. Check console for details.");
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Export PDF';
    });
}

// Event Listener for Export PDF Button
exportPdfBtn.addEventListener('click', exportNoteToPDF);
