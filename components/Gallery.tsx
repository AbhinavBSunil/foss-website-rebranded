'use client';
import { useState, useEffect } from 'react';

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRg-ADsuFgP7aFeZbTrAHtms8WKR8AZFu4K_BdDUQIdXqwserk0mEkjrDjax7aRyrd3jkYKuyxAC5IY/pub?gid=1996841663&single=true&output=csv";

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const text = await response.text();
        const rows = parseCSV(text);
        const urls: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 4) continue;
          const rawDriveUrl = row[3] ? row[3].trim() : '';
          if (!rawDriveUrl) continue;

          const match = rawDriveUrl.match(/id=([a-zA-Z0-9_-]+)/) || rawDriveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
          const fileId = match ? match[1] : null;

          if (fileId) {
            urls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
          }
        }
        setImages(urls);
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  function parseCSV(text: string) {
    const lines = text.split(/\r?\n/);
    return lines.filter(line => line.trim() !== '').map(line => {
      return line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(cell => {
        return cell.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim();
      });
    });
  }

  if (loading) return <p className="p-4 text-center">Loading gallery...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {images.length === 0 ? (
        <p className="col-span-full text-center">No images uploaded yet.</p>
      ) : (
        images.map((url, index) => (
          <div key={index} className="overflow-hidden rounded-lg shadow-md">
            <img src={url} alt={`Gallery item ${index + 1}`} className="w-full h-64 object-cover" loading="lazy" />
          </div>
        ))
      )}
    </div>
  );
}


