document.addEventListener("DOMContentLoaded", function () {

    console.log("🔥 APP JS LOADED");

    loadData();

    const form = document.getElementById("form-tambah");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nama = document.getElementById("input-nama").value;
        const harga = document.getElementById("input-harga").value;

        console.log("KIRIM:", nama, harga);

        const formData = new FormData();
        formData.append("nama_barang", nama);
        formData.append("harga", harga);

        try {
            const response = await fetch("http://localhost/Platform/api-toko/tambah_barang.php", {
                method: "POST",
                body: formData
            });

            const text = await response.text();
            console.log("RAW RESPONSE:", text);

            const hasil = JSON.parse(text);

            if (hasil.status === "success") {
                alert("✅ Berhasil tambah data");
                form.reset();
                loadData();
            } else {
                alert("❌ " + hasil.message);
            }

        } catch (err) {
            console.error("ERROR:", err);
        }
    });
});


// ==========================
// GET DATA
// ==========================
async function loadData() {
    try {
        const response = await fetch("http://localhost/Platform/api-toko/get_barang.php");

        if (!response.ok) {
            throw new Error("HTTP ERROR " + response.status);
        }

        const text = await response.text();
        console.log("RAW:", text);

        const hasil = JSON.parse(text);

        let html = "";

        if (hasil.status === "success") {
            hasil.data.forEach(barang => {
                html += `
                <tr>
                    <td>${barang.id}</td>
                    <td>${barang.nama_barang}</td>
                    <td>Rp ${barang.harga}</td>
                    <td>
                        <button onclick="hapusBarang(${barang.id})"
                            style="
                                width:32px;
                                height:32px;
                                background:#ef4444;
                                color:white;
                                border:none;
                                border-radius:50%;
                                cursor:pointer;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                box-shadow:0 2px 6px rgba(0,0,0,0.2);
                                transition:0.2s;
                            "
                            onmouseover="this.style.background='#dc2626'"
                            onmouseout="this.style.background='#ef4444'"
                        >
                            <i class="fa-solid fa-minus"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
        }

        document.getElementById("tabel-barang").innerHTML = html;

        // 🔥 WAJIB untuk render icon
        feather.replace();

    } catch (err) {
        console.error("LOAD ERROR:", err);
    }
}


// ==========================
// HAPUS DATA
// ==========================
async function hapusBarang(id_target) {

    const yakin = confirm(`🗑️ Yakin ingin menghapus data ID ${id_target}?`);

    if (yakin) {
        try {
            // ✅ pakai POST biar aman di PHP
            const formData = new FormData();
            formData.append("id", id_target);

            const response = await fetch('http://localhost/Platform/api-toko/hapus_barang.php', {
                method: 'POST',
                body: formData
            });

            const text = await response.text();
            console.log("RAW DELETE:", text);

            const hasil = JSON.parse(text);

            if (hasil.status === 'success') {
                alert("🗑️ Data berhasil dihapus");
                loadData();
            } else {
                alert('❌ ' + hasil.pesan);
            }

        } catch (error) {
            console.error('ERROR DELETE:', error);
            alert('❌ Gagal terhubung ke server.');
        }
    }
}