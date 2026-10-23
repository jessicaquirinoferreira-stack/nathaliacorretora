import { Property, Development, SiteSettings, LandingPage, SocialPost } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  brandName: "Nathalia Robadey Imóveis",
  logoUrl: "/logo-nathalia-robadey.png",
  phone: "+55 22 99931-5940",
  whatsapp: "+55 22 99931-5940",
  email: "nathaliardmp@gmail.com",
  instagram: "@nathaliarobadey",
  address: "Região Serrana & Rio de Janeiro, RJ - Atendimento com hora marcada",
  ctaWhatsappDefault: "Olá Nathalia, estou no seu site e gostaria de atendimento para imóveis.",
  heroTitle: "Curadoria Imobiliária Residencial & Lançamentos",
  heroSubtitle: "Imóveis selecionados com excelente localização, conforto e assessoria completa para morar ou investir.",
  heroBadge: "Imóveis Selecionados & Atendimento Personalizado",
  aboutStory: "Nathalia Robadey é especialista no mercado imobiliário, oferecendo uma experiência sob medida para clientes que buscam residências confortáveis, refúgios na serra e investimentos sólidos.\n\nCom atuação destacada na Região Serrana e no Estado do Rio de Janeiro, sua consultoria alia curadoria apurada, ética absoluta e assessoria completa em todas as etapas de negociação.",
  aboutQuote: "Um imóvel não é apenas um espaço físico; é a expressão do seu estilo de vida e o refúgio da sua família.",
  aboutExperience: "Consultoria Imobiliária com atendimento humanizado, assessoria completa e conexão direta com as melhores oportunidades do mercado.",
  privacyPolicy: "A Nathalia Robadey Imóveis respeita a sua privacidade e está em total conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018). Todos os dados coletados através dos nossos formulários de contato, interesse e agendamento de visitas são utilizados exclusivamente para o atendimento imobiliário solicitado, com absoluto sigilo e nunca compartilhados com terceiros para fins de marketing sem sua prévia autorização.",
  cookiesPolicy: "Utilizamos cookies essenciais e de performance para garantir que você tenha a melhor experiência de navegação em nosso site, memorizar suas preferências de busca e analisar de forma anônima o tráfego do portal.",
  termsOfUse: "Os valores, disponibilidades e condições dos imóveis apresentados neste portal estão sujeitos a confirmação prévia e podem sofrer alterações sem aviso prévio. As fotografias e ilustrações são de propriedade da Nathalia Robadey Imóveis ou de seus respectivos parceiros comerciais.",
  seoTitle: "Nathalia Robadey Imóveis | Compra, Venda e Lançamentos",
  seoDescription: "Curadoria de casas, coberturas, apartamentos e empreendimentos na Região Serrana e Rio de Janeiro com atendimento personalizado por Nathalia Robadey.",
  googleAnalyticsId: "",
  metaPixelId: "",
  primaryColor: "#0B192C",
  goldColor: "#C5A059"
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    title: "Residência Panorâmica no Vale dos Cristais",
    slug: "residencia-panoramica-vale-dos-cristais",
    referenceCode: "NRI-101",
    description: "Espetacular residência em meio à natureza com projeto contemporâneo. Ambientes totalmente integrados com pé-direito duplo, esquadrias amplas proporcionando iluminação natural e vista permanente para as montanhas. Área social com lareira, cozinha integrada e varanda com piscina aquecida e deck. Suíte master com closet e terraço privativo.",
    shortDescription: "Residência contemporânea com pé-direito duplo, vista para montanhas e piscina.",
    purpose: "venda",
    type: "casa",
    city: "Nova Friburgo",
    neighborhood: "Mury",
    address: "Condomínio Reserva da Serra",
    showAddress: false,
    price: 1850000,
    priceDisplay: "R$ 1.850.000",
    condoFee: 600,
    iptu: 350,
    usableArea: 280,
    totalArea: 1200,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parkingSpots: 3,
    features: [
      "Piscina aquecida",
      "Espaço Gourmet com churrasqueira",
      "Lareira",
      "Segurança 24h em condomínio fechado",
      "Pé-direito duplo",
      "Vista panorâmica"
    ],
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
        title: "Fachada Principal e Piscina",
        isCover: true
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
        title: "Living Integrado"
      }
    ],
    status: "published",
    isFeatured: true,
    isLaunch: false,
    isOpportunity: true,
    createdAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-10-20T14:30:00Z",
    seoTitle: "Casa à Venda em Mury | Nathalia Robadey Imóveis",
    seoDescription: "Residência de 3 quartos com piscina e vista para as montanhas em Nova Friburgo."
  },
  {
    id: "prop-002",
    title: "Cobertura com Terraço Panorâmico",
    slug: "cobertura-com-terraco-panoramico",
    referenceCode: "NRI-102",
    description: "Imponente cobertura linear com excelente área privativa. Amplo living em dois ambientes integrado à varanda frontal. Terraço privativo com solarium e espaço gourmet com churrasqueira. Planta prática com 3 quartos (1 suíte), cozinha planejada e área de serviço.",
    shortDescription: "Cobertura com terraço, churrasqueira e 3 quartos.",
    purpose: "venda",
    type: "cobertura",
    city: "Rio de Janeiro",
    neighborhood: "Barra da Tijuca",
    address: "Avenida Lúcio Costa",
    showAddress: false,
    price: 2950000,
    priceDisplay: "R$ 2.950.000",
    condoFee: 1400,
    iptu: 850,
    usableArea: 220,
    totalArea: 250,
    bedrooms: 3,
    suites: 1,
    bathrooms: 3,
    parkingSpots: 2,
    features: [
      "Terraço privativo com churrasqueira",
      "Portaria 24h",
      "2 vagas na garagem",
      "Próximo à praia"
    ],
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      {
        id: "g5",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
        title: "Terraço da Cobertura",
        isCover: true
      }
    ],
    status: "published",
    isFeatured: true,
    isLaunch: false,
    isOpportunity: false,
    createdAt: "2026-10-18T09:00:00Z",
    updatedAt: "2026-10-21T11:00:00Z",
    seoTitle: "Cobertura à Venda na Barra da Tijuca | Nathalia Robadey Imóveis",
    seoDescription: "Cobertura de 3 quartos com terraço e excelente localização."
  },
  {
    id: "prop-003",
    title: "Apartamento no Coração de Nova Friburgo",
    slug: "apartamento-coracao-nova-friburgo",
    referenceCode: "NRI-103",
    description: "Unidade exclusiva em edifício residencial tranquilo e bem localizado. Projeto moderno, armários planejados e boa iluminação natural. Living com varanda, 3 quartos (1 suíte), cozinha e área de serviço. Duas vagas de garagem.",
    shortDescription: "Apartamento com 3 quartos, varanda e ótima localização.",
    purpose: "venda",
    type: "apartamento",
    city: "Nova Friburgo",
    neighborhood: "Cônego",
    address: "Rua das Camélias",
    showAddress: false,
    price: 750000,
    priceDisplay: "R$ 750.000",
    condoFee: 480,
    iptu: 150,
    usableArea: 115,
    totalArea: 135,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpots: 2,
    features: [
      "Varanda",
      "Móveis planejados",
      "2 vagas na garagem",
      "Portaria inteligente"
    ],
    coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      {
        id: "g8",
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
        title: "Living Integrado",
        isCover: true
      }
    ],
    status: "published",
    isFeatured: true,
    isLaunch: true,
    isOpportunity: true,
    createdAt: "2026-10-19T14:00:00Z",
    updatedAt: "2026-10-22T16:00:00Z",
    seoTitle: "Apartamento no Cônego | Nathalia Robadey Imóveis",
    seoDescription: "Apartamento de 3 quartos com varanda no bairro Cônego."
  },
  {
    id: "prop-004",
    title: "Chácara e Refúgio de Montanha em Macaé de Cima",
    slug: "chacara-refugio-montanha-macae-de-cima",
    referenceCode: "NRI-104",
    description: "Propriedade rural cercada por natureza preservada e nascentes. Casa sede aconchegante com 4 dormitórios (1 suíte), fogão a lenha, varandão com vista para as montanhas, pomar e horta.",
    shortDescription: "Refúgio de serra com terreno espaçoso e nascentes.",
    purpose: "venda",
    type: "sitio",
    city: "Nova Friburgo",
    neighborhood: "Macaé de Cima",
    address: "Estrada Parque",
    showAddress: false,
    price: 1200000,
    priceDisplay: "R$ 1.200.000",
    condoFee: 0,
    iptu: 60,
    usableArea: 250,
    totalArea: 10000,
    bedrooms: 4,
    suites: 1,
    bathrooms: 3,
    parkingSpots: 4,
    features: [
      "Terreno com 10.000m²",
      "Nascentes de água",
      "Pomar e horta",
      "Fogão a lenha"
    ],
    coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      {
        id: "g10",
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
        title: "Sede Principal",
        isCover: true
      }
    ],
    status: "published",
    isFeatured: false,
    isLaunch: false,
    isOpportunity: true,
    createdAt: "2026-10-12T11:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z",
    seoTitle: "Chácara em Macaé de Cima | Nathalia Robadey Imóveis",
    seoDescription: "Propriedade rural com natureza exuberante em Nova Friburgo."
  }
];

export const INITIAL_DEVELOPMENTS: Development[] = [
  {
    id: "dev-001",
    title: "Reserva das Araucárias Residences",
    slug: "reserva-das-araucarias-residences",
    developer: "Vanguard Incorporadora",
    location: "Mury, Nova Friburgo - RJ",
    city: "Nova Friburgo",
    neighborhood: "Mury",
    type: "Condomínio Fechado de Casas",
    status: "in_construction",
    startingPrice: 980000,
    deliveryForecast: "Dezembro de 2027",
    unitsCount: "24 residências exclusivas",
    description: "Um empreendimento desenhado para quem valoriza a tranquilidade da montanha com segurança e conforto. Lotes generosos a partir de 800m², área de lazer com quadra poliesportiva e portaria 24 horas.",
    features: [
      "Área de lazer com quadra poliesportiva",
      "Espaço de convivência",
      "Trilhas ecológicas",
      "Portaria 24 horas"
    ],
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      {
        id: "dg1",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
        title: "Perspectiva do Condomínio",
        isCover: true
      }
    ],
    isFeatured: true,
    order: 1,
    ctaText: "Receber book e tabela de preços",
    seoTitle: "Reserva das Araucárias | Condomínio em Mury",
    seoDescription: "Condomínio fechado com lotes e casas na Região Serrana."
  }
];

export const INITIAL_LANDING_PAGES: LandingPage[] = [
  {
    id: "lp-001",
    slug: "lancamento-reserva-araucarias",
    title: "Lançamento: Reserva das Araucárias",
    subtitle: "Viva com tranquilidade na Região Serrana",
    objective: "launch",
    status: "published",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    headline: "O refúgio na serra que você e sua família merecem.",
    description: "Garanta condições especiais de tabela de lançamento e escolha os melhores lotes.",
    whatsappCtaText: "Olá Nathalia, gostaria de receber a apresentação completa do Reserva das Araucárias.",
    viewsCount: 142,
    leadsCount: 18,
    createdAt: "2026-10-15T08:00:00Z",
    updatedAt: "2026-10-22T10:00:00Z",
    seoTitle: "Lançamento Reserva das Araucárias | Nathalia Robadey",
    seoDescription: "Consulte disponibilidade com a corretora Nathalia Robadey.",
    sections: [
      {
        id: "sec-1",
        type: "hero",
        title: "Reserva das Araucárias",
        subtitle: "A união perfeita entre conforto e a natureza de Nova Friburgo."
      },
      {
        id: "sec-2",
        type: "features",
        title: "Diferenciais",
        items: [
          "Lotes com excelente topografia",
          "Área de lazer completa",
          "Segurança 24 horas"
        ]
      }
    ]
  }
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "post-1",
    platform: "instagram",
    title: "Residência Mury",
    caption: "A sensação de acordar diante do vale das montanhas com todo o conforto.\n\n✨ 3 quartos | Piscina | Vista panorâmica\n\nAgende sua visita através do link na bio ou direct.\n\n#NathaliaRobadeyImoveis #RegiaoSerrana #NovaFriburgo #ImoveisResidenciais",
    hashtags: ["#NathaliaRobadeyImoveis", "#RegiaoSerrana", "#NovaFriburgo", "#ImoveisResidenciais"],
    mediaUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    status: "published",
    suggestedByAi: false,
    createdAt: "2026-10-20T12:00:00Z"
  }
];
