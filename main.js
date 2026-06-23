const table = document.getElementById("fontTable");
const filterType = document.getElementById("filterType");
const filterLicense = document.getElementById("filterLicense");
const testTextInput = document.getElementById("testText");
const fontCount = document.getElementById("fontCount");
const fontSizeInput = document.getElementById("fontSize");
let previewFontSize = fontSizeInput.value;
let selectedFilename = null;


let fontData = [];
let currentText = null;

/* -------------------------------
   Load JSON once
-------------------------------- */
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    fontData = data.fonts;
    loadFonts(fontData);
    applyFilters();
  });

/* -------------------------------
   Load font files
-------------------------------- */
function loadFonts(fonts) {
  fonts.forEach(font => {
    if (!font.fontFile) return;

    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: '${font.name}';
        src: url('fonts/${font.fontFile}');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  });
}

/* -------------------------------
   Apply filters + sorting
-------------------------------- */
function applyFilters() {
  let result = [...fontData];

  // Filter by selected filename
  if (selectedFilename) {
    result = result.filter(f => f.fontFile === selectedFilename);
  }

  if (filterType.value !== "all") {
    result = result.filter(f => f.type === filterType.value);
  }

  if (filterLicense.value !== "all") {
    result = result.filter(f => f.license === filterLicense.value);
  }

  result = sortFonts(result); // sorted COPY

  render(result);
  updateFontCount(result.length);
}

/* -------------------------------
   Render table
-------------------------------- */
function render(fonts) {
  table.innerHTML = "";

  fonts.forEach(font => {
    const previewText =
      currentText && currentText.trim() !== ""
        ? currentText
        : font.callout || "ಕನ್ನಡ";

    table.innerHTML += `
      <tr>
        <td class="preview">
          <div class="font-name">
            ${font.name}
          </div>
          <div class="font-preview"
               style="font-family:'${font.name}'; font-size:${previewFontSize}px">
            ${previewText}
          </div>
        </td>
        <td>
          ${
            font.foundryUrl
              ? `<a href="${font.foundryUrl}" target="_blank" rel="noopener">${font.foundry}</a>`
              : font.foundry
          }
        </td>
        <td>
          <a href="${font.download}" target="_blank" rel="noopener">
            Download
          </a>
        </td>
      </tr>
    `;
  });
}

/* -------------------------------
   Sorting logic
-------------------------------- */
function sortFonts(fonts) {
  const licenseOrder = ["OFL", "End User", "Commercial"];

  return [...fonts].sort((a, b) => {
    const licenseDiff =
      licenseOrder.indexOf(a.license) - licenseOrder.indexOf(b.license);

    if (licenseDiff !== 0) return licenseDiff;

    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });
}

/* -------------------------------
   Font count
-------------------------------- */
function updateFontCount(count) {
  fontCount.textContent = `${count} Font${count !== 1 ? "s" : ""}`;
}

/* -------------------------------
   Event listeners (FIXED)
-------------------------------- */
filterType.addEventListener("change", applyFilters);
filterLicense.addEventListener("change", applyFilters);

testTextInput.addEventListener("input", e => {
  currentText = e.target.value;
  applyFilters();
});


fontSizeInput.addEventListener("input", e => {
  previewFontSize = e.target.value;
  applyFilters(); // re-render only
});


document.getElementById("resetControls").addEventListener("click", () => {
  selectedFilename = null;
  filenameInput.value = "";
  filenameResults.innerHTML = "";
  location.reload();
});

/* -------------------------------
   Filename Search
-------------------------------- */
const filenameInput = document.getElementById("filenameInput");
const filenameResults = document.getElementById("filenameResults");

function searchByFilename(query) {
  if (!query.trim()) {
    filenameResults.innerHTML = "";
    filenameResults.classList.remove("empty");
    return;
  }

  const lowerQuery = query.toLowerCase();
  const matches = fontData.filter(font =>
    font.fontFile && font.fontFile.toLowerCase().includes(lowerQuery)
  );

  if (matches.length === 0) {
    filenameResults.innerHTML = '<span class="empty">No fonts found</span>';
    filenameResults.classList.add("empty");
    return;
  }

  filenameResults.innerHTML = matches
    .map(font => `<div class="filename-item" data-filename="${font.fontFile}">${font.fontFile}</div>`)
    .join("");
  filenameResults.classList.remove("empty");

  // Add click handlers to filename items
  document.querySelectorAll(".filename-item").forEach(item => {
    item.addEventListener("click", () => {
      selectedFilename = item.getAttribute("data-filename");
      applyFilters();
    });
  });
}

filenameInput.addEventListener("input", e => {
  searchByFilename(e.target.value);
});

