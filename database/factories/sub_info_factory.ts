import factory from '@adonisjs/lucid/factories'
import SubInfo from '#models/sub_info'

export const SubInfoFactory = factory
  .define(SubInfo, ({ faker }) => {
    return {
      profilGithub: `https://github.com/${faker.internet.username()}`,
      profilLinkedin: `https://linkedin.com/in/${faker.internet.username()}`,
      profilTwitter: `https://x.com/${faker.internet.username()}`,
      profilMail: faker.internet.email(),
      photoPath: faker.image.avatar(),
      phone: faker.phone.number(),
      bio: faker.lorem.paragraph(),
    }
  })
  .build()
