<?php
include "koneksi.php";

// Ambil dari POST
$id_barang = $_POST['id'] ?? null;

// Validasi
if (!$id_barang) {
    echo json_encode([
        "status" => "error",
        "pesan" => "ID Barang wajib dikirim!"
    ]);
    exit;
}

// Amankan
$id_barang = mysqli_real_escape_string($koneksi, $id_barang);

// Query hapus
$query = "DELETE FROM barang WHERE id = '$id_barang'";

if(mysqli_query($koneksi, $query)) {
    echo json_encode([
        "status" => "success",
        "pesan" => "Data barang terhapus!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "pesan" => "Gagal menghapus data dari database"
    ]);
}
?>