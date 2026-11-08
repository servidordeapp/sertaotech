@extends('mail.layout')

@section('conteudo')
<p style="margin:0 0 16px;">{{ $saudacao }}</p>
<p style="margin:0 0 24px;">
    @if (count($botoes) > 1)
        Seus certificados da {{ $numero }} edição do Sertão Tech estão prontos. Cada botão abre um deles, com a opção de baixar o PDF.
    @else
        Seu certificado da {{ $numero }} edição do Sertão Tech está pronto. O botão abaixo abre o certificado, com a opção de baixar o PDF.
    @endif
</p>
@foreach ($botoes as $botao)
    @include('mail.botao', ['url' => $botao['url'], 'rotulo' => $botao['rotulo']])
@endforeach
<p style="margin:24px 0 0; font-size:14px; line-height:21px; color:#6B4526;">
  Todo certificado traz um código e um QR Code. Qualquer pessoa confere a validade em osertaotech.com.br/certificado/validar.
</p>
@endsection

@section('rodape')
Você recebeu este e-mail porque tem certificado emitido nesta edição. Para corrigir algum dado ou pedir a exclusão, chame a organização no WhatsApp +55 (86) 99920-2231 ou no Instagram @osertaotech.
@endsection
