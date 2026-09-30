const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.sermon.count();
  console.log('Current sermons count:', count);

  if (count === 0) {
    const sampleItems = [
      {
        type: 'SERMON',
        title: 'Walking with God in Babylon: Daniel 1 & Youth Purpose',
        speaker: 'Pr. Paul Muasya',
        description: 'Keynote spiritual address delivered at the Coast University & College Adventist Rally. Exploring Daniel\'s courage to remain faithful amidst academic, cultural, and spiritual pressure in contemporary institutions.',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // standard demo YouTube link
        duration: '48:32',
        series: 'CUCASO Annual Rally 2025',
        tags: 'Faith, Daniel, Prophecy, Integrity, Youth',
        status: 'PUBLISHED',
        viewCount: 1420,
      },
      {
        type: 'SERMON',
        title: 'The Great Commission in Higher Education',
        speaker: 'Elder Dr. Samuel Otieno',
        description: 'How university students and Adventist professionals can transform their lecture halls and workstations into centres of influence and gospel impact.',
        youtubeUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
        duration: '54:10',
        series: 'Missions & Evangelism Summit',
        tags: 'Evangelism, Mission, Campus Ministry, Discipleship',
        status: 'PUBLISHED',
        viewCount: 980,
      },
      {
        type: 'SONG',
        title: 'Tumaini Kuu (A Cappella Choral Special)',
        speaker: 'TUM SDA University Mass Choir',
        description: 'Grand choral anthem presented during Sabbath Divine Service at the CUCASO Coast Choral Festival in Mombasa.',
        youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        duration: '6:15',
        series: 'Coast Choral Praise 2025',
        tags: 'Choir, A Cappella, Hymns, Worship, Tumaini',
        status: 'PUBLISHED',
        viewCount: 3120,
      },
      {
        type: 'SONG',
        title: 'Jerusalem My Happy Home - Heritage Choral',
        speaker: 'Pwani Adventist Youth Ambassadors',
        description: 'Sacred hymn rendition recorded live at Pwani University Amphitheatre during the inter-chapter fellowship.',
        youtubeUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
        duration: '5:42',
        series: 'CUCASO Sacred Music Collection',
        tags: 'Heritage, Hymns, Choral, Praise',
        status: 'PUBLISHED',
        viewCount: 2240,
      },
      {
        type: 'SERMON',
        title: 'The Remnant and the Three Angels’ Messages',
        speaker: 'Pr. Geoffrey Mbwana',
        description: 'Revelation 14 message on the timeliness of Adventist prophetic identity and preparing souls for the Second Advent.',
        youtubeUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
        duration: '1:02:15',
        series: 'Prophetic Heritage Series',
        tags: 'Prophecy, Revelation, Remnant, Three Angels',
        status: 'PUBLISHED',
        viewCount: 1850,
      },
      {
        type: 'SONG',
        title: 'Soon Coming King - Mass Youth Choir',
        speaker: 'CUCASO Combined University Choir',
        description: 'Over 400 voices from across coastal chapters united in praising Christ our Redeemer and coming King.',
        youtubeUrl: 'https://www.youtube.com/watch?v=e-ORhEE9VVg',
        duration: '7:20',
        series: 'CUCASO Rally Grand Finale',
        tags: 'Combined Choir, Praise, Second Coming',
        status: 'PUBLISHED',
        viewCount: 4500,
      },
    ];

    for (const item of sampleItems) {
      await prisma.sermon.create({ data: item });
    }
    console.log(`Seeded ${sampleItems.length} sermons and songs successfully.`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
