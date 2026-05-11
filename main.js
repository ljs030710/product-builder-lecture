
class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'wrapper');

        const title = document.createElement('h1');
        title.textContent = '로또 번호 생성기';

        const numbersContainer = document.createElement('div');
        numbersContainer.setAttribute('class', 'numbers-container');

        const button = document.createElement('button');
        button.textContent = '번호 생성';
        button.addEventListener('click', () => this.generateNumbers(numbersContainer));

        const style = document.createElement('style');
        style.textContent = `
            .wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(to right, #6a11cb, #2575fc);
                font-family: 'Nanum Pen Script', cursive;
                color: white;
                text-align: center;
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
                background-color: white;
                font-size: 2.5rem;
                font-weight: bold;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                transition: transform 0.2s;
            }
            .number:hover {
                transform: translateY(-5px);
            }
            button {
                padding: 1rem 2rem;
                border: none;
                border-radius: 50px;
                background-image: linear-gradient(to right, #ff416c, #ff4b2b);
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                font-family: 'Nanum Pen Script', cursive;
            }
            button:hover {
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                transform: translateY(-2px);
            }
            button:active {
                transform: translateY(1px);
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(title);
        wrapper.appendChild(numbersContainer);
        wrapper.appendChild(button);

        this.generateNumbers(numbersContainer);
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
