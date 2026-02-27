// 项目管理规划工具 - 主应用逻辑

// ==================== 全局状态 ====================
const AppState = {
    apiKey: localStorage.getItem('kimiApiKey') || '',
    projectIdea: '',
    analysisResult: '',
    conditions: [],
    researchAnswers: {},
    researchCompleted: {},
    phases: [
        { id: 'planning', name: '规划阶段', tasks: [] },
        { id: 'design', name: '设计阶段', tasks: [] },
        { id: 'development', name: '开发阶段', tasks: [] },
        { id: 'testing', name: '测试阶段', tasks: [] },
        { id: 'deployment', name: '部署阶段', tasks: [] }
    ],
    currentPhaseIndex: 0,
    tasks: [],
    projectName: ''
};

// ==================== DOM 元素引用 ====================
const elements = {
    kimiApiKey: document.getElementById('kimiApiKey'),
    projectIdea: document.getElementById('projectIdea'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    analysisResult: document.getElementById('analysisResult'),
    analysisContent: document.getElementById('analysisContent'),
    conditionsList: document.getElementById('conditionsList'),
    conditionsUl: document.getElementById('conditionsUl'),
    researchSection: document.getElementById('researchSection'),
    researchQuestions: document.getElementById('researchQuestions'),
    researchProgress: document.getElementById('researchProgress'),
    researchProgressText: document.getElementById('researchProgressText'),
    researchCompleteMsg: document.getElementById('researchCompleteMsg'),
    executionSection: document.getElementById('executionSection'),
    overallProgress: document.getElementById('overallProgress'),
    overallProgressText: document.getElementById('overallProgressText'),
    phaseTitle: document.getElementById('phaseTitle'),
    phaseTasks: document.getElementById('phaseTasks'),
    newPhaseSection: document.getElementById('newPhaseSection'),
    phaseNotification: document.getElementById('phaseNotification'),
    phaseNotificationText: document.getElementById('phaseNotificationText'),
    allTasks: document.getElementById('allTasks'),
    newTaskInput: document.getElementById('newTaskInput'),
    newTaskPhase: document.getElementById('newTaskPhase'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    projectName: document.getElementById('projectName'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    projectsList: document.getElementById('projectsList')
};

// ==================== 初始化 ====================
function init() {
    // 加载保存的 API Key
    if (AppState.apiKey) {
        elements.kimiApiKey.value = AppState.apiKey;
    }

    // 绑定事件监听器
    elements.analyzeBtn.addEventListener('click', analyzeProject);
    elements.saveProjectBtn.addEventListener('click', saveProject);
    elements.addTaskBtn.addEventListener('click', addNewTask);

    // 监听 API Key 变化
    elements.kimiApiKey.addEventListener('change', (e) => {
        AppState.apiKey = e.target.value;
        localStorage.setItem('kimiApiKey', AppState.apiKey);
    });

    // 加载阶段选项
    loadPhaseOptions();

    // 加载保存的项目
    loadSavedProjects();

    console.log('项目管理规划工具已初始化');
}

// ==================== Kimi API 调用 ====================
async function callKimiAPI(messages) {
    const apiKey = AppState.apiKey;
    if (!apiKey) {
        alert('请先配置 Kimi API Key');
        return null;
    }

    try {
        const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API 调用失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Kimi API 错误:', error);
        alert(`API 调用失败: ${error.message}`);
        return null;
    }
}

// ==================== 项目分析 ====================
async function analyzeProject() {
    const idea = elements.projectIdea.value.trim();
    if (!idea) {
        alert('请输入项目想法');
        return;
    }

    AppState.projectIdea = idea;

    // 显示加载状态
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.innerHTML = 'AI 分析中<span class="loading"></span>';

    const prompt = `作为项目管理专家，请分析以下项目想法，并提供：

1. 项目概述和可行性分析
2. 实现该项目所需的5-8个关键条件（如技术栈、团队、资金、市场调研等）
3. 针对每个条件，提出一个具体的调研问题
4. 建议的项目执行阶段（规划、设计、开发、测试、部署）及每个阶段的关键任务

项目想法：${idea}

请以 JSON 格式返回结果，格式如下：
{
    "overview": "项目概述",
    "feasibility": "可行性分析",
    "conditions": [
        {"name": "条件名称", "question": "调研问题"}
    ],
    "phases": [
        {"name": "阶段名称", "tasks": ["任务1", "任务2"]}
    ]
}`;

    const result = await callKimiAPI([
        { role: 'system', content: '你是一个专业的项目管理顾问，擅长分析项目需求并制定执行计划。' },
        { role: 'user', content: prompt }
    ]);

    // 恢复按钮状态
    elements.analyzeBtn.disabled = false;
    elements.analyzeBtn.innerHTML = 'AI 分析项目需求';

    if (!result) return;

    try {
        // 解析 JSON 结果
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (parsed) {
            displayAnalysisResult(parsed);
        } else {
            // 如果无法解析 JSON，直接显示文本
            displayTextResult(result);
        }
    } catch (e) {
        console.error('解析结果失败:', e);
        displayTextResult(result);
    }
}

function displayAnalysisResult(data) {
    // 显示分析结果
    AppState.analysisResult = `${data.overview}\n\n可行性分析：${data.feasibility}`;
    elements.analysisContent.innerHTML = `
        <p><strong>项目概述：</strong>${data.overview}</p>
        <p><strong>可行性分析：</strong>${data.feasibility}</p>
    `;
    elements.analysisResult.classList.remove('hidden');

    // 显示条件列表
    AppState.conditions = data.conditions || [];
    elements.conditionsUl.innerHTML = AppState.conditions.map((c, i) => 
        `<li><strong>${i + 1}.</strong> ${c.name}</li>`
    ).join('');
    elements.conditionsList.classList.remove('hidden');

    // 显示调研问题
    displayResearchQuestions();

    // 更新阶段和任务
    if (data.phases) {
        AppState.phases = data.phases.map((p, i) => ({
            id: `phase-${i}`,
            name: p.name,
            tasks: p.tasks || []
        }));
        
        // 生成任务列表
        AppState.tasks = [];
        AppState.phases.forEach((phase, phaseIndex) => {
            phase.tasks.forEach((taskName, taskIndex) => {
                AppState.tasks.push({
                    id: `task-${phaseIndex}-${taskIndex}`,
                    name: taskName,
                    phase: phase.name,
                    phaseIndex: phaseIndex,
                    completed: false
                });
            });
        });

        loadPhaseOptions();
        displayExecutionPhase();
        displayAllTasks();
    }

    // 显示后续部分
    elements.researchSection.classList.remove('hidden');
    elements.executionSection.classList.remove('hidden');
    elements.newPhaseSection.classList.remove('hidden');

    // 滚动到结果区域
    elements.analysisResult.scrollIntoView({ behavior: 'smooth' });
}

function displayTextResult(text) {
    AppState.analysisResult = text;
    elements.analysisContent.innerHTML = `<pre>${text}</pre>`;
    elements.analysisResult.classList.remove('hidden');
    
    // 创建默认条件
    AppState.conditions = [
        { name: '技术可行性', question: '需要哪些技术栈？团队是否具备相关技能？' },
        { name: '市场调研', question: '目标用户是谁？市场规模有多大？' },
        { name: '资源评估', question: '需要多少预算和人力资源？' },
        { name: '时间规划', question: '预计开发周期是多长？' },
        { name: '风险评估', question: '可能遇到哪些风险？如何应对？' }
    ];
    
    elements.conditionsUl.innerHTML = AppState.conditions.map((c, i) => 
        `<li><strong>${i + 1}.</strong> ${c.name}</li>`
    ).join('');
    elements.conditionsList.classList.remove('hidden');
    
    displayResearchQuestions();
    elements.researchSection.classList.remove('hidden');
    elements.executionSection.classList.remove('hidden');
    elements.newPhaseSection.classList.remove('hidden');
}

// ==================== 调研问题 ====================
function displayResearchQuestions() {
    elements.researchQuestions.innerHTML = AppState.conditions.map((condition, index) => `
        <div class="research-item">
            <h4>📌 ${condition.name}</h4>
            <p><strong>问题：</strong>${condition.question}</p>
            <div class="form-group">
                <label>您的调研答案：</label>
                <textarea 
                    rows="2" 
                    placeholder="请输入您的调研结果..."
                    onchange="updateResearchAnswer(${index}, this.value)"
                >${AppState.researchAnswers[index] || ''}</textarea>
            </div>
            <div class="checkbox-wrapper">
                <input 
                    type="checkbox" 
                    id="research-check-${index}"
                    ${AppState.researchCompleted[index] ? 'checked' : ''}
                    onchange="toggleResearchComplete(${index})"
                >
                <label for="research-check-${index}">该条件调研已完成</label>
            </div>
        </div>
    `).join('');

    updateResearchProgress();
}

function updateResearchAnswer(index, value) {
    AppState.researchAnswers[index] = value;
}

function toggleResearchComplete(index) {
    AppState.researchCompleted[index] = !AppState.researchCompleted[index];
    updateResearchProgress();
}

function updateResearchProgress() {
    const total = AppState.conditions.length;
    const completed = Object.values(AppState.researchCompleted).filter(v => v).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    elements.researchProgress.style.width = `${percentage}%`;
    elements.researchProgressText.textContent = `${completed} / ${total} 条件已完成调研`;

    if (completed === total && total > 0) {
        elements.researchCompleteMsg.classList.remove('hidden');
    } else {
        elements.researchCompleteMsg.classList.add('hidden');
    }
}

// ==================== 执行阶段 ====================
function displayExecutionPhase() {
    const currentPhase = AppState.phases[AppState.currentPhaseIndex];
    if (!currentPhase) return;

    elements.phaseTitle.textContent = `当前阶段：${currentPhase.name}`;
    
    const phaseTasks = AppState.tasks.filter(t => t.phaseIndex === AppState.currentPhaseIndex);
    
    if (phaseTasks.length === 0) {
        elements.phaseTasks.innerHTML = '<p class="text-muted">该阶段暂无任务</p>';
    } else {
        elements.phaseTasks.innerHTML = phaseTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTaskComplete('${task.id}')"
                >
                <span>${task.name}</span>
            </div>
        `).join('');
    }

    updateOverallProgress();
}

function toggleTaskComplete(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        displayExecutionPhase();
        displayAllTasks();
        checkPhaseComplete();
    }
}

function updateOverallProgress() {
    const total = AppState.tasks.length;
    const completed = AppState.tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    elements.overallProgress.style.width = `${percentage}%`;
    elements.overallProgressText.textContent = `${percentage}%`;
}

function checkPhaseComplete() {
    const currentPhase = AppState.phases[AppState.currentPhaseIndex];
    if (!currentPhase) return;

    const phaseTasks = AppState.tasks.filter(t => t.phaseIndex === AppState.currentPhaseIndex);
    const allCompleted = phaseTasks.length > 0 && phaseTasks.every(t => t.completed);

    if (allCompleted && AppState.currentPhaseIndex < AppState.phases.length - 1) {
        const nextPhase = AppState.phases[AppState.currentPhaseIndex + 1];
        elements.phaseNotificationText.innerHTML = `
            您已完成 <strong>${currentPhase.name}</strong>，
            接下来是 <strong>${nextPhase.name}</strong>。
            请查看下方的任务列表继续推进项目。
        `;
        elements.phaseNotification.classList.remove('hidden');
        
        // 自动进入下一阶段
        AppState.currentPhaseIndex++;
        displayExecutionPhase();
    }
}

// ==================== 任务管理 ====================
function loadPhaseOptions() {
    elements.newTaskPhase.innerHTML = `
        <option value="">选择阶段</option>
        ${AppState.phases.map((p, i) => `<option value="${i}">${p.name}</option>`).join('')}
    `;
}

function displayAllTasks() {
    if (AppState.tasks.length === 0) {
        elements.allTasks.innerHTML = '<p class="text-muted">暂无任务</p>';
        return;
    }

    // 按阶段分组显示任务
    const tasksByPhase = {};
    AppState.tasks.forEach(task => {
        if (!tasksByPhase[task.phase]) {
            tasksByPhase[task.phase] = [];
        }
        tasksByPhase[task.phase].push(task);
    });

    elements.allTasks.innerHTML = Object.entries(tasksByPhase).map(([phase, tasks]) => `
        <div class="phase-tasks-group">
            <h4>${phase}</h4>
            ${tasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="toggleTaskComplete('${task.id}')"
                    >
                    <span>${task.name}</span>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">删除</button>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function addNewTask() {
    const name = elements.newTaskInput.value.trim();
    const phaseIndex = parseInt(elements.newTaskPhase.value);

    if (!name) {
        alert('请输入任务名称');
        return;
    }

    if (isNaN(phaseIndex)) {
        alert('请选择阶段');
        return;
    }

    const phase = AppState.phases[phaseIndex];
    const newTask = {
        id: `task-${Date.now()}`,
        name: name,
        phase: phase.name,
        phaseIndex: phaseIndex,
        completed: false
    };

    AppState.tasks.push(newTask);
    AppState.phases[phaseIndex].tasks.push(name);

    elements.newTaskInput.value = '';
    elements.newTaskPhase.value = '';

    displayExecutionPhase();
    displayAllTasks();
}

function deleteTask(taskId) {
    if (confirm('确定要删除这个任务吗？')) {
        const taskIndex = AppState.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const task = AppState.tasks[taskIndex];
            AppState.tasks.splice(taskIndex, 1);
            
            // 从阶段任务列表中也删除
            const phaseTaskIndex = AppState.phases[task.phaseIndex].tasks.indexOf(task.name);
            if (phaseTaskIndex > -1) {
                AppState.phases[task.phaseIndex].tasks.splice(phaseTaskIndex, 1);
            }
            
            displayExecutionPhase();
            displayAllTasks();
            updateOverallProgress();
        }
    }
}

// ==================== 项目保存/加载 ====================
function saveProject() {
    const name = elements.projectName.value.trim();
    if (!name) {
        alert('请输入项目名称');
        return;
    }

    const project = {
        id: Date.now(),
        name: name,
        createdAt: new Date().toLocaleString(),
        state: { ...AppState }
    };

    // 获取已保存的项目
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // 检查是否已存在同名项目
    const existingIndex = savedProjects.findIndex(p => p.name === name);
    if (existingIndex > -1) {
        if (confirm('已存在同名项目，是否覆盖？')) {
            savedProjects[existingIndex] = project;
        } else {
            return;
        }
    } else {
        savedProjects.push(project);
    }

    localStorage.setItem('projects', JSON.stringify(savedProjects));
    alert('项目保存成功！');
    loadSavedProjects();
}

function loadSavedProjects() {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    if (savedProjects.length === 0) {
        elements.projectsList.innerHTML = '<p class="text-muted">暂无保存的项目</p>';
        return;
    }

    elements.projectsList.innerHTML = savedProjects.map(project => `
        <div class="project-card">
            <div class="project-info">
                <h4>${project.name}</h4>
                <p>创建于: ${project.createdAt}</p>
            </div>
            <div class="project-actions">
                <button class="load-btn" onclick="loadProject(${project.id})">加载</button>
                <button class="delete-project-btn" onclick="deleteProject(${project.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function loadProject(projectId) {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = savedProjects.find(p => p.id === projectId);
    
    if (!project) {
        alert('项目不存在');
        return;
    }

    // 恢复项目状态
    Object.assign(AppState, project.state);

    // 恢复 UI
    elements.projectIdea.value = AppState.projectIdea;
    elements.projectName.value = project.name;

    if (AppState.analysisResult) {
        elements.analysisContent.innerHTML = `<pre>${AppState.analysisResult}</pre>`;
        elements.analysisResult.classList.remove('hidden');
    }

    if (AppState.conditions.length > 0) {
        elements.conditionsUl.innerHTML = AppState.conditions.map((c, i) => 
            `<li><strong>${i + 1}.</strong> ${c.name}</li>`
        ).join('');
        elements.conditionsList.classList.remove('hidden');
        displayResearchQuestions();
    }

    loadPhaseOptions();
    displayExecutionPhase();
    displayAllTasks();

    elements.researchSection.classList.remove('hidden');
    elements.executionSection.classList.remove('hidden');
    elements.newPhaseSection.classList.remove('hidden');

    alert('项目加载成功！');
}

function deleteProject(projectId) {
    if (!confirm('确定要删除这个项目吗？')) return;

    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const filtered = savedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(filtered));
    loadSavedProjects();
}

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', init);
