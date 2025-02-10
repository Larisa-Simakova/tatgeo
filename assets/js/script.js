let currentSlide = document.querySelector('.quiz-item.active');
let nextButton = document.querySelector('.quiz-next-btn');
let userAnswers = {};

// Функция для записи ответа
function recordAnswer(question, answer) {
    userAnswers[question] = answer;
}

// Функция для показа слайда
function showSlide(slide) {
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.classList.remove('active');
    });
    slide.classList.add('active');

    // Скрываем кнопку "Далее" на последнем слайде
    if (slide.getAttribute('data-question') === 'end') {
        nextButton.classList.add('disactive');
    }

    // Блокируем кнопку "Далее", если на слайде есть кнопка "Расскажу попозже"
    let skipButton = slide.querySelector('.tell-later');
    if (skipButton) {
        nextButton.disabled = true; // Блокируем кнопку "Далее"
    } else {
        nextButton.disabled = false; // Разблокируем кнопку "Далее"
    }
}

// Функция для отображения сообщения об ошибке
function showError(message) {
    let errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.textContent = message;

    let quizChoice = currentSlide.querySelector('.quiz-choice');
    let existingError = quizChoice.querySelector('.error-message');
    if (existingError) {
        existingError.remove(); // Удаляем старое сообщение об ошибке
    }
    quizChoice.appendChild(errorMessage);
}

// Функция для форматирования номера телефона
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Удаляем все нецифровые символы
    let format = "+0 (000) 000-00-00"; // Формат для телефона
    let formattedValue = '';
    let index = 0;

    for (let char of format) {
        if (char === '0' && value[index]) {
            formattedValue += value[index];
            index++;
        } else if (value[index]) {
            formattedValue += char;
        } else {
            break;
        }
    }

    input.value = formattedValue;
}

// Функция для проверки валидации на последнем слайде
function validateFinalSlide() {
    let nameInput = currentSlide.querySelector('input[type="text"]');
    let phoneInput = currentSlide.querySelector('input[type="tel"]');
    let emailInput = currentSlide.querySelector('input[type="email"]');

    // Проверка на пустые поля
    if (!nameInput.value.trim() || !phoneInput.value.trim() || !emailInput.value.trim()) {
        showError('Все поля обязательны для заполнения');
        return false;
    }

    // Проверка, что имя состоит только из букв и пробелов
    if (!/^[A-Za-zА-Яа-я\s]+$/.test(nameInput.value.trim())) {
        showError('Имя должно содержать только буквы');
        return false;
    }

    // Простая валидация email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showError('Введите корректный email');
        return false;
    }

    // Проверка, что номер телефона содержит минимум 10 цифр
    if (phoneInput.value.replace(/\D/g, '').length < 10) {
        showError('Введите корректный номер телефона');
        return false;
    }

    return true; // Валидация прошла успешно
}

// Функция для перехода к следующему слайду
function nextSlide() {
    let selectedOption = currentSlide.querySelector('input[name="option"]:checked');
    let skipButton = currentSlide.querySelector('.tell-later');
    let inputs = currentSlide.querySelectorAll('.quiz-input');
    let hasInputValues = Array.from(inputs).some(input => input.value.trim() !== '');

    // Очистка предыдущих сообщений об ошибках
    let existingError = currentSlide.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Если это последний слайд, проверяем валидацию
    if (currentSlide.getAttribute('data-question') === 'end') {
        if (!validateFinalSlide()) {
            return; // Останавливаем переход, если валидация не прошла
        }
    }

    // Если есть radio-кнопки и ни одна не выбрана
    if (selectedOption) {
        let nextQuestion = selectedOption.getAttribute('data-next-question');
        let nextSlide = document.querySelector(`[data-question="${nextQuestion}"]`);
        if (nextSlide) {
            currentSlide = nextSlide;
            showSlide(currentSlide);
        }
    } else if (skipButton) {
        // Если нажата кнопка "Расскажу попозже"
        let question = currentSlide.getAttribute('data-question');
        recordAnswer(question, "Расскажу попозже");
        let nextQuestion;

        // Определяем следующий слайд в зависимости от текущей ветки
        if (question === 'geodesy') {
            nextQuestion = 'geodesy_details';
        } else if (question === 'geology') {
            nextQuestion = 'geology_details';
        } else if (question === 'ecology') {
            nextQuestion = 'ecology_details';
        } else if (question === 'ecology_details') {
            nextQuestion = 'end';
        }

        if (nextQuestion) {
            let nextSlide = document.querySelector(`[data-question="${nextQuestion}"]`);
            if (nextSlide) {
                currentSlide = nextSlide;
                showSlide(currentSlide);
            }
        }
    } else if (inputs.length > 0 && !hasInputValues && !selectedOption) {
        // Если есть input-поля, но ни одно не заполнено и radio-кнопка не выбрана
        showError('Заполните поля');
    } else if (!selectedOption && !skipButton) {
        // Если нет выбранной radio-кнопки и нет кнопки "Расскажу попозже"
        showError('Выберите один из вариантов');
    }
}

// Обработчик для кнопки "Расскажу попозже"
document.querySelectorAll('.tell-later').forEach(button => {
    button.addEventListener('click', () => {
        let question = button.closest('.quiz-item').getAttribute('data-question');
        recordAnswer(question, "Расскажу попозже"); // Записываем ответ
        nextSlide(); // Переход к следующему слайду
    });
});

// Обработчик для выбора ответа
document.querySelectorAll('input[name="option"]').forEach(input => {
    input.addEventListener('change', () => {
        let question = input.closest('.quiz-item').getAttribute('data-question');
        let answer = input.value;
        recordAnswer(question, answer); // Записываем ответ
        nextButton.disabled = false; // Разблокируем кнопку "Далее"
    });
});

// Обработчик для кнопки "Отправить заявку"
document.querySelector('.quiz-item[data-question="end"] .btn-transparent').addEventListener('click', () => {
    let name = document.querySelector('.quiz-item[data-question="end"] input[type="text"]').value;
    let phone = document.querySelector('.quiz-item[data-question="end"] input[type="tel"]').value;
    let email = document.querySelector('.quiz-item[data-question="end"] input[type="email"]').value;

    // Проверяем валидацию перед отправкой
    if (!validateFinalSlide()) {
        return; // Останавливаем отправку, если валидация не прошла
    }

    // Добавляем данные формы в объект ответов
    userAnswers.name = name;
    userAnswers.phone = phone;
    userAnswers.email = email;

    // Отправляем данные на сервер
    sendData(userAnswers);
});

// Функция для отправки данных на сервер
function sendData(data) {
    fetch('../../send_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        alert(result); // Показываем результат отправки
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

// Инициализация первого слайда
showSlide(currentSlide);

// Добавляем форматирование номера телефона
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => {
        formatPhoneNumber(input);
    });
});