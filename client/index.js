/* eslint-disable prefer-destructuring */
import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup } from './lib/map';

async function processLink(link) {
  const url = new URL(link);
  const params = url.searchParams;
  const type = params.get('type');
  const period = params.get('period');
  const data = await fetchEarthquakes(type, period);

  return { data, period };
}

function formatTime(period) {
  let quakeTime = '';
  switch (period) {
    case 'month':
      quakeTime = 'seinasta mánuð';
      break;
    case 'week':
      quakeTime = 'seinustu viku';
      break;
    case 'day':
      quakeTime = 'seinasta dag';
      break;
    case 'hour':
      quakeTime = 'seinustu klukkustund';
      break;
    default:
      quakeTime = '';
  }
  return quakeTime;
}

function formatInfo(info) {
  let infoString = '';
  if (info.cached) infoString += 'Gögn eru í cache. ';
  else infoString += 'Gögn eru ekki í cache. ';
  infoString += `Fyrirspurn tók ${info.elapsed} sek.`;
  return infoString;
}
function processQuakes(ul, quakeType, period, earthquakes, info) {
  // remove previous earthquake info
  while (ul.firstChild) {
    ul.removeChild(ul.lastChild);
  }

  // remove previous markers from map
  const mapContainer = document.querySelector('.leaflet-marker-pane');
  const shadowContainer = document.querySelector('.leaflet-shadow-pane');
  if (mapContainer) {
    while (mapContainer.firstChild) {
      mapContainer.removeChild(mapContainer.lastChild);
    }
  }

  if (shadowContainer) {
    while (shadowContainer.firstChild) {
      shadowContainer.removeChild(shadowContainer.lastChild);
    }
  }


  const quakeTime = formatTime(period);

  const header = element('h1', null, null, `${quakeType}, ${quakeTime}`);

  const infoString = formatInfo(info);
  const infoEl = element('h3', null, null, `${infoString}`);

  ul.appendChild(header);
  ul.appendChild(infoEl);
  earthquakes.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // TODO
  // Bæta við virkni til að sækja úr lista
  // Nota proxy
  // Hreinsa header og upplýsingar þegar ný gögn eru sótt
  // Sterkur leikur að refactora úr virkni fyrir event handler í sér fall

  // const loading = document.querySelector('.loading');
  // const parent = loading.parentNode;
  // parent.removeChild(loading);

  // if (!earthquakes) {
  //   parent.appendChild(
  //     el('p', 'Villa við að sækja gögn'),
  //   );
  // }
  let earthquakes;

  const ul = document.querySelector('.earthquakes');
  const map = document.querySelector('.map');

  const links = document.querySelectorAll('.list ul a');

  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      earthquakes = await processLink(link);

      const period = earthquakes.period;
      earthquakes = earthquakes.data;
      processQuakes(ul, link.innerHTML, period, earthquakes.data.features, earthquakes.info);
    });
  });

  init(map);
});
