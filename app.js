const state = {
  matches: [],
  filter: "all",
  group: "all",
  query: ""
};

const bdFormatter = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "Asia/Dhaka",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const bdDateOnly = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const clockFormatter = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "Asia/Dhaka",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});

const els = {
  bdClock: document.querySelector("#bdClock"),
  nextMatch: document.querySelector("#nextMatch"),
  completedCount: document.querySelector("#completedCount"),
  futureCount: document.querySelector("#futureCount"),
  totalMatches: document.querySelector("#totalMatches"),
  todayMatches: document.querySelector("#todayMatches"),
  liveMatches: document.querySelector("#liveMatches"),
  sourceLink: document.querySelector("#sourceLink"),
  lastSync: document.querySelector("#lastSync"),
  visibleCount: document.querySelector("#visibleCount"),
  matchCards: document.querySelector("#matchCards"),
  searchInput: document.querySelector("#searchInput"),
  groupFilter: document.querySelector("#groupFilter")
};

function formatBdTime(iso) {
  return iso ? `${bdFormatter.format(new Date(iso))} BDT` : "সময় প্রকাশিত হয়নি";
}

function todayKey() {
  return bdDateOnly.format(new Date());
}

function matchDayKey(match) {
  return match.kickoffEt ? bdDateOnly.format(new Date(match.kickoffEt)) : "";
}

function statusLabel(status) {
  if (status === "completed") return "Result";
  if (status === "live") return "Live";
  return "Upcoming";
}

function statusClass(status) {
  if (status === "completed") return "completed";
  if (status === "live") return "live";
  return "";
}

function groupLabel(group) {
  return group === "Knockout" ? "Knockout" : `Group ${group}`;
}

function populateGroups() {
  const groups = [...new Set(state.matches.map((match) => match.group))].sort();
  els.groupFilter.innerHTML = `<option value="all">All groups</option>${groups
    .map((group) => `<option value="${group}">${groupLabel(group)}</option>`)
    .join("")}`;
}

function updateStats(data) {
  const completed = state.matches.filter((match) => match.status === "completed").length;
  const upcoming = state.matches.filter((match) => match.status === "scheduled").length;
  const live = state.matches.filter((match) => match.status === "live").length;
  const today = state.matches.filter((match) => matchDayKey(match) === todayKey()).length;
  const next = state.matches
    .filter((match) => match.status === "scheduled" && match.kickoffEt)
    .sort((a, b) => new Date(a.kickoffEt) - new Date(b.kickoffEt))[0];

  els.completedCount.textContent = `${completed} results`;
  els.futureCount.textContent = `${upcoming} upcoming`;
  els.totalMatches.textContent = state.matches.length;
  els.todayMatches.textContent = today;
  els.liveMatches.textContent = live;
  els.nextMatch.textContent = next ? `${next.home} vs ${next.away} · ${formatBdTime(next.kickoffEt)}` : "No upcoming match";
  els.sourceLink.textContent = data.source.name;
  els.sourceLink.href = data.source.url;
  els.lastSync.textContent = `${new Date(data.generatedAt).toLocaleString()} server time`;
}

function getFilteredMatches() {
  return state.matches.filter((match) => {
    const haystack = `${match.home} ${match.away} ${match.group} ${match.tv || ""} ${match.score || ""}`.toLowerCase();
    const matchesText = haystack.includes(state.query.toLowerCase());
    const matchesGroup = state.group === "all" || match.group === state.group;
    const matchesStatus =
      state.filter === "all" ||
      match.status === state.filter ||
      (state.filter === "today" && matchDayKey(match) === todayKey());
    return matchesText && matchesGroup && matchesStatus;
  });
}

function renderMatches() {
  const visible = getFilteredMatches();
  els.visibleCount.textContent = `${visible.length} shown`;
  els.matchCards.innerHTML = visible
    .map((match) => {
      const score = match.score ? `<span class="score">${match.score}</span>` : "";
      return `
        <article class="match-card">
          <div class="badge ${statusClass(match.status)}">${statusLabel(match.status)}</div>
          <div class="teams">
            <strong>${match.home} vs ${match.away}</strong>
            <div class="meta">
              <span>${groupLabel(match.group)}</span>
              <span>${match.phase}</span>
              <span>${match.tv || "TV TBA"}</span>
            </div>
          </div>
          <div class="time-box">
            ${score}
            <span>${formatBdTime(match.kickoffEt)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadMatches() {
  const response = await fetch("/api/matches", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load schedule data");
  const data = await response.json();
  state.matches = data.matches;
  populateGroups();
  updateStats(data);
  renderMatches();
}

function updateClock() {
  els.bdClock.textContent = clockFormatter.format(new Date());
}

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderMatches();
  });
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderMatches();
});

els.groupFilter.addEventListener("change", (event) => {
  state.group = event.target.value;
  renderMatches();
});

updateClock();
setInterval(updateClock, 1000);
loadMatches().catch((error) => {
  els.matchCards.innerHTML = `<p class="error">${error.message}</p>`;
});
setInterval(loadMatches, 60000);
