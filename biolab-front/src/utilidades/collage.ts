import type { FotoPractica, FormatoCollage } from 'src/tipos/dominio';

// ----------------------------------------------------------------------
// Arma el collage en un <canvas> y lo descarga como PNG, sin librerías.
// Post = 1080×1350 (Instagram vertical), Historia = 1080×1920.
// ----------------------------------------------------------------------

const MEDIDAS: Record<FormatoCollage, { ancho: number; alto: number }> = {
  post: { ancho: 1080, alto: 1350 },
  historia: { ancho: 1080, alto: 1920 },
};

const TINTES = ['#DDE4CC', '#EBD9D5', '#F2E2D2', '#E7EBDD', '#B9C4A0', '#D5DCC6', '#E3B98C', '#C9D2B6', '#E59C97'];

export function columnasCollage(cantidad: number): number {
  if (cantidad <= 1) return 1;
  if (cantidad <= 4) return 2;
  return 3;
}

function cargarImagen(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolver) => {
    if (!url) {
      resolver(null);
      return;
    }
    const imagen = new Image();
    imagen.crossOrigin = 'anonymous';
    imagen.onload = () => resolver(imagen);
    imagen.onerror = () => resolver(null);
    imagen.src = url;
  });
}

function rectanguloRedondo(ctx: CanvasRenderingContext2D, x: number, y: number, ancho: number, alto: number, radio: number) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
  ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
  ctx.arcTo(x, y + alto, x, y, radio);
  ctx.arcTo(x, y, x + ancho, y, radio);
  ctx.closePath();
}

/** Dibuja la imagen recortada para llenar el recuadro (como object-fit: cover) */
function dibujarCubriendo(ctx: CanvasRenderingContext2D, imagen: HTMLImageElement, x: number, y: number, ancho: number, alto: number) {
  const escala = Math.max(ancho / imagen.width, alto / imagen.height);
  const anchoFuente = ancho / escala;
  const altoFuente = alto / escala;
  ctx.drawImage(imagen, (imagen.width - anchoFuente) / 2, (imagen.height - altoFuente) / 2, anchoFuente, altoFuente, x, y, ancho, alto);
}

export async function generarCollage(fotos: FotoPractica[], formato: FormatoCollage, titulo: string): Promise<Blob> {
  const { ancho, alto } = MEDIDAS[formato];
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('El navegador no soporta canvas');

  await document.fonts.ready;

  // Fondo verde bosque
  ctx.fillStyle = '#122A0E';
  ctx.fillRect(0, 0, ancho, alto);

  // Título
  ctx.fillStyle = '#F7F5EA';
  ctx.textAlign = 'center';
  ctx.font = "600 56px 'Fraunces Variable', Georgia, serif";
  ctx.fillText(titulo, ancho / 2, 110);

  // Rejilla de fotos
  const margen = 60;
  const espacio = 18;
  const arriba = 160;
  const abajo = 130;
  const columnas = columnasCollage(fotos.length);
  const filas = Math.ceil(fotos.length / columnas);
  const anchoCelda = (ancho - margen * 2 - espacio * (columnas - 1)) / columnas;
  const altoCelda = (alto - arriba - abajo - espacio * (filas - 1)) / filas;

  const imagenes = await Promise.all(fotos.map((f) => cargarImagen(f.url)));

  fotos.forEach((foto, i) => {
    const x = margen + (i % columnas) * (anchoCelda + espacio);
    const y = arriba + Math.floor(i / columnas) * (altoCelda + espacio);
    ctx.save();
    rectanguloRedondo(ctx, x, y, anchoCelda, altoCelda, 28);
    ctx.clip();
    const imagen = imagenes[i];
    if (imagen) {
      dibujarCubriendo(ctx, imagen, x, y, anchoCelda, altoCelda);
    } else {
      ctx.fillStyle = TINTES[i % TINTES.length];
      ctx.fillRect(x, y, anchoCelda, altoCelda);
      ctx.fillStyle = '#41553E';
      ctx.font = "700 34px 'Nunito Variable', sans-serif";
      ctx.fillText(foto.titulo, x + anchoCelda / 2, y + altoCelda / 2);
    }
    ctx.restore();
  });

  // Pie con la marca
  ctx.fillStyle = '#F7F5EA';
  ctx.font = "600 40px 'Fraunces Variable', Georgia, serif";
  ctx.fillText('Biolab · Biomédica', ancho / 2, alto - 55);

  return new Promise((resolver, rechazar) => {
    lienzo.toBlob((blob) => (blob ? resolver(blob) : rechazar(new Error('No se pudo crear la imagen'))), 'image/png');
  });
}

export function descargarArchivo(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
