// Seed script: crea un usuario y un vídeo precargado por cada miembro del grupo.
//
// USO:
//   1. Coloca un fichero de vídeo por miembro en seeds/videos/ (ej: miembro1.mp4)
//   2. Ajusta el array MEMBERS con los datos reales del grupo
//   3. Ejecuta:  npm run seed
//
// El script es idempotente: si el username ya existe lo reutiliza en vez de duplicarlo.

'use strict';

const path  = require('path');
const fs    = require('fs');
const bcrypt = require('bcrypt');

const db           = require('../app/models/db.js');
const authConfig   = require('../app/config/auth.config.js');
const storageConfig = require('../app/config/storage.config.js');
const encoder      = require('../app/utils/encoding_video');


const MEMBERS = [
  {
    name:      'Miembro Uno',
    username:  'miembro1',
    email:     'miembro1@peitude.local',
    password:  'pass1234',
    video: {
      title:       'Vídeo de Miembro Uno',
      description: 'Vídeo precargado del miembro 1',
      file:        'miembro1.mp4',
    },
  },
  {
    name:      'Miembro Dos',
    username:  'miembro2',
    email:     'miembro2@peitude.local',
    password:  'pass1234',
    video: {
      title:       'Vídeo de Miembro Dos',
      description: 'Vídeo precargado del miembro 2',
      file:        'miembro2.mp4',
    },
  },
  {
    name:      'Miembro Tres',
    username:  'miembro3',
    email:     'miembro3@peitude.local',
    password:  'pass1234',
    video: {
      title:       'Vídeo de Miembro Tres',
      description: 'Vídeo precargado del miembro 3',
      file:        'miembro3.mp4',
    },
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const SEEDS_VIDEOS_DIR = path.join(__dirname, 'videos');

async function seedMember(member) {
  const User  = db.User;
  const Video = db.video;

  // 1. Crear o reutilizar usuario
  let user = await User.findOne({ where: { username: member.username } });
  if (user) {
    console.log(`  → Usuario '${member.username}' ya existe (id=${user.id}), reutilizando.`);
  } else {
    const hashedPassword = await bcrypt.hash(member.password, authConfig.salt);
    user = await User.create({
      name:     member.name,
      username: member.username,
      email:    member.email,
      password: hashedPassword,
    });
    console.log(`  → Usuario '${member.username}' creado (id=${user.id}).`);
  }

  // 2. Verificar que el fichero de vídeo fuente existe
  const sourceVideoPath = path.join(SEEDS_VIDEOS_DIR, member.video.file);
  if (!fs.existsSync(sourceVideoPath)) {
    console.warn(`  ⚠ Fichero de vídeo no encontrado: ${sourceVideoPath}`);
    console.warn(`    Crea el registro en BD sin procesar el fichero.`);

    // Creamos el registro vacío para que el usuario pueda subirlo después
    const video = await Video.create({
      title:       member.video.title,
      description: member.video.description,
      userId:      user.id,
      thumbnail:   '',
      path:        '',
      dash:        '',
    });
    console.log(`  → Vídeo creado sin fichero (id=${video.id}).`);
    return;
  }

  // 3. Crear registro de vídeo vacío para obtener el id
  const video = await Video.create({
    title:       member.video.title,
    description: member.video.description,
    userId:      user.id,
    thumbnail:   '',
    path:        '',
    dash:        '',
  });
  console.log(`  → Vídeo creado (id=${video.id}). Procesando con FFmpeg...`);

  // 4. Preparar directorios de salida
  const outputMp4       = path.join(storageConfig.videosDir, `video-${video.id}.mp4`);
  const outputThumb     = path.join(storageConfig.videosDir, `video-${video.id}.png`);
  const outputDashDir   = path.join(storageConfig.videosDir, `video-${video.id}`);

  fs.mkdirSync(storageConfig.videosDir, { recursive: true });
  fs.mkdirSync(outputDashDir, { recursive: true });

  // 5. Pipeline FFmpeg: MP4 → thumbnail → DASH
  console.log(`     [1/3] Recodificando a MP4...`);
  await encoder.encodeMp4(sourceVideoPath, outputMp4);

  console.log(`     [2/3] Extrayendo miniatura...`);
  await encoder.getThumbnail(outputMp4, outputThumb);

  console.log(`     [3/3] Generando DASH...`);
  await encoder.encodeDash(outputMp4, outputDashDir);

  // 6. Actualizar rutas en BD
  video.path      = `/videos/video-${video.id}.mp4`;
  video.thumbnail = `/videos/video-${video.id}.png`;
  video.dash      = `/videos/video-${video.id}/manifest.mpd`;
  await video.save();

  console.log(`  ✓ Vídeo procesado correctamente (id=${video.id}).`);
}

async function main() {
  console.log('Conectando a la base de datos...');
  await db.sequelize.sync();
  console.log('Conexión OK.\n');

  for (const member of MEMBERS) {
    console.log(`Procesando miembro: ${member.name}`);
    try {
      await seedMember(member);
    } catch (err) {
      console.error(`  ✗ Error procesando ${member.name}:`, err.message);
    }
    console.log('');
  }

  console.log('Seed completado.');
  await db.sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error fatal en seed:', err);
  process.exit(1);
});
