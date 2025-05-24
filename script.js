// DOM Element References
const newNoteBtn = document.getElementById('new-note-btn');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentEditor = document.getElementById('note-content-editor');
const notesListDiv = document.getElementById('notes-list'); // Corrected: notes-list is the div
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const underlineBtn = document.getElementById('underline-btn');
const strikethroughBtn = document.getElementById('strikethrough-btn'); // Added strikethroughBtn
const blockquoteBtn = document.getElementById('blockquote-btn'); // Added blockquoteBtn
const linkBtn = document.getElementById('link-btn'); // Added linkBtn
const bulletListBtn = document.getElementById('bullet-list-btn'); // Added bulletListBtn
const numberListBtn = document.getElementById('number-list-btn'); // Added numberListBtn
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportXlsxBtn = document.getElementById('export-xlsx-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn'); // Added themeToggleBtn
const autosaveIndicator = document.getElementById('autosave-indicator'); // Added autosaveIndicator

// Notes Array
let notes = [];
let currentNoteId = null;
let autosaveTimeout = null; // For managing autosave indicator display

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
    // Add confirmation step
    if (!confirm("Are you sure you want to permanently delete this note?")) {
        return; // User clicked 'Cancel', so exit the function without deleting
    }

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

    // Autosave indicator logic
    if (autosaveIndicator) {
        clearTimeout(autosaveTimeout); // Clear any existing timeout

        autosaveIndicator.textContent = "Saving...";
        autosaveIndicator.style.opacity = '1';

        autosaveTimeout = setTimeout(() => {
            autosaveIndicator.textContent = "Saved!";
            // Keep "Saved!" message for a bit longer, then fade out
            autosaveTimeout = setTimeout(() => {
                autosaveIndicator.style.opacity = '0';
                // Optional: clear text after fade out, after transition ends
                // setTimeout(() => { 
                //     if (autosaveIndicator.style.opacity === '0') autosaveIndicator.textContent = ""; 
                // }, 500); // Match CSS transition duration
            }, 1500); // Duration "Saved!" is shown (1.5 seconds)
        }, 750); // Delay before showing "Saved!" (0.75 seconds)
    }
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

// --- Date and Time Display ---
function updateDateTimeDisplay() {
    const dateTimeContainer = document.getElementById('datetime-container');
    if (!dateTimeContainer) {
        console.warn("Date-time container not found in the DOM.");
        return; 
    }

    const now = new Date();
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' }; // Omitting seconds

    try {
        const formattedDate = now.toLocaleDateString(undefined, dateOptions);
        const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
        dateTimeContainer.textContent = `${formattedDate} | ${formattedTime}`;
    } catch (error) {
        console.error("Error formatting date or time:", error);
        dateTimeContainer.textContent = "Could not load date/time";
    }
}

// --- Initial Load ---
// Ensure DOM is fully loaded before trying to access elements, especially for `loadNotes`.
document.addEventListener('DOMContentLoaded', async () => {
    loadNotes();
    updateDateTimeDisplay(); // Initial call to display date/time
    setInterval(updateDateTimeDisplay, 60000); // Update every minute

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

    // Ripple click animation on background
    document.body.addEventListener('click', function(event) {
        const target = event.target;

        // 1. Define selectors for specific interactive elements or content blocks 
        //    where clicks should absolutely NOT trigger the background animation.
        const nonAnimatingContentSelectors = [
            'button',
            'a',
            'input',
            '[contenteditable]',      // The main note content editor div
            '.note-item',           // Individual note items in the sidebar
            '.note-item *',         // Children of note items
            '#editor-toolbar',      // The toolbar itself
            '#editor-toolbar *',    // Children of the toolbar (buttons are already covered, but good for completeness)
            '#datetime-container',
            '#datetime-container *',// Children of datetime (if any)
            'header h1',              // The main title
            'footer p',             // Text within the footer
            'footer a'              // Links within the footer
        ].join(',');

        if (target.closest(nonAnimatingContentSelectors)) {
            return; // Clicked on or inside a specific non-animating content element.
        }

        // 2. Now, check if the click was on a designated "background" area.
        //    These are broader areas where, if not caught by the above, a click implies a background interaction.
        //    This allows clicks on empty spaces within header, footer, sidebar, editor container, etc.
        if (target.id === 'particles-bg' ||
            target.tagName === 'BODY' ||
            target.tagName === 'MAIN' ||
            target.classList.contains('container') || 
            target.closest('header') || // Includes empty space in header
            target.closest('footer') || // Includes empty space in footer
            target.closest('#notes-sidebar') || // Includes empty space in sidebar
            target.closest('#note-editor-container') || // Includes empty space in editor area
            target === document.documentElement // Click on root html element
           ) {
            
            // Proceed to create ripple and particles
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-click-effect');
            document.body.appendChild(ripple);

            ripple.style.left = event.clientX + 'px';
            ripple.style.top = event.clientY + 'px';
            
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });

            // Create firefly/star particles
            const numParticles = Math.floor(Math.random() * 3) + 3; // Randomly 3 to 5 particles

            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('span');
                particle.classList.add('click-particle');
                
                // Set initial position at the click
                particle.style.left = event.clientX + 'px';
                particle.style.top = event.clientY + 'px';

                // Generate random values for CSS custom properties
                // These control the direction and distance of the particle's movement
                // Values between -1 and 1, then scaled by the CSS animation's multiplier
                const randomX = (Math.random() - 0.5) * 2; 
                const randomY = (Math.random() - 0.5) * 2;
                
                particle.style.setProperty('--random-x', randomX.toFixed(2));
                particle.style.setProperty('--random-y', randomY.toFixed(2));
                
                document.body.appendChild(particle);

                particle.addEventListener('animationend', () => {
                    particle.remove();
                });
            }
        }
    });

    // Theme Toggle Functionality
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = 'Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleBtn.textContent = 'Toggle Dark Mode';
        }
    }

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        applyTheme(currentTheme);
    } else { // Default to light theme if no preference saved
        applyTheme('light');
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = 'light';
        if (document.body.classList.contains('dark-theme')) {
            // It's currently dark, so toggle to light
            theme = 'light';
        } else {
            // It's currently light, so toggle to dark
            theme = 'dark';
        }
        applyTheme(theme);
        localStorage.setItem('theme', theme);
    });
});

// --- Rich Text Editing ---

/**
 * Applies a formatting command to the selected text in the note content editor.
 * @param {string} command - The command to execute (e.g., 'bold', 'italic').
 * @param {string|null} value - Optional value for the command (e.g., a URL for 'createLink').
 */
function formatDoc(command, value = null) {
    // Ensure the editor has focus to apply formatting correctly.
    noteContentEditor.focus(); // Explicitly focus BEFORE execCommand
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

// Event Listener for Strikethrough Button
strikethroughBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formatDoc('strikeThrough');
});

// Event Listener for Blockquote Button
blockquoteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formatDoc('formatBlock', '<blockquote>');
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

// Event Listener for Bullet List Button
bulletListBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formatDoc('insertUnorderedList');
});

// Event Listener for Number List Button
numberListBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formatDoc('insertOrderedList');
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

    if (!noteTitle && !noteContentHTML) { // Simplified check: if both are empty
        alert("The note is empty. Nothing to export.");
        return;
    }

    const elementToPrint = document.createElement('div');
    // --- Styling for elementToPrint (for html2pdf.js processing) ---
    elementToPrint.style.display = 'block';
    elementToPrint.style.position = 'relative'; // Default or 'static' is also fine
    elementToPrint.style.textAlign = 'left';   // Base alignment for the whole printable area
    elementToPrint.style.width = '100%';       // Let html2pdf.js determine width based on format & margin
    elementToPrint.style.height = 'auto';
    elementToPrint.style.overflow = 'visible'; // Crucial for multi-page content
    elementToPrint.style.padding = '0';        // Margins will be handled by opt.margin
    elementToPrint.style.margin = '0';
    elementToPrint.style.backgroundColor = '#ffffff'; // Ensure a white background for content area
    elementToPrint.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    const titleElement = document.createElement('h1');
    titleElement.textContent = noteTitle || "Untitled Note";
    // --- Styling for titleElement ---
    titleElement.style.color = '#000000';
    titleElement.style.fontSize = '22px';
    titleElement.style.fontWeight = 'bold';
    titleElement.style.lineHeight = '1.4';
    titleElement.style.marginBottom = '10mm'; // Space after the title
    titleElement.style.marginTop = '0';       // Ensure title starts at the top of the content area
    titleElement.style.padding = '0';
    titleElement.style.wordBreak = 'break-word';
    titleElement.style.textAlign = 'center';  // Center the title text

    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = noteContentHTML;
    // --- Styling for contentWrapper ---
    contentWrapper.style.color = '#333333';
    contentWrapper.style.fontSize = '12px';
    contentWrapper.style.lineHeight = '1.6';
    contentWrapper.style.whiteSpace = 'pre-wrap'; // Preserve formatting
    contentWrapper.style.wordBreak = 'break-word';
    contentWrapper.style.textAlign = 'left';    // Content alignment
    contentWrapper.style.overflow = 'visible';  // Ensure all content flows
    contentWrapper.style.height = 'auto';       // Let content define its height

    elementToPrint.appendChild(titleElement);
    elementToPrint.appendChild(contentWrapper);

    // Conceptual visual debugging (code would be commented out or removed in production)
    /*
    const tempView = elementToPrint.cloneNode(true); // Clone to avoid issues with html2pdf processing
    tempView.style.position = 'fixed'; tempView.style.left = '10px'; tempView.style.top = '10px';
    tempView.style.zIndex = '20000'; tempView.style.border = '2px solid red';
    tempView.style.width = '210mm'; // A4 width for viewing
    tempView.style.padding = '15mm'; // Apply similar margins as PDF for viewing
    tempView.style.boxSizing = 'border-box';
    tempView.style.maxHeight = '90vh'; tempView.style.overflowY = 'scroll';
    document.body.appendChild(tempView);
    setTimeout(() => { if (tempView.parentElement) tempView.remove(); }, 10000); // Remove after 10s
    */

    const filename = (noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "note") + ".pdf";
    const opt = {
        margin: 15, // Apply 15mm margins to the PDF page (can be array [top, left, bottom, right])
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false, 
            backgroundColor: '#ffffff' // Should be redundant if elementToPrint has it, but good for safety
        },
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
