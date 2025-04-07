import { supabase } from './supabase.js';

document.getElementById('addStationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const stationName = document.getElementById('stationName').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  const statusMessage = document.getElementById('statusMessage');

  try {
    const { data, error } = await supabase
      .from('stations')
      .insert([
        { 
          name: stationName,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      ]);

    if (error) throw error;

    statusMessage.textContent = 'Station ajoutée avec succès!';
    statusMessage.className = 'text-green-500';
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la station:', error);
    statusMessage.textContent = "Erreur lors de l'ajout de la station.";
    statusMessage.className = 'text-red-500';
  }
});
