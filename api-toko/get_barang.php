<?php
// WAJIB: supaya tidak kena CORS & terbaca sebagai JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 1. Koneksi database
include "koneksi.php";

// Cek koneksi
if (!$koneksi) {
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi database gagal"
    ]);
    exit;
}

// 2. Tangkap parameter dari URL (Query String): ?cari=...&page=...
$cari = isset($_GET['cari']) ? trim($_GET['cari']) : '';
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
if ($page < 1) $page = 1;

// 3. Tentukan jumlah data per halaman (LIMIT) & hitung OFFSET
//    Default 5 (untuk tabel berpaginasi). Frontend bisa kirim ?limit=9999
//    untuk mengambil SEMUA data sekaligus (dipakai oleh carousel
//    "Daftar Barang Tersedia" yang tidak boleh ikut berpaginasi).
$limit  = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
if ($limit < 1) $limit = 5;
$offset = ($page - 1) * $limit;

// Escape karakter wildcard LIKE (% dan _) supaya kata kunci dicari sebagai teks biasa
$cariAman  = str_replace(['%', '_'], ['\\%', '\\_'], $cari);
$cariParam = '%' . $cariAman . '%';

// 4. Hitung total seluruh data yang cocok pencarian (untuk pagination frontend)
//    Pakai prepared statement supaya aman dari SQL Injection
$stmtTotal = mysqli_prepare($koneksi, "SELECT COUNT(*) AS total FROM barang WHERE nama_barang LIKE ?");
mysqli_stmt_bind_param($stmtTotal, "s", $cariParam);
mysqli_stmt_execute($stmtTotal);
$resultTotal = mysqli_stmt_get_result($stmtTotal);

if (!$resultTotal) {
    echo json_encode([
        "status" => "error",
        "message" => "Query gagal"
    ]);
    exit;
}

$rowTotal      = mysqli_fetch_assoc($resultTotal);
$total_data    = (int) $rowTotal['total'];
$total_halaman = (int) ceil($total_data / $limit);
if ($total_halaman < 1) $total_halaman = 1;

// 5. Ambil data spesifik sesuai LIMIT, OFFSET, dan kata kunci pencarian
$stmt = mysqli_prepare($koneksi, "SELECT * FROM barang WHERE nama_barang LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?");
mysqli_stmt_bind_param($stmt, "sii", $cariParam, $limit, $offset);
mysqli_stmt_execute($stmt);
$hasil = mysqli_stmt_get_result($stmt);

if (!$hasil) {
    echo json_encode([
        "status" => "error",
        "message" => "Query gagal"
    ]);
    exit;
}

// 6. Ambil data
$data_barang = [];
while ($baris = mysqli_fetch_assoc($hasil)) {
    $data_barang[] = $baris;
}

// 7. Response JSON beserta metadata halaman
$response = [
    "status"           => "success",
    "message"          => "Berhasil mengambil data",
    "data"             => $data_barang,
    "total_halaman"    => $total_halaman,
    "halaman_saat_ini" => $page,
    "total_data"       => $total_data
];

// 8. Output JSON
echo json_encode($response);
