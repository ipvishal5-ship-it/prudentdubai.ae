export type DubaiArea = {
  name: string;
  summary: string;
  types: string[];
};

export type AreaGroup = {
  title: string;
  areas: DubaiArea[];
};

export type VisualArea = DubaiArea & {
  group: string;
  image: string;
  mood: string;
  fit: string;
  lat: number;
  lng: number;
  kmToDowntown: number;
};

export const AREA_PHOTOS = {
  tower: '/demo/dubai-tower.jpg',
  apartment: '/demo/city-apartment.jpg',
  villa: '/demo/villa-exterior.jpg',
  pool: '/demo/pool-villa.jpg',
  modern: '/demo/modern-villa.jpg',
  interior: '/demo/villa-interior.jpg',
} as const;

export const PROPERTY_TYPES = [
  { title: 'Apartments', filter: 'Apartment', image: AREA_PHOTOS.apartment, body: 'Studios to multi-bedroom homes in towers and mid-rise communities across Dubai.' },
  { title: 'Villas', filter: 'Villa', image: AREA_PHOTOS.villa, body: 'Detached and semi-detached family homes in master-planned and established neighbourhoods.' },
  { title: 'Townhouses', filter: 'Townhouse', image: AREA_PHOTOS.modern, body: 'Courtyard and linked homes suited to families who want more space with community amenities.' },
  { title: 'Penthouses', filter: 'Penthouse', image: AREA_PHOTOS.tower, body: 'Larger-format residences for buyers who prioritise space, outlook and premium finishes.' },
  { title: 'Off-plan', filter: '', image: AREA_PHOTOS.interior, body: 'New projects purchased before completion, often with staged payment schedules.' },
  { title: 'Ready property', filter: '', image: AREA_PHOTOS.pool, body: 'Completed homes and resale units where handover or transfer can happen sooner.' },
] as const;

export const GROUP_VISUALS: Record<string, { image: string; mood: string; line: string; short: string }> = {
  'Central & waterfront': { image: AREA_PHOTOS.tower, mood: 'Skyline & sea', line: 'Towers, marina walks and landmark addresses.', short: 'Waterfront' },
  'Family communities & villas': { image: AREA_PHOTOS.pool, mood: 'Parks & villas', line: 'Schools, golf, lagoons and quieter streets.', short: 'Family' },
  'Popular apartment districts': { image: AREA_PHOTOS.apartment, mood: 'City living', line: 'Daily convenience, metro access and mixed communities.', short: 'Apartments' },
  'Value & emerging districts': { image: AREA_PHOTOS.modern, mood: 'New chapters', line: 'Growing districts with a wider range of entry points.', short: 'Emerging' },
  'Established neighbourhoods': { image: AREA_PHOTOS.interior, mood: 'Settled streets', line: 'Older Dubai character and low-rise family pockets.', short: 'Established' },
};

export const BUYER_PURPOSES = [
  { title: 'Home to live in', body: 'School access, commute, building quality and long-term fit matter most.' },
  { title: 'Investment', body: 'Rental demand, service charges, handover timing and exit flexibility need a clear comparison.' },
] as const;

export const DUBAI_AREA_GROUPS: AreaGroup[] = [
  {
    title: 'Central & waterfront',
    areas: [
      { name: 'Downtown Dubai', summary: 'Landmark district with apartments, hospitality and strong visitor activity.', types: ['Apartment', 'Penthouse'] },
      { name: 'Business Bay', summary: 'Mixed residential and commercial district beside Downtown.', types: ['Apartment', 'Penthouse'] },
      { name: 'Dubai Marina', summary: 'Established waterfront apartment district with marina lifestyle.', types: ['Apartment', 'Penthouse'] },
      { name: 'Jumeirah Beach Residence (JBR)', summary: 'Beach-facing apartments with walkable dining and leisure.', types: ['Apartment'] },
      { name: 'Palm Jumeirah', summary: 'Iconic island community with apartments, townhouses and signature villas.', types: ['Apartment', 'Villa', 'Townhouse'] },
      { name: 'Bluewaters Island', summary: 'Compact waterfront community with apartment living.', types: ['Apartment'] },
      { name: 'Dubai Creek Harbour', summary: 'Growing waterfront master plan with apartments and larger residences.', types: ['Apartment', 'Penthouse'] },
      { name: 'Dubai Islands', summary: 'Emerging island development with new residential supply.', types: ['Apartment', 'Villa', 'Townhouse'] },
      { name: 'Emaar Beachfront', summary: 'Beachfront towers between Marina and Palm Jumeirah.', types: ['Apartment'] },
    ],
  },
  {
    title: 'Family communities & villas',
    areas: [
      { name: 'Dubai Hills Estate', summary: 'Large master-planned area with apartments, townhouses and villas.', types: ['Apartment', 'Villa', 'Townhouse'] },
      { name: 'Arabian Ranches', summary: 'Established villa community with schools, parks and mature landscaping.', types: ['Villa', 'Townhouse'] },
      { name: 'DAMAC Hills', summary: 'Golf-community setting with villas, townhouses and apartments.', types: ['Villa', 'Townhouse', 'Apartment'] },
      { name: 'DAMAC Hills 2', summary: 'Value-oriented villa and townhouse community with varied phases.', types: ['Villa', 'Townhouse'] },
      { name: 'DAMAC Lagoons', summary: 'Mediterranean-themed villa and townhouse community.', types: ['Villa', 'Townhouse'] },
      { name: 'DAMAC Islands', summary: 'Newer island-style villa community with phased delivery.', types: ['Villa', 'Townhouse'] },
      { name: 'The Springs', summary: 'Townhouse community known for greenery and family living.', types: ['Townhouse'] },
      { name: 'The Meadows', summary: 'Low-rise villa community with lakes and landscaped streets.', types: ['Villa'] },
      { name: 'The Lakes', summary: 'Established villa neighbourhood with mature community feel.', types: ['Villa'] },
      { name: 'Emirates Hills', summary: 'Ultra-premium villa district with large plot homes.', types: ['Villa'] },
      { name: 'Tilal Al Ghaf', summary: 'Lagoon-focused master community with villas and townhouses.', types: ['Villa', 'Townhouse'] },
      { name: 'The Valley', summary: 'Emaar townhouse and villa community with phased releases.', types: ['Villa', 'Townhouse'] },
      { name: 'Town Square', summary: 'Affordable townhouse and apartment community in Dubailand.', types: ['Townhouse', 'Apartment'] },
    ],
  },
  {
    title: 'Popular apartment districts',
    areas: [
      { name: 'Jumeirah Village Circle (JVC)', summary: 'Large mixed community with varied developers and building standards.', types: ['Apartment', 'Townhouse'] },
      { name: 'Jumeirah Village Triangle (JVT)', summary: 'Residential district with townhouses and low-rise apartment options.', types: ['Apartment', 'Townhouse'] },
      { name: 'Jumeirah Lake Towers (JLT)', summary: 'Cluster-tower district popular with residents and professionals.', types: ['Apartment'] },
      { name: 'Al Furjan', summary: 'Transit-connected community with apartments, townhouses and villas.', types: ['Apartment', 'Townhouse', 'Villa'] },
      { name: 'Dubai Silicon Oasis', summary: 'Tech-focused free zone with apartments and family townhouses.', types: ['Apartment', 'Townhouse'] },
      { name: 'Dubai Sports City', summary: 'Sports-themed community with apartments and villas.', types: ['Apartment', 'Villa'] },
      { name: 'Motor City', summary: 'Established community with apartments and townhouses.', types: ['Apartment', 'Townhouse'] },
      { name: 'Arjan', summary: 'Growing mid-rise district with newer apartment supply.', types: ['Apartment'] },
      { name: 'City Walk', summary: 'Urban mixed-use district with premium apartment living.', types: ['Apartment'] },
      { name: 'Mohammed Bin Rashid City', summary: 'Large district including District One, Sobha Hartland and surrounding phases.', types: ['Apartment', 'Villa', 'Townhouse'] },
      { name: 'Meydan', summary: 'Central location with apartments and villa products in surrounding phases.', types: ['Apartment', 'Villa', 'Townhouse'] },
      { name: 'DIFC', summary: 'Financial-centre district with premium apartment stock.', types: ['Apartment', 'Penthouse'] },
    ],
  },
  {
    title: 'Value & emerging districts',
    areas: [
      { name: 'Dubai South', summary: 'Airport-corridor city with apartments, townhouses and villa phases.', types: ['Apartment', 'Townhouse', 'Villa'] },
      { name: 'Expo City Dubai', summary: 'Repurposed Expo district with residential and mixed-use phases.', types: ['Apartment'] },
      { name: 'Discovery Gardens', summary: 'Established affordable apartment community near Ibn Battuta.', types: ['Apartment'] },
      { name: 'International City', summary: 'Large apartment district with varied building ages and themes.', types: ['Apartment'] },
      { name: 'Dubai Production City (IMPZ)', summary: 'Mid-market apartment district with newer tower supply.', types: ['Apartment'] },
      { name: 'Dubai Land Residence Complex', summary: 'Affordable apartment cluster with multiple sub-communities.', types: ['Apartment'] },
      { name: 'Majan', summary: 'Emerging residential district with newer apartment projects.', types: ['Apartment'] },
      { name: 'Liwan', summary: 'Affordable apartment community in Dubailand.', types: ['Apartment'] },
      { name: 'Dubailand', summary: 'Broad district with multiple villa, townhouse and apartment sub-communities.', types: ['Apartment', 'Villa', 'Townhouse'] },
    ],
  },
  {
    title: 'Established neighbourhoods',
    areas: [
      { name: 'Jumeirah', summary: 'Established coastal district with villas and low-rise homes.', types: ['Villa', 'Townhouse'] },
      { name: 'Umm Suqeim', summary: 'Residential coastal area with villas and larger homes.', types: ['Villa'] },
      { name: 'Al Barsha', summary: 'Central district with apartments near Mall of the Emirates.', types: ['Apartment', 'Villa'] },
      { name: 'Al Sufouh', summary: 'Coastal corridor including media-city apartment districts.', types: ['Apartment'] },
      { name: 'Deira', summary: 'Historic commercial and residential district with older building stock.', types: ['Apartment'] },
      { name: 'Bur Dubai', summary: 'Central district with apartments and established urban living.', types: ['Apartment'] },
      { name: 'Mirdif', summary: 'Family-oriented district with villas and low-rise homes.', types: ['Villa', 'Townhouse'] },
      { name: 'Al Mizhar', summary: 'Residential villa district in eastern Dubai.', types: ['Villa'] },
    ],
  },
];

export const ALL_DUBAI_AREAS = DUBAI_AREA_GROUPS.flatMap((group) => group.areas);

export const DOWNTOWN = { lat: 25.1972, lng: 55.2744 };

export const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  'Downtown Dubai': { lat: 25.1972, lng: 55.2744 },
  'Business Bay': { lat: 25.1853, lng: 55.2646 },
  'Dubai Marina': { lat: 25.0805, lng: 55.1403 },
  'Jumeirah Beach Residence (JBR)': { lat: 25.0782, lng: 55.1336 },
  'Palm Jumeirah': { lat: 25.1124, lng: 55.1390 },
  'Bluewaters Island': { lat: 25.0788, lng: 55.1214 },
  'Dubai Creek Harbour': { lat: 25.2068, lng: 55.3442 },
  'Dubai Islands': { lat: 25.2780, lng: 55.3250 },
  'Emaar Beachfront': { lat: 25.0894, lng: 55.1278 },
  'Dubai Hills Estate': { lat: 25.1097, lng: 55.2453 },
  'Arabian Ranches': { lat: 25.0514, lng: 55.2706 },
  'DAMAC Hills': { lat: 25.0274, lng: 55.2471 },
  'DAMAC Hills 2': { lat: 24.9920, lng: 55.2018 },
  'DAMAC Lagoons': { lat: 25.0112, lng: 55.2315 },
  'DAMAC Islands': { lat: 25.0188, lng: 55.2184 },
  'The Springs': { lat: 25.0554, lng: 55.1642 },
  'The Meadows': { lat: 25.0703, lng: 55.1551 },
  'The Lakes': { lat: 25.0786, lng: 55.1624 },
  'Emirates Hills': { lat: 25.0698, lng: 55.1720 },
  'Tilal Al Ghaf': { lat: 25.0146, lng: 55.2108 },
  'The Valley': { lat: 24.9815, lng: 55.2810 },
  'Town Square': { lat: 25.0018, lng: 55.2912 },
  'Jumeirah Village Circle (JVC)': { lat: 25.0594, lng: 55.2093 },
  'Jumeirah Village Triangle (JVT)': { lat: 25.0478, lng: 55.1904 },
  'Jumeirah Lake Towers (JLT)': { lat: 25.0693, lng: 55.1442 },
  'Al Furjan': { lat: 25.0268, lng: 55.1479 },
  'Dubai Silicon Oasis': { lat: 25.1221, lng: 55.3784 },
  'Dubai Sports City': { lat: 25.0398, lng: 55.2184 },
  'Motor City': { lat: 25.0476, lng: 55.2372 },
  'Arjan': { lat: 25.0602, lng: 55.2476 },
  'City Walk': { lat: 25.2074, lng: 55.2628 },
  'Mohammed Bin Rashid City': { lat: 25.1796, lng: 55.3104 },
  'Meydan': { lat: 25.1558, lng: 55.3021 },
  'DIFC': { lat: 25.2108, lng: 55.2796 },
  'Dubai South': { lat: 24.8904, lng: 55.1612 },
  'Expo City Dubai': { lat: 24.9633, lng: 55.1502 },
  'Discovery Gardens': { lat: 25.0412, lng: 55.1448 },
  'International City': { lat: 25.1642, lng: 55.4081 },
  'Dubai Production City (IMPZ)': { lat: 25.0269, lng: 55.1904 },
  'Dubai Land Residence Complex': { lat: 25.0904, lng: 55.3802 },
  'Majan': { lat: 25.1254, lng: 55.3751 },
  'Liwan': { lat: 25.1102, lng: 55.3654 },
  'Dubailand': { lat: 25.0780, lng: 55.3220 },
  'Jumeirah': { lat: 25.2060, lng: 55.2480 },
  'Umm Suqeim': { lat: 25.1572, lng: 55.2096 },
  'Al Barsha': { lat: 25.1112, lng: 55.2024 },
  'Al Sufouh': { lat: 25.1064, lng: 55.1721 },
  'Deira': { lat: 25.2691, lng: 55.3095 },
  'Bur Dubai': { lat: 25.2534, lng: 55.2972 },
  'Mirdif': { lat: 25.2194, lng: 55.4231 },
  'Al Mizhar': { lat: 25.2452, lng: 55.4504 },
};

function kmToDowntown(lat: number, lng: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(DOWNTOWN.lat - lat);
  const dLng = toRad(DOWNTOWN.lng - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(DOWNTOWN.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function photoFor(area: DubaiArea, group: string, index: number) {
  const photos = area.types.includes('Villa')
    ? [AREA_PHOTOS.villa, AREA_PHOTOS.pool, AREA_PHOTOS.modern]
    : area.types.includes('Townhouse')
      ? [AREA_PHOTOS.modern, AREA_PHOTOS.interior, AREA_PHOTOS.villa]
      : group.startsWith('Central')
        ? [AREA_PHOTOS.tower, AREA_PHOTOS.apartment, AREA_PHOTOS.pool]
        : [AREA_PHOTOS.apartment, AREA_PHOTOS.tower, AREA_PHOTOS.interior];
  return photos[index % photos.length];
}

function moodFor(group: string, types: string[]) {
  if (types.includes('Villa') && types.includes('Apartment')) return 'Mixed living';
  if (types.includes('Villa')) return 'Villa living';
  if (types.includes('Townhouse')) return 'Family streets';
  if (types.includes('Penthouse')) return 'Landmark living';
  return GROUP_VISUALS[group]?.mood ?? 'City living';
}

function fitFor(group: string, types: string[]) {
  if (group.startsWith('Central')) return 'Waterfront & city';
  if (group.startsWith('Family')) return 'Space & schools';
  if (group.startsWith('Value')) return 'Flexible entry';
  if (group.startsWith('Established')) return 'Quiet neighbourhoods';
  if (types.includes('Villa')) return 'Home first';
  return 'Apartment lifestyle';
}

export const VISUAL_AREAS: VisualArea[] = DUBAI_AREA_GROUPS.flatMap((group) =>
  group.areas.map((area, index) => {
    const point = AREA_COORDS[area.name] ?? DOWNTOWN;
    return {
      ...area,
      group: group.title,
      image: photoFor(area, group.title, index),
      mood: moodFor(group.title, area.types),
      fit: fitFor(group.title, area.types),
      lat: point.lat,
      lng: point.lng,
      kmToDowntown: kmToDowntown(point.lat, point.lng),
    };
  }),
);

export const FEATURED_DESTINATIONS = [
  'Downtown Dubai',
  'Dubai Marina',
  'Palm Jumeirah',
  'Business Bay',
  'Dubai Hills Estate',
  'Jumeirah Village Circle (JVC)',
  'Dubai Creek Harbour',
  'Arabian Ranches',
].map((name) => VISUAL_AREAS.find((area) => area.name === name)).filter((area): area is VisualArea => Boolean(area));

export const TYPE_FILTERS = ['Apartment', 'Villa', 'Townhouse', 'Penthouse'] as const;
