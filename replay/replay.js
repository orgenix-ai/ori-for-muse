// Ori Replay viewer: renders one project's journey through Ori from its Replay link.
//   ?id=<replay id>            reads https://alpha.orgenix.ai/api/replay/<id>
//   ?id=<id>&api=<origin>      reads <origin>/api/replay/<id>
//   ?sample                    reads ./sample.json (a captured Replay, for offline viewing)

const params = new URLSearchParams(location.search);
const DEFAULT_API = "https://alpha.orgenix.ai";

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") el.className = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) if (child !== null && child !== undefined && child !== false) el.append(child);
  return el;
};

const ROOMS = [
  ["direction", "Direction", "Ori's Direction lead talks with the founder to pin down who the app is for and how it should feel."],
  ["design", "Design Studio", "Ori's designers propose distinct looks; the founder picks one."],
  ["plan", "Plan", "Ori's analyst turns the direction into a product plan: users, journeys, capabilities, and the questions it needed answered."],
  ["prototype", "Prototype", "A clickable prototype of every journey, for the founder to try before anything is built."],
  ["architecture", "Architecture", "Ori's architect settles how it will be built, and its reviewers challenge the plan before code is written."],
  ["build", "Build & QA", "Ori's developers build it; independent QA tests every journey and sends it back until it passes."],
  ["live", "Live", "The finished app, hosted."],
];

async function load() {
  if (params.has("sample")) return (await fetch("./sample.json")).json();
  const id = params.get("id");
  if (!id) throw new Error("Open this page with ?id=<Replay id>, or ?sample to see the bundled example.");
  const api = params.get("api") || DEFAULT_API;
  const response = await fetch(`${api.replace(/\/$/, "")}/api/replay/${encodeURIComponent(id)}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `The Replay didn't load (HTTP ${response.status}).`);
  return body;
}

const empty = (text) => h("p", { class: "empty" }, text);

function room(key, index, ...content) {
  const [, title, what] = ROOMS.find(([k]) => k === key);
  return h("section", { class: "room", id: key }, h("h2", {}, `${index}. ${title}`), h("p", { class: "what" }, what), ...content);
}

function render(view) {
  document.title = `${view.project.name} · Ori Replay`;
  const p = view.project;
  const chips = [
    p.models.length ? h("span", { class: "chip" }, "Models ", h("b", {}, p.models.join(", "))) : null,
    p.wallMinutes ? h("span", { class: "chip" }, "Idea to tested app ", h("b", {}, `${Math.floor(p.wallMinutes / 60)} h ${p.wallMinutes % 60} min`)) : null,
    p.costUsd ? h("span", { class: "chip" }, "AI cost ", h("b", {}, `$${p.costUsd.toFixed(2)}`)) : null,
    view.build.state === "qa_passed" ? h("span", { class: "chip" }, h("b", {}, "QA passed")) : null,
  ];

  const d = view.direction;
  const direction = room(
    "direction",
    1,
    d.summary ? h("p", {}, h("b", {}, "The app in one sentence: "), d.summary) : null,
    d.integrations.length ? h("p", {}, "Connects to: ", ...d.integrations.map((i) => h("span", { class: "badge" }, i))) : null,
    h("h3", {}, "The conversation"),
    d.conversation.length
      ? d.conversation.flatMap((turn) => [
          turn.founder ? h("div", { class: "bubble founder" }, h("div", { class: "who" }, "Founder"), turn.founder) : null,
          turn.ori ? h("div", { class: "bubble ori" }, h("div", { class: "who" }, "Ori"), turn.ori) : null,
        ])
      : empty("No conversation recorded."),
  );

  const design = room(
    "design",
    2,
    view.design.looks.length
      ? h("div", { class: "grid" }, view.design.looks.map((look) =>
          h("div", { class: look.chosen ? "card chosen" : "card" }, h("h4", {}, look.name, look.chosen ? h("span", { class: "badge" }, " chosen") : null), look.description ? h("p", {}, look.description) : null)))
      : empty("This project went straight from direction to plan; no looks were recorded."),
  );

  const pl = view.plan;
  const plan = room(
    "plan",
    3,
    pl.vision ? h("p", {}, h("b", {}, "Vision: "), pl.vision) : null,
    pl.users.length ? [h("h3", {}, "Who it's for"), h("ul", { class: "plain" }, pl.users.map((u) => h("li", {}, u)))] : null,
    h("h3", {}, `Journeys (${pl.journeys.length})`),
    pl.journeys.length
      ? h("div", { class: "grid" }, pl.journeys.map((j) => h("div", { class: "card" }, h("h4", {}, j.title), j.goal ? h("p", {}, j.goal) : null)))
      : empty("No journeys yet."),
    pl.capabilities.length ? [h("h3", {}, `Capabilities (${pl.capabilities.length})`), h("ul", { class: "plain" }, pl.capabilities.map((c) => h("li", {}, c)))] : null,
    pl.questionsAnswered.length
      ? [h("h3", {}, "Questions Ori asked the founder"), h("ul", { class: "plain" }, pl.questionsAnswered.map((q) => h("li", {}, q)))]
      : null,
  );

  const prototype = room(
    "prototype",
    4,
    view.prototype.appName ? h("p", {}, h("b", {}, view.prototype.appName), " — every journey drawn as clickable screens.") : null,
    view.prototype.shareUrl ? h("a", { class: "button", href: view.prototype.shareUrl, target: "_blank", rel: "noopener" }, "Open the clickable prototype") : empty("The prototype isn't shared for this project."),
  );

  const a = view.architecture;
  const architecture = room(
    "architecture",
    5,
    h("h3", {}, `Decisions (${a.decisions.length})`),
    a.decisions.length ? h("ul", { class: "plain" }, a.decisions.map((x) => h("li", {}, x.settled ? h("span", { class: "badge pass" }, "settled") : h("span", { class: "badge warn" }, "open"), x.summary))) : empty("No decisions recorded."),
    a.reviewFindings.length
      ? [h("h3", {}, `What Ori's reviewers caught (${a.reviewFindings.length})`), h("ul", { class: "plain" }, a.reviewFindings.map((f) => h("li", {}, f.severity ? h("span", { class: f.severity === "minor" ? "badge" : "badge warn" }, f.severity) : null, f.summary)))]
      : null,
  );

  const b = view.build;
  const build = room(
    "build",
    6,
    h("h3", {}, "Independent QA"),
    b.qaRounds.length
      ? h("div", { class: "timeline" }, b.qaRounds.flatMap((r, i) => [
          i ? h("span", { class: "arrow" }, "→") : null,
          h("div", { class: "step" }, `Round ${r.round}: `, h("span", { class: r.verdict === "pass" ? "badge pass" : "badge warn" }, r.verdict || "running"), r.findings ? ` ${r.findings} findings sent back to fix` : null),
        ]))
      : empty("QA hasn't run yet."),
    b.qualityStandards.length
      ? h("details", {}, h("summary", {}, `The ${b.qualityStandards.length} quality standards QA held it to`), h("ul", { class: "plain" }, b.qualityStandards.map((s) => h("li", {}, s))))
      : null,
  );

  const live = room("live", 7, view.live.url ? h("a", { class: "button", href: view.live.url, target: "_blank", rel: "noopener" }, "Open the live app") : empty("Not hosted yet."));

  const nav = h("nav", { class: "rooms", "aria-label": "Rooms" }, ROOMS.map(([key, title], i) => h("a", { href: `#${key}` }, h("span", { class: "n" }, String(i + 1)), title)));
  const app = document.getElementById("app");
  app.replaceChildren(
    h("div", { class: "hero" }, h("h1", {}, p.name), h("p", { class: "lead" }, d.summary || "An app built by Ori's AI team."), h("div", { class: "chips" }, chips)),
    h("div", { class: "layout" }, nav, h("div", {}, direction, design, plan, prototype, architecture, build, live)),
  );
  app.hidden = false;
  document.getElementById("status").remove();

  const links = [...nav.querySelectorAll("a")];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) link.classList.toggle("on", link.getAttribute("href") === `#${entry.target.id}`);
      }
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );
  for (const section of app.querySelectorAll("section.room")) observer.observe(section);
}

load()
  .then(render)
  .catch((error) => {
    document.getElementById("status").textContent = error.message;
  });
