/* ================================
   FORJADIGITALAE - EVALUACIÓN JS
   Versión LIMPIA y FUNCIONAL
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
        description: "Completaste tu primera categoría"
    },
    "momentum": { 
        name: "Tomando Impulso", 
        icon: "⚡", 
        description: "3 categorías completadas, ¡vas genial!"
    },
    "halfway_hero": { 
        name: "Héroe a Mitad de Camino", 
        icon: "🦸‍♂️", 
        description: "50% completado, ¡imparable!"
    },
    "perfectionist": { 
        name: "Perfeccionista", 
        icon: "💎", 
        description: "Todas tus respuestas son de alto nivel"
    },
    "completion_champion": { 
        name: "Campeón de Finalización", 
        icon: "🏆", 
        description: "¡Evaluación 100% completada!"
    }
};

// Mensajes motivacionales por progreso
const motivationalMessages = {
    10: { emoji: "🚀", message: "¡Fantástico! El 10% ya está listo" },
    25: { emoji: "💪", message: "¡Vas súper bien! Un cuarto del camino recorrido" },
    50: { emoji: "🎯", message: "¡Increíble! Ya estás a mitad del camino hacia tu diagnóstico" },
    75: { emoji: "💎", message: "¡Casi lo logras! Solo falta el 25% para tu reporte personalizado" },
    90: { emoji: "🎉", message: "¡Último esfuerzo! Estás a punto de descubrir tu potencial" }
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

// ===== FUNCIONES AUXILIARES (DEFINIDAS PRIMERO) =====
function getCurrentQuestion() {
    const category = categories[appState.evaluationData.currentCategory];
    if (!category) return null;
    
    const question = category.questions[appState.evaluationData.currentQuestion];
    if (!question) return null;
    
    question.answer = appState.evaluationData.answers[question.id];
    return question;
}

function autoSave() {
    try {
        localStorage.setItem('pymeEvaluationState', JSON.stringify(appState));
    } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
    }
}

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

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
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

function showConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) modal.classList.remove('hidden');
}

function hideConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) modal.classList.add('hidden');
}

function acceptConsent() {
    const communications = document.getElementById('consentCommunications');
    const benchmarking = document.getElementById('consentBenchmarking');
    
    appState.consent.communications = communications ? communications.checked : false;
    appState.consent.benchmarking = benchmarking ? benchmarking.checked : false;
    
    hideConsentModal();
    showSection('registration');
}

// ===== FUNCIONES DE REGISTRO =====
function handleQuickStart(e) {
    e.preventDefault();
    
    const companyName = document.getElementById('quickCompanyName');
    const email = document.getElementById('quickEmail');
    
    if (!companyName || !email || !companyName.value || !email.value) {
        showToast('Por favor completa ambos campos', 'error');
        return;
    }
    
    appState.companyData = {
        name: companyName.value,
        email: email.value,
        sector: 'Servicios',
        size: 'Pequeña (11-50)',
        years: '1-3 años',
        location: 'Colombia',
        city: 'Colombia'
    };
    
    appState.evaluationData.startTime = Date.now();
    
    showToast('¡Perfecto! Comencemos tu evaluación', 'success');
    
    setTimeout(() => {
        autoSave();
        showSection('evaluation');
        initEvaluation();
    }, 1000);
}

// ===== FUNCIONES DE EVALUACIÓN =====
function initEvaluation() {
    appState.evaluationData.currentCategory = 0;
    appState.evaluationData.currentQuestion = 0;
    renderCategoryProgress();
    renderCurrentQuestion();
    updateGlobalProgress();
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
}

function renderCurrentQuestion() {
    const category = categories[appState.evaluationData.currentCategory];
    const question = category.questions[appState.evaluationData.currentQuestion];
    
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
        questionText.textContent = question.text;
    }
    
    if (tooltipText) {
        tooltipText.textContent = question.tooltip;
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
    
    const optionData = [
        { value: 0, emoji: '😟', label: 'Muy Bajo / No aplica', description: 'No existe o no se implementa', color: '#ef4444' },
        { value: 1, emoji: '😐', label: 'Bajo / Iniciando', description: 'En etapa muy temprana o informal', color: '#f97316' },
        { value: 2, emoji: '🙂', label: 'Medio / En desarrollo', description: 'Parcialmente implementado', color: '#eab308' },
        { value: 3, emoji: '😊', label: 'Alto / Bien implementado', description: 'Bien establecido y funcional', color: '#3b82f6' },
        { value: 4, emoji: '🌟', label: 'Muy Alto / Excelente', description: 'Optimizado y en mejora continua', color: '#10b981' }
    ];
    
    scaleOptionsContainer.innerHTML = '';
    
    optionData.forEach((option, index) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'scale-option';
        optionCard.setAttribute('data-value', option.value);
        optionCard.style.animationDelay = `${index * 0.1}s`;
        
        if (currentQuestion.answer === option.value) {
            optionCard.classList.add('selected');
        }
        
        optionCard.innerHTML = `
            <div class="option-icon">${option.emoji}</div>
            <div class="option-number" style="background-color: ${option.color}">${option.value}</div>
            <div class="option-label">${option.label}</div>
            <div class="option-description">${option.description}</div>
        `;
        
        optionCard.addEventListener('click', function() {
            selectOption(option.value, this, option.color);
        });
        
        scaleOptionsContainer.appendChild(optionCard);
    });
}

function selectOption(value, element, color) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    appState.evaluationData.answers[currentQuestion.id] = value;
    
    document.querySelectorAll('.scale-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    showEnhancedFeedback(value, color);
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.add('btn-ready');
    }
    
    updateGlobalProgress();
    autoSave();
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
}

function updateNavigationButtons() {
    const btnPrev = document.getElementById('prevBtn');
    const btnNext = document.getElementById('nextBtn');
    
    if (btnPrev) {
        const isFirstQuestion = appState.evaluationData.currentCategory === 0 && 
                               appState.evaluationData.currentQuestion === 0;
        btnPrev.disabled = isFirstQuestion;
        btnPrev.style.opacity = isFirstQuestion ? '0.5' : '1';
    }
    
    if (btnNext) {
        const category = categories[appState.evaluationData.currentCategory];
        const question = category.questions[appState.evaluationData.currentQuestion];
        const isAnswered = appState.evaluationData.answers[question.id] !== undefined;
        
        btnNext.disabled = !isAnswered;
        btnNext.style.opacity = isAnswered ? '1' : '0.5';
        
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
        appState.evaluationData.currentCategory++;
        appState.evaluationData.currentQuestion = 0;
        
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

function updateGlobalProgress() {
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = Object.keys(appState.evaluationData.answers).length;
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    const currentEl = document.getElementById('globalProgressCurrent');
    const totalEl = document.getElementById('globalProgressTotal');
    const percentageEl = document.getElementById('globalProgressPercentage');
    const fillEl = document.getElementById('globalProgressFill');
    
    if (currentEl) currentEl.textContent = answeredQuestions;
    if (totalEl) totalEl.textContent = totalQuestions;
    if (percentageEl) percentageEl.textContent = percentage;
    
    if (fillEl) {
        fillEl.style.width = `${percentage}%`;
        
        if (percentage === 100) {
            showToast('🎉 ¡Felicitaciones! Has completado todas las preguntas', 'success');
        }
    }
    
    updateEmotionalProgress(percentage);
    checkMotivationalMessage(percentage);
}

function updateEmotionalProgress(percentage) {
    let currentState = progressStates[0];
    for (let threshold of Object.keys(progressStates).sort((a, b) => b - a)) {
        if (percentage >= parseInt(threshold)) {
            currentState = progressStates[threshold];
            break;
        }
    }
    
    const emotionalIndicator = document.getElementById('emotionalIndicator');
    if (emotionalIndicator) {
        emotionalIndicator.innerHTML = `${currentState.emoji} ${currentState.state}`;
        emotionalIndicator.style.color = currentState.color;
    }
}

function checkMotivationalMessage(percentage) {
    const message = motivationalMessages[percentage];
    if (message && !appState.evaluationData.shownMessages?.includes(percentage)) {
        showMotivationalToast(message.emoji, message.message);
        
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
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// ===== FINALIZACIÓN Y RESULTADOS =====
function finishEvaluation() {
    showLoading('Calculando resultados...');
    
    setTimeout(() => {
        calculateScores();
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
    }
    
    if (maturityDescription) {
        maturityDescription.textContent = maturityLevel.description;
    }
    
    renderRadarChart();
    renderDetailedResults();
}

function renderRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    const categoryScores = appState.evaluationData.categoryScores || {};
    
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

function resetApp() {
    localStorage.removeItem('pymeEvaluationState');
    location.reload();
}

function loadSavedState() {
    try {
        const saved = localStorage.getItem('pymeEvaluationState');
        if (saved) {
            const savedState = JSON.parse(saved);
            appState = { ...appState, ...savedState };
            if (appState.currentSection && appState.currentSection !== 'landing') {
                showSection(appState.currentSection);
                if (appState.currentSection === 'evaluation') {
                    renderCategoryProgress();
                    renderCurrentQuestion();
                    updateGlobalProgress();
                } else if (appState.currentSection === 'results') {
                    renderResults();
                }
            }
        }
    } catch (e) {
        console.warn('Error cargando estado guardado:', e);
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

    // Formulario de inicio rápido
    const quickStartForm = document.getElementById('quickStartForm');
    if (quickStartForm) {
        quickStartForm.addEventListener('submit', handleQuickStart);
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

    // Botón de reiniciar
    const btnReset = document.getElementById('btnResetApp');
    if (btnReset) {
        btnReset.addEventListener('click', resetApp);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando ForjaDigitalAE...');
    
    try {
        showSection('landing');
        loadSavedState();
        initEventListeners();
        console.log('✅ Aplicación lista');
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
    }
});

// Prevenir errores de recursos externos
window.addEventListener('error', function(e) {
    if (e.message && (e.message.includes('claschadder') || e.message.includes('tracker'))) {
        e.preventDefault();
        return false;
    }
});

console.log('%c🚀 ForjaDigitalAE - Evaluación LIMPIA inicializada', 'color: #4CCED5; font-size: 16px; font-weight: bold;');
console.log('%c📊 Versión: CLEAN - Sin errores', 'color: #10b981; font-size: 12px;');