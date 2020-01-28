// Нужно реализовать игру в крестики-нолики.
// В игру можно зайти, написав свой никнейм. Далее начинаются бесконечные игры с компьютером,
// ведётся статистика по победам и поражениям.
// Поле должно быть реализовано на canvas холсте.
// Статистика, авторизации и все дополнительное - на ReactJS.

class TicTacToe {
    constructor() {
        // Канвас и его метод отрисовки
        this.canvas = document.querySelector(`canvas`);
        this.ctx = this.canvas.getContext(`2d`);
        // Размер блоков
        this.size = (this.canvas.width / 3);
        // Счётчик ходов
        this.stepCounter = 0;
        // Имя игрока
        this.player = '';
        // Счётчики побед
        this.playerWinCount = 0;
        this.aiWinCount = 0;
        // Таблица
        this.table = document.querySelector(`.result table`);
        // Блок блокирующий игру
        this.blockDiv = document.querySelector(`.blocked-box`);
        // Сначала спросим как зовут игрока
        this.writePlayerName();
    }

    writePlayerName() {
        // Блок с формой
        const enterNameDiv = document.querySelector(`.enter-nickname`);
        // Форма
        const form = enterNameDiv.querySelector(`form`);
        // Абзац под таблицей в которой ведется подсчёт побед
        const playerName = document.querySelector(`.player-name`);

        form.onsubmit = e => {
                e.preventDefault();
                // Если введен ник, то записать его, если нет то написать "Игрок"
                this.player = form.children[0].value ? form.children[0].value : `Игрок`;
                // Записать имя под таблицей
                playerName.textContent = this.player;
                // Записать имя в thead
                this.table.querySelector(`th`).textContent = this.player;
                // Затем скрыть форму
                enterNameDiv.classList.add(`hide-form`);
                // После окончания анимации разблокируется игра
                setTimeout(() => this.blockDiv.classList.add(`hide`), 300)
            }
            // Затем создаю блоки и рисую поле
        this.makeBlocks();
    }

    // Отрисовываем клетку
    makeBlocks() {
        // Отрисовать линии
        const drawLines = (mX, mY, lX, lY) => {
            this.ctx.beginPath();
            this.ctx.moveTo(mX, mY);
            this.ctx.lineTo(lX, lY);
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = `#fff`;
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // Верхние строки, средние и нижние
        const topRow = [];
        const middleRow = [];
        const bottomRow = [];

        // В массивы забить верхние строки с блоками, средние и нижние
        // с их координатами и свойством isFull
        // isFull означает заполнен блок или нет и чем заполнен
        const makeBlock = (arr, n, sY, eY, row) => {
            arr.push({
                startX: n * this.size,
                startY: sY,
                endX: this.size * (n + 1),
                endY: this.size * eY,
                isFull: false,
                row: row
            })
        }


        for (let i = this.size, j = 0; i <= this.canvas.width; i += this.size, j++) {
            // Заполняю блоки координатами
            makeBlock(topRow, j, 0, 1, `top`);
            makeBlock(middleRow, j, this.size, 2, `middle`);
            makeBlock(bottomRow, j, this.size * 2, 3, `bottom`);

            // Рисую линии
            if (i < this.canvas.width) {
                drawLines(i, 0, i, this.canvas.height)
                drawLines(0, i, this.canvas.width, i);
            }
        }

        // Распаковать массивы в один большой массив
        this.blocks = [...topRow, ...middleRow, ...bottomRow];
        // Запустить игру
        this.game();
    }

    game() {
        // Функция записи хода
        const writeXorO = (element, color, xo) => {
            this.ctx.font = `125px Arial`;
            this.ctx.textAlign = `center`;
            this.ctx.fillStyle = color;
            this.ctx.fillText(xo, element.startX + this.size / 2, element.endY - this.size / 4);
            // Записать в свойтве объекта строку с ходом X или O
            element.isFull = xo;
        }

        // Ход компьютера
        const aiStep = () => {
            // Случайное число от нуля до длины массива с блоками
            // Служит индексом для массива this.blocks
            let rand = Math.floor(Math.random() * this.blocks.length);

            // Выйти из функции если счетчик больше или равен 9 
            if (this.stepCounter >= 9) return;
            // Если свойство isfull рандомно взятого объекта из функции равен false
            // Прибавить к счетчику 1 и записать нолик в блок
            // Вызывать функцию проверки победителя
            else if (!this.blocks[rand].isFull) {
                ++this.stepCounter;
                writeXorO(this.blocks[rand], `lightblue`, `O`);
                this.checkWhoWon(this.blocks[rand]);
            }
            // Иначе заново запустить эту функцию
            else aiStep();
        }

        // Ход игрока
        // На клике по канвасу отследить координаты мыши и записать крест в блок
        this.canvas.onclick = e => {
            let cX = e.clientX - Math.floor(this.canvas.getBoundingClientRect().x);
            let cY = e.clientY - Math.floor(this.canvas.getBoundingClientRect().y);

            this.blocks.forEach(elem => {
                // Если курсор попал в координаты одного из блоков
                // Записать в этом блоке Х
                // Затем вызвать функцию с ходом компьютера 
                if (cX >= elem.startX && cX <= elem.endX &&
                    cY >= elem.startY && cY <= elem.endY) {
                    if (!elem.isFull) {
                        ++this.stepCounter;
                        writeXorO(elem, `red`, `X`);
                        aiStep();
                        this.checkWhoWon(elem)
                    }
                }
            });
        }
    }

    checkWhoWon(who) {
            // Выигрышные линии
            const winLines = [
                // По горизонтали
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                // По вертикали
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                // По диагонали
                [0, 4, 8],
                [2, 4, 6]
            ];

            // Узнать победа или нет
            let win = false;
            for (let i = 0; i < winLines.length; i++) {
                // Деструктурирую двумерный массив winPos
                // Даю им значения из элементов массивов
                const [a, b, c] = winLines[i];
                // Если свойства isFull объектов из массива this.blocks под индексами из переменных a,b,с
                // равны друг другу - показать победителя
                // console.log(this.stepCounter > 8, `step`)
                // console.log(this.blocks[a].isFull, this.blocks[b].isFull, this.blocks[c].isFull, who.isFull)
                if (this.stepCounter < 10 && this.blocks[a].isFull === who.isFull &&
                    this.blocks[b].isFull === who.isFull &&
                    this.blocks[c].isFull === who.isFull) {
                    // Если Х то игрок победил, если О то копьютер
                    who.isFull === `X` ? this.writeWinnerAndResetGame(`&#xf021;`, `&#xef16`, 1, 0) :
                        this.writeWinnerAndResetGame(`&#xef16`, `&#xf021;`, 0, 1);
                    win = true;
                    break;
                }
            }

            // Если остался последний шаг и переменная win == false
            // То ничья
            if (this.stepCounter >= 9 && !win) {
                console.log(`Ничья`);
                this.writeWinnerAndResetGame(`&#xef16`, `&#xef16`, 0, 0);
            }
        }
        // Записать победителя
    writeWinnerAndResetGame(pWin, aiWin, playerCount, aiCount) {
        // Сбросить игру
        const resetGame = () => {
            // Через 500 миллисекунд очистить канвас
            // Сбросить счётчик ходов
            // Убрать ничью 
            // Обновить массив и отрисовать линии
            setTimeout(() => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                this.stepCounter = 0;
                this.makeBlocks();
            }, 500)
        }

        const total = document.querySelectorAll(`.win-count`);
        // Записать победителя в таблицу
        // Увеличить счётчик под ней
        // Затем сбросить игру
        const newRow = document.createElement(`tr`);
        const playerTd = document.createElement('td');
        const aiTd = document.createElement('td');
        playerTd.innerHTML = pWin;
        aiTd.innerHTML = aiWin;
        newRow.appendChild(playerTd);
        newRow.appendChild(aiTd);
        this.table.querySelector(`tbody`).append(newRow);
        this.playerWinCount += playerCount;
        this.aiWinCount += aiCount;
        total[0].textContent = this.playerWinCount;
        total[1].textContent = this.aiWinCount;
        resetGame();
    }
}
new TicTacToe();