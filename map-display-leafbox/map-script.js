let map;
let fsaLayer;
let currentViewMode = 'equity';
let currentFilter = null;
let currentStoryMode = null;
let fsaData = null;
let storyStep = 0;

const MAP_CONFIG = {
    center: [43.4643, -80.5204], // Kitchener-Waterloo center
    zoom: 11, // Increased zoom to focus on urban area
    maxBounds: [
        [43.3, -80.8], // Southwest corner
        [43.6, -80.2]  // Northeast corner
    ],
    maxZoom: 16,
    minZoom: 9
};

// Colors
const COLORS = {
    critical: '#DC2626',      // Zero parks
    underserved: '#F97316',   // 0.1-1.0 parks/1000
    belowAvg: '#EAB308',      // 1.0-1.62 parks/1000
    aboveAvg: '#16A34A',      // 1.62-3.0 parks/1000
    excellent: '#059669',     // 3.0+ parks/1000
    primary: '#1B4B82',       // Blue
    secondary: '#F59E0B',     // Innovation Gold
    highlight: '#3B82F6'      // Interactive Blue
};

const KW_FSA_CODES = [
    'N1P', 'N1R', 'N1S', 'N1T', // Kitchener central/downtown
    'N2A', 'N2B', 'N2C', 'N2E', 'N2G', 'N2H', 'N2J', 'N2K', 'N2L', 'N2M', 'N2N', 'N2P', 'N2R', 'N2T', 'N2V', // Waterloo/North Kitchener
    'N3C', 'N3E', 'N3H' // Cambridge/South areas
];

// Story Mode Data
const STORY_PATHS = {
    'equity-gap': {
        title: 'The Equity Gap',
        steps: [
            {
                description: 'Seven areas in Kitchener-Waterloo have zero parks, affecting over 144,000 residents.',
                highlight: 'zero-parks',
                stats: { value1: '144,229', label1: 'People Affected', value2: '7', label2: 'Zero-Park Areas' }
            },
            {
                description: 'N1R alone has 42,928 people with no park access - our biggest equity challenge.',
                highlight: 'N1R',
                stats: { value1: '42,928', label1: 'People in N1R', value2: '0', label2: 'Parks Available' }
            },
            {
                description: 'As we grow toward 1 million people, equitable park access becomes even more critical.',
                highlight: 'all',
                stats: { value1: '1.62', label1: 'Regional Average', value2: '2.5x', label2: 'Growth Expected' }
            }
        ]
    },
    'success-stories': {
        title: 'Success Stories',
        steps: [
            {
                description: 'N2V leads the region with 4.12 parks per 1000 people - a model for other areas.',
                highlight: 'N2V',
                stats: { value1: '4.12', label1: 'Parks per 1000', value2: '19,428', label2: 'People Served' }
            },
            {
                description: 'The N2 postal code areas consistently show excellent park coverage.',
                highlight: 'excellent',
                stats: { value1: '10', label1: 'Well-Served Areas', value2: '3.0+', label2: 'Parks per 1000' }
            }
        ]
    }
};

function initMap() {
    map = L.map('map', {
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        maxBounds: MAP_CONFIG.maxBounds,
        maxBoundsViscosity: 1.0,
        maxZoom: MAP_CONFIG.maxZoom,
        minZoom: MAP_CONFIG.minZoom,
        zoomControl: false 
    });
    

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | ConnectedKW by One Million Neighbours',
        maxZoom: MAP_CONFIG.maxZoom
    }).addTo(map);

    map.on('zoomend', updateMapControls);
    map.on('moveend', updateMapControls);
}

function filterKitchenerWaterlooData(data) {
    return {
        ...data,
        features: data.features.filter(feature => {
            const fsaCode = feature.properties.CFSAUID;
            return KW_FSA_CODES.includes(fsaCode);
        })
    };
}

function getEquityColor(parksPerThousand) {
    if (parksPerThousand === 0) return COLORS.critical;
    if (parksPerThousand <= 1.0) return COLORS.underserved;
    if (parksPerThousand <= 1.62) return COLORS.belowAvg;
    if (parksPerThousand <= 3.0) return COLORS.aboveAvg;
    return COLORS.excellent;
}

function getEquityClass(parksPerThousand) {
    if (parksPerThousand === 0) return 'critical';
    if (parksPerThousand <= 1.0) return 'underserved';
    if (parksPerThousand <= 1.62) return 'below-avg';
    if (parksPerThousand <= 3.0) return 'above-avg';
    return 'excellent';
}

function getEquityStatus(parksPerThousand) {
    if (parksPerThousand === 0) return 'Critical Gap';
    if (parksPerThousand <= 1.0) return 'Underserved';
    if (parksPerThousand <= 1.62) return 'Below Average';
    if (parksPerThousand <= 3.0) return 'Above Average';
    return 'Excellent';
}

function getPopulationColor(population) {
    if (population < 10000) return '#ffffcc';
    if (population < 20000) return '#c7e9b4';
    if (population < 30000) return '#7fcdbb';
    if (population < 40000) return '#41b6c4';
    return '#2c7fb8';
}

function getFeatureStyle(feature) {
    const props = feature.properties;
    const parksPerThousand = props.parksPerThousand || 0;
    const population = props.population || 0;
    
    let fillColor;
    if (currentViewMode === 'equity') {
        fillColor = getEquityColor(parksPerThousand);
    } else {
        fillColor = getPopulationColor(population);
    }
    
    return {
        fillColor: fillColor,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7,
        className: getEquityClass(parksPerThousand)
    };
}

function createPopupContent(properties) {
    const fsa = properties.CFSAUID || 'Unknown';
    const parks = properties.parkCount || 0;
    const population = properties.population || 0;
    const parksPerThousand = properties.parksPerThousand || 0;
    const peoplePerPark = properties.populationPerPark || 'N/A';
    const equityStatus = getEquityStatus(parksPerThousand);
    
    return `
        <div class="popup-content">
            <div class="popup-fsa" role="heading" aria-level="3">${fsa}</div>
            <div class="popup-equity-status" style="color: ${getEquityColor(parksPerThousand)}; font-weight: 600; margin-bottom: 12px;">
                ${equityStatus}
            </div>
            <div class="popup-stats">
                <div class="popup-stat">
                    <div class="popup-stat-value" aria-label="${parks} parks">${parks}</div>
                    <div class="popup-stat-label">Parks</div>
                </div>
                <div class="popup-stat">
                    <div class="popup-stat-value" aria-label="${population.toLocaleString()} people">${population.toLocaleString()}</div>
                    <div class="popup-stat-label">Population</div>
                </div>
                <div class="popup-stat">
                    <div class="popup-stat-value" aria-label="${parksPerThousand.toFixed(2)} parks per 1000 people">${parksPerThousand.toFixed(2)}</div>
                    <div class="popup-stat-label">Parks/1000</div>
                </div>
                <div class="popup-stat">
                    <div class="popup-stat-value" aria-label="${peoplePerPark === 'N/A' ? 'No parks available' : Math.round(peoplePerPark) + ' people per park'}">${peoplePerPark === 'N/A' ? 'N/A' : Math.round(peoplePerPark)}</div>
                    <div class="popup-stat-label">People/Park</div>
                </div>
            </div>
        </div>
    `;
}

function onEachFeature(feature, layer) {
    const equityClass = getEquityClass(feature.properties.parksPerThousand || 0);
    layer.options.className = `fsa-area ${equityClass}`;
    
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: selectFeature
    });
    
    layer.bindPopup(createPopupContent(feature.properties), {
        maxWidth: 300,
        className: 'connectedkw-popup'
    });
}

function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: COLORS.highlight,
        dashArray: '',
        fillOpacity: 0.8
    });
    layer.bringToFront();
}

function resetHighlight(e) {
    fsaLayer.resetStyle(e.target);
}

function selectFeature(e) {
    const properties = e.target.feature.properties;
    updateAreaDetails(properties);
    
    trackInteraction('area_selected', { fsa: properties.CFSAUID });
}

function updateAreaDetails(properties) {
    const fsa = properties.CFSAUID || 'Unknown';
    const parks = properties.parkCount || 0;
    const population = properties.population || 0;
    const parksPerThousand = properties.parksPerThousand || 0;
    const peoplePerPark = properties.populationPerPark || 'N/A';
    const equityStatus = getEquityStatus(parksPerThousand);
    
    document.getElementById('selected-fsa').textContent = `FSA ${fsa}`;
    document.getElementById('selected-population').textContent = population.toLocaleString();
    document.getElementById('selected-parks').textContent = parks;
    document.getElementById('selected-density').textContent = parksPerThousand.toFixed(2);
    document.getElementById('selected-ratio').textContent = peoplePerPark === 'N/A' ? 'N/A' : Math.round(peoplePerPark);
    document.getElementById('selected-equity-status').textContent = equityStatus;
    document.getElementById('selected-equity-status').style.color = getEquityColor(parksPerThousand);
    
    document.getElementById('area-details').style.display = 'block';
    
    announceToScreenReader(`Selected area ${fsa} with ${equityStatus.toLowerCase()} park coverage`);
}


function updateRegionalStats(data) {
    const features = data.features.filter(f => f.properties.population > 0);
    
    const totalFsas = features.length;
    const totalPopulation = features.reduce((sum, f) => sum + (f.properties.population || 0), 0);
    const totalParks = features.reduce((sum, f) => sum + (f.properties.parkCount || 0), 0);
    const regionalAverage = totalParks / totalPopulation * 1000;
    
    animateValue('total-fsas', 0, totalFsas, 1000);
    animateValue('total-population', 0, totalPopulation, 1500);
    animateValue('total-parks', 0, totalParks, 1200);
    animateValue('regional-average', 0, regionalAverage, 1800, 2);
}

function setViewMode(mode) {
    currentViewMode = mode;
    
    document.querySelectorAll('.control-group:first-child .toggle-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (fsaLayer) {
        fsaLayer.eachLayer(layer => {
            layer.setStyle(getFeatureStyle(layer.feature));
        });
    }
    
    updateLegendForMode(mode);
    trackInteraction('view_mode_changed', { mode });
}

function toggleFilter(filterType) {
    const button = event.target;
    
    if (currentFilter === filterType) {
        // Turn off filter
        currentFilter = null;
        button.classList.remove('active');
    } else {
        // Turn on filter
        currentFilter = filterType;
        document.querySelectorAll('.control-group:nth-child(2) .toggle-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }
    
    updateMapFilter();
    trackInteraction('filter_toggled', { filter: filterType, active: currentFilter === filterType });
}

function updateMapFilter() {
    if (!fsaLayer) return;
    
    fsaLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        let show = true;
        
        if (currentFilter === 'underserved') {
            show = (props.parksPerThousand || 0) < 1.62;
        } else if (currentFilter === 'zero-parks') {
            show = (props.parkCount || 0) === 0;
        } else if (currentFilter === 'excellent') {
            show = (props.parksPerThousand || 0) >= 3.0;
        }
        
        if (show) {
            layer.setStyle({ fillOpacity: 0.7, opacity: 1 });
        } else {
            layer.setStyle({ fillOpacity: 0.1, opacity: 0.3 });
        }
    });
}


function showStoryPath(pathKey) {
    currentStoryMode = pathKey;
    storyStep = 0;
    
    const story = STORY_PATHS[pathKey];
    if (!story) return;
    
    document.getElementById('story-panel').style.display = 'block';
    document.getElementById('area-details').style.display = 'none';
    
    updateStoryStep();
    trackInteraction('story_started', { story: pathKey });
}

function updateStoryStep() {
    if (!currentStoryMode) return;
    
    const story = STORY_PATHS[currentStoryMode];
    const step = story.steps[storyStep];
    
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-description').textContent = step.description;
    document.getElementById('story-stat-1-value').textContent = step.stats.value1;
    document.getElementById('story-stat-1-label').textContent = step.stats.label1;
    document.getElementById('story-stat-2-value').textContent = step.stats.value2;
    document.getElementById('story-stat-2-label').textContent = step.stats.label2;
    
    const actionBtn = document.getElementById('story-action-btn');
    if (storyStep < story.steps.length - 1) {
        actionBtn.textContent = 'Next →';
        actionBtn.onclick = nextStoryStep;
    } else {
        actionBtn.textContent = 'Explore More';
        actionBtn.onclick = closeStoryMode;
    }

    highlightStoryAreas(step.highlight);
}

function nextStoryStep() {
    if (!currentStoryMode) return;
    
    const story = STORY_PATHS[currentStoryMode];
    if (storyStep < story.steps.length - 1) {
        storyStep++;
        updateStoryStep();
    }
}

function closeStoryMode() {
    currentStoryMode = null;
    storyStep = 0;
    document.getElementById('story-panel').style.display = 'none';

    if (fsaLayer) {
        fsaLayer.setStyle(getFeatureStyle);
    }

    currentFilter = null;
    document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
    updateMapFilter();
}

function highlightStoryAreas(highlight) {
    if (!fsaLayer) return;
    
    fsaLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const fsa = props.CFSAUID;
        let shouldHighlight = false;
        
        switch (highlight) {
            case 'zero-parks':
                shouldHighlight = (props.parkCount || 0) === 0;
                break;
            case 'excellent':
                shouldHighlight = (props.parksPerThousand || 0) >= 3.0;
                break;
            case 'N1R':
                shouldHighlight = fsa === 'N1R';
                break;
            case 'N2V':
                shouldHighlight = fsa === 'N2V';
                break;
            case 'all':
            default:
                shouldHighlight = true;
                break;
        }
        
        if (shouldHighlight) {
            layer.setStyle({ 
                fillOpacity: 0.8, 
                opacity: 1,
                weight: 3,
                color: COLORS.highlight
            });
        } else {
            layer.setStyle({ fillOpacity: 0.2, opacity: 0.5, weight: 1 });
        }
    });

    if (highlight === 'N1R' || highlight === 'N2V') {
        zoomToFSA(highlight);
    }
}

function resetMapView() {
    if (!map) return;
    
    map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
    
    currentFilter = null;
    currentViewMode = 'equity';

    document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[onclick="setViewMode(\'equity\')"]').classList.add('active');
    
    if (fsaLayer) {
        fsaLayer.setStyle(getFeatureStyle);
    }
    
    updateMapFilter();
    trackInteraction('map_reset');
}

function toggleFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().then(() => {
            setTimeout(() => map.invalidateSize(), 100);
            trackInteraction('fullscreen_enabled');
        });
    } else {
        document.exitFullscreen().then(() => {
            setTimeout(() => map.invalidateSize(), 100);
            trackInteraction('fullscreen_disabled');
        });
    }
}

function exportMap() {
    const mapData = {
        center: map.getCenter(),
        zoom: map.getZoom(),
        viewMode: currentViewMode,
        filter: currentFilter,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `connectedkw-map-export-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    trackInteraction('map_exported');
}

function updateMapControls() {
    const zoom = map.getZoom();
    const center = map.getCenter();
    
    if (zoom > 13) {
    }
}

function zoomToFSA(fsaCode) {
    if (!fsaLayer) return;
    
    fsaLayer.eachLayer(layer => {
        if (layer.feature.properties.CFSAUID === fsaCode) {
            map.fitBounds(layer.getBounds(), { padding: [20, 20] });
        }
    });
}

function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key.toLowerCase()) {
            case 'e':
                setViewMode('equity');
                break;
            case 'p':
                setViewMode('population');
                break;
            case 'z':
                toggleFilter('zero-parks');
                break;
            case 'u':
                toggleFilter('underserved');
                break;
            case 'r':
                resetMapView();
                break;
            case '?':
                toggleShortcutsHelp();
                break;
            case 'escape':
                closeStoryMode();
                toggleShortcutsHelp(false);
                break;
        }
    });
}

function toggleShortcutsHelp(show = null) {
    const helpPanel = document.getElementById('shortcuts-help');
    if (!helpPanel) return;
    
    const isVisible = helpPanel.style.display !== 'none';
    
    if (show === null) {
        helpPanel.style.display = isVisible ? 'none' : 'block';
    } else {
        helpPanel.style.display = show ? 'block' : 'none';
    }
    
    if (helpPanel.style.display === 'block') {
        helpPanel.focus();
    }
}

function animateValue(elementId, start, end, duration, decimals = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const startTime = Date.now();
    
    function updateValue() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (range * easeOut);
        
        if (decimals > 0) {
            element.textContent = current.toFixed(decimals);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    updateValue();
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function updateLegendForMode(mode) {
    const legend = document.querySelector('.legend');
    if (mode === 'population') {
        legend.style.opacity = '0.5';
    } else {
        legend.style.opacity = '1';
    }
}

function trackInteraction(event, data = {}) {
    // Analytics tracking for One Million Neighbours
    console.log('ConnectedKW Interaction:', event, data);
    
    if (window.gtag) {
        window.gtag('event', event, {
            event_category: 'ConnectedKW_Map',
            ...data
        });
    }
}

async function loadData() {
    try {
        // Show loading animation
        const loadingElement = document.getElementById('loading');
        loadingElement.style.display = 'flex';
        
        // Load the generated FSA analysis data
        const response = await fetch('../scripts/data/fsa_park_density_analysis.geojson');
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        
        const rawData = await response.json();
        
        // Filter to only show Kitchener-Waterloo FSAs
        fsaData = filterKitchenerWaterlooData(rawData);
        
        console.log(`Loaded ${fsaData.features.length} Kitchener-Waterloo FSAs`);
        
        // Add FSA layer to map with enhanced styling
        fsaLayer = L.geoJSON(fsaData, {
            style: getFeatureStyle,
            onEachFeature: onEachFeature
        }).addTo(map);
        
        // Fit map to filtered data bounds with padding
        const bounds = fsaLayer.getBounds();
        map.fitBounds(bounds, { padding: [20, 20] });
        
        // Update statistics with animation
        updateRegionalStats(fsaData);
        
        // Hide loading indicator with fade effect
        setTimeout(() => {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 300);
        }, 500);
        
        // Track successful load
        trackInteraction('map_loaded', { 
            fsaCount: fsaData.features.length,
            loadTime: Date.now()
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="error">
                <h3>⚠️ Error Loading Data</h3>
                <p>Failed to load ConnectedKW park equity data. Please check that the data file exists at:</p>
                <code>../scripts/data/fsa_park_density_analysis.geojson</code>
                <p style="margin-top: 1rem;"><strong>Error:</strong> ${error.message}</p>
                <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
        
        trackInteraction('map_load_error', { error: error.message });
    }
}

function highlightEquityLevel(equityLevel) {
    if (!fsaLayer) return;
    
    fsaLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const parksPerThousand = props.parksPerThousand || 0;
        const layerEquity = getEquityClass(parksPerThousand);
        
        if (layerEquity === equityLevel) {
            layer.setStyle({ 
                fillOpacity: 0.9, 
                opacity: 1,
                weight: 3,
                color: COLORS.highlight
            });
        } else {
            layer.setStyle({ fillOpacity: 0.2, opacity: 0.5 });
        }
    });
    
    // Auto-clear highlight after 3 seconds
    setTimeout(() => {
        if (fsaLayer) {
            fsaLayer.setStyle(getFeatureStyle);
            updateMapFilter();
        }
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('ConnectedKW Map initializing...'); 
    initMap();
    loadData();
    setupKeyboardControls();
    
    document.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', () => {
            const equity = item.getAttribute('data-equity');
            if (equity) {
                highlightEquityLevel(equity);
            }
        });
    });
    
    document.querySelectorAll('button').forEach(button => {
        if (!button.getAttribute('aria-label') && !button.getAttribute('title')) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
    
    trackInteraction('map_initialized');
    
    console.log('ConnectedKW Map ready!');
});

window.setViewMode = setViewMode;
window.toggleFilter = toggleFilter;
window.showStoryPath = showStoryPath;
window.nextStoryStep = nextStoryStep;
window.closeStoryMode = closeStoryMode;
window.resetMapView = resetMapView;
window.toggleFullscreen = toggleFullscreen;
window.exportMap = exportMap;
window.toggleShortcutsHelp = toggleShortcutsHelp;