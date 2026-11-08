{!! $saudacao !!}

@if (count($botoes) > 1)
Seus certificados da {!! $numero !!} edição do Sertão Tech estão prontos. Cada link abre um deles, com a opção de baixar o PDF.
@else
Seu certificado da {!! $numero !!} edição do Sertão Tech está pronto. O link abre o certificado, com a opção de baixar o PDF.
@endif

@foreach ($botoes as $botao)
{!! $botao['rotulo'] !!}:
{!! $botao['url'] !!}

@endforeach
Todo certificado traz um código e um QR Code. Qualquer pessoa confere a validade em osertaotech.com.br/certificado/validar.

Você recebeu este e-mail porque tem certificado emitido nesta edição. Para corrigir algum dado ou pedir a exclusão, chame a organização no WhatsApp +55 (86) 99920-2231 ou no Instagram @osertaotech.

Sertão Tech
