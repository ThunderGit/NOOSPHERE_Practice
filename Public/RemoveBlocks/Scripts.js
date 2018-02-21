    'use strict'

    var blocksCount = 150; //Количество кубиков на доске
    var points = 0; //Кол-во очков игрока
    var seconds = 60; //Время (в секундах)

    var NamelessPlayerCount = 0; //Количество безымянных игроков
    var Color = ["red", "green", "blue", "gold", "magenta"]; //Цвета кубиков
    var Removed = new Array(); //Массив "убранных кубиков"

    function GetRecord()//Получить Список рекордов 
    {
        var TableResult = document.getElementById("record");
        TableResult.innerHTML = "<u><b>Result Table</b></u><br/>";
        var xhr = new XMLHttpRequest();

        xhr.open("GET", '/ResultsREC.txt');
        //xhr.setRequestHeader('Content-Type', 'application/JSON')
        xhr.onreadystatechange = function() {
            if (this.readyState != 4) return;
            TableResult.innerHTML += this.responseText;
        };

        xhr.send();
    }

    function Start() //Начало Игры
    {

        var StartPause = document.getElementById("start");

        if (StartPause.value == "Start") // Старт
        {

            GetRecord();

            StartPause.value = "Pause";
            var gameField = document.getElementById('field_id');
            for (var i = 0; i < 150; i++) //Создаём кубики
            {
                var newBlock = document.createElement('button');
                newBlock.id = "block" + (i + 1);
                newBlock.onclick = function() {
                    IncPoints(this.id);
                };
                newBlock.style.backgroundColor = Color[Math.round(Math.random() * 4)];
                newBlock.style.width = "50px";
                newBlock.style.height = "50px";
                newBlock.style.border = "2px solid black";
                newBlock.style.fontWeight = "bold";
                newBlock.style.outline = "none";
                newBlock.style.float = "left";
                gameField.appendChild(newBlock);
            }
            seconds = 60; //Устанавливаем время
            TIMER(); // Включаем таймер
        }
         else 
        {
            if (StartPause.value == "Resume") // Продолжить
            {
                StartPause.value = "Pause";
            } else // Пауза
            {
                StartPause.value = "Resume";
            }
        }
    }

    function IncPoints(id) //Нажатие на кубик
    {
        var blockColor = document.getElementById(id);
        var btn = document.getElementById("start").value;
        var counter = document.getElementById("timer");
        // Добавление очков

        if (blockColor.style.backgroundColor != "white" && btn != "Resume" && seconds >= 0) {
            switch (blockColor.style.backgroundColor) {
                case "red":
                    points += 1;
                    break;
                case "magenta":
                    points += 2;
                    break;
                case "green":
                    points += 5;
                    break;
                case "blue":
                    points += 10;
                    break;
                case "gold":
                    points += 20;
                    break;
                default:
                    break;
            }
            document.getElementById("pts").value = points;
            --blocksCount;
            //Проверка надписи на кубиках 

            if (blockColor.innerHTML != "") {
                seconds += parseInt(blockColor.innerHTML);
                blockColor.innerHTML = "";
                if (blockColor.innerHTML != "0") {
                    counter.value = (seconds / 60 < 10 ? "0" : "") + String(parseInt(seconds / 60)) + ":" +
                        (seconds % 60 < 10 ? "0" : "") + String(seconds % 60);
                }

                if (seconds < 5 && blockColor.innerHTML.includes("-") == true) //Когда кол-во отнимаемых секунд больше чем оставшееся время
                {
                    counter.value = "00:00";
                }
            }

            blockColor.style.backgroundColor = "white";
            blockColor.style.border = "2px solid white";

            Removed.push(id);

        }
    }

    function NewGame() //Новая игра
    {
        for (var i = 0; i < 150; i++) // Очищаем игровое поле
        {
            document.getElementById("block" + (i + 1)).parentNode.removeChild(document.getElementById("block" + (i + 1)));
        }

        // Устанавливаем начальные значения
        blocksCount = 150;
        seconds = -1;
        document.getElementById("start").disabled = false;
        document.getElementById("timer").value = "01:00";
        document.getElementById("start").value = "Start";
        document.getElementById("pts").value = points = 0;
        var TableResult = document.getElementById("record");
        TableResult.innerHTML = "<u><b>Result Table</b></u><br/>";
    }

    function TIMER() //Таймер 
    {
        var StartPause = document.getElementById("start");
        var __NewGame = document.getElementById("_NewGame");  

        var gameOverDiv = document.getElementById("EnterName");
        var score = document.getElementById("result");

        function tick() 
        {
            var counter = document.getElementById("timer");

            if (seconds > 0 && StartPause.value == "Pause") // Обратный отсчёт
            {
                seconds--;
                counter.value = (seconds / 60 < 10 ? "0" : "") + String(parseInt(seconds / 60)) + ":" + (seconds % 60 < 10 ? "0" : "") +
                    String(seconds % 60);
            }

            if (seconds > 0) // Обратный отсчёт, если время не закончилось
            {
                setTimeout(tick, 1000);
            }

            if(seconds==0)//Конец игры (Время вышло)
            {
            	StartPause.disabled = true;
            	seconds = -1;
                score.innerHTML = "Your score: " + (points);
                gameOverDiv.style.visibility = "visible";
            }
            if (blocksCount == 0) // Конец игры (Кубики закончились раньше времени)
            {
                StartPause.disabled = true;
                __NewGame.disabled = true;
                points+=seconds;
                seconds = -1;
                ++points;
                score.innerHTML = "Your score: " + (points-1);

                gameOverDiv.style.visibility = "visible";
            }

            if (seconds % 4 == 0 && Removed.length >= 2 && StartPause.value == "Pause") // Добавление новых кубиков во время игры
            {

                for (var i = 0; i < Math.round(Math.random() * 2); i++) 
                {
                    var ind = Math.round(Math.random() * Removed.length);
                    var blockColor = document.getElementById(Removed[ind]);
                    if (blockColor.style.backgroundColor == "white") 
                    {
                        blockColor.style.backgroundColor = Color[Math.round(Math.random() * 4)];
                        blockColor.style.border = "2px solid black";
                        Removed.splice(ind, 1);
                        ++blocksCount;
                        if (Math.round(Math.random() * 1) == 1)
                        {
                            blockColor.innerHTML = Math.round(Math.random() * 10) - 5;
                        }

                    }

                }

            }
        }

        if (seconds > 0) // Обратный отсчёт, если время не закончилось
        {
            tick();
        }
    }

    function SetName() //Записать игрока в таблицу результатов
    {
        var gameOverDiv = document.getElementById("EnterName");
        var TableResult = document.getElementById("record");
        var PlayerName = document.getElementById("YourNameText");
        var score = document.getElementById("result");
        var __NewGame=document.getElementById("_NewGame");
        if (PlayerName.value == "") {
            PlayerName.value = "Player" + (++NamelessPlayerCount);
        }


        TableResult.innerHTML += PlayerName.value + ": " + (points--) + "<br/> ";
        
        SetData(PlayerName.value, points);
        //GetRecord();
        //Вернуть начальные настройки
        __NewGame.disabled=false;
        TableResult.innerHTML = "<u><b>Result Table</b></u><br/>";
        gameOverDiv.style.visibility = "hidden";
        PlayerName.value = "";
        score.innerHTML = "Your score: ";
        counter.value = "01:00";
    }

    function SetData(NAME, points) //Записать новый результат
    {

        var xhr = new XMLHttpRequest();


        var body = JSON.stringify({
            "name": NAME,
            "pts": points
        });

        xhr.open("POST", '/');

        xhr.setRequestHeader('Content-Type', 'application/JSON')

        xhr.onreadystatechange = function() {
            if (this.readyState != 4) return;

            console.log(this);
        };

        xhr.send(body);
        
    };

    function AboutGame() //Переход к описанию игры
    {
        var forma = document.getElementById('forma');
        forma.action = "/public/RemoveBlocks/About.html";
    }
