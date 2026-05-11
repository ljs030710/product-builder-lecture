
class AnimalFaceTest extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.maxPredictions = 0;
        // 모델 파일이 위치한 폴더 경로 (GitHub에 올릴 폴더 이름과 일치해야 함)
        this.URL = "./my_model/"; 
    }

    connectedCallback() {
        this.render();
        this.loadModel(); // 접속 시 자동으로 모델 로드
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
            .select-btn {
                margin-top: 1.5rem;
                padding: 0.8rem 2rem;
                font-size: 1.5rem;
                background: linear-gradient(to right, #6a11cb, #2575fc);
                color: white;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                font-family: 'Nanum Pen Script', cursive;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
            .status-text {
                margin-top: 1rem;
                font-size: 1.2rem;
                color: #666;
            }
            .result-message {
                margin-top: 1.5rem;
                font-size: 2.2rem;
                font-weight: bold;
                color: #2575fc;
                text-align: center;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
        </style>
        <div class="container">
            <h2>AI 동물상 테스트</h2>
            <div id="status-text" class="status-text">모델을 준비 중입니다...</div>
            
            <div class="upload-area" id="upload-area">
                <div id="upload-prompt">
                    <div class="upload-icon">📸</div>
                    <div class="upload-text">사진을 드래그하거나 클릭하세요</div>
                </div>
                <img id="preview-image" src="#" alt="your image" />
            </div>
            
            <button class="select-btn" id="select-btn">사진 선택하기</button>
            <input type="file" id="file-input" accept="image/*, .jpg, .jpeg, .png" />
            
            <div id="result-message" class="result-message"></div>
            <div id="label-container"></div>
        </div>
        `;

        this.initEvents();
    }

    initEvents() {
        const uploadArea = this.shadowRoot.getElementById('upload-area');
        const selectBtn = this.shadowRoot.getElementById('select-btn');
        const fileInput = this.shadowRoot.getElementById('file-input');

        const triggerUpload = () => fileInput.click();
        
        uploadArea.addEventListener('click', triggerUpload);
        selectBtn.addEventListener('click', triggerUpload);
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    async loadModel() {
        const statusText = this.shadowRoot.getElementById('status-text');
        try {
            const modelURL = this.URL + "model.json";
            const metadataURL = this.URL + "metadata.json";
            
            this.model = await tmImage.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();
            statusText.textContent = "✅ AI가 준비되었습니다! 사진을 올려주세요.";
            statusText.style.color = "#4caf50";
        } catch (error) {
            console.error(error);
            statusText.innerHTML = `
                <span style="color: #f44336;">❌ 모델 파일을 찾을 수 없습니다.</span><br>
                <small>개발자님: 'my_model' 폴더에 model.json, weights.bin 파일이 있는지 확인해주세요.</small>
            `;
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file || !this.model) return;

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
        statusText.textContent = "AI가 분석 중...";

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
