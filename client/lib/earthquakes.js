export async function fetchEarthquakes(type, period) {
  // TODO sækja gögn frá proxy þjónustu
  let result = '';

  const url = new URL('/proxy', window.location);
  url.searchParams.append('type', type);
  url.searchParams.append('period', period);

  try {
    result = await fetch(url.href);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();
  console.log('fetched earthquakes', data);

  return data;
}
