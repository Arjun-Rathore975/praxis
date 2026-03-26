// ─── Types ────────────────────────────────────────────────────────────────────

export type Discipline =
  | 'Software'
  | 'Electrical'
  | 'Mechanical'
  | 'Robotics'
  | 'Aerospace'
  | 'Civil'
  | 'Chemical'
  | 'Biomedical'

export interface CategoryConfig {
  id: string
  label: string
  description: string
}

export interface CompanyConfig {
  name: string
  dotColor: string // tailwind color class like 'bg-blue-400'
  disciplines: Discipline[]
}

export interface CompanyGroup {
  label: string
  companies: CompanyConfig[]
}

export interface DisciplineConfig {
  id: Discipline
  label: string
  icon: string // emoji
  description: string
  categories: CategoryConfig[]
  companyGroups: CompanyGroup[]
}

// ─── Discipline Configurations ────────────────────────────────────────────────

const disciplineConfigs: DisciplineConfig[] = [
  // ── Software Engineering ──────────────────────────────────────────────────
  {
    id: 'Software',
    label: 'Software Engineering',
    icon: '💻',
    description:
      'Prepare for software engineering interviews covering data structures, algorithms, system design, and more.',
    categories: [
      {
        id: 'dsa',
        label: 'DSA',
        description:
          'Data structures and algorithms — arrays, trees, graphs, dynamic programming, sorting, and searching.',
      },
      {
        id: 'system-design',
        label: 'System Design',
        description:
          'Large-scale distributed system design — scalability, availability, consistency, and trade-offs.',
      },
      {
        id: 'behavioral',
        label: 'Behavioral',
        description:
          'Behavioral and leadership questions — teamwork, conflict resolution, and past experiences.',
      },
      {
        id: 'api-design',
        label: 'API Design',
        description:
          'RESTful and GraphQL API design — endpoint structure, versioning, authentication, and best practices.',
      },
      {
        id: 'ood',
        label: 'OOD',
        description:
          'Object-oriented design — design patterns, SOLID principles, class hierarchies, and UML modeling.',
      },
    ],
    companyGroups: [
      {
        label: 'FAANG',
        companies: [
          { name: 'Google', dotColor: 'bg-blue-400', disciplines: ['Software', 'Robotics'] },
          { name: 'Meta', dotColor: 'bg-indigo-400', disciplines: ['Software'] },
          { name: 'Amazon', dotColor: 'bg-orange-400', disciplines: ['Software', 'Robotics'] },
          { name: 'Apple', dotColor: 'bg-sky-400', disciplines: ['Software', 'Electrical'] },
          { name: 'Netflix', dotColor: 'bg-red-400', disciplines: ['Software'] },
        ],
      },
      {
        label: 'Big Tech',
        companies: [
          {
            name: 'Microsoft',
            dotColor: 'bg-cyan-400',
            disciplines: ['Software'],
          },
          {
            name: 'NVIDIA',
            dotColor: 'bg-green-400',
            disciplines: ['Software', 'Electrical', 'Robotics'],
          },
          {
            name: 'Tesla',
            dotColor: 'bg-rose-400',
            disciplines: [
              'Software',
              'Electrical',
              'Mechanical',
              'Robotics',
              'Aerospace',
            ],
          },
          { name: 'Uber', dotColor: 'bg-purple-400', disciplines: ['Software'] },
          { name: 'Airbnb', dotColor: 'bg-pink-400', disciplines: ['Software'] },
        ],
      },
      {
        label: 'Top Startups',
        companies: [
          { name: 'Stripe', dotColor: 'bg-violet-400', disciplines: ['Software'] },
          { name: 'Spotify', dotColor: 'bg-emerald-400', disciplines: ['Software'] },
          { name: 'Figma', dotColor: 'bg-fuchsia-400', disciplines: ['Software'] },
          { name: 'Notion', dotColor: 'bg-amber-400', disciplines: ['Software'] },
        ],
      },
      {
        label: 'Enterprise',
        companies: [
          { name: 'Oracle', dotColor: 'bg-red-400', disciplines: ['Software'] },
          { name: 'Bloomberg', dotColor: 'bg-orange-400', disciplines: ['Software'] },
          { name: 'IBM', dotColor: 'bg-blue-400', disciplines: ['Software'] },
        ],
      },
      {
        label: 'Rising Stars',
        companies: [
          { name: 'Databricks', dotColor: 'bg-teal-400', disciplines: ['Software'] },
          { name: 'Palantir', dotColor: 'bg-lime-400', disciplines: ['Software'] },
          { name: 'Coinbase', dotColor: 'bg-sky-400', disciplines: ['Software'] },
          { name: 'Snowflake', dotColor: 'bg-cyan-400', disciplines: ['Software'] },
          { name: 'Cloudflare', dotColor: 'bg-amber-400', disciplines: ['Software'] },
          { name: 'Datadog', dotColor: 'bg-purple-400', disciplines: ['Software'] },
        ],
      },
    ],
  },

  // ── Electrical Engineering ────────────────────────────────────────────────
  {
    id: 'Electrical',
    label: 'Electrical Engineering',
    icon: '⚡',
    description:
      'Prepare for electrical engineering interviews covering circuit design, signal processing, embedded systems, and VLSI.',
    categories: [
      {
        id: 'circuit-design',
        label: 'Circuit Design',
        description:
          'Analog and digital circuit design — amplifiers, filters, power supplies, and mixed-signal circuits.',
      },
      {
        id: 'signal-processing',
        label: 'Signal Processing',
        description:
          'DSP fundamentals — Fourier transforms, filtering, modulation, sampling theory, and spectral analysis.',
      },
      {
        id: 'power-systems',
        label: 'Power Systems',
        description:
          'Power generation, transmission, and distribution — transformers, motors, converters, and grid systems.',
      },
      {
        id: 'control-systems-ee',
        label: 'Control Systems',
        description:
          'Feedback control — transfer functions, stability analysis, PID controllers, and state-space methods.',
      },
      {
        id: 'embedded-systems-ee',
        label: 'Embedded Systems',
        description:
          'Microcontroller programming, RTOS, peripheral interfaces, firmware design, and hardware-software integration.',
      },
      {
        id: 'vlsi-digital-design',
        label: 'VLSI/Digital Design',
        description:
          'VLSI design flow — RTL coding, synthesis, timing analysis, verification, and FPGA prototyping.',
      },
    ],
    companyGroups: [
      {
        label: 'Semiconductor',
        companies: [
          { name: 'Intel', dotColor: 'bg-blue-400', disciplines: ['Electrical', 'Chemical'] },
          { name: 'AMD', dotColor: 'bg-red-400', disciplines: ['Electrical'] },
          { name: 'Qualcomm', dotColor: 'bg-indigo-400', disciplines: ['Electrical'] },
          {
            name: 'Texas Instruments',
            dotColor: 'bg-amber-400',
            disciplines: ['Electrical'],
          },
          { name: 'Broadcom', dotColor: 'bg-rose-400', disciplines: ['Electrical'] },
        ],
      },
      {
        label: 'Consumer Electronics',
        companies: [
          { name: 'Apple', dotColor: 'bg-sky-400', disciplines: ['Software', 'Electrical'] },
          { name: 'Samsung', dotColor: 'bg-blue-400', disciplines: ['Electrical'] },
          { name: 'Sony', dotColor: 'bg-violet-400', disciplines: ['Electrical'] },
        ],
      },
      {
        label: 'Industrial',
        companies: [
          {
            name: 'Siemens',
            dotColor: 'bg-teal-400',
            disciplines: ['Electrical', 'Mechanical', 'Civil'],
          },
          {
            name: 'ABB',
            dotColor: 'bg-orange-400',
            disciplines: ['Electrical', 'Robotics'],
          },
          {
            name: 'Honeywell',
            dotColor: 'bg-emerald-400',
            disciplines: ['Electrical', 'Aerospace', 'Chemical'],
          },
          {
            name: 'Schneider Electric',
            dotColor: 'bg-green-400',
            disciplines: ['Electrical'],
          },
        ],
      },
      {
        label: 'Automotive',
        companies: [
          {
            name: 'Tesla',
            dotColor: 'bg-rose-400',
            disciplines: [
              'Software',
              'Electrical',
              'Mechanical',
              'Robotics',
              'Aerospace',
            ],
          },
          {
            name: 'Bosch',
            dotColor: 'bg-cyan-400',
            disciplines: ['Electrical', 'Mechanical'],
          },
          {
            name: 'NXP Semiconductors',
            dotColor: 'bg-lime-400',
            disciplines: ['Electrical'],
          },
        ],
      },
    ],
  },

  // ── Mechanical Engineering ────────────────────────────────────────────────
  {
    id: 'Mechanical',
    label: 'Mechanical Engineering',
    icon: '⚙️',
    description:
      'Prepare for mechanical engineering interviews covering thermodynamics, fluid mechanics, machine design, and manufacturing.',
    categories: [
      {
        id: 'thermodynamics',
        label: 'Thermodynamics',
        description:
          'Laws of thermodynamics, heat transfer, energy conversion, HVAC systems, and thermal management.',
      },
      {
        id: 'fluid-mechanics',
        label: 'Fluid Mechanics',
        description:
          'Fluid statics and dynamics — Bernoulli equation, Navier-Stokes, CFD basics, and pipe flow.',
      },
      {
        id: 'solid-mechanics',
        label: 'Solid Mechanics',
        description:
          'Stress analysis, strain, deformation, fatigue, fracture mechanics, and finite element analysis.',
      },
      {
        id: 'machine-design',
        label: 'Machine Design',
        description:
          'Gear trains, bearings, shafts, fasteners, mechanisms, and tolerance/fit specifications.',
      },
      {
        id: 'manufacturing',
        label: 'Manufacturing',
        description:
          'Manufacturing processes — machining, casting, welding, additive manufacturing, and GD&T.',
      },
      {
        id: 'materials-science',
        label: 'Materials Science',
        description:
          'Material properties, selection, metallurgy, composites, polymers, and failure analysis.',
      },
    ],
    companyGroups: [
      {
        label: 'Automotive',
        companies: [
          {
            name: 'Tesla',
            dotColor: 'bg-rose-400',
            disciplines: [
              'Software',
              'Electrical',
              'Mechanical',
              'Robotics',
              'Aerospace',
            ],
          },
          { name: 'Toyota', dotColor: 'bg-red-400', disciplines: ['Mechanical'] },
          { name: 'Ford', dotColor: 'bg-blue-400', disciplines: ['Mechanical'] },
          { name: 'GM', dotColor: 'bg-indigo-400', disciplines: ['Mechanical'] },
          { name: 'BMW', dotColor: 'bg-sky-400', disciplines: ['Mechanical'] },
        ],
      },
      {
        label: 'Aerospace',
        companies: [
          {
            name: 'Boeing',
            dotColor: 'bg-cyan-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          {
            name: 'Lockheed Martin',
            dotColor: 'bg-purple-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          {
            name: 'SpaceX',
            dotColor: 'bg-amber-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          {
            name: 'Rolls-Royce',
            dotColor: 'bg-violet-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
        ],
      },
      {
        label: 'Industrial',
        companies: [
          {
            name: 'GE',
            dotColor: 'bg-teal-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          {
            name: 'Siemens',
            dotColor: 'bg-teal-400',
            disciplines: ['Electrical', 'Mechanical', 'Civil'],
          },
          { name: 'Caterpillar', dotColor: 'bg-yellow-400', disciplines: ['Mechanical'] },
          { name: 'John Deere', dotColor: 'bg-green-400', disciplines: ['Mechanical'] },
          {
            name: '3M',
            dotColor: 'bg-orange-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
        ],
      },
      {
        label: 'Energy',
        companies: [
          {
            name: 'Shell',
            dotColor: 'bg-yellow-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
          {
            name: 'ExxonMobil',
            dotColor: 'bg-red-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
          {
            name: 'Schlumberger',
            dotColor: 'bg-blue-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
        ],
      },
    ],
  },

  // ── Robotics ──────────────────────────────────────────────────────────────
  {
    id: 'Robotics',
    label: 'Robotics',
    icon: '🤖',
    description:
      'Prepare for robotics interviews covering control systems, kinematics, path planning, and computer vision.',
    categories: [
      {
        id: 'control-systems-rob',
        label: 'Control Systems',
        description:
          'Feedback and feedforward control, PID tuning, state estimation, Kalman filters, and adaptive control.',
      },
      {
        id: 'kinematics',
        label: 'Kinematics',
        description:
          'Forward/inverse kinematics, Denavit-Hartenberg parameters, workspace analysis, and jacobians.',
      },
      {
        id: 'path-planning',
        label: 'Path Planning',
        description:
          'Motion planning — A*, RRT, PRM, SLAM, obstacle avoidance, and trajectory optimization.',
      },
      {
        id: 'computer-vision',
        label: 'Computer Vision',
        description:
          'Image processing, object detection, depth estimation, visual SLAM, and deep learning for perception.',
      },
      {
        id: 'sensor-fusion',
        label: 'Sensor Fusion',
        description:
          'Multi-sensor integration — LiDAR, cameras, IMUs, GPS, and probabilistic fusion algorithms.',
      },
      {
        id: 'embedded-systems-rob',
        label: 'Embedded Systems',
        description:
          'Real-time systems for robotics — ROS, microcontrollers, actuator control, and communication protocols.',
      },
    ],
    companyGroups: [
      {
        label: 'Tech',
        companies: [
          {
            name: 'Boston Dynamics',
            dotColor: 'bg-yellow-400',
            disciplines: ['Robotics'],
          },
          {
            name: 'NVIDIA',
            dotColor: 'bg-green-400',
            disciplines: ['Software', 'Electrical', 'Robotics'],
          },
          {
            name: 'Google DeepMind',
            dotColor: 'bg-blue-400',
            disciplines: ['Robotics'],
          },
        ],
      },
      {
        label: 'Autonomous Vehicles',
        companies: [
          {
            name: 'Tesla',
            dotColor: 'bg-rose-400',
            disciplines: [
              'Software',
              'Electrical',
              'Mechanical',
              'Robotics',
              'Aerospace',
            ],
          },
          { name: 'Waymo', dotColor: 'bg-emerald-400', disciplines: ['Robotics', 'Software'] },
          { name: 'Cruise', dotColor: 'bg-orange-400', disciplines: ['Robotics', 'Software'] },
          { name: 'Aurora', dotColor: 'bg-cyan-400', disciplines: ['Robotics', 'Software'] },
        ],
      },
      {
        label: 'Industrial',
        companies: [
          {
            name: 'ABB',
            dotColor: 'bg-orange-400',
            disciplines: ['Electrical', 'Robotics'],
          },
          { name: 'FANUC', dotColor: 'bg-amber-400', disciplines: ['Robotics'] },
          { name: 'KUKA', dotColor: 'bg-fuchsia-400', disciplines: ['Robotics'] },
        ],
      },
      {
        label: 'Consumer',
        companies: [
          { name: 'iRobot', dotColor: 'bg-lime-400', disciplines: ['Robotics'] },
          { name: 'DJI', dotColor: 'bg-sky-400', disciplines: ['Robotics', 'Aerospace'] },
        ],
      },
    ],
  },

  // ── Aerospace Engineering ─────────────────────────────────────────────────
  {
    id: 'Aerospace',
    label: 'Aerospace Engineering',
    icon: '🚀',
    description:
      'Prepare for aerospace engineering interviews covering aerodynamics, propulsion, orbital mechanics, and avionics.',
    categories: [
      {
        id: 'aerodynamics',
        label: 'Aerodynamics',
        description:
          'Subsonic, transonic, and supersonic flow — lift, drag, boundary layers, CFD, and wind tunnel testing.',
      },
      {
        id: 'propulsion',
        label: 'Propulsion',
        description:
          'Jet engines, rocket propulsion, turbomachinery, combustion, nozzle design, and performance analysis.',
      },
      {
        id: 'flight-mechanics',
        label: 'Flight Mechanics',
        description:
          'Aircraft performance, stability and control, flight dynamics, and autopilot systems.',
      },
      {
        id: 'orbital-mechanics',
        label: 'Orbital Mechanics',
        description:
          'Kepler laws, orbital transfers, mission planning, constellation design, and astrodynamics.',
      },
      {
        id: 'structural-analysis-aero',
        label: 'Structural Analysis',
        description:
          'Aerospace structures — thin-walled structures, fatigue, composites, aeroelasticity, and FEA.',
      },
      {
        id: 'avionics',
        label: 'Avionics',
        description:
          'Flight computers, navigation systems, communication systems, radar, and DO-178C certification.',
      },
    ],
    companyGroups: [
      {
        label: 'Space',
        companies: [
          {
            name: 'SpaceX',
            dotColor: 'bg-amber-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          { name: 'Blue Origin', dotColor: 'bg-blue-400', disciplines: ['Aerospace'] },
          { name: 'NASA', dotColor: 'bg-red-400', disciplines: ['Aerospace'] },
          {
            name: 'Northrop Grumman',
            dotColor: 'bg-indigo-400',
            disciplines: ['Aerospace'],
          },
        ],
      },
      {
        label: 'Defense',
        companies: [
          {
            name: 'Lockheed Martin',
            dotColor: 'bg-purple-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          { name: 'Raytheon', dotColor: 'bg-sky-400', disciplines: ['Aerospace'] },
          { name: 'BAE Systems', dotColor: 'bg-rose-400', disciplines: ['Aerospace'] },
          {
            name: 'General Dynamics',
            dotColor: 'bg-teal-400',
            disciplines: ['Aerospace'],
          },
        ],
      },
      {
        label: 'Commercial Aviation',
        companies: [
          {
            name: 'Boeing',
            dotColor: 'bg-cyan-400',
            disciplines: ['Mechanical', 'Aerospace'],
          },
          { name: 'Airbus', dotColor: 'bg-violet-400', disciplines: ['Aerospace'] },
          {
            name: 'GE Aviation',
            dotColor: 'bg-emerald-400',
            disciplines: ['Aerospace'],
          },
          {
            name: 'Pratt & Whitney',
            dotColor: 'bg-orange-400',
            disciplines: ['Aerospace'],
          },
        ],
      },
      {
        label: 'UAV',
        companies: [
          {
            name: 'General Atomics',
            dotColor: 'bg-lime-400',
            disciplines: ['Aerospace'],
          },
          { name: 'Kratos', dotColor: 'bg-fuchsia-400', disciplines: ['Aerospace'] },
        ],
      },
    ],
  },

  // ── Civil Engineering ─────────────────────────────────────────────────────
  {
    id: 'Civil',
    label: 'Civil Engineering',
    icon: '🏗️',
    description:
      'Prepare for civil engineering interviews covering structural analysis, geotechnical, transportation, and construction management.',
    categories: [
      {
        id: 'structural-analysis-civil',
        label: 'Structural Analysis',
        description:
          'Load analysis, beam/column design, concrete and steel design codes, seismic design, and FEA.',
      },
      {
        id: 'geotechnical',
        label: 'Geotechnical',
        description:
          'Soil mechanics, foundation design, slope stability, retaining walls, and site investigation.',
      },
      {
        id: 'transportation',
        label: 'Transportation',
        description:
          'Highway design, traffic engineering, pavement design, transportation planning, and safety analysis.',
      },
      {
        id: 'hydraulics',
        label: 'Hydraulics',
        description:
          'Open channel flow, pipe networks, stormwater management, dam design, and water resources engineering.',
      },
      {
        id: 'environmental-civil',
        label: 'Environmental',
        description:
          'Water and wastewater treatment, air quality, environmental impact assessment, and sustainability.',
      },
      {
        id: 'construction-management',
        label: 'Construction Management',
        description:
          'Project scheduling, cost estimation, contract management, safety, and lean construction.',
      },
    ],
    companyGroups: [
      {
        label: 'Construction',
        companies: [
          { name: 'Bechtel', dotColor: 'bg-blue-400', disciplines: ['Civil'] },
          { name: 'Fluor', dotColor: 'bg-orange-400', disciplines: ['Civil', 'Chemical'] },
          { name: 'AECOM', dotColor: 'bg-indigo-400', disciplines: ['Civil'] },
          { name: 'Jacobs', dotColor: 'bg-purple-400', disciplines: ['Civil'] },
        ],
      },
      {
        label: 'Consulting',
        companies: [
          { name: 'Arup', dotColor: 'bg-red-400', disciplines: ['Civil'] },
          { name: 'WSP', dotColor: 'bg-green-400', disciplines: ['Civil'] },
          { name: 'Mott MacDonald', dotColor: 'bg-amber-400', disciplines: ['Civil'] },
        ],
      },
      {
        label: 'Infrastructure',
        companies: [
          { name: 'Kiewit', dotColor: 'bg-yellow-400', disciplines: ['Civil'] },
          { name: 'Skanska', dotColor: 'bg-cyan-400', disciplines: ['Civil'] },
          {
            name: 'Turner Construction',
            dotColor: 'bg-teal-400',
            disciplines: ['Civil'],
          },
        ],
      },
    ],
  },

  // ── Chemical Engineering ──────────────────────────────────────────────────
  {
    id: 'Chemical',
    label: 'Chemical Engineering',
    icon: '🧪',
    description:
      'Prepare for chemical engineering interviews covering process design, reaction engineering, transport phenomena, and process control.',
    categories: [
      {
        id: 'process-design',
        label: 'Process Design',
        description:
          'Process flow diagrams, P&IDs, mass and energy balances, equipment sizing, and HAZOP analysis.',
      },
      {
        id: 'reaction-engineering',
        label: 'Reaction Engineering',
        description:
          'Reactor design, kinetics, catalysis, reaction mechanisms, and conversion/selectivity optimization.',
      },
      {
        id: 'transport-phenomena',
        label: 'Transport Phenomena',
        description:
          'Heat, mass, and momentum transfer — conduction, convection, diffusion, and boundary layer theory.',
      },
      {
        id: 'thermodynamics-chem',
        label: 'Thermodynamics',
        description:
          'Phase equilibria, equations of state, activity models, vapor-liquid equilibrium, and energy cycles.',
      },
      {
        id: 'process-control',
        label: 'Process Control',
        description:
          'PID control, instrumentation, DCS/PLC systems, process safety, and regulatory compliance.',
      },
      {
        id: 'materials-chem',
        label: 'Materials',
        description:
          'Polymer engineering, corrosion, coatings, nanomaterials, and semiconductor materials processing.',
      },
    ],
    companyGroups: [
      {
        label: 'Oil & Gas',
        companies: [
          {
            name: 'Shell',
            dotColor: 'bg-yellow-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
          {
            name: 'ExxonMobil',
            dotColor: 'bg-red-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
          { name: 'Chevron', dotColor: 'bg-blue-400', disciplines: ['Chemical'] },
          { name: 'BP', dotColor: 'bg-green-400', disciplines: ['Chemical'] },
        ],
      },
      {
        label: 'Pharma',
        companies: [
          {
            name: 'Pfizer',
            dotColor: 'bg-sky-400',
            disciplines: ['Chemical', 'Biomedical'],
          },
          {
            name: 'Johnson & Johnson',
            dotColor: 'bg-rose-400',
            disciplines: ['Chemical', 'Biomedical'],
          },
          { name: 'Merck', dotColor: 'bg-teal-400', disciplines: ['Chemical'] },
        ],
      },
      {
        label: 'Materials',
        companies: [
          { name: 'Dow', dotColor: 'bg-orange-400', disciplines: ['Chemical'] },
          { name: 'BASF', dotColor: 'bg-indigo-400', disciplines: ['Chemical'] },
          { name: 'DuPont', dotColor: 'bg-purple-400', disciplines: ['Chemical'] },
          {
            name: '3M',
            dotColor: 'bg-orange-400',
            disciplines: ['Mechanical', 'Chemical'],
          },
        ],
      },
      {
        label: 'Semiconductor',
        companies: [
          { name: 'TSMC', dotColor: 'bg-violet-400', disciplines: ['Chemical'] },
          { name: 'Intel', dotColor: 'bg-blue-400', disciplines: ['Electrical', 'Chemical'] },
          {
            name: 'Applied Materials',
            dotColor: 'bg-emerald-400',
            disciplines: ['Chemical'],
          },
        ],
      },
    ],
  },

  // ── Biomedical Engineering ────────────────────────────────────────────────
  {
    id: 'Biomedical',
    label: 'Biomedical Engineering',
    icon: '🧬',
    description:
      'Prepare for biomedical engineering interviews covering medical devices, biomechanics, bioinstrumentation, and regulatory affairs.',
    categories: [
      {
        id: 'medical-devices',
        label: 'Medical Devices',
        description:
          'Device design, prototyping, biocompatibility, sterilization, and usability engineering.',
      },
      {
        id: 'biomechanics',
        label: 'Biomechanics',
        description:
          'Musculoskeletal modeling, prosthetics, orthotics, gait analysis, and implant mechanics.',
      },
      {
        id: 'bioinstrumentation',
        label: 'Bioinstrumentation',
        description:
          'Biosensors, medical imaging, signal acquisition, physiological monitoring, and data processing.',
      },
      {
        id: 'biomaterials',
        label: 'Biomaterials',
        description:
          'Implant materials, biocompatibility testing, degradation, surface modification, and scaffolds.',
      },
      {
        id: 'regulatory-quality',
        label: 'Regulatory/Quality',
        description:
          'FDA 510(k)/PMA, ISO 13485, design controls, risk management (ISO 14971), and quality systems.',
      },
      {
        id: 'tissue-engineering',
        label: 'Tissue Engineering',
        description:
          'Cell culture, bioreactors, scaffold design, organ-on-chip, and regenerative medicine.',
      },
    ],
    companyGroups: [
      {
        label: 'Medical Devices',
        companies: [
          { name: 'Medtronic', dotColor: 'bg-blue-400', disciplines: ['Biomedical'] },
          {
            name: 'Boston Scientific',
            dotColor: 'bg-green-400',
            disciplines: ['Biomedical'],
          },
          { name: 'Abbott', dotColor: 'bg-red-400', disciplines: ['Biomedical'] },
          { name: 'Stryker', dotColor: 'bg-amber-400', disciplines: ['Biomedical'] },
        ],
      },
      {
        label: 'Pharma',
        companies: [
          {
            name: 'Pfizer',
            dotColor: 'bg-sky-400',
            disciplines: ['Chemical', 'Biomedical'],
          },
          {
            name: 'Johnson & Johnson',
            dotColor: 'bg-rose-400',
            disciplines: ['Chemical', 'Biomedical'],
          },
          { name: 'Roche', dotColor: 'bg-indigo-400', disciplines: ['Biomedical'] },
        ],
      },
      {
        label: 'Diagnostics',
        companies: [
          {
            name: 'Siemens Healthineers',
            dotColor: 'bg-teal-400',
            disciplines: ['Biomedical'],
          },
          {
            name: 'GE Healthcare',
            dotColor: 'bg-purple-400',
            disciplines: ['Biomedical'],
          },
          {
            name: 'Philips Healthcare',
            dotColor: 'bg-cyan-400',
            disciplines: ['Biomedical'],
          },
        ],
      },
      {
        label: 'Biotech',
        companies: [
          {
            name: 'Intuitive Surgical',
            dotColor: 'bg-emerald-400',
            disciplines: ['Biomedical'],
          },
          {
            name: 'Edwards Lifesciences',
            dotColor: 'bg-violet-400',
            disciplines: ['Biomedical'],
          },
        ],
      },
    ],
  },
]

// ─── Lookup Map ───────────────────────────────────────────────────────────────

const disciplineMap = new Map<Discipline, DisciplineConfig>(
  disciplineConfigs.map((d) => [d.id, d])
)

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Returns all discipline configurations. */
export function getDisciplines(): DisciplineConfig[] {
  return disciplineConfigs
}

/** Returns the configuration for a single discipline. Throws if not found. */
export function getDiscipline(id: Discipline): DisciplineConfig {
  const config = disciplineMap.get(id)
  if (!config) {
    throw new Error(`Unknown discipline: ${id}`)
  }
  return config
}

/** Returns the interview categories for a given discipline. */
export function getCategoriesForDiscipline(id: Discipline): CategoryConfig[] {
  return getDiscipline(id).categories
}

/** Returns the company groups for a given discipline. */
export function getCompanyGroupsForDiscipline(id: Discipline): CompanyGroup[] {
  return getDiscipline(id).companyGroups
}

/** Returns a deduplicated list of all companies across every discipline. */
export function getAllCompanies(): CompanyConfig[] {
  const seen = new Map<string, CompanyConfig>()

  for (const discipline of disciplineConfigs) {
    for (const group of discipline.companyGroups) {
      for (const company of group.companies) {
        const existing = seen.get(company.name)
        if (existing) {
          // Merge disciplines, keeping the set unique
          const merged = new Set([...existing.disciplines, ...company.disciplines])
          seen.set(company.name, {
            ...existing,
            disciplines: Array.from(merged) as Discipline[],
          })
        } else {
          seen.set(company.name, { ...company })
        }
      }
    }
  }

  return Array.from(seen.values())
}

/** Returns the list of disciplines a specific company is associated with. */
export function getCompanyDisciplines(companyName: string): Discipline[] {
  const disciplines = new Set<Discipline>()

  for (const discipline of disciplineConfigs) {
    for (const group of discipline.companyGroups) {
      for (const company of group.companies) {
        if (company.name === companyName) {
          for (const d of company.disciplines) {
            disciplines.add(d)
          }
        }
      }
    }
  }

  return Array.from(disciplines)
}
