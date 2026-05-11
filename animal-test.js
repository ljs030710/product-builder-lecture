
class AnimalFaceTest extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.maxPredictions = 0;
        this.isModelLoading = false;

        // Teachable Machine URL
        this.URL = "./my_model/"; 
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
            }
            .upload-area:hover {
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
            }
            #file-input {
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
            .loading-text {
                margin-top: 1rem;
                font-size: 1.2rem;
                color: #666;
            }
            .result-message {
                margin-top: 1.5rem;
                font-size: 2rem;
                font-weight: bold;
                color: #2575fc;
                text-align: center;
            }
        </style>
        <div class="container">
            <h2>AI 동물상 테스트</h2>
            <div class="upload-area" id="upload-area">
                <div id="upload-prompt">
                    <div class="upload-icon">📸</div>
                    <div class="upload-text">사진을 업로드 해주세요</div>
                </div>
                <img id="preview-image" src="#" alt="your image" />
            </div>
            <input type="file" id="file-input" accept="image/*" />
            
            <div id="loading-text" class="loading-text" style="display: none;">AI가 분석 중입니다...</div>
            <div id="result-message" class="result-message"></div>
            <div id="label-container"></div>
        </div>
        `;

        this.initEvents();
    }

    initEvents() {
        const uploadArea = this.shadowRoot.getElementById('upload-area');
        const fileInput = this.shadowRoot.getElementById('file-input');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    async loadModel() {
        if (this.model) return;
        
        const loadingText = this.shadowRoot.getElementById('loading-text');
        loadingText.style.display = 'block';
        
        try {
            const modelURL = this.URL + "model.json";
            const metadataURL = this.URL + "metadata.json";
            this.model = await tmImage.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();
            loadingText.style.display = 'none';
        } catch (error) {
            console.error(error);
            loadingText.style.display = 'none';
            alert("모델 로드 실패: ./my_model/ 폴더를 확인해주세요.");
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Preview Image
        const reader = new FileReader();
        reader.onload = async (e) => {
            const previewImage = this.shadowRoot.getElementById('preview-image');
            const uploadPrompt = this.shadowRoot.getElementById('upload-prompt');
            
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadPrompt.style.display = 'none';

            await this.loadModel();
            if (this.model) {
                this.predict(previewImage);
            }
        };
        reader.readAsDataURL(file);
    }

    async predict(imageElement) {
        const loadingText = this.shadowRoot.getElementById('loading-text');
        loadingText.style.display = 'block';

        // small delay to show loading
        await new Promise(resolve => setTimeout(resolve, 500));

        const prediction = await this.model.predict(imageElement);
        const labelContainer = this.shadowRoot.getElementById("label-container");
        const resultMessage = this.shadowRoot.getElementById("result-message");
        
        labelContainer.innerHTML = '';
        loadingText.style.display = 'none';

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
