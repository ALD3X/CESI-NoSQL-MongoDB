const API = "http://localhost:3000";

const USERS = [
    { username: "admin", password: "admin123", role: "admin", id: "user_12345" },
    { username: "user", password: "user123", role: "user", id: "user_67890" }
];

let currentUser = null;
let filters = { type: "", status: "" };

/* ================= SESSION ================= */
function loadSession() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        renderDashboard();
    } else {
        renderLogin();
    }
}

function saveSession() {
    if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
        localStorage.removeItem("currentUser");
    }
}

/* ================= AUTH ================= */
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) {
        alert("Identifiants invalides");
        return;
    }

    currentUser = { username: user.username, role: user.role, id: user.id };
    saveSession();
    renderDashboard();
}

function logout() {
    currentUser = null;
    saveSession();
    renderLogin();
}

/* ================= RENDER ================= */
function renderLogin() {
    document.getElementById("app").innerHTML = `
    <div class="container">
      <div class="card">
        <h2>Connexion</h2>
        <input id="username" placeholder="Username" />
        <input id="password" type="password" placeholder="Password" />
        <button class="primary" onclick="login()">Se connecter</button>
      </div>
    </div>
  `;
}

function renderDashboard() {
    document.getElementById("app").innerHTML = `
    <div class="container">
      <div class="header">
        <h1>FeedbackFlow</h1>
        <div>
          <span class="small">${currentUser.id} (${currentUser.role})</span>
          <button onclick="logout()">Logout</button>
        </div>
      </div>

      ${currentUser.role === "user" ? renderCreateForm() : ""}

      ${currentUser.role === "admin" ? renderFilters() : ""}

      <div id="feedbackList"></div>
    </div>
  `;

    loadFeedbacks();
}

function renderCreateForm() {
    return `
    <div class="card">
      <h3>Nouveau feedback</h3>
      <input id="type" placeholder="Type (bug, feature, improvement...)" />
      <input id="rating" type="number" placeholder="Rating (1-5)" />
      <textarea id="comment" placeholder="Commentaire"></textarea>
      <button class="primary" onclick="createFeedback()">Envoyer</button>
    </div>
  `;
}

function renderFilters() {
    return `
    <div class="card" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
      <div>
        <label>Status:</label>
        <select id="filterStatus" onchange="applyFilters()">
          <option value="">Tous</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div>
        <label>Type:</label>
        <select id="filterType" onchange="applyFilters()">
          <option value="">Tous</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="improvement">Improvement</option>
        </select>
      </div>
    </div>
    `;
}

/* ================= FILTER ================= */
function applyFilters() {
    filters.status = document.getElementById("filterStatus").value;
    filters.type = document.getElementById("filterType").value;
    loadFeedbacks();
}

/* ================= CRUD ================= */
async function createFeedback() {
    const type = document.getElementById("type").value;
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;

    await fetch(API + "/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: currentUser.id,
            type,
            rating: rating ? Number(rating) : undefined,
            comment,
            createdAt: new Date().toISOString(),
            status: "new"
        })
    });

    loadFeedbacks();
}

async function loadFeedbacks() {
    let url = API + "/feedbacks";

    if (currentUser.role === "user") {
        url += "?userId=" + currentUser.id;
    } else {
        const params = [];
        if (filters.status) params.push("status=" + filters.status);
        if (filters.type) params.push("type=" + filters.type);
        if (params.length) url += "?" + params.join("&");
    }

    const res = await fetch(url);
    const data = await res.json();

    const container = document.getElementById("feedbackList");
    container.innerHTML = "";

    data.forEach(f => {
        const card = document.createElement("div");
        card.className = "card";

        // border color selon type
        let borderColor = "gray";
        if (f.type === "bug") borderColor = "red";
        else if (f.type === "feature") borderColor = "blue";
        else if (f.type === "improvement") borderColor = "green";
        card.style.border = `2px solid ${borderColor}`;

        // badge color selon status
        let badgeColor = "gray";
        if (f.status === "new") badgeColor = "orange";
        else if (f.status === "reviewed") badgeColor = "blue";
        else if (f.status === "closed") badgeColor = "green";

        card.innerHTML = `
      <div class="header">
        <div>
          <strong style="color:${borderColor}">${f.type}</strong>
          <div class="small">User: ${f.userId}</div>
        </div>
        <span class="badge" style="border-color:${badgeColor}; color:${badgeColor};">${f.status}</span>
      </div>
      <p>${f.comment || ""}</p>
      <div class="small">${new Date(f.createdAt).toLocaleString()}</div>
      ${currentUser.role === "admin"
                ? `
            <div style="margin-top:10px;">
              <button onclick="updateStatus('${f._id}','reviewed')">Reviewed</button>
              <button onclick="updateStatus('${f._id}','closed')">Closed</button>
            </div>
          `
                : ""
            }
    `;

        container.appendChild(card);
    });
}

async function updateStatus(id, status) {
    await fetch(API + "/feedbacks/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    loadFeedbacks();
}

/* ================= INIT ================= */
loadSession();
