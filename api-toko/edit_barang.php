<?php
include "koneksi.php";

/* VALIDASI TOKEN */
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
    die(json_encode([
        "status" => "error",
        "pesan" => "Akses Ditolak! Token tidak ditemukan."
    ]));
}

$cek_token = mysqli_query(
    $koneksi,
    "SELECT * FROM users WHERE token='$token_dikirim'"
);

if (mysqli_num_rows($cek_token) === 0) {
    die(json_encode([
        "status" => "error",
        "pesan" => "Akses Ditolak! Token tidak valid."
    ]));
}

/* AMBIL DATA FORMDATA */
$id    = $_POST['id'] ?? '';
$nama  = $_POST['nama_barang'] ?? '';
$harga = $_POST['harga'] ?? '';

if ($id == '' || $nama == '' || $harga == '') {
    die(json_encode([
        "status" => "error",
        "pesan" => "Data tidak lengkap!"
    ]));
}

$id    = mysqli_real_escape_string($koneksi, $id);
$nama  = mysqli_real_escape_string($koneksi, $nama);
$harga = mysqli_real_escape_string($koneksi, $harga);

/* CEK ADA GAMBAR BARU ATAU TIDAK */
if (
    isset($_FILES['gambar']) &&
    $_FILES['gambar']['error'] === 0
) {

    $file_tmp = $_FILES['gambar']['tmp_name'];

    $nama_file_baru =
        time() . "_" . basename($_FILES['gambar']['name']);

    move_uploaded_file(
        $file_tmp,
        "uploads/" . $nama_file_baru
    );

    $query = "
        UPDATE barang
        SET nama_barang='$nama',
            harga='$harga',
            gambar='$nama_file_baru'
        WHERE id='$id'
    ";

} else {

    $query = "
        UPDATE barang
        SET nama_barang='$nama',
            harga='$harga'
        WHERE id='$id'
    ";
}

if (mysqli_query($koneksi, $query)) {
    echo json_encode([
        "status" => "success",
        "pesan" => "Data berhasil diperbarui!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "pesan" => "Gagal mengupdate database."
    ]);
}
?>