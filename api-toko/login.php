<?php
include "koneksi.php";

// Tangkap JSON dari body
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

if (isset($data['username']) && isset($data['password'])) {
    $username = mysqli_real_escape_string($koneksi, $data['username']);
    $password = $data['password'];

    // Ambil user berdasarkan username saja dulu
    $query = "SELECT * FROM users WHERE username='$username'";
    $result = mysqli_query($koneksi, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);

        // Cek password (mendukung password_hash)
        $passwordCocok = false;
        if (password_verify($password, $user['password'])) {
            // Password di-hash dengan password_hash()
            $passwordCocok = true;
        } elseif ($user['password'] === $password) {
            // Password plain text (untuk keperluan belajar)
            $passwordCocok = true;
        }

        if ($passwordCocok) {
            // Generate token acak
            $token = md5(uniqid(rand(), true));
            $user_id = $user['id'];

            // Simpan token ke database
            mysqli_query($koneksi, "UPDATE users SET token='$token' WHERE id='$user_id'");

            echo json_encode([
                "status"   => "success",
                "pesan"    => "Login Berhasil",
                "token"    => $token,
                "username" => $user['username']
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "pesan"  => "Username atau Password salah!"
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "pesan"  => "Username atau Password salah!"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "pesan"  => "Akses Ditolak"
    ]);
}
?>