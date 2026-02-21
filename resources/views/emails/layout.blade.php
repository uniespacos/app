<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
        .header { background: #0056b3; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 0.8em; color: #777; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
        .button { display: inline-block; padding: 10px 20px; margin: 15px 0; background: #007bff; color: white !important; text-decoration: none; border-radius: 5px; }
        a { color: #007bff; text-decoration: none; }
        .logo { max-width: 150px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ asset('logo.svg') }}" alt="UniEspaços Logo" class="logo">
            <h2>UniEspaços Notificação</h2>
        </div>
        <div class="content">
            @yield('content')
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} UniEspaços. Todos os direitos reservados.</p>
            <p>Se você tiver alguma dúvida, por favor, entre em contato com nosso suporte.</p>
        </div>
    </div>
</body>
</html>
