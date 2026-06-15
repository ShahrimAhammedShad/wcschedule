const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, "public");

const sourceInfo = {
  name: "SB Nation World Cup schedule 2026",
  url: "https://www.sbnation.com/soccer/1117513/world-cup-schedule-2026-how-to-watch-every-match-scores-and-more",
  updatedUtc: "2026-06-14T21:56:00Z",
  note: "Kickoff times from the source are Eastern Time; the API exposes them and the frontend renders Bangladesh time."
};

const groupStageMatches = [
  { id: 1, dateLabel: "Thursday, June 11", group: "A", home: "Mexico", away: "South Africa", score: "2-0", status: "completed" },
  { id: 2, dateLabel: "Thursday, June 11", group: "A", home: "South Korea", away: "Czechia", score: "2-1", status: "completed" },
  { id: 3, dateLabel: "Friday, June 12", group: "B", home: "Canada", away: "Bosnia and Herzegovina", score: "1-1", status: "completed" },
  { id: 4, dateLabel: "Friday, June 12", group: "D", home: "United States", away: "Paraguay", score: "4-1", status: "completed" },
  { id: 5, dateLabel: "Saturday, June 13", group: "B", home: "Switzerland", away: "Qatar", score: "1-1", status: "completed" },
  { id: 6, dateLabel: "Saturday, June 13", group: "C", home: "Brazil", away: "Morocco", score: "1-1", status: "completed" },
  { id: 7, dateLabel: "Saturday, June 13", group: "C", home: "Scotland", away: "Haiti", score: "1-0", status: "completed" },
  { id: 8, dateLabel: "Sunday, June 14", group: "D", home: "Australia", away: "Turkiye", score: "2-0", status: "completed" },
  { id: 9, dateLabel: "Sunday, June 14", group: "E", home: "Germany", away: "Curacao", score: "7-1", status: "completed" },
  { id: 10, dateLabel: "Sunday, June 14", group: "F", home: "Netherlands", away: "Japan", score: "2-2", status: "completed" },
  { id: 11, dateLabel: "Sunday, June 14", group: "E", home: "Ivory Coast", away: "Ecuador", kickoffEt: "2026-06-14T19:00:00-04:00", tv: "FS1" },
  { id: 12, dateLabel: "Sunday, June 14", group: "F", home: "Sweden", away: "Tunisia", kickoffEt: "2026-06-14T22:00:00-04:00", tv: "FS1" },
  { id: 13, dateLabel: "Monday, June 15", group: "H", home: "Spain", away: "Cabo Verde", kickoffEt: "2026-06-15T12:00:00-04:00", tv: "FOX" },
  { id: 14, dateLabel: "Monday, June 15", group: "G", home: "Belgium", away: "Egypt", kickoffEt: "2026-06-15T15:00:00-04:00", tv: "FOX" },
  { id: 15, dateLabel: "Monday, June 15", group: "H", home: "Saudi Arabia", away: "Uruguay", kickoffEt: "2026-06-15T18:00:00-04:00", tv: "FS1" },
  { id: 16, dateLabel: "Monday, June 15", group: "G", home: "Iran", away: "New Zealand", kickoffEt: "2026-06-15T21:00:00-04:00", tv: "FS1" },
  { id: 17, dateLabel: "Tuesday, June 16", group: "I", home: "France", away: "Senegal", kickoffEt: "2026-06-16T15:00:00-04:00", tv: "FOX" },
  { id: 18, dateLabel: "Tuesday, June 16", group: "I", home: "Iraq", away: "Norway", kickoffEt: "2026-06-16T18:00:00-04:00", tv: "FOX" },
  { id: 19, dateLabel: "Tuesday, June 16", group: "J", home: "Argentina", away: "Algeria", kickoffEt: "2026-06-16T21:00:00-04:00", tv: "FOX" },
  { id: 20, dateLabel: "Wednesday, June 17", group: "J", home: "Austria", away: "Jordan", kickoffEt: "2026-06-17T00:00:00-04:00", tv: "FS1" },
  { id: 21, dateLabel: "Wednesday, June 17", group: "K", home: "Portugal", away: "DR Congo", kickoffEt: "2026-06-17T13:00:00-04:00", tv: "FOX" },
  { id: 22, dateLabel: "Wednesday, June 17", group: "L", home: "England", away: "Croatia", kickoffEt: "2026-06-17T16:00:00-04:00", tv: "FOX" },
  { id: 23, dateLabel: "Wednesday, June 17", group: "L", home: "Ghana", away: "Panama", kickoffEt: "2026-06-17T19:00:00-04:00", tv: "FS1" },
  { id: 24, dateLabel: "Wednesday, June 17", group: "K", home: "Uzbekistan", away: "Colombia", kickoffEt: "2026-06-17T22:00:00-04:00", tv: "FS1" },
  { id: 25, dateLabel: "Thursday, June 18", group: "A", home: "Czechia", away: "South Africa", kickoffEt: "2026-06-18T12:00:00-04:00", tv: "FOX" },
  { id: 26, dateLabel: "Thursday, June 18", group: "B", home: "Switzerland", away: "Bosnia and Herzegovina", kickoffEt: "2026-06-18T15:00:00-04:00", tv: "FOX" },
  { id: 27, dateLabel: "Thursday, June 18", group: "B", home: "Canada", away: "Qatar", kickoffEt: "2026-06-18T18:00:00-04:00", tv: "FS1" },
  { id: 28, dateLabel: "Thursday, June 18", group: "A", home: "Mexico", away: "South Korea", kickoffEt: "2026-06-18T21:00:00-04:00", tv: "FOX" },
  { id: 29, dateLabel: "Friday, June 19", group: "D", home: "United States", away: "Australia", kickoffEt: "2026-06-19T15:00:00-04:00", tv: "FOX" },
  { id: 30, dateLabel: "Friday, June 19", group: "C", home: "Scotland", away: "Morocco", kickoffEt: "2026-06-19T18:00:00-04:00", tv: "FOX" },
  { id: 31, dateLabel: "Friday, June 19", group: "C", home: "Brazil", away: "Haiti", kickoffEt: "2026-06-19T20:30:00-04:00", tv: "FOX" },
  { id: 32, dateLabel: "Friday, June 19", group: "D", home: "Turkiye", away: "Paraguay", kickoffEt: "2026-06-19T23:00:00-04:00", tv: "FS1" },
  { id: 33, dateLabel: "Saturday, June 20", group: "F", home: "Netherlands", away: "Sweden", kickoffEt: "2026-06-20T13:00:00-04:00", tv: "FOX" },
  { id: 34, dateLabel: "Saturday, June 20", group: "E", home: "Germany", away: "Ivory Coast", kickoffEt: "2026-06-20T16:00:00-04:00", tv: "FOX" },
  { id: 35, dateLabel: "Saturday, June 20", group: "E", home: "Ecuador", away: "Curacao", kickoffEt: "2026-06-20T20:00:00-04:00", tv: "FS1" },
  { id: 36, dateLabel: "Sunday, June 21", group: "F", home: "Tunisia", away: "Japan", kickoffEt: "2026-06-21T00:00:00-04:00", tv: "FS1" },
  { id: 37, dateLabel: "Sunday, June 21", group: "H", home: "Spain", away: "Saudi Arabia", kickoffEt: "2026-06-21T12:00:00-04:00", tv: "FOX" },
  { id: 38, dateLabel: "Sunday, June 21", group: "G", home: "Belgium", away: "Iran", kickoffEt: "2026-06-21T15:00:00-04:00", tv: "FS1" },
  { id: 39, dateLabel: "Sunday, June 21", group: "H", home: "Uruguay", away: "Cabo Verde", kickoffEt: "2026-06-21T18:00:00-04:00", tv: "FS1" },
  { id: 40, dateLabel: "Sunday, June 21", group: "G", home: "New Zealand", away: "Egypt", kickoffEt: "2026-06-21T21:00:00-04:00", tv: "FS1" },
  { id: 41, dateLabel: "Monday, June 22", group: "J", home: "Argentina", away: "Austria", kickoffEt: "2026-06-22T13:00:00-04:00", tv: "FOX" },
  { id: 42, dateLabel: "Monday, June 22", group: "I", home: "France", away: "Iraq", kickoffEt: "2026-06-22T17:00:00-04:00", tv: "FOX" },
  { id: 43, dateLabel: "Monday, June 22", group: "I", home: "Norway", away: "Senegal", kickoffEt: "2026-06-22T20:00:00-04:00", tv: "FOX" },
  { id: 44, dateLabel: "Monday, June 22", group: "J", home: "Jordan", away: "Algeria", kickoffEt: "2026-06-22T23:00:00-04:00", tv: "FS1" },
  { id: 45, dateLabel: "Tuesday, June 23", group: "K", home: "Portugal", away: "Uzbekistan", kickoffEt: "2026-06-23T13:00:00-04:00", tv: "FOX" },
  { id: 46, dateLabel: "Tuesday, June 23", group: "L", home: "England", away: "Ghana", kickoffEt: "2026-06-23T16:00:00-04:00", tv: "FOX" },
  { id: 47, dateLabel: "Tuesday, June 23", group: "L", home: "Panama", away: "Croatia", kickoffEt: "2026-06-23T19:00:00-04:00", tv: "FOX" },
  { id: 48, dateLabel: "Tuesday, June 23", group: "K", home: "Colombia", away: "DR Congo", kickoffEt: "2026-06-23T22:00:00-04:00", tv: "FS1" },
  { id: 49, dateLabel: "Wednesday, June 24", group: "B", home: "Switzerland", away: "Canada", kickoffEt: "2026-06-24T15:00:00-04:00", tv: "FOX" },
  { id: 50, dateLabel: "Wednesday, June 24", group: "B", home: "Bosnia and Herzegovina", away: "Qatar", kickoffEt: "2026-06-24T15:00:00-04:00", tv: "FS1" },
  { id: 51, dateLabel: "Wednesday, June 24", group: "C", home: "Morocco", away: "Haiti", kickoffEt: "2026-06-24T18:00:00-04:00", tv: "FS1" },
  { id: 52, dateLabel: "Wednesday, June 24", group: "C", home: "Scotland", away: "Brazil", kickoffEt: "2026-06-24T18:00:00-04:00", tv: "FOX" },
  { id: 53, dateLabel: "Wednesday, June 24", group: "A", home: "South Africa", away: "South Korea", kickoffEt: "2026-06-24T21:00:00-04:00", tv: "FS1" },
  { id: 54, dateLabel: "Wednesday, June 24", group: "A", home: "Czechia", away: "Mexico", kickoffEt: "2026-06-24T21:00:00-04:00", tv: "FOX" },
  { id: 55, dateLabel: "Thursday, June 25", group: "E", home: "Curacao", away: "Ivory Coast", kickoffEt: "2026-06-25T16:00:00-04:00", tv: "FS1" },
  { id: 56, dateLabel: "Thursday, June 25", group: "E", home: "Ecuador", away: "Germany", kickoffEt: "2026-06-25T16:00:00-04:00", tv: "FOX" },
  { id: 57, dateLabel: "Thursday, June 25", group: "F", home: "Tunisia", away: "Netherlands", kickoffEt: "2026-06-25T19:00:00-04:00", tv: "FOX" },
  { id: 58, dateLabel: "Thursday, June 25", group: "F", home: "Japan", away: "Sweden", kickoffEt: "2026-06-25T19:00:00-04:00", tv: "FS1" },
  { id: 59, dateLabel: "Thursday, June 25", group: "D", home: "Turkiye", away: "United States", kickoffEt: "2026-06-25T22:00:00-04:00", tv: "FOX" },
  { id: 60, dateLabel: "Thursday, June 25", group: "D", home: "Paraguay", away: "Australia", kickoffEt: "2026-06-25T22:00:00-04:00", tv: "FS1" },
  { id: 61, dateLabel: "Friday, June 26", group: "I", home: "Norway", away: "France", kickoffEt: "2026-06-26T15:00:00-04:00", tv: "FOX" },
  { id: 62, dateLabel: "Friday, June 26", group: "I", home: "Senegal", away: "Iraq", kickoffEt: "2026-06-26T15:00:00-04:00", tv: "FS1" },
  { id: 63, dateLabel: "Friday, June 26", group: "H", home: "Cabo Verde", away: "Saudi Arabia", kickoffEt: "2026-06-26T20:00:00-04:00", tv: "FS1" },
  { id: 64, dateLabel: "Friday, June 26", group: "H", home: "Uruguay", away: "Spain", kickoffEt: "2026-06-26T20:00:00-04:00", tv: "FOX" },
  { id: 65, dateLabel: "Friday, June 26", group: "G", home: "New Zealand", away: "Belgium", kickoffEt: "2026-06-26T23:00:00-04:00", tv: "FOX" },
  { id: 66, dateLabel: "Friday, June 26", group: "G", home: "Egypt", away: "Iran", kickoffEt: "2026-06-26T23:00:00-04:00", tv: "FS1" },
  { id: 67, dateLabel: "Saturday, June 27", group: "L", home: "Panama", away: "England", kickoffEt: "2026-06-27T17:00:00-04:00", tv: "FOX" },
  { id: 68, dateLabel: "Saturday, June 27", group: "L", home: "Croatia", away: "Ghana", kickoffEt: "2026-06-27T17:00:00-04:00", tv: "FS1" },
  { id: 69, dateLabel: "Saturday, June 27", group: "K", home: "Colombia", away: "Portugal", kickoffEt: "2026-06-27T19:30:00-04:00", tv: "FOX" },
  { id: 70, dateLabel: "Saturday, June 27", group: "K", home: "DR Congo", away: "Uzbekistan", kickoffEt: "2026-06-27T19:30:00-04:00", tv: "FS1" },
  { id: 71, dateLabel: "Saturday, June 27", group: "J", home: "Algeria", away: "Austria", kickoffEt: "2026-06-27T22:00:00-04:00", tv: "FS1" },
  { id: 72, dateLabel: "Saturday, June 27", group: "J", home: "Jordan", away: "Argentina", kickoffEt: "2026-06-27T22:00:00-04:00", tv: "FOX" }
];

const knockoutMatches = [
  ["Round of 32", "2026-06-28", 1], ["Round of 32", "2026-06-29", 3], ["Round of 32", "2026-06-30", 3], ["Round of 32", "2026-07-01", 3],
  ["Round of 32", "2026-07-02", 2], ["Round of 32", "2026-07-03", 4], ["Round of 16", "2026-07-04", 2], ["Round of 16", "2026-07-05", 1],
  ["Round of 16", "2026-07-06", 2], ["Round of 16", "2026-07-07", 3], ["Quarterfinal", "2026-07-09", 1], ["Quarterfinal", "2026-07-10", 2],
  ["Quarterfinal", "2026-07-11", 1], ["Semifinal", "2026-07-14", 1], ["Semifinal", "2026-07-15", 1], ["Third Place", "2026-07-18", 1],
  ["Final", "2026-07-19", 1]
].flatMap(([phase, date, count], groupIndex) =>
  Array.from({ length: count }, (_, index) => ({
    id: 73 + knockoutMatchesBefore(groupIndex) + index,
    dateLabel: date,
    group: "Knockout",
    phase,
    home: `${phase} team ${index + 1}A`,
    away: `${phase} team ${index + 1}B`,
    status: "scheduled",
    tv: "TBA",
    stadium: "TBA"
  }))
);

function knockoutMatchesBefore(groupIndex) {
  return [
    1, 3, 3, 3, 2, 4, 2, 1, 2, 3, 1, 2, 1, 1, 1, 1, 1
  ].slice(0, groupIndex).reduce((sum, count) => sum + count, 0);
}

const matches = [...groupStageMatches, ...knockoutMatches].map((match) => ({
  status: match.status || "scheduled",
  phase: "Group Stage",
  stadium: "TBA",
  ...match
}));

function withLiveStatus(match) {
  if (match.score) return match;
  if (!match.kickoffEt) return match;
  const kickoff = new Date(match.kickoffEt).getTime();
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  if (now >= kickoff && now < kickoff + twoHours) return { ...match, status: "live" };
  if (now >= kickoff + twoHours) return { ...match, status: "completed", score: "Result pending" };
  return match;
}

function sendJson(res, payload) {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript" };
    res.writeHead(200, { "Content-Type": `${types[ext] || "application/octet-stream"}; charset=utf-8` });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/matches") {
    const liveMatches = matches.map(withLiveStatus);
    sendJson(res, {
      tournament: "FIFA World Cup 2026",
      timezone: "Asia/Dhaka",
      source: sourceInfo,
      generatedAt: new Date().toISOString(),
      matches: liveMatches
    });
    return;
  }
  if (url.pathname === "/api/health") {
    sendJson(res, { ok: true, time: new Date().toISOString() });
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`World Cup 2026 BD website running at http://localhost:${PORT}`);
});
