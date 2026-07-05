<?php
// WAJIB: supaya tidak kena CORS & terbaca sebagai JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 1. Koneksi database
include "koneksi.php";

if (!$koneksi) {
    echo json_encode([
        "status"  => "error",
        "pesan"   => "Koneksi database gagal"
    ]);
    exit;
}

// =================== VALIDASI TOKEN ===================
// Endpoint ini dipanggil dari tab baru (cetak.html), tapi karena
// same-origin, tab tersebut tetap bisa membaca token dari localStorage
// dan mengirimkannya lewat header Authorization seperti endpoint lain.
function getTokenFromHeader() {
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                return trim($value);
            }
        }
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    }
    return '';
}

$token_dikirim = getTokenFromHeader();

if ($token_dikirim === '') {
    die(json_encode(["status" => "error", "pesan" => "Akses Ditolak! Token tidak ditemukan."]));
}

$cek_token = mysqli_query($koneksi, "SELECT * FROM users WHERE token='" . mysqli_real_escape_string($koneksi, $token_dikirim) . "'");
if (!$cek_token || mysqli_num_rows($cek_token) === 0) {
    die(json_encode(["status" => "error", "pesan" => "Akses Ditolak! Token tidak valid."]));
}
$userRow = mysqli_fetch_assoc($cek_token);
// ======================================================

// 2. Ambil SEMUA data barang, TANPA LIMIT/OFFSET
//    (khusus laporan cetak, data tidak boleh terpotong pagination)
$hasil = mysqli_query($koneksi, "SELECT * FROM barang ORDER BY id ASC");

if (!$hasil) {
    echo json_encode([
        "status" => "error",
        "pesan"  => "Query gagal: " . mysqli_error($koneksi)
    ]);
    exit;
}

$data_barang  = [];
$total_nilai  = 0;
while ($baris = mysqli_fetch_assoc($hasil)) {
    $data_barang[] = $baris;
    $total_nilai  += (float) $baris['harga'];
}

// 3. Response JSON untuk dirender di cetak.html
$response = [
    "status"        => "success",
    "pesan"         => "Data laporan berhasil diambil",
    "dicetak_oleh"  => $userRow['username'] ?? '-',
    "tanggal_cetak" => date('Y-m-d H:i:s'),
    "total_barang"  => count($data_barang),
    "total_nilai"   => $total_nilai,
    "data"          => $data_barang
];

echo json_encode($response);
