-- Migration number: 0001 	 2026-03-06T15:06:18.136Z
CREATE TABLE IF NOT EXISTS trip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    departureDate TEXT NOT NULL,
    fromLocation TEXT NOT NULL,
    returnDate TEXT NOT NULL,
    toLocation TEXT NOT NULL,
    fare REAL NOT NULL,
    ageCategory TEXT NOT NULL
);

-- Insert sample trip data
INSERT INTO trip (departureDate, fromLocation, returnDate, toLocation, fare, ageCategory)
VALUES
    ('2026-03-12T06:16:00Z', 'Stasiun Gambir', '2026-03-12T09:30:00Z', 'Stasiun Pasar Senen', 60.5, 'adult'),
    ('2026-03-12T06:27:00Z', 'Stasiun Gambir', '2026-03-12T09:50:00Z', 'Stasiun Pasar Senen', 60.5, 'adult'),
    ('2026-03-12T06:57:00Z', 'Stasiun Gambir', '2026-03-12T10:59:00Z', 'Stasiun Pasar Senen', 94.0, 'adult'),
    ('2026-03-12T07:27:00Z', 'Stasiun Gambir', '2026-03-12T11:11:00Z', 'Stasiun Pasar Senen', 60.5, 'adult'),
    ('2026-03-12T07:57:00Z', 'Stasiun Gambir', '2026-03-12T10:59:00Z', 'Stasiun Pasar Senen', 71.0, 'adult'),
    ('2026-03-12T08:30:00Z', 'Stasiun Tanah Abang', '2026-03-12T12:15:00Z', 'Stasiun Manggarai', 45.0, 'child');