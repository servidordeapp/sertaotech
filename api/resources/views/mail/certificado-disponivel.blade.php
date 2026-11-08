{{-- Tabelas e CSS inline: é o que Gmail e Outlook respeitam. Cores do design system (site/public/ds/tokens/colors.css). --}}
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sertão Tech</title>
</head>
<body style="margin:0; padding:0; background:#F5EAD0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5EAD0;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:#FBF6EA; border:1px solid #E2C88C; border-radius:8px;">
        <tr>
          <td style="background:#3C210B; border-radius:8px 8px 0 0; padding:20px 28px; font-family:Arial, Helvetica, sans-serif; font-size:20px; font-weight:bold; letter-spacing:2px; color:#F6C56C;">
            SERTÃO TECH
          </td>
        </tr>
        <tr>
          <td style="padding:28px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:24px; color:#2A1908;">
            <p style="margin:0 0 16px;">{{ $saudacao }}</p>
            <p style="margin:0 0 24px;">
                @if (count($botoes) > 1)
                    Seus certificados da {{ $numero }} edição do Sertão Tech estão prontos. Cada botão abre um deles, com a opção de baixar o PDF.
                @else
                    Seu certificado da {{ $numero }} edição do Sertão Tech está pronto. O botão abaixo abre o certificado, com a opção de baixar o PDF.
                @endif
            </p>
            @foreach ($botoes as $botao)
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
              <tr>
                <td style="background:#A8511A; border-radius:6px;">
                  <a href="{{ $botao['url'] }}" style="display:inline-block; padding:12px 22px; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:#FBF6EA; text-decoration:none;">{{ $botao['rotulo'] }}</a>
                </td>
              </tr>
            </table>
            @endforeach
            <p style="margin:24px 0 0; font-size:14px; line-height:21px; color:#6B4526;">
              Todo certificado traz um código e um QR Code. Qualquer pessoa confere a validade em osertaotech.com.br/certificado/validar.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px; border-top:1px solid #E2C88C; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:#6B4526;">
            Você recebeu este e-mail porque tem certificado emitido nesta edição. Para corrigir algum dado ou pedir a exclusão, chame a organização no WhatsApp +55 (86) 99920-2231 ou no Instagram @osertaotech.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
