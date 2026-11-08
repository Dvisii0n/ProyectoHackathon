// ----------------------------------------------------------------------
// Prepara una foto antes de subirla: las del celular pesan varios MB, así
// que se reducen a un máximo de 1600 px por lado y se guardan como JPEG.
// El back acepta hasta 8 MB por foto.
// ----------------------------------------------------------------------

const MAX_LADO = 1600;
const CALIDAD = 0.82;
/** Con menos de esto no vale la pena recomprimir */
const YA_CHICA = 350 * 1024;

/**
 * Regresa la foto reducida. Si el navegador no puede leerla (p. ej. HEIC en
 * Chrome) o la reducida pesaría más, se sube la original sin tocar.
 */
export async function prepararFoto(archivo: File): Promise<Blob> {
  if (archivo.size <= YA_CHICA && /^image\/(jpeg|png|webp)$/.test(archivo.type)) return archivo;

  try {
    const imagen = await createImageBitmap(archivo);
    const escala = Math.min(1, MAX_LADO / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);

    const contexto = lienzo.getContext('2d');
    if (!contexto) return archivo;
    // JPEG no tiene transparencia: se pinta fondo blanco
    contexto.fillStyle = '#fff';
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    imagen.close();

    const reducida = await new Promise<Blob | null>((resolver) => {
      lienzo.toBlob(resolver, 'image/jpeg', CALIDAD);
    });

    return reducida && reducida.size < archivo.size ? reducida : archivo;
  } catch {
    return archivo;
  }
}
