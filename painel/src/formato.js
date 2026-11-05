/**
 * O banco devolve data de dois jeitos: o Eloquent serializa em ISO com Z
 * ("2026-11-05T01:58:00.000000Z") e o DB::table devolve o texto cru do MySQL
 * ("2026-11-05 01:58:00"), que é UTC sem dizer. Sem o segundo caso tratado, o
 * horário aparecia três horas adiantado; sem o primeiro, "Invalid Date".
 */
export function dataHora(valor) {
  if (!valor) return '';

  const temFuso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(valor);
  const iso = temFuso ? valor : `${valor.replace(' ', 'T')}Z`;

  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
