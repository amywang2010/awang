/* ============================================================
   Content. One source of truth for the field panels and the
   professional resume view.
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});

  AW.content = {
    name: 'Amy Wang',
    email: 'amywangofficial@gmail.com',
    linkedin: 'https://www.linkedin.com/in/amy-wang-98a0072b7/',
    location: 'Richmond Hill, Ontario',
    headline: 'Grade 11 student at St. Robert C.H.S. Researcher at the Kellis Lab, MIT CSAIL. Founder of Heartware.',

    hero: {
      line1: 'Spatial genomics,',
      line2: 'drug discovery, and retinal imaging.',
      intro: 'I work with the Kellis Lab at MIT CSAIL on Mantis, a platform for navigating scientific data. My own research is on whether a statistical claim survives its assumptions. I also founded Heartware, a documentary and workshop programme for seniors in care homes.',
      meta: 'Richmond Hill, Ontario \u00b7 Grade 11 \u00b7 IB'
    },

    stats: [
      { value: '~1M', label: 'compounds screened in two hours on one GPU' },
      { value: '28 of 73', label: 'significant cell\u2013cell calls that fail certification' },
      { value: '167k', label: 'points in the largest Mantis map I built' },
      { value: '500+', label: 'seniors and youth reached through Heartware' }
    ],

    about: {
      kicker: 'About',
      title: 'Amy Wang',
      paragraphs: [
        'I am in Grade 11 in the International Baccalaureate programme at St. Robert Catholic High School in Richmond Hill, Ontario. Since 2025 I have worked with the Kellis Lab at MIT CSAIL on Mantis, a platform that turns genomic, structural, and clinical data into maps researchers can navigate. I sit on the lab\u2019s executive leadership team and lead research direction for the platform.',
        'Most of my lab work is engineering. I designed the extension SDK that lets outside developers add interactive layers to a map, built the publication and review layer behind the shared catalogue, and wrote the agent framework that lets models call external tools and check their hypotheses against evidence on the map, with provenance kept through the whole chain. The largest map I have worked on holds about 167,000 embedded points.',
        'My own research asks whether a statistical claim survives its own assumptions. In spatial transcriptomics, every cell\u2013cell interaction depends on segmentation, the step that decides which cell owns which RNA molecule; move the boundary and an interaction can weaken, disappear, or reverse. I wrote a framework that reports each interaction as an interval valid across every defensible segmentation, and confirms a call only when a matched permutation test agrees on its direction. On public Xenium breast-cancer sections, 28 of the 73 calls that standard analysis reports as significant are not identifiable, and 6 reverse direction.',
        'Before the lab I built Window to the Mind, a retinal imaging project that looks for vascular signs of Alzheimer\u2019s in fundus photographs; it won gold at the Canada-Wide Science Fair. Outside research I run Heartware, which has produced a documentary and a workshop series with seniors in care homes, raised more than $8,000 across eight funding rounds, and reached over 500 people. I play flute and piano, teach swimming, and handle logistics for Girls in Med.'
      ],
      facts: [
        { k: 'School', v: 'St. Robert C.H.S., IB Programme' },
        { k: 'Lab', v: 'Kellis Lab, MIT CSAIL' },
        { k: 'Based in', v: 'Richmond Hill, Ontario' },
        { k: 'Languages', v: 'English, Mandarin, French (DELF B2)' },
        { k: 'Instruments', v: 'Flute and piano, RCM Level 10' },
        { k: 'Certifications', v: 'National Lifeguard, Standard First Aid / CPR-C' }
      ],
      photo: {
        src: 'assets/profile.webp',
        alt: 'Amy Wang at the Canada-Wide Science Fair',
        caption: 'Canada-Wide Science Fair'
      }
    },

    researchIntro: 'Seven projects, from methods work to a wet-lab plan.',

    research: [
      {
        id: 'certified',
        year: '2026',
        field: 'Methods \u00b7 spatial transcriptomics',
        title: 'Certified statistics for cell\u2013cell interactions',
        sub: 'Single-author manuscript, submitted to RECOMB 2027',
        body: [
          'Spatial transcriptomics measures gene expression molecule by molecule while the tissue stays intact. Any cell\u2013cell interaction inferred from that data depends on segmentation, the step that assigns each RNA molecule to a cell. Small changes in the boundary can weaken an interaction, remove it, or flip its sign, and most published results report a single segmentation and a single p-value as though the boundary were fixed.',
          'I wrote a framework that reports each interaction as an interval that stays valid across the full set of defensible segmentations, and confirms a call only when a matched permutation null agrees on its direction. On public Xenium breast-cancer sections, 28 of the 73 calls that standard analysis reports as significant turn out to be non-identifiable, and 6 reverse direction. The ESR1\u2013PGR pair is the clearest case: mutual exclusion holds in lung tissue and reverses in breast, a tissue-dependent flip that point estimates never show.',
          'All 159 intervals are machine-verified four ways: randomized feasibility testing, exhaustive enumeration over small subcubes, bitwise agreement between two independent implementations, and a re-derivation from scratch.'
        ],
        metrics: [
          { value: '28/73', label: 'significant calls that are not identifiable' },
          { value: '6', label: 'calls that reverse direction' },
          { value: '159', label: 'intervals, machine-verified' },
          { value: '2', label: 'tissues where ESR1\u2013PGR flips' }
        ],
        note: 'The verification scripts and the two implementations are available on request.'
      },
      {
        id: 'drug',
        year: '2026',
        field: 'Drug discovery \u00b7 high-throughput screening',
        title: 'A virtual screening engine inside Mantis',
        sub: 'Built natively in the platform; about one million compounds in two hours on one GPU',
        body: [
          'The engine takes a receptor structure, enumerates candidate libraries, filters out compounds that fail tiered physical-property checks before any physics is run, and screens what remains. On a single RTX 4090 it works through roughly one million compounds in two hours, close to a hundred per second, which makes an overnight campaign possible on a desktop card instead of a cluster.',
          'I benchmarked it on PDBbind: 25\u201330% of top-ranked poses land within 2 \u00c5 RMSD of the experimentally solved structure, and median enrichment is above 12. In a KRAS G12C covalent campaign, a Gaussian-process surrogate reached a held-out R\u00b2 of 0.96 at 0.14 RMSE in pIC\u2085\u2080; Bayesian optimization moved the lead from 7.9 to 8.5 pIC\u2085\u2080 over 24 rounds, and NSGA-II cut 210 frontier candidates to 8 with no dead-end syntheses. The final lead sits at 2.2 nM affinity with a predicted covalent residence time of 4.2 hours and a clean developability panel.',
          'When an external reviewer questioned the scoring, I added alchemical free-energy calculations on university GPU infrastructure and folded them into a closed-loop benchmarking harness; that version reaches r = 0.91 against experiment at roughly 1.0 kcal/mol RMSE. The engine now searches a 90-billion-compound make-on-demand catalogue inside a design\u2013make\u2013test\u2013learn loop.'
        ],
        metrics: [
          { value: '~1M', label: 'compounds in ~2 hours on one RTX 4090' },
          { value: '0.96', label: 'held-out R\u00b2, KRAS surrogate' },
          { value: '2.2 nM', label: 'lead affinity after optimization' },
          { value: '0.91', label: 'free-energy correlation with experiment' }
        ],
        note: 'Prof. Kellis forwarded the demo to external collaborators.'
      },
      {
        id: 'azt',
        year: '2026',
        field: 'Clinical reasoning \u00b7 pharmacogenomics',
        title: 'AZT safety in dystrophin carriers',
        sub: 'A drug-interaction hypothesis that neither literature had described',
        body: [
          'AZT is an HIV antiretroviral on the WHO Essential Medicines List. Dystrophin mutations cause Duchenne and Becker muscular dystrophy, and carriers are usually described as asymptomatic even though their sarcolemma is already less resilient than normal. No paper had asked what happens when AZT is given to a carrier whose heart muscle is compensating.',
          'The platform surfaced the pair because AZT and dystrophin appear in the same mechanistic sentences. I checked the cluster by hand rather than trusting the ranking, and traced a plausible route to cardiac harm. The result is a mechanistic hypothesis that AZT could accelerate heart failure in carriers.',
          'I wrote the experimental protocol and the user guide so the analysis reproduces deterministically, and the screen itself uses a standard genetic panel. The next step is wet-lab validation; nothing here changes a prescription.'
        ],
        metrics: [
          { value: '1', label: 'standard genetic panel needed to screen' },
          { value: '0', label: 'papers connecting the two mechanisms' },
          { value: 'WHO', label: 'essential medicine, used widely' }
        ],
        note: 'Hypothesis and protocol only. It needs experimental confirmation.'
      },
      {
        id: 'mantis',
        year: '2025\u2013',
        field: 'Platform engineering \u00b7 agentic systems',
        title: 'Platform engineering on Mantis',
        sub: 'Extension SDK, publication layer, and agentic target discovery at the Kellis Lab',
        body: [
          'Mantis maps genomes, molecular structures, patient records, and literature into navigable spaces that become the reasoning context for AI. I joined the lab in 2025 and started shipping what the platform was missing: dozens of merged pull requests across Mantis and MantisAPI, about 30 of them in a single week during the first release push.',
          'The largest piece is the extension system. I architected the SDK end to end, which gives outside developers event-driven interactivity with the map surface, plugin-drawn edges between points, programmatic work on saved selections, and extension state lifecycle with per-space registry isolation. On top of that sits the publication layer: a browsable global catalogue with a shared taxonomy, publication policy set per space, artifact-bound package acceptance, security permissions, and a model-backed review step that resolves routine flags and escalates only real ones.',
          'I also built the agentic framework behind single-cell target discovery, where agents reason over external computational tools and reconcile hypotheses against evidence on the live map with provenance carried through the chain. It runs on production maps of more than 100,000 embedded points. The unified upload pipeline came next: any file becomes an annotated dataset and map space, with generated reports and cluster guides, and a logging layer that saves a whole workflow as a reusable template.'
        ],
        metrics: [
          { value: '30+', label: 'pull requests merged in one week' },
          { value: '167k', label: 'points in the largest map I built' },
          { value: '100k+', label: 'points where the agent framework runs' },
          { value: '115', label: 'pages in the Holy Name report I co-wrote' }
        ],
        note: 'I also rewrote the onboarding path and mentor new contributors one on one.'
      },
      {
        id: 'benchmark',
        year: '2026',
        field: 'Translational research \u00b7 Alzheimer\u2019s',
        title: 'An Alzheimer\u2019s workflow adopted as the lab benchmark',
        sub: 'Four data modalities in one traceable chain',
        body: [
          'I built an end-to-end Alzheimer\u2019s research workflow on Mantis: agentic dataset curation, cross-modal embedding of structural MRI neuroanatomy, symptom progression, retinal vascular biomarkers, and literature synthesis, all in one traceable chain. Prof. Kellis adopted it as the lab\u2019s reference benchmark, commissioned training modules around it, and graduate researchers now use it as a template for their own work.',
          'The retinal component comes from Window to the Mind, my Canada-Wide Science Fair project: a ResNet-101 pipeline that reads fundus photographs for vascular signatures of Alzheimer\u2019s. The workflow is what that model looks like when it has to sit next to imaging, genetics, and the published literature instead of standing alone.'
        ],
        metrics: [
          { value: '4', label: 'data modalities in one chain' },
          { value: '2026', label: 'adopted as the lab benchmark' },
          { value: 'Gold', label: 'CWSF medal behind the retinal model' }
        ]
      },
      {
        id: 'design',
        year: '2026',
        field: 'Generative biology \u00b7 simulation',
        title: 'Protein sequence design and Tau phase separation',
        sub: 'Two computational projects on sequence optimization and condensate physics',
        body: [
          'The first projects discrete FASTA sequences onto continuous Riemannian manifolds through discrete-latent variational autoencoders, then runs an active-learning loop that pairs deep evidential regression with Thompson sampling to optimize pathogen inhibition and host-cell toxicity at the same time. Structural prediction and Rosetta energy relaxation are automated end to end, so each candidate comes out with a structure and an energy rather than a sequence alone.',
          'The second is a smoothed-particle hydrodynamics simulation of how mechanical shear stress drives liquid\u2013liquid phase separation of Tau, the protein at the centre of Alzheimer\u2019s tangles. Both projects ask what the underlying physics lets a cell do.'
        ],
        metrics: [
          { value: 'VAE', label: 'discrete-latent, Riemannian projection' },
          { value: '2', label: 'objectives optimized jointly' },
          { value: 'SPH', label: 'shear-driven Tau phase separation' }
        ],
        note: 'Both projects are ongoing.'
      },
      {
        id: 'isef',
        year: '2027',
        field: 'Current project \u00b7 microbiology',
        title: 'c-di-AMP, turgor pressure, and antibiotic tolerance',
        sub: 'ISEF 2027 \u00b7 Team Canada candidate',
        body: [
          'Beta-lactam tolerance is usually treated as a genetics problem. I am testing whether part of it is a physical one: whether modulating the second messenger c-di-AMP changes tolerance through osmotic homeostasis and cellular turgor pressure. The project pairs a computational model of the osmotic feedback loop with a wet-lab validation plan.',
          'This work is early. Results will be posted here as they come in.'
        ],
        metrics: [
          { value: '2027', label: 'ISEF, Team Canada candidate' },
          { value: 'c-di-AMP', label: 'second messenger under study' }
        ]
      }
    ],

    quote: {
      text: 'Where others strive to meet the standard, Amy sets it.',
      who: 'Manolis Kellis',
      role: 'Professor of Computer Science, MIT; head of the MIT Computational Biology Group'
    },

    recognition: {
      kicker: 'Recognition',
      title: 'Results and certifications',
      intro: 'National and international competition results, academic results, and certifications.',
      featured: [
        { label: 'ISEF 2027', detail: 'YSC Youth Excellence Program \u00b7 Team Canada candidate' },
        { label: 'Canada-Wide Science Fair', detail: 'Gold medal \u00b7 Window to the Mind' },
        { label: 'DECA', detail: 'Provincial Champion, twice \u00b7 ICDC Top 20' },
        { label: 'FBLA', detail: 'CNLC 1st \u00b7 NLC 2nd \u00b7 National Trainer' }
      ],
      groups: [
        {
          title: 'Competitions',
          items: [
            { label: 'HOSA', detail: 'SLC Top 10 twice \u00b7 SLC 2nd \u00b7 ILC Top 20 \u00b7 National Workshop Coordinator' },
            { label: 'York Region Science and Technology Fair', detail: 'Gold medal' },
            { label: 'CNDF Debate', detail: 'Junior Nationals Qualifier \u00b7 Top 5 team and Top 10 speaker at Provincials' },
            { label: 'UTSRI High School Case Competition', detail: '2nd place' },
            { label: 'Canadian International Music Competition', detail: 'Gold' },
            { label: 'York Region Poetry Slam', detail: '3rd place' }
          ]
        },
        {
          title: 'Academic',
          items: [
            { label: 'Principal\u2019s List', detail: '97% average in Pre-IB' },
            { label: 'Waterloo Mathematics Contests', detail: 'Certificate of Distinction: Galois, Cayley, CIMC' },
            { label: 'AP Psychology and AP Statistics', detail: '5 and 5' },
            { label: 'French', detail: 'DELF B2' }
          ]
        },
        {
          title: 'Music and certifications',
          items: [
            { label: 'Royal Conservatory of Music', detail: 'Flute Level 10 \u00b7 Piano Level 10' },
            { label: 'Soho Sound', detail: 'Canadian Junior Honour Band' },
            { label: 'Lifesaving Society', detail: 'National Lifeguard, instructor certified' },
            { label: 'St. John Ambulance', detail: 'Standard First Aid with CPR-C' }
          ]
        }
      ]
    },

    work: {
      kicker: 'Work',
      title: 'Roles and commitments',
      intro: 'A lab, a non-profit, and several organisations where I handle logistics and training.',
      groups: [
        {
          period: '2025 \u2014 present',
          role: 'Executive Leadership Team \u00b7 Lead Admiral, Mantis',
          org: 'Kellis Lab, MIT CSAIL',
          blurb: 'Research direction for the platform, the extension SDK and shared catalogue, agentic research frameworks, and onboarding for new contributors. Co-led the AI4Science division.'
        },
        {
          period: '2024 \u2014 present',
          role: 'Founder',
          org: 'Heartware',
          blurb: 'A youth-led documentary and workshop programme for seniors in care homes. More than 500 seniors and youth reached, over $8,000 raised across eight funding rounds, a Certificate of Honor from MP Patty Hajdu, and coverage in national and local Chinese-language press.'
        },
        {
          period: '2026 \u2014 present',
          role: 'Logistics Coordinator',
          org: 'Girls in Med',
          blurb: 'Logistics for a community of 2,000+ members and a 30,000-follower platform, including an 80-person live event at the University of Toronto Symposium.'
        },
        {
          period: '2025 \u2014 present',
          role: 'Youth Coordinator',
          org: 'York Region Science Fair',
          blurb: 'Coordinates young judges, volunteers, and exhibitors through the regional fair cycle.'
        },
        {
          period: '2024 \u2014 present',
          role: 'Senior Volunteer Coordinator',
          org: 'BEST Education',
          blurb: 'Leads and trains more than 80 volunteer instructors running free community lessons for local and international students.'
        },
        {
          period: '2025 \u2014 present',
          role: 'Trainer and workshop lead',
          org: 'FBLA \u00b7 DECA \u00b7 HOSA \u00b7 STEAM Council',
          blurb: 'National Trainer for FBLA, National Workshop Coordinator for HOSA, DECA trainer, and STEAM Council representative at school.'
        },
        {
          period: 'Past',
          role: 'Earlier roles',
          org: 'FCSS-FESC \u00b7 Xiangyang No. 1 People\u2019s Hospital \u00b7 DECA',
          blurb: 'Canadian Student Representative\u2019s Council with FCSS-FESC, a clinical internship at Xiangyang No. 1 People\u2019s Hospital, and a year training DECA competitors.'
        }
      ]
    },

    projects: {
      kicker: 'Projects',
      title: 'Selected projects',
      intro: '',
      items: [
        {
          title: 'Mantis',
          sub: 'MIT CSAIL \u00b7 research platform',
          body: 'A navigable map of scientific literature, genomic data, and molecular structures, used by researchers across the lab. I work on the extension system, the agentic layer, and the workflows researchers use day to day.',
          img: 'assets/mantis.webp',
          imgAlt: 'The Mantis platform interface',
          imgCaption: 'Mantis, MIT CSAIL',
          link: 'https://mantis.csail.mit.edu',
          linkLabel: 'mantis.csail.mit.edu'
        },
        {
          title: 'Window to the Mind',
          sub: 'CWSF Gold \u00b7 retinal detection of Alzheimer\u2019s',
          body: 'A ResNet-101 pipeline that reads fundus photographs for vascular signatures of Alzheimer\u2019s, paired with rational drug design work on the same pathway.',
          img: 'assets/window.webp',
          imgAlt: 'Amy Wang receiving the CWSF Gold Medal for Window to the Mind',
          imgCaption: 'CWSF, gold medal',
          link: 'https://partner.projectboard.world/ysc/project/window-to-the-mind-ai-powered-early-retinal-detection-and-rational-drug-design-for-alzheimers',
          linkLabel: 'Project board'
        },
        {
          title: 'Heartware',
          sub: 'Founder \u00b7 documentary and community',
          body: 'Documentary production and a workshop series with seniors in care homes. Eight funding rounds, more than 500 people reached, and a Certificate of Honor from MP Patty Hajdu.',
          img: 'assets/heartware.webp',
          imgAlt: 'Amy Wang with Heartware participants at a senior living facility',
          imgCaption: 'Heartware, with participants',
          link: 'https://www.hotspotnews.ca/portal.php?mod=view&aid=3819',
          linkLabel: 'Press'
        },
        {
          title: 'CNScope',
          sub: 'Mantis \u00b7 Drosophila connectomics',
          body: 'Wiring diagrams of the fly brain cross-referenced against FlyBase genetics inside Mantis, so a circuit and the genes behind it sit in one map instead of two tabs.',
          img: 'assets/cnscope.webp',
          imgAlt: 'Three-dimensional reconstruction of the Drosophila brain',
          imgCaption: 'Drosophila brain reconstruction. Image: Wikimedia Commons, CC BY-SA',
          link: 'https://mantis.csail.mit.edu',
          linkLabel: 'mantis.csail.mit.edu'
        }
      ]
    },

    arts: {
      kicker: 'Outside the lab',
      title: 'Music, teaching, and languages',
      paragraphs: [
        'I play flute and piano at RCM Level 10 and spent a summer with the Soho Sound Canadian Junior Honour Band. I also write and perform poetry; I placed third at the York Region Poetry Slam.',
        'I teach swimming through the Lifesaving Society. I speak English and Mandarin at home, and French at DELF B2.'
      ],
      facts: [
        { k: 'Flute', v: 'RCM Level 10' },
        { k: 'Piano', v: 'RCM Level 10' },
        { k: 'Band', v: 'Soho Sound Canadian Junior Honour Band' },
        { k: 'Poetry', v: 'York Region Poetry Slam, 3rd' },
        { k: 'Teaching', v: 'Lifesaving Society swim instructor' }
      ]
    },

    contact: {
      kicker: 'Contact',
      title: 'Get in touch',
      body: 'Feel free to reach out. I am quick over email, and happy to talk about research, collaboration, speaking, or anything else.',
      note: 'Based in Richmond Hill, Ontario.'
    },

    guide: {
      kicker: 'Guide',
      title: 'Where everything is',
      intro: 'Eight places, connected by the paths. Walk with the arrow keys, click the grass, or pick a spot on the map in the corner.',
      places: [
        { site: 'about', place: 'the cottage', what: 'About me: school, the lab, and what I work on.' },
        { site: 'research', place: 'the observatory', what: 'Seven research projects and the numbers behind them.' },
        { site: 'recognition', place: 'the laurels', what: 'Competition results, academic results, and certifications.' },
        { site: 'projects', place: 'the workshop', what: 'Mantis, Window to the Mind, Heartware, and CNScope.' },
        { site: 'arts', place: 'the gramophone', what: 'Music, poetry, and teaching swimming.' },
        { site: 'contact', place: 'the mailbox', what: 'Email and LinkedIn.' },
        { site: 'bench', place: 'the bench', what: 'A science fact to sit with.' },
        { site: 'secret', place: 'the garden gate', what: 'Locked. The password is on the desk.' }
      ],
      reading: 'The same material is also available as a professional resume.'
    },

    journal: {
      title: 'Field journal',
      empty: 'No cranes yet. Seven folded paper cranes are hidden around the field.'
    },

    secret: {
      title: 'The garden behind the cottage',
      body: [
        'You found the gate. There is no prize here, just a few things that did not fit anywhere else.',
        'I keep a folder of papers I have not read yet, and it grows faster than I read it.',
        'The bird on the monitor is called Marmalade. She has been there since Tuesday.'
      ]
    }
  };
})();
