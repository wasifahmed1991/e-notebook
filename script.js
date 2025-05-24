// DOM Element References
const newNoteBtn = document.getElementById('new-note-btn');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentEditor = document.getElementById('note-content-editor');
const notesListDiv = document.getElementById('notes-list'); // Corrected: notes-list is the div
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const underlineBtn = document.getElementById('underline-btn');
// const exportCsvBtn = document.getElementById('export-csv-btn'); // Removed
// const exportXlsxBtn = document.getElementById('export-xlsx-btn'); // Removed
// const exportPdfBtn = document.getElementById('export-pdf-btn'); // Removed
const linkBtn = document.getElementById('link-btn');
const bulletListBtn = document.getElementById('bullet-list-btn');
const numberListBtn = document.getElementById('number-list-btn');
const dateTimeDisplay = document.getElementById('date-time-display');

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
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
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

// --- Add Link ---
linkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const url = window.prompt("Enter the URL:");
    if (url) {
        // Ensure the editor has focus, then execute command
        // This helps ensure the command is applied to the correct context
        noteContentEditor.focus(); 
        try {
            document.execCommand('createLink', false, url);
        } catch (err) {
            console.error("Error creating link:", err);
            alert("Could not create link. Ensure you have selected text if you wish to hyperlink existing text.");
        }
        // It's good practice to re-focus the editor after a prompt,
        // as the prompt can take focus away.
        noteContentEditor.focus(); 
    }
});

// --- List Formatting ---
bulletListBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try {
        document.execCommand('insertUnorderedList', false, null);
    } catch (err) {
        console.error("Error inserting unordered list:", err);
    }
    noteContentEditor.focus();
});

// --- Date/Time Display ---
function updateDateTime() {
    if (!dateTimeDisplay) return; // Guard clause

    const now = new Date();
    const optionsDate = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, optionsDate); // Uses browser's default locale

    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeString = now.toLocaleTimeString(undefined, optionsTime); // Uses browser's default locale

    dateTimeDisplay.textContent = `${dateString}, ${timeString}`;
}

// Initial Call and Interval for Date/Time
// This should be placed so it runs after the DOM is loaded,
// ideally within or after the main DOMContentLoaded listener.
// For now, ensuring it's at the end of script.js might work if script is deferred.
// MOVED `if (dateTimeDisplay)` block into DOMContentLoaded for proper sequencing

document.addEventListener('DOMContentLoaded', () => {
    // Existing loadNotes call
    loadNotes();

    // Date/Time Display Initialization (moved here)
    if (dateTimeDisplay) {
        updateDateTime(); // Initial call
        setInterval(updateDateTime, 1000); // Update every second
    }

    // tsParticles Initialization
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("particles-js", {
            fpsLimit: 60,
            particles: {
                number: {
                    value: 30,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ["#ffffff", "#72d5f8", "#a484e9"]
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: 0.2,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.5,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                    }
                },
                line_linked: {
                    enable: false,
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: false,
                    },
                    onclick: {
                        enable: false,
                    },
                    resize: true
                }
            },
            detectRetina: true
        });
    } else {
        console.warn("tsParticles library not loaded. Background particles will not be displayed.");
    }

    // Ripple Effect Initialization
    document.body.addEventListener('click', createRipple);
});

function createRipple(event) {
    // Check if the clicked element or its parents are interactive
    const clickedEl = event.target;
    // Define interactive selectors: buttons, links, inputs, contenteditable, note items, and the sidebar/editor containers.
    // Added .delete-note-btn as it's a button within .note-item but needs explicit exclusion if .note-item itself allows ripples.
    const interactiveSelectors = 'button, a, input, [contenteditable="true"], .note-item, .delete-note-btn, #notes-sidebar, #note-editor-container';

    if (clickedEl.closest(interactiveSelectors)) {
        // If the click is on or within an interactive element, do not create a ripple.
        return;
    }

    // Further check: if the click is on something inside the 'header' (like date-time or title)
    // but not directly the header itself, and it's not caught by above, we might want to avoid it.
    // However, the current interactiveSelectors should cover buttons/links.
    // Let's assume for now that if it's not in interactiveSelectors, it's a valid background for a ripple.

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    // Append to body so ripple is positioned relative to the viewport,
    // allowing it to appear correctly regardless of where the body is scrolled.
    document.body.appendChild(ripple);

    // Size and position the ripple
    // Make ripple diameter based on a fixed size or a small percentage of viewport larger dimension
    const rippleSize = Math.max(window.innerWidth, window.innerHeight) * 0.05; // e.g., 5% of larger dimension
    ripple.style.width = ripple.style.height = `${rippleSize}px`;

    // Position at click coordinates relative to the viewport
    // Adjust so ripple originates from its center
    ripple.style.left = `${event.clientX - (rippleSize / 2)}px`;
    ripple.style.top = `${event.clientY - (rippleSize / 2)}px`;

    // Remove ripple after animation
    ripple.addEventListener('animationend', () => {
        if (ripple.parentElement) { // Check if it's still in the DOM
            ripple.remove();
        }
    });
}
