-- Jalankan query ini di phpMyAdmin untuk menambah kolom gambar
-- (Hanya perlu dijalankan SEKALI)

ALTER TABLE barang ADD COLUMN gambar VARCHAR(255) DEFAULT '' AFTER harga;

-- Verifikasi:
-- DESCRIBE barang;
