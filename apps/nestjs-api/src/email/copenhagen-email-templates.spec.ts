import * as fs from 'fs'
import mjml2html = require('mjml')
import * as path from 'path'

const templateNames = [
  'complete-mentorship-for-mentee',
  'complete-mentorship-for-mentor',
  'expired-notification-application',
  'mentoring-session-logged-email',
  'mentorship-acceptance-email',
  'mentorship-cancelation-email-mentee',
  'mentorship-cancelation-email-mentor',
  'mentorship-decline-email',
  'mentorship-request-email',
  'pending-review-declined-email',
  'signup-complete-mentee',
  'signup-complete-mentor-partnership',
  'signup-complete-mentor',
  'welcome-to-redi-mentee',
  'welcome-to-redi-mentor',
]

describe('Copenhagen email templates', () => {
  const templatesDirectory = path.resolve(
    __dirname,
    '../assets/email/templates'
  )

  it.each(templateNames)('compiles %s without falling back', (templateName) => {
    const templatePath = path.join(
      templatesDirectory,
      `${templateName}.copenhagen.mjml`
    )
    const template = fs.readFileSync(templatePath, 'utf-8')
    const result = mjml2html(template, { filePath: templatesDirectory })

    expect(result.errors).toEqual([])
    expect(result.html).toContain('ReDI Copenhagen Team')
  })

  it('uses verified Copenhagen contact details in the footer', () => {
    const footer = fs.readFileSync(
      path.join(templatesDirectory, 'footer.copenhagen.team.mjml'),
      'utf-8'
    )

    expect(footer).toContain('vibe@redi-school.org')
    expect(footer).toContain('Bådehavnsgade 42P')
    expect(footer).toContain(
      'https://www.redi-school.org/redi-school-copenhagen'
    )
  })
})
