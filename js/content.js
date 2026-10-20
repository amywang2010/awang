/* ============================================================
   Content. One source of truth for the field panels and the
   reading view.
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});

  AW.content = {
    name: 'Amy Wang',
    email: 'amywangofficial@gmail.com',
    linkedin: 'https://www.linkedin.com/in/amy-wang-98a0072b7/',
    location: 'Richmond Hill, Ontario',
    headline: 'Grade 11 student. Researcher at the Kellis Lab, MIT CSAIL. Founder of Heartware.',

    hero: {
      line1: 'I work on the part of biology',
      line2: 'that refuses to fit in a spreadsheet.',
      intro: 'Spatial genomics, drug discovery, and a retinal scan that might catch Alzheimer\u2019s years early. Most of my work is about whether a number survives contact with its own uncertainty.',
      meta: 'St. Robert C.H.S. \u00b7 IB \u00b7 Grade 11 \u00b7 Richmond Hill, ON'
    },

    stats: [
      { value: '54', label: 'pull requests merged into Mantis and MantisAPI' },
      { value: '1M', label: 'compounds screened in about two hours, one GPU' },
      { value: '159', label: 'certified intervals, each machine-verified' },
      { value: '500+', label: 'seniors and youth reached through Heartware' }
    ],

    about: {
      kicker: 'About',
      title: 'Who you are looking at',
      paragraphs: [
        'I am in Grade 11 in the IB programme at St. Robert Catholic High School in Richmond Hill, Ontario. Most of the time I am not in Richmond Hill: I work with the Kellis Lab at MIT CSAIL on Mantis, a platform that turns fragmented scientific data into maps you can navigate. I sit on the lab\u2019s executive leadership team and lead the platform\u2019s research direction as Lead Admiral.',
        'The questions I keep returning to are about trust. A paper says two cell types interact in a tumour. That claim depends on which cell owned which RNA molecule, which depends on a segmentation decision nobody fully controls. A docking pipeline ranks a million compounds, and the ranking means nothing if the scoring function has never met an honest test. I like building the part of the pipeline that checks the number rather than the part that produces it.',
        'Before the lab I built a retinal imaging project for Alzheimer\u2019s. It won gold at CWSF, which was nice, and taught me statistics properly, which mattered more. Alongside research I run Heartware, a documentary and workshop programme with seniors in care homes, now in its eighth round of funding. I also play flute and piano, teach swimming, and lose arguments to my own poetry drafts.',
        'I do not know yet whether I end up in a lab or a clinic. Either way it will involve messy data and long evenings.'
      ],
      facts: [
        { k: 'School', v: 'St. Robert C.H.S., IB Programme' },
        { k: 'Lab', v: 'Kellis Lab, MIT CSAIL' },
        { k: 'Based in', v: 'Richmond Hill, Ontario' },
        { k: 'Languages', v: 'English, Mandarin, French (DELF B2)' },
        { k: 'Instruments', v: 'Flute and piano, RCM Level 10' },
        { k: 'Certifications', v: 'National Lifeguard, Standard First Aid / CPR-C' }
      ],
      note: 'The certified statistics work is the one I would defend in a room full of statisticians.',
      photo: {
        src: 'assets/profile.webp',
        alt: 'Amy Wang at the Canada-Wide Science Fair',
        caption: 'Canada-Wide Science Fair'
      }
    },

    researchIntro: 'Seven projects, roughly in order of how long they have been running.',

    research: [
      {
        id: 'certified',
        year: '2026',
        field: 'Methods \u00b7 spatial transcriptomics',
        title: 'Certified statistics over biological uncertainty',
        sub: 'Single-author manuscript, submitted to RECOMB 2027',
        body: [
          'Spatial transcriptomics measures gene activity molecule by molecule while keeping the tissue intact. Every claimed cell-cell interaction depends on cell segmentation, which decides which cell owns which molecule. Change the segmentation boundary slightly and the interaction can weaken, vanish, or flip sign. Published results usually report one segmentation and one p-value, as if the boundary were a fact.',
          'The framework I wrote reports each interaction as a certified interval that stays valid across the entire set of defensible segmentations, and only confirms a call when a matched permutation null also validates its direction. On public Xenium breast-cancer sections, 28 of the 73 calls that standard analysis finds significant turn out to be non-identifiable, and 6 reverse direction once certification is required. The ESR1\u2013PGR axis is the clearest example: mutual exclusion certifies in lung tissue and reverses in breast, a tissue-dependent flip that point estimates never see.',
          'I did not want to be the person who claims a bound and cannot defend it. All 159 intervals are machine-verified four ways: randomized feasibility testing, exhaustive enumeration over small subcubes, bitwise agreement between two independent implementations, and a from-scratch re-derivation.'
        ],
        metrics: [
          { value: '28/73', label: 'significant calls that are not identifiable' },
          { value: '6', label: 'calls that reverse direction' },
          { value: '159', label: 'intervals, machine-verified' },
          { value: '2', label: 'tissues where ESR1\u2013PGR flips' }
        ],
        note: 'A large share of what the field calls significant is an artifact of one segmentation choice. That is the part worth saying out loud.'
      },
      {
        id: 'drug',
        year: '2026',
        field: 'Drug discovery \u00b7 high-throughput screening',
        title: 'A million compounds before lunch',
        sub: 'Built natively inside Mantis; runs on one consumer GPU',
        body: [
          'You give the engine a receptor structure. It enumerates candidate libraries, throws out everything that fails tiered physical-property filters before spending money on physics, then screens what is left. On a single RTX 4090 it works through roughly one million compounds in two hours, about a hundred per second, which is the difference between a screening campaign you can run overnight and one you have to book a cluster for.',
          'I benchmarked it honestly rather than flatteringly. On PDBbind, 25\u201330% of top-ranked poses land within 2 \u00c5 RMSD of the experimentally solved structure, and median enrichment is above 12. For the KRAS G12C covalent campaign, a Gaussian-process surrogate reached a held-out R\u00b2 of 0.96 at 0.14 RMSE in pIC\u2085\u2080, Bayesian optimization moved the incumbent from 7.9 to 8.5 pIC\u2085\u2080 over 24 rounds, and NSGA-II cut 210 frontier candidates down to 8 with zero dead-end syntheses. The resulting lead sits at 2.2 nM affinity with a 4.2-hour predicted covalent residence time and a clean developability panel.',
          'When an external reviewer pushed on the scoring methodology, I answered with data: alchemical free-energy calculations on university GPU infrastructure, folded back into a closed-loop benchmarking framework. That version reaches r = 0.91 against experiment at roughly 1.0 kcal/mol RMSE. The engine now reaches into a 90-billion-compound make-on-demand space inside a design-make-test-learn loop.'
        ],
        metrics: [
          { value: '~1M', label: 'compounds in ~2 hours on one RTX 4090' },
          { value: '0.96', label: 'held-out R\u00b2, KRAS surrogate' },
          { value: '2.2 nM', label: 'lead affinity after optimization' },
          { value: '0.91', label: 'free-energy correlation with experiment' }
        ],
        note: 'Prof. Kellis called the demo extraordinary and forwarded it to external collaborators. I mostly remember the week the enrichment numbers were wrong.'
      },
      {
        id: 'azt',
        year: '2026',
        field: 'Clinical reasoning \u00b7 pharmacogenomics',
        title: 'A contraindication nobody had written down',
        sub: 'AZT, dystrophin carriers, and two literatures that never speak',
        body: [
          'AZT is an HIV antiretroviral on the WHO Essential Medicines List. Dystrophin mutations cause Duchenne and Becker muscular dystrophy; carriers are usually described as asymptomatic, though their sarcolemma is already less resilient than it looks. Nobody had asked what happens when you give AZT to a dystrophin carrier whose heart muscle is quietly compensating.',
          'The map did the first part: AZT and dystrophin landed in the same cluster because they co-occur in the same mechanistic sentences. An agent proposed the downstream clinical consequence, and I drove a verification pass over the cluster by hand rather than trusting the ranking. The result is a mechanistically grounded hypothesis that AZT could accelerate heart failure in carriers.',
          'I wrote the full experimental protocol and user guide so the whole discovery reproduces deterministically on the platform, and the screen itself is a standard genetic panel. That is the part that matters: a finding nobody can repeat is not a finding.'
        ],
        metrics: [
          { value: '1', label: 'standard genetic panel needed to screen' },
          { value: '0', label: 'papers connecting the two mechanisms' },
          { value: 'WHO', label: 'essential medicine, used widely' }
        ],
        note: 'This is a hypothesis with a protocol, not a clinical claim. It needs wet-lab work before anyone changes a prescription.'
      },
      {
        id: 'mantis',
        year: '2025\u2013',
        field: 'Platform engineering \u00b7 agentic systems',
        title: 'Making Mantis something other people can build on',
        sub: 'Executive leadership team, Kellis Lab, MIT CSAIL',
        body: [
          'Mantis maps genomes, molecular structures, patient records, and literature into navigable spaces that become the reasoning context for AI. When I joined I could not stop finding things it should already do, so I started shipping them: 54 merged pull requests across Mantis and MantisAPI, about 30 of them in a single week.',
          'The largest piece is the extension system. I architected the SDK end to end, which gives outside developers event-driven interactivity with the map surface, plugin-drawn edges between points, programmatic work on saved selections, and extension state lifecycle with per-space registry isolation. On top of that sits the publication layer: a browsable global catalogue with shared taxonomy, space-defined publication policy, artifact-bound package acceptance, security permissions, and a model-backed review step that resolves routine flags and escalates only real ones.',
          'I also delivered the agentic framework behind single-cell target discovery, where agents reason over external computational tools and reconcile hypotheses against evidence on the live map, with provenance carried through the whole chain. It runs on production maps of more than 100,000 embedded points, which is where most agentic prototypes fall over. The unified pipeline came next: any uploaded file becomes an organized, annotated dataset and map space, with generated reports and cluster guides, and a logging layer that saves a whole workflow as a reusable template.'
        ],
        metrics: [
          { value: '54', label: 'merged PRs, ~30 in one week' },
          { value: '167k', label: 'points in the largest map I built' },
          { value: '100k+', label: 'points where the agent framework runs' },
          { value: '115', label: 'pages in the Holy Name report I co-wrote' }
        ],
        note: 'I rebuilt the onboarding process and mentor contributors one on one. Making the platform teachable turned out to be harder than making it fast.'
      },
      {
        id: 'benchmark',
        year: '2026',
        field: 'Translational research \u00b7 Alzheimer\u2019s',
        title: 'The workflow the lab now measures itself against',
        sub: 'Adopted as the canonical benchmark on Mantis',
        body: [
          'I built an end-to-end Alzheimer\u2019s research workflow: agentic dataset curation, cross-modal embedding of structural MRI neuroanatomy, symptom progression, non-invasive retinal vascular biomarkers, and literature synthesis in one traceable chain. It was meant to be my own project. Prof. Kellis adopted it as the definitive benchmark for excellence on the platform, commissioned training modules around it, and graduate researchers now use it as the template for their own work.',
          'The retinal piece came out of Window to the Mind, my CWSF project: a ResNet-101 pipeline that looks for vascular signatures of Alzheimer\u2019s in fundus photographs. The workflow is what happens when you stop treating that as a standalone model and ask how it should sit next to imaging, genetics, and the actual paper trail.'
        ],
        metrics: [
          { value: '4', label: 'data modalities in one chain' },
          { value: '1', label: 'lab-wide benchmark, still in use' },
          { value: 'Gold', label: 'CWSF medal behind the retinal model' }
        ],
        note: 'Graduate students using something I built is a stranger feeling than any medal.'
      },
      {
        id: 'design',
        year: '2026',
        field: 'Generative biology \u00b7 simulation',
        title: 'Designing sequences and watching proteins condense',
        sub: 'Two projects that would each be a decent undergraduate capstone',
        body: [
          'The first projects discrete FASTA sequences onto continuous Riemannian manifolds through discrete-latent variational autoencoders, then runs an active-learning loop that combines deep evidential regression with Thompson sampling to optimize pathogen inhibition against host-cell toxicity at the same time. Structural prediction and Rosetta energy relaxation are automated end to end, so a candidate comes out with a structure and an energy, not just a sequence.',
          'The second is a smoothed-particle hydrodynamics simulation of how mechanical shear stress drives liquid-liquid phase separation of Tau, the protein at the centre of Alzheimer\u2019s tangles. Different forces, same question: what does the physics let a cell actually do?'
        ],
        metrics: [
          { value: 'VAE', label: 'discrete-latent, Riemannian projection' },
          { value: '2', label: 'objectives optimized jointly' },
          { value: 'SPH', label: 'shear-driven Tau phase separation' }
        ],
        note: 'Neither is finished. Both are the kind of thing I open on weekends when nobody is waiting for a result.'
      },
      {
        id: 'isef',
        year: '2027',
        field: 'Current project \u00b7 microbiology',
        title: 'c-di-AMP, turgor pressure, and why bacteria survive antibiotics',
        sub: 'ISEF 2027 \u00b7 Team Canada candidate',
        body: [
          'Beta-lactam tolerance is often treated as a genetics problem. I am testing whether it is partly a physics problem: whether modulating the second messenger c-di-AMP changes tolerance through osmotic homeostasis and cellular turgor pressure. The work combines a computational model of the osmotic feedback loop with a wet-lab validation plan, and it is the project I am building toward ISEF with.',
          'I am early enough in this one that the honest answer to most questions is "I do not know yet". I will update this page when I do.'
        ],
        metrics: [
          { value: '2027', label: 'ISEF, Team Canada candidate' },
          { value: 'c-di-AMP', label: 'second messenger under study' }
        ],
        note: 'Currently reading more about turgor than any person should.'
      }
    ],

    quote: {
      text: 'Where others strive to meet the standard, Amy sets it.',
      who: 'Manolis Kellis',
      role: 'Professor of Computer Science, MIT; head of the MIT Computational Biology Group'
    },

    recognition: {
      kicker: 'Recognition',
      title: 'The shelf with the medals on it',
      intro: 'Competitions are a strange way to measure curiosity, but they are a useful way to meet people who share it.',
      groups: [
        {
          title: 'Competitions',
          items: [
            { label: 'DECA Provincial Champion', detail: 'twice \u00b7 ICDC Top 20' },
            { label: 'FBLA', detail: 'CNLC 1st \u00b7 NLC 2nd \u00b7 National Trainer' },
            { label: 'HOSA', detail: 'SLC Top 10 twice \u00b7 SLC 2nd \u00b7 ILC Top 20 \u00b7 National Workshop Coordinator' },
            { label: 'Canada-Wide Science Fair', detail: 'Gold medal' },
            { label: 'York Region Science and Technology Fair', detail: 'Gold medal' },
            { label: 'CNDF Debate', detail: 'Junior Nationals Qualifier \u00b7 Top 5 team, Top 10 speaker at Provincials' },
            { label: 'UTSRI High School Case Competition', detail: '2nd place' },
            { label: 'Canadian International Music Competition', detail: 'Gold' }
          ]
        },
        {
          title: 'Academic',
          items: [
            { label: 'Principal\u2019s List', detail: '97% average in Pre-IB' },
            { label: 'YSC ISEF 2027 Youth Excellence Program', detail: 'Team Canada candidate' },
            { label: 'Waterloo Mathematics Contests', detail: 'Certificate of Distinction: Galois, Cayley, CIMC' },
            { label: 'AP Psychology and AP Statistics', detail: '5 and 5' },
            { label: 'French', detail: 'DELF B2' }
          ]
        },
        {
          title: 'Music and other things',
          items: [
            { label: 'Royal Conservatory of Music', detail: 'Flute Level 10 \u00b7 Piano Level 10' },
            { label: 'Soho Sound', detail: 'Canadian Junior Honour Band' },
            { label: 'York Region Poetry Slam', detail: '3rd place' },
            { label: 'Lifesaving Society', detail: 'National Lifeguard, instructor certified' },
            { label: 'St. John Ambulance', detail: 'Standard First Aid with CPR-C' }
          ]
        }
      ]
    },

    work: {
      kicker: 'Work',
      title: 'Things I show up for',
      intro: 'A lab, a non-profit, and a handful of organisations that let a teenager run logistics.',
      groups: [
        {
          period: '2025 \u2014 present',
          role: 'Executive Leadership Team \u00b7 Lead Admiral, Mantis',
          org: 'Kellis Lab, MIT CSAIL',
          blurb: 'Platform research direction, extension SDK and marketplace, agentic research frameworks, and onboarding for new contributors. Mentors team members one on one and co-led the AI4Science division.'
        },
        {
          period: '2024 \u2014 present',
          role: 'Founder',
          org: 'Heartware',
          blurb: 'A youth-led documentary and workshop programme for seniors in care homes. 500+ seniors and youth reached, more than $8,000 raised across eight funding rounds, a Certificate of Honor from MP Patty Hajdu, and coverage in national and local Chinese-language press.'
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
          blurb: 'Leads and trains a team of 80+ volunteer instructors running free community lessons for local and international students.'
        },
        {
          period: '2025 \u2014 present',
          role: 'Trainer and workshop lead',
          org: 'FBLA \u00b7 DECA \u00b7 HOSA \u00b7 STEAM Council',
          blurb: 'National Trainer for FBLA, National Workshop Coordinator for HOSA, DECA trainer, and STEAM Council representative at school.'
        },
        {
          period: 'Past',
          role: 'Earlier things',
          org: 'FCSS-FESC \u00b7 Xiangyang No. 1 People\u2019s Hospital \u00b7 DECA',
          blurb: 'Canadian Student Representative\u2019s Council with FCSS-FESC, a clinical internship at Xiangyang No. 1 People\u2019s Hospital, and a year training DECA competitors.'
        }
      ]
    },

    projects: {
      kicker: 'Projects',
      title: 'Built, shipped, or still on the bench',
      intro: '',
      items: [
        {
          title: 'Mantis',
          sub: 'MIT CSAIL \u00b7 cognitive cartography',
          body: 'A navigable map of the scientific enterprise. I work on the extension system, the agentic research layer, and the workflows researchers actually use.',
          link: 'https://mantis.csail.mit.edu',
          linkLabel: 'mantis.csail.mit.edu'
        },
        {
          title: 'Window to the Mind',
          sub: 'CWSF Gold \u00b7 retinal Alzheimer\u2019s detection',
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
          body: 'Documentary production and workshop series with seniors in care homes. Eight rounds of funding, 500+ people reached, and a lot of tea.',
          img: 'assets/heartware.webp',
          imgAlt: 'Amy Wang with Heartware participants at a senior living facility',
          imgCaption: 'Heartware, with participants',
          link: 'https://www.hotspotnews.ca/portal.php?mod=view&aid=3819',
          linkLabel: 'Press'
        },
        {
          title: 'CNScope',
          sub: 'Mantis · Drosophila connectomics',
          body: 'Fly brain wiring diagrams cross-referenced against FlyBase genetics inside Mantis, so a circuit and the genes behind it sit in the same map instead of two tabs.',
          link: 'https://mantis.csail.mit.edu',
          linkLabel: 'mantis.csail.mit.edu'
        }
      ]
    },

    arts: {
      kicker: 'Off the clock',
      title: 'Away from the lab',
      paragraphs: [
        'I play flute and piano at RCM Level 10 and spent a summer with the Soho Sound Canadian Junior Honour Band. Music is the one thing I do where the feedback is immediate and nobody asks for a confidence interval.',
        'I write poetry badly and perform it slightly better, which was enough for third at the York Region Poetry Slam. I teach swimming, which has taught me more about explaining things clearly than any course. I speak English and Mandarin at home and French well enough to be polite about it.'
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
      kicker: 'Say hello',
      title: 'The mailbox at the end of the path',
      body: 'I answer email faster than I answer anything else. Research questions, competition prep, a good paper I should read, or a request to walk someone through Mantis: all fine.',
      note: 'Based in Richmond Hill, Ontario. Usually awake later than I should be.'
    },

    guide: {
      kicker: 'Guide',
      title: 'Where everything is',
      intro: 'Eight places, one path between them. Walk with the arrow keys, click the grass, or pick a spot on the map in the corner.',
      places: [
        { site: 'about', place: 'the cottage', what: 'About me: school, the lab, and what I actually work on.' },
        { site: 'research', place: 'the observatory', what: 'Research: seven projects, with the numbers behind them.' },
        { site: 'recognition', place: 'the laurels', what: 'Competitions, medals, and the rest of the shelf.' },
        { site: 'projects', place: 'the workshop', what: 'Things I built: Mantis, Window to the Mind, Heartware.' },
        { site: 'arts', place: 'the gramophone', what: 'Away from the lab: music, poetry, teaching swimming.' },
        { site: 'contact', place: 'the mailbox', what: 'Email and LinkedIn, if you want to reach me.' },
        { site: 'bench', place: 'the bench', what: 'Somewhere to sit. The thought changes each time.' },
        { site: 'secret', place: 'the garden gate', what: 'Locked. The password is somewhere on the desk.' }
      ],
      reading: 'If you would rather read it straight through, there is a plain version of the whole site.'
    },

    journal: {
      title: 'Your journal',
      empty: 'No cranes yet. They are small, folded paper birds, and they are hiding in the field.'
    },

    secret: {
      title: 'The garden behind the cottage',
      body: [
        'You found it. There is no prize here, just the thing I actually wanted to say.',
        'I started building this site because a list of awards is a terrible portrait of a person. The real version is: I like problems that stay open, I work best at 1 a.m., and I keep a folder of papers I have not read yet. I still do not know what I will be doing in ten years. If you got this far, you are the sort of person who clicks things twice, which I appreciate.',
        'The purple bird\u2019s name is Marmalade. She has been on that monitor since Tuesday.'
      ]
    }
  };
})();
