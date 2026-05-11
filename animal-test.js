
class AnimalFaceTest extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.maxPredictions = 0;
        
        this.modelFile = null;
        this.weightsFile = null;
        this.metadataFile = null;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                font-family: 'Nanum Pen Script', cursive;
                color: var(--text-color, #333);
            }
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                max-width: 600px;
                margin: 0 auto;
                background: var(--number-bg, white);
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h2 {
                font-family: 'East Sea Dokdo', cursive;
                font-size: 3.5rem;
                margin: 0 0 1.5rem 0;
                color: #ff416c;
            }
            .setup-section {
                width: 100%;
                padding: 1rem;
                border: 2px solid #eee;
                border-radius: 15px;
                margin-bottom: 2rem;
                text-align: center;
            }
            .setup-title {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: #666;
            }
            .btn-group {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .action-btn {
                padding: 0.8rem 1.5rem;
                font-size: 1.2rem;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-family: 'Nanum Pen Script', cursive;
                transition: all 0.2s;
            }
            .select-btn {
                background: #f0f0f0;
                color: #333;
            }
            .select-btn.ready {
                background: #e1f5fe;
                color: #0288d1;
                border: 1px solid #0288d1;
            }
            .load-btn {
                background: #4caf50;
                color: white;
            }
            .load-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .upload-area {
                width: 100%;
                max-width: 300px;
                height: 300px;
                border: 3px dashed #ccc;
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
                background: #f9f9f9;
                margin-top: 1rem;
            }
            .upload-area.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .upload-area:not(.disabled):hover {
                border-color: #ff416c;
                background: #fff0f3;
            }
            .upload-area img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: none;
            }
            .upload-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .upload-text {
                font-size: 1.5rem;
                color: #666;
                padding: 0 1rem;
            }
            #image-input, #model-input {
                display: none;
            }
            #label-container {
                width: 100%;
                margin-top: 2rem;
            }
            .prediction-row {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
                gap: 1rem;
            }
            .label-name {
                width: 80px;
                font-size: 1.5rem;
                text-align: right;
            }
            .progress-bar {
                flex-grow: 1;
                height: 24px;
                background: #eee;
                border-radius: 12px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(to right, #ff416c, #ff4b2b);
                width: 0%;
                transition: width 0.5s ease-out;
            }
            .percent {
                width: 60px;
                font-size: 1.3rem;
                font-weight: bold;
            }
            .status-text {
                margin-top: 1rem;
                font-size: 1.2rem;
                color: #2575fc;
                font-weight: bold;
            }
            .result-message {
                margin-top: 1.5rem;
                font-size: 2rem;
                font-weight: bold;
                color: #ff416c;
                text-align: center;
            }
            .file-status {
                font-size: 0.9rem;
                color: #888;
                margin-top: 0.5rem;
            }
        </style>
        <div class="container">
            <h2>AI 동물상 테스트</h2>
            
            <div class="setup-section">
                <div class="setup-title">1. AI 모델 파일 선택하기 (Teachable Machine에서 다운로드한 3개 파일)</div>
                <div class="btn-group">
                    <button class="action-btn select-btn" id="select-model-btn">📁 파일 선택</button>
                    <button class="action-btn load-btn" id="load-model-btn" disabled>⚙️ 모델 불러오기</button>
                </div>
                <div class="file-status" id="file-status">선택된 파일 없음 (model.json, metadata.json, weights.bin 필요)</div>
                <input type="file" id="model-input" multiple accept=".json,.bin" />
            </div>

            <div class="setup-title">2. 분석할 사진 업로드</div>
            <div class="upload-area disabled" id="upload-area">
                <div id="upload-prompt">
                    <div class="upload-icon">📸</div>
                    <div class="upload-text">먼저 모델을 불러와주세요</div>
                </div>
                <img id="preview-image" src="#" alt="your image" />
            </div>
            <input type="file" id="image-input" accept="image/*, .jpg, .jpeg, .png" />
            
            <div id="status-text" class="status-text"></div>
            <div id="result-message" class="result-message"></div>
            <div id="label-container"></div>
        </div>
        `;

        this.initEvents();
    }

    initEvents() {
        const selectModelBtn = this.shadowRoot.getElementById('select-model-btn');
        const loadModelBtn = this.shadowRoot.getElementById('load-model-btn');
        const modelInput = this.shadowRoot.getElementById('model-input');
        const uploadArea = this.shadowRoot.getElementById('upload-area');
        const imageInput = this.shadowRoot.getElementById('image-input');

        selectModelBtn.addEventListener('click', () => modelInput.click());
        modelInput.addEventListener('change', (e) => this.handleModelFiles(e));
        
        loadModelBtn.addEventListener('click', () => this.loadModelFromFiles());

        uploadArea.addEventListener('click', () => {
            if (!this.model) {
                alert("먼저 모델 파일을 선택하고 '모델 불러오기' 버튼을 눌러주세요.");
                return;
            }
            imageInput.click();
        });
        
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    handleModelFiles(event) {
        const files = Array.from(event.target.files);
        this.modelFile = files.find(f => f.name === 'model.json');
        this.weightsFile = files.find(f => f.name === 'weights.bin');
        this.metadataFile = files.find(f => f.name === 'metadata.json');

        const status = this.shadowRoot.getElementById('file-status');
        const loadBtn = this.shadowRoot.getElementById('load-model-btn');
        const selectBtn = this.shadowRoot.getElementById('select-model-btn');

        if (this.modelFile && this.weightsFile && this.metadataFile) {
            status.textContent = "✅ 모든 파일 준비 완료!";
            status.style.color = "#4caf50";
            loadBtn.disabled = false;
            selectBtn.classList.add('ready');
        } else {
            status.textContent = "❌ 필수 파일이 부족합니다 (model.json, weights.bin, metadata.json)";
            status.style.color = "#f44336";
            loadBtn.disabled = true;
            selectBtn.classList.remove('ready');
        }
    }

    async loadModelFromFiles() {
        const statusText = this.shadowRoot.getElementById('status-text');
        const uploadArea = this.shadowRoot.getElementById('upload-area');
        const uploadText = this.shadowRoot.querySelector('.upload-text');
        
        statusText.textContent = "모델 로딩 중...";
        
        try {
            // Teachable Machine API expects files as a special load function
            this.model = await tmImage.loadFromFiles(this.modelFile, this.weightsFile, this.metadataFile);
            this.maxPredictions = this.model.getTotalClasses();
            
            statusText.textContent = "✅ 모델 로드 성공! 이제 사진을 업로드하세요.";
            uploadArea.classList.remove('disabled');
            uploadText.textContent = "사진을 업로드 해주세요";
            
            this.shadowRoot.getElementById('load-model-btn').disabled = true;
            this.shadowRoot.getElementById('select-model-btn').disabled = true;
        } catch (error) {
            console.error(error);
            statusText.textContent = "❌ 모델 로드 실패. 파일을 다시 확인해주세요.";
            alert("모델 로드에 실패했습니다. 올바른 Teachable Machine 파일인지 확인해주세요.");
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const previewImage = this.shadowRoot.getElementById('preview-image');
            const uploadPrompt = this.shadowRoot.getElementById('upload-prompt');
            
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadPrompt.style.display = 'none';

            this.predict(previewImage);
        };
        reader.readAsDataURL(file);
    }

    async predict(imageElement) {
        const statusText = this.shadowRoot.getElementById('status-text');
        statusText.textContent = "AI 분석 중...";

        // small delay to show loading
        await new Promise(resolve => setTimeout(resolve, 500));

        const prediction = await this.model.predict(imageElement);
        const labelContainer = this.shadowRoot.getElementById("label-container");
        const resultMessage = this.shadowRoot.getElementById("result-message");
        
        labelContainer.innerHTML = '';
        statusText.textContent = "분석 완료!";

        let topPrediction = { className: '', probability: 0 };

        for (let i = 0; i < this.maxPredictions; i++) {
            const prob = prediction[i].probability;
            if (prob > topPrediction.probability) {
                topPrediction = prediction[i];
            }

            const row = document.createElement("div");
            row.className = "prediction-row";
            const percentVal = (prob * 100).toFixed(0);
            
            row.innerHTML = `
                <div class="label-name">${this.translateLabel(prediction[i].className)}</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${percentVal}%"></div></div>
                <div class="percent">${percentVal}%</div>
            `;
            labelContainer.appendChild(row);
        }

        resultMessage.textContent = `당신은 ${this.translateLabel(topPrediction.className)} 입니다!`;
    }

    translateLabel(label) {
        const translations = {
            'dog': '강아지상',
            'cat': '고양이상'
        };
        return translations[label.toLowerCase()] || label;
    }
}

customElements.define('animal-test', AnimalFaceTest);
