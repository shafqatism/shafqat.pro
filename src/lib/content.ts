// Static site content. Pages are prerendered from this file, so edits here ship on the next build.
// Runtime-editable values (SEO, tracking IDs, contact details) live in Supabase `site_settings`.

export const profile = {
  name: "Shafqat Rasool",
  role: "Technology Leader & Software Architect",
  headline: "I don't just write code. I build what's next.",
  subheadline: "Transforming complex business challenges into scalable digital solutions.",
  bio: "Technology Leader, Software Architect, and Digital Strategist with 10+ years of experience building scalable software, SaaS platforms, web applications, mobile solutions, and cloud-native systems.",
  email: "info@shafqat.pro",
  phone: "+92 304 5101870",
  whatsapp: "923045101870",
  location: "Pakistan · Working globally",
  confidentiality:
    "All discussions, technical specifications, and project ideas remain 100% confidential under mutual NDA standards.",
  tagline: "Architecting scalable digital solutions through engineering, strategy, and innovation.",
  footerLine: "Software Architecture · Shopify & Mobile · Cloud Engineering",
  socials: {
    linkedin: "https://www.linkedin.com/in/shafqatism/",
    instagram: "https://www.instagram.com/shafqatpro",
    facebook: "https://www.facebook.com/shafqatdotpro",
    github: "https://github.com/shafqatrasool",
    twitter: "https://twitter.com/shafqatrasool",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
] as const;

export const stats = [
  { value: "10+", label: "Years", detail: "Enterprise systems, cloud architecture & technical strategy" },
  { value: "42", label: "Projects shipped", detail: "Mobile, Shopify, SaaS & custom platforms, from MVPs to enterprise" },
  { value: "5M+", label: "App users", detail: "App Store & Play Store published solutions" },
  { value: "96", label: "PageSpeed", detail: "Core Web Vitals on high-converting Shopify Plus stores" },
] as const;

export const capabilities = [
  {
    title: "Software Architecture",
    kicker: "High-Availability Distributed Systems",
    description:
      "Resilient microservices, clean domain boundaries, and event-driven patterns engineered for zero downtime and sub-second latencies.",
    skills: ["Microservices & Domain-Driven Design", "Clean Architecture & SOLID", "High-Throughput REST & GraphQL APIs", "Zero-Trust Security & API Gateways"],
  },
  {
    title: "E-Commerce & Shopify",
    kicker: "Enterprise Shopify Plus & Custom Stores",
    description: "Bespoke Liquid themes, headless storefronts, and conversion-focused checkout funnels that load in under a second.",
    skills: ["Shopify Plus & Custom Liquid", "Headless Storefront API", "CRO & Bundle Builders", "Core Web Vitals 90+"],
  },
  {
    title: "Mobile Engineering",
    kicker: "Production iOS & Android Solutions",
    description: "Native and cross-platform apps with real-time sync, subscriptions, and offline-first architecture — shipped to both stores.",
    skills: ["Swift & SwiftUI", "Kotlin & Android SDK", "Flutter & React Native", "StoreKit, Play Billing & RevenueCat"],
  },
  {
    title: "Cloud & DevOps",
    kicker: "Scalable Multi-Region Infrastructure",
    description: "Containerised workloads, CI/CD pipelines, and observability on AWS and Azure that scale with your traffic, not your headcount.",
    skills: ["AWS & Azure", "Docker & ECS", "CI/CD Automation", "OpenTelemetry & Monitoring"],
  },
  {
    title: "Product Strategy",
    kicker: "MVP to Market-Leading Scale",
    description: "Roadmaps, business modeling, and technical due diligence that turn ideas into products customers pay for.",
    skills: ["Product Roadmaps", "MVP Scoping", "Technology Consulting", "Data-Driven Growth"],
  },
] as const;

export const topology = [
  {
    layer: "L1",
    title: "Client & Edge Delivery",
    description: "Global CDN caching, server-side rendering, and responsive hydration for instant first paint anywhere.",
    tech: ["Next.js", "CloudFront", "SSR / ISR", "Edge Caching"],
  },
  {
    layer: "L2",
    title: "API Gateway & Security Boundary",
    description: "Centralised routing, JWT/OAuth2 validation, rate limiting, and SSL termination with zero-trust auth and DDoS protection.",
    tech: ["FastAPI", "Express Gateway", "OAuth2 / JWT", "Rate Limiting", "TLS 1.3", "WAF"],
  },
  {
    layer: "L3",
    title: "Distributed Services & Business Logic",
    description: "Domain-driven microservices, asynchronous task queues, and state machines that isolate failure and scale independently.",
    tech: ["Node.js", "Python", "Celery", "RabbitMQ", "Redis"],
  },
  {
    layer: "L4",
    title: "Data Persistence & Cloud Infrastructure",
    description: "ACID transactions, in-memory caching, and encrypted object storage on multi-region cloud infrastructure.",
    tech: ["PostgreSQL", "TimescaleDB", "S3", "Docker", "AWS / Azure"],
  },
] as const;

export const process = [
  {
    step: "01",
    title: "Discover & Strategize",
    description: "Requirements specification, business alignment, feasibility and risk analysis, and an architecture roadmap.",
  },
  {
    step: "02",
    title: "Architect & Design",
    description: "System blueprints, data models, API contracts, and UX flows reviewed with you before a line of code is written.",
  },
  {
    step: "03",
    title: "Build & Engineer",
    description: "Iterative sprints with weekly demos, automated tests, and CI/CD so you always see real progress.",
  },
  {
    step: "04",
    title: "Launch & Evolve",
    description: "Production launch, monitoring, performance tuning, and a growth roadmap for what comes next.",
  },
] as const;

export type Service = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  capabilities: string[];
  tech: string[];
  icon: "code" | "globe" | "layers" | "smartphone" | "cloud" | "rocket";
};

export const services: Service[] = [
  {
    slug: "software-architecture",
    number: "01",
    title: "Software Architecture & Development",
    summary: "Custom software and backend systems designed for reliability, security, and scale from day one.",
    capabilities: ["Custom Software Development", "Software Architecture", "Backend Engineering", "API Development & Integration", "Microservices"],
    tech: ["Python", "FastAPI", "Node.js", "REST APIs", "Microservices", "PostgreSQL"],
    icon: "code",
  },
  {
    slug: "web-development",
    number: "02",
    title: "Website & Web App Development",
    summary: "Lightning-fast websites, Shopify stores, and web apps that rank, convert, and scale.",
    capabilities: ["Custom Websites", "Shopify & E-Commerce", "Web Applications", "Performance Optimization", "Responsive Design"],
    tech: ["React", "Next.js", "Shopify Liquid", "TypeScript", "Tailwind CSS"],
    icon: "globe",
  },
  {
    slug: "saas-development",
    number: "03",
    title: "SaaS & Product Development",
    summary: "Multi-tenant SaaS platforms and MVPs with billing, roles, and the infrastructure to grow.",
    capabilities: ["SaaS Platforms", "Product Architecture", "MVP Development", "Application Modernization", "Product Scaling"],
    tech: ["Multi-Tenancy", "Subscription Billing", "Role-Based Access", "Docker", "CI/CD"],
    icon: "layers",
  },
  {
    slug: "mobile-app-development",
    number: "04",
    title: "Mobile Application Development",
    summary: "iOS, Android, and cross-platform apps published to the App Store and Google Play.",
    capabilities: ["iOS App Development", "Android App Development", "Cross-Platform Flutter & React Native", "Backend & API Integration", "Mobile UX"],
    tech: ["Swift", "Kotlin", "React Native", "Flutter", "Firebase", "App Store Connect"],
    icon: "smartphone",
  },
  {
    slug: "cloud-engineering",
    number: "05",
    title: "Cloud Engineering & Infrastructure",
    summary: "Cloud-native architecture on AWS and Azure that stays fast, secure, and cost-efficient.",
    capabilities: ["AWS & Azure Solutions", "Cloud Architecture", "Cloud-Native Applications", "Infrastructure Planning", "Scalable Backends"],
    tech: ["AWS", "Azure", "Docker", "Redis", "CloudFront"],
    icon: "cloud",
  },
  {
    slug: "product-strategy",
    number: "06",
    title: "Product Strategy & Digital Growth",
    summary: "Strategy, branding, and growth systems that turn technology into business results.",
    capabilities: ["Product Strategy", "Technology Consulting", "Project Management", "Business Modeling", "Branding & UI/UX", "Digital Marketing Integration"],
    tech: ["Design Systems", "Product Roadmaps", "Data Analytics", "Agile Execution"],
    icon: "rocket",
  },
];

export const products = [
  {
    number: "01",
    name: "Modular Enterprise ERP & Supply Chain Suite",
    category: "ERP Solutions",
    licensing: "Enterprise Licensing / Custom Deployment",
    tagline: "End-to-end inventory, procurement & financial automation.",
    description:
      "Modular ERP for multi-warehouse retail and distribution. Unifies real-time stock across e-commerce channels, automates PO procurement, and delivers GAAP-compliant financial auditing.",
    features: ["Multi-warehouse inventory reservation & barcode management", "Vendor procurement & PO approval hierarchy", "Double-entry ledger accounting & reports", "Multi-tier role-based access control"],
    stack: ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Celery", "Redis"],
    benchmarks: ["94% reduction in warehouse stockouts", "Manual reconciliations eliminated across 12 warehouses", "Sub-100ms multi-channel stock sync"],
    useCases: ["E-Commerce Distribution", "Manufacturing Supply Chains", "Wholesale Distributors"],
  },
  {
    number: "02",
    name: "Cloud-Native Multi-Tenant SaaS Engine",
    category: "SaaS Platforms",
    licensing: "Commercial License & Custom White-Label",
    tagline: "Turnkey architecture for subscription software companies.",
    description:
      "Tenant-isolated database schemas, Stripe billing lifecycle hooks, team hierarchies, and audit logging — the foundation of a SaaS business, ready on day one.",
    features: ["Isolated tenant schemas with zero cross-tenant leakage", "Subscription tiers, usage meters & pro-rated billing", "OAuth2, SAML SSO & magic-link auth", "Real-time health dashboards"],
    stack: ["Next.js", "Python FastAPI", "PostgreSQL", "Stripe API", "AWS ECS", "Docker"],
    benchmarks: ["4-week average MVP launch", "70% faster time-to-market"],
    useCases: ["B2B SaaS Startups", "Internal Enterprise Tools", "Subscription Membership Portals"],
  },
  {
    number: "03",
    name: "High-Throughput API Gateway & Microservices Core",
    category: "Automation Solutions",
    licensing: "Architectural Implementation Blueprint",
    tagline: "Event-driven infrastructure for stateless container services.",
    description:
      "Orchestrates stateless container services with distributed rate limiting, JWT validation, auto-generated Swagger/OpenAPI docs, and full telemetry.",
    features: ["Redis distributed rate limiting", "Auto OpenAPI docs + sandbox", "Circuit-breaker resilience", "Structured JSON logging + OpenTelemetry tracing"],
    stack: ["Node.js", "Python", "Redis", "Docker", "Azure", "RabbitMQ"],
    benchmarks: ["Sub-30ms routing latency", "99.99% uptime during peak traffic"],
    useCases: ["Legacy Monolith Modernization", "High-Volume Mobile Backends", "Multi-Service Ecosystems"],
  },
] as const;

export type ProjectCategory = "Mobile Apps" | "Shopify" | "WooCommerce" | "WordPress" | "Magento" | "Custom Development" | "SaaS";

export type Project = {
  slug: string;
  name: string;
  category: ProjectCategory;
  region: string;
  summary: string;
  stack: string[];
  metrics?: string[];
  links?: { label: string; href: string }[];
  featured?: boolean;
  caseStudy?: {
    client?: string;
    role: string;
    overview: string;
    problem: string;
    solution: string;
    outcomes: string[];
  };
};

export const projects: Project[] = [
  // ------------------------------- Mobile -------------------------------
  {
    slug: "parlay-j-way",
    name: "Parlay J-Way Sports Intelligence",
    category: "Mobile Apps",
    region: "US / Global",
    summary: "NBA, NFL & MLB analytics with real-time picks, in-app analyst chat, and VIP subscriptions.",
    stack: ["Flutter", "Dart", "StoreKit", "Google Play Billing", "RevenueCat", "WebSockets", "Firebase APNs"],
    metrics: ["Dual-store release", "Sub-10-min chat response", "60fps dark-mode UX"],
    links: [
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.parlay.jway&hl=en" },
      { label: "App Store", href: "https://apps.apple.com/pk/app/parlay-j-way/id6740776649" },
    ],
    featured: true,
    caseStudy: {
      client: "Smooth Entertainment LLC",
      role: "Lead Mobile Architect & Cross-Platform Engineer",
      overview:
        "Real-time sports picks, \"Everybody Eats\" editorial recaps, 24/7 in-app analyst chat, and RevenueCat subscriptions ($75/mo Triumph Weekly with a 7-day trial).",
      problem: "Cross-platform subscriptions across StoreKit and Play Billing, plus real-time push notifications for line movements.",
      solution: "An abstract billing facade on RevenueCat with webhook sync, and low-latency APNs/FCM delivery.",
      outcomes: ["Dual store releases (iOS id6740776649 / com.parlay.jway)", "Sub-10-minute analyst chat response", "60fps dark-mode UX"],
    },
  },
  {
    slug: "offline-music-player",
    name: "Offline Music Player: Video Player MP3",
    category: "Mobile Apps",
    region: "Global",
    summary: "Lossless audio and up-to-6K video playback with a 5-band EQ — 1M+ downloads at 4.5★.",
    stack: ["Android SDK", "Kotlin", "ExoPlayer", "Audio Effects API", "ID3 Tag Engine", "OpenGL"],
    metrics: ["1M+ downloads", "4.5★ rating", "1.42K+ reviews"],
    links: [{ label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.konceptsol.musicapp.audio.video.sound.mp3player.offlinemusic" }],
    featured: true,
    caseStudy: {
      client: "KonceptSol",
      role: "Principal Multimedia Engineer",
      overview:
        "Lossless codecs (mp3, wav, alac, m4a, flac, aiff, ogg), 5-band EQ (60Hz–14kHz), Bass Boost, Loudness Gain, 3D Virtualizer, 1080p–6K video, and ID3 metadata grouping.",
      problem: "Zero-buffering local video and sub-1% battery drain across thousands of fragmented Android devices.",
      solution: "A native C++ audio pipeline buffer combined with ExoPlayer hardware decoding and aggressive memory recycling.",
      outcomes: ["1M+ downloads", "4.5★ from 1.42K+ reviews", "Sub-1% battery drain during playback"],
    },
  },
  {
    slug: "caber-world",
    name: "Caber World Ride-Hailing",
    category: "Mobile Apps",
    region: "Pakistan / Middle East",
    summary: "Passenger-proposed fare bidding, live map polylines, and fair driver compensation — rated 4.9★.",
    stack: ["Flutter", "BLoC", "WebSockets", "Google Maps SDK", "Node.js", "Redis Geohash"],
    metrics: ["4.9★ rating", "Zero lost bids at peak"],
    links: [{ label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.caber.world&hl=en" }],
    featured: true,
    caseStudy: {
      client: "CABER LLC",
      role: "Lead Mobile Architect",
      overview:
        "Passenger-proposed fare bids (no surge pricing), live Google Maps polylines, a 5-minute arrival grace counter with driver overtime compensation, offline itinerary cache, and a 5–20km driver search radius.",
      problem: "Sub-second fare negotiation and live location polling without draining batteries or dropping sockets.",
      solution: "A Flutter BLoC event architecture over duplex WebSockets with adaptive exponential-backoff reconnection.",
      outcomes: ["4.9★ store rating", "Zero lost bids at peak load"],
    },
  },
  {
    slug: "live-track-2",
    name: "Live Track 2 (Faros Tracking)",
    category: "Mobile Apps",
    region: "Global",
    summary: "IoT fleet telematics with live positioning, engine immobilization, and PDF trip reports.",
    stack: ["Flutter", "MQTT", "TCP", "GIS Mapping", "PDF Engine", "TimescaleDB"],
    metrics: ["10K+ installs", "4.6★ rating"],
    links: [{ label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.livetrack2" }],
    featured: true,
    caseStudy: {
      client: "Faros Tracking",
      role: "IoT Systems Architect & Lead Mobile Developer",
      overview:
        "Live positioning, 0–200 km/h speedometer, RPM tachometer, odometer, fleet status (Moving / Idle / Parked), engine-oil degradation counters, PDF trip reports, fuel audit logs, and remote engine immobilization.",
      problem: "High-frequency MQTT GPS telemetry from hundreds of OBD-II trackers without freezing the UI thread.",
      solution: "Asynchronous stream isolation and delta-compression of sensor packets.",
      outcomes: ["10K+ installs", "4.6★ rating", "Smooth real-time dashboards for hundreds of vehicles"],
    },
  },
  {
    slug: "tatkeer-series",
    name: "Tatkeer: Daily Muslim Quotes & Affirmations",
    category: "Mobile Apps",
    region: "Global (iOS)",
    summary: "Uthmanic Arabic typography, habit streaks, and lock-screen widgets for 5M+ users at 4.8★.",
    stack: ["Swift", "SwiftUI", "CoreData", "WidgetKit", "APNs", "Arabic Typography Engine"],
    metrics: ["5M+ users", "4.8★ rating", "33,000+ quotes", "68% 30-day widget retention"],
    links: [{ label: "App Store", href: "https://apps.apple.com/fr/app/tatkeer-daily-muslim-quotes/id6745698846" }],
    featured: true,
    caseStudy: {
      role: "iOS Architect & Typography Specialist",
      overview:
        "Stochastic reminders, Uthmanic Arabic typography, habit streaks (Daily Reader), a visual quote-card generator with Instagram/WhatsApp export, lock-screen widgets, and 33,000+ verses and Hadith with English translations.",
      problem: "Rendering Uthmanic calligraphy with correct diacritics on every iOS screen size within a 30MB bundle.",
      solution: "A custom vector glyph rendering engine and local SQLite indexing of 33,000 quotes.",
      outcomes: ["5M+ users worldwide", "4.8★ rating", "68% 30-day retention on lock-screen widgets"],
    },
  },
  {
    slug: "partypass",
    name: "PartyPass Event Ecosystem",
    category: "Mobile Apps",
    region: "Global",
    summary: "Event and nightlife ticketing with an integrated Web3 wallet (PPT token).",
    stack: ["Flutter", "Web3.js", "Ethereum / Polygon", "OAuth2"],
    links: [{ label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.partypass.partypass&hl=en" }],
  },
  {
    slug: "zm-solutions",
    name: "ZM Solutions Fleet Telematics",
    category: "Mobile Apps",
    region: "Pakistan",
    summary: "Cross-platform fleet monitoring for 469 vehicles with remote engine immobilization.",
    stack: ["Flutter", "MQTT", "CoreLocation", "MapKit"],
    metrics: ["469 vehicles monitored"],
    links: [
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zmsolutions2" },
      { label: "App Store", href: "https://apps.apple.com/pk/app/zm-solutions-pvt-ltd/id6746693256" },
    ],
  },
  {
    slug: "doctorvisions",
    name: "DoctorVisions: Clinical Wellness & Skincare",
    category: "Mobile Apps",
    region: "UAE",
    summary: "Doctor-curated health commerce with Shopify Storefront API and a QR engine.",
    stack: ["Flutter", "REST", "Shopify Storefront API", "QR Engine"],
    links: [{ label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.doctorvisions.shop" }],
  },
  {
    slug: "cloud-ride",
    name: "Cloud Ride Mobility & Transit",
    category: "Mobile Apps",
    region: "Pakistan",
    summary: "Cross-platform ride and transit app with live maps on both iOS and Android.",
    stack: ["Flutter", "MapKit", "CoreLocation", "Google Maps"],
    links: [
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.clouds.rides" },
      { label: "App Store", href: "https://apps.apple.com/pk/app/cloud-ride/id6738362717" },
    ],
  },
  {
    slug: "kavach-qr",
    name: "Kavach QR: Rapid Response Vehicle Safety",
    category: "Mobile Apps",
    region: "India",
    summary: "Windshield QR emergency profiles with encrypted data — rated 5.0★.",
    stack: ["Swift", "AVFoundation", "CryptoKit"],
    metrics: ["5.0★ rating"],
    links: [{ label: "App Store", href: "https://apps.apple.com/in/app/kavach-qr/id6479373315" }],
  },
  {
    slug: "studme",
    name: "SunPay / StudMe",
    category: "Mobile Apps",
    region: "France",
    summary: "Student perks and nightlife ticketing with beacons and Apple Pay — rated 5.0★.",
    stack: ["Swift", "CoreLocation Beacons", "Apple Pay"],
    metrics: ["5.0★ rating"],
    links: [{ label: "App Store", href: "https://apps.apple.com/fr/app/studme/id6737447037" }],
  },
  {
    slug: "qalbi-foods",
    name: "Qalbi Foods Mobile Ordering",
    category: "Mobile Apps",
    region: "Pakistan",
    summary: "Food ordering with live order tracking on Google Maps.",
    stack: ["Flutter", "Node.js", "PostgreSQL", "Google Maps API"],
    links: [{ label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.qalbi.qalbifoods" }],
  },
  // ------------------------------- Shopify -------------------------------
  {
    slug: "alezay",
    name: "Alezay Premium Tech & Electronics",
    category: "Shopify",
    region: "Kuwait / GCC",
    summary: "Shopify Plus electronics store with spec comparison, live search, and 96/100 mobile PageSpeed.",
    stack: ["Shopify Plus", "Liquid", "Tailwind CSS", "JavaScript", "Algolia Search"],
    metrics: ["96/100 mobile Core Web Vitals", "Sub-second rendering"],
    links: [{ label: "Visit site", href: "https://alezay.com" }],
    featured: true,
    caseStudy: {
      role: "Lead Shopify Plus Architect",
      overview:
        "A bespoke Liquid theme with asset tree-shaking, a spec comparison matrix, multi-currency checkout with local GCC gateways, and instant live search.",
      problem: "Heavy spec tables and high-resolution product imagery slowed mobile load times.",
      solution: "Replaced third-party plugins with vanilla Liquid sections and a responsive WebP image pipeline.",
      outcomes: ["96/100 mobile Core Web Vitals", "Sub-second rendering"],
    },
  },
  {
    slug: "virtuoso-bears",
    name: "Virtuoso Bears Musical Educational Toys",
    category: "Shopify",
    region: "US",
    summary: "HTML5 audio previews and a bundle builder for musical toys — 92/100 PageSpeed.",
    stack: ["Shopify", "Liquid", "HTML5 Audio", "JavaScript"],
    metrics: ["92/100 PageSpeed"],
    links: [{ label: "Visit site", href: "https://virtuosobears.com" }],
  },
  {
    slug: "my-sticky-little-secret",
    name: "My Sticky Little Secret",
    category: "Shopify",
    region: "US",
    summary: "CRO scripts, bundles, and Loox reviews for a fast-growing DTC brand — 88/100 PageSpeed.",
    stack: ["Shopify", "Liquid", "Loox", "CRO Scripts"],
    metrics: ["88/100 PageSpeed"],
    links: [{ label: "Visit site", href: "https://mystickylittlesecret.com" }],
  },
  {
    slug: "fabu-mama",
    name: "Fabu Mama Maternity & Infant Care",
    category: "Shopify",
    region: "US",
    summary: "Shopify Plus maternity store with Klaviyo flows and optimized checkout funnels.",
    stack: ["Shopify Plus", "Klaviyo", "Liquid", "Checkout Funnels"],
    metrics: ["85/100 PageSpeed"],
    links: [{ label: "Visit site", href: "https://fabumama.com" }],
  },
  {
    slug: "cherries-store",
    name: "Cherries Store Fashion & Apparel",
    category: "Shopify",
    region: "International",
    summary: "Custom Liquid fashion storefront powered by the Storefront API.",
    stack: ["Shopify", "Custom Liquid", "Storefront API"],
    links: [{ label: "Visit site", href: "https://cherriesstore.com" }],
  },
  {
    slug: "jaimadu",
    name: "Jaimadu Ethnic & Traditional Wear",
    category: "Shopify",
    region: "International",
    summary: "Custom sizing forms and multi-currency checkout for traditional fashion.",
    stack: ["Shopify", "Liquid", "Multi-Currency", "Custom Forms"],
    links: [{ label: "Visit site", href: "https://jaimadu.com" }],
  },
  {
    slug: "ishtar-alchemy",
    name: "Ishtar Alchemy Holistic Beauty & Perfumery",
    category: "Shopify",
    region: "UK",
    summary: "Editorial layouts and a fragrance discovery journey for a luxury beauty brand.",
    stack: ["Shopify", "Liquid", "Editorial Sections"],
    links: [{ label: "Visit site", href: "https://ishtaralchemy.com" }],
  },
  // --------------------------- WooCommerce / Magento ---------------------------
  {
    slug: "cbd-pure-cure",
    name: "CBD Pure Cure",
    category: "WooCommerce",
    region: "UK",
    summary: "WooCommerce wellness store with Authorize.net payments and CDN delivery.",
    stack: ["WooCommerce", "WordPress", "Authorize.net", "CDN"],
    links: [{ label: "Visit site", href: "https://cbdpurecure.co" }],
  },
  {
    slug: "pure-wellness",
    name: "Pure Wellness Health & Skincare",
    category: "WooCommerce",
    region: "Norway",
    summary: "Scandinavian skincare store with Klarna and Vipps checkout.",
    stack: ["WooCommerce", "Klarna", "Vipps"],
    links: [{ label: "Visit site", href: "https://purewellness.no" }],
  },
  {
    slug: "tights-no",
    name: "Tights.no High-Volume Activewear",
    category: "Magento",
    region: "Norway",
    summary: "High-volume Magento 2 store accelerated with Varnish, Redis, and Elasticsearch.",
    stack: ["Magento 2", "Varnish", "Redis", "Elasticsearch"],
    links: [{ label: "Visit site", href: "https://tights.no" }],
  },
  // ------------------------------ WordPress ------------------------------
  {
    slug: "baffling-mysteries",
    name: "Baffling Mysteries Media & Merch",
    category: "WordPress",
    region: "US",
    summary: "Podcast network site with RSS-driven episodes, an audio player, and merch.",
    stack: ["WordPress", "Podcast RSS", "Audio Player"],
    links: [{ label: "Visit site", href: "https://bafflingmysteries.com" }],
  },
  {
    slug: "planta-pk",
    name: "Planta.pk",
    category: "Custom Development",
    region: "Pakistan",
    summary: "Plant e-commerce with JazzCash and EasyPaisa local payments.",
    stack: ["WordPress", "JazzCash", "EasyPaisa", "MySQL"],
    links: [{ label: "Visit site", href: "https://planta.pk" }],
  },
  {
    slug: "sherrys-dekor",
    name: "Sherry's Dekor",
    category: "Custom Development",
    region: "US",
    summary: "Home décor showcase with aggressive image optimization.",
    stack: ["Next.js", "Image Optimization"],
    links: [{ label: "Visit site", href: "https://sherrysdekor.com" }],
  },
  // --------------------------- Custom Development ---------------------------
  {
    slug: "usmed",
    name: "USMED Enterprise Health E-Commerce",
    category: "Custom Development",
    region: "US",
    summary: "Enterprise medical supply commerce with CRM sync and secure document storage.",
    stack: ["Next.js", "FastAPI", "PostgreSQL", "AWS S3", "CRM Sync"],
    links: [{ label: "Visit site", href: "https://usmed.com" }],
    featured: true,
  },
  {
    slug: "scratch-pet-food",
    name: "Scratch Pet Food DTC Subscriptions",
    category: "Custom Development",
    region: "Australia",
    summary: "Headless React storefront with recurring subscription APIs.",
    stack: ["React", "Node.js", "Subscription APIs", "Headless"],
    links: [{ label: "Visit site", href: "https://scratchpetfood.com.au" }],
  },
  {
    slug: "space-girl-collection",
    name: "Space Girl Collection",
    category: "Custom Development",
    region: "US",
    summary: "Motion-rich fashion storefront with Stripe checkout.",
    stack: ["Motion UI", "Stripe", "JavaScript"],
    links: [{ label: "Visit site", href: "https://spacegirlcollection.com" }],
  },
  {
    slug: "bling-bijoux",
    name: "Bling Bijoux Fine Jewelry",
    category: "Custom Development",
    region: "International",
    summary: "Jewellery catalogue with custom filtering, zoom, and a currency switcher.",
    stack: ["JavaScript", "Custom Filtering", "Currency Switcher"],
    links: [{ label: "Visit site", href: "https://blingbijoux.com" }],
  },
  {
    slug: "gems-by-ava",
    name: "Silver Gems by Ava",
    category: "Custom Development",
    region: "US",
    summary: "React storefront with variant selection and live stock.",
    stack: ["React", "Variant Engine", "Live Stock"],
    links: [{ label: "Visit site", href: "https://gemsbyava.com" }],
  },
  {
    slug: "fragrapedia",
    name: "Fragrapedia",
    category: "Custom Development",
    region: "International",
    summary: "Fragrance encyclopedia with instant search over a large catalogue.",
    stack: ["Next.js", "PostgreSQL", "Instant Search"],
    links: [{ label: "Visit site", href: "https://fragrapedia.com" }],
  },
  {
    slug: "rubber-matting-co",
    name: "Rubber Matting Co UK",
    category: "Custom Development",
    region: "UK",
    summary: "B2B matting store with a weight-based pricing engine.",
    stack: ["PHP", "MySQL", "Pricing Engine"],
    links: [{ label: "Visit site", href: "https://rubbermattingco.co.uk" }],
  },
  {
    slug: "rubber-gym-flooring",
    name: "Rubber Gym Flooring UK",
    category: "Custom Development",
    region: "UK",
    summary: "Gym flooring store with an area / square-metre calculator.",
    stack: ["PHP", "MySQL", "Area Calculator"],
    links: [{ label: "Visit site", href: "https://rubbergymflooringuk.co.uk" }],
  },
  {
    slug: "gymnastic-mats-uk",
    name: "Gymnastic Mats UK",
    category: "Custom Development",
    region: "UK",
    summary: "Custom mat dimension configurator with dynamic pricing.",
    stack: ["PHP", "MySQL", "Configurator"],
    links: [{ label: "Visit site", href: "https://gymnasticmatsuk.co.uk" }],
  },
  {
    slug: "custom-boxes-usa",
    name: "Custom Boxes Co USA",
    category: "Custom Development",
    region: "US",
    summary: "3D packaging configurator with die-lines and instant quotes.",
    stack: ["Node.js", "Three.js", "Die-line Engine", "Instant Quotes"],
    links: [{ label: "Visit site", href: "https://customboxesco.com" }],
    featured: true,
  },
  {
    slug: "custom-boxes-australia",
    name: "Custom Boxes Co Australia",
    category: "Custom Development",
    region: "Australia",
    summary: "Packaging platform with online artwork proofing on AWS.",
    stack: ["Node.js", "AWS", "Online Proofing"],
    links: [{ label: "Visit site", href: "https://customboxesco.com.au" }],
  },
  {
    slug: "imperial-paper",
    name: "Imperial Paper Enterprise B2B Hub",
    category: "Custom Development",
    region: "US",
    summary: "B2B ordering hub with ERP sync and Elasticsearch-powered catalogue search.",
    stack: ["Next.js", "ERP Sync", "Elasticsearch"],
    links: [{ label: "Visit site", href: "https://imperialpaper.com" }],
  },
  {
    slug: "al-tawakkal-foods",
    name: "AL TAWAKKAL FOODS Global Export Portal",
    category: "Custom Development",
    region: "Global",
    summary: "Multilingual export portal with an inquiry engine for global buyers.",
    stack: ["Next.js", "Multilingual", "Inquiry Engine"],
    links: [{ label: "Visit site", href: "https://altawakkalfoods.com" }],
  },
  // ------------------------------- SaaS -------------------------------
  {
    slug: "apexcloud",
    name: "ApexCloud Multi-Tenant SaaS Engine",
    category: "SaaS",
    region: "Product",
    summary: "Multi-tenant SaaS engine with metered Stripe billing and row-level security.",
    stack: ["Next.js", "FastAPI", "PostgreSQL", "Stripe Metered Billing", "RLS"],
  },
  {
    slug: "districore",
    name: "DistriCore Enterprise ERP",
    category: "SaaS",
    region: "Product",
    summary: "Distribution ERP covering inventory, procurement, and accounting.",
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    slug: "omniflow",
    name: "OmniFlow Automation Pipeline",
    category: "SaaS",
    region: "Product",
    summary: "Workflow automation pipeline with distributed workers and queues.",
    stack: ["Python", "Celery", "RabbitMQ", "Redis"],
  },
  {
    slug: "pulsemetrics",
    name: "PulseMetrics Telemetry Platform",
    category: "SaaS",
    region: "Product",
    summary: "Time-series telemetry and observability platform.",
    stack: ["Go", "Next.js", "TimescaleDB", "OpenTelemetry"],
  },
];

export const projectCategories: ProjectCategory[] = ["Mobile Apps", "Shopify", "Custom Development", "SaaS", "WooCommerce", "WordPress", "Magento"];

// Measured outcomes from shipped projects (shown in the results marquee).
export const highlights = [
  { metric: "1M+", label: "downloads", project: "Offline Music Player" },
  { metric: "4.9★", label: "store rating, zero lost bids at peak", project: "Caber World" },
  { metric: "96/100", label: "mobile Core Web Vitals", project: "Alezay · Shopify Plus" },
  { metric: "5M+", label: "users, 68% widget retention", project: "Tatkeer" },
  { metric: "469", label: "vehicles monitored live", project: "ZM Solutions" },
  { metric: "94%", label: "fewer warehouse stockouts", project: "Enterprise ERP Suite" },
  { metric: "<30ms", label: "API gateway routing latency", project: "Microservices Core" },
  { metric: "4 weeks", label: "average SaaS MVP launch", project: "Multi-Tenant SaaS Engine" },
] as const;

export const techMarquee = [
  "Next.js", "React", "TypeScript", "Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS", "Azure",
  "Shopify Plus", "Flutter", "Swift", "Kotlin", "React Native", "Firebase", "Stripe", "RabbitMQ", "OpenTelemetry",
] as const;

// Meeting topics offered on /book-a-meeting. Titles must match booking.meetingTypes in site settings
// (editable in Admin → Settings); a title without an entry here shows without details.
export const meetingTopics: { title: string; summary: string; points: string[] }[] = [
  {
    title: "Discovery Call",
    summary: "A free introductory call to understand your idea and see how I can help.",
    points: ["Your business goals and context", "Current challenges and constraints", "Rough scope, budget and timeline", "Clear next steps"],
  },
  {
    title: "Software Architecture Review",
    summary: "A deep dive into how your system is designed and where it will break as you grow.",
    points: ["Current architecture and data flow", "Scalability and performance bottlenecks", "Monolith vs. microservices, API design", "Security, reliability and a refactoring roadmap"],
  },
  {
    title: "Custom Software & Backend Development",
    summary: "Planning a custom platform, backend or API built for your business.",
    points: ["Requirements and core features", "Tech stack (Python, FastAPI, Node.js, PostgreSQL)", "Third-party integrations and APIs", "Delivery plan and estimate"],
  },
  {
    title: "Website & Web App Development",
    summary: "A fast, SEO-ready website or web application.",
    points: ["Pages, features and user flows", "Next.js / React approach and CMS or admin needs", "Performance, Core Web Vitals and SEO", "Design, timeline and hosting"],
  },
  {
    title: "Shopify & E-Commerce Store",
    summary: "Launching, redesigning or scaling an online store.",
    points: ["Shopify / Shopify Plus or custom store", "Theme design, speed and conversion rate", "Payments, apps and integrations", "Migration from another platform"],
  },
  {
    title: "Mobile App Development (iOS / Android)",
    summary: "Turning an app idea into a published iOS and Android product.",
    points: ["App idea, users and key features", "Flutter, React Native or native Swift / Kotlin", "Subscriptions, payments and backend", "App Store & Google Play publishing"],
  },
  {
    title: "SaaS / MVP Development",
    summary: "Scoping and launching a SaaS product or MVP quickly and properly.",
    points: ["MVP scope and must-have features", "Multi-tenancy, roles and subscription billing", "Launch roadmap and milestones", "Scaling plan after launch"],
  },
  {
    title: "Cloud, DevOps & Infrastructure",
    summary: "Making your infrastructure reliable, secure and cost-efficient.",
    points: ["AWS / Azure setup and migration", "CI/CD pipelines and Docker", "Cloud cost optimisation", "Monitoring, backups and uptime"],
  },
  {
    title: "ERP & Business Automation",
    summary: "Automating operations: inventory, procurement, finance and workflows.",
    points: ["Current processes and pain points", "Inventory, warehouse and procurement modules", "Accounting and reporting needs", "Integrations with your store or tools"],
  },
  {
    title: "Product Strategy & Technical Consulting",
    summary: "Senior technical guidance for founders and teams.",
    points: ["Product roadmap and prioritisation", "Build vs. buy and technology choices", "Technical due diligence", "Team structure and hiring"],
  },
  {
    title: "Existing Project Support / Rescue",
    summary: "Help with a project that is stuck, slow or needs a new developer.",
    points: ["Code and architecture audit", "Bugs, performance and stability fixes", "Feature completion and handover", "Ongoing maintenance options"],
  },
  {
    title: "Partnership / Something Else",
    summary: "Agency partnerships, white-label work or anything not listed.",
    points: ["What you have in mind", "How we could work together", "Next steps"],
  },
];

export const faqs = [
  {
    q: "What kind of projects do you take on?",
    a: "Custom software, SaaS platforms, Shopify and e-commerce stores, iOS/Android apps, and cloud infrastructure — from MVPs for founders to modernisation of enterprise systems.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes. All discussions, technical specifications, and project ideas remain 100% confidential under mutual NDA standards.",
  },
  {
    q: "How do we get started?",
    a: "Book a free discovery call. We'll align on goals, scope, and risks, and you'll get an architecture roadmap with clear milestones.",
  },
  {
    q: "Do you work with clients outside Pakistan?",
    a: "Yes — clients across the US, UK, Europe, the Middle East, and Australia. Meetings are scheduled in your time zone.",
  },
] as const;
