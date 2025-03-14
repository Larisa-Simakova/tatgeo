let currentSlide = document.querySelector('.quiz-item.active');
let nextButton = document.querySelector('.quiz-next-btn');
let userAnswers = {};

// Функция для преобразования массива ответов в строку с нумерованным списком
function formatAnswers(answers) {
    if (Array.isArray(answers)) {
        const uniqueAnswers = [...new Set(answers)];
        if (uniqueAnswers.length === 1) {
            return uniqueAnswers[0];
        }
        return uniqueAnswers.map((answer, index) => `${index + 1}) ${answer}`).join('\n');
    }
    return answers;
}

// Функция для записи ответа
function recordAnswer(question, answer) {
    userAnswers[question] = [];
    if (Array.isArray(answer)) {
        userAnswers[question].push(...answer);
    } else {
        userAnswers[question].push(answer);
    }
    userAnswers[question] = [...new Set(userAnswers[question])];
}

// Функция для обновления состояния кнопки "Далее"
function updateNextButtonState() {
    let selectedOptions = Array.from(currentSlide.querySelectorAll('input[type="checkbox"]:checked'));
    let inputs = currentSlide.querySelectorAll('.quiz-input');
    let hasInputValues = Array.from(inputs).some(input => input.value.trim() !== '');

    if (selectedOptions.length > 0 || hasInputValues) {
        nextButton.classList.remove('disactive');
    } else {
        nextButton.classList.add('disactive');
    }
}

// Навешиваем обработчики на чекбоксы и поля ввода
document.querySelectorAll('.quiz-item').forEach(slide => {
    if (slide.getAttribute('data-question') !== 'ecology_details') {
        slide.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    slide.querySelectorAll('input[type="checkbox"]').forEach(otherCheckbox => {
                        if (otherCheckbox !== this) {
                            otherCheckbox.checked = false;
                        }
                    });
                }
                updateNextButtonState();
            });
        });
    }
});


// Навешиваем обработчики на чекбоксы и поля ввода
document.querySelectorAll('.quiz-item').forEach(slide => {
    slide.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateNextButtonState();
        });
    });

    slide.querySelectorAll('.quiz-input').forEach(input => {
        input.addEventListener('input', () => {
            updateNextButtonState();
        });
    });
});

// Функция для показа слайда
function showSlide(slide) {
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.classList.remove('active');
    });
    slide.classList.add('active');

    if (slide.getAttribute('data-question') === 'end') {
        nextButton.classList.add('no-show');
    } else {
        nextButton.classList.remove('no-show');
    }
    updateNextButtonState();
}

// Функция для отображения сообщения об ошибке
function showError(message) {
    let errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;

    let quizChoice = currentSlide.querySelector('.quiz-choice');
    let existingError = quizChoice.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    quizChoice.appendChild(errorMessage);
}


// Функция для форматирования номера телефона
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.startsWith('7') || value.startsWith('8')) {
        value = '+7' + value.slice(1);
    } else if (!value.startsWith('+7')) {
        value = '+7' + value;
    }

    let formattedValue = '+7';
    let digits = value.slice(2);

    if (digits.length > 0) {
        formattedValue += ' (' + digits.slice(0, 3);
    }
    if (digits.length > 3) {
        formattedValue += ') ' + digits.slice(3, 6);
    }
    if (digits.length > 6) {
        formattedValue += '-' + digits.slice(6, 8);
    }
    if (digits.length > 8) {
        formattedValue += '-' + digits.slice(8, 10);
    }

    input.value = formattedValue;
}

// Добавляем форматирование номера телефона при вводе
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => {
        formatPhoneNumber(input);
    });

    if (!input.value.trim()) {
        input.value = '+7';
    }
});

// Функция для проверки валидации на последнем слайде
function validateFinalSlide() {
    let nameInput = currentSlide.querySelector('input[type="text"]');
    let phoneInput = currentSlide.querySelector('input[type="tel"]');
    let emailInput = currentSlide.querySelector('input[type="email"]');

    if (!nameInput.value.trim() || !phoneInput.value.trim() || !emailInput.value.trim()) {
        showError('Все поля обязательны для заполнения');
        return false;
    }

    if (!/^[A-Za-zА-Яа-я\s]+$/.test(nameInput.value.trim())) {
        showError('Имя должно содержать только буквы');
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showError('Введите корректный email');
        return false;
    }

    if (phoneInput.value.replace(/\D/g, '').length < 10) {
        showError('Введите корректный номер телефона');
        return false;
    }

    return true;
}

// Функция для сбора ответов с текущего слайда
function collectAnswers() {
    let question = currentSlide.querySelector('.quiz-question').textContent;
    let selectedOptions = Array.from(currentSlide.querySelectorAll('input[type="checkbox"]:checked'));
    let inputs = currentSlide.querySelectorAll('.quiz-input');
    let answers = [];

    if (currentSlide.getAttribute('data-question') === 'main') {
        if (selectedOptions.length > 0) {
            answers.push(selectedOptions[0].nextElementSibling.textContent);
        }
    } else {
        selectedOptions.forEach(option => {
            answers.push(option.nextElementSibling.textContent);
        });
    }

    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            answers.push(`${input.placeholder} - ${input.value}`);
        }
    });

    if (answers.length > 0) {
        recordAnswer(question, answers);
    }

    return answers;
}
// Функция для перехода к следующему слайду
function nextSlide() {
    let selectedOptions = Array.from(currentSlide.querySelectorAll('input[type="checkbox"]:checked'));
    let skipButton = currentSlide.querySelector('.tell-later');
    let inputs = currentSlide.querySelectorAll('.quiz-input');
    let hasInputValues = Array.from(inputs).some(input => input.value.trim() !== '');

    let existingError = currentSlide.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    if (currentSlide.getAttribute('data-question') === 'end') {
        if (!validateFinalSlide()) {
            return;
        }
    }

    let hasCheckboxes = currentSlide.querySelectorAll('input[type="checkbox"]').length > 0;
    let hasInputs = inputs.length > 0;
    let hasSkipButton = skipButton !== null;

    // Если на слайде есть только чекбоксы
    if (hasCheckboxes && !hasInputs && !hasSkipButton) {
        if (selectedOptions.length === 0) {
            showError('Выберите один из вариантов');
            return;
        }
    }

    // Если на слайде есть чекбоксы и кнопка "Расскажу попозже"
    if (hasCheckboxes && hasSkipButton && !hasInputs) {
        if (selectedOptions.length === 0 && !skipButton.clicked) {
            showError('Выберите один из вариантов');
            return;
        }
    }

    // Если на слайде есть чекбоксы и поля для заполнения
    if (hasCheckboxes && hasInputs && !hasSkipButton) {
        if (selectedOptions.length === 0 && !hasInputValues) {
            showError('Выберите один из вариантов или заполните поле');
            return;
        }
    }

    // Если на слайде есть чекбоксы, поля для заполнения и кнопка "Расскажу попозже"
    if (hasCheckboxes && hasInputs && hasSkipButton) {
        if (selectedOptions.length === 0 && !hasInputValues && !skipButton.clicked) {
            showError('Выберите один из вариантов или заполните поле');
            return;
        }
    }

    let answers = collectAnswers();

    // Если нажата кнопка "Расскажу попозже"
    if (skipButton && skipButton.clicked) {
        let question = currentSlide.querySelector('.quiz-question').textContent;
        recordAnswer(question, [...answers, "Расскажу попозже"]);
    }

    // Переход к следующему слайду
    let nextQuestion;
    if (currentSlide.getAttribute('data-question') === 'geology') {
        if (selectedOptions.length > 0) {
            nextQuestion = selectedOptions[0].getAttribute('data-next-question');
        } else if (skipButton && skipButton.clicked) {
            nextQuestion = 'end';
        }
    } else {
        if (selectedOptions.length > 0) {
            nextQuestion = selectedOptions[0].getAttribute('data-next-question');
        } else if (hasInputValues) {
            // Если заполнено хотя бы одно поле, переходим на следующий слайд
            nextQuestion = currentSlide.getAttribute('data-next-question');
        } else if (skipButton && skipButton.clicked) {
            // Определяем следующий слайд в зависимости от текущей ветки
            let currentQuestion = currentSlide.getAttribute('data-question');
            if (currentQuestion === 'geodesy') {
                nextQuestion = 'geodesy_details';
            } else if (currentQuestion === 'geology') {
                nextQuestion = 'geology_details';
            } else if (currentQuestion === 'ecology') {
                nextQuestion = 'ecology_details';
            } else if (currentQuestion === 'ecology_details') {
                nextQuestion = 'end';
            }
        }
    }

    if (nextQuestion) {
        let nextSlide = document.querySelector(`[data-question="${nextQuestion}"]`);
        if (nextSlide) {
            currentSlide = nextSlide;
            showSlide(currentSlide);
        }
    }
}
// Обработчик для кнопки "Расскажу попозже"
document.querySelectorAll('.tell-later').forEach(button => {
    button.addEventListener('click', () => {
        button.clicked = true;
        nextSlide();
    });
});

// Обработчик для выбора ответа
document.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
        let question = input.closest('.quiz-item').querySelector('.quiz-question').textContent;
        let answer = input.nextElementSibling.textContent;
        recordAnswer(question, [answer]);
        nextButton.disabled = false;
    });
});

// Обработчик для кнопки "Отправить заявку"
document.querySelector('.quiz-item[data-question="end"] .btn-transparent').addEventListener('click', () => {
    let name = document.querySelector('.quiz-item[data-question="end"] input[type="text"]').value;
    let phone = document.querySelector('.quiz-item[data-question="end"] input[type="tel"]').value;
    let email = document.querySelector('.quiz-item[data-question="end"] input[type="email"]').value;

    if (!validateFinalSlide()) {
        return;
    }

    userAnswers.name = name;
    userAnswers.phone = phone;
    userAnswers.email = email;

    sendData(userAnswers);
});

// Функция для очистки полей формы
function clearForm() {
    let inputs = document.querySelectorAll('.quiz-input');
    inputs.forEach(input => {
        input.value = '';
    });

    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    userAnswers = {};

    let firstSlide = document.querySelector('.quiz-item[data-question="main"]');
    if (firstSlide) {
        currentSlide = firstSlide;
        showSlide(currentSlide);
    }
}

// Функция для отправки данных на сервер
function sendData(data) {
    for (let question in data) {
        if (Array.isArray(data[question])) {
            data[question] = formatAnswers(data[question]);
        }
    }

    fetch('../../send_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.text())
        .then(result => {
            alert(result);
            clearForm();
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке данных. Пожалуйста, попробуйте ещё раз.');
        });
}

showSlide(currentSlide);

// Добавляем форматирование номера телефона
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => {
        formatPhoneNumber(input);
    });
});