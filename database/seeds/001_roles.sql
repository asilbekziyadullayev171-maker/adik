INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Tizim administratori'),
(2, 'DOCTOR', 'Shifokor'),
(3, 'NURSE', 'Hamshira'),
(4, 'PATIENT', 'Bemor')
ON CONFLICT (id) DO NOTHING;
