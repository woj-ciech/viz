// script.js

const PARTY_COLORS = {
  "Prawo i Sprawiedliwość": "#3b82f6",
  "Platforma Obywatelska": "#e11d48",
  "Kukiz'15": "#ff00cd",
  "Polskie Stronnictwo Ludowe": "#22c55e",
  "Other": "#f59e0b"
};

// === UTILS ===
function varAccent(){
  return getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#38bdf8';
}

// === TOP COUNTERS (animate on load) ===
function animateCounters() {
  const counters = document.querySelectorAll("#global-stats .stat p");
  if (!counters.length) return;
  counters.forEach(el => {
    const target = +el.textContent;
    let count = 0;
    const step = Math.max(1, Math.floor(target / 100));
    el.textContent = "0";
function update(timestamp){
  const progress = Math.min(1, (timestamp - startTime) / 3000); // 3s
  const eased = progress < 1 ? Math.pow(progress, 0.6) : 1; // easing curve
  el.textContent = Math.floor(target * eased);
  if (progress < 1) requestAnimationFrame(update);
  else el.textContent = target;
}
let startTime = performance.now();
requestAnimationFrame(update);
  });
}

// === PKD BAR CHART (stacked) ===
function renderBarChart() {
  if (window._pkdRendered) return;
  window._pkdRendered = true;

  const svg = d3.select("#pkd-chart"),
        margin = { top: 40, right: 40, bottom: 160, left: 90 },
        width = 1400 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleBand().range([0, width]).padding(0.25);
  const y = d3.scaleLinear().range([height, 0]);
  const color = d3.scaleOrdinal()
  .domain(Object.keys(PARTY_COLORS))
  .range(Object.values(PARTY_COLORS));

  const xAxisG = g.append("g").attr("transform", `translate(0,${height})`);
  const yAxisG = g.append("g");

  // Tooltip element (once)
  let tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "tooltip");
  }

  let DATA, MODE = "current";

function buildLegends(parties, stackedData) {
    const partyHtml = parties.map(p =>
      `<li><span style="color:${color(p)}">■</span> ${p}</li>`
    ).join("");
    const pkdHtml = stackedData.map(d =>
      `<li><strong>${d.kod_pkd}</strong> – ${
        d.opis_pkd && d.opis_pkd.length > 70 ? d.opis_pkd.slice(0,70) + "…" : (d.opis_pkd || "")
      }</li>`
    ).join("");

    d3.select("#bar-legend").html(`
      <div class="legend-block">
        <h3>Parties</h3>
        <ul class="legend-list parties">${partyHtml}</ul>
      </div>
      <div class="legend-block">
        <h3>PKD Codes</h3>
        <ul class="legend-list pkd">${pkdHtml}</ul>
      </div>
    `);
  }

  function update(mode) {
    MODE = mode;
    d3.selectAll(".btn").classed("active", false);
    d3.select(`#btn-${mode}`).classed("active", true);

    const parties = Array.from(new Set(DATA.flatMap(d => d[mode] ? Object.keys(d[mode]) : [])));
    if (!parties.length) {
      console.warn("No parties found for mode:", mode);
      return;
    }

    const stackedData = DATA.map(d => {
      const row = { kod_pkd: d.kod_pkd, opis_pkd: d.opis_pkd };
      parties.forEach(p => row[p] = (d[mode] && d[mode][p]) ? d[mode][p] : 0);
      return row;
    });

    stackedData.sort((a, b) => d3.sum(parties, p => b[p]) - d3.sum(parties, p => a[p]));
    x.domain(stackedData.map(d => d.kod_pkd));

    const maxValue = d3.max(stackedData, d => d3.sum(parties, p => d[p]));
    y.domain([0, maxValue]).nice();
    color.domain(parties);

    // Axes
    xAxisG.transition().duration(800)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("fill", "#eee")
      .style("font-size", "12px");

    yAxisG.transition().duration(800)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", "#eee")
      .style("font-size", "12px");

    // Stack and draw bars
    const stack = d3.stack().keys(parties)(stackedData);
    const groups = g.selectAll(".layer").data(stack, d => d.key);

    const groupsEnter = groups.enter().append("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));

    const merged = groupsEnter.merge(groups);

    const rects = merged.selectAll("rect")
      .data(d => d.map(v => ({ ...v, key: d.key })));

    rects.join(
  enter => enter.append("rect")
    .attr("x", d => x(d.data.kod_pkd))
    .attr("width", x.bandwidth())
    .attr("y", y(0))
    .attr("height", 0)
    .attr("opacity", 0)
    .attr("transform", "translate(0,20)") // slight drop before appear
    .transition()
    .delay((d, i) => i * 70) // staggered reveal
    .duration(1200)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("opacity", 1)
    .attr("transform", "translate(0,0)")
    .on("end", function() {
      d3.select(this).classed("visible", true);
    }),

  update => update.transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("x", d => x(d.data.kod_pkd))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1])),

  exit => exit.transition()
    .duration(400)
    .ease(d3.easeCubicIn)
    .attr("opacity", 0)
    .attr("y", y(0))
    .attr("height", 0)
    .remove()
);

    // ✅ Tooltip handlers (added here)
    const barsSelection = g.selectAll(".layer").selectAll("rect");
    barsSelection
      .on('mouseover', function (ev, d) {
    // Reset all bars to base opacity first
    barsSelection.style('opacity', 0.15).style('filter', 'none').style('stroke-width', 0.6);

    // Highlight the hovered bar
    d3.select(this)
      .style('opacity', 1)
      .style('stroke-width', 1.5)
      .style('filter', 'drop-shadow(0 0 6px rgba(255,255,255,0.6))');

    // Show tooltip
    tooltip
      .style('opacity', 1)
      .html(`${(() => {
  const value = (d[1] - d[0]);
  const party = d.key;
  const pkd = d.data?.kod_pkd || "";
  const opis = d.data?.opis_pkd || "";
  return `
    <div><strong>${party}</strong></div>
    <div>Wartość: <strong>${value}</strong></div>
    ${opis ? `<div style="opacity:0.8;margin-top:4px;">${opis}</div>` : ""}
  `;
})()}`)
      .style('left', Math.min(ev.pageX + 5, window.innerWidth - 340) + 'px')
      .style('top', (ev.pageY - 40) + 'px');
  })
  .on('mousemove', (ev) => {
    tooltip
      .style('left', Math.min(ev.pageX + 5, window.innerWidth - 340) + 'px')
      .style('top', (ev.pageY - 40) + 'px');
  })
  .on('mouseleave', function () {
    // Restore all bars
    barsSelection
      .style('opacity', 1)
      .style('stroke-width', 0.6)
      .style('filter', 'none');

    tooltip.transition().duration(150).style('opacity', 0);
  });

    buildLegends(parties, stackedData);
  }

  // Load data and initialize chart
  d3.json("pkd_barchart.json").then(json => {
    if (!json || !json.length) {
      console.error("pkd_barchart.json not found or empty");
      return;
    }
    DATA = json.slice(0, 15); // limit for clarity
    update("current");

    d3.select(".btn-container").style("display", "flex");
    d3.select("#btn-current").on("click", () => update("current"));
    d3.select("#btn-historical").on("click", () => update("historical"));
  });
}

// === TIMELINE (replace companies timeline) ===
let TL = { data: [], people: [], color: null, x: null, y: null, svg: null, g: null, margin: {top:40, right:40, bottom:60, left:40} };

function renderCompanies() { // draws the new timeline once
  if (TL.svg) return;

  const el = d3.select('#companies');
  const w = el.node().clientWidth,
        h = el.node().clientHeight || Math.round(window.innerHeight * 0.7);

  TL.svg = el.append('svg').attr('viewBox', [0, 0, w, h]);
  TL.g   = TL.svg.append('g').attr('class', 'tl-main');

  TL.x = d3.scaleTime().range([TL.margin.left, w - TL.margin.right]);
  TL.y = d3.scaleBand().padding(0.25).range([TL.margin.top, h - TL.margin.bottom]);

  // Tooltip (single instance)
  let tooltip = d3.select('#tl-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('id', 'tl-tooltip')
      .attr('class', 'tl-tooltip');
  }

  d3.json("timeline.json").then(raw => {
    const parseDate = d3.timeParse("%Y-%m-%d");
    const today = new Date();

    TL.data = (raw || [])
      .filter(d => d.data_start)
      .map(d => ({
        ...d,
        start: parseDate(d.data_start),
        end: d.data_koniec ? parseDate(d.data_koniec) : today,
        ongoing: !d.data_koniec
      }));

    TL.people = Array.from(new Set(TL.data.map(d => d.person))).filter(Boolean);
    const colors = [
  ...d3.schemeTableau10,
  ...d3.schemeSet3,
].map(c => d3.color(c).brighter(0.5));

TL.color = d3.scaleOrdinal(colors).domain(TL.people);


    TL.x.domain([d3.min(TL.data, d => d.start), d3.max(TL.data, d => d.end)]);
    TL.y.domain(TL.people);

    TL.g.selectAll("*").remove();



    // === X Axis (years) ===
    TL.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${h - TL.margin.bottom})`)
      .style('opacity', 0)
      .call(d3.axisBottom(TL.x).tickFormat(d3.timeFormat("%Y")))
      .selectAll("text").style("fill", "#ccc");

    // Fade-in for axis
    TL.g.select(".x.axis")
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .style('opacity', 1);

    // === Timeline Bars ===
const barH = Math.max(6, TL.y.bandwidth() * 1.5); // thicker bars


    TL.g.selectAll('.tl-bar')
      .data(TL.data)
      .enter().append('rect')
        .attr('class', 'tl-bar')
        .attr('x', d => TL.x(d.start))
        .attr('y', d => TL.y(d.person) + (TL.y.bandwidth() - barH) / 2)
        .attr('width', d => Math.max(2, TL.x(d.end) - TL.x(d.start)))
        .attr('height', barH)
.attr('fill', d => TL.color(d.person))
.attr('stroke', '#000')
.attr('stroke-width', 0.5)
.style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))')
.style('opacity', 0.95)
        .attr('transform', 'translate(0,20)')
        .transition()
        .delay((d, i) => i * 8)
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)
        .attr('transform', 'translate(0,0)');


const bars = TL.g.selectAll('.tl-bar');

bars
  .on('mouseover', function (ev, d) {
    // Highlight hovered bar
    bars.transition().duration(150)
      .style('opacity', b => (b === d ? 1 : 0.15));  // grey out others

    d3.select(this)
      .raise()
      .transition().duration(150)
      .style('stroke-width', 1.5)
      .style('filter', 'drop-shadow(0 0 6px rgba(255,255,255,0.6))');

    tooltip
      .style('opacity', 1)
      .html(`
        <div><strong>${d.person || ""}</strong> ${d.party ? `(${d.party})` : ""}</div>
        <div><em>${d.company || ""}</em></div>
        <div>PKD ${d.kod_pkd || ""}: ${d.opis_pkd || ""}</div>
        <div><strong>${d.data_start || ""}</strong> → ${d.data_koniec || "<strong>Obecnie</strong>"}</div>
      `)
      .style('left', Math.min(ev.pageX + 20, window.innerWidth - 340) + 'px')
      .style('top', (ev.pageY - 40) + 'px');
  })
  .on('mousemove', ev => {
    tooltip
      .style('left', Math.min(ev.pageX + 20, window.innerWidth - 340) + 'px')
      .style('top', (ev.pageY - 40) + 'px');
  })
  .on('mouseleave', function () {
    // Reset everything immediately when leaving a bar
    bars.transition().duration(200)
      .style('opacity', 1)
      .style('stroke-width', 0.6)
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))');

    tooltip.transition().duration(150).style('opacity', 0);
  });

// Optional: fallback if user leaves the SVG completely
TL.svg.on('mouseleave', () => {
  bars.transition().duration(300)
    .style('opacity', 1)
    .style('stroke-width', 0.6)
    .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))');
  tooltip.transition().duration(150).style('opacity', 0);
});


    // track scroll position to suppress tooltip visibility on scroll
    TL.lastScrollTop = window.scrollY;
    window.addEventListener('scroll', () => {
      TL.lastScrollTop = window.scrollY;
      tooltip.style('opacity', 0); // hide tooltip while scrolling
    });
  });
}





function highlightTimeline(person) {
  if (!TL.g) return;
  const bars = TL.g.selectAll('.tl-bar');
  const tooltip = d3.select('#tl-tooltip');

  // Always hide tooltip while scrolling or programmatic highlight
  tooltip.transition().duration(150).style('opacity', 0);

  if (!person) {
    bars.transition().duration(350).style('opacity', 1);
    return;
  }

  // Highlight bars only (no tooltip)
  bars.transition().duration(350)
    .style('opacity', d => d.person === person ? 1 : 0.15);
}

function setTimelineCaption(stepIndex, person){
  if (!person) return;
  const rec = TL.data.find(d => d.person === person);
  if (!rec) return;

  const html = `
    <h2>${rec.person}</h2>
    <p><strong>${rec.party || "—"}</strong> — <em>${rec.company || "—"}</em><br>
    PKD ${rec.kod_pkd || ""}: ${rec.opis_pkd || ""}<br>
    <strong>${rec.data_start || ""}</strong> → ${rec.data_koniec || "Obecnie"}</p>
  `;
  const box = document.querySelector(`#tl-cap-${stepIndex}`);
 if (box) {
  box.innerHTML = html;
  box.style.opacity = 0;
  box.style.transform = "translateX(-80px)";
  box.style.transition = "all 0.6s ease";

  requestAnimationFrame(() => {
    box.style.opacity = 1;
    box.style.transform = "translateX(0)";
  });
}
}

// === MAP ===
// === MAP (new: dark basemap + random point zoom on steps 2 & 3) ===
let MAP = {
  map: null,
  markers: [],
  target: null,        // {lat, lon, marker}
  loaded: false
};

function renderMap(){
  if (MAP.map) return;

  const mapContainer = document.getElementById('map-container');
  if (mapContainer) mapContainer.classList.add('visible');

  MAP.map = L.map('mapid', { scrollWheelZoom: false }).setView([52.0, 19.0], 6);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    subdomains: "abcd",
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | © OpenStreetMap contributors'
  }
).addTo(MAP.map || MAP.instance);

  d3.json("loca.json").then(rows => {
    if (!rows || !rows.length) return;

    // Loop over each row directly
    rows.forEach(r => {
      const party = r.party && r.party.trim() ? r.party : "Other";
      const color = partyColor(party);

      const popupHtml = `
        <div style="background:#111827;color:#e5e7eb;padding:10px 12px;border-radius:8px;max-width:280px;line-height:1.4;">
          <h4 style="margin:0 0 6px;font-size:14px;color:#38bdf8;">${r.company || "—"}</h4>
          <div style="font-size:13px;margin-bottom:4px;">
            <strong style="color:${color}">${party}</strong>
          </div>
          <div style="font-size:13px;">
            <strong>Person:</strong> ${r.person || "—"}
          </div>
          <div style="font-size:12px;opacity:0.8;margin-top:4px;">
            ${r.city || ""} ${r.postal_code || ""}, ${r.street || ""} ${r.house_no || ""}
          </div>
        </div>
      `;

      const marker = L.circleMarker([r.lat, r.lon], {
        radius: 8,
        color: color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 1
      }).bindPopup(popupHtml, { maxWidth: 320 });

      marker.addTo(MAP.map);
      MAP.markers.push(marker);
    });

    // === Legend ===
    if (!MAP.legend) {
  MAP.legend = L.control({ position: "bottomright" });
  MAP.legend.onAdd = function () {
    const div = L.DomUtil.create("div");
    div.id = "map-legend";  // assign explicit ID
    div.innerHTML = `
      <div class="legend-box">
        <strong>Parties</strong><br>
        ${Object.entries(PARTY_COLORS).map(([p,c]) =>
          `<div style="margin:3px 0;">
             <span style="display:inline-block;width:14px;height:14px;background:${c};margin-right:6px;border-radius:50%;"></span>${p}
           </div>`
        ).join("")}
      </div>
    `;
    return div;
  };

  MAP.legend.addTo(MAP.map);
    fitAll();
MAP.ready = true;
console.log("✅ Map fully ready with", MAP.markers.length, "markers");
}
  });
}

function partyColor(party){
  return PARTY_COLORS[party] || PARTY_COLORS["Other"];
}
function hashCode(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0;} return h; }
function radiusForCount(n){ return Math.max(6, Math.sqrt(n) * 3.5); }

function dominantParty(group){
  const ex = Array.isArray(group.examples) ? group.examples : [];
  const tally = {};
  ex.forEach(e => {
    const p = (e && e.party) ? e.party.trim() : "Other";
    tally[p] = (tally[p] || 0) + 1;
  });
  const [winner] = Object.entries(tally).sort((a,b)=>b[1]-a[1])[0] || ["Other"];
  return winner;
}

function partyColor(party){
  const map = {
    "Prawo i Sprawiedliwość": "#e11d48",
    "Platforma Obywatelska": "#3b82f6",
    "Kukiz'15": "#000000",
    "Polskie Stronnictwo Ludowe": "#22c55e",
    "Lewica": "#9333ea",
    "Other": "#f59e0b"
  };
  return map[party] || map["Other"];
}

function popupHTML(group, party){
  const examples = (group.examples || []).slice(0, 5);
  const companies = examples.map(e => e.company).filter(Boolean);
  const people = examples.map(e => e.person).filter(Boolean);

  return `
    <div style="background:#111827;color:#e5e7eb;padding:10px 12px;border-radius:8px;max-width:280px;line-height:1.4;">
      <h4 style="margin:0 0 6px;font-size:14px;color:#38bdf8;">${group.city || "Location"}</h4>
      <div style="font-size:13px;margin-bottom:6px;">
        <strong style="color:${partyColor(party)}">${party}</strong>
      </div>
      ${companies.length ? `<div style="font-size:13px;margin-bottom:4px;"><strong>Company:</strong> ${companies[0]}</div>` : ""}
      ${people.length ? `<div style="font-size:13px;"><strong>People:</strong> ${people.join(", ")}</div>` : ""}
    </div>
  `;
}
// Actions for scroll steps
function fitAll() {
  // Ensure map and markers exist
  if (!MAP.map || !Array.isArray(MAP.markers) || MAP.markers.length === 0) return;

  // Extract only valid coordinates
  const coords = MAP.markers
    .map(m => {
      const lat = +m.lat ?? +m.getLatLng?.().lat;
      const lon = +m.lon ?? +m.getLatLng?.().lng;
      return (!isNaN(lat) && !isNaN(lon)) ? [lat, lon] : null;
    })
    .filter(Boolean); // remove invalid pairs

}

function getLeafletMap() {
  return MAP.instance || MAP.map || MAP; // find the valid map reference
}

function zoomToRandomModerate(marker) {
  const map = getLeafletMap();
  if (!map || typeof map.setView !== "function") {
    console.warn("⚠️ Map instance not found in zoomToRandomModerate");
    return;
  }
  const pos = marker.getLatLng();
  map.setView(pos, 9, { animate: true }); // moderate zoom
}

function zoomToRandomClose(marker, options = {}) {
  const map = getLeafletMap();
  if (!map || typeof map.setView !== "function") {
    console.warn("⚠️ Map instance not found in zoomToRandomClose");
    return;
  }
  const pos = marker.getLatLng();
  const zoomLevel = options.extraZoom ? 13 : 11;
  // make it satellite 3d
  map.setView(pos, 18, { animate: true });
  if (marker.openPopup) marker.openPopup();
}


function renderNetworkGraph() {
  const host = document.getElementById('network-graphic');
  if (!host) return;
  if (host.dataset.rendered === "1") return; // only once
  host.dataset.rendered = "1";

  // === Setup legend content ===
  const legendBox = document.getElementById("network-legend");
  if (legendBox) {
    legendBox.innerHTML = `
      <h3>Legend</h3>
      <div><span class="legend-icon">👤</span> Osoba</div>
      <div><span class="legend-icon">⭐</span> Osoba główna</div>
      <div><span class="legend-icon">🏢</span> Organizacja</div>
<div class="legend-toggle"><label><input type="checkbox" id="net-toggle-hist"> Pokaż historyczne</label></div>
    `;
  }

  d3.json("network.json").then(graph => {
    if (!graph || !graph.nodes || !graph.links) throw new Error("network.json missing data");

    const allNodes = graph.nodes.map(d => ({ ...d, id: d.id || d.name || d.label }));
    const allLinks = graph.links.map(l => {
      const sId = (typeof l.source === "object") ? l.source.id : l.source;
      const tId = (typeof l.target === "object") ? l.target.id : l.target;
      return { ...l, sourceId: sId, targetId: tId };
    });

    // === Setup SVG ===
    d3.select(host).selectAll("*").remove();
    const width = host.clientWidth || 1000;
    const height = host.clientHeight || 700;
    const svg = d3.select(host).append("svg")
      .attr("width", width)
      .attr("height", height);
    const container = svg.append("g");

    // === Zoom & pan ===
    const zoom = d3.zoom().scaleExtent([0.05, 5])
      .on("zoom", e => container.attr("transform", e.transform));
    svg.call(zoom);

    // === Colors ===
    const partyColor = {
      "Prawo i Sprawiedliwość": "#e11d48",
      "Platforma Obywatelska": "#3b82f6",
      "Kukiz'15": "#000000",
      "Polskie Stronnictwo Ludowe": "#22c55e",
      "Lewica": "#9333ea"
    };
    const linkColor = d3.scaleOrdinal()
      .domain(["current", "historical", "glowna_osoba"])
      .range(["#22c55e", "#888", "#8e44ad"]);

    function nodeFill(d) {
      if (d.type === "organization") return "#facc15";
      if (d.type === "glowna_osoba") return "#8e44ad";
      return partyColor[d.party] || "#60a5fa";
    }

    // === Force simulation ===
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(140).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => {
        if (d.type === "organization") return 75;
        if (d.type === "glowna_osoba") return 65;
        return 50;
      }).strength(0.9).iterations(2));

let linkSel = container.append("g").selectAll("line");
let nodeSel = container.append("g").selectAll("g");
let currentLinks = [];

const histToggle = document.getElementById("net-toggle-hist");

// INITIAL RENDER — historical OFF by default
render(false);

if (histToggle) {
  histToggle.addEventListener("change", () => {
    const show = histToggle.checked;
    render(show);
  });
}

    // === Render function ===
    function render(showHistorical) {
      let linksData;
      if (showHistorical) {
        linksData = allLinks;
      } else {
        const currentOnly = allLinks.filter(l => (l.relation || l.type) === "current");
        const keepIds = new Set();
        currentOnly.forEach(l => { keepIds.add(l.sourceId); keepIds.add(l.targetId); });
        const glowna = allLinks.filter(l =>
          (l.relation || l.type) === "glowna_osoba" &&
          (keepIds.has(l.sourceId) || keepIds.has(l.targetId))
        );
        linksData = currentOnly.concat(glowna);
      }

      const visible = new Set();
      linksData.forEach(l => { visible.add(l.sourceId); visible.add(l.targetId); });
      const nodesData = allNodes.filter(n => visible.has(n.id));

      linkSel = linkSel
        .data(linksData, d => `${d.sourceId}|${d.targetId}|${d.relation || d.type}`)
        .join(
          enter => enter.append("line")
            .attr("class", d => `link ${d.relation || d.type}`)
            .attr("stroke", d => linkColor(d.relation || d.type))
            .attr("stroke-width", 1.4)
            .attr("stroke-opacity", d => (d.relation === "historical" ? 0.4 : 0.6)),
          update => update,
          exit => exit.remove()
        );

      const nodeEnter = nodeSel
        .data(nodesData, d => d.id)
        .join(
          enter => {
            const g = enter.append("g").attr("class", "node").call(drag(simulation));

            g.append("circle")
              .attr("r", 16)
              .attr("fill", nodeFill)
              .attr("stroke", "#fff")
              .attr("stroke-width", 1.3)
              .attr("opacity", 0.95);

            g.append("text")
              .attr("class", "node-icon")
              .attr("text-anchor", "middle")
              .attr("dy", 5)
              .attr("font-size", 18)
              .text(d => {
                if (d.type === "organization") return "🏢";
                if (d.type === "glowna_osoba") return "⭐";
                return "👤";
              });

            g.append("text")
              .attr("x", 22).attr("y", 5)
              .style("font-family", "Inter, ui-sans-serif")
              .style("font-size", "12px")
              .style("fill", "#e5e7eb")
              .text(d => {
                const t = d.label || d.name || d.id;
                return t.length > 32 ? t.slice(0, 32) + "…" : t;
              });

            // only highlight, no popup
            g.on("click", (ev, d) => {
              ev.stopPropagation();
              highlightSelection(d);
            });

            return g;
          },
          update => update,
          exit => exit.remove()
        );

      nodeSel = nodeEnter;
      currentLinks = linksData;

      simulation.nodes(nodesData).on("tick", () => {
        linkSel
          .attr("x1", d => (typeof d.source === "object" ? d.source.x : nodesData.find(n => n.id === d.sourceId)?.x))
          .attr("y1", d => (typeof d.source === "object" ? d.source.y : nodesData.find(n => n.id === d.sourceId)?.y))
          .attr("x2", d => (typeof d.target === "object" ? d.target.x : nodesData.find(n => n.id === d.targetId)?.x))
          .attr("y2", d => (typeof d.target === "object" ? d.target.y : nodesData.find(n => n.id === d.targetId)?.y));
        nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
      });
      simulation.force("link").links(linksData);
      simulation.alpha(0.6).restart();
    }

    // === Highlight selection ===
    function highlightSelection(d) {
      const neighbors = new Set([d.id]);
      currentLinks.forEach(l => {
        const s = l.source.id || l.source || l.sourceId;
        const t = l.target.id || l.target || l.targetId;
        if (s === d.id) neighbors.add(t);
        if (t === d.id) neighbors.add(s);
      });

      nodeSel.selectAll("circle")
        .attr("opacity", n => neighbors.has(n.id) ? 1 : 0.2)
        .attr("r", n => neighbors.has(n.id) ? 20 : 16);

      linkSel
        .attr("stroke-width", l => {
          const s = l.source.id || l.source || l.sourceId;
          const t = l.target.id || l.target || l.targetId;
          return (s === d.id || t === d.id) ? 3 : 1.2;
        })
        .attr("opacity", l => {
          const s = l.source.id || l.source || l.sourceId;
          const t = l.target.id || l.target || l.targetId;
          return (s === d.id || t === d.id) ? 1 : 0.15;
        });
    }

    // reset on background click
    svg.on("click", () => {
      nodeSel.selectAll("circle").attr("r", 16).attr("opacity", 1);
      linkSel.attr("stroke-width", 1.4).attr("opacity", 0.6);
    });

    // drag behavior
    function drag(sim) {
      function dragstarted(e, d) { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
      function dragged(e, d) { d.fx = e.x; d.fy = e.y; }
      function dragended(e, d) { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
  }).catch(err => {
    console.error(err);
    const desc = document.getElementById('network-desc');
    if (desc)
      desc.innerHTML = `<h2>Network</h2><p>Could not load</p>`;
  });
}


// == UI helpers (built dynamically so you don't have to edit HTML) ==
function buildNetworkLegend(host){
  if (document.getElementById("net-legend")) return;
  const box = document.createElement("div");
  box.id = "net-legend";
  box.style.position = "absolute";
  box.style.left = "10px";
  box.style.top = "10px";
  box.style.background = "rgba(255,255,255,0.92)";
  box.style.padding = "8px 12px";
  box.style.borderRadius = "8px";
  box.style.fontSize = "13px";
  box.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
  box.innerHTML = `
    <strong>Legenda:</strong>
    <div><span style="color:#cc0000">●</span> PiS</div>
    <div><span style="color:#ff7f00">●</span> PO</div>
    <div><span style="color:#2ca02c">●</span> PSL</div>
    <div><span style="color:#d62728">●</span> Lewica</div>
    <div><span style="color:#000000">●</span> Kukiz'15</div>
    <div><span style="color:#4A90E2">●</span> Inni politycy</div>
    <div><span style="color:#f39c12">■</span> Organizacje</div>
    <div><span style="color:#8e44ad">◆</span> Główna Osoba</div>
    <div><span style="color:#28a745">━</span> Aktualne</div>
    <div><span style="color:#aaa">━</span> Historyczne</div>`;
  // place in the same stacking context as network area
  host.style.position = "relative";
  host.appendChild(box);
}

function buildNetworkControls(host){
  if (document.getElementById("net-controls")) return;

  const wrap = document.createElement("div");
  wrap.id = "net-controls";
  wrap.style.position = "absolute";
  wrap.style.right = "12px";
  wrap.style.top = "12px";
  wrap.style.background = "rgba(15,23,42,0.9)";
  wrap.style.color = "#e5e7eb";
  wrap.style.padding = "8px 12px";
  wrap.style.borderRadius = "8px";
  wrap.style.fontSize = "13px";
  wrap.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

  wrap.innerHTML = `
    <label style="cursor:pointer;">
      <input id="net-toggle-hist" type="checkbox" checked style="margin-right:6px;">
      Show historical connections
    </label>
  `;
  host.appendChild(wrap);
}
// simple popup (like your graph.html)
function hideNetworkPopup(){
  const p = document.getElementById("net-popup");
  if (p) p.remove();
}
function showNetworkPopup(d){
  const host = document.getElementById('network-graphic');
  const p = document.createElement("div");
  p.id = "net-popup";
  p.style.position = "absolute";
  p.style.right = "20px";
  p.style.top = "60px";
  p.style.background = "#fff";
  p.style.border = "1px solid #ccc";
  p.style.borderRadius = "8px";
  p.style.padding = "12px";
  p.style.width = "320px";
  p.style.maxHeight = "400px";
  p.style.overflowY = "auto";
  p.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  p.style.fontSize = "14px";
  p.innerHTML = `
    <div style="position:absolute;top:8px;right:10px;cursor:pointer;font-weight:bold;"
         onclick="this.parentElement.remove()">×</div>
    <h3 style="margin-top:0;font-size:16px;">${d.label||d.name||d.id}</h3>
    <table style="width:100%;font-size:13px;">
      ${d.type==="person" ? `
        <tr><td style="font-weight:600;width:40%;">Partia</td><td>${d.party||""}</td></tr>
        <tr><td style="font-weight:600;">Data ur.</td><td>${d.birth_date||""}</td></tr>
        <tr><td style="font-weight:600;">Okręg</td><td>${d.district||""}</td></tr>
        <tr><td style="font-weight:600;">Zawód</td><td>${d.profession||""}</td></tr>
        <tr><td style="font-weight:600;">Rejestr ID</td><td>${d.rejestr_id||""}</td></tr>
      ` : d.type==="organization" ? `
        <tr><td style="font-weight:600;width:40%;">Org ID</td><td>${d.org_id||""}</td></tr>
        <tr><td style="font-weight:600;">KRS</td><td>${d.krs||""}</td></tr>
        <tr><td style="font-weight:600;">NIP</td><td>${d.nip||""}</td></tr>
        <tr><td style="font-weight:600;">Miasto</td><td>${d.miasto||""}</td></tr>
        <tr><td style="font-weight:600;">PKD</td><td>${d.pkd_przewazajace_dzial||""}</td></tr>
      ` : `
        <tr><td style="font-weight:600;">ID</td><td>${d.glowna_id||""}</td></tr>
      `}
    </table>`;
  host.style.position = "relative";
  host.appendChild(p);
}

// Write an auto-description into #network-desc
function describeKukizCluster(nodes, links){
  const desc = document.getElementById('network-desc');
  if (!desc) return;

  const people = nodes.filter(n => n.type === 'person').length;
  const orgs   = nodes.filter(n => n.type === 'organization').length;
  const glOs   = nodes.filter(n => n.type === 'glowna_osoba').length;

  // degree summary
  const deg = {};
  links.forEach(l => {
    const s = l.source.id || l.source || l.sourceId;
    const t = l.target.id || l.target || l.targetId;
    deg[s] = (deg[s]||0)+1;
    deg[t] = (deg[t]||0)+1;
  });
  const top = Object.entries(deg).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const labelOf = id => (nodes.find(n => n.id === id)?.label || nodes.find(n => n.id===id)?.name || id);

  desc.innerHTML = `
    <h2>Cluster: STOWARZYSZENIE NA RZECZ NOWEJ KONSTYTUCJI KUKIZ'15</h2>
    <p>Nodes: <strong>${nodes.length}</strong> (people: <strong>${people}</strong>, organizations: <strong>${orgs}</strong>, główna osoba: <strong>${glOs}</strong>) ·
       Links: <strong>${links.length}</strong></p>
    <p>Key hubs: ${top.map(([id,d])=>`<strong>${labelOf(id)}</strong> [${d}]`).join(', ')}.</p>
    <p>The toggle at top-right filters out history to focus on current ties; the legend at top-left explains colors and shapes.</p>
  `;
}

// === SCROLLAMA WIRING ===

// BAR CHART SCROLLER (5 steps: 0..4; legends appear at index 4)
// BAR CHART SCROLLER
const scroller = scrollama();
scroller.setup({ step: "#bar-scroll .step", offset: 0.7 })
  .onStepEnter((response)=>{
    document.querySelectorAll('#bar-scroll .step').forEach(s=>s.classList.remove('active'));
    response.element.classList.add('active');

    if(response.index===0){
      renderBarChart();
      document.getElementById('bar-graphic').classList.remove('blurred');
      document.getElementById('bar-scroll').classList.remove('show-legend');
      // ✅ show buttons now
      document.querySelector(".btn-container").style.display = "flex";
    }
    if(response.index===1){
      document.getElementById('bar-graphic').classList.add('blurred');
      document.getElementById('bar-scroll').classList.remove('show-legend');
    }
    if(response.index===2){
      document.getElementById('bar-graphic').classList.remove('blurred');
      // ✅ show legend on last scroll
      document.getElementById('bar-scroll').classList.add('show-legend');
    }
  });
// COMPANIES SCROLLER (timeline highlights across steps 1..3)
const companiesScroller = scrollama();
companiesScroller.setup({ step: "#companies-scroll .step", offset: 0.7 })
  .onStepEnter((response)=>{
    document.querySelectorAll('#companies-scroll .step')
      .forEach(s=>s.classList.remove('active'));
    response.element.classList.add('active');

    renderCompanies();
     const p = TL.people;
    console.log(p)

   if (response.index === 0){
  document.getElementById("companies-scroll").classList.add("show-title");
  highlightTimeline(null);
  document.getElementById("companies").classList.add("visible");
}
    if (response.index === 1 && TL.people.length){
      const p = TL.people[23];
      highlightTimeline(p);
      setTimelineCaption(1, p);
    }
    if (response.index === 2 && TL.people.length >= 2){
      const p = TL.people[52];
      highlightTimeline(p);
      setTimelineCaption(2, p);
    }
    if (response.index === 3 && TL.people.length >= 3){
      const p = TL.people[54];
      highlightTimeline(p);
      setTimelineCaption(3, p);
    }
     if (response.index === 4 && TL.people.length >= 4){
  highlightTimeline(null);
    }
  });

// Optional observer from older flow (safe to keep)
const companiesSectionObserver = scrollama();
companiesSectionObserver.setup({ step: "#companies-scroll .step", offset: 0.9 })
  .onStepEnter((response)=>{
    if(response.index === 2 || response.index === 0){
      document.getElementById('companies-scroll').classList.remove('title-visible');
    }
  });

// MAP SCROLLER
// MAP SCROLLER
// MAP SCROLLER
const mapScroller = scrollama();
let selectedMarker = null; // 🧠 global variable for reuse

mapScroller.setup({
  step: "#map-scroll .step",
  offset: 0.7
})
  .onStepEnter((response) => {
    document.querySelectorAll('#map-scroll .step').forEach(s => s.classList.remove('active'));
    response.element.classList.add('active');

    // Step 0 → initialize
    if (response.index === 0) {
      renderMap();
    }

    // Step 1 → overview / fit all
    if (response.index === 1) {
      fitAll();
    }

    // Step 2 → zoom to random marker (medium)
    if (response.index === 2) {
      if (!MAP.ready || !MAP.markers || MAP.markers.length === 0) {
        console.warn("⚠️ Map not ready or no markers yet, delaying zoom...");
        setTimeout(() => mapScroller.resize(), 500);
        return;
      }

      const validMarkers = MAP.markers.filter(m =>
        m && typeof m.getLatLng === "function" &&
        !isNaN(m.getLatLng().lat) && !isNaN(m.getLatLng().lng)
      );

      if (!validMarkers.length) {
        console.warn("⚠️ No valid markers found for zoom.");
        return;
      }

      // pick and store the random marker globally
      selectedMarker = validMarkers[Math.floor(Math.random() * validMarkers.length)];

      console.log("✅ Zooming to random point:", selectedMarker.getLatLng());
      zoomToRandomModerate(selectedMarker);
    }

    // Step 3 → zoom even closer to the same point
    if (response.index === 3) {
      if (!selectedMarker) {
        console.warn("⚠️ No stored marker found for step 3.");
        return;
      }

      console.log("🔍 Zooming in tighter to same marker:", selectedMarker.getLatLng());
      zoomToRandomClose(selectedMarker, { extraZoom: true });
    }
  })
  .onStepExit((response) => {
  // just handle cleanup or transitions, NOT the network
  const isLastMapStep = response.element === document.querySelector('#map-scroll .step[data-step="3"]');
if (isLastMapStep && response.direction === 'down') {
  document.getElementById('map-scroll').classList.add('fade-out');
  }
});


// === NETWORK SCROLLER ===
const networkScroller = scrollama();

networkScroller.setup({
  step: "#network-scroll .step",
  offset: 0.65
})
.onStepEnter((response) => {
  const netGraphic = d3.select("#network-graphic");
  const netDesc = d3.select("#network-desc");

  // Step 0 → fade in the network graph
  if (response.index === 0 && !window._networkRendered) {
    window._networkRendered = true;

    netGraphic
      .style("opacity", 0)
      .style("transform", "scale(0.96)")
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .style("transform", "scale(1)");

    setTimeout(() => renderNetworkGraph(), 300);
  }

  // Step 1 → slide in the description panel from the right
  if (response.index === 1) {
    netDesc.classed("slide-in-right", true);
  }
})
.onStepExit((response) => {
  // Hide description when scrolling back up
  if (response.index === 1 && response.direction === "up") {
    d3.select("#network-desc").classed("slide-in-right", false);
  }
});

const sankeyScroller = scrollama();

sankeyScroller
  .setup({
    step: "#sankey-scroll .step",
    offset: 0.6
  })
  .onStepEnter(response => {
    const party = response.element.dataset.party;
    renderPersonPKDSankey(party);
  });

// === DOM READY ===
document.addEventListener("DOMContentLoaded", ()=>{
  // counters
  animateCounters();
renderPersonPKDSankey();

  // example network description

});

// === SANKEY: Person ↔ PKD Connections (per party) ===
// === SANKEY: Party → PKD Connections (Story Panel Version) ===
function renderPersonPKDSankey(partyFilter) {
  const chartEl = d3.select("#person-pkd-sankey");
  chartEl.selectAll("*").remove();
  d3.select("#sankey-legend").text("");

  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = chartEl
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  const sankey = d3.sankey()
    .nodeWidth(16)
    .nodePadding(10)
    .nodeAlign(d3.sankeyLeft)
    .extent([[1, 1], [width - 1, height - 6]]);

  d3.json("person_pkd.json").then(data => {
    if (!data) return;

    const filtered = data.filter(d => d.party === partyFilter && d.person && d.pkd);
    const people = Array.from(new Set(filtered.map(d => d.person)));
    const pkds = Array.from(new Set(filtered.map(d => String(d.pkd))));

    const nodes = [
      ...people.map(p => ({ id: p, type: "person" })),
      ...pkds.map(p => ({ id: p, type: "pkd" }))
    ];
    const nodeById = new Map(nodes.map((d, i) => [d.id, i]));

    const links = filtered.map(d => ({
      source: nodeById.get(d.person),
      target: nodeById.get(String(d.pkd)),
      value: 1,
      party: d.party,
      opis_pkd: d.opis_pkd
    })).filter(l => l.source !== undefined && l.target !== undefined);

    const graph = { nodes, links };
    if (!nodes.length || !links.length) return;

    sankey(graph);

    // === Color palette per PKD ===
    const pkdSet = new Set(filtered.map(d => String(d.pkd)));
    const pkdColors = {};
        const colors = [
  ...d3.schemeTableau10,
  ...d3.schemeSet3,
].map(c => d3.color(c).brighter(0.5));

    const pkdScale = d3.scaleOrdinal(colors)
    Array.from(pkdSet).forEach((p, i) => (pkdColors[p] = pkdScale(i)));

    // === Draw links ===
    svg.append("g")
      .selectAll("path")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => pkdColors[d.target.id] || "#888")
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("stroke-opacity", 0.75);

    // === Draw PKD nodes only ===
    svg.append("g")
      .selectAll("rect")
      .data(graph.nodes.filter(d => d.type === "pkd"))
      .enter()
      .append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => Math.max(1, d.y1 - d.y0))
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => pkdColors[d.id] || "#facc15")
      .attr("stroke", "#111");

    // === Compute top 3 PKDs ===
    const pkdStats = {};
    filtered.forEach(d => {
      const pkd = String(d.pkd);
      if (!pkdStats[pkd]) pkdStats[pkd] = { count: 0, desc: d.opis_pkd };
      pkdStats[pkd].count += 1;
    });
    const topPKDs = Object.entries(pkdStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    // === Combined summary tile (party + PKDs) ===
    const storyWidth = Math.min(640, width * 0.75);
    const descList = topPKDs.map(([pkd, info]) =>
      `<li><span class="pkd-code">${pkd}</span> ${info.desc}</li>`
    ).join("");

    svg.append("foreignObject")
      .attr("x", width / 2 - storyWidth / 2)
      .attr("y", height / 2 - 130)
      .attr("width", storyWidth)
      .attr("height", 360)
      .append("xhtml:div")
      .attr("class", "sankey-story-panel")
      .html(`
        <h2 class="sankey-story-title">${partyFilter}</h2>
        <p class="popup-lead">
          Najczęstsze branże i obszary działalności powiązane z partią
          <strong>${partyFilter}</strong>:
        </p>
        <ul class="popup-list">${descList}</ul>
      `);
  });
}


// === Helper: Party color base (for link fallbacks) ===
function partyColor(party) {
  const colors = {
    "Prawo i Sprawiedliwość": "#e11d48",
    "Platforma Obywatelska": "#3b82f6",
    "Polskie Stronnictwo Ludowe": "#22c55e",
    "Lewica": "#9333ea",
    "Kukiz'15": "#000000"
  };
  return colors[party] || "#9ca3af";
}

// === Button filter logic ===
document.querySelectorAll("#sankey-filters .btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#sankey-filters .btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPersonPKDSankey(btn.dataset.party);
  });
});

// === Initial render ===
renderPersonPKDSankey("Platforma Obywatelska");


// === Helper: Party colors ===
function partyColor(party) {
  const colors = {
    "Prawo i Sprawiedliwość": "#e11d48",
    "Platforma Obywatelska": "#3b82f6",
    "Polskie Stronnictwo Ludowe": "#22c55e",
    "Lewica": "#9333ea",
    "Kukiz'15": "#000000"
  };
  return colors[party] || "#9ca3af";
}

// === Party color helper ===
function partyColor(party) {
  const colors = {
    "Prawo i Sprawiedliwość": "#e11d48",
    "Platforma Obywatelska": "#3b82f6",
    "Polskie Stronnictwo Ludowe": "#22c55e",
    "Lewica": "#9333ea",
    "Kukiz'15": "#000000"
  };
  return colors[party] || "#9ca3af";
}

// === RESIZE HANDLER ===
window.addEventListener('resize', () => {
  try{ scroller.resize(); }catch(e){}
  try{ companiesScroller.resize(); }catch(e){}
  try{ companiesSectionObserver.resize(); }catch(e){}
  try{ mapScroller.resize(); }catch(e){}
  try{ networkScroller.resize(); }catch(e){}
});

// === OPENAI SCROLL SECTION (Visible for first 25%) ===
document.addEventListener("DOMContentLoaded", () => {
  const openaiScroll = document.getElementById("openai-scroll");
  if (!openaiScroll) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          openaiScroll.classList.add("active");
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(openaiScroll);

  // fade out after 25% of section scroll
  window.addEventListener("scroll", () => {
    const rect = openaiScroll.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const visibleRatio = 1 - rect.top / windowHeight;

    if (visibleRatio > 0.25) {
      openaiScroll.classList.add("faded");
    } else {
      openaiScroll.classList.remove("faded");
    }
  });
});