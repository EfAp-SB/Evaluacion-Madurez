/* ================================
   FORJADIGITALAE - EVALUACIÓN JS
   Versión Corregida y Optimizada
   ================================ */

// ===== CONFIGURACIÓN GLOBAL =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxV6oR9z1Px-YnlbZXR-rJ04Kz-6g7A6DLMDGwg9E460EGuBnS2X5TEcScXtXN0zCrVqA/exec';

// ===== ESTADO DE LA APLICACIÓN =====
let appState = {
    currentSection: 'landing',
    companyData: {},
    evaluationData: {
        currentCategory: 0,
        currentQuestion: 0,
        answers: {},
        categoryScores: {},
        achievements: [],
        startTime: null,
        completedCategories: [],
        shownMessages: []
    },
    consent: {
        essential: true,
        communications: false,
        benchmarking: false
    }
};

// ===== SISTEMA DE GAMIFICACIÓN =====
const achievements = {
    "first_steps": { 
        name: "Primeros Pasos", 
        icon: "🚀", 
        description: "Completaste tu primera categoría",
        trigger: "complete_category_1" 
    },
    "momentum": { 
        name: "Tomando Impulso", 
        icon: "⚡", 
        description: "3 categorías completadas, ¡vas genial!",
        trigger: "complete_3_categories" 
    },
    "halfway_hero": { 
        name: "Héroe a Mitad de Camino", 
        icon: "🦸‍♂️", 
        description: "50% completado, ¡imparable!",
        trigger: "50_percent_complete" 
    },
    "perfectionist": { 
        name: "Perfeccionista", 
        icon: "💎", 
        description: "Todas tus respuestas son de alto nivel",
        trigger: "all_high_answers" 
    },
    "completion_champion": { 
        name: "Campeón de Finalización", 
        icon: "🏆", 
        description: "¡Evaluación 100% completada!",
        trigger: "100_percent_complete" 
    },
    "speed_demon": {
        name: "Rayo Empresarial",
        icon: "⚡",
        description: "Completaste la evaluación en tiempo récord",
        trigger: "fast_completion"
    }
};

// Mensajes motivacionales por progreso
const motivationalMessages = {
    5: { emoji: "🌟", message: "¡Excelente comienzo! Ya tienes el 5% completado" },
    10: { emoji: "🚀", message: "¡Fantástico! El 10% ya está listo" },
    25: { emoji: "💪", message: "¡Vas súper bien! Un cuarto del camino recorrido" },
    40: { emoji: "🔥", message: "¡Increíble momentum! Casi a la mitad" },
    50: { emoji: "🎯", message: "¡Increíble! Ya estás a mitad del camino hacia tu diagnóstico" },
    65: { emoji: "⭐", message: "¡Excelente progreso! Más de la mitad completada" },
    75: { emoji: "💎", message: "¡Casi lo logras! Solo falta el 25% para tu reporte personalizado" },
    85: { emoji: "🏆", message: "¡En la recta final! Tu reporte profesional te está esperando" },
    90: { emoji: "🎉", message: "¡Último esfuerzo! Estás a punto de descubrir tu potencial" },
    95: { emoji: "🌟", message: "¡Casi, casi! Tu diagnóstico personalizado está listo" }
};

// Estados emocionales del progreso
const progressStates = {
    0: { emoji: "😴", state: "Iniciando", color: "#94a3b8" },
    20: { emoji: "😐", state: "Calentando", color: "#64748b" },
    40: { emoji: "🙂", state: "Progresando", color: "#0ea5e9" },
    60: { emoji: "😊", state: "Avanzando", color: "#8b5cf6" },
    80: { emoji: "🤩", state: "Acelerando", color: "#f59e0b" },
    100: { emoji: "🚀", state: "¡Completado!", color: "#10b981" }
};

// ===== CATEGORÍAS DE EVALUACIÓN =====
const categories = [
    {
        id: 'vision_estrategia',
        name: 'Visión y Estrategia',
        icon: '🎯',
        weight: 0.10,
        description: 'Se evalúa si la empresa tiene una visión clara a largo plazo y una estrategia bien definida para alcanzarla.',
        questions: [
            { id: 've_01', text: '¿La empresa tiene una visión a largo plazo, formalmente documentada y comunicada a todo el equipo?', tooltip: 'La visión debe ser un documento escrito, conocido y entendido por todos.', weight: 1.2 },
            { id: 've_02', text: '¿Existe un plan estratégico claro que detalle los objetivos, metas y acciones para los próximos 3-5 años?', tooltip: 'El plan debe incluir KPIs para medir el progreso.', weight: 1.2 },
            { id: 've_03', text: '¿La estrategia de la empresa considera activamente las tendencias del mercado y el entorno competitivo?', tooltip: 'Se deben realizar análisis periódicos del mercado.', weight: 1.0 },
            { id: 've_04', text: '¿Los objetivos de los departamentos y empleados están claramente alineados con la estrategia general?', tooltip: 'La estrategia debe desglosarse en objetivos específicos para cada área.', weight: 1.1 },
            { id: 've_05', text: '¿Se asignan recursos de manera coherente con las prioridades estratégicas?', tooltip: 'El presupuesto debe reflejar las prioridades estratégicas.', weight: 1.1 }
        ]
    },
    {
        id: 'gobierno_empresarial',
        name: 'Gobierno Empresarial',
        icon: '🏛️',
        weight: 0.10,
        description: 'Analiza la solidez de las estructuras de toma de decisiones y los procesos de control.',
        questions: [
            { id: 'ge_01', text: '¿Existen roles y responsabilidades claramente definidos para los líderes?', tooltip: 'Debe haber un organigrama claro.', weight: 1.2 },
            { id: 'ge_02', text: '¿La empresa cuenta con políticas y procedimientos internos documentados?', tooltip: 'Las políticas escritas garantizan consistencia.', weight: 1.1 },
            { id: 'ge_03', text: '¿Se realizan reuniones de seguimiento periódicas para revisar el desempeño?', tooltip: 'Deben existir comités estructurados.', weight: 1.0 },
            { id: 'ge_04', text: '¿Existe un proceso formal para la gestión de riesgos?', tooltip: 'La gestión de riesgos debe ser proactiva.', weight: 1.2 },
            { id: 'ge_05', text: '¿Hay mecanismos de control interno y auditoría?', tooltip: 'Se deben realizar auditorías periódicas.', weight: 1.0 }
        ]
    },
    {
        id: 'procesos_operaciones',
        name: 'Procesos y Operaciones',
        icon: '⚙️',
        weight: 0.10,
        description: 'Mide la eficiencia y estandarización de los flujos de trabajo clave.',
        questions: [
            { id: 'po_01', text: '¿Los procesos clave del negocio están documentados y estandarizados?', tooltip: 'Procesos mapeados permiten operación consistente.', weight: 1.2 },
            { id: 'po_02', text: '¿Se utilizan herramientas tecnológicas para automatizar tareas repetitivas?', tooltip: 'La automatización libera tiempo del personal.', weight: 1.1 },
            { id: 'po_03', text: '¿Se miden y monitorean regularmente los indicadores de rendimiento de los procesos?', tooltip: 'Lo que no se mide no se puede mejorar.', weight: 1.1 },
            { id: 'po_04', text: '¿Existe una cultura de mejora continua?', tooltip: 'Los equipos deben buscar formas de optimizar.', weight: 1.0 },
            { id: 'po_05', text: '¿Los diferentes sistemas están integrados?', tooltip: 'Los sistemas deben "hablar" entre sí.', weight: 1.2 }
        ]
    },
    {
        id: 'talento_cultura',
        name: 'Gestión de Talento',
        icon: '👥',
        weight: 0.10,
        description: 'Evalúa si la cultura fomenta la colaboración y el desarrollo continuo.',
        questions: [
            { id: 'tc_01', text: '¿La empresa tiene un proceso estructurado para atraer y retener talento?', tooltip: 'Incluye planes de carrera y beneficios.', weight: 1.1 },
            { id: 'tc_02', text: '¿Se invierte en programas de capacitación y desarrollo?', tooltip: 'El desarrollo de competencias es clave.', weight: 1.2 },
            { id: 'tc_03', text: '¿La cultura organizacional promueve la colaboración?', tooltip: 'Una cultura saludable fomenta el trabajo en equipo.', weight: 1.0 },
            { id: 'tc_04', text: '¿Se realizan evaluaciones de desempeño periódicas?', tooltip: 'Las evaluaciones deben alinearse con objetivos.', weight: 1.0 },
            { id: 'tc_05', text: '¿El liderazgo inspira y modela los valores deseados?', tooltip: 'Los líderes son el motor de la cultura.', weight: 1.3 }
        ]
    },
    {
        id: 'innovacion_agilidad',
        name: 'Innovación y Agilidad',
        icon: '💡',
        weight: 0.10,
        description: 'Analiza la capacidad de adaptarse rápidamente a los cambios del mercado.',
        questions: [
            { id: 'ia_01', text: '¿La empresa dedica tiempo y recursos para explorar nuevas ideas?', tooltip: 'La innovación requiere inversión intencional.', weight: 1.2 },
            { id: 'ia_02', text: '¿Se fomenta la experimentación y se aceptan los fracasos?', tooltip: 'Una cultura que castiga el error inhibe innovación.', weight: 1.1 },
            { id: 'ia_03', text: '¿La empresa es capaz de tomar decisiones y ajustar su rumbo rápidamente?', tooltip: 'La agilidad evita burocracia excesiva.', weight: 1.1 },
            { id: 'ia_04', text: '¿Se monitorean activamente las tecnologías emergentes?', tooltip: 'Tener un "radar" tecnológico es vital.', weight: 1.0 },
            { id: 'ia_05', text: '¿Se colabora con clientes o proveedores para co-crear?', tooltip: 'Las alianzas aceleran la innovación.', weight: 1.0 }
        ]
    },
    {
        id: 'estrategia_tecnologica',
        name: 'Estrategia Tecnológica',
        icon: '💻',
        weight: 0.10,
        description: 'Evalúa si la tecnología está alineada con los objetivos y es escalable.',
        questions: [
            { id: 'et_01', text: '¿La infraestructura tecnológica actual soporta las necesidades del negocio?', tooltip: 'La tecnología debe ser un habilitador.', weight: 1.1 },
            { id: 'et_02', text: '¿Existe un roadmap tecnológico que guíe las inversiones?', tooltip: 'Las decisiones tecnológicas no deben ser improvisadas.', weight: 1.2 },
            { id: 'et_03', text: '¿La arquitectura tecnológica es escalable?', tooltip: 'Los sistemas deben poder crecer.', weight: 1.1 },
            { id: 'et_04', text: '¿Se cuenta con políticas robustas de ciberseguridad?', tooltip: 'Incluye antivirus, firewalls y capacitación.', weight: 1.3 },
            { id: 'et_05', text: '¿Se evalúa el ROI de las iniciativas tecnológicas?', tooltip: 'La tecnología es una inversión medible.', weight: 1.0 }
        ]
    },
    {
        id: 'inteligencia_negocio',
        name: 'Inteligencia de Negocio',
        icon: '📊',
        weight: 0.10,
        description: 'Examina cómo la empresa utiliza datos para tomar decisiones.',
        questions: [
            { id: 'in_01', text: '¿La empresa recopila sistemáticamente datos de operaciones y clientes?', tooltip: 'Procesos definidos para capturar datos.', weight: 1.1 },
            { id: 'in_02', text: '¿Los datos se almacenan de forma centralizada y organizada?', tooltip: 'Una "única fuente de verdad" es crucial.', weight: 1.2 },
            { id: 'in_03', text: '¿Se utilizan herramientas de visualización de datos?', tooltip: 'Dashboards muestran rendimiento en tiempo real.', weight: 1.1 },
            { id: 'in_04', text: '¿Las decisiones se respaldan con análisis de datos?', tooltip: 'Cultura de decisiones basadas en evidencia.', weight: 1.3 },
            { id: 'in_05', text: '¿El personal tiene habilidades básicas para interpretar datos?', tooltip: 'Alfabetización de datos es esencial.', weight: 1.0 }
        ]
    },
    {
        id: 'experiencia_cliente',
        name: 'Experiencia del Cliente',
        icon: '🧡',
        weight: 0.10,
        description: 'Mide la satisfacción del cliente y analiza los puntos de contacto.',
        questions: [
            { id: 'cx_01', text: '¿Se mide de forma sistemática la satisfacción del cliente?', tooltip: 'Método constante para escuchar al cliente.', weight: 1.2 },
            { id: 'cx_02', text: '¿Se han mapeado los "viajes del cliente"?', tooltip: 'Identificar momentos de fricción.', weight: 1.1 },
            { id: 'cx_03', text: '¿Se utiliza la retroalimentación para implementar mejoras?', tooltip: 'Actuar sobre el feedback del cliente.', weight: 1.3 },
            { id: 'cx_04', text: '¿La experiencia es consistente a través de todos los canales?', tooltip: 'Mismo nivel de servicio en todos los puntos.', weight: 1.0 },
            { id: 'cx_05', text: '¿Se personaliza la comunicación para diferentes segmentos?', tooltip: 'Experiencia relevante aumenta lealtad.', weight: 1.0 }
        ]
    },
    {
        id: 'sostenibilidad_responsabilidad',
        name: 'Sostenibilidad',
        icon: '🌍',
        weight: 0.10,
        description: 'Evalúa el compromiso con prácticas de impacto positivo.',
        questions: [
            { id: 'sr_01', text: '¿La empresa tiene una política de sostenibilidad definida?', tooltip: 'Compromiso formal en materia social y ambiental.', weight: 1.1 },
            { id: 'sr_02', text: '¿Se han implementado prácticas para reducir el impacto ambiental?', tooltip: 'Acciones concretas de sostenibilidad.', weight: 1.0 },
            { id: 'sr_03', text: '¿La empresa participa en iniciativas sociales?', tooltip: 'Apoyo a la comunidad local.', weight: 1.0 },
            { id: 'sr_04', text: '¿Se consideran criterios éticos al seleccionar proveedores?', tooltip: 'Responsabilidad en la cadena de suministro.', weight: 1.2 },
            { id: 'sr_05', text: '¿Se comunican de forma transparente las acciones de sostenibilidad?', tooltip: 'Transparencia genera confianza.', weight: 1.1 }
        ]
    },
    {
        id: 'finanzas_rentabilidad',
        name: 'Finanzas',
        icon: '💰',
        weight: 0.10,
        description: 'Analiza la gestión financiera y capacidad de generar rentabilidad.',
        questions: [
            { id: 'fr_01', text: '¿Se elabora un presupuesto anual detallado?', tooltip: 'Presupuesto es herramienta de control fundamental.', weight: 1.2 },
            { id: 'fr_02', text: '¿Se monitorea de cerca el flujo de caja?', tooltip: 'Gestión proactiva del cash flow.', weight: 1.3 },
            { id: 'fr_03', text: '¿Se analizan regularmente los estados financieros?', tooltip: 'Entender rentabilidad para decisiones.', weight: 1.1 },
            { id: 'fr_04', text: '¿Existen políticas claras para la gestión de costos?', tooltip: 'Control de costos constante.', weight: 1.0 },
            { id: 'fr_05', text: '¿La empresa tiene un plan financiero a largo plazo?', tooltip: 'Proyectar necesidades de capital.', weight: 1.1 }
        ]
    }
];

const scaleLabels = [
    'Muy Bajo / No aplica',
    'Bajo / Iniciando',
    'Medio / En desarrollo',
    'Alto / Bien implementado',
    'Muy Alto / Excelente'
];

const scaleColors = ['#AA2F0C', '#EC8E48', '#EE8028', '#4CCED5', '#10b981'];

// ===== PERSONALIZACIÓN POR SECTOR =====
const sectorAdaptations = {
    'Tecnología': {
        examples: 'como Slack, Zoom, GitHub o Jira',
        focus: 'innovación, escalabilidad y agilidad',
        pain_points: 'velocidad de desarrollo, retención de talento tech y competencia',
        tools: 'herramientas de desarrollo, metodologías ágiles',
        metrics: 'KPIs de desarrollo, time-to-market, uptime'
    },
    'Retail/Comercio': {
        examples: 'como sistemas POS, e-commerce, CRM de ventas',
        focus: 'experiencia del cliente, omnicanalidad y gestión de inventario',
        pain_points: 'competencia online, gestión de stock y experiencia del cliente',
        tools: 'sistemas de inventario, plataformas de e-commerce',
        metrics: 'conversión, ticket promedio, rotación de inventario'
    },
    'Manufactura': {
        examples: 'como ERP, sistemas de calidad, automatización',
        focus: 'eficiencia operacional, calidad y optimización de procesos',
        pain_points: 'costos de producción, calidad y tiempos de entrega',
        tools: 'sistemas MES, control de calidad, automatización',
        metrics: 'OEE, defectos por millón, tiempo de ciclo'
    },
    'Servicios': {
        examples: 'como CRM, sistemas de facturación, gestión de proyectos',
        focus: 'satisfacción del cliente, eficiencia y escalabilidad',
        pain_points: 'gestión de clientes, escalabilidad y diferenciación',
        tools: 'CRM, herramientas de gestión de proyectos',
        metrics: 'NPS, utilización de recursos, margen por proyecto'
    },
    'Salud': {
        examples: 'como historias clínicas digitales, telemedicina',
        focus: 'calidad de atención, eficiencia y cumplimiento normativo',
        pain_points: 'regulaciones, eficiencia operativa y experiencia del paciente',
        tools: 'sistemas de gestión hospitalaria, telemedicina',
        metrics: 'tiempo de atención, satisfacción del paciente, cumplimiento'
    }
};

// ===== FUNCIONES DE UI =====
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    const currentSection = document.getElementById(sectionId);
    if (currentSection) currentSection.classList.remove('hidden');
    
    appState.currentSection = sectionId;
    window.scrollTo(0, 0);

    if (sectionId !== 'landing') {
        document.body.style.background = 'var(--primary-50)';
        document.body.classList.add('section-view');
    } else {
        document.body.style.background = 'var(--azul-marino)';
        document.body.classList.remove('section-view');
    }
}

function resetApp() {
    localStorage.removeItem('pymeEvaluationState');
    location.reload();
}

function showConsentModal() {
    document.getElementById('consentModal').classList.remove('hidden');
}

function hideConsentModal() {
    document.getElementById('consentModal').classList.add('hidden');
}

function showPrivacyPolicy() {
    document.getElementById('privacyPolicyModal').classList.remove('hidden');
}

function hidePrivacyPolicy() {
    document.getElementById('privacyPolicyModal').classList.add('hidden');
}

function acceptConsent() {
    appState.consent.communications = document.getElementById('consentCommunications').checked;
    appState.consent.benchmarking = document.getElementById('consentBenchmarking').checked;
    hideConsentModal();
    showSection('registration');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function showLoading(message = 'Procesando...') {
    const loader = document.getElementById('loadingOverlay');
    const loaderText = document.getElementById('loadingText');
    if (loader && loaderText) {
        loaderText.textContent = message;
        loader.classList.remove('hidden');
    }
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.classList.add('hidden');
    }
}

// ===== FUNCIONES DE REGISTRO =====
function handleQuickStart(e) {
    e.preventDefault();
    
    // Obtener datos básicos
    const companyName = document.getElementById('quickCompanyName').value;
    const email = document.getElementById('quickEmail').value;
    
    // Validar campos básicos
    if (!companyName || !email) {
        showToast('Por favor completa ambos campos', 'error');
        return;
    }
    
    // Guardar datos básicos
    appState.companyData = {
        name: companyName,
        email: email,
        // Valores por defecto que se completarán después
        sector: 'Servicios',
        size: 'Pequeña (11-50)',
        years: '1-3 años',
        location: 'Colombia',
        city: 'Colombia'
    };
    
    // Inicializar tiempo de inicio
    appState.evaluationData.startTime = Date.now();
    
    // Mostrar mensaje motivacional y comenzar
    showMotivationalToast('🚀', '¡Perfecto! Comencemos tu evaluación de madurez empresarial');
    
    setTimeout(() => {
        autoSave();
        showSection('evaluation');
        initEvaluation();
    }, 1000);
}

function handleRegistration(e) {
    e.preventDefault();
    
    showLoading('Guardando información...');
    
    // Obtener datos del formulario
    const formData = new FormData(e.target);
    
    appState.companyData = {
        name: document.getElementById('companyName')?.value || formData.get('companyName'),
        sector: document.getElementById('companySector')?.value || formData.get('sector'),
        size: document.getElementById('companySize')?.value || formData.get('size'),
        years: document.getElementById('companyYears')?.value || formData.get('years'),
        location: document.getElementById('companyLocation')?.value || formData.get('location'),
        city: document.getElementById('companyLocation')?.value?.split(',')[0] || 'N/A',
        website: document.getElementById('companyWebsite')?.value || formData.get('website'),
        contactName: document.getElementById('contactName')?.value || formData.get('contactName'),
        email: document.getElementById('contactEmail')?.value || formData.get('email'),
        phone: document.getElementById('contactPhone')?.value || formData.get('phone'),
        role: document.getElementById('contactRole')?.value || formData.get('role')
    };
    
    // Validar que al menos los campos críticos estén llenos
    if (!appState.companyData.name || !appState.companyData.email) {
        showToast('Por favor completa los campos obligatorios', 'error');
        hideLoading();
        return;
    }
    
    setTimeout(() => {
        autoSave();
        hideLoading();
        showToast('✅ Información guardada correctamente', 'success');
        showSection('evaluation');
        initEvaluation();
    }, 1000);
}

// ===== FUNCIONES AUXILIARES =====
function getCurrentQuestion() {
    const category = categories[appState.evaluationData.currentCategory];
    if (!category) return null;
    
    const question = category.questions[appState.evaluationData.currentQuestion];
    if (!question) return null;
    
    // Agregar la respuesta actual si existe
    question.answer = appState.evaluationData.answers[question.id];
    
    return question;
}

// ===== FUNCIONES DE EVALUACIÓN =====
function initEvaluation() {
    appState.evaluationData.currentCategory = 0;
    appState.evaluationData.currentQuestion = 0;
    renderCategoryProgress();
    renderCurrentQuestion();
    updateGlobalProgress();
    updateAchievementsCounter();
}

function renderCategoryProgress() {
    const container = document.getElementById('categoryProgress');
    if (!container) return;
    
    container.innerHTML = categories.map((cat, idx) => {
        const completedQuestions = cat.questions.filter(q => 
            appState.evaluationData.answers[q.id] !== undefined
        ).length;
        
        const isCompleted = completedQuestions === cat.questions.length;
        const isCurrent = idx === appState.evaluationData.currentCategory;
        
        return `
            <div class="category-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <div class="category-icon">${cat.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${cat.name}</div>
                    <div style="font-size: 0.875rem; opacity: 0.7;">
                        ${completedQuestions}/${cat.questions.length} preguntas
                    </div>
                </div>
                ${isCompleted ? '<span style="color: var(--success-500);">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    // Actualizar progreso general
    updateOverallProgress();
}

function updateOverallProgress() {
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = Object.keys(appState.evaluationData.answers).length;
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    const progressPercentage = document.getElementById('progressPercentage');
    const progressText = document.getElementById('progressText');
    const overallProgress = document.getElementById('overallProgress');
    
    if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
    }
    
    if (progressText) {
        const completedCategories = categories.filter(cat => 
            cat.questions.every(q => appState.evaluationData.answers[q.id] !== undefined)
        ).length;
        progressText.textContent = `${completedCategories} de ${categories.length} categorías`;
    }
    
    if (overallProgress) {
        overallProgress.style.setProperty('--score', percentage);
    }
    
    // Nuevas funciones de gamificación
    checkMotivationalMessage(percentage);
    updateEmotionalProgress(percentage);
    checkAchievements(percentage, answeredQuestions);
}

function updateGlobalProgress() {
    // Calcular total de preguntas respondidas
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = Object.keys(appState.evaluationData.answers).length;
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    // Actualizar elementos del DOM
    const currentEl = document.getElementById('globalProgressCurrent');
    const totalEl = document.getElementById('globalProgressTotal');
    const percentageEl = document.getElementById('globalProgressPercentage');
    const fillEl = document.getElementById('globalProgressFill');
    
    if (currentEl) currentEl.textContent = answeredQuestions;
    if (totalEl) totalEl.textContent = totalQuestions;
    if (percentageEl) percentageEl.textContent = percentage;
    
    if (fillEl) {
        // Agregar clase para animación de "bump"
        fillEl.classList.add('progress-bump');
        setTimeout(() => fillEl.classList.remove('progress-bump'), 600);
        
        // Actualizar ancho con animación
        fillEl.style.width = `${percentage}%`;
        
        // Celebración al llegar al 100%
        if (percentage === 100) {
            celebrateCompletion();
        }
    }
    
    // Actualizar estado emocional
    updateEmotionalProgress(percentage);
    
    // Verificar mensajes motivacionales
    checkMotivationalMessage(percentage);
    
    // Verificar logros
    checkAchievements(percentage, answeredQuestions);
}

function renderCurrentQuestion() {
    const category = categories[appState.evaluationData.currentCategory];
    const question = category.questions[appState.evaluationData.currentQuestion];
    
    // Personalizar pregunta según sector
    const personalizedQuestion = personalizeQuestionBySector(question);
    
    // Actualizar información de categoría
    const categoryBadge = document.getElementById('categoryBadge');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDescription = document.getElementById('categoryDescription');
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const tooltipText = document.getElementById('tooltipText');
    
    if (categoryBadge) {
        categoryBadge.textContent = `${category.icon} ${category.name}`;
    }
    
    if (categoryTitle) {
        categoryTitle.textContent = category.name;
    }
    
    if (categoryDescription) {
        categoryDescription.textContent = category.description;
    }
    
    if (questionNumber) {
        questionNumber.textContent = `Pregunta ${appState.evaluationData.currentQuestion + 1} de ${category.questions.length}`;
    }
    
    if (questionText) {
        questionText.innerHTML = personalizedQuestion.text;
    }
    
    if (tooltipText) {
        tooltipText.innerHTML = personalizedQuestion.tooltip;
    }
    
    // Actualizar barra de progreso de la categoría
    updateCategoryProgressBar();
    
    // Renderizar opciones de escala
    renderScaleOptions();
    
    // Actualizar botones de navegación
    updateNavigationButtons();
}

function updateCategoryProgressBar() {
    const category = categories[appState.evaluationData.currentCategory];
    const progress = ((appState.evaluationData.currentQuestion + 1) / category.questions.length) * 100;
    const progressBar = document.getElementById('categoryProgressBar');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

function renderScaleOptions() {
    const scaleOptionsContainer = document.getElementById('scaleOptions');
    if (!scaleOptionsContainer) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Definir emojis y descripciones para cada nivel
    const optionData = [
        {
            value: 0,
            emoji: '😟',
            label: 'Muy Bajo / No aplica',
            description: 'No existe o no se implementa',
            color: '#ef4444'
        },
        {
            value: 1,
            emoji: '😐',
            label: 'Bajo / Iniciando',
            description: 'En etapa muy temprana o informal',
            color: '#f97316'
        },
        {
            value: 2,
            emoji: '🙂',
            label: 'Medio / En desarrollo',
            description: 'Parcialmente implementado',
            color: '#eab308'
        },
        {
            value: 3,
            emoji: '😊',
            label: 'Alto / Bien implementado',
            description: 'Bien establecido y funcional',
            color: '#3b82f6'
        },
        {
            value: 4,
            emoji: '🌟',
            label: 'Muy Alto / Excelente',
            description: 'Optimizado y en mejora continua',
            color: '#10b981'
        }
    ];
    
    // Limpiar contenedor
    scaleOptionsContainer.innerHTML = '';
    
    // Crear opciones mejoradas con animación escalonada
    optionData.forEach((option, index) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'scale-option';
        optionCard.setAttribute('data-value', option.value);
        optionCard.style.animationDelay = `${index * 0.1}s`;
        
        // Marcar como seleccionada si corresponde
        if (currentQuestion.answer === option.value) {
            optionCard.classList.add('selected');
        }
        
        optionCard.innerHTML = `
            <div class="option-icon">${option.emoji}</div>
            <div class="option-number" style="background-color: ${option.color}">${option.value}</div>
            <div class="option-label">${option.label}</div>
            <div class="option-description">${option.description}</div>
        `;
        
        // Event listener con animación mejorada
        optionCard.addEventListener('click', function() {
            selectOption(option.value, this, option.color);
        });
        
        // Hover effect mejorado
        optionCard.addEventListener('mouseenter', function() {
            this.style.setProperty('--hover-color', option.color);
        });
        
        scaleOptionsContainer.appendChild(optionCard);
    });
}

function selectOption(value, element, color) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Guardar respuesta
    appState.evaluationData.answers[currentQuestion.id] = value;
    
    // Remover selección anterior
    document.querySelectorAll('.scale-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Agregar selección a la nueva opción con efecto especial
    element.classList.add('selected');
    element.style.setProperty('--selected-color', color);
    
    // Crear efecto de ondas
    createRippleEffect(element, color);
    
    // Mostrar feedback visual mejorado
    showEnhancedFeedback(value, color);
    
    // Habilitar botón siguiente
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.add('btn-ready');
    }
    
    // Actualizar progreso global
    updateGlobalProgress();
    
    // Guardar en localStorage
    autoSave();
    
    // Vibración sutil en móviles (si está disponible)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function createRippleEffect(element, color) {
    const ripple = document.createElement('div');
    ripple.className = 'selection-ripple';
    ripple.style.backgroundColor = color;
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    
    element.appendChild(ripple);
    
    // Animar el ripple
    setTimeout(() => {
        ripple.style.transform = 'translate(-50%, -50%) scale(2)';
        ripple.style.opacity = '0';
    }, 10);
    
    // Remover después de la animación
    setTimeout(() => {
        if (element.contains(ripple)) {
            element.removeChild(ripple);
        }
    }, 600);
}

function showEnhancedFeedback(value, color) {
    const feedbackContainer = document.getElementById('selectedFeedback');
    const feedbackMessage = document.getElementById('feedbackMessage');
    
    if (!feedbackContainer || !feedbackMessage) return;
    
    const messages = {
        0: { text: '😟 Has seleccionado: Muy Bajo / No aplica', encouragement: 'Identificar áreas de mejora es el primer paso hacia el crecimiento' },
        1: { text: '😐 Has seleccionado: Bajo / Iniciando', encouragement: 'Reconocer el punto de partida es clave para el progreso' },
        2: { text: '🙂 Has seleccionado: Medio / En desarrollo', encouragement: 'Vas por buen camino, hay potencial de optimización' },
        3: { text: '😊 Has seleccionado: Alto / Bien implementado', encouragement: '¡Excelente! Esta es una fortaleza de tu empresa' },
        4: { text: '🌟 Has seleccionado: Muy Alto / Excelente', encouragement: '¡Impresionante! Eres un referente en esta área' }
    };
    
    const message = messages[value];
    
    feedbackMessage.innerHTML = `
        <div class="feedback-main" style="color: ${color}; font-weight: 600;">
            ${message.text}
        </div>
        <div class="feedback-encouragement" style="color: var(--primary-700); font-size: 0.9rem; margin-top: 0.5rem;">
            💡 ${message.encouragement}
        </div>
    `;
    
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.style.background = `linear-gradient(135deg, ${color}15, ${color}05)`;
    feedbackContainer.style.border = `2px solid ${color}30`;
    
    // Animación de entrada mejorada
    feedbackContainer.style.animation = 'none';
    setTimeout(() => {
        feedbackContainer.style.animation = 'feedbackSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
}

function updateNavigationButtons() {
    const btnPrev = document.getElementById('prevBtn');
    const btnNext = document.getElementById('nextBtn');
    
    if (btnPrev) {
        const isFirstQuestion = appState.evaluationData.currentCategory === 0 && 
                               appState.evaluationData.currentQuestion === 0;
        btnPrev.disabled = isFirstQuestion;
        btnPrev.style.opacity = isFirstQuestion ? '0.5' : '1';
        btnPrev.style.cursor = isFirstQuestion ? 'not-allowed' : 'pointer';
    }
    
    if (btnNext) {
        const category = categories[appState.evaluationData.currentCategory];
        const question = category.questions[appState.evaluationData.currentQuestion];
        const isAnswered = appState.evaluationData.answers[question.id] !== undefined;
        
        btnNext.disabled = !isAnswered;
        btnNext.style.opacity = isAnswered ? '1' : '0.5';
        btnNext.style.cursor = isAnswered ? 'pointer' : 'not-allowed';
        
        // Cambiar texto del botón en la última pregunta
        const isLastQuestion = appState.evaluationData.currentCategory === categories.length - 1 &&
                              appState.evaluationData.currentQuestion === category.questions.length - 1;
        
        if (isLastQuestion) {
            btnNext.innerHTML = '✅ Finalizar Evaluación';
        } else {
            btnNext.innerHTML = 'Siguiente →';
        }
    }
}

function previousQuestion() {
    if (appState.evaluationData.currentQuestion > 0) {
        appState.evaluationData.currentQuestion--;
    } else if (appState.evaluationData.currentCategory > 0) {
        appState.evaluationData.currentCategory--;
        appState.evaluationData.currentQuestion = 
            categories[appState.evaluationData.currentCategory].questions.length - 1;
    }
    
    renderCategoryProgress();
    renderCurrentQuestion();
    autoSave();
    updateGlobalProgress();
}

function nextQuestion() {
    const category = categories[appState.evaluationData.currentCategory];
    
    if (appState.evaluationData.currentQuestion < category.questions.length - 1) {
        appState.evaluationData.currentQuestion++;
    } else if (appState.evaluationData.currentCategory < categories.length - 1) {
        // Categoría completada - mostrar insight
        showCategoryCompletionInsight(category);
        
        appState.evaluationData.currentCategory++;
        appState.evaluationData.currentQuestion = 0;
        
        // Marcar categoría como completada
        if (!appState.evaluationData.completedCategories.includes(category.id)) {
            appState.evaluationData.completedCategories.push(category.id);
        }
    } else {
        finishEvaluation();
        return;
    }
    
    renderCategoryProgress();
    renderCurrentQuestion();
    autoSave();
    updateGlobalProgress();
}

// ===== SISTEMA DE GAMIFICACIÓN =====
function checkMotivationalMessage(percentage) {
    const message = motivationalMessages[percentage];
    if (message && !appState.evaluationData.shownMessages?.includes(percentage)) {
        showMotivationalToast(message.emoji, message.message);
        
        // Guardar que ya se mostró este mensaje
        if (!appState.evaluationData.shownMessages) {
            appState.evaluationData.shownMessages = [];
        }
        appState.evaluationData.shownMessages.push(percentage);
        autoSave();
    }
}

function showMotivationalToast(emoji, message) {
    const toast = document.createElement('div');
    toast.className = 'motivational-toast';
    toast.innerHTML = `
        <div class="toast-emoji">${emoji}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Animación de entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
}

function updateEmotionalProgress(percentage) {
    // Encontrar el estado emocional actual
    let currentState = progressStates[0];
    for (let threshold of Object.keys(progressStates).sort((a, b) => b - a)) {
        if (percentage >= parseInt(threshold)) {
            currentState = progressStates[threshold];
            break;
        }
    }
    
    // Actualizar la UI con el estado emocional
    const emotionalIndicator = document.getElementById('emotionalIndicator');
    if (emotionalIndicator) {
        emotionalIndicator.innerHTML = `${currentState.emoji} ${currentState.state}`;
        emotionalIndicator.style.color = currentState.color;
    }
}

function checkAchievements(percentage, answeredQuestions) {
    const completedCategories = categories.filter(cat => 
        cat.questions.every(q => appState.evaluationData.answers[q.id] !== undefined)
    ).length;
    
    // Verificar diferentes tipos de logros
    if (completedCategories === 1 && !hasAchievement('first_steps')) {
        unlockAchievement('first_steps');
    }
    
    if (completedCategories === 3 && !hasAchievement('momentum')) {
        unlockAchievement('momentum');
    }
    
    if (percentage >= 50 && !hasAchievement('halfway_hero')) {
        unlockAchievement('halfway_hero');
    }
    
    if (percentage === 100 && !hasAchievement('completion_champion')) {
        unlockAchievement('completion_champion');
        celebrateCompletion();
    }
    
    // Verificar perfeccionista (todas respuestas 4 o 5)
    const highAnswers = Object.values(appState.evaluationData.answers).filter(answer => answer >= 3);
    if (highAnswers.length >= 10 && highAnswers.length === answeredQuestions && !hasAchievement('perfectionist')) {
        unlockAchievement('perfectionist');
    }
}

function hasAchievement(achievementId) {
    return appState.evaluationData.achievements.includes(achievementId);
}

function unlockAchievement(achievementId) {
    const achievement = achievements[achievementId];
    if (!achievement || hasAchievement(achievementId)) return;
    
    appState.evaluationData.achievements.push(achievementId);
    showAchievementModal(achievement);
    updateAchievementsCounter();
    autoSave();
}

function updateAchievementsCounter() {
    const achievementsCount = document.getElementById('achievementsCount');
    if (achievementsCount) {
        const totalAchievements = Object.keys(achievements).length;
        const unlockedAchievements = appState.evaluationData.achievements.length;
        achievementsCount.textContent = `${unlockedAchievements}/${totalAchievements}`;
        
        // Animación cuando se desbloquea un logro
        if (unlockedAchievements > 0) {
            achievementsCount.style.animation = 'achievementPulse 0.6s ease';
            setTimeout(() => {
                achievementsCount.style.animation = '';
            }, 600);
        }
    }
}

function showAchievementModal(achievement) {
    const modal = document.createElement('div');
    modal.className = 'achievement-modal-overlay';
    modal.innerHTML = `
        <div class="achievement-modal">
            <div class="confetti-container"></div>
            <div class="achievement-icon">${achievement.icon}</div>
            <h2>🎉 ¡Logro Desbloqueado!</h2>
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            <button class="btn btn-primary" onclick="closeAchievementModal()">¡Continuar!</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Crear efecto confetti
    createConfetti();
    
    // Auto-cerrar después de 5 segundos si no se hace clic
    setTimeout(() => {
        if (document.body.contains(modal)) {
            closeAchievementModal();
        }
    }, 5000);
    
    window.currentAchievementModal = modal;
}

function closeAchievementModal() {
    const modal = window.currentAchievementModal;
    if (modal && document.body.contains(modal)) {
        modal.classList.add('closing');
        setTimeout(() => document.body.removeChild(modal), 300);
    }
}

function createConfetti() {
    const colors = ['#8560C0', '#4CCED5', '#EE8028', '#10b981', '#f59e0b'];
    const confettiContainer = document.querySelector('.confetti-container');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
        confettiContainer.appendChild(confetti);
    }
}

// Función de celebración al completar 100%
function celebrateCompletion() {
    showToast('🎉 ¡Felicitaciones! Has completado todas las preguntas', 'success');
}

// ===== INSIGHTS PARCIALES POR CATEGORÍA =====
function showCategoryCompletionInsight(category) {
    // Calcular puntuación de la categoría
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    category.questions.forEach(question => {
        const answer = appState.evaluationData.answers[question.id] || 0;
        const normalizedScore = (answer / 4) * 100;
        totalWeightedScore += normalizedScore * question.weight;
        totalWeight += question.weight;
    });
    
    const categoryScore = Math.round(totalWeightedScore / totalWeight);
    
    // Obtener insight específico
    const insight = getCategoryInsight(category.id, categoryScore);
    
    // Mostrar modal de insight
    showInsightModal(category, categoryScore, insight);
}

function getCategoryInsight(categoryId, score) {
    const insights = {
        'vision_estrategia': {
            high: {
                title: "🎯 ¡Visión Estratégica Sólida!",
                message: "Tu empresa tiene una dirección clara y bien definida. Esto es fundamental para el crecimiento sostenible.",
                tip: "Mantén esta fortaleza y asegúrate de comunicar regularmente la visión a todo el equipo."
            },
            medium: {
                title: "📈 Fundamento Estratégico en Desarrollo",
                message: "Tienes una base estratégica decente con oportunidades claras de mejora.",
                tip: "Considera documentar formalmente tu visión y crear un plan estratégico detallado."
            },
            low: {
                title: "💡 Gran Oportunidad Estratégica",
                message: "Aquí tienes el mayor potencial de crecimiento. Una estrategia clara puede transformar tu empresa.",
                tip: "Prioriza definir tu visión, misión y objetivos estratégicos a 3-5 años."
            }
        },
        'gobierno_empresarial': {
            high: {
                title: "🏛️ ¡Gobierno Corporativo Excelente!",
                message: "Tu estructura organizacional y procesos de control están muy bien establecidos.",
                tip: "Mantén estas buenas prácticas y considera certificaciones de gobierno corporativo."
            },
            medium: {
                title: "⚖️ Estructura en Evolución",
                message: "Tienes una base sólida de gobierno con espacio para optimización.",
                tip: "Enfócate en documentar políticas clave y establecer comités de seguimiento."
            },
            low: {
                title: "🔧 Oportunidad de Estructuración",
                message: "Fortalecer tu gobierno corporativo puede mejorar significativamente la eficiencia.",
                tip: "Comienza definiendo roles claros y estableciendo políticas básicas de operación."
            }
        },
        'procesos_operaciones': {
            high: {
                title: "⚙️ ¡Operaciones Optimizadas!",
                message: "Tus procesos están bien documentados y funcionan eficientemente.",
                tip: "Continúa con la mejora continua e incorpora más automatización donde sea posible."
            },
            medium: {
                title: "🔄 Procesos en Mejora",
                message: "Tienes una base operacional decente con oportunidades de optimización.",
                tip: "Mapea tus 5 procesos más críticos y busca eliminar cuellos de botella."
            },
            low: {
                title: "🚀 Potencial de Eficiencia",
                message: "Optimizar tus procesos puede generar ahorros significativos de tiempo y costos.",
                tip: "Comienza documentando y estandarizando tus procesos más importantes."
            }
        }
    };
    
    const categoryInsights = insights[categoryId] || insights['vision_estrategia'];
    
    if (score >= 75) return categoryInsights.high;
    if (score >= 40) return categoryInsights.medium;
    return categoryInsights.low;
}

function showInsightModal(category, score, insight) {
    const modal = document.createElement('div');
    modal.className = 'insight-modal-overlay';
    modal.innerHTML = `
        <div class="insight-modal">
            <div class="insight-header">
                <div class="category-icon-large">${category.icon}</div>
                <div class="insight-score">
                    <div class="score-circle-small" style="--score: ${score}">
                        <span class="score-number">${score}</span>
                    </div>
                </div>
            </div>
            <div class="insight-content">
                <h2>${insight.title}</h2>
                <p class="insight-message">${insight.message}</p>
                <div class="insight-tip">
                    <strong>💡 Tip Personalizado:</strong>
                    <p>${insight.tip}</p>
                </div>
            </div>
            <div class="insight-footer">
                <button class="btn btn-primary" onclick="closeInsightModal()">
                    ✨ ¡Continuar Evaluación!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animación de entrada
    setTimeout(() => modal.classList.add('show'), 100);
    
    window.currentInsightModal = modal;
}

function closeInsightModal() {
    const modal = window.currentInsightModal;
    if (modal && document.body.contains(modal)) {
        modal.classList.add('closing');
        setTimeout(() => document.body.removeChild(modal), 300);
    }
}

// ===== PERSONALIZACIÓN POR SECTOR =====
function personalizeQuestionBySector(question) {
    const sector = appState.companyData.sector || 'Servicios';
    const adaptation = sectorAdaptations[sector] || sectorAdaptations['Servicios'];
    
    let personalizedText = question.text;
    let personalizedTooltip = question.tooltip;
    
    // Personalización específica por pregunta
    if (question.id === 'et_01') {
        personalizedText = `¿La infraestructura tecnológica actual (${adaptation.examples}) soporta las necesidades del negocio?`;
        personalizedTooltip = `La tecnología debe ser un habilitador para ${adaptation.focus}. En ${sector}, esto incluye ${adaptation.examples}.`;
    }
    
    if (question.id === 'po_02') {
        personalizedText = `¿Se utilizan herramientas tecnológicas (${adaptation.tools}) para automatizar tareas repetitivas?`;
        personalizedTooltip = `La automatización libera tiempo del personal para enfocarse en ${adaptation.focus}.`;
    }
    
    if (question.id === 'in_03') {
        personalizedText = `¿Se utilizan herramientas de visualización para monitorear métricas clave (${adaptation.metrics})?`;
        personalizedTooltip = `Dashboards muestran ${adaptation.metrics} en tiempo real para optimizar ${adaptation.focus}.`;
    }
    
    if (question.id === 'cx_01') {
        personalizedTooltip = `En ${sector}, es crucial medir la satisfacción considerando ${adaptation.pain_points}.`;
    }
    
    if (question.id === 'ia_01') {
        personalizedTooltip = `Para ${sector}, la innovación debe enfocarse en ${adaptation.focus} y resolver ${adaptation.pain_points}.`;
    }
    
    return {
        text: personalizedText,
        tooltip: personalizedTooltip
    };
}

// Función getCurrentQuestion ya definida arriba

// ===== FINALIZACIÓN Y RESULTADOS =====
function finishEvaluation() {
    showLoading('Calculando resultados...');
    
    setTimeout(() => {
        calculateScores();
        sendDataToGoogleSheets();
        showSection('results');
        renderResults();
        hideLoading();
    }, 1500);
}

function calculateScores() {
    categories.forEach(category => {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        category.questions.forEach(question => {
            const answer = appState.evaluationData.answers[question.id] || 0;
            const normalizedScore = (answer / 4) * 100;
            totalWeightedScore += normalizedScore * question.weight;
            totalWeight += question.weight;
        });
        
        appState.evaluationData.categoryScores[category.id] = 
            Math.round(totalWeightedScore / totalWeight);
    });
    
    const totalScore = Object.values(appState.evaluationData.categoryScores)
        .reduce((sum, score) => sum + score, 0) / categories.length;
    
    appState.evaluationData.totalScore = Math.round(totalScore);
    appState.evaluationData.maturityLevel = getMaturityLevel(totalScore);
    
    autoSave();
}

function getMaturityLevel(score) {
    if (score < 20) return { level: 'Inicial', description: 'Requiere atención urgente' };
    if (score < 40) return { level: 'En Desarrollo', description: 'Grandes oportunidades de mejora' };
    if (score < 60) return { level: 'Intermedio', description: 'Progreso sólido, continuar fortaleciendo' };
    if (score < 80) return { level: 'Avanzado', description: 'Buen nivel, optimizar para excelencia' };
    return { level: 'Líder', description: 'Excelente desempeño' };
}

function renderResults() {
    const totalScore = appState.evaluationData.totalScore || 0;
    const maturityLevel = appState.evaluationData.maturityLevel || { level: 'N/A', description: 'Sin datos' };
    const categoryScores = appState.evaluationData.categoryScores || {};
    
    // Actualizar score principal
    const finalScoreNumber = document.getElementById('finalScoreNumber');
    const finalScoreCircle = document.getElementById('finalScore');
    const maturityBadge = document.getElementById('maturityBadge');
    const maturityDescription = document.getElementById('maturityDescription');
    
    if (finalScoreNumber) {
        finalScoreNumber.textContent = totalScore;
    }
    
    if (finalScoreCircle) {
        finalScoreCircle.style.setProperty('--score', totalScore);
    }
    
    if (maturityBadge) {
        maturityBadge.textContent = maturityLevel.level;
        maturityBadge.className = 'maturity-badge';
    }
    
    if (maturityDescription) {
        maturityDescription.textContent = maturityLevel.description;
    }
    
    // Renderizar gráfico radar
    renderRadarChart();
    
    // Renderizar resultados detallados
    renderDetailedResults();
    
    // Renderizar recomendaciones
    renderRecommendations();
}

function renderRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const categoryScores = appState.evaluationData.categoryScores || {};
    
    // Destruir chart anterior si existe
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
    }
    
    const labels = categories.map(cat => cat.name);
    const data = categories.map(cat => categoryScores[cat.id] || 0);
    
    window.radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tu Puntuación',
                data: data,
                backgroundColor: 'rgba(133, 96, 192, 0.2)',
                borderColor: 'rgba(133, 96, 192, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(133, 96, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(133, 96, 192, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function renderDetailedResults() {
    const container = document.getElementById('detailedResults');
    if (!container) return;
    
    const categoryScores = appState.evaluationData.categoryScores || {};
    
    container.innerHTML = categories.map(cat => {
        const score = categoryScores[cat.id] || 0;
        const scoreColor = getScoreColor(score);
        const scoreDesc = getScoreDescription(score);
        
        return `
            <div class="category-result-card">
                <div class="category-result-header">
                    <span class="category-result-icon">${cat.icon}</span>
                    <h3 class="category-result-title">${cat.name}</h3>
                    <span class="category-result-score" style="color: ${scoreColor}">${score}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${score}%; background-color: ${scoreColor}"></div>
                </div>
                <p class="category-result-description">${scoreDesc}</p>
            </div>
        `;
    }).join('');
}

function renderRecommendations() {
    const recommendations = generateRecommendations();
    const container = document.getElementById('recommendations');
    
    container.innerHTML = recommendations.map((rec, idx) => `
        <div class="recommendation-card">
            <div class="recommendation-header">
                <span class="priority-badge">${rec.priority}</span>
                <span class="category-icon">${rec.categoryIcon}</span>
            </div>
            <h3>${rec.title}</h3>
            <p class="recommendation-description">${rec.description}</p>
            <div class="actions-list">
                <h4>Acciones recomendadas:</h4>
                <ul>
                    ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function generateRecommendations() {
    const categoryScores = appState.evaluationData.categoryScores || {};
    const sortedCategories = categories
        .map(cat => ({ ...cat, score: categoryScores[cat.id] || 0 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

    const recs = {
        'vision_estrategia': {
            title: 'Fortalecer Visión Estratégica',
            description: 'Definir y comunicar un norte claro.',
            priority: 'CRÍTICO',
            actions: ['Documentar visión y estrategia', 'Comunicar a todo el equipo', 'Definir KPIs estratégicos']
        },
        'gobierno_empresarial': {
            title: 'Estructurar Gobierno Corporativo',
            description: 'Establecer roles y controles claros.',
            priority: 'ALTO',
            actions: ['Definir organigrama y roles', 'Documentar políticas clave', 'Establecer comité de dirección']
        },
        'procesos_operaciones': {
            title: 'Optimizar Procesos',
            description: 'Mapear y automatizar flujos clave.',
            priority: 'ALTO',
            actions: ['Mapear 5 procesos principales', 'Identificar cuellos de botella', 'Implementar herramienta BPM']
        },
        'talento_cultura': {
            title: 'Impulsar Talento',
            description: 'Invertir en desarrollo del equipo.',
            priority: 'MEDIO',
            actions: ['Crear plan de capacitación', 'Implementar evaluación de desempeño', 'Fomentar colaboración']
        },
        'innovacion_agilidad': {
            title: 'Fomentar Innovación',
            description: 'Crear entorno de experimentación.',
            priority: 'MEDIO',
            actions: ['Asignar presupuesto para innovación', 'Crear programa de intraemprendimiento', 'Adoptar metodologías ágiles']
        },
        'estrategia_tecnologica': {
            title: 'Definir Estrategia Tecnológica',
            description: 'Alinear tecnología con objetivos.',
            priority: 'ALTO',
            actions: ['Realizar auditoría tecnológica', 'Crear roadmap a 3 años', 'Implementar ciberseguridad']
        },
        'inteligencia_negocio': {
            title: 'Desarrollar Inteligencia de Negocio',
            description: 'Convertir datos en activo estratégico.',
            priority: 'MEDIO',
            actions: ['Implementar herramienta de BI', 'Definir KPIs clave', 'Capacitar en análisis de datos']
        },
        'experiencia_cliente': {
            title: 'Mejorar Experiencia del Cliente',
            description: 'Poner al cliente en el centro.',
            priority: 'ALTO',
            actions: ['Implementar NPS', 'Mapear customer journey', 'Crear protocolo de atención']
        },
        'sostenibilidad_responsabilidad': {
            title: 'Integrar Sostenibilidad',
            description: 'Adoptar prácticas responsables.',
            priority: 'BAJO',
            actions: ['Definir política de RSC', 'Lanzar programa ambiental', 'Establecer alianza social']
        },
        'finanzas_rentabilidad': {
            title: 'Fortalecer Gestión Financiera',
            description: 'Asegurar salud financiera.',
            priority: 'CRÍTICO',
            actions: ['Implementar software financiero', 'Establecer presupuesto mensual', 'Analizar rentabilidad']
        }
    };
    
    return sortedCategories.map(category => {
        const rec = recs[category.id] || recs['vision_estrategia'];
        return {
            ...rec,
            category: category.name,
            categoryIcon: category.icon,
            score: category.score
        };
    });
}

function getScoreColor(score) {
    if (score <= 20) return '#AA2F0C';
    if (score <= 40) return '#EC8E48';
    if (score <= 60) return '#EE8028';
    if (score <= 80) return '#4CCED5';
    return '#10b981';
}

function getScoreDescription(score) {
    if (score <= 20) return 'Área crítica que requiere atención inmediata';
    if (score <= 40) return 'Oportunidad de mejora significativa';
    if (score <= 60) return 'Progreso intermedio, continuar fortaleciendo';
    if (score <= 80) return 'Buen nivel, optimizar para excelencia';
    return 'Excelente desempeño, mantener liderazgo';
}

// ===== ENVÍO A GOOGLE SHEETS =====
async function sendDataToGoogleSheets() {
    try {
        const payload = {
            timestamp: new Date().toISOString(),
            companyData: appState.companyData,
            evaluationData: {
                totalScore: appState.evaluationData.totalScore,
                maturityLevel: appState.evaluationData.maturityLevel,
                categoryScores: appState.evaluationData.categoryScores,
                answers: appState.evaluationData.answers
            },
            consent: appState.consent
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        console.log('✅ Datos enviados a Google Sheets');
    } catch (error) {
        console.error('❌ Error enviando datos:', error);
    }
}

// ===== FUNCIONES AUXILIARES =====
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function autoSave() {
    localStorage.setItem('pymeEvaluationState', JSON.stringify(appState));
}

function loadSavedState() {
    const saved = localStorage.getItem('pymeEvaluationState');
    if (saved) {
        const savedState = JSON.parse(saved);
        savedState.consent = appState.consent;
        appState = { ...appState, ...savedState };
        if (appState.currentSection && appState.currentSection !== 'landing') {
            showSection(appState.currentSection);
            if (appState.currentSection === 'evaluation') {
                renderCategoryProgress();
                renderCurrentQuestion();
                updateGlobalProgress();
                updateAchievementsCounter();
            } else if (appState.currentSection === 'results') {
                renderResults();
            }
        }
    }
}

// ===== GENERACIÓN DE PDF (manteniendo la función original) =====
async function downloadPDF() {
    showLoading('Generando tu reporte profesional...');
    
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) throw new Error('jsPDF no disponible');
        
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 50;
        const contentWidth = pageWidth - (2 * margin);
        
        // Colores corporativos
        const colors = {
            primary: [39, 50, 90],
            purple: [133, 96, 192],
            turquoise: [76, 206, 213],
            orange: [238, 128, 40],
            gray: [107, 114, 128],
            lightGray: [248, 250, 252],
            white: [255, 255, 255],
            green: [16, 185, 129]
        };
        
        // Datos
        const companyData = appState.companyData || {};
        const evaluationData = appState.evaluationData || {};
        const finalScore = evaluationData.totalScore || 0;
        const maturityLevel = evaluationData.maturityLevel || { level: 'N/A', description: 'Sin datos' };
        const categoryScores = evaluationData.categoryScores || {};
        
        // Función para cargar logo manteniendo proporción
        async function loadLogo() {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const aspectRatio = img.width / img.height;
                    const targetWidth = 400;
                    const targetHeight = targetWidth / aspectRatio;
                    
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    resolve({
                        data: canvas.toDataURL('image/png'),
                        aspectRatio: aspectRatio
                    });
                };
                img.onerror = () => resolve(null);
                img.src = 'https://forjadigitalae.github.io/LOGO%20F_OSC.png';
            });
        }
        
        const logoInfo = await loadLogo();
        
        // PÁGINA 1: PORTADA
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 100, 'F');
        
        // Logo con proporción correcta
        if (logoInfo) {
            try {
                const logoWidth = 100;
                const logoHeight = logoWidth / logoInfo.aspectRatio;
                doc.addImage(logoInfo.data, 'PNG', margin, 20, logoWidth, logoHeight);
            } catch (e) {
                console.warn('Error al insertar logo:', e);
            }
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.white);
        doc.text('ForjaDigitalAE', pageWidth - margin, 40, { align: 'right' });
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Arquitectura Empresarial & Transformacion Digital', pageWidth - margin, 60, { align: 'right' });
        
        let y = 140;
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text('REPORTE DE MADUREZ', pageWidth/2, y, { align: 'center' });
        
        y += 45;
        doc.setFontSize(32);
        doc.setTextColor(...colors.purple);
        doc.text('EMPRESARIAL', pageWidth/2, y, { align: 'center' });
        
        y += 70;
        doc.setFillColor(...colors.lightGray);
        doc.setDrawColor(...colors.purple);
        doc.setLineWidth(2);
        doc.roundedRect(margin, y, contentWidth, 120, 10, 10, 'FD');
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text(companyData.name || 'Empresa', pageWidth/2, y + 40, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.gray);
        const companyInfo = `${companyData.sector || 'N/A'} | ${companyData.size || 'N/A'} | ${companyData.city || 'N/A'}`;
        doc.text(companyInfo, pageWidth/2, y + 65, { align: 'center' });
        
        doc.setFontSize(11);
        doc.text(`${companyData.contactName || 'N/A'} | ${companyData.email || 'N/A'}`, pageWidth/2, y + 90, { align: 'center' });
        
        // Círculo con progreso real
        y += 170;
        const circleX = pageWidth / 2;
        const circleY = y + 60;
        const circleRadius = 70;
        
        // Círculo de fondo
        doc.setLineWidth(14);
        doc.setDrawColor(220, 220, 220);
        doc.circle(circleX, circleY, circleRadius, 'S');
        
        // Arco de progreso basado en score real
        const startAngle = -90;
        const progressAngle = (finalScore / 100) * 360;
        
        doc.setDrawColor(...colors.purple);
        doc.setLineWidth(14);
        
        // Dibujar arco
        const segments = Math.ceil(Math.abs(progressAngle));
        const angleStep = progressAngle / segments;
        
        for (let i = 0; i < segments; i++) {
            const angle1 = (startAngle + (i * angleStep)) * Math.PI / 180;
            const angle2 = (startAngle + ((i + 1) * angleStep)) * Math.PI / 180;
            
            const x1 = circleX + circleRadius * Math.cos(angle1);
            const y1 = circleY + circleRadius * Math.sin(angle1);
            const x2 = circleX + circleRadius * Math.cos(angle2);
            const y2 = circleY + circleRadius * Math.sin(angle2);
            
            doc.line(x1, y1, x2, y2);
        }
        
        doc.setFillColor(...colors.white);
        doc.circle(circleX, circleY, circleRadius - 10, 'F');
        
        doc.setFontSize(48);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.purple);
        doc.text(finalScore.toString(), circleX, circleY + 15, { align: 'center' });
        
        y = circleY + circleRadius + 40;
        const badgeWidth = 180;
        const badgeHeight = 40;
        const badgeX = (pageWidth - badgeWidth) / 2;
        
        doc.setFillColor(...colors.purple);
        doc.roundedRect(badgeX, y, badgeWidth, badgeHeight, 20, 20, 'F');
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.white);
        doc.text(maturityLevel.level, pageWidth/2, y + 27, { align: 'center' });
        
        y += 55;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.gray);
        doc.text('Nivel de Madurez Empresarial', pageWidth/2, y, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Puntuacion: ${finalScore}/100`, pageWidth/2, y + 18, { align: 'center' });
        
        // Guardar PDF
        const safeCompanyName = (companyData.name || 'Empresa').replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
        const fileName = `Reporte_Madurez_${safeCompanyName}_${new Date().getFullYear()}.pdf`;
        
        await new Promise(resolve => setTimeout(resolve, 300));
        doc.save(fileName);
        
        showToast('Reporte generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showToast('Error al generar el reporte', 'error');
    } finally {
        hideLoading();
    }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Botón principal de landing
    const btnEvaluar = document.getElementById('btnStartEvaluation');
    if (btnEvaluar) {
        btnEvaluar.addEventListener('click', showConsentModal);
    }

    // Botones de consentimiento
    const btnAcceptConsent = document.getElementById('btnAcceptConsent');
    if (btnAcceptConsent) {
        btnAcceptConsent.addEventListener('click', acceptConsent);
    }

    const btnCancelConsent = document.getElementById('btnCancelConsent');
    if (btnCancelConsent) {
        btnCancelConsent.addEventListener('click', hideConsentModal);
    }

    // Enlace de política de privacidad
    const privacyLink = document.getElementById('privacyPolicyLink');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPrivacyPolicy();
        });
    }

    const btnClosePrivacy = document.getElementById('btnClosePrivacy');
    if (btnClosePrivacy) {
        btnClosePrivacy.addEventListener('click', hidePrivacyPolicy);
    }

    // Formulario de inicio rápido
    const quickStartForm = document.getElementById('quickStartForm');
    if (quickStartForm) {
        quickStartForm.addEventListener('submit', handleQuickStart);
    }

    // Formulario de registro completo
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Botones de navegación de evaluación
    const btnPrevQuestion = document.getElementById('prevBtn');
    if (btnPrevQuestion) {
        btnPrevQuestion.addEventListener('click', previousQuestion);
    }

    const btnNextQuestion = document.getElementById('nextBtn');
    if (btnNextQuestion) {
        btnNextQuestion.addEventListener('click', nextQuestion);
    }

    // Botón de descarga PDF
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', downloadPDF);
    }

    // Botón de reiniciar
    const btnReset = document.getElementById('btnResetApp');
    if (btnReset) {
        btnReset.addEventListener('click', resetApp);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando ForjaDigitalAE...');
    
    showSection('landing');
    loadSavedState();
    initEventListeners();
    
    console.log('✅ Aplicación lista');
});

// Prevenir errores de recursos externos
window.addEventListener('error', function(e) {
    if (e.message && (e.message.includes('claschadder') || e.message.includes('tracker'))) {
        e.preventDefault();
        return false;
    }
});

console.log('%c🚀 ForjaDigitalAE - Evaluación inicializada correctamente', 'color: #4CCED5; font-size: 16px; font-weight: bold;');
console.log('%c📊 Versión: 5.0 - Gamificación Completa (CORREGIDA)', 'color: #EE8028; font-size: 12px;');