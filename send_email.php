<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

// Проверяем, есть ли данные
if (empty($data)) {
    echo 'Нет данных для обработки.';
    exit();
}

// Формируем текст письма
$mes = "Имя: " . ($data['name'] ?? 'Не указано') . "\n";
$mes .= "Телефон: " . ($data['phone'] ?? 'Не указано') . "\n";
$mes .= "E-mail: " . ($data['email'] ?? 'Не указано') . "\n\n";

// Добавляем ответы на вопросы
foreach ($data as $question => $answer) {
    if (!in_array($question, ['name', 'phone', 'email'])) {
        $mes .= "Вопрос: $question\nОтвет: $answer\n\n";
    }
}

$sub = "Результаты квиза";

$mail = new PHPMailer(true);

try {
    // Настройки SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // SMTP-сервер
    $mail->SMTPAuth = true;
    $mail->Username = 'larica.simakova@gmail.com'; // Ваш email
    $mail->Password = 'fjue vxvk wrzh yvtd'; // Пароль приложения
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Шифрование TLS
    $mail->Port = 587; // Порт SMTP-сервера

    // Устанавливаем кодировку UTF-8
    $mail->CharSet = 'UTF-8';

    // От кого
    $mail->setFrom('larica.simakova@gmail.com', 'ТатГео');

    // Кому
    $mail->addAddress($data['email']);

    // Тема письма
    $mail->Subject = $sub;

    // Тело письма
    $mail->Body = $mes;

    // Отправка
    $mail->send();
    echo 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.';
} catch (Exception $e) {
    echo "Ошибка при отправке письма: {$mail->ErrorInfo}";
}
