/*
  # Add Sample Songs

  1. Sample Data
    - Insert popular songs from various genres
    - Include cover images and audio file URLs
    - Set realistic durations and metadata

  2. Notes
    - Using placeholder URLs for demonstration
    - In production, these would be actual audio files and cover images
*/

-- Insert sample songs
INSERT INTO songs (title, artist, album, cover_url, file_url, duration) VALUES
('Blinding Lights', 'The Weeknd', 'After Hours', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 200),
('Shape of You', 'Ed Sheeran', '÷ (Divide)', 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 233),
('Someone Like You', 'Adele', '21', 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 285),
('Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'Uptown Special', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 270),
('Bad Guy', 'Billie Eilish', 'When We All Fall Asleep, Where Do We Go?', 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 194),
('Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 355),
('Hotel California', 'Eagles', 'Hotel California', 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 391),
('Imagine', 'John Lennon', 'Imagine', 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 183),
('Thriller', 'Michael Jackson', 'Thriller', 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 357),
('Stairway to Heaven', 'Led Zeppelin', 'Led Zeppelin IV', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 482),
('Rolling in the Deep', 'Adele', '21', 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 228),
('Watermelon Sugar', 'Harry Styles', 'Fine Line', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 174),
('Levitating', 'Dua Lipa', 'Future Nostalgia', 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 203),
('Good 4 U', 'Olivia Rodrigo', 'SOUR', 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 178),
('Stay', 'The Kid LAROI & Justin Bieber', 'F*CK LOVE 3: OVER YOU', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 141);