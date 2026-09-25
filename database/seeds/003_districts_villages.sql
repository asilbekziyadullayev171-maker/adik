INSERT INTO districts (id, name, region) VALUES
(1, 'Bo''stonliq tumani', 'Toshkent viloyati'),
(2, 'Urgut tumani', 'Samarqand viloyati')
ON CONFLICT (id) DO NOTHING;

INSERT INTO villages (id, name, district_id, population) VALUES
(1, 'Chorbog'' qishlog''i', 1, 5000),
(2, 'Sijjak qishlog''i', 1, 3500),
(3, 'Nanay qishlog''i', 1, 4200),
(4, 'Burchmulla qishlog''i', 1, 3800),
(5, 'Xo''jakent qishlog''i', 1, 6000),
(6, 'Omonqo''ton qishlog''i', 2, 4500),
(7, 'Jartepa qishlog''i', 2, 5200),
(8, 'Qoratepa qishlog''i', 2, 3100),
(9, 'G''o''s qishlog''i', 2, 4800)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clinics (id, name, clinic_type, district_id, is_active) VALUES
(1, 'Bo''stonliq 1-sonli FAP', 'FAP', 1, true),
(2, 'Urgut markaziy SVP', 'SVP', 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clinic_villages (clinic_id, village_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 6), (2, 7), (2, 8), (2, 9)
ON CONFLICT DO NOTHING;
