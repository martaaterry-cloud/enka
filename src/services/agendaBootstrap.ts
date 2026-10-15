import { enkaRepository } from '../services/enka';
import { categoryTemplates, locationTemplates } from '../features/more/AgendaSetupSection';
import { suggestions } from '../features/more/SuggestedAgendaImport';

/**
 * Run only after authenticated user sign-in; never service-role SQL.
 * Existing cloud records are preserved. Invoked once per mounted authenticated provider;
 * repetitions are checked against user-owned rows, not a localStorage flag.
 */
let bootstrapInFlight: Promise<void> | null = null;
export function initializePersonalAgenda(): Promise<void> {
  if (!bootstrapInFlight) bootstrapInFlight = runPersonalAgendaBootstrap().finally(() => { bootstrapInFlight = null; });
  return bootstrapInFlight;
}

async function runPersonalAgendaBootstrap(): Promise<void> {
  const [catResponse, placeResponse, activityResponse] = await Promise.all([
    enkaRepository.fetchCategories(),
    enkaRepository.fetchLocations(),
    enkaRepository.fetchActivities()
  ]);
  if (catResponse.error || placeResponse.error || activityResponse.error ||
      !catResponse.data || !placeResponse.data || !activityResponse.data) {
    throw catResponse.error || placeResponse.error || activityResponse.error || new Error('No se pudo consultar la agenda.');
  }
  const categories = [...catResponse.data], locations = [...placeResponse.data], activities = [...activityResponse.data];
  for (const item of categoryTemplates) {
    if (categories.some(c => c.name.toLocaleLowerCase('es') === item.name.toLocaleLowerCase('es'))) continue;
    const created = await enkaRepository.createCategory({
      name: item.name, icon_name: item.icon_name, color: item.color,
      sort_order: categories.length, is_active: true
    });
    if (created.error || !created.data) throw created.error || new Error('No se pudo crear la categoría');
    categories.push(created.data);
  }
  for (const item of locationTemplates) {
    if (locations.some(c => c.name.toLocaleLowerCase('es') === item.name.toLocaleLowerCase('es'))) continue;
    const created = await enkaRepository.createLocation({
      ...item, country: 'España', region: item.city === 'San Vicente del Raspeig' ? 'Alicante' : 'Murcia',
      latitude: null, longitude: null, provider: null, provider_place_id: null,
      is_private: false, is_home_base: false, notes: null
    });
    if (created.error || !created.data) throw created.error || new Error('No se pudo guardar el lugar');
    locations.push(created.data);
  }
  for (const item of suggestions) {
    const prior = activities.find(a => a.metadata?.suggestion_key === item.key ||
        (a.title === item.payload.title && a.start_date === item.payload.start_date));
    if (prior) {
      // Update only known legacy match rows; keep user-edited title/time and other notes intact.
      if (item.payload.metadata?.match_venue && !prior.metadata?.match_venue) {
        const patched = await enkaRepository.updateActivity(prior.id, {
          metadata: { ...prior.metadata, match_venue: item.payload.metadata.match_venue,
            opponent: item.payload.metadata.opponent, kickoff_confirmed: item.payload.metadata.kickoff_confirmed,
            weekend_start: item.payload.metadata.weekend_start,
            weekend_end: item.payload.metadata.weekend_end }
        });
        if (patched.error) throw patched.error;
      }
      continue;
    }
    const title = item.payload.title;
    const category = /partido|balonmano|bullense/i.test(title) ? 'Balonmano' :
      /láser|dentista/i.test(title) ? 'Salud' : /graduación/i.test(title) ? 'Estudios' : 'Personal';
    const place = /graduación/i.test(title) ? 'Universidad de Alicante' :
      /bullense/i.test(title) && (item.payload.metadata?.match_venue === 'home') ? 'Pabellón Juan Valera' : null;
    const created = await enkaRepository.createActivity({
      ...item.payload,
      category_id: categories.find(c => c.name === category)?.id ?? null,
      location_id: locations.find(loc => loc.name === place)?.id ?? null,
      metadata: { ...item.payload.metadata, suggestion_key: item.key, source: 'enka-personal-agenda' }
    });
    if (created.error || !created.data) throw created.error || new Error('No se pudo guardar la cita');
    activities.push(created.data);
  }
}
