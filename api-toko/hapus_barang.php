<?php
include "koneksi.php";

// =================== VALIDASI TOKEN ===================
$headers = apache_request_headers();
$token_dikirim = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if ($token_dikirim === '') {
    die(json_encode(["status" => "error", "pesan" => "Akses Ditolak! Token tidak ditemukan."]));
}

$cek_token = mysqli_query($koneksi, "SELECT * FROM users WHERE token='$token_dikirim'");
if (mysqli_num_rows($cek_token) === 0) {
    die(json_encode(["status" => "error", "pesan" => "Akses Ditolak! Token tidak valid."]));
}
// ======================================================

$id_barang = $_POST['id'] ?? null;

if (!$id_barang) {
    echo json_encode(["status" => "error", "pesan" => "ID Barang wajib dikirim!"]);
    exit;
}

$id_barang = mysqli_real_escape_string($koneksi, $id_barang);

$query = "DELETE FROM barang WHERE id='$id_barang'";

if (mysqli_query($koneksi, $query)) {
    echo json_encode(["status" => "success", "pesan" => "Data barang berhasil dihapus!"]);
} else {
    echo json_encode(["status" => "error", "pesan" => "Gagal menghapus data dari database."]);
}
?>