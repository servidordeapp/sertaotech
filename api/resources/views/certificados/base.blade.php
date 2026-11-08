{{--
    Arte comum dos certificados, em A4 paisagem. O dompdf não tem flexbox, grid
    nem variáveis CSS: o layout é posição absoluta, e as cores são os tokens de
    site/public/ds/tokens/colors.css copiados à mão. O Blade de cada edição
    estende este e muda só o que for da edição (por ora, a cor de destaque).

    Recebe: $certificado (App\Models\Certificado), $edicao (config da edição),
    $emissor (config do emissor) e $qrCode (data URI do SVG).
--}}
@php
    $data = \Illuminate\Support\Carbon::parse($edicao['data'])->locale('pt_BR')->translatedFormat('j \d\e F \d\e Y');
    $horas = fn (int $h): string => $h.' '.($h === 1 ? 'hora' : 'horas');
    // &nbsp; segura "Sertão Tech" e "Parnaíba - PI" na mesma linha.
    $marca = '<strong>Sertão&nbsp;Tech</strong>';
    $evento = 'da '.$edicao['edicao'].' edição do '.$marca;
    $realizacao = 'realizada em '.$data.', '.str_replace(' - ', '&nbsp;-&nbsp;', e($edicao['local']));
    $titulo = $certificado->titulo !== null ? '“'.e($certificado->titulo).'”' : null;
    // Nome longo quebraria a linha: "Maria Katriane de Sousa da Silva Oliveira" tem 41 letras.
    $tamanhoDoNome = mb_strlen($certificado->nome) > 32 ? 22 : 28;
    $subtitulo = [
        'participante' => 'de participação',
        'palestrante'  => 'de palestrante',
        'ministrante'  => 'de ministrante',
        'organizacao'  => 'de organização',
    ][$certificado->tipo];
@endphp
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Certificado {{ $certificado->codigo }}</title>
<style>
    @font-face { font-family: "Space Grotesk"; font-weight: 700; src: url("{{ resource_path('fonts/SpaceGrotesk-Bold.ttf') }}") format("truetype"); }
    @font-face { font-family: "Instrument Sans"; font-weight: 400; src: url("{{ resource_path('fonts/InstrumentSans-Regular.ttf') }}") format("truetype"); }
    @font-face { font-family: "Instrument Sans"; font-weight: 700; src: url("{{ resource_path('fonts/InstrumentSans-SemiBold.ttf') }}") format("truetype"); }
    @font-face { font-family: "Space Mono"; font-weight: 400; src: url("{{ resource_path('fonts/SpaceMono-Regular.ttf') }}") format("truetype"); }
    @font-face { font-family: "League Spartan"; font-weight: 700; src: url("{{ resource_path('fonts/LeagueSpartan-ExtraBold.ttf') }}") format("truetype"); }

    /* --sand-50, --espresso-*, --terra-*, --amber-* de site/public/ds/tokens/colors.css */
    @page { size: A4 landscape; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body { background: #FBF6EA; color: #2A1908; font-family: "Instrument Sans", sans-serif; font-size: 13pt; word-spacing: 0.8pt; }

    .faixa-topo { position: absolute; top: 0; left: 0; width: 297mm; height: 5mm; background: @yield('cor-destaque', '#A8511A'); }
    .faixa-sol { position: absolute; top: 5mm; left: 0; width: 297mm; height: 1.5mm; background: #D87D0E; }
    .moldura { position: absolute; top: 12mm; left: 12mm; width: 271mm; height: 174mm; border: 0.4mm solid #3C210B; }
    .rodape { position: absolute; bottom: 0; left: 0; width: 297mm; height: 8mm; padding-top: 4mm; background: #3C210B; color: #F5EAD0; font-size: 8.5pt; text-align: center; letter-spacing: 0.3pt; }

    .marca { position: absolute; top: 18mm; left: 20mm; }
    .marca img { height: 28mm; vertical-align: middle; }
    .marca .nome { font-family: "League Spartan", sans-serif; font-weight: 700; font-size: 24pt; color: #3C210B; text-transform: uppercase; letter-spacing: 1pt; }
    .marca .edicao { font-family: "Space Mono", monospace; font-size: 9pt; color: #6B4526; }

    .realizacao { position: absolute; top: 17mm; right: 20mm; }
    .realizacao .rotulo { font-family: "Space Mono", monospace; font-size: 7.5pt; color: #6B4526; text-transform: uppercase; letter-spacing: 1pt; text-align: right; padding-bottom: 1.5mm; }
    .realizacao img { height: 18mm; }
    .realizacao td { padding: 0 0 0 4mm; }

    .conteudo { position: absolute; top: 50mm; left: 30mm; width: 237mm; text-align: center; }
    .titulo { font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 34pt; line-height: 1; color: @yield('cor-destaque', '#A8511A'); letter-spacing: 6pt; margin: 0; }
    .subtitulo { font-family: "Space Mono", monospace; font-size: 10.5pt; color: #6B4526; text-transform: uppercase; letter-spacing: 3pt; margin: 2mm 0 5mm; }
    .certificamos { font-size: 11pt; color: #4E2E13; margin: 0 0 1mm; }
    .nome-pessoa { font-family: "Space Grotesk", sans-serif; font-weight: 700; color: #1F1305; margin: 0; line-height: 1.2; }
    .traco { width: 110mm; height: 0.8mm; background: #D87D0E; margin: 2mm auto 4mm; }
    .texto { font-size: 12pt; line-height: 1.45; margin: 0 6mm; }
    .atividade { font-size: 10pt; color: #4E2E13; margin: 2mm 6mm 0; }

    .assinatura { position: absolute; top: 164mm; left: 26mm; width: 85mm; text-align: center; }
    .assinatura .linha { border-top: 0.3mm solid #3C210B; margin-bottom: 1.5mm; }
    .assinatura .quem { font-weight: 700; font-size: 10.5pt; }
    .assinatura .papel { font-size: 8.5pt; color: #6B4526; }

    .validacao { position: absolute; top: 152mm; right: 20mm; width: 120mm; }
    .validacao table { border-collapse: collapse; margin-left: auto; }
    .validacao td { vertical-align: middle; padding: 0; }
    .validacao .qr { width: 28mm; height: 28mm; }
    .validacao .rotulo { font-family: "Space Mono", monospace; font-size: 7.5pt; color: #6B4526; text-transform: uppercase; letter-spacing: 1pt; }
    .validacao .codigo { font-family: "Space Mono", monospace; font-size: 12pt; color: #1F1305; margin: 1mm 0; }
    .validacao .onde { font-size: 8pt; color: #4E2E13; }
    .validacao .textos { padding-right: 4mm; text-align: right; }
</style>
</head>
<body>
    <div class="faixa-topo"></div>
    <div class="faixa-sol"></div>
    <div class="moldura"></div>

    <div class="marca">
        <table><tr>
            <td><img src="{{ resource_path('certificados/sertaotech.jpg') }}" alt="Sertão Tech"></td>
            <td style="padding-left: 3mm;">
                <div class="nome">Sertão Tech</div>
                <div class="edicao">{{ $edicao['edicao'] }} edição · {{ $data }}</div>
            </td>
        </tr></table>
    </div>

    <div class="realizacao">
        <table>
            <tr><td colspan="2" class="rotulo">Realização</td></tr>
            <tr>
                <td><img src="{{ resource_path('certificados/phppi.jpg') }}" alt="PHP Piauí"></td>
                <td><img src="{{ resource_path('certificados/phpwomen-piaui.jpg') }}" alt="PHP Women Piauí"></td>
            </tr>
        </table>
    </div>

    <div class="conteudo">
        <h1 class="titulo">CERTIFICADO</h1>
        <p class="subtitulo">{{ $subtitulo }}</p>
        <p class="certificamos">Certificamos que</p>
        <p class="nome-pessoa" style="font-size: {{ $tamanhoDoNome }}pt;">{{ $certificado->nome }}</p>
        <div class="traco"></div>
        <p class="texto">
            @switch($certificado->tipo)
                @case('palestrante')
                    {!! $titulo !== null ? 'proferiu a palestra '.$titulo : 'atuou como palestrante' !!} na {!! $edicao['edicao'].' edição do '.$marca !!}, {!! $realizacao !!}, com carga horária total de {{ $horas($certificado->carga_horaria) }}.
                    @break
                @case('ministrante')
                    {!! $titulo !== null ? 'ministrou o minicurso '.$titulo : 'atuou como ministrante de minicurso' !!} na {!! $edicao['edicao'].' edição do '.$marca !!}, {!! $realizacao !!}, com carga horária de {{ $horas($certificado->carga_horaria) }}.
                    @break
                @case('organizacao')
                    atuou como voluntário(a) na organização {!! $evento !!}, incluindo planejamento, montagem e execução do evento, {!! $realizacao !!}, com carga horária total de {{ $horas($certificado->carga_horaria) }}.
                    @break
                @default
                    participou {!! $evento !!}, {!! $realizacao !!}, com carga horária total de {{ $horas($certificado->carga_horaria) }}.
            @endswitch
        </p>
        @foreach ($certificado->atividades as $chave)
            <p class="atividade">Participou do minicurso “{{ $edicao['atividades'][$chave]['nome'] }}” ({{ $edicao['atividades'][$chave]['carga_horaria'] }} h), parte da programação do evento.</p>
        @endforeach
    </div>

    <div class="assinatura">
        <div class="linha"></div>
        <div class="quem">{{ $emissor['responsavel'] }}</div>
        <div class="papel">Organização · Sertão Tech</div>
    </div>

    <div class="validacao">
        <table><tr>
            <td class="textos">
                <div class="rotulo">Código de validação</div>
                <div class="codigo">{{ $certificado->codigo }}</div>
                <div class="onde">Confira em {{ preg_replace('#^https?://#', '', config('certificados.url_validacao')) }}</div>
            </td>
            <td><img class="qr" src="{{ $qrCode }}" alt="QR Code de validação"></td>
        </tr></table>
    </div>

    <div class="rodape">
        {{ collect([$emissor['razao_social'], $emissor['cnpj'] ? 'CNPJ '.$emissor['cnpj'] : null])->filter()->implode(' · ') ?: 'Sertão Tech' }}
    </div>
</body>
</html>
