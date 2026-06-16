// ══════════════════════════════════════════════
//  AUTH GUARD — Cek token, redirect jika tidak ada
// ══════════════════════════════════════════════
const myToken = localStorage.getItem('token_toko');
if (!myToken) {
    window.location.href = 'login.html';
}

// Tampilkan username di avatar
const storedUsername = localStorage.getItem('username_toko') || 'Admin';
document.getElementById('avatar-username').textContent = storedUsername;
// Set inisial avatar
document.getElementById('avatar-btn').textContent = storedUsername.charAt(0).toUpperCase();

// ══════════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════════
function confirmLogout() {
    closeAvatarDropdown();
    document.getElementById('logout-modal').classList.add('open');
}
function closeLogoutModal() {
    document.getElementById('logout-modal').classList.remove('open');
}
function doLogout() {
    localStorage.removeItem('token_toko');
    localStorage.removeItem('username_toko');
    window.location.href = 'login.html';
}
// Klik backdrop tutup modal
document.getElementById('logout-modal').addEventListener('click', function(e) {
    if (e.target === this) closeLogoutModal();
});

// ══════════════════════════════════════════════
//  AVATAR DROPDOWN
// ══════════════════════════════════════════════
function toggleAvatarDropdown() {
    document.getElementById('avatar-dropdown').classList.toggle('open');
}
function closeAvatarDropdown() {
    document.getElementById('avatar-dropdown').classList.remove('open');
}

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentSort = { key: 'id', dir: 'asc' };
let currentPage2 = 1;
let currentView = 'tambah';
let sidebarCollapsed = false;
let notifications = [
    { id: 1, text: 'Barang baru berhasil ditambahkan', time: '1 menit lalu', read: false },
    { id: 2, text: 'Data Logitech diperbarui', time: '5 menit lalu', read: false },
    { id: 3, text: 'Selamat datang di ListKu!', time: 'Hari ini', read: true },
];

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function () {
    checkMobile();
    renderNotif();
    loadData();

    const form = document.getElementById("form-tambah");
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const idBarang    = document.getElementById("input-id").value;
        const namaBarang  = document.getElementById("input-nama").value;
        const hargaBarang = document.getElementById("input-harga").value;

        let urlApi     = "http://localhost/Platform/api-toko/tambah_barang.php";
        let httpMethod = "POST";
        if (idBarang !== "") {
            urlApi     = "http://localhost/Platform/api-toko/edit_barang.php";
            httpMethod = "PUT";
        }

        try {
            let response;
           if (httpMethod === "POST") {

                const fileGambar = document.getElementById("input-gambar").files[0];

                const formData = new FormData();
                formData.append("nama_barang", namaBarang);
                formData.append("harga", hargaBarang);

                if (fileGambar) {
                    formData.append("gambar", fileGambar);
                }

                response = await fetch(urlApi, {
                    method: "POST",
                    headers: {
                        "Authorization": myToken
                    },
                    body: formData
                });
            } else {

    const fileGambar =
        document.getElementById("input-gambar").files[0];

    const formData = new FormData();
    formData.append("id", idBarang);
    formData.append("nama_barang", namaBarang);
    formData.append("harga", hargaBarang);

    if (fileGambar) {
        formData.append("gambar", fileGambar);
    }

    response = await fetch(urlApi, {
        method: "POST",
        headers: {
            "Authorization": myToken
        },
        body: formData
    });
}

            const hasil = JSON.parse(await response.text());
            if (hasil.status === "success") {
                showToast("✅ " + hasil.pesan, "success");
                addNotif(httpMethod === "POST" ? `Barang "${namaBarang}" ditambahkan` : `Barang "${namaBarang}" diperbarui`);
                resetFormKeTambah();
                loadData();
            } else {
                showToast("❌ " + (hasil.pesan || hasil.message), "error");
            }
        } catch (err) {
            showToast("❌ Gagal terhubung ke server.", "error");
        }
    });

    // Topbar search input live filter
    document.getElementById('topbar-search-input').addEventListener('input', function() {
        filterTabel(this.value);
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function(e) {
        const nd = document.getElementById('notif-dropdown');
        const nb = document.getElementById('notif-btn');
        if (!nd.contains(e.target) && !nb.contains(e.target)) {
            nd.classList.remove('open');
        }
        const sw = document.getElementById('search-wrap');
        const si = document.getElementById('topbar-search-input');
        if (!sw.contains(e.target) && si.value === '') {
            sw.classList.remove('open');
        }
        // Close avatar dropdown
        const ad = document.getElementById('avatar-dropdown');
        const aw = document.getElementById('avatar-wrap');
        if (ad && aw && !aw.contains(e.target)) {
            ad.classList.remove('open');
        }
    });

    window.addEventListener('resize', checkMobile);
});

// ══════════════════════════════════════════════
//  MOBILE CHECK
// ══════════════════════════════════════════════
function checkMobile() {
    const isMobile = window.innerWidth <= 768;
    document.getElementById('hamburger-btn').style.display = isMobile ? 'flex' : 'none';
    document.getElementById('fab-btn').style.display = isMobile && currentView === 'daftar' ? 'flex' : 'none';
}

// ══════════════════════════════════════════════
//  SIDEBAR TOGGLE (desktop)
// ══════════════════════════════════════════════
function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const icon = document.getElementById('toggle-icon');
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        body.classList.add('sidebar-collapsed');
        icon.className = 'fa-solid fa-chevron-right';
    } else {
        sidebar.classList.remove('collapsed');
        body.classList.remove('sidebar-collapsed');
        icon.className = 'fa-solid fa-chevron-left';
    }
}

function openMobileSidebar() {
    document.getElementById('sidebar').classList.add('mobile-open');
    const overlay = document.getElementById('sidebar-overlay');
    overlay.style.display = 'block';
    setTimeout(() => overlay.classList.add('visible'), 10);
}
function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    const overlay = document.getElementById('sidebar-overlay');
    overlay.classList.remove('visible');
    setTimeout(() => overlay.style.display = 'none', 280);
}

// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════
function navigateTo(page, e) {
    if (e) e.preventDefault();
    currentView = page;
    closeMobileSidebar();

    // Update nav active
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-' + page).classList.add('active');
    document.getElementById('mnav-' + page).classList.add('active');

    // Show/hide page views
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    // Page title
    const titles = { daftar: 'Daftar Barang', tambah: 'Tambah Barang' };
    document.getElementById('page-title').textContent = titles[page];

    // FAB on mobile
    const fab = document.getElementById('fab-btn');
    if (window.innerWidth <= 768 && page === 'daftar') {
        fab.style.display = 'flex';
    } else {
        fab.style.display = 'none';
    }

    // Re-render table for daftar page
    if (page === 'daftar') renderTabel();
}

// ══════════════════════════════════════════════
//  SEARCH TOGGLE
// ══════════════════════════════════════════════
function toggleSearch() {
    const wrap = document.getElementById('search-wrap');
    const input = document.getElementById('topbar-search-input');
    if (wrap.classList.toggle('open')) {
        setTimeout(() => input.focus(), 320);
    } else {
        input.value = '';
        filterTabel('');
    }
}

// ══════════════════════════════════════════════
//  NOTIFICATION
// ══════════════════════════════════════════════
function toggleNotif() {
    document.getElementById('notif-dropdown').classList.toggle('open');
}
function renderNotif() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    badge.style.display = unread > 0 ? 'block' : 'none';
    const list = document.getElementById('notif-list');
    if (notifications.length === 0) {
        list.innerHTML = '<div class="notif-empty"><i class="fa-regular fa-bell-slash"></i><br>Tidak ada notifikasi</div>';
        return;
    }
    list.innerHTML = notifications.map(n => `
        <div class="notif-item" onclick="markRead(${n.id})">
            <div class="notif-dot ${n.read ? 'read' : ''}"></div>
            <div>
                <div class="notif-text">${n.text}</div>
                <div class="notif-time">${n.time}</div>
            </div>
        </div>
    `).join('');
}
function markRead(id) {
    const n = notifications.find(x => x.id === id);
    if (n) n.read = true;
    renderNotif();
}
function clearNotif() {
    notifications = [];
    renderNotif();
}
function addNotif(text) {
    notifications.unshift({ id: Date.now(), text, time: 'Baru saja', read: false });
    renderNotif();
}

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════
function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:${type === 'success' ? '#22c55e' : '#ef4444'};color:white;padding:10px 22px;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;transition:opacity .3s;`;
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.style.opacity = '0', 3000);
}

// ══════════════════════════════════════════════
//  LOAD DATA
// ══════════════════════════════════════════════
async function loadData() {
    try {
        const response = await fetch("http://localhost/Platform/api-toko/get_barang.php");
        if (!response.ok) throw new Error("HTTP " + response.status);
        const hasil = JSON.parse(await response.text());
        if (hasil.status === "success") {
            allData = hasil.data;
        } else {
            allData = [];
        }
    } catch (err) {
        console.error("LOAD ERROR:", err);
        allData = [];
    }
    filteredData = [...allData];
    sortData();
    currentPage = 1;
    currentPage2 = 1;
    renderTabel();
}

// ══════════════════════════════════════════════
//  SORT
// ══════════════════════════════════════════════
function sortBy(key) {
    if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.key = key;
        currentSort.dir = 'asc';
    }
    sortData();
    renderTabel();
}
function sortData() {
    const { key, dir } = currentSort;
    filteredData.sort((a, b) => {
        let va = key === 'harga' ? Number(a[key]) : String(a[key]).toLowerCase();
        let vb = key === 'harga' ? Number(b[key]) : String(b[key]).toLowerCase();
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    // Update sort icons
    document.querySelectorAll('thead th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    const thMap = { nama_barang: 'th-nama', harga: 'th-harga' };
    if (thMap[currentSort.key]) {
        const th = document.getElementById(thMap[currentSort.key]);
        if (th) th.classList.add('sort-' + currentSort.dir);
    }
}

// ══════════════════════════════════════════════
//  FILTER
// ══════════════════════════════════════════════
function filterTabel(q) {
    const query = q.toLowerCase().trim();
    filteredData = allData.filter(b =>
        b.nama_barang.toLowerCase().includes(query) ||
        String(b.harga).includes(query)
    );
    sortData();
    currentPage = 1;
    currentPage2 = 1;
    renderTabel();
    // sync filter inputs
    document.getElementById('filter-tambah').value = q;
    document.getElementById('filter-daftar').value = q;
    document.getElementById('topbar-search-input').value = q;
}

// ══════════════════════════════════════════════
//  RENDER TABEL
// ══════════════════════════════════════════════
function buildRows(data, startIdx) {
    if (data.length === 0) {
        return `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Tidak ada data</p></div></td></tr>`;
    }
    return data.map((barang, i) => {

    const urlGambar = barang.gambar
        ? `http://localhost/Platform/api-toko/uploads/${barang.gambar}`
        : `https://via.placeholder.com/50?text=No+Img`;

    return `
        <tr data-id="${barang.id}">
            <td class="td-no">${startIdx + i + 1}</td>

            <td>
                <img
                    src="${urlGambar}"
                    width="50"
                    height="50"
                    style="object-fit:cover;border-radius:8px;">
            </td>

            <td class="td-nama">
                ${barang.nama_barang}
            </td>

            <td class="td-harga">
                Rp ${Number(barang.harga).toLocaleString('id-ID')}
            </td>

            <td>
                <div class="actions-cell">
                    <button class="row-action"
                        onclick="editBarang(${barang.id}, '${String(barang.nama_barang).replace(/'/g,"\\'")}', ${barang.harga})">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="row-action delete"
                        onclick="hapusBarang(${barang.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}).join('');
}

let editingId = null;

function renderTabel() {
    // Page Tambah
    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filteredData.slice(start, start + rowsPerPage);

    document.getElementById('tabel-barang').innerHTML = buildRows(pageData, start);
    document.getElementById('pagination-info').textContent =
        total > 0 ? `Menampilkan ${start+1}–${Math.min(start+rowsPerPage,total)} dari ${total} data` : '';
    renderPaginationBtns('pagination-btns', totalPages, currentPage, (p) => { currentPage = p; renderTabel(); });

    // Page Daftar
    const total2 = filteredData.length;
    const totalPages2 = Math.max(1, Math.ceil(total2 / rowsPerPage));
    if (currentPage2 > totalPages2) currentPage2 = totalPages2;
    const start2 = (currentPage2 - 1) * rowsPerPage;
    const pageData2 = filteredData.slice(start2, start2 + rowsPerPage);

    document.getElementById('tabel-barang-daftar').innerHTML = buildRows(pageData2, start2);
    document.getElementById('pagination-info-daftar').textContent =
        total2 > 0 ? `Menampilkan ${start2+1}–${Math.min(start2+rowsPerPage,total2)} dari ${total2} data` : '';
    renderPaginationBtns('pagination-btns-daftar', totalPages2, currentPage2, (p) => { currentPage2 = p; renderTabel(); });
}

function renderPaginationBtns(containerId, totalPages, page, cb) {
    const c = document.getElementById(containerId);
    if (totalPages <= 1) { c.innerHTML = ''; return; }
    let html = `<button class="page-btn" ${page===1?'disabled':''} onclick="(${cb.toString()})(${page-1})">
        <i class="fa-solid fa-chevron-left" style="font-size:10px"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
            if (i === 3 || i === totalPages - 2) html += `<span class="page-btn" style="cursor:default;border:none">…</span>`;
            continue;
        }
        html += `<button class="page-btn ${i===page?'active':''}" onclick="(${cb.toString()})(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${page===totalPages?'disabled':''} onclick="(${cb.toString()})(${page+1})">
        <i class="fa-solid fa-chevron-right" style="font-size:10px"></i></button>`;
    c.innerHTML = html;
}

// ══════════════════════════════════════════════
//  EDIT
// ══════════════════════════════════════════════
function editBarang(id, nama, harga) {
    editingId = id;
    navigateTo('tambah', null);

    document.getElementById("input-id").value    = id;
    document.getElementById("input-nama").value  = nama;
    document.getElementById("input-harga").value = harga;

    document.getElementById("form-card").classList.add("mode-edit");
    document.getElementById("form-icon").className = "fa-solid fa-pen-to-square";
    document.getElementById("form-title-text").textContent = `Edit Barang (ID: ${id})`;

    const btnSimpan = document.getElementById("btn-simpan");
    btnSimpan.classList.add("mode-edit");
    document.getElementById("btn-icon").className   = "fa-solid fa-rotate-right";
    document.getElementById("btn-text").textContent = "Update Data";
    document.getElementById("btn-batal").style.display = "inline-flex";

    renderTabel();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function batalEdit() { resetFormKeTambah(); }

function resetFormKeTambah() {
    editingId = null;
    document.getElementById("input-id").value = "";
    document.getElementById("form-tambah").reset();
    document.getElementById("form-card").classList.remove("mode-edit");
    document.getElementById("form-icon").className = "fa-solid fa-plus";
    document.getElementById("form-title-text").textContent = "Tambah Barang Baru";
    const btnSimpan = document.getElementById("btn-simpan");
    btnSimpan.classList.remove("mode-edit");
    document.getElementById("btn-icon").className   = "fa-solid fa-floppy-disk";
    document.getElementById("btn-text").textContent = "Simpan";
    document.getElementById("btn-batal").style.display = "none";
    renderTabel();
}

// ══════════════════════════════════════════════
//  HAPUS
// ══════════════════════════════════════════════
async function hapusBarang(id_target) {
    if (!confirm(`🗑️ Yakin ingin menghapus data ID ${id_target}?`)) return;
    try {
        const formData = new FormData();
        formData.append("id", id_target);
        const response = await fetch("http://localhost/Platform/api-toko/hapus_barang.php", {
            method: "POST", headers: { "Authorization": myToken }, body: formData
        });
        const hasil = JSON.parse(await response.text());
        if (hasil.status === "success") {
            showToast("🗑️ Data berhasil dihapus", "success");
            addNotif(`Barang ID ${id_target} dihapus`);
            loadData();
        } else {
            showToast("❌ " + hasil.pesan, "error");
        }
    } catch (error) {
        showToast("❌ Gagal terhubung ke server.", "error");
    }
}