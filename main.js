
class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'wrapper');

        const themeToggle = document.createElement('button');
        themeToggle.setAttribute('class', 'theme-toggle');
        themeToggle.textContent = '🌓 테마 변경';
        themeToggle.addEventListener('click', () => this.toggleTheme());

        const title = document.createElement('h1');
        title.textContent = '로또 번호 생성기';

        const numbersContainer = document.createElement('div');
        numbersContainer.setAttribute('class', 'numbers-container');

        const button = document.createElement('button');
        button.setAttribute('class', 'generate-btn');
        button.textContent = '번호 생성';
        button.addEventListener('click', () => this.generateNumbers(numbersContainer));

        const formContainer = document.createElement('div');
        formContainer.setAttribute('class', 'form-container');
        formContainer.innerHTML = `
            <div class="divider"></div>
            <h2>제휴 문의</h2>
            <form action="https://formspree.io/f/xnjwlnvg" method="POST">
                <input type="text" name="name" placeholder="성함 / 업체명" required>
                <input type="email" name="_replyto" placeholder="이메일 주소" required>
                <textarea name="message" placeholder="문의 내용을 입력해주세요" required></textarea>
                <button type="submit" class="submit-btn">문의 보내기</button>
            </form>
        `;

        const style = document.createElement('style');
        style.textContent = `
            :host {
                --bg-color: linear-gradient(to right, #6a11cb, #2575fc);
                --text-color: white;
                --number-bg: white;
                --btn-shadow: rgba(0,0,0,0.2);
                --input-bg: rgba(255, 255, 255, 0.9);
                --input-text: #333;
            }
            :host([theme="dark"]) {
                --bg-color: #1a1a1a;
                --text-color: #f0f0f0;
                --number-bg: #333;
                --btn-shadow: rgba(255,255,255,0.1);
                --input-bg: #2a2a2a;
                --input-text: #f0f0f0;
            }
            :host([theme="light"]) {
                --bg-color: #f7f7f7;
                --text-color: #333;
                --number-bg: white;
                --btn-shadow: rgba(0,0,0,0.1);
                --input-bg: white;
                --input-text: #333;
            }
            .wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: var(--bg-color);
                color: var(--text-color);
                font-family: 'Nanum Pen Script', cursive;
                text-align: center;
                transition: background 0.3s ease, color 0.3s ease;
                position: relative;
                padding: 4rem 1rem;
                box-sizing: border-box;
            }
            .theme-toggle {
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 0.5rem 1rem;
                font-size: 1rem;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid var(--text-color);
                color: var(--text-color);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Nanum Pen Script', cursive;
            }
            .theme-toggle:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            h1 {
                font-family: 'East Sea Dokdo', cursive;
                font-size: 6rem;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .numbers-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                margin-bottom: 2rem;
                gap: 1rem;
            }
            .number {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background-color: var(--number-bg);
                font-size: 2.5rem;
                font-weight: bold;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                transition: transform 0.2s, background-color 0.3s ease;
            }
            .number:hover {
                transform: translateY(-5px);
            }
            .generate-btn {
                padding: 1rem 2rem;
                border: none;
                border-radius: 50px;
                background-image: linear-gradient(to right, #ff416c, #ff4b2b);
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 5px 15px var(--btn-shadow);
                transition: all 0.3s ease;
                font-family: 'Nanum Pen Script', cursive;
                margin-bottom: 3rem;
            }
            .generate-btn:hover {
                box-shadow: 0 8px 25px var(--btn-shadow);
                transform: translateY(-2px);
            }
            
            .form-container {
                width: 100%;
                max-width: 400px;
                margin-top: 2rem;
            }
            .divider {
                height: 1px;
                background: var(--text-color);
                opacity: 0.3;
                width: 100%;
                margin-bottom: 2rem;
            }
            h2 {
                font-size: 2.5rem;
                margin-bottom: 1.5rem;
                font-family: 'East Sea Dokdo', cursive;
            }
            form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            input, textarea {
                padding: 0.8rem;
                border-radius: 10px;
                border: 1px solid rgba(0,0,0,0.1);
                background: var(--input-bg);
                color: var(--input-text);
                font-family: 'Nanum Pen Script', cursive;
                font-size: 1.2rem;
            }
            textarea {
                height: 100px;
                resize: none;
            }
            .submit-btn {
                padding: 0.8rem;
                border: none;
                border-radius: 10px;
                background: #2575fc;
                color: white;
                font-size: 1.3rem;
                cursor: pointer;
                font-family: 'Nanum Pen Script', cursive;
                transition: opacity 0.3s;
            }
            .submit-btn:hover {
                opacity: 0.9;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(themeToggle);
        wrapper.appendChild(title);
        wrapper.appendChild(numbersContainer);
        wrapper.appendChild(button);
        wrapper.appendChild(formContainer);

        this.initTheme();
        this.generateNumbers(numbersContainer);
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'default';
        if (savedTheme !== 'default') {
            this.setAttribute('theme', savedTheme);
        }
    }

    toggleTheme() {
        const currentTheme = this.getAttribute('theme');
        let nextTheme;

        if (!currentTheme) {
            nextTheme = 'dark';
        } else if (currentTheme === 'dark') {
            nextTheme = 'light';
        } else {
            nextTheme = 'default';
        }

        if (nextTheme === 'default') {
            this.removeAttribute('theme');
        } else {
            this.setAttribute('theme', nextTheme);
        }
        localStorage.setItem('theme', nextTheme);
    }

    getColor(number) {
        const colors = {
            yellow: '#f1c40f',
            blue: '#3498db',
            red: '#e74c3c',
            grey: '#95a5a6',
            green: '#2ecc71'
        };
        if (number <= 10) return colors.yellow;
        if (number <= 20) return colors.blue;
        if (number <= 30) return colors.red;
        if (number <= 40) return colors.grey;
        return colors.green;
    }

    generateNumbers(container) {
        container.innerHTML = '';
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }

        for (const number of [...numbers].sort((a, b) => a - b)) {
            const numberElement = document.createElement('div');
            numberElement.setAttribute('class', 'number');
            numberElement.textContent = number;
            numberElement.style.color = this.getColor(number);
            container.appendChild(numberElement);
        }
    }
}

customElements.define('lotto-generator', LottoGenerator);
