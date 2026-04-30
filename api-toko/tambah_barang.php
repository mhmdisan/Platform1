<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "db_toko");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi gagal"
    ]);
    exit;
}

// Ambil data POST
$nama = $_POST['nama_barang'] ?? '';
$harga = $_POST['harga'] ?? '';

// Validasi sederhana
if ($nama == '' || $harga == '') {
    echo json_encode([
        "status" => "error",
        "message" => "Data tidak lengkap"
    ]);
    exit;
}

// Insert
$query = "INSERT INTO barang (nama_barang, harga) VALUES ('$nama', '$harga')";

if ($conn->query($query)) {
    echo json_encode([
        "status" => "success",
        "message" => "Data berhasil ditambahkan"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal insert"
    ]);
}

$conn->close();
?>