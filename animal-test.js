
class AnimalFaceTest extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.maxPredictions = 0;
        this.URL = "https://teachablemachine.withgoogle.com/models/vz9jWJSXA/"; 
    }

    connectedCallback() {
        this.render();
        this.loadModel(); 
    }

    async loadModel() {
        try {
            const modelURL = this.URL + "model.json";
            const metadataURL = this.URL + "metadata.json";
            this.model = await tmImage.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();
        } catch (error) {
            console.error("Model load failed", error);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                font-family: 'Nanum Pen Script', cursive;
                color: #333;
            }
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 3rem 1rem;
                max-width: 500px;
                margin: 0 auto;
                background: white;
                border-radius: 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                min-height: 450px;
                transition: all 0.5s ease;
            }
            h2 {
                font-family: 'East Sea Dokdo', cursive;
                font-size: 4rem;
                margin: 0 0 2rem 0;
                color: #ff416c;
                text-align: center;
            }
            
            /* Start View */
            .view-start {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
            }
            .main-icon {
                font-size: 6rem;
                animation: bounce 2s infinite;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            .start-btn {
                padding: 1.2rem 4rem;
                font-size: 2rem;
                background: linear-gradient(to right, #ff416c, #ff4b2b);
                color: white;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                font-family: 'Nanum Pen Script', cursive;
                box-shadow: 0 10px 20px rgba(255, 65, 108, 0.3);
                transition: all 0.3s;
            }
            .start-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 15px 30px rgba(255, 65, 108, 0.4);
            }

            /* Loading View */
            .view-loading {
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1.5rem;
                margin-top: 4rem;
            }
            .loader {
                border: 8px solid #f3f3f3;
                border-top: 8px solid #ff416c;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Result View */
            .view-result {
                display: none;
                flex-direction: column;
                align-items: center;
                width: 100%;
            }
            .result-photo {
                width: 250px;
                height: 250px;
                border-radius: 20px;
                object-fit: cover;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
            }
            .result-title {
                font-size: 3rem;
                font-weight: bold;
                color: #2575fc;
                margin-bottom: 1.5rem;
                text-align: center;
            }
            .result-bar-container {
                width: 100%;
                margin-bottom: 2rem;
            }
            .bar-row {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 0.8rem;
            }
            .bar-label {
                width: 80px;
                font-size: 1.5rem;
                text-align: right;
            }
            .bar-bg {
                flex-grow: 1;
                height: 20px;
                background: #eee;
                border-radius: 10px;
                overflow: hidden;
            }
            .bar-fill {
                height: 100%;
                background: #ff416c;
                width: 0%;
                transition: width 1s ease-out;
            }
            .retry-btn {
                padding: 0.8rem 2.5rem;
                font-size: 1.5rem;
                background: #eee;
                color: #555;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                font-family: 'Nanum Pen Script', cursive;
                transition: all 0.3s;
            }
            .retry-btn:hover {
                background: #ddd;
            }

            input[type="file"] {
                display: none;
            }
        </style>
        
        <div class="container" id="main-container">
            <h2>내 동물상 찾기</h2>
            
            <!-- Step 1: Start -->
            <div id="view-start" class="view-start">
                <div class="main-icon">🐶😸</div>
                <button class="start-btn" id="start-btn">사진 선택하고 시작하기</button>
            </div>

            <!-- Step 2: Loading -->
            <div id="view-loading" class="view-loading">
                <div class="loader"></div>
                <div style="font-size: 1.8rem;">분석 중입니다...</div>
            </div>

            <!-- Step 3: Result -->
            <div id="view-result" class="view-result">
                <img id="result-photo" class="result-photo" src="" alt="uploaded photo" />
                <div id="result-text" class="result-title"></div>
                <div id="bar-container" class="result-bar-container"></div>
                <button class="retry-btn" id="retry-btn">다시 하기</button>
            </div>

            <input type="file" id="file-input" accept="image/*" />
        </div>
        `;

        this.initEvents();
    }

    initEvents() {
        const startBtn = this.shadowRoot.getElementById('start-btn');
        const retryBtn = this.shadowRoot.getElementById('retry-btn');
        const fileInput = this.shadowRoot.getElementById('file-input');

        startBtn.addEventListener('click', () => fileInput.click());
        retryBtn.addEventListener('click', () => this.switchView('start'));
        fileInput.addEventListener('change', (e) => this.handleFile(e));
    }

    switchView(view) {
        const start = this.shadowRoot.getElementById('view-start');
        const loading = this.shadowRoot.getElementById('view-loading');
        const result = this.shadowRoot.getElementById('view-result');

        start.style.display = view === 'start' ? 'flex' : 'none';
        loading.style.display = view === 'loading' ? 'flex' : 'none';
        result.style.display = view === 'result' ? 'flex' : 'none';

        if (view === 'start') {
            this.shadowRoot.getElementById('file-input').value = '';
        }
    }

    async handleFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            this.switchView('loading');
            
            const img = new Image();
            img.src = e.target.result;
            img.onload = async () => {
                if (!this.model) await this.loadModel();
                
                // Show analysis feel
                await new Promise(r => setTimeout(r, 1500));
                this.analyze(img);
            };
        };
        reader.readAsDataURL(file);
    }

    async analyze(imgElement) {
        if (!this.model) {
            alert("서비스를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
            this.switchView('start');
            return;
        }

        const prediction = await this.model.predict(imgElement);
        const resultPhoto = this.shadowRoot.getElementById('result-photo');
        const resultText = this.shadowRoot.getElementById('result-text');
        const barContainer = this.shadowRoot.getElementById('bar-container');

        resultPhoto.src = imgElement.src;
        barContainer.innerHTML = '';

        let top = { className: '', probability: 0 };
        prediction.forEach(p => {
            if (p.probability > top.probability) top = p;

            const prob = (p.probability * 100).toFixed(0);
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `
                <div class="bar-label">${this.translate(p.className)}</div>
                <div class="bar-bg"><div class="bar-fill" style="width: ${prob}%"></div></div>
                <div style="width: 50px; font-size: 1.2rem;">${prob}%</div>
            `;
            barContainer.appendChild(row);
        });

        resultText.textContent = `당신은 '${this.translate(top.className)}' 입니다!`;
        this.switchView('result');
    }

    translate(label) {
        const map = { 'dog': '강아지상', 'cat': '고양이상' };
        return map[label.toLowerCase()] || label;
    }
}

customElements.define('animal-test', AnimalFaceTest);
