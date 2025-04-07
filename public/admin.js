import { supabase } from './supabase.js'

// Initialisation de la carte
let map
let selectedDriver = null
let busMarkers = {}

document.addEventListener('DOMContentLoaded', async () => {
  initMap()
  await setupRealtimeListeners()
  setupEventListeners()
  await loadInitialData() // Chargement initial des données
})

async function loadInitialData() {
  try {
    // Chargement des chauffeurs en attente
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'pending')

    if (driversError) throw driversError

    // Affichage des chauffeurs
    drivers.forEach(driver => {
      handleDriverUpdates({
        eventType: 'INSERT',
        new: driver
      })
    })

    // Chargement des positions actuelles des bus
    const { data: locations, error: locationsError } = await supabase
      .from('bus_locations')
      .select('*')

    if (locationsError) throw locationsError

    // Affichage des positions
    locations.forEach(location => {
      handleLocationUpdates({
        new: location
      })
    })
  } catch (error) {
    console.error('Erreur chargement données initiales:', error)
    alert('Erreur lors du chargement des données')
  }
}

function initMap() {
  map = L.map('mapPreview').setView([14.6937, -17.4441], 12) // Coordonnées par défaut (Dakar)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
}

async function setupRealtimeListeners() {
  // Écoute des changements pour les chauffeurs en attente
  supabase
    .channel('pending_drivers')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'drivers',
      filter: 'status=eq.pending'
    }, handleDriverUpdates)
    .subscribe()

  // Écoute des positions des bus
  supabase
    .channel('bus_locations')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bus_locations'
    }, handleLocationUpdates)
    .subscribe()
}

function handleDriverUpdates(payload) {
  const tableBody = document.getElementById('pendingDrivers')
  
  if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
    // Ajout ou mise à jour d'un chauffeur
    const rowId = `driver-${payload.new.matricule}`
    let row = document.getElementById(rowId)

    if (!row) {
      row = document.createElement('tr')
      row.id = rowId
      row.className = 'hover:bg-gray-50'
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${payload.new.matricule}</td>
        <td class="px-6 py-4 whitespace-nowrap">${payload.new.bus_number}</td>
        <td class="px-6 py-4 whitespace-nowrap" id="pos-${payload.new.matricule}">-</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button class="assign-btn text-blue-600 hover:text-blue-800" 
                  data-matricule="${payload.new.matricule}">
            <i class="fas fa-route"></i>
          </button>
        </td>
      `
      tableBody.appendChild(row)
    }
  } else if (payload.eventType === 'DELETE') {
    // Suppression d'un chauffeur
    const row = document.getElementById(`driver-${payload.old.matricule}`)
    if (row) row.remove()
  }
}

function handleLocationUpdates(payload) {
  const matricule = payload.new.matricule
  const positionCell = document.getElementById(`pos-${matricule}`)
  
  if (positionCell) {
    positionCell.textContent = `${payload.new.latitude.toFixed(4)}, ${payload.new.longitude.toFixed(4)}`
  }

  // Mise à jour du marqueur sur la carte
  updateBusMarker(matricule, payload.new.latitude, payload.new.longitude)
}

function updateBusMarker(matricule, lat, lng) {
  if (!busMarkers[matricule]) {
    busMarkers[matricule] = L.marker([lat, lng], {
      icon: L.divIcon({
        html: '<i class="fas fa-bus text-2xl text-blue-600"></i>',
        iconSize: [30, 30],
        className: 'bus-marker'
      })
    }).addTo(map)
    busMarkers[matricule].bindPopup(`Bus: ${matricule}`)
  } else {
    busMarkers[matricule].setLatLng([lat, lng])
  }
}

function setupEventListeners() {
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.assign-btn')) {
      const matricule = e.target.closest('.assign-btn').dataset.matricule
      selectedDriver = matricule
      document.getElementById('routeAssignment').classList.remove('hidden')
    }

    if (e.target.id === 'assignRouteBtn') {
      const routeId = document.getElementById('routeSelect').value
      await assignRoute(selectedDriver, routeId)
      document.getElementById('routeAssignment').classList.add('hidden')
      selectedDriver = null
    }
  })
}

async function assignRoute(matricule, routeId) {
  try {
    // Vérification que le chauffeur existe
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('matricule', matricule)
      .single()

    if (driverError) throw driverError
    if (!driver) throw new Error('Chauffeur non trouvé')

    // Mise à jour du statut et de la ligne
    const { error: updateError } = await supabase
      .from('drivers')
      .update({ 
        status: 'active',
        route_id: routeId,
        updated_at: new Date().toISOString()
      })
      .eq('matricule', matricule)

    if (updateError) throw updateError

    alert('Ligne attribuée avec succès!')
  } catch (error) {
    console.error('Erreur attribution ligne:', error)
    alert('Erreur lors de l\'attribution de la ligne: ' + error.message)
  }
}