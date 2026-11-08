@extends('mail.layout')

@section('conteudo')
<p style="margin:0 0 16px;">Olá, {{ $entry->nome }}!</p>
<p style="margin:0 0 8px; font-size:20px; line-height:28px; font-weight:bold; color:#A8511A;">Sua inscrição está confirmada.</p>
<p style="margin:0 0 24px;">Você está na lista de espera {{ $lista }} do Sertão Tech 2027. Assim que houver novidade, você fica sabendo por aqui.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; background:#F5EAD0; border-left:4px solid #D87D0E; border-radius:6px;">
  <tr>
    <td style="padding:16px 20px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px; color:#2A1908;">
      <strong style="display:block; margin-bottom:4px; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#6B4526;">3ª edição</strong>
      15 e 16 de outubro de 2027<br>
      UFDPar, Parnaíba - PI
    </td>
  </tr>
</table>

<p style="margin:0 0 16px;">Enquanto isso, acompanhe as novidades no Instagram:</p>
@include('mail.botao', ['url' => 'https://www.instagram.com/osertaotech', 'rotulo' => 'Seguir @osertaotech'])
@endsection

@section('rodape')
Seus dados servem só para a organização falar com você sobre a edição 2027 e ficam guardados até o fim dela. Para corrigir ou apagar, chame a organização no WhatsApp +55 (86) 99920-2231 ou no Instagram @osertaotech.
@endsection
