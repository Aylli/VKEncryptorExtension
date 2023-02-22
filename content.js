// ------------------------------- Переменные ----------------------------
var keyLen = 256;

// --------------------------------- Функции -----------------------------

// Рисуем кнопку шифровки
function drawButton() {
	let cont = document.querySelectorAll('.im_chat-input--buttons')[0];
	if(document.querySelector('#encryptButton')==null) {
		let button = document.createElement('button');
		button.id = 'encryptButton';
		button.innerHTML = 'Зашифровать';
		button.onclick = () => {
			// Алгоритм шифровки
			// Проверяем, есть ли данные о данном пользователе
			if(localStorage.getItem(localStorage['ID'])==null) {
				// Если данных нет

				// Открываем окно настроек
				let setting = document.createElement('div');
				setting.style.position = 'fixed';
				setting.style.width = '340px';
				setting.style.display = 'flex';
				setting.style.flexDirection = 'column';
				setting.style.top = '80px';
				setting.style.right = '20px';
				setting.style.zIndex = '999999999999999';
				// Закидываем в окно необходимые объекты
				let fb = document.createElement('input');
				fb.id = 'fb';
				let sb = document.createElement('input');
				sb.id = 'sb';
				let A = document.createElement('input');
				A.id = 'A';
				let B = document.createElement('input');
				B.id = 'B';

				// Готовим числа
				// секретное а
				localStorage.setItem('secretA', rand(5000, 500000));
				while(!isPrime(localStorage.getItem('secretA')))
					localStorage['secretA']++;

				// Открытые A и B
				A.value = rand(5000, 500000);
				while(!isPrime(A.value))
					A.value++;
				B.value = rand(5000, 500000);
				while(!isPrime(B.value))
					B.value++;

				// Кнопка генерации b
				let genb = document.createElement('button');
				genb.innerHTML = 'Сгенерировать b';
				genb.onclick = () => {
					if(isNaN(A.value)) { alert("A - не число"); return; }
					if(!isPrime(Number.parseInt(A.value))) { alert("A - составное число"); return; }

					if(isNaN(B.value)) { alert("B - не число"); return; }
					if(!isPrime(Number.parseInt(B.value))) { alert("B - составное число"); return; }

					fb.value = (BigInt(Number.parseInt(A.value)) ** BigInt(localStorage.getItem('secretA'))) % BigInt(Number.parseInt(B.value));
				};

				// Кнопка применить
				let applyButton = document.createElement('button');
				applyButton.innerHTML = 'Применить';
				applyButton.onclick = () => {
					if(isNaN(sb.value)) { alert("b собеседника - не число"); return; }
					let key = (BigInt(Number.parseInt(sb.value)) ** BigInt(localStorage.getItem('secretA'))) % BigInt(Number.parseInt(B.value));
					localStorage[localStorage['ID']] = JSON.stringify({"secretA": localStorage['secretA'],
							"A": A.value, "B": B.value, 
							"fb": fb.value, "sb": sb.value,
							"generalKey": Number(key)});
					setting.remove();
				};

				// Кнопка отменить
				let cancelButton = document.createElement('button');
				cancelButton.innerHTML = 'Отменить';
				cancelButton.onclick = () => {
					setting.remove();
				};

				// Добавляем элементы на форму
				setting.append(A);
				setting.append(B);
				setting.append(genb);
				setting.append(fb);
				setting.append(sb);
				setting.append(applyButton);
				setting.append(cancelButton);
				document.body.append(setting);

			} else {
				// Если есть данные о пользователе

				// Получаем текст сообщения
				let str = document.querySelectorAll('.im_editable')[0].innerHTML;
				// Получаем число сдвига
				let key = +JSON.parse(localStorage[localStorage['ID']])["generalKey"];
				let res = ''; // Строка с результатом
				str.split('').forEach((char) => {
					res += String.fromCharCode(char.charCodeAt() + key);
				});
				document.querySelectorAll('.im_editable')[0].innerHTML = String.fromCharCode(5000) + res;
			}
		};
		cont.append(button);
	}
}

// Получение ID из адреса
function getID() {
	let urlVar = window.location.search;
	if(urlVar!="") {
		let arr = urlVar.split('=');
		if(arr.length>2) 
			return false;
		else 
			if(arr[0]=="?sel")
				return arr[1];
			else return false;
	}
	else return false;
}

// Случайное целое между...
function rand(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

// Проверка на простоту
function isPrime(number) {
	if(number == 1) return false;
	for(let i = 2; i <= Math.sqrt(number); i++)
		if(number % i == 0) return false;
	return true;
}

// --------------------------------- События -------------------------------

// Когда двигается мышь
document.addEventListener('mousemove', () => {
	let ID = getID();
	if(ID!=false) {
		if(ID!=localStorage['ID']) {
			localStorage['ID'] = ID;
			console.log('Новый ID = '+localStorage['ID']);
			// Если всё ок, рисуем кнопку
			drawButton();

			// И готовим почву для расшифровки
			if(localStorage[localStorage['ID']]!=null&&localStorage[localStorage['ID']]!="null") {
				console.log('Работает!');
				let messages = document.querySelectorAll('.im-mess--text');
				messages.forEach((message) => {
					if(message.innerHTML[0].charCodeAt() == 5000) {
						let str = message.innerHTML.split('').slice(1);
						console.log(str);
						let key = +JSON.parse(localStorage[localStorage['ID']])['generalKey'];
						let res = '';
						str.forEach((char) => {
							res += String.fromCharCode(char.charCodeAt() - key);
						});
						message.innerHTML = res;
					}
				});
			}
		}
	} else {
		localStorage['ID'] = null;
		console.log(localStorage['ID']);
	}
});
