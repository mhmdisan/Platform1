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

// 2. Query data
$query = "SELECT * FROM barang ORDER BY id DESC";
$hasil = mysqli_query($koneksi, $query);

// Cek query
if (!$hasil) {
    echo json_encode([
        "status" => "error",
        "message" => "Query gagal"
    ]);
    exit;
}

// 3. Ambil data
$data_barang = [];

while ($baris = mysqli_fetch_assoc($hasil)) {
    $data_barang[] = $baris;
}

// 4. Response
$response = [
    "status"  => "success",
    "message" => "Berhasil mengambil data",
    "data"    => $data_barang
];

// 5. Output JSON
echo json_encode($response);
?>