
class AnimalFaceTest extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.webcam = null;
        this.maxPredictions = 0;
        this.isModelLoading = false;
        this.isWebcamStarted = false;

        // Teachable Machine URL - Change this to your model URL
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
            #webcam-container {
                margin: 1rem 0;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                background: #eee;
                width: 200px;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            canvas {
                width: 100% !important;
                height: 100% !important;
            }
            #label-container {
                width: 100%;
                margin-top: 1.5rem;
            }
            .prediction-row {
                display: flex;
                align-items: center;
                margin-bottom: 0.8rem;
                gap: 1rem;
            }
            .label-name {
                width: 80px;
                font-size: 1.5rem;
                text-align: right;
            }
            .progress-bar {
                flex-grow: 1;
                height: 20px;
                background: #eee;
                border-radius: 10px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(to right, #ff416c, #ff4b2b);
                width: 0%;
                transition: width 0.2s ease;
            }
            .percent {
                width: 50px;
                font-size: 1.2rem;
                font-weight: bold;
            }
            .start-btn {
                padding: 1rem 3rem;
                font-size: 1.8rem;
                background: linear-gradient(to right, #6a11cb, #2575fc);
                color: white;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                font-family: 'Nanum Pen Script', cursive;
                transition: transform 0.2s, box-shadow 0.2s;
                margin-top: 1rem;
            }
            .start-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .start-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .loading-text {
                margin-top: 1rem;
                font-size: 1.2rem;
                color: #666;
            }
        </style>
        <div class="container">
            <h2>인공지능 동물상 테스트</h2>
            <div id="webcam-container">
                <span id="placeholder-text">카메라 대기 중...</span>
            </div>
            <button class="start-btn" id="start-btn">테스트 시작하기</button>
            <div id="loading-text" class="loading-text" style="display: none;">모델을 불러오는 중입니다...</div>
            <div id="label-container"></div>
        </div>
        `;

        this.shadowRoot.getElementById('start-btn').addEventListener('click', () => this.init());
    }

    async init() {
        const startBtn = this.shadowRoot.getElementById('start-btn');
        const loadingText = this.shadowRoot.getElementById('loading-text');
        const placeholder = this.shadowRoot.getElementById('placeholder-text');

        startBtn.disabled = true;
        loadingText.style.display = 'block';

        try {
            const modelURL = this.URL + "model.json";
            const metadataURL = this.URL + "metadata.json";

            this.model = await tmImage.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();

            const flip = true;
            this.webcam = new tmImage.Webcam(200, 200, flip);
            await this.webcam.setup();
            await this.webcam.play();
            
            loadingText.style.display = 'none';
            placeholder.style.display = 'none';
            this.shadowRoot.getElementById("webcam-container").appendChild(this.webcam.canvas);
            
            const labelContainer = this.shadowRoot.getElementById("label-container");
            for (let i = 0; i < this.maxPredictions; i++) {
                const row = document.createElement("div");
                row.className = "prediction-row";
                row.innerHTML = `
                    <div class="label-name"></div>
                    <div class="progress-bar"><div class="progress-fill"></div></div>
                    <div class="percent">0%</div>
                `;
                labelContainer.appendChild(row);
            }

            this.isWebcamStarted = true;
            window.requestAnimationFrame(() => this.loop());
        } catch (error) {
            console.error(error);
            alert("모델을 불러오는데 실패했습니다. './my_model/' 폴더에 model.json, metadata.json, weights.bin 파일이 있는지 확인해주세요.");
            startBtn.disabled = false;
            loadingText.style.display = 'none';
        }
    }

    async loop() {
        if (this.isWebcamStarted) {
            this.webcam.update();
            await this.predict();
            window.requestAnimationFrame(() => this.loop());
        }
    }

    async predict() {
        const prediction = await this.model.predict(this.webcam.canvas);
        const labelContainer = this.shadowRoot.getElementById("label-container");
        
        for (let i = 0; i < this.maxPredictions; i++) {
            const row = labelContainer.childNodes[i];
            const name = row.querySelector('.label-name');
            const fill = row.querySelector('.progress-fill');
            const percent = row.querySelector('.percent');

            const prob = (prediction[i].probability * 100).toFixed(0);
            name.textContent = this.translateLabel(prediction[i].className);
            fill.style.width = prob + "%";
            percent.textContent = prob + "%";
        }
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
