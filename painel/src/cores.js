/**
 * Cores dos gráficos.
 *
 * A trinca categórica foi validada (não escolhida no olho) contra a superfície
 * dos cartões, #FBF6EA: banda de luminosidade, piso de croma, separação para
 * daltonismo (pior par ΔE 22,1 em protanopia) e contraste — tudo passa. Cor
 * segue a entidade, nunca a posição: participante é sempre o mesmo laranja,
 * mesmo quando o filtro esconde os outros dois.
 */
export const CORES_POR_TIPO = {
  participante: '#A8511A',
  palestrante: '#1A6FB5',
  patrocinador: '#5E8C1A',
};

/** Série única (cidade, perfil, cota): um tom só, o terracota da marca. */
export const COR_UNICA = '#A8511A';

/** Tinta dos eixos e rótulos — texto nunca veste a cor da série. */
export const TINTA = '#6B4526';
export const GRADE = 'rgba(107, 69, 38, 0.12)';
