<?php
// WAJIB: supaya tidak kena CORS & terbaca sebagai JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 1. Koneksi database
include "koneksi.php";

if (!$koneksi) {
    echo json_encode([
        "status"  => "error",
        "message" => "Koneksi database gagal"
    ]);
    exit;
}

// 2. Berapa banyak barang termahal yang mau ditampilkan di grafik (default 5)
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
if ($limit < 1)  $limit = 5;
if ($limit > 20) $limit = 20; // jaga-jaga biar grafik tidak terlalu penuh

// ════════════════════════════════════════════════════════════
// 3. AGREGASI DI BACKEND (bukan di JavaScript!)
//    PHP/MySQL yang mengurutkan & membatasi data lewat
//    ORDER BY harga DESC LIMIT ?  -> jauh lebih ringan daripada
//    menarik ribuan baris ke frontend lalu dihitung di JS.
// ════════════════════════════════════════════════════════════
$stmt = mysqli_prepare($koneksi, "SELECT nama_barang, harga FROM barang ORDER BY harga DESC LIMIT ?");
mysqli_stmt_bind_param($stmt, "i", $limit);
mysqli_stmt_execute($stmt);
$hasil = mysqli_stmt_get_result($stmt);

if (!$hasil) {
    echo json_encode([
        "status"  => "error",
        "message" => "Query gagal: " . mysqli_error($koneksi)
    ]);
    exit;
}

// 4. Pecah hasil query menjadi 2 array terpisah: Labels & Values
//    -> Inilah dua array JSON yang nanti ditangkap fetch() di JS
//       dan langsung dilempar ke dalam new Chart().
$labels = [];
$values = [];
while ($baris = mysqli_fetch_assoc($hasil)) {
    $labels[] = $baris['nama_barang'];
    $values[] = (float) $baris['harga'];
}

// 5. Ringkasan tambahan untuk kartu statistik di dashboard
//    (total barang, total nilai gudang, rata-rata harga, dst)
$queryRingkasan = mysqli_query($koneksi, "
    SELECT
        COUNT(*)  AS total_barang,
        SUM(harga) AS total_nilai,
        AVG(harga) AS rata_rata_harga,
        MAX(harga) AS harga_termahal
    FROM barang
");
$ringkasan = mysqli_fetch_assoc($queryRingkasan);

$response = [
    "status"  => "success",
    "message" => "Statistik berhasil dihitung oleh server",

    // 2 array utama sesuai instruksi tugas: Labels & Values
    "labels"  => $labels,
    "values"  => $values,

    // Data tambahan (opsional dipakai) untuk kartu ringkasan
    "ringkasan" => [
        "total_barang"    => (int)   ($ringkasan['total_barang']    ?? 0),
        "total_nilai"     => (float) ($ringkasan['total_nilai']     ?? 0),
        "rata_rata_harga" => (float) ($ringkasan['rata_rata_harga'] ?? 0),
        "harga_termahal"  => (float) ($ringkasan['harga_termahal']  ?? 0),
        "nama_termahal"   => $labels[0] ?? '-'
    ]
];

// 6. Output JSON
echo json_encode($response);
