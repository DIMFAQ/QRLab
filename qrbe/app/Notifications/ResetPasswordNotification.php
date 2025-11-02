<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // FRONTEND_URL di .env, default ke port Vite
        $frontend = config('app.frontend_url', 'http://localhost:5173');

        $url = $frontend.'/reset-password?token='.$this->token.'&email='.urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Password Akun QR Absensi')
            ->line('Kami menerima permintaan untuk mengatur ulang password akun Anda.')
            ->action('Reset Password', $url)
            ->line('Jika Anda tidak meminta reset password, abaikan email ini.');
    }
}
