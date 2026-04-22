// =============================================
//  STUDENT MANAGEMENT SYSTEM — script.js
//  WA0101 Evidence — NQF Level 5
// =============================================

// --- DATA STORE ---
// Stores all student records in an array
let students = [
  { id: "STU001", name: "Thabo Nkosi",      grade: "Grade 12", score: 85, status: "Active" },
  { id: "STU002", name: "Aisha Louw",        grade: "Grade 11", score: 72, status: "Active" },
  { id: "STU003", name: "Kyle Mokoena",      grade: "Grade 10", score: 58, status: "Inactive" },
  { id: "STU004", name: "Naledi Pietersen",  grade: "Grade 12", score: 91, status: "Active" },
  { id: "STU005", name: "Sipho Dlamini",     grade: "Grade 9",  score: 64, status: "Active" },
];

// -----------------------------------------------
// HELPER: Get initials from a full name
// Example: "Thabo Nkosi" → "TN"
// -----------------------------------------------
function getInitials(name) {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

// -----------------------------------------------
// HELPER: Assign a CSS class based on score
// -----------------------------------------------
function getScoreClass(score) {
  if (score >= 75) return "score-high";
  if (score >= 50) return "score-mid";
  return "score-low";
}

// -----------------------------------------------
// HELPER: Show or hide an element
// -----------------------------------------------
function showElement(el, visible) {
  el.hidden = !visible;
}

// -----------------------------------------------
// RENDER: Draw the table rows from the students array
// Can accept a filtered subset to display
// -----------------------------------------------
function renderTable(list) {
  const tbody = document.getElementById("student-table-body");
  const emptyState = document.getElementById("empty-state");

  // If no students, show empty state message
  if (list.length === 0) {
    tbody.innerHTML = "";
    showElement(emptyState, true);
    return;
  }

  showElement(emptyState, false);

  // Build a table row for each student
  tbody.innerHTML = list.map((student, index) => `
    <tr>
      <td>
        <div class="student-name-cell">
          <div class="avatar" aria-hidden="true">${getInitials(student.name)}</div>
          <span>${student.name}</span>
        </div>
      </td>
      <td>${student.id}</td>
      <td>${student.grade}</td>
      <td>
        <span class="${getScoreClass(student.score)}">${student.score}%</span>
      </td>
      <td>
        <span class="badge ${student.status === 'Active' ? 'badge-active' : 'badge-inactive'}">
          ${student.status}
        </span>
      </td>
      <td>
        <button
          class="btn-delete"
          onclick="deleteStudent(${index})"
          aria-label="Delete student ${student.name}"
        >
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// -----------------------------------------------
// RENDER: Update all 4 summary stat cards
// -----------------------------------------------
function updateStats() {
  const total = students.length;
  const active = students.filter(s => s.status === "Active").length;
  const avgScore = total > 0
    ? Math.round(students.reduce((sum, s) => sum + s.score, 0) / total)
    : 0;

  // Find the most common grade
  const gradeCounts = {};
  students.forEach(s => {
    gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1;
  });
  const topGrade = total > 0
    ? Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "—";

  document.getElementById("total-count").textContent = total;
  document.getElementById("active-count").textContent = active;
  document.getElementById("avg-score").textContent = avgScore + "%";
  document.getElementById("top-grade").textContent = topGrade;
}

// -----------------------------------------------
// ADD STUDENT: Validate form and add to array
// -----------------------------------------------
function addStudent() {
  const nameInput  = document.getElementById("s-name");
  const idInput    = document.getElementById("s-id");
  const gradeInput = document.getElementById("s-grade");
  const scoreInput = document.getElementById("s-score");
  const statusInput= document.getElementById("s-status");
  const errorDiv   = document.getElementById("form-error");
  const successDiv = document.getElementById("form-success");

  // Hide previous messages
  showElement(errorDiv, false);
  showElement(successDiv, false);

  // Get values
  const name   = nameInput.value.trim();
  const id     = idInput.value.trim();
  const grade  = gradeInput.value;
  const score  = parseInt(scoreInput.value);
  const status = statusInput.value;

  // --- VALIDATION ---
  if (!name) {
    errorDiv.textContent = "Please enter the student's full name.";
    showElement(errorDiv, true);
    nameInput.focus();
    return;
  }

  if (!id) {
    errorDiv.textContent = "Please enter a Student ID.";
    showElement(errorDiv, true);
    idInput.focus();
    return;
  }

  // Check for duplicate ID
  const duplicateId = students.find(s => s.id.toLowerCase() === id.toLowerCase());
  if (duplicateId) {
    errorDiv.textContent = `Student ID "${id}" already exists. Please use a unique ID.`;
    showElement(errorDiv, true);
    idInput.focus();
    return;
  }

  if (!grade) {
    errorDiv.textContent = "Please select a grade.";
    showElement(errorDiv, true);
    gradeInput.focus();
    return;
  }

  if (isNaN(score) || score < 0 || score > 100) {
    errorDiv.textContent = "Score must be a number between 0 and 100.";
    showElement(errorDiv, true);
    scoreInput.focus();
    return;
  }

  // --- ADD TO ARRAY ---
  students.push({ id, name, grade, score, status });

  // Refresh UI
  renderTable(students);
  updateStats();

  // Show success message
  successDiv.textContent = `Student "${name}" was added successfully!`;
  showElement(successDiv, true);

  // Clear the form
  clearForm();

  // Auto-hide success after 3 seconds
  setTimeout(() => showElement(successDiv, false), 3000);
}

// -----------------------------------------------
// DELETE STUDENT: Remove from array by index
// -----------------------------------------------
function deleteStudent(index) {
  const student = students[index];
  if (confirm(`Are you sure you want to delete "${student.name}"?`)) {
    students.splice(index, 1);
    renderTable(students);
    updateStats();
  }
}

// -----------------------------------------------
// SEARCH & FILTER: Filter table by name/ID and grade
// -----------------------------------------------
function searchStudents() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const gradeFilter = document.getElementById("filter-grade").value;

  const filtered = students.filter(student => {
    const matchesQuery =
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query);
    const matchesGrade =
      gradeFilter === "" || student.grade === gradeFilter;

    return matchesQuery && matchesGrade;
  });

  renderTable(filtered);
}

// -----------------------------------------------
// CLEAR FORM: Reset all input fields
// -----------------------------------------------
function clearForm() {
  document.getElementById("s-name").value  = "";
  document.getElementById("s-id").value    = "";
  document.getElementById("s-grade").value = "";
  document.getElementById("s-score").value = "";
  document.getElementById("s-status").value = "Active";
  showElement(document.getElementById("form-error"), false);
  showElement(document.getElementById("form-success"), false);
}

// -----------------------------------------------
// INIT: Run when page first loads
// -----------------------------------------------
function init() {
  renderTable(students);
  updateStats();
}

// Start the app
init();
