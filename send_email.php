<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data)) {
    echo 'Нет данных для обработки.';
    exit();
}

$mes = "Имя: " . ($data['name'] ?? 'Не указано') . "\n";
$mes .= "Телефон: " . ($data['phone'] ?? 'Не указано') . "\n";
$mes .= "E-mail: " . ($data['email'] ?? 'Не указано') . "\n\n";

foreach ($data as $question => $answer) {
    if (!in_array($question, ['name', 'phone', 'email'])) {
        $mes .= "Вопрос: $question\nОтвет: $answer\n\n";
    }
}

$sub = "Результаты квиза";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USERNAME'];
    $mail->Password = $_ENV['SMTP_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->CharSet = 'UTF-8';
    $mail->setFrom($data['email'], $data['name'] ?? 'Пользователь');
    $mail->addAddress('larica.simakova@gmail.com');
    $mail->Subject = $sub;
    $mail->Body = $mes;

    $mail->send();
    echo 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.';
} catch (Exception $e) {
    echo "Ошибка при отправке письма: {$mail->ErrorInfo}";
}
