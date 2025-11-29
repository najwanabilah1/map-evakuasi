// ======================================
// INIT MAP
// ======================================
const map = L.map('map', { zoomControl: true }).setView([-3.1, 101.9], 9);

// Base Tiles — multiple options
const light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
});

const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles © Esri'
});

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: © OpenTopoMap (CC-BY-SA)'
});

const positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19,
  attribution: '&copy; CartoDB'
});

// add default
light.addTo(map);

// layer control
const baseMaps = {
  'Peta Jalan': light,
  'Satellite (Esri)': esriSat,
  'Topografi': topo,
  'Carto (Positron)': positron
};

L.control.layers(baseMaps, null, { position: 'topright', collapsed: false }).addTo(map);

let titikLayerGroup = L.layerGroup().addTo(map);
let semuaTitik = [];
// marker untuk lokasi pengguna (jika tersedia)
let userMarker = null;
let userCircle = null;

// Default and selected marker icons (use divIcon so initial points look like dots)
const _defaultIcon = L.divIcon({
  className: 'marker-default',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const _selectedIcon = L.divIcon({
  className: 'selected-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

// user marker icon (distinct)
const userIcon = L.divIcon({
  className: 'user-marker',
  iconSize: [16,16],
  iconAnchor: [8,8]
});


// ======================================
// Haversine Distance (KM)
// ======================================
function distanceKm(lat1, lon1, lat2, lon2){
  const toRad = v => v * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2)**2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


// ======================================
// LOAD GEOJSON
// ======================================
fetch('data/titik_evakuasi.geojson')
  .then(r => r.json())
  .then(data => {
    data.features.forEach(f => {
      if(!f.geometry || f.geometry.type !== 'Point') return;

      const [lng, lat] = f.geometry.coordinates;
      const props = f.properties || {};
      const name = props.name || props.nama || props.title || "Titik Evakuasi";
      const address = props.address || props.alamat || props.alamat_lengkap || "Alamat tidak tersedia";

      // additional fields with common fallback keys
      const village = props.desa || props.kelurahan || props.village || props.kampung || props.dusun || "";
      const district = props.kecamatan || props.district || props.kec || "";
      const phone = props.phone || props.telepon || props.telp || props.kontak || props.hp || "";

      const marker = L.marker([lat, lng], { title: name, icon: _defaultIcon });

      marker.on("click", (e) => {
        try{ if(e && e.originalEvent) e.originalEvent.stopPropagation(); }catch(err){}
        showInfoCard(name, address, lat, lng, marker);
        highlightListItem(name);
      });

      marker.addTo(titikLayerGroup);

      semuaTitik.push({
        name, lat, lng, address, village, district, phone, marker,
        _reverseFetched: false,
        _cachedAddress: null
      });
    });

    populateList(semuaTitik);
  })
  .catch(err => {
    alert("Gagal load data titik_evakuasi.geojson");
    console.error(err);
  });


// ======================================
// LIST SIDEBAR
// ======================================
function populateList(list){
  const wrap = document.getElementById("list");
  wrap.innerHTML = "";

  list.forEach((t, idx) => {
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.idx = idx;

    div.innerHTML = `
      <div>
        <strong>${escapeHtml(t.name)}</strong>
        <div class="meta">${t.lat.toFixed(6)}, ${t.lng.toFixed(6)}</div>
      </div>
      <div class="chev">›</div>
    `;

    // klik seluruh item list — fokuskan peta lalu tampilkan card (langsung jika tidak ada pergerakan)
    div.addEventListener("click", (ev) => {
      ev.stopPropagation();
      focusOn(t);
      // if map does not move (already at target zoom/center) call immediately
      const center = map.getCenter();
      if(Math.abs(center.lat - t.lat) < 1e-6 && Math.abs(center.lng - t.lng) < 1e-6 && map.getZoom() === 14){
        showInfoCard(t.name, t.address, t.lat, t.lng, t.marker);
        highlightListItem(t.name);
      } else {
        map.once('moveend', () => {
          showInfoCard(t.name, t.address, t.lat, t.lng, t.marker);
          highlightListItem(t.name);
        });
      }
    });

    wrap.appendChild(div);
  });
}


// ======================================
// FOKUS MAP
// ======================================
function focusOn(t){
  map.setView([t.lat, t.lng], 14);
}


// ======================================
// HIGHLIGHT LIST
// ======================================
function highlightListItem(name){
  const items = document.querySelectorAll("#list .item");
  items.forEach(i => {
    const nm = i.querySelector("strong").innerText;
    i.style.background = nm === name ? "rgba(13,178,158,0.20)" : "";
  });
}


// ======================================
// SELECTED MARKER VISUAL
// ======================================
function _setSelectedMarker(marker){
  semuaTitik.forEach(t => {
    if(t.marker === marker){
      try{ t.marker.setIcon(_selectedIcon); t.marker.setZIndexOffset(1000); }catch(e){}
    } else {
      try{ t.marker.setIcon(_defaultIcon); t.marker.setZIndexOffset(0); }catch(e){}
    }
  });
}


// ======================================
// INFO CARD CONTROLLER
// ======================================
let _currentCardLatLng = null;

function _positionCardAtLatLng(lat, lng){
  const card = document.getElementById("infoCard");
  if(!card) return;

  // container bounding box
  const mapRect = map.getContainer().getBoundingClientRect();

  // convert latlng to container point (pixels relative to map container)
  const pt = map.latLngToContainerPoint([lat, lng]);

  // compute absolute page coordinates and place card
  const left = Math.round(mapRect.left + pt.x);
  const top = Math.round(mapRect.top + pt.y);

  card.style.left = left + 'px';
  card.style.top = top + 'px';
}

function showInfoCard(name, address, lat, lng, marker){
  const card = document.getElementById("infoCard");

  // try to find the titik metadata by marker first, fallback to matching by lat/lng/name
  const meta = (marker && semuaTitik.find(t => t.marker === marker))
    || semuaTitik.find(t => (t.lat === lat && t.lng === lng && t.name === name))
    || {};

  document.getElementById("cardTitle").innerText = name || meta.name || "Titik Evakuasi";
  const addrText = address || meta.address || "";
  document.getElementById("cardAddress").innerText = addrText || "";
  document.getElementById("cardVillage").innerText = meta.village || "";
  document.getElementById("cardDistrict").innerText = meta.district || "";
  // phone as clickable link
  const phoneEl = document.getElementById("cardPhone");
  if(meta.phone && meta.phone.trim()){
    phoneEl.innerHTML = `<a href="tel:${encodeURIComponent(meta.phone)}">Telp: ${escapeHtml(meta.phone)}</a>`;
  } else {
    phoneEl.innerText = "";
  }
  document.getElementById("cardCoords").innerText = `${(lat||meta.lat||0).toFixed(6)}, ${(lng||meta.lng||0).toFixed(6)}`;

  // Google Maps Link
  const gmapsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  document.getElementById("gmapsButton").href = gmapsUrl;

  // remember current position for move/zoom updates
  _currentCardLatLng = {lat, lng};

  // hide empty lines (keep layout clean)
  const hideIfEmpty = id => {
    const el = document.getElementById(id);
    if(!el) return;
    if(!el.innerText || el.innerText.trim() === "") el.style.display = 'none';
    else el.style.display = '';
  };

  hideIfEmpty('cardAddress');
  hideIfEmpty('cardVillage');
  hideIfEmpty('cardDistrict');
  hideIfEmpty('cardPhone');

  // If address or village/district missing, try reverse geocoding (cache results)
  const needReverse = (!meta._reverseFetched) && ((!(addrText && addrText.trim())) || (!meta.village && !meta.district));
  if(needReverse){
    // show temporary text
    const addrEl = document.getElementById('cardAddress');
    addrEl.style.display = '';
    addrEl.innerText = 'Mencari alamat...';
    // perform reverse geocode
    const rlat = meta.lat || lat;
    const rlng = meta.lng || lng;
    _reverseGeocode(rlat, rlng).then(res => {
      // merge results into meta and cache
      meta._reverseFetched = true;
      if(res.display_name) meta._cachedAddress = res.display_name;
      if(res.address){
        if(!meta.address) meta.address = res.display_name || meta._cachedAddress || meta.address;
        if(!meta.village) meta.village = res.address.village || res.address.town || res.address.hamlet || res.address.suburb || '';
        if(!meta.district) meta.district = res.address.county || res.address.state_district || res.address.city_district || '';
      }
      // update UI (only if card still shown)
      if(document.getElementById('infoCard').classList.contains('show')){
        document.getElementById('cardAddress').innerText = meta.address || '';
        const ph = document.getElementById('cardPhone');
        if(meta.phone && meta.phone.trim()) ph.innerHTML = `<a href="tel:${encodeURIComponent(meta.phone)}">Telp: ${escapeHtml(meta.phone)}</a>`;
        document.getElementById('cardVillage').innerText = meta.village || '';
        document.getElementById('cardDistrict').innerText = meta.district || '';
        hideIfEmpty('cardAddress');
        hideIfEmpty('cardVillage');
        hideIfEmpty('cardDistrict');
        hideIfEmpty('cardPhone');
        // reposition in case size changed
        _positionCardAtLatLng(rlat, rlng);
      }
    }).catch(err => {
      meta._reverseFetched = true;
      // silently ignore failures
    });
  }

  // position then show
  _positionCardAtLatLng(lat, lng);
  card.classList.add("show");
  // update marker visuals (use marker reference if provided)
  if(marker) _setSelectedMarker(marker);
}

function hideInfoCard(){
  document.getElementById("infoCard").classList.remove("show");
  _currentCardLatLng = null;
}

// klik tombol X
document.getElementById("closeCard").addEventListener("click", hideInfoCard);


// ======================================
// CLOSE CARD BY CLICK OUTSIDE
// ======================================
document.addEventListener("click", e => {
  const card = document.getElementById("infoCard");

  // Jika card sedang tidak tampil → abaikan
  if(!card.classList.contains("show")) return;

  // Jangan tutup kalau klik di dalam card
  if(card.contains(e.target)) return;

  // Jangan tutup kalau klik marker Leaflet
  if((e.target.classList && e.target.classList.contains("leaflet-interactive")) || (e.target.closest && e.target.closest('.leaflet-marker-icon'))) return;

  hideInfoCard();
});


// Update info card position while map moves or zooms so it stays above the marker
map.on('move zoom resize', () => {
  if(_currentCardLatLng){
    _positionCardAtLatLng(_currentCardLatLng.lat, _currentCardLatLng.lng);
  }
});


// ======================================
// SEARCH BAR
// ======================================
document.getElementById("searchInput").addEventListener("input", function(){
  const q = this.value.toLowerCase();
  const filtered = semuaTitik.filter(
    t => t.name.toLowerCase().includes(q)
  );
  populateList(filtered);
});


// ======================================
// TOMBOL NEAREST
// ======================================
document.getElementById("nearButton").addEventListener("click", () => {
  if(!navigator.geolocation)
    return alert("Geolocation tidak didukung di browser ini.");

  navigator.geolocation.getCurrentPosition(pos => {
    const ulat = pos.coords.latitude;
    const ulng = pos.coords.longitude;
    // tampilkan lokasi pengguna sebagai marker yang berbeda dan circle akurasi
    try{
      // remove previous
      if(userMarker) userMarker.remove();
      if(userCircle) userCircle.remove();

      // create user marker (distinct icon)
      userMarker = L.marker([ulat, ulng], { title: 'Lokasi Anda', icon: userIcon }).addTo(map);

      // create accuracy circle (use accuracy if available)
      const accuracy = pos.coords.accuracy || 50;
      userCircle = L.circle([ulat, ulng], {
        radius: accuracy,
        color: '#3182ce',
        weight: 1,
        fillColor: 'rgba(49,130,206,0.12)'
      }).addTo(map);

      // optional popup
      if(userMarker.bindPopup) userMarker.bindPopup(`Lokasi Anda<br>Akurasi ~${Math.round(accuracy)} m`).openPopup();
    }catch(e){
      console.warn('Gagal menambahkan userMarker/ circle', e);
    }

    let best = null;
    let bestDist = Infinity;

    semuaTitik.forEach(t => {
      const d = distanceKm(ulat, ulng, t.lat, t.lng);
      if(d < bestDist){
        bestDist = d;
        best = t;
      }
    });

    if(best){
      focusOn(best);
      const center = map.getCenter();
      if(Math.abs(center.lat - best.lat) < 1e-6 && Math.abs(center.lng - best.lng) < 1e-6 && map.getZoom() === 14){
        showInfoCard(best.name, best.address, best.lat, best.lng, best.marker);
        highlightListItem(best.name);
        _setSelectedMarker(best.marker);
      } else {
        map.once('moveend', () => {
          showInfoCard(best.name, best.address, best.lat, best.lng, best.marker);
          highlightListItem(best.name);
          _setSelectedMarker(best.marker);
        });
      }
    }

  }, err => {
    alert("Gagal mendapatkan lokasi: " + err.message);
  });
});


// ======================================
// UTIL
// ======================================
function escapeHtml(s){
  return String(s).replace(/[&<>"'`]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;',
    '"':'&quot;', "'":'&#39;', '`':'&#96;'
  }[c]));
}


// Reverse geocode using Nominatim (returns parsed JSON)
function _reverseGeocode(lat, lng){
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;
  return fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  }).then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}
