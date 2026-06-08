<?php
include "koneksi.php";

// Tangkap JSON dari body
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

if (isset($data['username']) && isset($data['password'])) {
    $username = mysqli_real_escape_string($koneksi, trim($data['username']));
    $password = $data['password'];

    // Validasi
    if (strlen($username) < 3) {
        echo json_encode(["status" => "error", "pesan" => "Username minimal 3 karakter!"]);
        exit;
    }
    if (strlen($password) < 6) {
        echo json_encode(["status" => "error", "pesan" => "Password minimal 6 karakter!"]);
        exit;
    }

    // Cek apakah username sudah ada
    $cek = mysqli_query($koneksi, "SELECT id FROM users WHERE username='$username'");
    if (mysqli_num_rows($cek) > 0) {
        echo json_encode([
            "status" => "error",
            "pesan"  => "Username '$username' sudah digunakan. Coba username lain!"
        ]);
        exit;
    }

    // Hash password sebelum disimpan
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Simpan ke database
    $query = "INSERT INTO users (username, password) VALUES ('$username', '$hashedPassword')";
    if (mysqli_query($koneksi, $query)) {
        echo json_encode([
            "status" => "success",
            "pesan"  => "Akun berhasil dibuat! Silakan login."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "pesan"  => "Gagal menyimpan akun ke database."
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "pesan"  => "Data tidak lengkap."
    ]);
}
?>