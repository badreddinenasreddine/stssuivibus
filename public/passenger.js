import { supabase } from './supabase.js'

// Configuration
const ALERT_DISTANCE_KM = 2 // Distance pour déclencher l'alerte (2km ≈ 2min en bus)
const REFRESH_INTERVAL = 10000 // 10 secondes

// Variables globales
let map
let stationMarker
let stationPosition = null
let busMarkers = {}
let activeAlerts = {}

document.addEventListener('DOMContentLoaded', async () => {
  initMap()
  await setupStation()
  setupRealtimeListeners()
  setupEventListeners()
})

function initMap() {
  map = L.map('stationMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([14.6937, -17.4441], 13) // Vue par défaut (Dakar)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
}

async function setupStation() {
  // Récupérer les paramètres de la station depuis l'URL
  const urlParams = new URLSearchParams(window.location.search)
  const stationId = urlParams.get('station_id')

  if (stationId) {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('id', stationId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Station non trouvée')

      // Mettre à jour l'interface
      document.getElementById('stationName').innerHTML = `
        <i class="fas fa-map-marker-alt mr-2"></i>
        <span>${data.name}</span>
      `
      document.getElementById('stationStatus').innerHTML = `
        <span class="text-green-400">Connecté</span>
        <i class="fas fa-check-circle ml-2 text-green-400"></i>
      `

      // Positionner la station sur la carte
      stationPosition = { lat: data.latitude, lng: data.longitude }
      map.setView([stationPosition.lat, stationPosition.lng], 15)
      
      stationMarker = L.marker([stationPosition.lat, stationPosition.lng], {
        icon: L.divIcon({
          html: '<i class="fas fa-map-pin text-4xl text-red-500"></i>',
          iconSize: [40, 40],
          className: 'station-icon'
        })
      }).addTo(map)
      stationMarker.bindPopup(`<b>${data.name}</b><br>Votre position`).openPopup()

    } catch (error) {
      console.error('Erreur chargement station:', error)
      document.getElementById('stationStatus').innerHTML = `
        <span class="text-red-400">Erreur de connexion</span>
        <i class="fas fa-exclamation-circle ml-2 text-red-400"></i>
      `
    }
  } else {
    alert('Paramètre station_id manquant dans l\'URL')
  }
}

function setupRealtimeListeners() {
  // Écoute des positions des bus en temps réel
  supabase
    .channel('bus_positions')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bus_locations'
    }, handleBusPositionUpdate)
    .subscribe()

  // Vérification périodique des distances
  setInterval(checkBusDistances, REFRESH_INTERVAL)
}

function handleBusPositionUpdate(payload) {
  const { matricule, latitude, longitude, bus_number } = payload.new

  // Mettre à jour ou créer le marqueur du bus
  if (!busMarkers[matricule]) {
    busMarkers[matricule] = L.marker([latitude, longitude], {
      icon: L.divIcon({
        html: `<i class="fas fa-bus text-3xl text-blue-500"></i><span class="text-xs bg-black text-white px-1 rounded absolute -bottom-1 -right-1">${bus_number}</span>`,
        iconSize: [30, 30],
        className: 'bus-icon'
      })
    }).addTo(map)
    busMarkers[matricule].bindPopup(`Bus ${bus_number}`)
  } else {
    busMarkers[matricule].setLatLng([latitude, longitude])
  }
}

function checkBusDistances() {
  if (!stationPosition) return

  Object.entries(busMarkers).forEach(([matricule, marker]) => {
    const busPos = marker.getLatLng()
    const distance = calculateDistance(
      stationPosition.lat,
      stationPosition.lng,
      busPos.lat,
      busPos.lng
    )

    // Gérer les alertes
    if (distance <= ALERT_DISTANCE_KM && !activeAlerts[matricule]) {
      triggerAlert(matricule, distance)
    } else if (distance > ALERT_DISTANCE_KM && activeAlerts[matricule]) {
      dismissAlert(matricule)
    }
  })
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Formule de Haversine pour calculer la distance en km
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function triggerAlert(matricule, distance) {
  activeAlerts[matricule] = true
  
  const alertBanner = document.getElementById('alertBanner')
  const alertMessage = document.getElementById('alertMessage')
  
  alertMessage.textContent = `Bus à ${distance.toFixed(1)}km - Arrivée imminente!`
  alertBanner.classList.remove('hidden')
  
  // Son d'alerte
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3')
  audio.play()
}

function dismissAlert(matricule) {
  delete activeAlerts[matricule]
  document.getElementById('alertBanner').classList.add('hidden')
}

function setupEventListeners() {
  document.getElementById('dismissAlert').addEventListener('click', () => {
    document.getElementById('alertBanner').classList.add('hidden')
  })
}