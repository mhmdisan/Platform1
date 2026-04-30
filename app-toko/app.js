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

            const hasil = await response.json();
            console.log("RESPON:", hasil);

            if (hasil.status === "success") {
                alert("Berhasil tambah data");
                form.reset();

                // refresh table tanpa reload
                loadData();
            } else {
                alert(hasil.message);
            }

        } catch (err) {
            console.error("ERROR:", err);
        }
    });
});


// GET DATA TABLE
async function loadData() {
    try {
        const response = await fetch("http://localhost/Platform/api-toko/get_barang.php");
        const hasil = await response.json();

        let html = "";

        if (hasil.status === "success") {
            hasil.data.forEach((barang, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${barang.nama_barang}</td>
                        <td>${barang.harga}</td>
                    </tr>
                `;
            });
        }

        document.getElementById("tabel-barang").innerHTML = html;

    } catch (err) {
        console.error(err);
    }
}