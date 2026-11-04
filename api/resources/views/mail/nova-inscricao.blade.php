Nova inscrição na lista de espera: {!! $entry->tipo !!}

Nome: {!! $entry->nome !!}
E-mail: {!! $entry->email !!}
WhatsApp: {!! $entry->whatsapp !!}
@foreach ($entry->dados as $campo => $valor)
{!! $campo !!}: {!! $valor !!}
@endforeach
Compartilhamento com patrocinadores: {{ $entry->compartilhamento_aceito_em ? 'sim' : 'não' }}
