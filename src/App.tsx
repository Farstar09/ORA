import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Gamepad2, Shield } from "lucide-react";

const glow =
  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-transparent before:blur-3xl before:content-['']";

const clampInt = (n: any, min: number, max: number) => {
  const v = Number.isFinite(n) ? Math.trunc(n) : 0;
  return Math.min(max, Math.max(min, v));
};

if (false) {
  const t = (name: string, cond: boolean) => {
    if (!cond) throw new Error(name);
  };
  t("clampInt basic", clampInt(5, 0, 10) === 5);
  t("clampInt low", clampInt(-5, 0, 10) === 0);
  t("clampInt high", clampInt(50, 0, 10) === 10);
  t("clampInt nonfinite", clampInt(Number.NaN, 0, 10) === 0);
  t("clampInt trunc", clampInt(9.9, 0, 10) === 9);
  t("clampInt clampMax", clampInt(9999999, 0, 1000000) === 1000000);
  t("clampInt clampMin", clampInt(-9999999, 0, 1000000) === 0);
}

const ScrollIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs tracking-widest text-purple-400 z-40 pointer-events-none"
  >
    <span>SCROLL</span>
    <span className="w-px h-8 bg-gradient-to-b from-purple-400 to-transparent animate-pulse" />
  </motion.div>
);

const Avatar = ({ src, name }: { src?: string; name: string }) => (
  <div className="aspect-square w-40 h-40 mx-auto bg-black/40 rounded-md overflow-hidden flex items-center justify-center">
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <span className="text-2xl font-bold text-gray-400">{name.split(" ").map(n => n[0]).join("")}</span>
    )}
  </div>
);

const MediaBlock = ({
  src,
  poster,
  label = "Featured Media",
  autoplay = false
}: {
  src?: string;
  poster?: string;
  label?: string;
  autoplay?: boolean;
}) => (
  <div className="aspect-video rounded-xl bg-[#14141B] border border-purple-500/20 overflow-hidden">
    {src ? (
      <motion.video
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={autoplay}
        loop={autoplay}
        playsInline
        controls={!autoplay}
        className="w-full h-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: autoplay ? 1.06 : 1 }}
        transition={{ duration: 12, ease: "easeInOut" }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-gray-500">{label}</div>
    )}
  </div>
);

const Nav = () => (
  <motion.nav
    initial={{ y: -40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
  >
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-white font-extrabold tracking-[0.35em] hover:text-purple-400 transition">
        ORA
      </Link>
      <div className="space-x-8 text-sm uppercase tracking-wider">
        {["Home", "Teams", "Partners", "News", "About"].map(p => (
          <Link
            key={p}
            to={p === "Home" ? "/" : "/" + p.toLowerCase()}
            className="relative hover:text-purple-400 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-purple-500 hover:after:w-full after:transition-all"
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  </motion.nav>
);

const Page = ({
  title,
  children,
  centerTitle = true
}: {
  title: string;
  children: ReactNode;
  centerTitle?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="relative min-h-screen pt-32 px-6 max-w-7xl mx-auto"
  >
    <div
      className={`pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full ${glow}`}
    />
    <motion.h1
      style={{ textAlign: centerTitle ? "center" : "left" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
      className="relative text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 mb-10 tracking-wide"
    >
      {title}
    </motion.h1>
    {children}
  </motion.div>
);

const Stat = ({ value, label, Icon }: { value: number; label: string; Icon: any }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const end = useMemo(() => clampInt(Number(value), 0, 1000000), [value]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let current = 0;
    const duration = 1200;
    setCount(0);

    if (end <= 0) return;

    const steps = clampInt(end, 1, 120);
    const increment = Math.max(1, Math.floor(end / steps));
    const stepTime = Math.max(16, Math.floor(duration / steps));

    const timer = setInterval(() => {
      current = Math.min(end, current + increment);
      setCount(current);
      if (current >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [end, inView]);

  return (
    <div ref={ref} className="text-center flex flex-col items-center gap-3">
      <Icon className="w-7 h-7 text-purple-400" />
      <div className="text-4xl font-extrabold text-purple-400">{count}+</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
};

const Home = () => (
  <section className="relative min-h-screen pt-40 px-6 max-w-7xl mx-auto overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-[-200px] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-3xl" />
    </div>

    <div className="min-h-[75vh] grid lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-purple-600 drop-shadow-[0_0_32px_rgba(168,85,247,0.85)] drop-shadow-[0_0_55px_rgba(168,85,247,0.7)]">
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[120%] rounded-full blur-md opacity-50 -z-10 transition-opacity duration-700"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(168,85,247,0.6) 0%, rgba(217,70,239,0.45) 45%, rgba(0,0,0,0) 70%)"
              }}
            />
            ORA
          </span>
          <span className="block text-white">Esports</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-10">
          A modern esports & content organization competing at the highest level and shaping culture beyond the game.
        </p>

        <div className="flex gap-6 mb-12">
          <Link
            to="/teams"
            className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-md font-semibold shadow-lg hover:scale-105 transition"
          >
            View Teams
          </Link>
          <Link to="/about" className="px-8 py-4 border border-white/20 rounded-md hover:bg-white/5 transition">
            About ORA
          </Link>
        </div>

        <a
          href="https://discord.gg/ora"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-purple-400 px-6 py-3 rounded-full font-semibold hover:bg-white/5 transition"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Join the ORA Discord — Live Now
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <MediaBlock label="Featured Media / Highlight" />
      </motion.div>
    </div>

    <div className="min-h-[55vh] flex items-center justify-center">
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-14">
          <Stat value={1000} label="Players" Icon={Users} />
          <Stat value={5} label="Games" Icon={Gamepad2} />
          <Stat value={20} label="Staff" Icon={Shield} />
        </div>
      </div>
    </div>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {[
        { title: "Elite Competition", desc: "Built to compete at the highest level of Valorant." },
        { title: "Content & Media", desc: "Creating engaging content beyond the server." },
        { title: "Community Driven", desc: "A brand powered by players, creators, and fans." }
      ].map(item => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-[#14141B] border border-purple-500/20 rounded-xl p-8"
        >
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.desc}</p>
        </motion.div>
      ))}
    </div>

    <div className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
      <div className="bg-[#14141B] border border-purple-500/20 rounded-xl p-10">
        <h2 className="text-3xl font-bold mb-4">The ORA Roster</h2>
        <p className="text-gray-400 mb-6">Meet the players and staff representing ORA in competition.</p>
        <Link
          to="/teams"
          className="inline-block px-8 py-4 bg-white text-black rounded-md font-semibold hover:bg-gray-200 transition"
        >
          View Team
        </Link>
      </div>
      <div className="bg-[#14141B] border border-purple-500/20 rounded-xl p-10">
        <h2 className="text-3xl font-bold mb-4">Latest News</h2>
        <p className="text-gray-400 mb-6">Announcements, updates, and organization highlights.</p>
        <Link to="/news" className="inline-block px-8 py-4 border border-white/20 rounded-md hover:bg-white/5 transition">
          Read News
        </Link>
      </div>
    </div>
  </section>
);

const mainPlayers = [
  { name: "AsianVyn", role: "Duelist", img: "/players/asianvyn.jpg" },
  { name: "Dillon", role: "Smokes", img: "/players/dillon.jpg" },
  { name: "JaxJabs", role: "Flex", img: "/players/jaxjabs.jpg" },
  { name: "Kayyr", role: "Sentinel", img: "/players/kayyr.jpg" },
  { name: "Sinaq", role: "IGL / Recon", img: "/players/sinaq.jpg" }
];

const teamStaff = [
  { name: "Crusty", role: "Head Coach", img: "/staff/crusty.jpg" },
  { name: "Bobby", role: "Analyst", img: "/staff/bobby.jpg" },
  { name: "ENvi", role: "Manager", img: "/staff/envi.jpg" }
];

const Teams = () => (
  <Page title="ORA eSports" centerTitle={false}>
    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
      <div>
        <h2 className="text-3xl font-bold mb-4">ORA eSports</h2>
        <p className="text-gray-300 mb-6 max-w-xl">
          ORA eSports is our sole competitive team, representing the organization across top-level tournaments and leagues.
        </p>
        <ul className="space-y-2 text-gray-400">
          <li>Primary Game: Valorant</li>
          <li>Region: North America</li>
          <li>Status: Active</li>
        </ul>
      </div>
      <MediaBlock src="/media/team-highlight.mp4" autoplay label="Team Highlight" />
    </div>

    <div className="mb-24">
      <h2 className="text-3xl font-bold mb-8">Main Roster</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
        {mainPlayers.map(p => (
          <div key={p.name} className="bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden">
            <Avatar src={p.img} name={p.name} />
            <div className="p-6 text-center">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-400">{p.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h2 className="text-3xl font-bold mb-8">Team Staff</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {teamStaff.map(s => (
          <div key={s.name} className="bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden">
            <Avatar src={s.img} name={s.name} />
            <div className="p-6 text-center">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-400">{s.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

const Partners = () => (
  <Page title="Partners">
    <div className="max-w-4xl mb-16 text-center mx-auto">
      <p className="text-gray-300 text-lg">
        ORA works with partners who align with our competitive vision, creative direction, and long-term growth.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-5xl mx-auto">
      <div className="group bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="aspect-video bg-black/40 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Partner Image</span>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold">Bocarnity</h3>
          <p className="text-sm text-gray-400">Partner</p>
        </div>
      </div>

      {["TBD", "TBD"].map((label, i) => (
        <div
          key={i}
          className="group bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden flex flex-col items-center justify-center h-[260px]"
        >
          <span className="text-gray-500 text-lg">{label}</span>
        </div>
      ))}
    </div>

    <div className="mt-24 max-w-4xl mx-auto bg-[#14141B] border border-purple-500/20 rounded-xl p-12 text-center">
      <h2 className="text-3xl font-bold mb-4">Partner With ORA</h2>
      <p className="text-gray-400 mb-8">
        Interested in collaborating with ORA? We are open to partnerships across esports, content, and brand activations.
      </p>
      <a href="#" className="inline-block px-10 py-4 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition">
        Contact Us
      </a>
    </div>
  </Page>
);

const newsItems = [
  {
    title: "ORA announces new Valorant roster",
    excerpt: "ORA reveals its official competitive lineup ahead of the upcoming season.",
    date: "2026"
  },
  {
    title: "Deep tournament run incoming",
    excerpt: "The team prepares for a major run in upcoming high-stakes events.",
    date: "2026"
  },
  {
    title: "ORA expands content division",
    excerpt: "New creators and production initiatives join the ORA ecosystem.",
    date: "2026"
  }
];

const News = () => (
  <Page title="News">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {newsItems.map(item => (
        <motion.div
          key={item.title}
          whileHover={{ y: -6 }}
          className="group bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden"
        >
          <div className="aspect-video max-h-40 bg-black/40 flex items-center justify-center text-gray-500">
            News Image / Media
          </div>
          <div className="p-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{item.date}</span>
            <h3 className="text-xl font-semibold mt-2 mb-2 group-hover:text-white transition">{item.title}</h3>
            <p className="text-sm text-gray-400">{item.excerpt}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="mt-24 max-w-4xl mx-auto bg-[#14141B] border border-purple-500/20 rounded-xl p-12 text-center">
      <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
      <p className="text-gray-400 mb-8">Follow ORA for the latest announcements, match updates, and organization news.</p>
      <a href="#" className="inline-block px-10 py-4 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition">
        Follow ORA
      </a>
    </div>
  </Page>
);

const leadership = [
  { name: "The K", role: "Founder / Owner / eSports Director", img: "" },
  { name: "Moop", role: "Co-Owner / Community Director", img: "" }
];

const departments = [
  {
    name: "Tournament Production",
    slug: "tournament-production",
    description: "Broadcast, observing, and tournament operations staff",
    members: [
      { name: "RedStone", role: "Production Lead / Broadcaster", img: "" },
      { name: "Etir", role: "Director / Caster", img: "" },
      { name: "CarCashly", role: "Admin", img: "" },
      { name: "ScaredSora", role: "Observer", img: "" },
      { name: "Flowerful", role: "Observer", img: "" },
      { name: "Drew Muzac", role: "Caster", img: "" },
      { name: "Gareth", role: "Caster", img: "" }
    ]
  },
  {
    name: "General Staff",
    slug: "general-staff",
    description: "Organization and community staff",
    members: [
      { name: "VOLT", role: "Discord Staff", img: "" },
      { name: "Awaity", role: "Discord Staff", img: "" },
      { name: "Brohan", role: "Discord Staff", img: "" },
      { name: "Jorge", role: "Discord Staff", img: "" },
      { name: "Ava", role: "GC Manager", img: "" }
    ]
  }
];

const About = () => (
  <Page title="About ORA">
    <div className="max-w-3xl mb-16 text-center mx-auto">
      <p className="text-gray-300 text-lg">
        ORA is a competitive esports and content organization focused on long-term growth, professional operations, and
        meaningful impact within the esports ecosystem.
      </p>
    </div>

    <div className="mb-20">
      <h2 className="text-3xl font-bold mb-8">Leadership</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {leadership.map(m => (
          <div key={m.name} className="bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden">
            <Avatar src={m.img} name={m.name} />
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold">{m.name}</h3>
              <p className="text-sm text-gray-400">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h2 className="text-3xl font-bold mb-8">Departments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {departments.map(dep => (
          <Link
            key={dep.slug}
            to={`/about/${dep.slug}`}
            className="group relative bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden transition hover:border-purple-400/50"
          >
            <div className="relative h-40 flex items-center justify-center">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-purple-600/20 blur-xl" />
              </div>
              <span className="relative z-10 text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
                {dep.name
                  .split(" ")
                  .map(w => w[0])
                  .join("")}
              </span>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold">{dep.name}</h3>
              <p className="text-sm text-gray-400">View members</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </Page>
);

const DepartmentPage = ({
  name,
  description,
  members
}: {
  name: string;
  description: string;
  members: Array<{ name: string; role: string; img?: string }>;
}) => (
  <Page title={name}>
    <div className="mb-6 text-center">
      <Link to="/about" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition">
        ← Back to About
      </Link>
    </div>
    <p className="text-gray-300 max-w-2xl mx-auto mb-12 text-center">{description}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {members.map(member => (
        <div key={member.name} className="group bg-[#14141B] border border-purple-500/20 rounded-xl overflow-hidden">
          <Avatar src={member.img} name={member.name} />
          <div className="p-6 text-center">
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-gray-400">{member.role}</p>
          </div>
        </div>
      ))}
    </div>
  </Page>
);

const Footer = () => (
  <footer className="relative mt-32">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent blur-sm" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
        <div className="flex flex-col items-center sm:items-start">
          <span>© {new Date().getFullYear()} ORA Esports. All rights reserved.</span>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Link
              to="/terms"
              className="underline decoration-white/60 decoration-1 underline-offset-2 hover:text-purple-400 transition"
            >
              Terms
            </Link>
            <span className="opacity-40">|</span>
            <Link
              to="/privacy"
              className="underline decoration-white/60 decoration-1 underline-offset-2 hover:text-purple-400 transition"
            >
              Privacy
            </Link>
          </div>
        </div>
        <span className="mt-4 sm:mt-0">
          Built / Coded by{" "}
          <Link
            to="/st4r"
            className="text-purple-400 underline decoration-white/60 decoration-1 underline-offset-2 hover:text-purple-300 transition"
          >
            St4r
          </Link>
        </span>
      </div>
    </div>
  </footer>
);

const TermsPage = () => (
  <Page title="Terms of Service">
    <div className="max-w-4xl mx-auto space-y-8 text-gray-300">
      <p>
        Welcome to ORA Esports. By accessing or using this website, you agree to be bound by these Terms of Service.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Use of the Site</h2>
        <p>
          You may use this site for lawful purposes only. You agree not to misuse the site, attempt unauthorized access,
          or interfere with its operation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Intellectual Property</h2>
        <p>
          All content, branding, logos, media, and materials on this site are the property of ORA Esports unless otherwise
          stated. Unauthorized use is prohibited.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Limitation of Liability</h2>
        <p>
          ORA Esports is not liable for any damages arising from the use or inability to use this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Changes to These Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any
          changes.
        </p>
      </section>

      <div className="pt-8 text-center">
        <Link to="/" className="text-purple-400 hover:text-purple-300 transition">
          ← Back to Home
        </Link>
      </div>
    </div>
  </Page>
);

const PrivacyPage = () => (
  <Page title="Privacy Policy">
    <div className="max-w-4xl mx-auto space-y-8 text-gray-300">
      <p>
        ORA Esports respects your privacy. This policy explains how we handle information when you use our website.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Information Collection</h2>
        <p>
          We do not intentionally collect personal information through this website. Any information voluntarily shared
          (such as via contact or Discord) is handled responsibly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Cookies & Analytics</h2>
        <p>
          This site may use basic analytics or cookies to improve performance and user experience. No sensitive personal
          data is tracked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Third-Party Links</h2>
        <p>
          We are not responsible for the privacy practices of third-party sites linked from ORA Esports.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Policy Updates</h2>
        <p>
          This privacy policy may be updated periodically. Continued use of the site indicates acceptance of changes.
        </p>
      </section>

      <div className="pt-8 text-center">
        <Link to="/" className="text-purple-400 hover:text-purple-300 transition">
          ← Back to Home
        </Link>
      </div>
    </div>
  </Page>
);

const St4rPage = () => (
  <Page title="Built by St4r">
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <p className="text-gray-300 text-lg">
        This site is built and coded by St4r.
      </p>
      <p className="text-gray-400">
        DM <span className="text-purple-400 font-semibold">st4r.1</span> on Discord for bug fixes or personal inquiries.
      </p>
    </div>
  </Page>
);

const INTRO_HOLD_MS = 800;
const INTRO_SLOW_MS = 900;
const INTRO_FAST_MS = 700;
const INTRO_FADE_MS = 300;

const INTRO_LETTERS = [
  { char: "O", offsetX: -200, offsetY: 0 },
  { char: "R", offsetX: 0, offsetY: -200 },
  { char: "A", offsetX: 200, offsetY: 0 }
];

const Intro = ({ onHandoff, onDone }: { onHandoff: () => void; onDone: () => void }) => {
  const [phase, setPhase] = useState<"hold" | "spin" | "fade">("hold");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spin"), INTRO_HOLD_MS);
    const t2 = setTimeout(() => {
      setPhase("fade");
      onHandoff();
    }, INTRO_HOLD_MS + INTRO_SLOW_MS + INTRO_FAST_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onHandoff]);

  const total = INTRO_HOLD_MS + INTRO_SLOW_MS + INTRO_FAST_MS + INTRO_FADE_MS;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: INTRO_FADE_MS / 1000, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (phase === "fade") onDone();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.6, times: [0, 0.3, 1], ease: "easeOut" }}
        className="absolute inset-0 bg-white -z-10"
      />

      <div className="relative z-10 text-7xl font-extrabold tracking-[0.15em]">
        {INTRO_LETTERS.map((letter) => (
          <motion.span
            key={letter.char}
            className="inline-block bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            initial={{ rotate: 0, opacity: 0, scale: 0.6, x: letter.offsetX, y: letter.offsetY }}
            animate={{ 
              rotate: [0, 0, 360, 1080], 
              opacity: [0, 1, 1, 1], 
              scale: [0.6, 1.1, 1.15, 1], 
              x: [letter.offsetX, 0, 0, 0],
              y: [letter.offsetY, 0, 0, 0]
            }}
            transition={{
              duration: total / 1000,
              ease: [0.34, 1.56, 0.64, 1],
              times: [0, INTRO_HOLD_MS / total, (INTRO_HOLD_MS + INTRO_SLOW_MS) / total, 1]
            }}
          >
            {letter.char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);
  const [handoff, setHandoff] = useState(false);

  const handleHandoff = useCallback(() => setHandoff(true), []);
  const handleDone = useCallback(() => setIntroVisible(false), []);

  return (
    <>
      {introVisible ? (
        <Intro
          onHandoff={handleHandoff}
          onDone={handleDone}
        />
      ) : null}

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: handoff ? 0 : 80, opacity: handoff ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen bg-black text-white"
      >
        <Nav />
        <ScrollIndicator />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/st4r" element={<St4rPage />} />
          {departments.map(dep => (
            <Route
              key={dep.slug}
              path={`/about/${dep.slug}`}
              element={<DepartmentPage name={dep.name} description={dep.description} members={dep.members} />}
            />
          ))}
        </Routes>
        <Footer />
      </motion.div>
    </>
  );
}