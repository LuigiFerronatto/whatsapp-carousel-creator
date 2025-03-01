src/
├── components/
│   ├── common/              # Componentes compartilhados
│   │   ├── JsonViewer.js
│   │   ├── JsonViewer.module.css
│   │   ├── ProgressHeader.js
│   │   ├── ProgressHeader.module.css
│   │   ├── StatusMessage.js
│   │   └── StatusMessage.module.css
│   ├── editors/             # Componentes de edição
│   │   ├── ButtonEditor.js
│   │   ├── ButtonEditor.module.css
│   │   ├── CardTemplateEditor.js
│   │   ├── CardTemplateEditor.module.css
│   │   ├── CardUploadInput.js
│   │   └── CardUploadInput.module.css
│   ├── previews/            # Componentes de preview
│   │   ├── CarouselPreview.js
│   │   └── CarouselPreview.module.css
│   └── steps/               # Componentes de etapas do fluxo
│       ├── StepOne.js
│       ├── StepOne.module.css
│       ├── StepTwo.js
│       ├── StepTwo.module.css
│       ├── StepThree.js
│       ├── StepThree.module.css
│       ├── StepFour.js
│       └── StepFour.module.css
│   └── style-guide.css (CSS de Estilos Globais) - Identificar se realmente está sendo utilizado e se deveria estar aqui..
├── contexts/                # Contextos React
│   └── WhatsAppTemplateContext.js
├── hooks/                   # Custom hooks
│   ├── useFileUpload.js
│   └── useWhatsAppTemplate.js
├── services/                # Serviços de API e utilitários
│   ├── apiService.js
│   ├── azureBlobService.js
│   ├── templateService.js
│   └── validationService.js (Vazio)
├── utils/                   # Utilitários
│   ├── errorHandler.js
│   ├── localStorageService.js
│   └── validations.js
├── styles/                  # Estilos globais
│   └── (Vazio)
├── App.js                   # Componente principal
├── WhatsAppCarouselCreator.js                 # Componente principal
├── WhatsAppCarouselCreator.module.css                # Componente principal
└── index.js                 # Ponto de entrada