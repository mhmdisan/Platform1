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

// Ambil data POST
$nama  = $_POST['nama_barang'] ?? '';
$harga = $_POST['harga'] ?? '';

if ($nama == '' || $harga == '') {
    echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]);
    exit;
}

$nama  = mysqli_real_escape_string($koneksi, $nama);
$harga = mysqli_real_escape_string($koneksi, $harga);

$query = "INSERT INTO barang (nama_barang, harga) VALUES ('$nama', '$harga')";

if (mysqli_query($koneksi, $query)) {
    echo json_encode(["status" => "success", "pesan" => "Data barang berhasil ditambahkan!"]);
} else {
    echo json_encode(["status" => "error", "pesan" => "Gagal menyimpan ke database."]);
}
?>