{{--
    Moldura comum dos e-mails para o público. Tabelas e CSS inline: é o que Gmail
    e Outlook respeitam. Cores do design system (site/public/ds/tokens/colors.css).
    Quem estende preenche `conteudo` e `rodape`.
--}}
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
            @yield('conteudo')
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px; border-top:1px solid #E2C88C; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:#6B4526;">
            @yield('rodape')
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
