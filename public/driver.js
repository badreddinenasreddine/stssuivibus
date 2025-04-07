import { supabase } from './supabase.js'

document.getElementById('trackingForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const matricule = document.getElementById('matricule').value
  const busNumber = document.getElementById('busNumber').value
  const routeId = document.getElementById('route_id').value;
  const statusMessage = document.getElementById('statusMessage');

  // Vérification des champs
  if (!matricule || !busNumber) {
    showStatus('Veuillez remplir tous les champs', 'error')
    return
  }

  try {
    // Check if the matricule already exists
    const { data: existingDriver, error: fetchError } = await supabase
      .from('drivers')
      .select('*')
      .eq('matricule', matricule)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError; // Handle other errors
    }

    let upsertData = {
      matricule,
      bus_number: busNumber,
      status: 'pending',
      route_id: routeId,
      email: await getUserEmail(),
      updated_at: new Date().toISOString() // Set updated_at to current timestamp
    };

    if (existingDriver) {
      // Update existing record
      const { data, error: updateError } = await supabase
        .from('drivers')
        .update(upsertData)
        .eq('id', existingDriver.id);

      if (updateError) throw updateError; // Handle update errors
    } else {
      // Insert new record
      const { data, error: insertError } = await supabase
        .from('drivers')
        .insert([upsertData]);

      if (insertError) throw insertError; // Handle insert errors
    }

    showStatus('Suivi activé avec succès!', 'success')
    startLocationTracking(matricule, busNumber)
  } catch (error) {
    console.error('Erreur:', error)
    showStatus("Erreur lors de l'activation du suivi", 'error')
  }
})

async function getUserEmail() {
  // Récupération de l'email via l'authentification Supabase
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email || 'unknown@example.com'
}

function showStatus(message, type) {
  const statusElement = document.getElementById('statusMessage')
  statusElement.textContent = message
  statusElement.className = `mt-4 p-3 rounded-lg ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`
  statusElement.classList.remove('hidden')
}

function startLocationTracking(matricule, busNumber) {
  // Implémentation du suivi géolocalisation
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await updateBusLocation(matricule, busNumber, latitude, longitude)
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error)
        showStatus('Erreur de géolocalisation', 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  } else {
    showStatus('Géolocalisation non supportée par votre navigateur', 'error')
  }
}

async function updateBusLocation(matricule, busNumber, lat, lng) {
  try {
    const { error } = await supabase
      .from('bus_locations')
      .upsert([
        {
          matricule,
          bus_number: busNumber,
          latitude: lat,
          longitude: lng,
          updated_at: new Date().toISOString()
        }
      ])

    if (error) throw error
  } catch (error) {
    console.error('Erreur mise à jour position:', error)
  }
}
