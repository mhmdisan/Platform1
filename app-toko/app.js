document.addEventListener("DOMContentLoaded", function () {

    console.log("🔥 APP JS LOADED");

    loadData();

    const form = document.getElementById("form-tambah");

    // ══════════════════════════════════════════════════════
    //  SUBMIT FORM — PERCABANGAN LOGIKA (The Magic)
    //
    //  Jika input-id KOSONG  → POST ke tambah_barang.php
    //  Jika input-id BERISI  → PUT  ke edit_barang.php
    // ══════════════════════════════════════════════════════
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Ambil semua isian, termasuk ID rahasia dari kantong hidden
        const idBarang   = document.getElementById("input-id").value;
        const namaBarang = document.getElementById("input-nama").value;
        const hargaBarang = document.getElementById("input-harga").value;

        console.log("ID:", idBarang, "| NAMA:", namaBarang, "| HARGA:", hargaBarang);

        // Tentukan URL dan method berdasarkan isi kantong rahasia
        let urlApi     = "http://localhost/Platform/api-toko/tambah_barang.php";
        let httpMethod = "POST";

        if (idBarang !== "") {
            // Kantong berisi ID → mode Update
            urlApi     = "http://localhost/Platform/api-toko/edit_barang.php";
            httpMethod = "PUT";
        }

        try {
            let response;

            if (httpMethod === "POST") {
                // ── CREATE: kirim sebagai FormData ──
                const formData = new FormData();
                formData.append("nama_barang", namaBarang);
                formData.append("harga", hargaBarang);

                response = await fetch(urlApi, {
                    method: "POST",
                    body: formData
                });

            } else {
                // ── UPDATE: kirim sebagai JSON (sesuai edit_barang.php dosen) ──
                const dataKirim = {
                    id:          idBarang,
                    nama_barang: namaBarang,
                    harga:       hargaBarang
                };

                response = await fetch(urlApi, {
                    method:  "PUT",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(dataKirim)
                });
            }

            const text = await response.text();
            console.log("RAW RESPONSE:", text);

            const hasil = JSON.parse(text);

            if (hasil.status === "success") {
                alert("✅ " + hasil.pesan);
                resetFormKeTambah();   // kembalikan form ke mode Tambah
                loadData();            // refresh tabel
            } else {
                alert("❌ " + (hasil.pesan || hasil.message));
            }

        } catch (err) {
            console.error("ERROR SUBMIT:", err);
            alert("❌ Gagal terhubung ke server.");
        }
    });
});


// ══════════════════════════════════════════════════════
//  GET DATA (READ)
// ══════════════════════════════════════════════════════
async function loadData() {
    try {
        const response = await fetch("http://localhost/Platform/api-toko/get_barang.php");

        if (!response.ok) {
            throw new Error("HTTP ERROR " + response.status);
        }

        const text  = await response.text();
        console.log("RAW GET:", text);

        const hasil = JSON.parse(text);
        let html    = "";

        if (hasil.status === "success") {
            hasil.data.forEach(barang => {
                html += `
                <tr data-id="${barang.id}">
                    <td>${barang.id}</td>
                    <td>${barang.nama_barang}</td>
                    <td>Rp ${Number(barang.harga).toLocaleString('id-ID')}</td>
                    <td>
                        <div class="actions-cell">

                            <!--
                                Tombol Edit: kirim 3 parameter sekaligus.
                                Parameter string (nama) diapit tanda kutip tunggal '...'
                                agar tidak bentrok dengan tanda kutip atribut HTML.
                            -->
                            <button class="row-action"
                                    title="Edit"
                                    onclick="editBarang(${barang.id}, '${String(barang.nama_barang).replace(/'/g, "\\'")}', ${barang.harga})">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button class="row-action delete"
                                    title="Hapus"
                                    onclick="hapusBarang(${barang.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>
                    </td>
                </tr>
                `;
            });
        }

        document.getElementById("tabel-barang").innerHTML = html;
        feather.replace();

    } catch (err) {
        console.error("LOAD ERROR:", err);
    }
}


// ══════════════════════════════════════════════════════
//  editBarang(id, nama, harga)
//
//  Dipanggil dari tombol Edit di tabel dengan 3 parameter.
//  Tugasnya: isi kantong rahasia + tarik data ke form +
//  ubah visual tombol & judul agar user tahu sedang Edit.
// ══════════════════════════════════════════════════════
function editBarang(id, nama, harga) {

    // 1. Isi kantong rahasia dengan ID barang
    document.getElementById("input-id").value    = id;

    // 2. Tarik nama dan harga ke kotak input yang terlihat
    document.getElementById("input-nama").value  = nama;
    document.getElementById("input-harga").value = harga;

    // 3. Ubah visual form-card → mode Edit
    document.getElementById("form-card").classList.add("mode-edit");

    // 4. Ubah ikon dan judul form
    document.getElementById("form-icon").className       = "fa-solid fa-pen-to-square";
    document.getElementById("form-title-text").textContent = `Edit Barang  (ID: ${id})`;

    // 5. Ubah tombol Simpan → "Update Data" warna amber/kuning
    const btnSimpan = document.getElementById("btn-simpan");
    btnSimpan.classList.add("mode-edit");
    document.getElementById("btn-icon").className   = "fa-solid fa-rotate-right";
    document.getElementById("btn-text").textContent = "Update Data";

    // 6. Tampilkan tombol Batal
    document.getElementById("btn-batal").style.display = "inline-flex";

    // 7. Sorot baris yang sedang diedit di tabel
    document.querySelectorAll("#tabel-barang tr").forEach(tr => {
        tr.classList.toggle("row-editing", tr.dataset.id == id);
    });

    // 8. Gulir layar ke atas secara halus
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ══════════════════════════════════════════════════════
//  batalEdit()
//  Kembalikan form sepenuhnya ke mode Tambah
// ══════════════════════════════════════════════════════
function batalEdit() {
    resetFormKeTambah();
}


// ══════════════════════════════════════════════════════
//  resetFormKeTambah()  — helper internal
//  Dipakai oleh batalEdit() dan setelah submit sukses
// ══════════════════════════════════════════════════════
function resetFormKeTambah() {

    // Kosongkan kantong rahasia
    document.getElementById("input-id").value = "";
    document.getElementById("form-tambah").reset();

    // Kembalikan form-card ke mode Tambah
    document.getElementById("form-card").classList.remove("mode-edit");

    // Kembalikan ikon & judul
    document.getElementById("form-icon").className        = "fa-solid fa-plus";
    document.getElementById("form-title-text").textContent = "Tambah Barang Baru";

    // Kembalikan tombol Simpan ke biru
    const btnSimpan = document.getElementById("btn-simpan");
    btnSimpan.classList.remove("mode-edit");
    document.getElementById("btn-icon").className   = "fa-solid fa-floppy-disk";
    document.getElementById("btn-text").textContent = "Simpan";

    // Sembunyikan tombol Batal
    document.getElementById("btn-batal").style.display = "none";

    // Hilangkan sorotan baris di tabel
    document.querySelectorAll("#tabel-barang tr.row-editing")
            .forEach(tr => tr.classList.remove("row-editing"));
}


// ══════════════════════════════════════════════════════
//  HAPUS DATA (DELETE)
// ══════════════════════════════════════════════════════
async function hapusBarang(id_target) {

    const yakin = confirm(`🗑️ Yakin ingin menghapus data ID ${id_target}?`);

    if (yakin) {
        try {
            const formData = new FormData();
            formData.append("id", id_target);

            const response = await fetch("http://localhost/Platform/api-toko/hapus_barang.php", {
                method: "POST",
                body: formData
            });

            const text  = await response.text();
            console.log("RAW DELETE:", text);

            const hasil = JSON.parse(text);

            if (hasil.status === "success") {
                alert("🗑️ Data berhasil dihapus");
                loadData();
            } else {
                alert("❌ " + hasil.pesan);
            }

        } catch (error) {
            console.error("ERROR DELETE:", error);
            alert("❌ Gagal terhubung ke server.");
        }
    }
}