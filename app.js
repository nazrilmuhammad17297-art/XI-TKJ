// ========== DATA ==========
const JADWAL_MAPEL = {
  Senin: ["AIJ", "PJOK", "IFRM"],
  Selasa: ["ASJ", "BI", "PAIBP"],
  Rabu: ["PPS", "TWAN", "BING"],
  Kamis: ["SI", "BK", "BJPG", "MTK"],
  Jumat: ["KIK", "BTQ"]
};

const JADWAL_PIKET = {
  Senin: ["TEGUH", "RIVAN", "RANGGA", "ANWAR", "FRADIL", "NAZAM"],
  Selasa: ["RAFI", "SATRIA", "IKSAN", "KAFAKA", "HORI", "NAZRIL"],
  Rabu: ["FAHRIZAL", "KIKI", "HUSNI", "AZMI", "AJIHAN", "DERIL"],
  Kamis: ["FAARIH", "FAJAR", "FADIL", "TOYIBUR", "LUCY", "RISMA"],
  Jumat: ["ADIS", "YOPTI", "RAHMAT", "ANGGA", "ARGA", "RIZKY"]
};

const DAFTAR_SISWA = [
  "TEGUH", "RIVAN", "RANGGA", "ANWAR", "FRADIL", "NAZAM",
  "RAFI", "SATRIA", "IKSAN", "KAFAKA", "HORI", "NAZRIL",
  "FAHRIZAL", "KIKI", "HUSNI", "AZMI", "AJIHAN", "DERIL",
  "FAARIH", "FAJAR", "FADIL", "TOYIBUR", "LUCY", "RISMA",
  "ADIS", "YOPTI", "RAHMAT", "ANGGA", "ARGA", "RIZKY"
];

const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// ========== STATE ==========
let isAdmin = false;
let currentUser = null;

// ========== HELPERS ==========
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), duration);
}

function getTugas() {
  return JSON.parse(localStorage.getItem("xi_tkj_tugas") || "[]");
}

function saveTugas(data) {
  localStorage.setItem("xi_tkj_tugas", JSON.stringify(data));
}

function getAbsensi(date) {
  return JSON.parse(localStorage.getItem("xi_tkj_absensi_" + date) || "{}");
}

function saveAbsensi(date, data) {
  localStorage.setItem("xi_tkj_absensi_" + date, JSON.stringify(data));
}

function getPengumuman() {
  return JSON.parse(localStorage.getItem("xi_tkj_pengumuman") || "[]");
}

function savePengumuman(data) {
  localStorage.setItem("xi_tkj_pengumuman", JSON.stringify(data));
}

// ========== LOGIN ==========
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("username").value.trim().toLowerCase();
  const pass = document.getElementById("password").value;

  if (user === "nazril" && pass === "admin1") {
    isAdmin = true;
    currentUser = "Nazril (Admin)";
    enterApp();
    showToast("✅ Login Admin berhasil! Selamat datang Nazril");
  } else {
    showToast("❌ Username atau password salah!");
  }
});

document.getElementById("guest-btn").addEventListener("click", () => {
  isAdmin = false;
  currentUser = "Siswa";
  enterApp();
  showToast("👋 Selamat datang di mode Siswa");
});

document.getElementById("logout-btn").addEventListener("click", () => {
  isAdmin = false;
  currentUser = null;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

function enterApp() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("user-role").textContent = isAdmin ? "Admin" : "Siswa";

  // Show/hide admin elements
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.classList.toggle("hidden", !isAdmin);
  });

  // Set hari ini
  const today = new Date();
  document.getElementById("hari-ini").textContent = HARI_ID[today.getDay()] + ", " + formatDate(getToday());

  // Set default absensi date
  document.getElementById("absensi-date").value = getToday();

  renderAll();
  requestNotificationPermission();
}

// ========== NAVIGATION ==========
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(btn.dataset.page).classList.add("active");
  });
});

// ========== RENDER ==========
function renderAll() {
  renderJadwalMapel();
  renderJadwalPiket();
  renderTugas();
  renderNotifikasi();
  renderAbsensi();
  if (isAdmin) renderAdminTugas();
}

function renderJadwalMapel() {
  const container = document.getElementById("jadwal-mapel-container");
  container.innerHTML = "";
  for (const [hari, mapel] of Object.entries(JADWAL_MAPEL)) {
    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `
      <div class="day-header">${hari.toUpperCase()}</div>
      <div class="day-body">
        ${mapel.map((m) => `<div class="mapel-item">${m}</div>`).join("")}
      </div>
    `;
    container.appendChild(card);
  }
}

function renderJadwalPiket() {
  const container = document.getElementById("jadwal-piket-container");
  container.innerHTML = "";
  for (const [hari, names] of Object.entries(JADWAL_PIKET)) {
    const card = document.createElement("div");
    card.className = "piket-card";
    card.innerHTML = `
      <div class="piket-header">${hari.toUpperCase()}</div>
      <div class="piket-body">
        ${names.map((n) => `<div class="piket-name">${n}</div>`).join("")}
      </div>
    `;
    container.appendChild(card);
  }
}

function renderTugas() {
  const list = document.getElementById("tugas-list");
  const tugas = getTugas().sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (tugas.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📭</div>
        <p>Belum ada tugas. Santai dulu!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = tugas
    .map(
      (t) => `
    <div class="tugas-card">
      <h3>${t.judul}</h3>
      <div class="tugas-meta">
        <span>📚 ${t.mapel}</span>
        <span>📅 Deadline: ${formatDate(t.deadline)}</span>
      </div>
      <p>${t.deskripsi || "Tidak ada deskripsi"}</p>
    </div>
  `
    )
    .join("");
}

function renderNotifikasi() {
  const list = document.getElementById("notif-list");
  const tugas = getTugas().slice(0, 5);
  const pengumuman = getPengumuman().slice(0, 3);

  let html = "";

  pengumuman.forEach((p) => {
    html += `
      <div class="notif-item" style="border-left-color: #fdcb6e;">
        <div class="notif-content">
          <h4>📢 ${p.text.substring(0, 50)}${p.text.length > 50 ? "..." : ""}</h4>
          <p>Pengumuman</p>
        </div>
        <div class="notif-date">${formatDate(p.date)}</div>
      </div>
    `;
  });

  tugas.forEach((t) => {
    html += `
      <div class="notif-item">
        <div class="notif-content">
          <h4>${t.judul}</h4>
          <p>${t.mapel} • Deadline ${formatDate(t.deadline)}</p>
        </div>
        <div class="notif-date">${formatDate(t.created)}</div>
      </div>
    `;
  });

  if (!html) {
    html = `<div class="empty-state" style="padding:20px;"><p>Tidak ada notifikasi</p></div>`;
  }

  list.innerHTML = html;
}

function renderAbsensi() {
  const date = document.getElementById("absensi-date").value || getToday();
  const data = getAbsensi(date);
  const tbody = document.getElementById("absensi-body");

  tbody.innerHTML = DAFTAR_SISWA.map((nama, i) => {
    const status = data[nama] || "Hadir";
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${nama}</td>
        <td>
          ${
            isAdmin
              ? `<select class="status-select" data-nama="${nama}">
                  <option value="Hadir" ${status === "Hadir" ? "selected" : ""}>Hadir</option>
                  <option value="Izin" ${status === "Izin" ? "selected" : ""}>Izin</option>
                  <option value="Sakit" ${status === "Sakit" ? "selected" : ""}>Sakit</option>
                  <option value="Alpha" ${status === "Alpha" ? "selected" : ""}>Alpha</option>
                </select>`
              : `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`
          }
        </td>
        <td class="admin-only ${isAdmin ? "" : "hidden"}">
          ${isAdmin ? `<button class="btn-danger btn-save-absensi" data-nama="${nama}">Simpan</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");

  // Summary
  const counts = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
  DAFTAR_SISWA.forEach((n) => {
    counts[data[n] || "Hadir"]++;
  });
  document.getElementById("absensi-summary").innerHTML = `
    <span>✅ Hadir: ${counts.Hadir}</span>
    <span>📝 Izin: ${counts.Izin}</span>
    <span>🤒 Sakit: ${counts.Sakit}</span>
    <span>❌ Alpha: ${counts.Alpha}</span>
  `;

  // Event listeners for admin
  if (isAdmin) {
    document.querySelectorAll(".status-select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const nama = e.target.dataset.nama;
        const abs = getAbsensi(date);
        abs[nama] = e.target.value;
        saveAbsensi(date, abs);
        renderAbsensi();
        showToast(`Status ${nama} diubah menjadi ${e.target.value}`);
      });
    });
  }
}

document.getElementById("load-absensi").addEventListener("click", renderAbsensi);
document.getElementById("absensi-date").addEventListener("change", renderAbsensi);

// ========== ADMIN FUNCTIONS ==========
document.getElementById("add-tugas-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = document.getElementById("tugas-judul").value.trim();
  const mapel = document.getElementById("tugas-mapel").value.trim();
  const deadline = document.getElementById("tugas-deadline").value;
  const deskripsi = document.getElementById("tugas-deskripsi").value.trim();

  const tugas = getTugas();
  const newTugas = {
    id: Date.now(),
    judul,
    mapel,
    deadline,
    deskripsi,
    created: getToday()
  };
  tugas.unshift(newTugas);
  saveTugas(tugas);

  // Reset form
  e.target.reset();

  renderTugas();
  renderNotifikasi();
  if (isAdmin) renderAdminTugas();

  // Browser notification
  sendNotification("📝 Tugas Baru!", `${judul} (${mapel}) - Deadline: ${formatDate(deadline)}`);
  showToast("✅ Tugas berhasil ditambahkan & notifikasi dikirim!");
});

document.getElementById("pengumuman-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("pengumuman-text").value.trim();
  const list = getPengumuman();
  list.unshift({ text, date: getToday() });
  savePengumuman(list);
  e.target.reset();
  renderNotifikasi();
  sendNotification("📢 Pengumuman Baru", text.substring(0, 80));
  showToast("✅ Pengumuman berhasil dikirim!");
});

function renderAdminTugas() {
  const list = document.getElementById("admin-tugas-list");
  const tugas = getTugas();
  if (tugas.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted);font-size:14px;">Belum ada tugas</p>`;
    return;
  }
  list.innerHTML = tugas
    .map(
      (t) => `
    <div class="admin-tugas-item">
      <span>${t.judul} (${t.mapel})</span>
      <button class="btn-danger" onclick="hapusTugas(${t.id})">Hapus</button>
    </div>
  `
    )
    .join("");
}

window.hapusTugas = function (id) {
  let tugas = getTugas();
  tugas = tugas.filter((t) => t.id !== id);
  saveTugas(tugas);
  renderTugas();
  renderNotifikasi();
  renderAdminTugas();
  showToast("🗑️ Tugas dihapus");
};

// ========== NOTIFICATIONS ==========
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>"
    });
  }
}

// Initial check if already logged in (optional - for refresh)
// We keep it simple: always show login on load
